const ApiError = require('../../utils/apiError');
const BaseService = require('../base/BaseService');
const TaskModel = require('../task/task.model');
const taskService = require('../task/task.service');
const SiteModel = require('./site.model');
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

    async countTasksForOrg(orgId, filters) {
      try {
          const sites = await this.model.find({ org: orgId }).select('_id');
          const siteIds = sites.map((s) => s._id);
          if (siteIds.length === 0) {
              return [];
          }
  
          const pipeline = [
              {
                  $match: {
                      site: { $in: siteIds },
                      ...filters, 
                  },
              },
              {
                  $group: {
                      _id: '$site', 
                      taskCount: { $sum: 1 }, 
                  },
              },
          ];
  
          const taskCounts = await TaskModel.aggregate(pipeline);
          return taskCounts;
      } catch (error) {
          console.error(`[TaskService Error - countTasksForOrg]: ${error.message}`);
          throw new Error('Failed to fetch task counts');
      }
    }
}

module.exports = new SiteService();
