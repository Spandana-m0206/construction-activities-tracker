const BaseService = require('../base/BaseService');
const Task = require('./task.model');
const Site = require('../site/site.model');
const Org = require('../org/org.model');

class TaskService extends BaseService {
    constructor() {
        super(Task); // Pass the Task model to the BaseService
    }

    // 1) Get tasks by site
    async findTasksBySite(siteId) {
        return this.model.find({ site: siteId })
            .populate('subtasks', 'title status')
            .populate('assignedTo', 'name email')
            .populate('org', 'name')
            .populate('site', 'name');
    }

    // // 2) Process a task (parallel or sequential)
    // async processTask(taskId) {
    //     const taskDoc = await this.model.findById(taskId).populate('subtasks');
    //     if (!taskDoc) throw new Error(`Task not found: ${taskId}`);

    //     if (!taskDoc.subtasks || taskDoc.subtasks.length === 0) {
    //         if (taskDoc.progressPercentage >= 100 && taskDoc.status !== 'Completed') {
    //             taskDoc.status = 'Completed';
    //             await taskDoc.save();
    //         }
    //         return taskDoc;
    //     }

    //     if (taskDoc.isParallel) {
    //         await Promise.all(
    //             taskDoc.subtasks.map((subtask) => this.processTask(subtask._id))
    //         );
    //     } else {
    //         for (let subtask of taskDoc.subtasks) {
    //             const result = await this.processTask(subtask._id);
    //             if (result.status !== 'Completed') break;
    //         }
    //     }

    //     await this.updateParentTaskStatus(taskDoc._id);
    //     return this.model.findById(taskDoc._id).populate('subtasks');
    // }

    // // 3) Update parent's progress/status
    // async updateParentTaskStatus(taskId) {
    //     const parent = await this.model.findById(taskId).populate('subtasks');
    //     if (!parent) return;

    //     const { subtasks } = parent;
    //     if (!subtasks || subtasks.length === 0) return;

    //     const allComplete = subtasks.every(st => st.status === 'Completed');
    //     if (allComplete) {
    //         parent.status = 'Completed';
    //         parent.progressPercentage = 100;
    //     } else {
    //         let sum = 0;
    //         for (let st of subtasks) {
    //             sum += st.progressPercentage || 0;
    //         }
    //         const avg = Math.floor(sum / subtasks.length);
    //         parent.progressPercentage = avg;

    //         if (avg > 0 && parent.status === 'Open') {
    //             parent.status = 'In Progress';
    //         }
    //     }
    //     await parent.save();
    // }

    // 4) Import tasks from JSON input
    async importTasks(jsonData) {
        const orgData = jsonData.organization;
        let org = await Org.findOneAndUpdate({ email: orgData.email }, orgData, { upsert: true, new: true });

        for (const siteData of jsonData.sites) {
            const site = await Site.create({
                ...siteData,
                org: org._id
            });

            for (const taskData of siteData.tasks) {
                await this.createTaskHierarchy(taskData, site._id, org._id);
            }
        }
        return { message: 'Data imported successfully' };
    }

    // 5) Recursive method to create tasks and subtasks
    async createTaskHierarchy(taskData, siteId, orgId, parentTaskId = null, level = 0) {
        // Create the main task first
        const task = await this.model.create({
            ...taskData,
            org: orgId,
            site: siteId,
            parentTask: parentTaskId,
            level: level,
            subtasks: [] // Initialize subtasks as an empty array
        });
    
        // If parent exists, push this task as a subtask reference
        if (parentTaskId) {
            await this.model.findByIdAndUpdate(parentTaskId, { $push: { subtasks: task._id } });
        }
    
        // Process subtasks recursively
        if (taskData.subtasks && taskData.subtasks.length > 0) {
            for (const subtaskData of taskData.subtasks) {
                const subtask = await this.createTaskHierarchy(subtaskData, siteId, orgId, task._id, level + 1);
                await task.updateOne({ $push: { subtasks: subtask._id } });
            }
        }
    
        return task;
    }
    
}

module.exports = new TaskService();
