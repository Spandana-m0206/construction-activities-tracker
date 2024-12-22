const { StatusCodes } = require('http-status-codes');
const { FloorTypes, SiteTypes, CarpetAreaUnitType } = require('../../utils/enums');
const BaseController = require('../base/BaseController');
const FloorDetailsService = require('./floorDetails.service');
const { default: ApiError } = require('../../utils/apiError');
const { default: ApiResponse } = require('../../utils/apiResponse');
const SiteService = require('../site/site.service');
const { default: enumToArray } = require('../../utils/EnumToArray');
const { default: mongoose } = require('mongoose');

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
            const floorDetails = await FloorDetailsService.find({site: req.params.site});
            res.status(200).json(new ApiResponse(StatusCodes.OK, floorDetails, "All floors fetched Successfully"));
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
                new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
            );
        }
    }
}

module.exports = new FloorDetailsController();
