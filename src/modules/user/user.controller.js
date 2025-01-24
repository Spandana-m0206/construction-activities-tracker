const BaseController = require('../base/BaseController');
const UserService = require('./user.service');
const ApiResponse = require('../../utils/apiResponse');
const { StatusCodes } = require('http-status-codes');
const enumToArray  = require('../../utils/EnumToArray');
const { Roles } = require('../../utils/enums');
const ApiError = require('../../utils/apiError');
const userService = require('./user.service');
const {generateRandomPassword} = require('../../utils/password');
const fileService = require('../file/file.service');
const SiteService = require('../site/site.service');
const InventoryService = require('../inventory/inventory.service');
class UserController extends BaseController {
    constructor() {
        super(UserService); // Pass the UserService to the BaseController
    }
    async find(req, res, next) {
        try {
            const { role, query } = req.query;
    
            // Construct filter
            const filter = { org: req.user.org, isActive: true };
    
            // Add role to filter if provided
            if (role && role !== '') {
                filter.role = role;
            }
    
            // Add search query filter for name, email, or phone
            if (query) {
                const searchRegex = new RegExp(query, 'i'); // Case-insensitive regex
                filter.$or = [
                    { name: { $regex: searchRegex } },
                    { email: { $regex: searchRegex } },
                ];
            }
    
            // Fetch filtered users
            const users = await this.service.find(filter);
    
            // Send response
            res.status(StatusCodes.ACCEPTED).json(
                new ApiResponse(StatusCodes.ACCEPTED, users, "Users fetched successfully")
            );
        } catch (error) {
            next(error);
        }
    }    
    async findOne(req, res, next) {
        try {
            const user = await this.service.findUserById(req.params.id);
            if (!user) {
                return res.status(StatusCodes.NOT_FOUND).json(new ApiError(StatusCodes.NOT_FOUND, "User not found"));
            }
            res.status(StatusCodes.ACCEPTED).json(new ApiResponse(StatusCodes.ACCEPTED, user, "User fetched successfully"));
        } catch (error) {
            next(error);
        }
    }
    async uploadProfilePhoto(req, res, next) {
        try {
            const user = req.user;
            if(req.file){
                const attachment = await fileService.create({
                    filename: req.file.originalname,
                    type: req.file.mimetype,
                    size: req.file.size,
                    org: req.user.org,
                    uploadedBy: req.user.userId, // Assuming userId is in the request user object
                    url: `${process.env.BASE_URL}/api/v1/files/link/${req.file.id}`, // Example URL format
                })
                user.profilePhoto = attachment._id
            }
            await user.save();
            res.status(StatusCodes.ACCEPTED).json(new ApiResponse(StatusCodes.ACCEPTED, user, "Profile photo uploaded successfully"));
        } catch (error) {
            next(error);
        }
    }
    // Example of a custom controller method: Get users by role
    async getUsersByRole(req, res, next) {
        try {
            const users = await this.service.findUsersByRole(req.params.role);
            res.status(StatusCodes.ACCEPTED).json(new ApiResponse(StatusCodes.ACCEPTED, users, "User fetched successfully"));
        } catch (error) {
            next(error);
        }
    }

    async create (req, res) {
        try {
            const {name, countryCode, phone, email, language, role,address } = req.body;
    
            if(!role || !role.trim() || !enumToArray(Roles).includes(role) ){
                console.log(enumToArray(Roles))
                return res.status(StatusCodes.BAD_REQUEST)
                    .json( new ApiError(StatusCodes.BAD_REQUEST, "Please provide a valid role" ))
            }
            if(!name ||!countryCode ||!phone ||!email ||!language){
                return res.status(StatusCodes.BAD_REQUEST).json(new ApiError(StatusCodes.BAD_REQUEST, "Please fill required fields"));
            }
            const isUserExisted = await UserService.findOne({
                $or: [
                  { email },
                  { phone }
                ]
              })
            if(isUserExisted){
                return res.status(StatusCodes.BAD_REQUEST).json(new ApiError(StatusCodes.BAD_REQUEST, "User with same Email or Phone already exists"));
            }      
            if(!req.user.org){
                return res.status(StatusCodes.FORBIDDEN).json(new ApiError(StatusCodes.FORBIDDEN, "You are not authorized to create a user in this organization" ))
            }
            const password = generateRandomPassword()
            const newUser = await UserService.create({name, countryCode, email:email.trim().toLowerCase(),role, phone, language, password,org:req.user.org,address})
            
            if(role ===Roles.SITE_SUPERVISOR) {
                const {sites} = req.body
                Promise.all(sites.map(async site=>{
                    const siteExisted = await SiteService.findById(site)
                    if(!siteExisted){
                        return res.status(StatusCodes.BAD_REQUEST).json(new ApiError(StatusCodes.BAD_REQUEST, "Site not found"))
                    }
                    await SiteService.update({_id:site},{supervisor:newUser._id})
                }))
            }
            else if(role ===Roles.INVENTORY_MANAGER){
                const {inventories} = req.body
                Promise.all(inventories.map(async inventory=>{
                    const inventoryExisted = await InventoryService.findById(inventory)
                    if(!inventoryExisted){
                        return res.status(StatusCodes.BAD_REQUEST).json(new ApiError(StatusCodes.BAD_REQUEST, "Inventory not found"))
                    }
                    await InventoryService.update({_id:inventory},{manager:newUser._id})
                }))
            }

            //TODO: send a create user email 
            delete newUser.password
            return res.status(StatusCodes.CREATED)
                .json( new ApiResponse(StatusCodes.CREATED, {
                    userId:newUser._id,
                    name:newUser.name,
                    email:newUser.email,
                    role:newUser.role,
                    phone:newUser.phone,
        },"User created successfully"))
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message, error))
    }
}   
    async update(req, res, next) {
        try {
            const {name, countryCode, phone, email, language, role,address } = req.body;
    
            if(!role || !role.trim() || !enumToArray(Roles).includes(role) ){
                return res.status(StatusCodes.BAD_REQUEST)
                    .json( new ApiError(StatusCodes.BAD_REQUEST, "Please provide a valid role" ))
            }
            if(!name ||!countryCode ||!phone ||!email ||!language){
                return res.status(StatusCodes.BAD_REQUEST).json(new ApiError(StatusCodes.BAD_REQUEST, "Please fill required fields"));
            }
            if(!req.user.org){
                return res.status(StatusCodes.FORBIDDEN).json(new ApiError(StatusCodes.FORBIDDEN, "You are not authorized to create a user in this organization" ))
            }
            const isUserExisted = await UserService.findOne({_id:req.params.id})
            if(!isUserExisted){
                return res.status(StatusCodes.FORBIDDEN).json(new ApiError(StatusCodes.BAD_REQUEST, "User does not exist"));
            }                  
             // Update user details
        const updatedUserMsg = await UserService.update({_id:req.params.id}, {
            name,
            countryCode,
            phone,
            email,
            language,
            role,
            address,
        });
        const updatedUser = await UserService.findOne({_id:req.params.id});
    
        if (role === Roles.SITE_SUPERVISOR) {
            const { sites = [], previousInventories = [], previousSites = [] } = req.body;
          
            // Add user to new sites
            const newSiteIds = sites.map((site) => site);
            const siteUpdates = sites.map(async (site) => {
              const siteExisted = await SiteService.findById(site);
              if (!siteExisted) {
                throw new ApiError(StatusCodes.BAD_REQUEST, `Site with ID ${site} not found`);
              }
              return SiteService.update({_id:site},{supervisor:updatedUser._id});
            });
          
            // Remove user from previous sites not in the updated list
            const sitesToRemove = previousSites.filter((siteId) => !newSiteIds.includes(siteId));
            const siteRemovals = sitesToRemove.map((siteId) => {
              return SiteService.update({_id:siteId},{supervisor:null});
            });
          
            // Remove user from all previous inventories
            const inventoryRemovals = previousInventories.map((inventoryId) => {
              return InventoryService.update({_id:inventoryId},{manager:null});
            });
          
            await Promise.all([...siteUpdates, ...siteRemovals, ...inventoryRemovals]);
          } else if (role === Roles.INVENTORY_MANAGER) {
            const { inventories = [], previousInventories = [], previousSites = [] } = req.body;
          
            // Add user to new inventories
            const newInventoryIds = inventories.map((inventory) => inventory);
            const inventoryUpdates = newInventoryIds.map(async (inventory) => {
              const inventoryExisted = await InventoryService.findById(inventory);
              if (!inventoryExisted) {
                throw new ApiError(StatusCodes.BAD_REQUEST, `Inventory with ID ${inventory} not found`);
              }
              const updateInventory = await InventoryService.update({_id:inventory},{manager:updatedUser._id});
              return updateInventory;
            });
          
            // Remove user from previous inventories not in the updated list
            const inventoriesToRemove = previousInventories.filter(
              (inventoryId) => !newInventoryIds.includes(inventoryId)
            );
            const inventoryRemovals = inventoriesToRemove.map((inventoryId) => {
              return InventoryService.update({_id:inventoryId},{manager:null});
            });
          
            // Remove user from all previous sites
            const siteRemovals = previousSites.map((siteId) => {
              return SiteService.update({_id:siteId},{supervisor:null});
            });
          
            await Promise.all([...inventoryUpdates, ...inventoryRemovals, ...siteRemovals]);
          }
          
    
        return res.status(StatusCodes.OK).json(
            new ApiResponse(StatusCodes.OK, {
            userId: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            phone: updatedUser.phone,
            }, "User updated successfully")
        );
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message, error))
    }
    }
    async delete(req, res, next) {
        try {
            const user = await this.service.findById(req.params.id);
            if (!user) {
                return res.status(StatusCodes.NOT_FOUND).json(new ApiError(StatusCodes.NOT_FOUND, "User not found"));
            }
            req.body.isActive = false;
            await this.service.update({_id:req.params.id}, req.body);
            res.status(StatusCodes.ACCEPTED).json(new ApiResponse(StatusCodes.ACCEPTED, null, "User deleted successfully"));
        } catch (error) {
            next(error);
        }
    }

}

module.exports = new UserController();
