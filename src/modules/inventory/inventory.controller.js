const { StatusCodes } = require('http-status-codes');
const { Roles } = require('../../utils/enums');
const BaseController = require('../base/BaseController');
const InventoryService = require('./inventory.service');
const { default: ApiError } = require('../../utils/apiError');
const { default: ApiResponse } = require('../../utils/apiResponse');
const userService = require('../user/user.service');
class InventoryController extends BaseController {
    constructor() {
        super(InventoryService); // Pass the InventoryService to the BaseController
    }

    async create (req, res, next) {
        try {
            const inventoryData = req.body;
            const user = req.user;
            if (!inventoryData.name || !inventoryData.address) {
                return res.status(StatusCodes.BAD_REQUEST).json(new ApiError(StatusCodes.BAD_REQUEST, 'Please fill all required fields'));
            }
            if(user.role !== Roles.ADMIN) { 
                return res.status(StatusCodes.BAD_REQUEST).json(new ApiError(StatusCodes.BAD_REQUEST, 'You are not authorized to create inventories'));
            }
            const managerId= inventoryData.manager;
            const managerUser = await userService.findOne({_id:managerId});
            if(!managerUser || managerUser.role !== Roles.INVENTORY_MANAGER) {
                return res.status(StatusCodes.BAD_REQUEST).json(new ApiError(StatusCodes.BAD_REQUEST, 'Invalid inventory manager'));
            }
            inventoryData.org = user.org;
            const data = await this.service.create(inventoryData);
            res.status(StatusCodes.CREATED).json(new ApiResponse(StatusCodes.CREATED, data, 'Inventory created successfully'));
        } catch (error) {
            next(error);
        }
    }
    async find (req, res, next) {
        try {
            const user = req.user;
            const data = await this.service.find({ org: user.org });
            res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, data, 'Inventories retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }
    async findOne (req, res, next) {
        try {
            const user = req.user;
            const filter = { _id: req.params.id, org: user.org };
            const data = await this.service.find(filter);
            res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, data, 'Inventory retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }
    async update (req, res, next) {
        try {
            const inventoryData = req.body;
            const user = req.user;
            if(user.role !== Roles.ADMIN && user.role !== Roles.INVENTORY_MANAGER){ 
                return res.status(StatusCodes.BAD_REQUEST).json(new ApiError(StatusCodes.BAD_REQUEST, 'You are not authorized to update inventories'));
            }
            const filter = { _id: req.params.id, org: user.org };
            const data = await this.service.update(filter, inventoryData);
            res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, data, 'Inventory updated successfully'));
        } catch (error) {
            next(error);
        }
    }
    async delete (req, res, next) {
        try {
            const user = req.user;
            if(user.role !== Roles.ADMIN) { 
                return res.status(StatusCodes.BAD_REQUEST).json(new ApiError(StatusCodes.BAD_REQUEST, 'You are not authorized to delete inventories'));
            }
            const filter = { _id: req.params.id, org: user.org };
            const data = await this.service.deleteOne(filter);
            res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, data, 'Inventory deleted successfully'));
        } catch (error) {
            next(error);
        }
    }

    // Example custom controller method: Get inventories by manager
    async getInventoriesByManager(req, res, next) {
        try {
            const filter = { manager: req.params.managerId, org: req.user.org };
            const inventories = await this.service.findInventoriesByManager(filter);
            res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, inventories, 'Inventories retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new InventoryController();
