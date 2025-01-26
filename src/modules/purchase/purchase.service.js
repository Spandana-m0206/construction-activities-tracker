const BaseService = require('../base/BaseService');
const PurchaseRequestModel = require('../purchaseRequest/purchaseRequest.model');
const MaterialListItemModel = require('../materialListItem/materialListItem.model');
const PurchaseRequestFulfillmentModel = require('../purchaseRequestFulfillment/purchaseRequestFulfillment.model');
const StockModel = require('../stock/stock.model');
const PurchaseModel = require('./purchase.model');
const { FulfillmentStatuses, StockSources } = require('../../utils/enums');
const stockService = require('../stock/stock.service');
const materialListItemService = require('../materialListItem/materialListItem.service');
const purchaseRequestService = require('../purchaseRequest/purchaseRequest.service');
const { default: mongoose } = require('mongoose');

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
  // 2. CREATE A PURCHASE (and associated MaterialListItems + Fulfillments)
  //    a) Consolidate needed materials
  //    b) Create Purchase + MaterialListItems
  //    c) Allocate items to each request, creating PurchaseRequestFulfillments
  // --------------------------------------------------------------------------
  async createPurchase({
    materialsList,
    purchaseRequestIds,
    vendor,
    purchasedBy,
    amount,
    attachment,
    org,
  }) {
    // --- A) Get the purchase requests (sort by priority -> createdAt in memory)
    let purchaseRequests = await PurchaseRequestModel.find({
      _id: { $in: purchaseRequestIds},
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

    // --- B) Consolidate materials needed // Not needed now
    // const consolidatedMaterials = await purchaseRequestService.getConsolidatedMaterials(
    //   purchaseRequestIds,
    // );
    // if (!consolidatedMaterials.length) {
    //   throw new Error(
    //     'All selected Purchase Requests appear fully fulfilled already.',
    //   );
    // }

    // --- C) Create MaterialListItems for the consolidated materials
    
    const materialListItemsData = materialsList.map((mat) => ({
      ...mat,
      purchaseDetails: null,
      org,
    }));
    const createdItems = await materialListItemService.create(materialListItemsData);

    // --- D) Create the Purchase
    const purchase = await this.model.create({
      purchasedBy,
      amount,
      vendor,
      attachment,
      payments: [],
      materialListItems: createdItems.map((i) => i._id),
      purchaseRequests: purchaseRequestIds, // new field in your schema
      org:org
    });

    // Link back each MaterialListItem to this Purchase
    await Promise.all(
      createdItems.map((item) =>
        materialListItemService.updateOne(
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
            status: FulfillmentStatuses.PENDING,
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
  async findPurchasesByVendor(filter={}) {
    const purchases = await PurchaseModel.find(filter)
    .populate({
        path: 'materialListItems',
        select: 'id price qty',
        populate: {
            path: 'materialMetadata',
            select: 'id name',
            model: 'MaterialMetadata'
        }
    })
    .populate({
        path: 'purchasedBy',
        select: 'id name',
    })
    .populate({
        path: 'attachment',
        select: 'id url',
    });

     return purchases;
  }

  async getRemainingAmount(paymentList,purchaseData){  
    let totalPaidAmount=0
    paymentList.forEach((payment)=>{
      totalPaidAmount+=payment.amount
    })
     const remainingAmount=purchaseData.amount-totalPaidAmount
     return {remainingAmount:remainingAmount}
  }

  async getPurchasesWithBalanceAmount(vendorId) {
    const purchases = await PurchaseModel.find({ vendor: vendorId })  
    .lean()

  if(purchases.length===0){
    return []
  }
    const purchasesWithBalance = purchases.map((purchaseData) => {
      let totalPayments=0
      purchaseData.payments.forEach((payment)=>{
        totalPayments+=payment.amount ||0
      })
       const remainingAmount = purchaseData.amount - totalPayments;
      if (remainingAmount > 0) {
        return {
          purchase: purchaseData,
          remainingAmount: remainingAmount
        };
      }
    }).filter(Boolean); 

    return purchasesWithBalance;
  }
}

module.exports = new PurchaseService();
