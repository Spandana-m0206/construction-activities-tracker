const ApiError = require('../../utils/apiError');
const { TaskStatuses, StatusOrder } = require('../../utils/enums');
const {taskMap, TaskIDs, Triggers} = require('../../utils/taskMap');
const BaseService = require('../base/BaseService');
const siteService = require('../site/site.service');
const SiteModel = require('../site/site.model');
const Task = require('./task.model');
const messageService = require('../message/message.service');
const { emitMessage } = require('../../utils/socketMessageEmitter');
const fileService = require('../file/file.service');

class TaskService extends BaseService {
  constructor() {
    super(Task);
  }

  async find(filters) {
    const tasks = await this.model.find(filters)
      .populate('site', 'name')
      .populate('createdBy', '_id name');
    return tasks
  }
  async findOne(filters) {
    return await this.model.findOne(filters)
      .populate('subtasks', 'title description startTime endTime status attachments')
      .populate('assignedTo', 'name email')
      .populate('org', 'name')
      .populate('site', 'name');
  }
  async createTasksForFloors(
    siteId
  ) {
    const site = await SiteModel.findById(siteId);
    if (!site) {
      throw new ApiError(500, "Site Does not exist");
    };

    const expandedMap = this.expandTaskMap(taskMap, site.level, site.landType, site);
    this.assignOrgAndSite(expandedMap, site.org, siteId);
    this.computeTimesForAllTasks(expandedMap, site.startDate);
    return this.createTasksFromMap(expandedMap);
  }

  assignOrgAndSite(taskMap, orgId, siteId) {
    for (const key in taskMap) {
      const t = taskMap[key];
      t.org = orgId;
      t.site = siteId;
    }
  }

  expandTaskMap(taskMap, numLevels, landType, site) {
    const expandedMap = {};
    const oneTimeTasks = [];
    const perLevelTasks = [];

    for (const key of Object.keys(taskMap)) {
      const tDef = taskMap[key];
      if (tDef.trigger === Triggers.ONE_TIME_FOR_EVERY_LEVEL) {
        perLevelTasks.push(tDef);
      } else if(tDef.trigger === Triggers.ONE_TIME) {
        oneTimeTasks.push(tDef);
      }
    }

    oneTimeTasks.forEach(origTask => {
      expandedMap[origTask.id] = {
        ...origTask,
        level: 0
      };
    });

    function makeLevelId(origId, floor) {
      return origId * 1000 + floor;
    }
    const basements = site.basements;
    perLevelTasks.forEach(origTask => {
      const origId = origTask.id;
      for (let level = 0; level <= numLevels; level++) {
        const newId = makeLevelId(origId, level);
        expandedMap[newId] = {
          ...origTask,
          id: newId,
          level: level
        };
      }
    });

    for (const key of Object.keys(expandedMap)) {
      const currentTask = expandedMap[key];
      const parentLevel = currentTask.level || 0;

      if (currentTask.subtasks && currentTask.subtasks.length > 0) {
        currentTask.subtasks = currentTask.subtasks.map(subId => {
          const subDef = taskMap[subId];
          if (!subDef) return subId;
          if (subDef.trigger === Triggers.ONE_TIME_FOR_EVERY_LEVEL) {
            return makeLevelId(subId, parentLevel);
          } else {
            return subId;
          }
        });
      }

      if (currentTask.nextTasks && currentTask.nextTasks.length > 0) {
        currentTask.nextTasks = currentTask.nextTasks.map(nId => {
          const nDef = taskMap[nId];
          if (!nDef) return nId;
          if (nDef.trigger === Triggers.ONE_TIME_FOR_EVERY_LEVEL) {
            return makeLevelId(nId, parentLevel);
          } else {
            return nId;
          }
        });
      }

      if (currentTask.parentTask) {
        const pId = currentTask.parentTask;
        const pDef = taskMap[pId];
        if (pDef && pDef.trigger === Triggers.ONE_TIME_FOR_EVERY_LEVEL) {
          currentTask.parentTask = makeLevelId(pId, parentLevel);
        }
      }
    }

    const DE_SHUTTERING_ORIG_ID = TaskIDs.DE_SHUTTERING_ORIG_ID;
    const WALLS_ORIG_ID = TaskIDs.WALLS_ORIG_ID;
    const FLOOR_WORK_ORIG_ID = TaskIDs.FLOOR_WORK_ORIG_ID;
    const ROOF_TASK_IDS = TaskIDs.ROOF_TASK_IDS;

    for (let level = 0; level <= numLevels; level++) {
      const deShutId = makeLevelId(DE_SHUTTERING_ORIG_ID, level);
      if (!expandedMap[deShutId]) continue;

      expandedMap[deShutId].nextTasks = [];

      const levelWorkId = makeLevelId(FLOOR_WORK_ORIG_ID, level);
      if (expandedMap[levelWorkId]) {
        expandedMap[deShutId].nextTasks.push(levelWorkId);
      }

      if (level < numLevels) {
        const nextWallsId = makeLevelId(WALLS_ORIG_ID, level + 1);
        if (expandedMap[nextWallsId]) {
          expandedMap[deShutId].nextTasks.push(nextWallsId);
        }
      } else {
        ROOF_TASK_IDS.forEach(rId => {
          if (expandedMap[rId]) {
            expandedMap[deShutId].nextTasks.push(rId);
          }
        });
      }
    }

    const CHOOSE_TYPE_OF_LAND = TaskIDs.CHOOSE_TYPE_OF_LAND;
    if (expandedMap[CHOOSE_TYPE_OF_LAND]) {
      const task2 = expandedMap[CHOOSE_TYPE_OF_LAND];
      let chosenId = null;
      if (landType === 'Raw') chosenId = TaskIDs.LAND_TYPES.RAW;
      else if (landType === 'Constructed') chosenId = TaskIDs.LAND_TYPES.CONSTRUCTED;
      else if (landType === 'Water') chosenId = TaskIDs.LAND_TYPES.WATER;

      if (chosenId && expandedMap[chosenId]) {
        task2.nextTasks = [chosenId];
      } else {
        task2.nextTasks = [];
      }
    }

    return expandedMap;
  }

  computeTimesForAllTasks(taskMap, projectStartDate) {
    const baseDate = projectStartDate ? new Date(projectStartDate) : new Date();
    const rootIds = TaskIDs.ROOT_IDS; // e.g. [1]
  
    for (const rId of rootIds) {
      // Pass a new visited set so each root is traversed fresh.
      this.assignTimes(taskMap, rId, 0, new Set());
      this.convertOffsetsToDates(taskMap, rId, baseDate, new Set());
    }
  }  

  assignTimes(taskMap, taskId, currentStart, visited = new Set()) {

    if (visited.has(taskId)) {
      return;
    }
    visited.add(taskId);
  
    const task = taskMap[taskId];
    if (!task) return;
  
    // Normal offset logic
    const dur = task.duration || 0;
    task.startOffset = currentStart;
    task.endOffset = currentStart + dur;
  
    // Subtasks get the same start/end offset
    if (task.subtasks && task.subtasks.length > 0) {
      for (const subId of task.subtasks) {
        const sub = taskMap[subId];
        if (!sub) continue;
        sub.startOffset = task.startOffset;
        sub.endOffset = task.endOffset;
      }
    }
  
    // Now, move on to nextTasks
    const nextStart = task.endOffset;
    if (task.nextTasks && task.nextTasks.length > 0) {
      for (const nId of task.nextTasks) {
        this.assignTimes(taskMap, nId, nextStart, visited);
      }
    }
  }
  

  convertOffsetsToDates(taskMap, taskId, baseDate, visited = new Set()) {
    if (visited.has(taskId)) return;
    visited.add(taskId);
  
    const task = taskMap[taskId];
    if (!task) return;
  
    // Convert numeric offsets to actual Dates
    if (typeof task.startOffset === 'number') {
      const sDate = new Date(baseDate);
      sDate.setDate(sDate.getDate() + task.startOffset);
      task.startTime = sDate;
    }
    if (typeof task.endOffset === 'number') {
      const eDate = new Date(baseDate);
      eDate.setDate(eDate.getDate() + task.endOffset);
      task.endTime = eDate;
    }
  
    // Recurse for subtasks
    if (Array.isArray(task.subtasks)) {
      for (const subId of task.subtasks) {
        this.convertOffsetsToDates(taskMap, subId, baseDate, visited);
      }
    }
  
    // Recurse for nextTasks
    if (Array.isArray(task.nextTasks)) {
      for (const nId of task.nextTasks) {
        this.convertOffsetsToDates(taskMap, nId, baseDate, visited);
      }
    }
  }  

  async createTasksFromMap(taskMap) {
    try {
      const tasksToCreate = [];
      for (const key in taskMap) {
        if (Object.prototype.hasOwnProperty.call(taskMap, key)) {
          const {
            id,
            subtasks,
            nextTasks,
            parentTask,
            tempId,
            startOffset,
            endOffset,
            startTime,
            endTime,
            ...restData
          } = taskMap[key];

          tasksToCreate.push({
            ...restData,
            tempId: id,
            startTime,
            endTime,
            subtasks: [],
            nextTasks: [],
            parentTask: null
          });
        }
      }

      const createdTasks = await this.model.insertMany(tasksToCreate, { ordered: false });

      const tempIdToObjectId = {};
      createdTasks.forEach(doc => {
        tempIdToObjectId[doc.tempId] = doc._id;
      });

      const bulkOps = [];
      for (const key in taskMap) {
        if (Object.prototype.hasOwnProperty.call(taskMap, key)) {
          const originalTask = taskMap[key];
          const updateData = {};

          if (originalTask.subtasks && originalTask.subtasks.length > 0) {
            updateData.subtasks = originalTask.subtasks
              .map(sId => tempIdToObjectId[sId])
              .filter(Boolean);
          }

          if (originalTask.nextTasks && originalTask.nextTasks.length > 0) {
            updateData.nextTasks = originalTask.nextTasks
              .map(nId => tempIdToObjectId[nId])
              .filter(Boolean);
          }

          if (originalTask.parentTask) {
            updateData.parentTask = tempIdToObjectId[originalTask.parentTask] || null;
          }

          if (Object.keys(updateData).length > 0) {
            bulkOps.push({
              updateOne: {
                filter: { tempId: parseInt(key, 10) },
                update: { $set: updateData }
              }
            });
          }
        }
      }

      if (bulkOps.length > 0) {
        await this.model.bulkWrite(bulkOps);
      }

      const populatedTasks = await this.model.find({
        tempId: { $in: Object.keys(taskMap).map(k => parseInt(k, 10)) }
      })
        .populate('subtasks', 'title status startTime endTime')
        .populate('assignedTo', 'name email')
        .populate('org', 'name')
        .populate('site', 'name');

      await this.model.updateMany(
        { tempId: { $in: Object.keys(taskMap).map(k => parseInt(k, 10)) } },
        { $unset: { tempId: '' } }
      );

      return {
        success: true,
        data: populatedTasks
      };
    } catch (err) {
      return {
        success: false,
        message: err.message
      };
    }
  }

  async canUpdateTask(taskId, desiredStatus) {
    // Fetch the task with necessary references
    const task = await this.model.findById(taskId)
      .populate('subtasks')
      .populate('nextTasks')
      .populate('parentTask')
      .exec();
  
    if (!task) {
      throw new ApiError(404, "Task not found");
    }
  
    // Validate desiredStatus using enum
    const statusValues = Object.values(TaskStatuses);
    if (!statusValues.includes(desiredStatus)) {
      throw new ApiError(400, "Invalid status value");
    }
  
  
    // Additional validation for COMPLETED status
    if (desiredStatus === TaskStatuses.COMPLETED) {
      // Check if all subtasks are completed
      if (task.subtasks && task.subtasks.length > 0) {
        const incompleteSubtasks = task.subtasks.filter(sub => sub.status !== TaskStatuses.COMPLETED);
        if (incompleteSubtasks.length > 0) {
          throw new ApiError(400, "Cannot complete this task until all subtasks are completed");
        }
      }
  
      // Check sequential dependencies
      if (task.parentTask) {
        const parent = await this.model.findById(task.parentTask)
          .populate({
            path: 'subtasks',
            options: { sort: { level: 1 } }, // Assuming 'level' defines the order
          })
          .exec();
  
        if (parent && parent.isParallel === false) { // Sequential Flow
          const taskIndex = parent.subtasks.findIndex(sub => sub._id.toString() === taskId);
          if (taskIndex > 0) { // Check preceding subtasks
            const precedingSubtasks = parent.subtasks.slice(0, taskIndex);
            const incompletePreceding = precedingSubtasks.filter(sub => sub.status !== TaskStatuses.COMPLETED);
            if (incompletePreceding.length > 0) {
              throw new ApiError(400, "Cannot complete this subtask until all preceding subtasks are completed");
            }
          }
        }
      }
      
    }
  
    return true; // All checks passed
  }

  async updateTaskStatus(taskId, newStatus, progressPercentage, attachments) {
    // Validate if the task can be updated
    await this.canUpdateTask(taskId, newStatus);
  
    // Fetch the task again to update
    const task = await this.model.findById(taskId)
      .populate('subtasks')
      .populate('nextTasks')
      .populate('parentTask')
      .exec();
  
    if (!task) {
      throw new ApiError(404, "Task not found");
    }

    //TODO: add attachments
    if (attachments?.length) {
      for (const file of attachments) {
          const attachment = await fileService.create({
              filename: file.originalname,
              type: file.mimetype,
              size: file.size,
              org: req.user.org,
              uploadedBy: req.user.userId, 
              url: `${process.env.BASE_URL}/api/v1/files/link/${file.id}`, 
          });
          task.attachments.push(attachment._id); 
      }
  }
  
    // Update status and progressPercentage based on your custom logic
    task.status = newStatus;
    if(progressPercentage){
      task.progressPercentage = progressPercentage;
    } else{

    
    switch (newStatus) {
      case TaskStatuses.PENDING:
      case TaskStatuses.OPEN:
        task.progressPercentage = 0;
        break;
      case TaskStatuses.IN_PROGRESS:
        task.progressPercentage = 0;
        break;
      case TaskStatuses.REVIEW:
        task.progressPercentage = 0;
        break;
      case TaskStatuses.COMPLETED:
        task.progressPercentage = 100;
        break;
      case TaskStatuses.NEVER:
        task.progressPercentage = 0; // Or some other logic
        break;
    }
    }
    // Save the updated task
    await task.save();
  
    // Handle transitions if task is completed
    if (newStatus === TaskStatuses.COMPLETED) {
      // Handle Next Tasks
      if (task.nextTasks && task.nextTasks.length > 0) {
        if (task.isParallel) {
          // Parallel Flow: Start all next tasks simultaneously
          await Promise.all(
            task.nextTasks.map(async (nextTask) => {
              if ([TaskStatuses.OPEN, TaskStatuses.PENDING].includes(nextTask.status)) {
                nextTask.status = TaskStatuses.IN_PROGRESS;
                nextTask.progressPercentage = 0; // optional
                //message status: started with next task
                nextTask.content=`We Have Started With ${nextTask.title}`
                //TODO: check this message function 
                const messageStatus=await messageService.taskStatusMessage(nextTask)
                const {messages} = await messageService.getFormattedMessage(messageStatus._id)
                emitMessage(messages[0], task.org.toString())
                await nextTask.save();
              }
            })
          );
        } else {
          // Sequential Flow: Start only the immediate next task
          const firstPending = task.nextTasks.find((t) =>
            [TaskStatuses.OPEN, TaskStatuses.PENDING].includes(t.status)
          );
          if (firstPending) {
            firstPending.status = TaskStatuses.IN_PROGRESS;
            firstPending.progressPercentage = 0; // optional
            await firstPending.save();
          }
        }
      }
    }
      task.content = `Task ${newStatus?.toLowerCase()?.replace(/_/g, ' ')?.replace(/\b\w/g, char => char?.toUpperCase())}: ${task.title}`
      const messageStatus=await messageService.taskStatusMessage(task)
      const {messages} = await messageService.getFormattedMessage(messageStatus._id)
      emitMessage(messages[0], task.org.toString())
    // Now, update the parent's progress, if a parent exists:
    if (task.parentTask) {
      await this.updateParentProgressRecursively(task.parentTask);
    }
  
    // Return the updated task with populated references
    const updatedTask = await this.model
      .findById(taskId)
      .populate('subtasks')
      .populate('nextTasks')
      .populate('parentTask')
      .exec();
  
    return {
      success: true,
      data: updatedTask,
    };
  }
  async findTasksBySite(siteId, filters) {
    const { search, status, ...otherFilters } = filters || {}; // Destructure search and status from filters

    // Build the query object
    const query = {
        site: siteId,
        ...otherFilters,
    };

    // Add search filter for title substring matching if provided
    if (search) {
        query.title = { $regex: search, $options: 'i' }; // Case-insensitive substring matching
    }

    // Add status filter if provided
    if (status) {
        query.status = status; // Match the exact status
    }

    // Execute the query with population
    return await this.model.find(query)
        .populate('subtasks', 'title status') // Populate subtasks with title and status fields
        .populate('assignedTo', 'name email') // Populate assignedTo with name and email fields
        .populate('createdBy', '_id name')    // Populate createdBy with _id and name fields
        .populate('org', 'name')             // Populate org with name field
        .populate('site', 'name');           // Populate site with name field
}
  
  async updateParentProgressRecursively(parentTaskId) {
    const parent = await this.model.findById(parentTaskId)
      .populate('subtasks')
      .populate('parentTask')
      .exec();
  
    if (!parent) {
      return;
    }
  
    if (!parent.subtasks || parent.subtasks.length === 0) {
      return; // No subtasks => nothing to update
    }
  
    // Check if ALL subtasks are completed
    const allSubtasksCompleted = parent.subtasks.every(
      (sub) => sub.status === TaskStatuses.COMPLETED
    );
  
    if (allSubtasksCompleted) {
      // If all are completed, set parent to COMPLETED and 100% progress
      parent.status = TaskStatuses.COMPLETED;
      parent.progressPercentage = 100;
      //message status for sub tasks completion under main task
      parent.content=`All SubTasks Completed Under ${parent.title}`
      const messageStatus=await messageService.taskStatusMessage(parent)
      const {messages} = await messageService.getFormattedMessage(messageStatus._id)
      emitMessage(messages[0], parent.org.toString())
    } else {
      // Otherwise, compute the average progress of subtasks
      let total = 0;
      parent.subtasks.forEach((sub) => {
        total += sub.progressPercentage || 0;
      });
      const averageProgress = total / parent.subtasks.length;
  
      // Set parent's status accordingly (here we assume IN_PROGRESS, but you can pick your logic)
      if (averageProgress > 0 && averageProgress < 100) {
        parent.status = TaskStatuses.IN_PROGRESS;
        //message status for the parent task in progress
        parent.content=`${parent.title} In Progress`
      const messageStatus=await messageService.taskStatusMessage(parent)
      const {messages} = await messageService.getFormattedMessage(messageStatus._id)
      emitMessage(messages[0], parent.org.toString())
      }
      // If you want to handle PENDING or REVIEW states differently, add logic here
      parent.progressPercentage = averageProgress;
    }
  
    // Save
    await parent.save();
  
    // If parent's parent exists, bubble up
    if (parent.parentTask) {
      await this.updateParentProgressRecursively(parent.parentTask);
    }
  }

  async addSubTask(parentTaskId, subTaskData) {
    try {
      // 1. Validate subTaskData
      if (!subTaskData || typeof subTaskData !== 'object') {
        throw new ApiError(400, "Invalid subTaskData provided");
      }
  
      // 2. Fetch the parent task WITHOUT .lean() to get a Mongoose document
      const parentTask = await this.model.findById(parentTaskId);
      if (!parentTask) {
        throw new ApiError(404, "Parent Task does not exist");
      }
    
      // 3. Assign necessary properties to subTaskData
      subTaskData.site = parentTask.site;
      subTaskData.org = parentTask.org;
      subTaskData.parentTask = parentTaskId;
  
      // 4. Create the new subtask
      const newSubtask = await this.model.create(subTaskData);
  
      // 5. Ensure the 'subtasks' array exists on the parent task
      if (!Array.isArray(parentTask.subtasks)) {
        parentTask.subtasks = [];
      }
  
      // 6. Add the new subtask's ID to the parent's subtasks
      parentTask.subtasks.push(newSubtask._id);
  
      // 7. Save the updated parent task
      await parentTask.save();
  
      return newSubtask;
    } catch (error) {
      console.error("Error adding subtask:", error);
      // Re-throw ApiError or wrap other errors appropriately
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "An unexpected error occurred while adding the subtask");
    }
  }
  

  async deleteSubtask(subTaskId) {
    try {
      // Find the parent task
      const subTask = await this.model.findById(subTaskId);
      if (!subTask) {
        throw new ApiError(404, "Sub Task does not exist");
      }
      const parentTaskId = subTask.parentTask;
      const parentTask = await this.model.findById(parentTaskId);
      if (!subTask) {
        throw new ApiError(404, "Parent Task does not exist");
      }
      // Remove the subtask from the subtasks array
      parentTask.subtasks = parentTask.subtasks.filter(
        (task) => task.toString() !== subTaskId
      );

      // Save the updated parent task
      const updatedTask = await parentTask.save();

      // Optionally delete the subtask itself
      await this.model.findByIdAndDelete(subTaskId);

      return updatedTask;
    } catch (error) {
      console.error("Error deleting subtask:", error);
      throw new ApiError(500, "An unexpected error occurred while deleting the subtask");
    }
  }

  async getSubTasks(parentTaskId) {
    try {
      // Find the parent task
      const parentTask = await Task.findById(parentTaskId).populate('subtasks');

      // Check if the parent task exists
      if (!parentTask) {
        throw new ApiError(404, "Parent Task does not exist");
      }

      // Check if there are subtasks
      if (!parentTask.subtasks || parentTask.subtasks.length === 0) {
        return { message: "No subtasks found", subtasks: [] };
      }

      // Return subtasks
      return parentTask.subtasks;
    } catch (error) {
      // Log and throw unexpected errors
      console.error("Error fetching subtasks:", error);
      throw new ApiError(500, "An unexpected error occurred while fetching subtasks");
    }
  }

  async findFilteredTasks(filters) {
    const tasks = await this.model.find(filters)
      .populate('site', 'name')
      .populate('createdBy', '_id name');
    return tasks
  }
}

module.exports = new TaskService();
