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

    // New controller method to add sub task
    async addSubTask(req, res, next) {
        try {
            const {parentTaskId} = req.params; 
            const newSubtask = await TaskService.addSubTask(parentTaskId, req.body);
            return res.status(201).json({ success: true, data: newSubtask });
        } catch (error) {
            next(error);
        }
    }
    async deleteSubtask(req, res, next) {
        try {
            const {subTaskId} = req.params; 
            const updatedTask = await TaskService.deleteSubtask(subTaskId);
            return res.status(201).json({ success: true, data: updatedTask });
        } catch (error) {
            next(error);
        }
    }

    async getSubTasks(req, res, next) {
        try {
            const {parentTaskId} = req.params; 
            const subtasks = await TaskService.getSubTasks(parentTaskId);
            return res.status(201).json({ success: true, data: subtasks });
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
    async getTaskCountForSite(req, res) {
        try {
            const { siteId, ...filters } = req.query;

            if (!siteId) {
                return res.status(400).json({ error: 'siteId is required' });
            }

            const count = await this.service.countTasksForSite(siteId, filters);
            res.status(200).json({ siteId, taskCount: count });
        } catch (error) {
            console.error(`[TaskController Error - getTaskCountForSite]: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new TaskController();
