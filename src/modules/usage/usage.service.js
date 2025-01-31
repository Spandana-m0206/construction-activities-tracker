const { default: mongoose } = require('mongoose');
const { UsageTypes } = require('../../utils/enums');
const BaseService = require('../base/BaseService');
const MaterialMetadataModel = require('../materialMetadata/materialMetadata.model');
const StockModel = require('../stock/stock.model');
const stockService = require('../stock/stock.service');
const UsageModel = require('./usage.model');
const Usage = require('./usage.model');
const StockItemModel = require('../stock/stock.model');
const MaterialListItemModel = require('../materialListItem/materialListItem.model');
const materialMetadataService = require('../materialMetadata/materialMetadata.service');

class UsageService extends BaseService {
    constructor() {
        super(Usage);
    }

    async getMaterialUsage(materialId,  orgId, query) {
        try {
            const { page = 1, limit = 10, type,identifier } = query;
            const material = await materialMetadataService.findOne({ _id: materialId });
            if(!material) {
                throw new Error('Material not found');
            }
            if (!mongoose.Types.ObjectId.isValid(identifier)) {
                throw new Error(`Invalid ${type === 'site' ? 'siteId' : 'inventoryId'}: ${identifier}`);
            }
            // Match condition based on type
            const objectId = new mongoose.Types.ObjectId(identifier);
            const matchCondition = type === 'site' ? { site: objectId } : { inventory: objectId };
            // Calculate the number of documents to skip
            const skip = (page - 1) * limit;
    
            // Fetch paginated data with populates
            const data = await this.model
                .find({ material: materialId, org: orgId, ...matchCondition })
                .populate('task', 'title status')
                .populate('createdBy', '_name email')
                .populate('site', 'name location')
                .populate('material', 'name category')
                .populate('inventory', 'name address')
                .populate('toSite', 'name location')
                .populate('toInventory', 'name address')
                .populate('orderId', 'status priority')
                .skip(skip) // Skip the first (page - 1) * limit documents
                .limit(limit) // Limit the number of documents returned
                .exec();
    
            // Total count of matching documents (useful for calculating total pages)
            const totalCount = await this.model
                .countDocuments({ material: materialId, org: orgId, ...matchCondition });
    
            // Return paginated data
            return {
                data,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page,
            };
        } catch (error) {
            throw new Error('Error Fetching Material Usage: ' + error.message);
        }
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
                        _id: '$_id',
                        materialId: '$materialInfo._id',
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
                        _id: '$_id',
                        materialId: '$materialInfo._id',
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
                (wasteQuantity !== undefined && wasteQuantity < 0) ||
                (stolenQuantity !== undefined && stolenQuantity < 0)
            ) {
                throw new Error('Quantities cannot be negative');
            }
    
            const totalToDeduct = (usedQuantity || 0) + (wasteQuantity || 0) + (stolenQuantity || 0);
            if (totalToDeduct <= 0) {
                throw new Error('At least one of usedQuantity, wasteQuantity, or stolenQuantity must be greater than zero');
            }
    
            const stockItem = await StockItemModel.findOne({
                [type]: id,
                materialMetadata: materialId,
            }).populate('material');
    
            if (!stockItem) {
                throw new Error(`No StockItem found for this ${type} + materialMetadata`);
            }
    
            let remainingUsed = usedQuantity || 0;
            let remainingWasted = wasteQuantity || 0;
            let remainingStolen = stolenQuantity || 0;
            let totalStockAvailable = stockItem.material.reduce((acc, item) => acc + item.qty, 0);
            let totalUsed = remainingStolen + remainingUsed + remainingWasted;
            if (totalUsed > 0 && totalStockAvailable < totalUsed) {
                throw new Error('Insufficient stock to fulfill the updated quantity.');
            }
    
            const usedRecordArray = [];
            const wastedRecordArray = [];
            const stolenRecordArray = [];
    
            for (const materialListItem of stockItem.material) {
                if (remainingUsed <= 0 && remainingWasted <= 0 && remainingStolen <= 0) break;
                
                if ((materialListItem.qty || 0) > 0) {
                    if (remainingUsed > 0) {
                        const deduction = Math.min(materialListItem.qty, remainingUsed);
                        materialListItem.qty -= deduction;
                        remainingUsed -= deduction;
                        usedRecordArray.push({ material: materialListItem._id, quantityInUse: deduction });
                    }
                    if (remainingWasted > 0) {
                        const deduction = Math.min(materialListItem.qty, remainingWasted);
                        materialListItem.qty -= deduction;
                        remainingWasted -= deduction;
                        wastedRecordArray.push({ material: materialListItem._id, quantityInUse: deduction });
                    }
                    if (remainingStolen > 0) {
                        const deduction = Math.min(materialListItem.qty, remainingStolen);
                        materialListItem.qty -= deduction;
                        remainingStolen -= deduction;
                        stolenRecordArray.push({ material: materialListItem._id, quantityInUse: deduction });
                    }
                }
            }
    
            if (remainingUsed > 0 || remainingWasted > 0 || remainingStolen > 0) {
                throw new Error(
                    `Insufficient stock. Available: ${totalToDeduct - (remainingUsed + remainingWasted + remainingStolen)}, Required: ${totalToDeduct}`
                );
            }
    
            stockItem.updatedAt = new Date();
            await stockItem.save();
    
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
                    recordArray: usedRecordArray,
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
                    recordArray: wastedRecordArray,
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
                    recordArray: stolenRecordArray,
                });
            }
    
            await UsageModel.insertMany(usageDocs);
    
            return usageDocs;
        } catch (error) {
            console.error(error);
            throw new Error('Internal Server Error: ' + error.message);
        }
    }  
    async update(id, data) {
        try {
            const { quantity: newQuantity } = data;
            const usage = await UsageModel.findById(id);
            if (!usage) {
                throw new Error('Usage record not found');
            }
            const { material: materialId, quantity, site, inventory, recordArray } = usage;
            let stockItem = await StockItemModel.findOne({
                materialMetadata: materialId,
                ...(site ? { site } : { inventory }),
            }).populate('material');
    
            if (!stockItem) {
                throw new Error('No stock item found for the specified material.');
            }
    
            let stockDifference = newQuantity - quantity;
            let totalStockAvailable = stockItem.material.reduce((acc, item) => acc + item.qty, 0);
            
            if (stockDifference > 0 && totalStockAvailable < stockDifference) {
                throw new Error('Insufficient stock to fulfill the updated quantity.');
            }
    
            if (stockDifference > 0) {
                let remainingToDeduct = stockDifference;
                for (const materialListItem of stockItem.material) {
                    if (remainingToDeduct <= 0) break;
                    let existingRecord = recordArray.find(record => record.material.toString() === materialListItem._id.toString());
                    let deduction = Math.min(materialListItem.qty, remainingToDeduct);
                    materialListItem.qty -= deduction;
                    remainingToDeduct -= deduction;
                    if (existingRecord) {
                        existingRecord.quantityInUse += deduction;
                    } else {
                        recordArray.push({ material: materialListItem._id, quantityInUse: deduction });
                    }
                    await materialListItem.save();
                }
            } else if (stockDifference < 0) {
                let remainingToReturn = Math.abs(stockDifference);
                for (let i = recordArray.length - 1; i >= 0; i--) {
                    let record = recordArray[i];
                    let materialListItem = await MaterialListItemModel.findById(record.material);
                    if (!materialListItem) continue;
                    let returnAmount = Math.min(record.quantityInUse, remainingToReturn);
                    materialListItem.qty += returnAmount;
                    record.quantityInUse -= returnAmount;
                    remainingToReturn -= returnAmount;
                    await materialListItem.save();
                    if (record.quantityInUse === 0) {
                        recordArray.splice(i, 1);
                    }
                    if (remainingToReturn === 0) break;
                }
            }
    
            usage.quantity = newQuantity;
            usage.recordArray = recordArray;
            await usage.save();
            await stockItem.save();
    
            return usage;
        } catch (error) {
            console.error('Error Updating Usage:', error);
            throw new Error('Error Updating Usage: ' + error.message);
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
                        _id: '$_id',
                        materialId: '$materialInfo._id',
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
