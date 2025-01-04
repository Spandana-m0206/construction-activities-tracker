const BaseController = require('../base/BaseController');
const MaterialListItemService = require('./materialListItem.service');
const { StatusCodes } = require("http-status-codes");
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const { Roles } = require('../../utils/enums');
class MaterialListItemController extends BaseController {
    constructor() {
        super(MaterialListItemService); // Pass the MaterialListItemService to the BaseController
    }

    async create(req, res, next) {
        try {
            const materialListItem = req.body;
            const user = req.user;
            if (!materialListItem.materialMetadata || !materialListItem.qty || !materialListItem.price) {
                return res.status(StatusCodes.BAD_REQUEST).json(new ApiError(StatusCodes.BAD_REQUEST, 'Please fill all required fields'));
            }
            if (user.role !== Roles.ADMIN && user.role !== Roles.FINANCE_EXECUTIVE && user.role !== Roles.INVENTORY_MANAGER) {
                return res.status(StatusCodes.BAD_REQUEST).json(new ApiError(StatusCodes.BAD_REQUEST, 'You are not authorized to create material list items')); 
            }
            materialListItem.org = user.org;
            const data = await this.service.create(materialListItem);
            res.status(StatusCodes.CREATED).json(new ApiResponse(StatusCodes.CREATED, data, 'Material list item created successfully'));
        } catch (error) {
            next(error);
        }
    }
    async find(req, res, next) {
        try {
            const user = req.user;
            const data = await this.service.find({ org: user.org });
            res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, data, 'Material list items retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }
    async findOne(req, res, next) {
        try {
            const user = req.user;
            const filter = { _id: req.params.id, org: user.org };
            const data = await this.service.findOne(filter);
            res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, data, 'Material list item retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const user = req.user;
            const filter = { _id: req.params.id, org: user.org };
            if (user.role !== Roles.ADMIN && user.role !== Roles.FINANCE_EXECUTIVE && user.role !== Roles.INVENTORY_MANAGER) {
                return res.status(StatusCodes.BAD_REQUEST).json(new ApiError(StatusCodes.BAD_REQUEST, 'You are not authorized to delete material list items'));
            }
            const data = await this.service.delete(filter);
            res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, data, 'Material deleted successfully'));
        } catch (error) {
            next(error);
        }
    }

    // Example custom controller method: Get material list items by purchase details
    async getMaterialListItemsByPurchase(req, res, next) {
        try {
            const filter = { purchase: req.params.purchaseId, org: req.user.org };
            const materialListItems = await this.service.findMaterialListItemsByPurchase(filter);
            res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, materialListItems, 'Material list items retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new MaterialListItemController();
