const BaseController = require('../base/BaseController');
const MaterialListItemService = require('./materialListItem.service');

class MaterialListItemController extends BaseController {
    constructor() {
        super(MaterialListItemService); // Pass the MaterialListItemService to the BaseController
    }

    // Example custom controller method: Get material list items by purchase details
    async getMaterialListItemsByPurchase(req, res, next) {
        try {
            const materialListItems = await this.service.findMaterialListItemsByPurchase(req.params.purchaseId);
            res.status(200).json({ success: true, data: materialListItems });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new MaterialListItemController();
