const BaseController = require('../base/BaseController');
const MaterialMetadataService = require('./materialMetadata.service');
const { StatusCodes } = require('http-status-codes');
const { Roles, MaterialCategories, Units } = require('../../utils/enums');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');
const  enumToArray  = require('../../utils/EnumToArray');

class MaterialMetadataController extends BaseController {
    constructor() {
        super(MaterialMetadataService); // Pass the MaterialMetadataService to the BaseController
    }

    async create(req, res, next) {
        try {
            const materialMetadata = req.body;
            const user = req.user;
            if (!materialMetadata.name || !materialMetadata.category || !materialMetadata.units) {
                return res.status(StatusCodes.BAD_REQUEST).json(new ApiError(StatusCodes.BAD_REQUEST, 'Please fill all required fields'));
            }
            if (user.role !== Roles.ADMIN && user.role !== Roles.FINANCE_EXECUTIVE && user.role !== Roles.INVENTORY_MANAGER) {
                return res.status(StatusCodes.BAD_REQUEST).json(new ApiError(StatusCodes.BAD_REQUEST, 'You are not authorized to create materials'));
            }
            if(!enumToArray(MaterialCategories).includes(materialMetadata.category)) {
                return res.status(StatusCodes.BAD_REQUEST).json(new ApiError(StatusCodes.BAD_REQUEST, 'Invalid material category'));
            }
            if(!enumToArray(Units).includes(materialMetadata.units)) {
                return res.status(StatusCodes.BAD_REQUEST).json(new ApiError(StatusCodes.BAD_REQUEST, 'Invalid material units'));
            }
            materialMetadata.org = user.org;
            materialMetadata.createdBy = user._id;
            const data = await this.service.create(materialMetadata);
            res.status(StatusCodes.CREATED).json(new ApiResponse(StatusCodes.CREATED, data, 'Material metadata created successfully'));
        } catch (error) {
            next(error);
        }
    }
    async find(req, res, next) {
        try {
            const user = req.user;
            const data = await this.service.find({ org: user.org });
            res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, data, 'Materials retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }
    async findOne(req, res, next) {
        try {
            const user = req.user;
            const filter = { _id: req.params.id, org: user.org };
            const data = await this.service.findOne(filter);
            res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, data, 'Material retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const materialMetadata = req.body;
            const user = req.user;
            if (user.role !== Roles.ADMIN && user.role !== Roles.FINANCE_EXECUTIVE && user.role !== Roles.INVENTORY_MANAGER) {
                return res.status(StatusCodes.BAD_REQUEST).json(new ApiError(StatusCodes.BAD_REQUEST, 'You are not authorized to update materials'));
            }
            const filter = { _id: req.params.id, org: user.org };
            const data = await this.service.update(filter, materialMetadata);
            res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, data, 'Material updated successfully'));
        } catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const user = req.user;
            if (user.role !== Roles.ADMIN && user.role !== Roles.FINANCE_EXECUTIVE && user.role !== Roles.INVENTORY_MANAGER) {
                return res.status(StatusCodes.BAD_REQUEST).json(new ApiError(StatusCodes.BAD_REQUEST, 'You are not authorized to update materials'));
            }
            const filter = { _id: req.params.id, org: user.org };
            const data = await this.service.delete(filter);
            res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, data, 'Material deleted successfully'));
        } catch (error) {
            next(error);
        }
    }
    // Example custom controller method: Get materials by category
    async getMaterialsByCategory(req, res, next) {
        try {
            if(!enumToArray(MaterialCategories).includes(req.params.category)) {
                return res.status(StatusCodes.BAD_REQUEST).json(new ApiError(StatusCodes.BAD_REQUEST, 'Invalid material category'));
            }
            const filter = { category: req.params.category, org: req.user.org };
            const materials = await this.service.findMaterialsByCategory(filter);
            res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, materials, 'Materials retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new MaterialMetadataController();
