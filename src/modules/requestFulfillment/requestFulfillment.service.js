const {
    OrderStatuses,
    FulfillmentStatuses,
    TransferFromType,
    TransferToType,
    UsageTypes,
} = require('../../utils/enums');
const BaseService = require('../base/BaseService');
const stockService = require('../stock/stock.service');
const RequestFulfillment = require('./requestFulfillment.model');
const materialListItemService = require('../materialListItem/materialListItem.service');
const usageService = require('../usage/usage.service');
const StockItemModel = require('../stock/stock.model');
const RequestFulfillmentModel = require('./requestFulfillment.model');
const OrderModel = require('../order/order.model');

class RequestFulfillmentService extends BaseService {
    constructor() {
        super(RequestFulfillment); // Pass the Request Fulfillment model to the BaseService
    }

    // Example custom service method: Get fulfillments by order ID
    async findFulfillmentsByOrder(orderId) {

        return await this.model
            .find({ orderId })
            .populate('fulfilledBy', 'name email')
            .populate('receivedBy', 'name email')
            .populate('transferredFrom', 'name location address')
            .populate('transferredTo', 'name location address')
            .populate({
                path: 'materialList', // Populate material inside materials
                populate:{
                    path: 'materialMetadata',
                    select: 'name category',
                },
            })
            .lean();
    }

    async createFulfillment(data) {
        const { orderId, materialList, fulfilledBy } = data;

        // Validate required fields
        if (!orderId || !materialList || materialList.length === 0) {
            throw new Error('Order ID and Material List are required');
        }
    
        // Fetch the order and extract transfer details
        const order = await OrderModel.findById(orderId);
        if (!order) throw new Error('Order not found');
    
        // Determine transferFrom and transferTo dynamically
        let transferredFrom, transferFromType, transferredTo, transferToType;
    
        if (order.fromSite && order.inventory) {
            transferredFrom = order.fromSite;
            transferFromType = TransferFromType.SITE;
            transferredTo = order.inventory;
            transferToType = TransferToType.INVENTORY;
        } else if (order.fromInventory && order.site) {
            transferredFrom = order.fromInventory;
            transferFromType = TransferFromType.INVENTORY;
            transferredTo = order.site;
            transferToType = TransferToType.SITE;
        } else if (order.fromInventory && order.inventory) {
            transferredFrom = order.fromInventory;
            transferFromType = TransferFromType.INVENTORY;
            transferredTo = order.inventory;
            transferToType = TransferToType.INVENTORY;
        } else if (order.fromSite && order.site) {
            transferredFrom = order.fromSite;
            transferFromType = TransferFromType.SITE;
            transferredTo = order.site;
            transferToType = TransferToType.SITE;
        } else {
            throw new Error(
                'Unable to determine transfer type. Please ensure the order has valid source and destination details.',
            );
        }
    
        const fulfilledMaterialListItems = [];
        const usageData = [];
    
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
                options: { sort: { createdAt: -1 } },
            });
    
            if (!stock || stock.material.length === 0) {
                throw new Error(`No stock available for material ${item.materialMetadata}`);
            }
    
            let remainingQty = item.qty;
            const totalAvailableQty = stock.material.reduce((total, listItem) => total + listItem.qty, 0);
    
            if (totalAvailableQty < item.qty) {
                throw new Error(
                    `Insufficient stock for material ${item.materialMetadata}. Available: ${totalAvailableQty}, Requested: ${item.qty}`,
                );
            }
    
            // Fulfill the stock
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
                    usageData.push({
                        quantity: deductQty,
                        task: order.task || null,
                        createdBy: fulfilledBy,
                        site: transferFromType === TransferFromType.SITE ? transferredFrom : null,
                        material: listItem.materialMetadata,
                        type: UsageTypes.TRANSFER,
                        org: order.org,
                        inventory: transferFromType === TransferFromType.INVENTORY ? transferredFrom : null,
                        toSite: transferToType === TransferToType.SITE ? transferredTo : null,
                        toInventory: transferToType === TransferToType.INVENTORY ? transferredTo : null,
                        orderId,
                    });
    
                    if (remainingQty === 0) break;
                }
            }
        }
    
        await usageService.createBulk(usageData);
    
        // Create RequestFulfillment
        const fulfillment = await RequestFulfillmentModel.create({
            orderId,
            materialList: fulfilledMaterialListItems,
            transferredFrom,
            transferFromType,
            transferredTo,
            transferToType,
            transferType: `${transferFromType}-${transferToType}`, // Derive transfer type dynamically
            fulfilledBy,
            fulfilledOn: new Date(),
            status: FulfillmentStatuses.IN_TRANSIT,
        });
    
        order.dispatchedOn = new Date();
        return fulfillment;
    }    

    async acknowledgeReceipt(fulfillmentId, data) {
        const fulfillment =
            await RequestFulfillmentModel.findById(fulfillmentId).populate(
                'materialList',
            );

        if (!fulfillment) throw new Error('Fulfillment not found');

        const order = await OrderModel.findById(fulfillment.orderId);
        if (!order) throw new Error('Order not found');

        // Update Fulfillment Status
        fulfillment.status = FulfillmentStatuses.RECEIVED;
        Object.assign(fulfillment, data);

        // Update destination Stock
        for (const item of fulfillment.materialList) {
            const stockQuery = {
                materialMetaData: item.materialMetadata,
                site:
                    fulfillment.transferToType === TransferToType.SITE
                        ? fulfillment.transferredTo
                        : null,
                inventory:
                    fulfillment.transferToType === TransferToType.INVENTORY
                        ? fulfillment.transferredTo
                        : null,
            };

            let stock = await stockService.findOne(stockQuery);

            if (stock) {
                stock.material.push(item._id);
            } else {
                stock = await stockService.create({
                    materialMetaData: item.materialMetadata,
                    site:
                        fulfillment.transferToType === TransferToType.SITE
                            ? fulfillment.transferredTo
                            : null,
                    inventory:
                        fulfillment.transferToType === TransferToType.INVENTORY
                            ? fulfillment.transferredTo
                            : null,
                    material: [item._id],
                    source: fulfillment.transferToType.toLowerCase(),
                    org: order.org,
                });
            }

            await stock.save();
        }

        fulfillment.receivedBy = data.receivedBy;
        fulfillment.receivedOn = new Date();

        await fulfillment.save();
        order.fulfillment.push(fulfillment._id);
        await order.save();

        // Update Order Status
        // await orderService.updateOrderStatus(order, fulfillment.materialList);
        fulfillment.materialList.forEach((item) => {
            const fulfilledMaterial = order.fulfilledMaterials.find(
                (fm) =>
                    fm.material.toString() === item.materialMetadata.toString(),
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
                (fm) =>
                    fm.material.toString() === reqMaterial.material.toString(),
            );
            return fulfilled && fulfilled.quantity >= reqMaterial.quantity;
        });
        order.status = isFullyFulfilled
            ? OrderStatuses.COMPLETED
            : OrderStatuses.PARTIALLY_FULFILLED;
        await order.save();

        return fulfillment;
    }
}

module.exports = new RequestFulfillmentService();
