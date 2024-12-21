const BaseService = require('../base/BaseService');
const OrgModel = require('./org.model');
const UserService = require('../user/user.service')
class OrgService extends BaseService {
    constructor() {
        super(OrgModel); 
    }

    // Example of a custom service method
    async getOrgsWithAdminDetails(filter = {}) {
        return await this.model.find(filter).populate('admin', 'name email');
    }

    async  create(orgDetails, adminDetails) {
        try {
          const orgDoc = await OrgModel.create(orgDetails);
          
          const adminDoc = await UserService.create(
              {
                ...adminDetails,
                org: orgDoc._id
              }
          );

          orgDoc.admin = adminDoc._id;
      
          await orgDoc.save();
      
          return {
            organization: orgDoc,
            admin: adminDoc
          };
        } catch (error) {
          throw error;
        }
      }
      
    
}

module.exports = new OrgService();
