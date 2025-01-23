const BaseService = require('../base/BaseService');
const PurchaseRequest = require('./purchaseRequest.model');
const PurchaseRequestFulfillmentModel = require('../purchaseRequestFulfillment/purchaseRequestFulfillment.model');
const { default: mongoose } = require('mongoose');

class PurchaseRequestService extends BaseService {
    constructor() {
        super(PurchaseRequest); // Pass the Purchase Request model to the BaseService
    }

    // Example custom service method: Get purchase requests by inventory
    async findRequestsByInventory(inventoryId) {
        return await this.model
            .find({ inventory: inventoryId })
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
    
    async getConsolidatedOrderDetails(inventoryId) {
        try {
            const requests = await this.model.aggregate([
                {
                    $match: {
                        inventory: new mongoose.Types.ObjectId(inventoryId),
                    },
                },
                {
                    // Unwind the materialList array to process each material separately
                    $unwind: '$materialList',
                },
                {
                    // Group by purchaseRequestId and accumulate the total quantity of materials
                    $group: {
                        _id: '$_id', // Group by the purchaseRequest ID
                        totalQuantity: { $sum: '$materialList.qty' }, // Sum the quantities of materials
                        status: { $first: '$status' }, // Get the status of the request
                        requestedOn: { $first: '$createdAt' }, // Get the creation date of the request
                    },
                },
                {
                    // Rename fields for clarity in the response
                    $project: {
                        purchaseRequestId: '$_id',
                        items: '$totalQuantity',
                        status: 1,
                        requestedOn: 1,
                        _id: 0, // Exclude the default _id field
                    },
                },
            ]);

            return requests;
        } catch (error) {
            throw new Error(
                'Failed to retrieve purchase request for the inventory',
                error,
            );
        }
    }

    async getDetailedPurchaseRequest(purchaseRequestId) {
        // Fetch the purchase request with all necessary fields populated
        const purchaseRequest = await this.model.findById(purchaseRequestId)
            .populate('raisedBy', 'name email') // Populate raisedBy with name and email
            .populate('inventory', 'name address') // Populate inventory with name and address
            .populate('approvedBy', 'name email') // Populate approvedBy with name and email
            .populate({
                path: 'materialList.material', // Populate materials inside materialList
                select: 'name category units', // Select only name and category
            })
            .lean();

        if (!purchaseRequest) {
            return null; // Return null if no purchase request is found
        }

        // Fetch fulfillments linked to this purchase request
        const fulfillments = await PurchaseRequestFulfillmentModel.find({
            purchaseRequest: purchaseRequestId,
        })
            // .populate('fulfilledBy', 'name email') // Populate fulfilledBy with name and email
            // .populate('receivedBy', 'name email') // Populate receivedBy with name and email
            .populate({
                path: 'materialFulfilled.material', // Populate materials inside materialFulfilled
                select: 'name category units', // Select only name and category
            })
            .lean();

            // Transform the purchase request data
        const transformedData = {
            _id: purchaseRequest._id,
            createdAt: purchaseRequest.createdAt,
            approvedOn: purchaseRequest.approvedOn || null,
            priority: purchaseRequest.priority,
            status: purchaseRequest.status,
            raisedBy: purchaseRequest.raisedBy ? {
                _id: purchaseRequest.raisedBy._id,
                name: purchaseRequest.raisedBy.name,
                email: purchaseRequest.raisedBy.email,
            } : null,
            inventory: purchaseRequest.inventory ? {
                _id: purchaseRequest.inventory._id,
                name: purchaseRequest.inventory.name,
                address: purchaseRequest.inventory.address,
            } : null,
            materials: purchaseRequest.materialList.map((material) => ({
                _id: material.material._id,
                name: material.material.name,
                category: material.material.category,
                units: material.material.units,
                quantity: material.qty,
            })),
            fulfillments: fulfillments.map((fulfillment) => ({
                _id: fulfillment._id,
                status: fulfillment.status,
                fulfilledBy: fulfillment.fulfilledBy ? {
                    _id: fulfillment.fulfilledBy._id,
                    name: fulfillment.fulfilledBy.name,
                    email: fulfillment.fulfilledBy.email,
                } : null,
                fulfilledOn: fulfillment.fulfilledOn,
                receivedBy: fulfillment.receivedBy ? {
                    _id: fulfillment.receivedBy._id,
                    name: fulfillment.receivedBy.name,
                    email: fulfillment.receivedBy.email,
                } : null,
                receivedOn: fulfillment.receivedOn || null,
                materialFulfilled: fulfillment.materialFulfilled.map((item) => ({
                    _id: item.material._id,
                    name: item.material.name,
                    category: item.material.category,
                    units: item.material.units,
                    quantity: item.quantity,
                })),
            })),
        };
        
        return transformedData;
    }
}

module.exports = new PurchaseRequestService();
