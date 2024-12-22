const { StatusCodes } = require('http-status-codes');
const { default: ApiError } = require('../../utils/apiError');
const BaseController = require('../base/BaseController');
const SiteService = require('./site.service');
const { default: ApiResponse } = require('../../utils/apiResponse');
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
            if(!siteData?.type || !enumToArray(SiteTypes).includes(siteData?.type)){
                return res.status(StatusCodes.BAD_REQUEST)
                   .json(new ApiError(StatusCodes.BAD_REQUEST, "Please provide a valid site type" ))
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
}

module.exports = new SiteController();
