const BaseController = require('../base/BaseController');
const VendorService = require('./vendor.service');
const ApiError = require('../../utils/ApiError');
const { StatusCodes } = require('http-status-codes');
const { CountryCodes } = require('../../utils/enums');
const ApiResponse = require('../../utils/ApiResponse');
const enumToArray = require('../../utils/EnumToArray');

class VendorController extends BaseController {
    constructor() {
        super(VendorService); // Pass the VendorService to the BaseController
    }

    async create(req, res, next) {
        try {
            // Validate country code
            const vendorsData = req.body;
            if(!vendorsData.name || !vendorsData.contact || !vendorsData.countryCode || !vendorsData.address ) {
                return res.status(StatusCodes.BAD_REQUEST).json(new ApiError(StatusCodes.BAD_REQUEST,'Please fill all required fields' ));
            }
            if (!enumToArray(CountryCodes).includes(vendorsData.countryCode)) {
                return res.status(StatusCodes.BAD_REQUEST).json(new ApiError(StatusCodes.BAD_REQUEST, 'Invalid country code'));
            }
            vendorsData.createdBy = req.user.userId;
            vendorsData.org = req.user.org;
            // Create the vendor
            const vendor = await this.service.create(vendorsData);
            res.status(StatusCodes.CREATED).json(new ApiResponse(StatusCodes.CREATED, vendor, 'Vendor created successfully'));
        } catch (error) {
            next(error);
        }
    }
    // Example custom controller method: Get vendors by organization
    async getVendorsByOrg(req, res, next) {
        try {
            const vendors = await this.service.findVendorsByOrg(req.params.orgId);
            res.status(200).json({ success: true, data: vendors });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new VendorController();
