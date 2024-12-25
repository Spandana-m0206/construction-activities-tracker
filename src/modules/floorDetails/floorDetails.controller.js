const { StatusCodes } = require('http-status-codes');
const { FloorTypes, SiteTypes, CarpetAreaUnitType } = require('../../utils/enums');
const BaseController = require('../base/BaseController');
const FloorDetailsService = require('./floorDetails.service');
const { default: ApiError } = require('../../utils/apiError');
const { default: ApiResponse } = require('../../utils/apiResponse');
const SiteService = require('../site/site.service');
const { default: enumToArray } = require('../../utils/EnumToArray');
const { default: mongoose } = require('mongoose');
const floorDetailsService = require('./floorDetails.service');
const { default: PaginatedApiResponse } = require('../../utils/paginatedApiResponse');

class FloorDetailsController extends BaseController {
    constructor() {
        super(FloorDetailsService); // Pass the FloorDetailsService to the BaseController
    }

    // Example custom controller method: Get floor details by site
    async getFloorDetailsBySite(req, res, next) {
        try {
            const floorDetails = await this.service.findFloorDetailsBySite(req.params.siteId);
            res.status(200).json({ success: true, data: floorDetails });
        } catch (error) {
            next(error);
        }
    }
    
    async create(req, res) {
        try {
            const floorData = req.body;
            const {site} = req.params

            // Check if the site exists
            const validSite = await SiteService.findById(site);
            if (!validSite) {
                return res.status(StatusCodes.BAD_REQUEST).json(
                    new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Site')
                );
            }

            if(validSite.org.toString() !== req.user.org.toString()){
                return res.status(StatusCodes.FORBIDDEN).json(
                    new ApiError(StatusCodes.FORBIDDEN, 'You are not authorized to create a floor plan in this organization')
                );
            }

            floorData.site = site;

            // Validate Floor Type
            const validFloorTypes = enumToArray(FloorTypes);
            if (!floorData.type || !validFloorTypes.includes(floorData.type)) {
                return res.status(StatusCodes.BAD_REQUEST).json(
                    new ApiError(StatusCodes.BAD_REQUEST, 'Please provide a valid floor type')
                );
            }

            // Validate Floor Size (Site Type)
            const validSiteTypes = enumToArray(SiteTypes);
            if (!floorData.size || !validSiteTypes.includes(floorData.size)) { //FIXME: size have enum of sites
                return res.status(StatusCodes.BAD_REQUEST).json(
                    new ApiError(StatusCodes.BAD_REQUEST, 'Please provide a valid site size')
                );
            }

            // Validate Carpet Area Unit
            const validCarpetAreaUnits = enumToArray(CarpetAreaUnitType);
            if (!floorData.carpetAreaUnit || !validCarpetAreaUnits.includes(floorData.carpetAreaUnit)) {
                return res.status(StatusCodes.BAD_REQUEST).json(
                    new ApiError(StatusCodes.BAD_REQUEST, 'Please provide a valid carpet area unit')
                );
            }

            // Check Floor Number and Level
            if (!floorData?.floorNumber || !floorData?.level ||floorData.floorNumber < 0 || floorData.level < 0) {
                return res.status(StatusCodes.BAD_REQUEST).json(
                    new ApiError(StatusCodes.BAD_REQUEST, 'Floor Number and Level must be positive numbers')
                );
            }

            if(floorData.level > validSite.level){
                return res.status(StatusCodes.BAD_REQUEST).json(
                    new ApiError(StatusCodes.BAD_REQUEST, 'Floor Level must not exceed the maximum number of levels in the site')
                );
            }
            const totalFloors = await FloorDetailsService.totalFloorAtLevel(site, floorData.level);
            if(totalFloors >= validSite.floors){
                return res.status(StatusCodes.BAD_REQUEST)
                    .json(new ApiError(StatusCodes.BAD_REQUEST, `Maximum number of floors at level ${floorData.level} exceeded.`))
            }

            // Create Floor Plan
            const newFloorPlan = await FloorDetailsService.create(floorData);

            res.status(StatusCodes.CREATED).json(
                new ApiResponse(StatusCodes.CREATED, newFloorPlan, 'Floor Plan Created Successfully')
            );
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
                new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
            );
        }
    }

    async find(req, res) {
        try {
            if(!mongoose.isValidObjectId(req.params.site)){
                return res.status(StatusCodes.BAD_REQUEST).json(
                    new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Site ID')
                );
            }
            const validSite = await SiteService.findById(req.params.site);
            if(!validSite){
                return res.status(StatusCodes.BAD_REQUEST).json(
                    new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Site')
                );
            }
            if(validSite.org.toString() !== req.user.org.toString()) {
                return res.status(StatusCodes.FORBIDDEN).json(
                    new ApiError(StatusCodes.FORBIDDEN, 'You are not authorized to view floor plans in this organization')
                );
            }
            const filters = { site: req.params.site }; // Default filter for site ID

            // Apply optional filters based on query parameters
            if (req.query.floorNumber) {
                filters.floorNumber = parseInt(req.query.floorNumber); // Exact match for floor number
            }
            if (req.query.level) {
                filters.level = parseInt(req.query.level); // Exact match for level
            }
            if (req.query.type) {
                filters.type = req.query.type; // Match type (enum validation handled by schema)
            }
            if (req.query.isParking !== undefined) {
                filters.isParking = req.query.isParking === 'true'; // Boolean match
            }
            if (req.query.isBasement !== undefined) {
                filters.isBasement = req.query.isBasement === 'true'; // Boolean match
            }
            if (req.query.isStore !== undefined) {
                filters.isStore = req.query.isStore === 'true'; // Boolean match
            }
            if (req.query.minCarpetArea && req.query.maxCarpetArea) {
                filters.carpetArea = {
                    $gte: parseFloat(req.query.minCarpetArea), // Minimum carpet area
                    $lte: parseFloat(req.query.maxCarpetArea)  // Maximum carpet area
                };
            } else if (req.query.minCarpetArea) {
                filters.carpetArea = { $gte: parseFloat(req.query.minCarpetArea) };
            } else if (req.query.maxCarpetArea) {
                filters.carpetArea = { $lte: parseFloat(req.query.maxCarpetArea) };
            }
            if (req.query.carpetAreaUnit) {
                filters.carpetAreaUnit = req.query.carpetAreaUnit; // Match carpet area unit
            }
            if (req.query.minFloorHeight && req.query.maxFloorHeight) {
                filters.floorHeight = {
                    $gte: parseFloat(req.query.minFloorHeight), // Minimum floor height
                    $lte: parseFloat(req.query.maxFloorHeight)  // Maximum floor height
                };
            }
            const floorDetails = await FloorDetailsService.findPaginated(filters, req.query.page, req.query.limit);
            res.status(200)
            .json(new PaginatedApiResponse(StatusCodes.OK, floorDetails.data, "All floors fetched Successfully", floorDetails.pagination.page, floorDetails.pagination.limit, floorDetails.pagination.totalCount));
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
                new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
            );
        }
    }

    async findOne (req, res) {
        const { id} = req.params
        const floor = await floorDetailsService.findById(id);
        if (!floor) {
            return res.status(StatusCodes.NOT_FOUND).json(
                new ApiError(StatusCodes.NOT_FOUND, 'Floor Plan not found')
            );
        }
        const site = await SiteService.findById(floor.site)
        if(site.org.toString() !== req.user.org.toString()){
            return res.status(StatusCodes.FORBIDDEN).json(
                new ApiError(StatusCodes.FORBIDDEN, 'You are not authorized to view this floor plan in this organization')
            );
        }
        return res.status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, floor, "Floor Data fetched successfully"))
    }

    async delete (req, res) {
        const { id } = req.params
        const floor = await floorDetailsService.findById(id);
        if (!floor) {
            return res.status(StatusCodes.NOT_FOUND).json(
                new ApiError(StatusCodes.NOT_FOUND, 'Floor Plan not found')
            );
        }
        const site = await SiteService.findById(floor.site)
        if(site.org.toString()!== req.user.org.toString()){
            return res.status(StatusCodes.FORBIDDEN).json(
                new ApiError(StatusCodes.FORBIDDEN, 'You are not authorized to delete this floor plan in this organization')
            );
        }
        await floorDetailsService.deleteOne({_id:id});
        return res.status(StatusCodes.ACCEPTED).json(
            new ApiResponse(StatusCodes.ACCEPTED, null, 'Floor Plan deleted successfully')
        );
    }

    async update (req, res) {
        const { id } = req.params
        const floor = await floorDetailsService.findById(id);
        if (!floor) {
            return res.status(StatusCodes.NOT_FOUND).json(
                new ApiError(StatusCodes.NOT_FOUND, 'Floor Plan not found')
            );
        }
        const site = await SiteService.findById(floor.site)
        if(site.org.toString()!== req.user.org.toString()){
            return res.status(StatusCodes.FORBIDDEN).json(
                new ApiError(StatusCodes.FORBIDDEN, 'You are not authorized to update this floor plan in this organization')
            );
        }
        const updates = req.body;
        if(updates._id){
            delete updates._id;
        }
        if(updates.site){
            delete updates.site;
        }
        const updatedData = await FloorDetailsService.updateOne({_id: id}, updates);
        return res.status(StatusCodes.OK).json(
            new ApiResponse(StatusCodes.OK, updatedData, 'Floor Plan updated successfully')
        );
    }
}

module.exports = new FloorDetailsController();
