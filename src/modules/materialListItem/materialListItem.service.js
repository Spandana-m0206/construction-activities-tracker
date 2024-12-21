const BaseService = require('../base/BaseService');
const MaterialListItem = require('./materialListItem.model');

class MaterialListItemService extends BaseService {
    constructor() {
        super(MaterialListItem); // Pass the Material List Item model to the BaseService
    }

    // Example custom service method: Get material list items by purchase details
    async findMaterialListItemsByPurchase(purchaseId) {
        return await this.model.model.find({ purchaseDetails: purchaseId })
            .populate('materialMetadata', 'name category')
            .populate('purchaseDetails', 'id');
    }
}

module.exports = new MaterialListItemService();
