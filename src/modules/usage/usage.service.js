const { default: mongoose } = require('mongoose');
const { UsageTypes } = require('../../utils/enums');
const BaseService = require('../base/BaseService');
const MaterialMetadataModel = require('../materialMetadata/materialMetadata.model');
const StockModel = require('../stock/stock.model');
const stockService = require('../stock/stock.service');
const UsageModel = require('./usage.model');
const Usage = require('./usage.model');
const StockItemModel = require('../stock/stock.model');

class UsageService extends BaseService {
    constructor() {
        super(Usage);
    }

    async findUsageByOrg(orgId) {
        return await this.model.model
            .find({ org: orgId })
            .populate('task', 'title status')
            .populate('createdBy', 'name email')
            .populate('site', 'name location')
            .populate('material', 'name category')
            .populate('inventory', 'name address')
            .populate('toSite', 'name location')
            .populate('toInventory', 'name address')
            .populate('orderId', 'status priority');
    }

    async getUsage(type, id) {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error(`Invalid ${type === 'site' ? 'siteId' : 'inventoryId'}: ${id}`);
            }
            const objectId = new mongoose.Types.ObjectId(id);
    
            const usageRecords = await UsageModel.aggregate([
                {
                    $match: {
                        [type]: objectId,
                        type: UsageTypes.USED,
                    },
                },
                { $sort: { updatedAt: -1 } },
                {
                    $lookup: {
                        from: 'materialmetadatas',
                        localField: 'material',
                        foreignField: '_id',
                        as: 'materialInfo',
                    },
                },
                { $unwind: '$materialInfo' },
                {
                    $lookup: {
                        from: 'tasks',
                        localField: 'task',
                        foreignField: '_id',
                        as: 'taskInfo',
                    },
                },
                {
                    $unwind: {
                        path: '$taskInfo',
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $project: {
                        _id: 0,
                        name: '$materialInfo.name',
                        units: '$materialInfo.units',
                        quantity: '$quantity',
                        taskTitle: '$taskInfo.title',
                        updatedAt: '$updatedAt',
                    },
                },
            ]);
            return usageRecords;
        } catch (error) {
            throw new Error('Error Fetching Usages: ' + error.message);
        }
    }
    
    async getWastage(type, id) {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error(`Invalid ${type === 'site' ? 'siteId' : 'inventoryId'}: ${id}`);
            }
            const objectId = new mongoose.Types.ObjectId(id);
    
            const wastageRecords = await UsageModel.aggregate([
                {
                    $match: {
                        [type]: objectId,
                        type: UsageTypes.WASTED,
                    },
                },
                { $sort: { updatedAt: -1 } },
                {
                    $lookup: {
                        from: 'materialmetadatas',
                        localField: 'material',
                        foreignField: '_id',
                        as: 'materialInfo',
                    },
                },
                { $unwind: '$materialInfo' },
                {
                    $lookup: {
                        from: 'tasks',
                        localField: 'task',
                        foreignField: '_id',
                        as: 'taskInfo',
                    },
                },
                {
                    $unwind: {
                        path: '$taskInfo',
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $project: {
                        _id: 0,
                        name: '$materialInfo.name',
                        units: '$materialInfo.units',
                        quantity: '$quantity',
                        taskTitle: '$taskInfo.title',
                        updatedAt: '$updatedAt',
                    },
                },
            ]);
            return wastageRecords;
        } catch (error) {
            throw new Error('Error Fetching Wastage Records: ' + error.message);
        }
    }
    
    async createUsage(data) {
        try {
            const {
                materialId,
                id,
                type, // 'site' or 'inventory'
                taskId,
                usedQuantity,
                wasteQuantity,
                stolenQuantity,
                org,
                createdBy,
            } = data;
    
            if (!materialId) {
                throw new Error('materialId is required');
            }
            if (!id) {
                throw new Error(`${type === 'site' ? 'siteId' : 'inventoryId'} is required`);
            }
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error(`Invalid ${type === 'site' ? 'siteId' : 'inventoryId'}: ${id}`);
            }
            if (!mongoose.Types.ObjectId.isValid(materialId)) {
                throw new Error(`Invalid materialId: ${materialId}`);
            }
            if (
                (usedQuantity !== undefined && usedQuantity < 0) ||
                (wasteQuantity !== undefined && wasteQuantity < 0)
            ) {
                throw new Error('Quantities cannot be negative');
            }
    
            const usageDocs = [];
            if (usedQuantity && usedQuantity > 0) {
                usageDocs.push({
                    quantity: usedQuantity,
                    [type]: id,
                    material: materialId,
                    task: taskId || null,
                    type: UsageTypes.USED,
                    org: org,
                    createdBy: createdBy,
                });
            }
            if (wasteQuantity && wasteQuantity > 0) {
                usageDocs.push({
                    quantity: wasteQuantity,
                    [type]: id,
                    material: materialId,
                    task: taskId || null,
                    type: UsageTypes.WASTED,
                    org: org,
                    createdBy: createdBy,
                });
            }
            if (stolenQuantity && stolenQuantity > 0) {
                usageDocs.push({
                    quantity: stolenQuantity,
                    [type]: id,
                    material: materialId,
                    task: taskId || null,
                    type: UsageTypes.THEFT,
                    org: org,
                    createdBy: createdBy,
                });
            }
            if (usageDocs.length === 0) {
                throw new Error('At least one of usedQuantity, wasteQuantity, or stolenQuantity must be greater than zero');
            }
    
            await UsageModel.insertMany(usageDocs);
    
            const totalToDeduct = (usedQuantity || 0) + (wasteQuantity || 0) + (stolenQuantity || 0);
            if (totalToDeduct > 0) {
                const stockItem = await StockItemModel.findOne({
                    [type]: id,
                    materialMetadata: materialId,
                }).populate('material');
    
                if (!stockItem) {
                    throw new Error(`No StockItem found for this ${type} + materialMetadata`);
                }
    
                const foundListItem = stockItem.material.find(
                    (item) =>
                        item.materialMetadata.toString() === materialId.toString()
                );
    
                if (!foundListItem) {
                    throw new Error('No matching MaterialListItem found in stock');
                }
    
                if ((foundListItem.qty || 0) < totalToDeduct) {
                    throw new Error(
                        `Insufficient stock. Available: ${foundListItem.qty}, Required: ${totalToDeduct}`
                    );
                }
    
                foundListItem.qty -= totalToDeduct;
                stockItem.updatedAt = new Date();
                await stockItem.save();
                await foundListItem.save();
            }
    
            return { success: true };
        } catch (error) {
            console.error(error);
            throw new Error('Internal Server Error: ' + error.message);
        }
    }
    
    async getTheft(type, id) {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error(`Invalid ${type === 'site' ? 'siteId' : 'inventoryId'}: ${id}`);
            }
            const objectId = new mongoose.Types.ObjectId(id);
    
            const theftRecords = await UsageModel.aggregate([
                {
                    $match: {
                        [type]: objectId,
                        type: UsageTypes.THEFT,
                    },
                },
                { $sort: { updatedAt: -1 } },
                {
                    $lookup: {
                        from: 'materialmetadatas',
                        localField: 'material',
                        foreignField: '_id',
                        as: 'materialInfo',
                    },
                },
                { $unwind: '$materialInfo' },
                {
                    $lookup: {
                        from: 'tasks',
                        localField: 'task',
                        foreignField: '_id',
                        as: 'taskInfo',
                    },
                },
                {
                    $unwind: {
                        path: '$taskInfo',
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $project: {
                        _id: 0,
                        name: '$materialInfo.name',
                        units: '$materialInfo.units',
                        quantity: '$quantity',
                        taskTitle: '$taskInfo.title',
                        updatedAt: '$updatedAt',
                    },
                },
            ]);
            return theftRecords;
        } catch (error) {
            throw new Error('Error Fetching Theft Records: ' + error.message);
        }
    }
    
}

module.exports = new UsageService();
