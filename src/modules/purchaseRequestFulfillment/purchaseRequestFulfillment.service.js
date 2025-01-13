const { StockSources } = require('../../utils/enums');
const BaseService = require('../base/BaseService');
const PurchaseModel = require('../purchase/purchase.model');
const PurchaseRequestModel = require('../purchaseRequest/purchaseRequest.model');
const stockService = require('../stock/stock.service');
const PurchaseRequestFulfillment = require('./purchaseRequestFulfillment.model');

class PurchaseRequestFulfillmentService extends BaseService {
    constructor() {
        super(PurchaseRequestFulfillment); // Pass the model to the BaseService
    }

    // Example custom service method: Get fulfillments by status
    async findFulfillmentsByStatus(status) {
        return await this.model.model.find({ status })
            .populate('purchaseRequest', 'id')
            .populate('materialFulfilled.material', 'name category')
            .populate('fulfilledBy', 'name email')
            .populate('receivedBy', 'name email');
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
        await stockService.findOneAndUpdate(
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

module.exports = new PurchaseRequestFulfillmentService();
