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

    async getAvailableMaterials(siteId) {
        try {
            // Validate the siteId
            if (!mongoose.Types.ObjectId.isValid(siteId)) {
                throw new Error('Invalid Site ID');
            }
            const objectIdSite = new mongoose.Types.ObjectId(siteId);
    
            // Aggregation for Recently Used Materials
            const recentlyUsed = await StockItemModel.aggregate([
                // 1. Match documents based on the specified site
                { 
                    $match: { 
                        site: objectIdSite 
                    } 
                },
                
                // 2. Lookup related MaterialMetadata documents
                { 
                    $lookup: {
                        from: 'materialmetadatas',
                        localField: 'materialMetaData',
                        foreignField: '_id',
                        as: 'materialInfo',
                    },
                },
                
                // 3. Unwind the materialInfo array
                { 
                    $unwind: '$materialInfo' 
                },
                
                // 4. Lookup related MaterialListItem documents
                { 
                    $lookup: {
                        from: 'materiallistitems',
                        localField: 'material',
                        foreignField: '_id',
                        as: 'materialListItems',
                    },
                },
                
                // 5. Unwind the materialListItems array
                { 
                    $unwind: {
                        path: '$materialListItems',
                        preserveNullAndEmptyArrays: true, 
                    },
                },
                
                // 6. Group by MaterialMetadata _id and aggregate data
                { 
                    $group: {
                        _id: '$materialInfo._id', 
                        name: { $first: '$materialInfo.name' },
                        units: { $first: '$materialInfo.units' }, // Include units
                        totalQty: {
                            $sum: { $ifNull: ['$materialListItems.qty', 0] },
                        },
                        lastUsed: { $max: '$updatedAt' }, 
                    },
                },
                
                // 7. Sort the aggregated results by lastUsed in descending order
                { 
                    $sort: { 
                        lastUsed: -1 
                    } 
                },
                
                // 8. Limit the results to the top 5
                { 
                    $limit: 5 
                },
                
                // 9. Project the desired fields and format lastUsed
                { 
                    $project: {
                        _id: 1, 
                        name: 1,
                        units: 1, // Project units
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
                { $match: { site: objectIdSite } },
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
                        units: { $first: '$materialInfo.units' }, // Include units
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
                                units: '$units', // Include units
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
                                    units: '$$m.units', // Project units
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

            console.log(recentlyUsed)
            return {
                recentlyUsed, 
                categories,   
            };
        } catch (error) {
            console.error('Error in getAvailableMaterials:', error);
            throw new Error('Error Fetching Available Stock items');
        }
    }

    async getStockItemsQuantities(siteId) {
            // Validate the siteId
            if (!mongoose.Types.ObjectId.isValid(siteId)) {
                throw new Error('Invalid Site ID');
            }
            const objectIdSite = new mongoose.Types.ObjectId(siteId);

            // Aggregation pipeline to retrieve materialId and total quantity
            const materialQuantities = await StockItemModel.aggregate([
                // Match documents belonging to the specified site
                { $match: { site: objectIdSite } },

                // Unwind the 'material' array to deconstruct each MaterialListItem
                { $unwind: '$material' },

                // Lookup to join with MaterialListItemModel based on 'material' field
                {
                    $lookup: {
                        from: 'materiallistitems', // Collection name for MaterialListItemModel
                        localField: 'material',    // Field in StockItemModel referencing MaterialListItemModel
                        foreignField: '_id',       // Field in MaterialListItemModel to match
                        as: 'materialDetails',
                    },
                },

                // Unwind the 'materialDetails' array
                { $unwind: '$materialDetails' },

                // Group by materialMetadata (materialId) and sum the quantities
                {
                    $group: {
                        _id: '$materialDetails.materialMetadata', // Group by materialId
                        quantity: { $sum: { $ifNull: ['$materialDetails.qty', 0] } }, // Sum qty, default to 0
                    },
                },

                // Project the desired fields
                {
                    $project: {
                        _id: 0,
                        materialId: '$_id',
                        quantity: 1,
                    },
                },
            ]);
            return {
                materials: materialQuantities, // Array of objects with materialId and quantity
            };
        } catch (error) {
            console.error('Error in getMaterialQuantities:', error);
            throw new Error('Error Fetching Material Quantities');
        
    }

}


module.exports = new StockService();
