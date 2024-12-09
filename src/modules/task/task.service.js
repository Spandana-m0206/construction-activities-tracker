const BaseService = require('../base/BaseService');
const Task = require('./task.model');

class TaskService extends BaseService {
    constructor() {
        super(Task); // Pass the Task model to the BaseService
    }

    // Example custom service method: Get tasks by site
    async findTasksBySite(siteId) {
        return await this.model.model.find({ site: siteId })
            .populate('subtasks', 'title status')
            .populate('assignedTo', 'name email')
            .populate('org', 'name')
            .populate('site', 'name');
    }
}

module.exports = new TaskService();
