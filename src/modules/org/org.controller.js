const { StatusCodes } = require('http-status-codes');
const ApiError = require('../../utils/apiError'); // Assuming ApiError is a class
const BaseController = require('../base/BaseController');
const OrgService = require('./org.service');
const ApiResponse = require('../../utils/apiResponse');
const UserService = require('../user/user.service');
const { Roles } = require('../../utils/enums');

class OrgController extends BaseController {
    constructor() {
        super(OrgService); // Pass the OrgService to the BaseController
    }

    // Example of a custom controller method
    async getOrgsWithAdminDetails(req, res, next) {
        try {
            const orgs = await this.service.getOrgsWithAdminDetails(req.query);
            res.status(StatusCodes.OK).json({ success: true, data: orgs });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    }

    async create(req, res) {
        try {
            const { admin, org } = req.body;

            // Validate organization fields
            if (
                !org ||
                !org.name ||
                !org.name.trim() ||
                !org.email ||
                !org.email.trim()
            ) {
                return res.status(StatusCodes.BAD_REQUEST).json(
                    new ApiError(StatusCodes.BAD_REQUEST, "Please fill required fields")
                );
            }

            const { name, countryCode, phone, email, password, language } = admin;

            // Validate admin fields
            if (
                [name, countryCode, phone, email, password, language].some(
                    field => !field || !field.trim()
                )
            ) {
                return res.status(StatusCodes.BAD_REQUEST).json(
                    new ApiError(StatusCodes.BAD_REQUEST, "Please fill required fields")
                );
            }

            // Check if organization with the same email already exists
            const isOrgExisted = await OrgService.findOne({ email: org.email });
            if (isOrgExisted) {
                return res.status(StatusCodes.BAD_REQUEST).json(
                    new ApiError(StatusCodes.BAD_REQUEST, "Organization with the same email already exists")
                );
            }

            // Check if user with the same email or phone already exists
            const isUserExisted = await UserService.findOne({
                $or: [
                    { email: admin.email },
                    { phone: admin.phone }
                ]
            });
            if (isUserExisted) {
                return res.status(StatusCodes.BAD_REQUEST).json(
                    new ApiError(StatusCodes.BAD_REQUEST, "User with the same email or phone already exists")
                );
            }

            // Assign ADMIN role to the user
            admin.role = Roles.ADMIN;

            // Create the new organization with admin
            const newOrg = await OrgService.create(org, admin);
            if (!newOrg) {
                return res.status(StatusCodes.BAD_REQUEST).json(
                    new ApiError(StatusCodes.BAD_REQUEST, "Failed to create organization")
                );
            }

            // Respond with the created organization and admin details
            res.status(StatusCodes.CREATED).json(
                new ApiResponse(
                    StatusCodes.CREATED,
                    {
                        admin: {
                            email: newOrg.admin.email,
                            name: newOrg.admin.name,
                            userId: newOrg.admin._id
                        },
                        organization: {
                            email: newOrg.organization.email,
                            name: newOrg.organization.name,
                            orgId: newOrg.organization._id
                        }
                    },
                    "Organization created successfully."
                )
            );
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
                new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message, error)
            );
        }
    }
}

module.exports = new OrgController();
