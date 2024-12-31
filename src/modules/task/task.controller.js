// task.controller.js
const BaseController = require('../base/BaseController');
const TaskService = require('./task.service');

class TaskController extends BaseController {
    constructor() {
        super(TaskService); // Pass TaskService to the BaseController
    }

    async getTasksBySite(req, res, next) {
        try {
            const tasks = await this.service.findTasksBySite(req.params.siteId);
            return res.status(200).json({ success: true, data: tasks });
        } catch (error) {
            next(error);
        }
    }

    // New controller method to create tasks from a map
    async createTasksFromMap(req, res, next) {
        try {
            const {siteId, orgId} = req.body; 

            const createdTasks = await TaskService.createTasksForFloors(siteId);
            return res.status(201).json({ success: true, data: createdTasks });
        } catch (error) {
            next(error);
        }
    }

    async canUpdateTask(req, res, next) {
        try {
            const {taskId} = req.params;
            const data = await TaskService.canUpdateTask(taskId, req.body.status);
            return res.status(201).json({ success: true, data: data });
        } catch (error) {
            next(error);
        }
    }
    async updateTask(req, res, next) {
        try {
            const {taskId} = req.params;
            const data = await TaskService.updateTaskStatus(taskId, req.body.status);
            return res.status(201).json({ success: true, data: data });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new TaskController();
