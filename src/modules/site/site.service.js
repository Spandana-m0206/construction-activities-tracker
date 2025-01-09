const ApiError = require('../../utils/apiError');
const BaseService = require('../base/BaseService');
const taskService = require('../task/task.service');
const Site = require('./site.model');

class SiteService extends BaseService {
    constructor() {
        super(Site); // Pass the Site model to the BaseService
    }

    // Example custom service method: Find sites by status
    async findSitesByStatus(status) {
        return await this.model.find({ status }).populate('supervisor', 'name').populate('org', 'name');
    }

    async getSiteProgress(siteId) {
        // 1. Check if the site exists
        const site = await this.model.findById(siteId);
        if (!site) {
          throw new ApiError(404, "Site not found");
        }
    
        // 2. Fetch all tasks associated with the site
        const tasks = await taskService.find({ site: siteId });
    
        // 3. If there are no tasks, return 0% progress
        if (!tasks || tasks.length === 0) {
          return {
            success: true,
            data: {
              siteId,
              progress: 0
            }
          };
        }
    
        // 4. Calculate the average progress percentage
        let totalProgress = 0;
        tasks.forEach((task) => {
          // Ensure we handle cases where progressPercentage might be undefined
          totalProgress += (task.progressPercentage || 0);
        });
    
        const averageProgress = totalProgress / tasks.length;
    
        // 5. Return an object with overall progress information
        return {
          success: true,
          data: {
            siteId,
            progress: averageProgress // 0 - 100
          }
        };
    }

}

module.exports = new SiteService();
