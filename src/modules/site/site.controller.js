const { StatusCodes } = require('http-status-codes');
const  ApiError  = require('../../utils/apiError');
const BaseController = require('../base/BaseController');
const SiteService = require('./site.service');
const ApiResponse = require('../../utils/apiResponse');
const { default: PaginatedApiResponse } = require('../../utils/paginatedApiResponse');
const { default: enumToArray } = require('../../utils/EnumToArray');
const { ProjectCurrencies, SiteTypes, SiteStatuses } = require('../../utils/enums');
const UserService = require('../user/user.service');

class SiteController extends BaseController {
    constructor() {
        super(SiteService); // Pass the SiteService to the BaseController
    }

    // Example custom controller method: Get sites by status
    async getSitesByStatus(req, res, next) {
        try {
            const sites = await this.service.findSitesByStatus(req.params.status);
            res.status(200).json({ success: true, data: sites });
        } catch (error) {
            next(error);
        }
    }
    async create (req, res) {
        try {
            const siteData = req.body;
            if(siteData.startDate>siteData.endDate) {
                return res.status(400)
                    .json(new ApiError(StatusCodes.BAD_REQUEST, "Invalid Date Duration"));
            }
            siteData.org = req.user.org;
            const projectCurrencyArray = enumToArray(ProjectCurrencies)
            if(!siteData.projectCurrency || ! projectCurrencyArray.includes(siteData.projectCurrency) ){
                return res.status(StatusCodes.BAD_REQUEST)
                   .json(new ApiError(StatusCodes.BAD_REQUEST, "Please provide a valid project currency" ))
            }
            if(!siteData.supervisor){
                return res.status(400)
                   .json(new ApiError(StatusCodes.BAD_REQUEST, "Please provide a valid supervisor ID"));
            }
            const supervisor =  await UserService.findById(siteData.supervisor);
            if(!supervisor) {
                return res.status(400)
                   .json(new ApiError(StatusCodes.BAD_REQUEST, "Invalid Supervisor ID"));
            }
            if(!siteData?.status)siteData.status = SiteStatuses.WAITING;
            const newSite = await SiteService.create(siteData);
            res.status(StatusCodes.CREATED)
                .json(new ApiResponse(StatusCodes.CREATED, newSite, "New Site Created"))
            
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
        }
    }

    async find(req, res) {
        try {
            const { name, location, startDate, endDate, projectCurrency, minValue, maxValue, level, floors, basements, supervisor, status, page = 1, limit = 10 } = req.query;

            // Initialize filters with organization restriction
            const filters = { org: req.user.org };
    
            // Apply optional filters
            if (name) {
                filters.name = { $regex: name, $options: 'i' }; // Case-insensitive regex search
            }
            if (location) {
                filters.location = { $regex: location, $options: 'i' }; // Case-insensitive regex
            }
            if (startDate) {
                filters.startDate = { $gte: new Date(startDate) }; // Start date filter
            }
            if (endDate) {
                filters.endDate = { $lte: new Date(endDate) }; // End date filter
            }
            if (projectCurrency) {
                filters.projectCurrency = projectCurrency; // Exact match for project currency
            }
            if (minValue && maxValue) {
                filters.projectValue = { $gte: parseFloat(minValue), $lte: parseFloat(maxValue) }; // Range filter for project value
            } else if (minValue) {
                filters.projectValue = { $gte: parseFloat(minValue) };
            } else if (maxValue) {
                filters.projectValue = { $lte: parseFloat(maxValue) };
            }
            if (level) {
                filters.level = parseInt(level); // Match specific level
            }
            if (floors) {
                filters.floors = parseInt(floors); // Match specific number of floors
            }
            if (basements) {
                filters.basements = parseInt(basements); // Match specific number of basements
            }
            if (supervisor) {
                filters.supervisor = supervisor; // Exact match for supervisor ID
            }
            if (status) {
                filters.status = status; // Exact match for status
            }
    
            // Fetch filtered sites
            const sites = await SiteService.findPaginated(filters, page, limit);
    

            res.status(StatusCodes.OK).json(new PaginatedApiResponse(StatusCodes.OK, sites.data, "Sites fetched Successfully", sites.pagination.page, sites.pagination.limit, sites.pagination.totalCount));
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message, error))
        }
    }

    async update (req, res) {
        const {site} = req.params;
        const validSite = await this.service.findById(site);
        if(!site){
            return res.status(404).json(new ApiResponse(StatusCodes.NOT_FOUND, "Site not found"));
        } 
        const updates = req.body;
        if(updates.startDate>updates.endDate) {
            return res.status(400)
               .json(new ApiError(StatusCodes.BAD_REQUEST, "Invalid Date Duration"));
        }
        if(updates.projectCurrency &&!enumToArray(ProjectCurrencies).includes(updates.projectCurrency) ){
            return res.status(400)
               .json(new ApiError(StatusCodes.BAD_REQUEST, "Please provide a valid project currency" ))
        }
        if(updates.supervisor){
            const supervisor = await UserService.findById(updates.supervisor);
            if(!supervisor) {
                return res.status(400)
                .json(new ApiError(StatusCodes.BAD_REQUEST, "Invalid Supervisor ID"));
            }
        }
        const updatedSite = await SiteService.update({_id:site}, updates, {new:true});
        return res.status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, updatedSite, "Site updated successfully"));
    }

    async delete (req, res) {
        const {id} = req.params;
        const validSite = await this.service.findById(id);
        if(!validSite){
            return res.status(404).json(new ApiError(StatusCodes.NOT_FOUND, "Site not found"));
        } 
        if(validSite.org.toString() !== req.user.org.toString()) {
            return res.status(StatusCodes.FORBIDDEN).json(
                new ApiError(StatusCodes.FORBIDDEN, 'You are not authorized to delete this site in this organization')
            );
        }
        await SiteService.deleteOne({_id:id});
        return res.status(StatusCodes.ACCEPTED)
        .json(new ApiResponse(StatusCodes.ACCEPTED, {},"Site deleted successfully"));
    }

    async findOne(req, res) {
        const {id} = req.params;
        const validSite = await this.service.findById(id);
        if(!validSite){
            return res.status(404).json(new ApiError(StatusCodes.NOT_FOUND, "Site not found"));
        }
        if(validSite.org.toString() !== req.user.org.toString()){
            return res.status(StatusCodes.FORBIDDEN).json(
                new ApiError(StatusCodes.FORBIDDEN, 'You are not authorized to view this site in this organization')
            );
        }
        return res.status(StatusCodes.OK)
        .json(new ApiResponse(StatusCodes.OK, validSite, "Site retrieved successfully"));
    }
}

module.exports = new SiteController();
