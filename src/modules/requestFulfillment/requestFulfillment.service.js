const BaseService = require('../base/BaseService');
const OrderModel = require('../order/order.model');
const StockModel = require('../stock/stock.model');
const RequestFulfillmentModel = require('./requestFulfillment.model');
const RequestFulfillment = require('./requestFulfillment.model');

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
        const { orderId, materialList, transferredFrom, transferFromType, transferredTo, transferToType, transferType, fulfilledBy } = data;
    
        // Update stock at source
        for (const item of materialList) {
            if (!item.materialMetadata || !item.qty) {
                throw new Error(`Invalid material data: ${JSON.stringify(item)}`);
            }
    
            const query = {
                material: item.materialMetadata,
                site: transferFromType === 'Site' ? transferredFrom : null,
                inventory: transferFromType === 'Inventory' ? transferredFrom : null,
            };
            console.log('Query for stock:', query);
    
            const stock = await StockModel.findOne(query);
            if (!stock) {
                throw new Error(
                    `Stock not found for material ${item.materialMetadata} at ${transferFromType} ${transferredFrom}`
                );
            }
            console.log(`Stock found for material ${item.materialMetadata}: ${stock.quantity}`);
    
            if (stock.quantity < item.qty) {
                throw new Error(
                    `Insufficient stock for material ${item.materialMetadata}. Available: ${stock.quantity}, Required: ${item.qty}`
                );
            }
    
            stock.quantity -= item.qty;
            await stock.save();
        }
    
        // Create fulfillment record
        const fulfillmentData = {
            orderId,
            materialList,
            transferredFrom,
            transferFromType,
            transferredTo,
            transferToType,
            transferType,
            fulfilledBy,
            status: "in progress",
            materialList:[]
        };
    
        const fulfillment = await RequestFulfillmentModel.create(fulfillmentData);
        console.log('Fulfillment created:', fulfillment);
    
        // Update Order fulfillment
        const order = await OrderModel.findById(orderId);
        if (!order) throw new Error('Order not found');
    
        materialList.forEach((item) => {
            const fulfilledMaterial = order.fulfilledMaterials.find(
                (fm) => fm.material.toString() === item.materialMetadata.toString()
            );
            if (fulfilledMaterial) {
                fulfilledMaterial.quantity += item.qty;
            } else {
                order.fulfilledMaterials.push({ material: item.materialMetadata, quantity: item.qty });
            }
        });
    
        // Check if fully fulfilled
        const isFullyFulfilled = order.materials.every((reqMaterial) => {
            const fulfilled = order.fulfilledMaterials.find(
                (fm) => fm.material.toString() === reqMaterial.material.toString()
            );
            return fulfilled && fulfilled.quantity >= reqMaterial.quantity;
        });
    
        order.status = isFullyFulfilled ? 'completed' : 'partially fulfilled';
        console.log(`Order status updated to: ${order.status}`);
        await order.save();
    
        return fulfillment;
    }
    
    
        async acknowledgeReceipt (fulfillmentId, data) {
            const fulfillment = await RequestFulfillmentModel.findById(fulfillmentId);
            if (!fulfillment) throw new Error('Fulfillment not found');
        
            fulfillment.status = 'RECEIVED';
            Object.assign(fulfillment, data);
        
                // Update destination stock
            for (const item of fulfillment.materialList) {
                const stock = await StockModel.findOneAndUpdate(
                    {
                        material: item.materialMetadata,
                        site: fulfillment.transferToType === 'Site' ? fulfillment.transferredTo : null,
                        inventory: fulfillment.transferToType === 'Inventory' ? fulfillment.transferredTo : null
                    },
                    { $inc: { quantity: item.qty } },
                    { new: true, upsert: true }
                );
            }
        
            await fulfillment.save();
            return fulfillment;
        }
        
}

module.exports = new RequestFulfillmentService();
