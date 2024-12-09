const BaseController = require('../base/BaseController');
const TaskService = require('./task.service');

class TaskController extends BaseController {
    constructor() {
        super(TaskService); // Pass the TaskService to the BaseController
    }

    // Example custom controller method: Get tasks by site
    async getTasksBySite(req, res, next) {
        try {
            const tasks = await this.service.findTasksBySite(req.params.siteId);
            res.status(200).json({ success: true, data: tasks });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new TaskController();
