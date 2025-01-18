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

    async getUsageForSite(siteId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(siteId)) {
                throw new Error(`Invalid siteId: ${siteId}`);
            }
            const objectIdSite = new mongoose.Types.ObjectId(siteId);

            const usageRecords = await UsageModel.aggregate([
                {
                    $match: {
                        site: objectIdSite,
                        type: { $nin: [UsageTypes.WASTED] },
                    },
                },
                { $sort: { updatedAt: -1 } },
                // 1) Lookup material info
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
                        quantity: '$quantity', // usage quantity
                        taskTitle: '$taskInfo.title', // or null if no task
                        updatedAt: '$updatedAt',
                    },
                },
            ]);
            return usageRecords;
        } catch (error) {
            throw new Error('Error Fetching Usages: ' + error.message);
        }
    }

    async getWastageForSite(siteId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(siteId)) {
                throw new Error(`Invalid siteId: ${siteId}`);
            }
            const objectIdSite = new mongoose.Types.ObjectId(siteId);

            const wastageRecords = await UsageModel.aggregate([
                {
                    $match: {
                        site: objectIdSite,
                        type: UsageTypes.WASTED, // or however you track wasted usage
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
                        quantity: '$quantity', // usage quantity for wasted
                        taskTitle: '$taskInfo.title', // or null if no task
                        updatedAt: '$updatedAt',
                    },
                },
            ]);
            return wastageRecords;
        } catch (error) {
            throw new Error('Error Fetching wasted Records: ' + error.message);
        }
    }
    async createUsage(data) {
        try {
            const {
                materialId, // The MaterialMetadata._id
                siteId, // The Site._id
                taskId, // optional Task
                usedQuantity, // e.g. 10
                wasteQuantity, // e.g. 2
                org,
                createdBy,
            } = data;

            // Basic validations
            if (!materialId) {
                throw new Error('materialId is required');
            }
            if (!siteId) {
                throw new Error('siteId is required');
            }
            // Validate ObjectIds
            if (!mongoose.Types.ObjectId.isValid(siteId)) {
                throw new Error(`Invalid siteId: ${siteId}`);
            }
            if (!mongoose.Types.ObjectId.isValid(materialId)) {
                throw new Error(`Invalid materialId: ${materialId}`);
            }
            // 1) Build usage docs
            const usageDocs = [];
            if (usedQuantity && usedQuantity > 0) {
                usageDocs.push({
                    quantity: usedQuantity,
                    site: siteId,
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
                    site: siteId,
                    material: materialId,
                    task: taskId || null,
                    type: UsageTypes.WASTED,
                    org: org,
                    createdBy: createdBy,
                });
            }

            // 2) Insert them into UsageModel
            if (usageDocs.length) {
                await UsageModel.insertMany(usageDocs);
            }

            // 3) Deduct from stock
            const totalToDeduct = (usedQuantity || 0) + (wasteQuantity || 0);
            if (totalToDeduct > 0) {
                // A) Find the StockItem referencing (siteId, materialMetaData=materialId)
                const stockItem = await StockItemModel.findOne({
                    site: siteId,
                    materialMetaData: materialId,
                }).populate('material');

                if (!stockItem) {
                    throw new Error(
                        'No StockItem found for this site + materialMetaData',
                    );
                }

                // B) Now stockItem.material is an array of MaterialListItem docs.
                // We want the correct MaterialListItem doc that references the same `materialMetadata`.
                let foundListItem;
                for (const itemDoc of stockItem.material) {
                    // if itemDoc.materialMetadata == materialId
                    console.log(itemDoc.materialMetadata.toString());
                    console.log(materialId.toString());
                    if (
                        itemDoc.materialMetadata.toString() ===
                        materialId.toString()
                    ) {
                        foundListItem = itemDoc;
                        break;
                    }
                }

                if (!foundListItem) {
                    throw new Error(
                        'No matching MaterialListItem found in stock',
                    );
                }

                // C) Deduct the quantity
                foundListItem.qty = (foundListItem.qty || 0) - totalToDeduct;

                // D) Since each itemDoc is a real MaterialListItem document (due to populate),
                // we can just save it
                await foundListItem.save();

                // If you have an array of subdocuments (i.e., truly embedded docs),
                // you'd do stockItem.markModified('material');
                // await stockItem.save();
            }

            return { success: true };
        } catch (error) {
            console.error(error);
            throw new Error('Internal Server Error: ' + error.message);
        }
    }
}

module.exports = new UsageService();
