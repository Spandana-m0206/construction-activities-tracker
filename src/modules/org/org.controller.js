const { HttpStatusCode } = require('axios');
const { default: ApiError } = require('../../utils/apiError');
const BaseController = require('../base/BaseController');
const OrgService = require('./org.service');
const { ApiResponse } = require('../../utils/apiResponse');
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
            res.status(200).json({ success: true, data: orgs });
        } catch (error) {
            return res.status(500).json({ error: error});
        }
    }

    async create(req, res) {
        try {
            const {admin, org} = req.body;
            
            if(!org || !org.name || !org.name.trim() || !org.email || !org.email.trim()){
                return res.status(400).json(new ApiError(HttpStatusCode.BadRequest, "Please fill required Fields"));
            }
            const {name, countryCode, phone, email, password, language, } = admin;
            if (
                [name, countryCode, phone, email, password, language].some(
                field => (!field || field == undefined || !field.trim())
                )
            ) {
                return res.status(400).json(
                new ApiError(HttpStatusCode.BadRequest, "Please fill required Fields")
                );
            }

            const isOrgExisted = await OrgService.findOne({email:org.email});
            if(isOrgExisted){
                return res.status(400).json(new ApiError(HttpStatusCode.BadRequest, "Organization with same Email already exists"));
            }
            const isUserExisted = await UserService.findOne({
                $or: [
                  { email: admin.email },
                  { phone: admin.phone }
                ]
              });
            if(isUserExisted){
                return res.status(400).json(new ApiError(HttpStatusCode.BadRequest, "User with same Email or Phone already exists"));
            }
            admin.role = Roles.ADMIN;

            const newOrg = await OrgService.create(org, admin);
            if(!newOrg){
                return res.status(400).json(new ApiError(HttpStatusCode.BadRequest, "Failed to create organization"));  
            }
            res.status(201).json(new ApiResponse(HttpStatusCode.Created, 
                {
                    admin:{
                        email:newOrg.admin.email,
                        name: newOrg.admin.name,
                        userId: newOrg.admin._id
                    },
                    organization: {
                        email:newOrg.organization.email,
                        name: newOrg.organization.name,
                        orgId: newOrg.organization._id
                    }
                }
                , "Organization created successfully."));
        } catch (error) {
            res.status(500).json(new ApiError(500, error.message, error ));
        }
    }
}

module.exports = new OrgController();
