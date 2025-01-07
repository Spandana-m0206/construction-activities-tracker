const { OrderStatuses, FulfillmentStatuses, TransferFromType, TransferToType, UsageTypes } = require('../../utils/enums');
const BaseService = require('../base/BaseService');
const OrderModel = require('../order/order.model');
const StockModel = require('../stock/stock.model');
const stockService = require('../stock/stock.service');
const orderService = require('../order/order.service');
const requestFulfillmentService = require('./requestFulfillment.service');
const RequestFulfillment = require('./requestFulfillment.model');
const materialListItemService = require('../materialListItem/materialListItem.service');
const usageService = require('../usage/usage.service');
const StockItemModel = require('../stock/stock.model');
const RequestFulfillmentModel = require('./requestFulfillment.model');

class RequestFulfillmentService extends BaseService {
    constructor() {
        super(RequestFulfillment); // Pass the Request Fulfillment model to the BaseService
    }

    // Example custom service method: Get fulfillments by order ID
    async findFulfillmentsByOrder(orderId) {
        return await this.model.model.find({ orderId })
            .populate('materialList', 'name category')
            .populate('fulfilledBy', 'name email')
            .populate('receivedBy', 'name email')
            .populate('transferredFrom', 'name location')
            .populate('transferredTo', 'name location');
    }

    async createFulfillment(data) {
        const { orderId, materialList, transferredFrom, transferFromType, transferredTo, transferToType, transferType, fulfilledBy, receivedBy } = data;
    
        // Validate required fields
        if (!orderId || !materialList || materialList.length === 0) {
            throw new Error('Order ID and Material List are required');
        }
        if (!transferredFrom || !transferredTo || !transferFromType || !transferToType || !transferType) {
            throw new Error('Transfer details are incomplete. Please provide source, destination, and transfer types.');
        }
    
        const order = await orderService.findById(orderId);
        if (!order) throw new Error('Order not found');
    
        const validationErrors = [];
    
        // Step 1: Validation Phase
        for (const item of materialList) {
            if (!item.materialMetadata || !item.qty || item.qty <= 0) {
                throw new Error(`Invalid material data: ${JSON.stringify(item)}`);
            }
    
            const stockQuery = {
                materialMetaData: item.materialMetadata,
                site: transferFromType === TransferFromType.SITE ? transferredFrom : null,
                inventory: transferFromType === TransferFromType.INVENTORY ? transferredFrom : null,
            };
    
            const stock = await StockItemModel.findOne(stockQuery).populate({
                path: 'material',
                options: { sort: { createdAt: -1 } } // Sort MaterialListItems by most recent
            }); // stockService was giving error, so used StockItemModel
    
            if (!stock || stock.material.length === 0) {
                validationErrors.push(`No stock available for material ${item.materialMetadata}`);
                continue;
            }
    
            // Calculate total available quantity
            const totalAvailableQty = stock.material.reduce((total, listItem) => total + listItem.qty, 0);
    
            if (totalAvailableQty < item.qty) {
                validationErrors.push(
                    `Insufficient stock for material ${item.materialMetadata}. Available: ${totalAvailableQty}, Requested: ${item.qty}`
                );
            }
        }
    
        if (validationErrors.length > 0) {
            throw new Error(`Stock validation failed: ${validationErrors.join('; ')}`);
        }
    
        // Step 2: Fulfillment Phase
        const fulfilledMaterialListItems = [];
    
        for (const item of materialList) {
            const stockQuery = {
                materialMetaData: item.materialMetadata,
                site: transferFromType === TransferFromType.SITE ? transferredFrom : null,
                inventory: transferFromType === TransferFromType.INVENTORY ? transferredFrom : null,
            };
    
            const stock = await StockItemModel.findOne(stockQuery).populate({
                path: 'material',
                options: { sort: { createdAt: -1 } } // Sort MaterialListItems by most recent
            });
    
            let remainingQty = item.qty;
    
            for (const listItem of stock.material) {
                if (listItem.qty > 0) {
                    const deductQty = Math.min(listItem.qty, remainingQty);
                    listItem.qty -= deductQty;
                    remainingQty -= deductQty;
                    await listItem.save();
    
                    const newMaterialListItem = await materialListItemService.create({
                        materialMetadata: listItem.materialMetadata,
                        qty: deductQty,
                        price: listItem.price,
                        purchaseDetails: listItem.purchaseDetails,
                        org: data.org,
                    });
    
                    fulfilledMaterialListItems.push(newMaterialListItem._id);
    
                    if (remainingQty === 0) break;
                }
            }
        }
    
        // Create RequestFulfillment
        const fulfillment = await RequestFulfillmentModel.create({
            orderId,
            materialList: fulfilledMaterialListItems,
            transferredFrom,
            transferFromType,
            transferredTo,
            transferToType,
            transferType,
            fulfilledBy,
            receivedBy:receivedBy,
            receivedOn: new Date(),
            status: FulfillmentStatuses.IN_TRANSIT,
        });
    
        return fulfillment;
    }    

    async acknowledgeReceipt(fulfillmentId, data) {
        const fulfillment = await RequestFulfillmentModel.findById(fulfillmentId).populate('materialList');
        if (!fulfillment) throw new Error('Fulfillment not found');
    
        const order = await orderService.findById(fulfillment.orderId);
        if (!order) throw new Error('Order not found');
    
        // Update Fulfillment Status
        fulfillment.status = FulfillmentStatuses.RECEIVED;
        Object.assign(fulfillment, data);
    
        // Update destination Stock
        for (const item of fulfillment.materialList) {
            const stockQuery = {
                materialMetaData: item.materialMetadata,
                site: fulfillment.transferToType === TransferToType.SITE ? fulfillment.transferredTo : null,
                inventory: fulfillment.transferToType === TransferToType.INVENTORY ? fulfillment.transferredTo : null,
            };
    
            let stock = await stockService.findOne(stockQuery);
    
            if (stock) {
                stock.material.push(item._id);
            } else {
                stock = await StockItemModel.create({
                    materialMetaData: item.materialMetadata,
                    site: fulfillment.transferToType === TransferToType.SITE  ? fulfillment.transferredTo : null,
                    inventory: fulfillment.transferToType ===  TransferToType.INVENTORY  ? fulfillment.transferredTo : null,
                    material: [item._id],
                    source: fulfillment.transferToType.toLowerCase(),
                    org: order.org,
                });
            }
    
            await stock.save();
        }

        await fulfillment.save();
        order.fulfillment.push(fulfillment._id);
        await order.save();
        // Update Order Status
        await this.updateOrderStatus(order, fulfillment.materialList);
    
            // Add Usage Flow (Example Integration)
    const usageData = fulfillment.materialList.map((item) => ({
        material: item.materialMetadata,
        quantity: item.qty,
        type: UsageTypes.TRANSFER, // Can be 'used', 'wasted', or 'transferred'
        site: fulfillment.transferToType === TransferToType.SITE ? fulfillment.transferredTo : null,
        inventory: fulfillment.transferToType === TransferToType.INVENTORY ? fulfillment.transferredTo : null,
        createdBy: fulfillment.fulfilledBy,
        org: order.org,
        task: order.task || null, // Associate with task if applicable
    }));

    await usageService.createBulk(usageData); // Add a bulk create method for usage

    // Update Order Status
    await this.updateOrderStatus(order, fulfillment.materialList);
        return fulfillment;
    }
    
    async updateOrderStatus(order, materialList) {
        materialList.forEach((item) => {
            const fulfilledMaterial = order.fulfilledMaterials.find(
                (fm) => fm.material.toString() === item.materialMetadata.toString()
            );
            if (fulfilledMaterial) {
                fulfilledMaterial.quantity += item.qty;
            } else {
                order.fulfilledMaterials.push({
                    material: item.materialMetadata,
                    quantity: item.qty,
                });
            }
        });

        const isFullyFulfilled = order.materials.every((reqMaterial) => {
            const fulfilled = order.fulfilledMaterials.find(
                (fm) => fm.material.toString() === reqMaterial.material.toString()
            );
            return fulfilled && fulfilled.quantity >= reqMaterial.quantity;
        });

        order.status = isFullyFulfilled ? OrderStatuses.COMPLETED : OrderStatuses.PARTIALLY_FULFILLED;
        await order.save();
    }
        
}

module.exports = new RequestFulfillmentService();
