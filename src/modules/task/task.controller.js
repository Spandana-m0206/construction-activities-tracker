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
            const {siteId} = req.body; 

            const createdTasks = await TaskService.createTasksForFloors(siteId);
            return res.status(201).json({ success: true, data: createdTasks });
        } catch (error) {
            next(error);
        }
    }

    // New controller method to add sub task
    async addSubTask(req, res, next) {
        try {
            const {parentTaskId} = req.params; 
            const {subTaskData} = req.body;
            const newSubtask = await TaskService.addSubTask(parentTaskId, subTaskData);
            return res.status(201).json({ success: true, data: newSubtask });
        } catch (error) {
            next(error);
        }
    }
    async deleteSubtask(req, res, next) {
        try {
            const {parentTaskId, subTaskId} = req.params; 
            const updatedTask = await TaskService.deleteSubtask(parentTaskId, subTaskId);
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
}

module.exports = new TaskController();
