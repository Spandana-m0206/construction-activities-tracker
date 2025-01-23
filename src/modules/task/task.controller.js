// task.controller.js
const { StatusCodes } = require('http-status-codes');
const ApprovalModel = require('../approval/approval.model');
const BaseController = require('../base/BaseController');
const fileService = require('../file/file.service');
const TaskModel = require('./task.model');
const TaskService = require('./task.service');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

class TaskController extends BaseController {
    constructor() {
        super(TaskService); // Pass TaskService to the BaseController
    }
    async createCustomTask(req,res){
        try {
            const taskData=req.body
            if([taskData.title,taskData.startTime,taskData.endTime,taskData.status
                ,taskData.site,taskData.raisedByDept,taskData.raisedToDept].some(field=>!field)){
                return res.status(StatusCodes.BAD_REQUEST).json(new ApiError(StatusCodes.BAD_REQUEST,"Enter The Required field","Enter The Required field"))
            }
            taskData.isSystemGenerated=false
            taskData.org=req.user.org
            if(req.files?.length){
                taskData.attachments=[]
                for(const file of req.files){
             const attachment = await fileService.create({
                 filename: file.originalname,
                 type: file.mimetype,
                 size: file.size,
                 org: taskData.org,
                 uploadedBy: req.user.userId, 
                 url: `${process.env.BASE_URL}/api/v1/files/link/${file.id}`, 
                });
                taskData.attachments.push(attachment._id)
                }
            }
            const customTask=await this.service.create(taskData)
            res.status(StatusCodes.CREATED).json(new ApiResponse(StatusCodes.CREATED,customTask, 'Task created successfully'));

            
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR,"Something Went Wrong",error))

        }
    }
    async findOne(req, res, next) {
        try {
            const tasks = await this.service.findOne({...req.query, _id:req.params.id});
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
                .populate('subtasks', '_id title description status startTime endTime progressPercentage') // Populate subtasks
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
                const images = await Promise.all(
                    imageIds.map(async (id) => {
                        const fileDetails = await fileService.findById(id); // Assuming findById exists in FileService
                        return fileDetails ? fileDetails.url : null;
                    })
                );
    
                
                acc[approval._id] = {
                    ...approval.latestApproval,
                    images: images.filter((img) => img), // Filter out null values
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
                    images: approval ? approval.images : [], // Include image URLs
                    approvalProgressPercentage: approval ? approval.progressPercentage : null,
                };
            });
    
            // Fetch URLs for main task images
            const mainTaskImages = mainTaskApproval?.images
                ? await Promise.all(
                      mainTaskApproval.images.map(async (id) => {
                          const fileDetails = await fileService.findById(id);
                          return fileDetails ? fileDetails.url : null;
                      })
                  )
                : [];
    
            // Prepare the response
            const responseData = {
                _id: task._id,
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
                images: mainTaskImages.filter((img) => img), // Include main task image URLs
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
            const tasks = await this.service.findTasksBySite(req.params.siteId, req.query);
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
            const data = await TaskService.updateTaskStatus(taskId, req.body.status, req.body.progressPercentage, req.files);
            return res.status(201).json({ success: true, data: data });
        } catch (error) {
            next(error);
        }
    }

    async findFilteredTasks(req, res, next) {
        try {
            const tasks = await this.service.findFilteredTasks(req.query);
            return res.status(200).json({ success: true, data: tasks });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new TaskController();
