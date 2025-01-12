// task.controller.js
const ApprovalModel = require('../approval/approval.model');
const BaseController = require('../base/BaseController');
const FileModel = require('../file/file.model');
const TaskModel = require('./task.model');
const TaskService = require('./task.service');

class TaskController extends BaseController {
    constructor() {
        super(TaskService); // Pass TaskService to the BaseController
    }
    async find(req, res, next) {
        try {
            const tasks = await this.service.find(req.query);
            return res.status(200).json({ success: true, data: tasks });
        } catch (error) {
            next(error);
        }
    }
    async findOne(req, res, next) {
        try {
            const tasks = await this.service.findOne(req.query);
            return res.status(200).json({ success: true, data: tasks });
        } catch (error) {
            next(error);
        }
    }
    async getTaskDetails(req, res, next) {
        try {
            const { taskId } = req.params;
    
            // Validate taskId
            if (!taskId) {
                return res.status(400).json({ success: false, message: "Task ID is required" });
            }
    
            // Fetch task details
            const task = await TaskModel.findById(taskId)
                .populate('site', '_id name location') // Populate site details
                .populate('subtasks', '_id title description status startTime endTime') // Populate subtasks
                .lean();
    
            // If task not found
            if (!task) {
                return res.status(404).json({ success: false, message: 'Task not found' });
            }
    
            // Fetch the latest approval for the main task
            const mainTaskApproval = await ApprovalModel.findOne({ task: taskId })
                .sort({ approvedAt: -1 }) // Get the latest approval
                .lean();
    
            // Fetch the latest approval for each subtask using aggregation
            const subtaskIds = task.subtasks.map((subtask) => subtask._id);
    
            const subtaskApprovals = await ApprovalModel.aggregate([
                { $match: { task: { $in: subtaskIds } } }, // Match subtasks
                { $sort: { approvedAt: -1 } }, // Sort by latest approval date
                {
                    $group: {
                        _id: "$task", // Group by subtask ID
                        latestApproval: { $first: "$$ROOT" }, // Pick the most recent approval
                    },
                },
            ]);
    
            // Map latest approvals to a dictionary for quick lookup
            const subtaskApprovalMap = await subtaskApprovals.reduce(async (accPromise, approval) => {
                const acc = await accPromise; // Wait for previous reductions
                const imageIds = approval.latestApproval.images;
            
                // Fetch URLs for the image IDs
                const images = await FileModel.find({ _id: { $in: imageIds } }).select('_id url').lean();
            
                acc[approval._id] = {
                    ...approval.latestApproval,
                    images: images.map((img) => img.url), // Map to URLs
                };
                return acc;
            }, Promise.resolve({}));
    
            // Attach approval details to subtasks
            task.subtasks = task.subtasks.map((subtask) => {
                const approval = subtaskApprovalMap[subtask._id.toString()];
                return {
                    ...subtask,
                    approvalId: approval ? approval._id : null,
                    approvalStatus: approval ? approval.status : null,
                    approvedBy: approval ? approval.approvedBy : null,
                    approvedAt: approval ? approval.approvedAt : null,
                    images: approval ? approval.images : [], // Include image IDs
                };
            });
    
            // Prepare the response
            const responseData = {
                name: task.title,
                description: task.description,
                status: task.status,
                progressPercentage: task.progressPercentage,
                startTime: task.startTime,
                endTime: task.endTime,
                siteId: task.site?._id || null,
                siteName: task.site?.name || null,
                location: task.site?.location || null,
                approvalId: mainTaskApproval?._id || null,
                approvalStatus: mainTaskApproval?.status || null,
                approvedBy: mainTaskApproval?.approvedBy || null,
                approvedAt: mainTaskApproval?.approvedAt || null,
                images: mainTaskApproval?.images || [], // Include image IDs for main task
                subtasks: task.subtasks,
            };
    
            // Respond with task details
            res.status(200).json({
                success: true,
                data: responseData,
            });
        } catch (error) {
            console.error("Error in getTaskDetails:", error.message);
            next(error);
        }
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
            const data = await TaskService.updateTaskStatus(taskId, req.body.status, req.body.progressPercentage);
            return res.status(201).json({ success: true, data: data });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new TaskController();
