const BaseService = require('../base/BaseService');
const PurchaseRequest = require('./purchaseRequest.model');
const PurchaseRequestFulfillmentModel = require('../purchaseRequestFulfillment/purchaseRequestFulfillment.model');

class PurchaseRequestService extends BaseService {
    constructor() {
        super(PurchaseRequest); // Pass the Purchase Request model to the BaseService
    }

    // Example custom service method: Get purchase requests by inventory
    async findRequestsByInventory(inventoryId) {
        return await this.model.model.find({ inventory: inventoryId })
            .populate('raisedBy', 'name email')
            .populate('approvedBy', 'name email')
            .populate('materialList.material', 'name category');
    }

      // --------------------------------------------------------------------------
  // 1. GET CONSOLIDATED MATERIALS
  //    Sums up the needed quantities across multiple PRs, subtracting out fulfilled amounts.
  // --------------------------------------------------------------------------
  async getConsolidatedMaterials(purchaseRequestIds) {
    const purchaseRequests = await this.model.find({
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
      const purchaseRequest = f.purchaseRequest.toString();
      f.materialFulfilled.forEach((mf) => {
        const materialId = mf.material.toString();
        if(!fulfilledQuantities[purchaseRequest]){
          fulfilledQuantities[purchaseRequest] = {};
        }
        if (!fulfilledQuantities[purchaseRequest][materialId]) {
          fulfilledQuantities[purchaseRequest][materialId] = 0;
        }
        fulfilledQuantities[purchaseRequest][materialId] += mf.quantity;
      });
    });

    // Build consolidated requirements
    const consolidated = {};
    purchaseRequests.forEach((pr) => {
      pr.materialList.forEach((item) => {
        const materialId = item.material._id.toString();
        const alreadyFulfilled = fulfilledQuantities[pr._id.toString()]?(fulfilledQuantities[pr._id.toString()][materialId] || 0):0;
        const needed = Math.max(0, item.qty - alreadyFulfilled);

        if (needed > 0) {
          if (!consolidated[materialId]) {
            consolidated[materialId] = {
              material: item.material,
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

  async getMaterialRequest(params){
    return await this.model.find(params).populate('raisedBy', 'name email').populate('approvedBy', 'name email').populate('materialList.material', 'name category').populate('inventory', "name");
  }
}

module.exports = new PurchaseRequestService();
