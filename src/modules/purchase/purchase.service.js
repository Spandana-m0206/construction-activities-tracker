const BaseService = require('../base/BaseService');
const PurchaseRequestModel = require('../purchaseRequest/purchaseRequest.model');
const MaterialListItemModel = require('../materialListItem/materialListItem.model');
const PurchaseRequestFulfillmentModel = require('../purchaseRequestFulfillment/purchaseRequestFulfillment.model');
const StockModel = require('../stock/stock.model');
const PurchaseModel = require('./purchase.model');
const { FulfillmentStatuses, StockSources } = require('../../utils/enums');

// Optional priority mapping if you're using textual priorities
const PRIORITY_MAP = {
  high: 1,
  medium: 2,
  low: 3,
};

class PurchaseService extends BaseService {
  constructor() {
    super(PurchaseModel); // Pass the Purchase model to the BaseService
  }

  // --------------------------------------------------------------------------
  // 1. GET CONSOLIDATED MATERIALS
  //    Sums up the needed quantities across multiple PRs, subtracting out fulfilled amounts.
  // --------------------------------------------------------------------------
  async getConsolidatedMaterials(purchaseRequestIds) {
    const purchaseRequests = await PurchaseRequestModel.find({
      _id: { $in: purchaseRequestIds },
    })
      .populate('materialList.material')
      .lean();

    if (!purchaseRequests.length) return [];

    // Find all Fulfillments linked to these requests
    const fulfillments = await PurchaseRequestFulfillmentModel.find({
      purchaseRequest: { $in: purchaseRequestIds },
    }).lean();

    // Sum up already fulfilled quantities by material
    const fulfilledQuantities = {};
    fulfillments.forEach((f) => {
      f.materialFulfilled.forEach((mf) => {
        const materialId = mf.material.toString();
        if (!fulfilledQuantities[materialId]) {
          fulfilledQuantities[materialId] = 0;
        }
        fulfilledQuantities[materialId] += mf.quantity;
      });
    });

    // Build consolidated requirements
    const consolidated = {};
    purchaseRequests.forEach((pr) => {
      pr.materialList.forEach((item) => {
        const materialId = item.material._id.toString();
        const alreadyFulfilled = fulfilledQuantities[materialId] || 0;
        const needed = Math.max(0, item.qty - alreadyFulfilled);

        if (needed > 0) {
          if (!consolidated[materialId]) {
            consolidated[materialId] = {
              material: item.material._id,
              totalQty: 0,
            };
          }
          consolidated[materialId].totalQty += needed;
        }
      });
    });

    return Object.values(consolidated).map((c) => ({
      material: c.material,
      qty: c.totalQty,
    }));
  }

  // --------------------------------------------------------------------------
  // 2. CREATE A PURCHASE (and associated MaterialListItems + Fulfillments)
  //    a) Consolidate needed materials
  //    b) Create Purchase + MaterialListItems
  //    c) Allocate items to each request, creating PurchaseRequestFulfillments
  // --------------------------------------------------------------------------
  async createPurchase({
    purchaseRequestIds,
    vendor,
    purchasedBy,
    amount,
    attachment,
    org,
  }) {
    // --- A) Get the purchase requests (sort by priority -> createdAt in memory)
    let purchaseRequests = await PurchaseRequestModel.find({
      _id: { $in: purchaseRequestIds },
    })
      .populate('materialList.material')
      .sort({ createdAt: 1 }) // partial sort
      .lean();

    // Then refine the sort by priority
    purchaseRequests = purchaseRequests.sort((a, b) => {
      const p1 = PRIORITY_MAP[a.priority] || 99;
      const p2 = PRIORITY_MAP[b.priority] || 99;
      if (p1 !== p2) return p1 - p2;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    if (!purchaseRequests.length) {
      throw new Error('No Purchase Requests found for provided IDs');
    }

    // --- B) Consolidate materials needed
    const consolidatedMaterials = await this.getConsolidatedMaterials(
      purchaseRequestIds,
    );
    if (!consolidatedMaterials.length) {
      throw new Error(
        'All selected Purchase Requests appear fully fulfilled already.',
      );
    }

    // --- C) Create MaterialListItems for the consolidated materials
    const materialListItemsData = consolidatedMaterials.map((mat) => ({
      materialMetadata: mat.material,
      qty: mat.qty,
      price: 0, // placeholder
      purchaseDetails: null,
      org,
    }));
    const createdItems = await MaterialListItemModel.create(materialListItemsData);

    // --- D) Create the Purchase
    const purchase = await PurchaseModel.create({
      purchasedBy,
      amount,
      vendor,
      attachment,
      payments: [],
      materialListItems: createdItems.map((i) => i._id),
      purchaseRequests: purchaseRequestIds, // new field in your schema
    });

    // Link back each MaterialListItem to this Purchase
    await Promise.all(
      createdItems.map((item) =>
        MaterialListItemModel.updateOne(
          { _id: item._id },
          { purchaseDetails: purchase._id },
        ),
      ),
    );

    // --- E) Allocate material items to requests => Create Fulfillments
    const fulfillmentsToInsert = [];
    for (const matItem of createdItems) {
      let qtyLeft = matItem.qty;
      if (qtyLeft <= 0) continue;

      for (const req of purchaseRequests) {
        if (qtyLeft <= 0) break;

        // Check if the request needs this material
        const matInReq = req.materialList.find(
          (m) =>
            m.material &&
            m.material._id.toString() === matItem.materialMetadata.toString(),
        );
        if (!matInReq) continue;

        // total needed by the request
        const totalNeeded = matInReq.qty;

        // how much is already fulfilled?
        const agg = await PurchaseRequestFulfillmentModel.aggregate([
          {
            $match: {
              purchaseRequest: req._id,
            },
          },
          { $unwind: '$materialFulfilled' },
          {
            $match: {
              'materialFulfilled.material': matItem.materialMetadata,
            },
          },
          {
            $group: {
              _id: null,
              sumQty: { $sum: '$materialFulfilled.quantity' },
            },
          },
        ]);
        const alreadyFulfilled = agg[0]?.sumQty || 0;

        // remaining need
        const stillNeeded = Math.max(0, totalNeeded - alreadyFulfilled);
        if (stillNeeded <= 0) continue;

        // allocate
        const allocatedQty = Math.min(stillNeeded, qtyLeft);
        if (allocatedQty > 0) {
          fulfillmentsToInsert.push({
            purchaseRequest: req._id,
            materialFulfilled: [
              {
                material: matItem.materialMetadata,
                quantity: allocatedQty,
              },
            ],
            fulfilledBy: purchasedBy,
            fulfilledOn: new Date(),
            status: FulfillmentStatuses.IN_PROGRESS,
          });
          qtyLeft -= allocatedQty;
        }
      }
    }

    if (fulfillmentsToInsert.length) {
      await PurchaseRequestFulfillmentModel.insertMany(fulfillmentsToInsert);
    }

    return purchase;
  }

  // --------------------------------------------------------------------------
  // 3. MARK PURCHASE AS RECEIVED (Stock Model uses "material" array of MLI refs)
  //    a) Populate purchase’s materialListItems
  //    b) For each item, push the item._id into Stock model's "material" array
  // --------------------------------------------------------------------------
  async markPurchaseAsReceived(purchaseId, receivedBy) {
    // 1) Fetch purchase, populate items
    const purchase = await PurchaseModel.findById(purchaseId).populate(
      'materialListItems',
    );

    if (!purchase) {
      throw new Error('Purchase not found');
    }

    // 2) Fetch the PurchaseRequests to see which inventory (or site) we target
    //    (Assuming all requests are for the same inventory, or your logic may vary)
    const purchaseRequests = await PurchaseRequestModel.find({
      _id: { $in: purchase.purchaseRequests },
    }).lean();

    if (!purchaseRequests.length) {
      throw new Error('No PurchaseRequests found on this Purchase');
    }

    // Let's assume they all share the same inventory:
    const targetInventory = purchaseRequests[0].inventory; // or `null` if it's site-based
    // If you need a "site" instead, you can adapt the logic similarly.

    // 3) For each MaterialListItem, push it into the Stock model
    //    (which references an array of MaterialListItems instead of a numeric quantity)
    await Promise.all(
      purchase.materialListItems.map(async (item) => {
        // Upsert the Stock doc for (org, materialMetaData, inventory, source)
        // If you're sure this is always from an Inventory, source='inventory'.
        // Or if you store that in the purchaseRequest, you can read it.
        await StockModel.findOneAndUpdate(
          {
            org: item.org, // or purchase.org if that's how you store it
            materialMetaData: item.materialMetadata,
            inventory: targetInventory,
            // If you have a site-based scenario, set `site: xyz` instead
            // if targetInventory === null, possibly site is not null.
            // You may also handle `source` logic here.
            source: StockSources.INVENTORY, // or 'site' if needed
          },
          {
            // Push this new MaterialListItem ID into the array
            $push: { material: item._id },
          },
          { upsert: true, new: true },
        );
      }),
    );

    // 4) Mark purchase as received
    purchase.receivedBy = receivedBy;
    purchase.receivedOn = new Date();
    await purchase.save();

    return purchase;
  }
}

module.exports = new PurchaseService();
