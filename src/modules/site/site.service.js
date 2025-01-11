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
            site,
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
          site,
          progress: averageProgress // 0 - 100
        }
      };
  }

    async getProgressForAllSites(orgId, filters) {
      try {
        // Fetch all sites associated with the organization
        const sites = await this.model.find({ org: orgId }).select('_id name location endDate startDate status projectValue');
        const siteIds = sites.map((s) => s._id);
    
        if (siteIds.length === 0) {
          return {
            success: true,
            data: [],
          };
        }
    
        // Fetch tasks associated with the site IDs and apply filters
        const tasks = await TaskModel.find({ site: { $in: siteIds }, ...filters });
    
        // Calculate progress for each site
        const progressData = sites.map((site) => {
          const siteTasks = tasks.filter((task) => task.site.equals(site._id));
          if (siteTasks.length === 0) {
            return {
              siteId: site._id,
              siteName: site.name,
              siteLocation: site.location,
              siteEndDate: site.endDate,
              siteStartDate: site.startDate,
              siteStatus: site.status,
              siteProjectValue: site.projectValue,
              progress: 0, // No tasks, progress is 0%
            };
          }
    
          // Calculate average progress for the site
          const totalProgress = siteTasks.reduce((sum, task) => sum + (task.progressPercentage || 0), 0);
          const averageProgress = totalProgress / siteTasks.length;
    
          return {
            siteId: site._id,
            siteName: site.name,
            siteLocation: site.location,
            siteEndDate: site.endDate,
            siteStartDate: site.startDate,
            siteStatus: site.status,
            siteProjectValue: site.projectValue,
            progress: averageProgress,
          };
        });
    
        return {
          success: true,
          data: progressData,
        };
      } catch (error) {
        console.error(`[SiteService Error - getProgressForAllSites]: ${error.message}`);
        throw new Error('Failed to fetch progress for all sites');
      }
    }
    
        

    async countTasksForOrg(orgId, filters) {
      try {
        // Fetch all sites associated with the org
        const sites = await this.model.find({ org: orgId }).select('_id name location');
        const siteIds = sites.map((s) => s._id);
    
        if (siteIds.length === 0) {
          return {
            success: true,
            data: [],
          };
        }
    
        // Define aggregation pipeline to count tasks
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
    
        // Get task counts for each site
        const taskCounts = await TaskModel.aggregate(pipeline);
    
        // Map site data with task counts
        const result = sites.map((site) => {
          const taskCount = taskCounts.find((tc) => tc._id.equals(site._id))?.taskCount || 0;
          return {
            siteId: site._id,
            siteName: site.name,
            siteLocation: site.location,
            taskCount,
          };
        });
    
        return {
          success: true,
          data: result,
        };
      } catch (error) {
        console.error(`[TaskService Error - countTasksForOrg]: ${error.message}`);
        throw new Error('Failed to fetch task counts');
      }
    }    
}

module.exports = new SiteService();
