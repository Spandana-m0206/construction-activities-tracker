const { default: mongoose } = require('mongoose');
const BaseService = require('../base/BaseService');
const UsageModel = require('../usage/usage.model');
const StockItemModel = require('./stock.model');
const Stock = require('./stock.model');

class StockService extends BaseService {
    constructor() {
        super(Stock); // Pass the Stock model to the BaseService
    }

    // Example custom service method: Get stock by material
    async findStockByMaterial(materialId) {
        return await this.model.model
            .find({ material: materialId })
            .populate('material', 'name category')
            .populate('site', 'name location')
            .populate('inventory', 'name address')
            .populate('org', 'name');
    }

    // Example custom service method: Get stock by organization
    async findStockByOrg(orgId) {
        return await this.model.model
            .find({ org: orgId })
            .populate('material', 'name category')
            .populate('site', 'name location')
            .populate('inventory', 'name address');
    }

    async getAvailableMaterials(identifier, type) {
        try {
            // Validate the identifier
            if (!mongoose.Types.ObjectId.isValid(identifier)) {
                throw new Error('Invalid Identifier');
            }
            const objectId = new mongoose.Types.ObjectId(identifier);
    
            // Match condition based on type
            const matchCondition = type === 'site' ? { site: objectId } : { inventory: objectId };
    
            // Aggregation for Recently Used Materials
            const recentlyUsed = await StockItemModel.aggregate([
                { $match: matchCondition },
                {
                    $lookup: {
                        from: 'materialmetadatas',
                        localField: 'materialMetaData',
                        foreignField: '_id',
                        as: 'materialInfo',
                    },
                },
                { $unwind: '$materialInfo' },
                {
                    $lookup: {
                        from: 'materiallistitems',
                        localField: 'material',
                        foreignField: '_id',
                        as: 'materialListItems',
                    },
                },
                { 
                    $unwind: { 
                        path: '$materialListItems', 
                        preserveNullAndEmptyArrays: true,
                    }, 
                },
                {
                    $group: {
                        _id: '$materialInfo._id',
                        name: { $first: '$materialInfo.name' },
                        units: { $first: '$materialInfo.units' },
                        totalQty: {
                            $sum: { $ifNull: ['$materialListItems.qty', 0] },
                        },
                        lastUsed: { $max: '$updatedAt' },
                    },
                },
                { $sort: { lastUsed: -1 } },
                { $limit: 5 },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        units: 1,
                        inStock: '$totalQty',
                        lastUsed: {
                            $dateToString: {
                                format: '%d %b %Y',
                                date: '$lastUsed',
                            },
                        },
                    },
                },
            ]);
    
            // Aggregation for Categories
            const categories = await StockItemModel.aggregate([
                { $match: matchCondition },
                {
                    $lookup: {
                        from: 'materialmetadatas',
                        localField: 'materialMetaData',
                        foreignField: '_id',
                        as: 'materialInfo',
                    },
                },
                { $unwind: '$materialInfo' },
                {
                    $lookup: {
                        from: 'materiallistitems',
                        localField: 'material',
                        foreignField: '_id',
                        as: 'materialListItems',
                    },
                },
                {
                    $unwind: {
                        path: '$materialListItems',
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $group: {
                        _id: {
                            category: '$materialInfo.category',
                            materialId: '$materialInfo._id',
                        },
                        name: { $first: '$materialInfo.name' },
                        units: { $first: '$materialInfo.units' },
                        totalQty: {
                            $sum: { $ifNull: ['$materialListItems.qty', 0] },
                        },
                        lastUsed: { $max: '$updatedAt' },
                    },
                },
                {
                    $group: {
                        _id: '$_id.category',
                        materials: {
                            $push: {
                                materialMetaDataId: '$_id.materialId',
                                name: '$name',
                                units: '$units',
                                inStock: '$totalQty',
                                lastUsed: '$lastUsed',
                            },
                        },
                    },
                },
                {
                    $project: {
                        _id: 1,
                        category: '$_id',
                        materials: {
                            $map: {
                                input: '$materials',
                                as: 'm',
                                in: {
                                    _id: '$$m.materialMetaDataId',
                                    name: '$$m.name',
                                    units: '$$m.units',
                                    inStock: '$$m.inStock',
                                    lastUsed: {
                                        $dateToString: {
                                            format: '%d %b %Y',
                                            date: '$$m.lastUsed',
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            ]);
    
            return {
                recentlyUsed,
                categories,
            };
        } catch (error) {
            console.error('Error in getAvailableMaterials:', error);
            throw new Error('Error Fetching Available Stock items');
        }
    }
    

    async getStockItemsQuantities(id, type) {
        try {
            // Validate the ID
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error(`Invalid ${type === 'site' ? 'Site ID' : 'Inventory ID'}`);
            }
            const objectId = new mongoose.Types.ObjectId(id);
    
            // Match condition based on type
            const matchCondition = type === 'site' ? { site: objectId } : { inventory: objectId };
    
            // Aggregation pipeline to retrieve materialId and total quantity
            const materialQuantities = await StockItemModel.aggregate([
                { $match: matchCondition }, // Match based on site or inventory
    
                { $unwind: '$material' }, // Unwind the material array
    
                {
                    $lookup: {
                        from: 'materiallistitems',
                        localField: 'material',
                        foreignField: '_id',
                        as: 'materialDetails',
                    },
                },
    
                { $unwind: '$materialDetails' },
    
                {
                    $group: {
                        _id: '$materialDetails.materialMetadata',
                        quantity: { $sum: { $ifNull: ['$materialDetails.qty', 0] } },
                    },
                },
    
                {
                    $project: {
                        _id: 0,
                        materialId: '$_id',
                        quantity: 1,
                    },
                },
            ]);
    
            return {
                materials: materialQuantities,
            };
        } catch (error) {
            console.error('Error in getStockItemsQuantities:', error);
            throw new Error('Error Fetching Material Quantities');
        }
    }
    

}


module.exports = new StockService();
