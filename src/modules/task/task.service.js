const ApiError = require('../../utils/apiError');
const { TaskStatuses, StatusOrder } = require('../../utils/enums');
const {taskMap, TaskIDs} = require('../../utils/taskMap');
const BaseService = require('../base/BaseService');
const SiteModel = require('../site/site.model');
const Task = require('./task.model');

class TaskService extends BaseService {
  constructor() {
    super(Task);
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
    return this.createTasksFromMap(expandedMap, site.landType, site.level);
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
      if (tDef.trigger === 'ONE_TIME_FOR_EVERY_LEVEL') {
        perLevelTasks.push(tDef);
      } else if(tDef.trigger === 'ONE_TIME') {
        oneTimeTasks.push(tDef);
      }
    }

    oneTimeTasks.forEach(origTask => {
      expandedMap[origTask.id] = {
        ...origTask,
        level: -9999
      };
    });

    function makeLevelId(origId, floor) {
      return origId * 1000 + floor;
    }
    const basements = site.basements;
    perLevelTasks.forEach(origTask => {
      const origId = origTask.id;
      for (let level = -basements; level < numLevels; level++) {
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
          if (subDef.trigger === 'ONE_TIME_FOR_EVERY_LEVEL') {
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
          if (nDef.trigger === 'ONE_TIME_FOR_EVERY_LEVEL') {
            return makeLevelId(nId, parentFloor);
          } else {
            return nId;
          }
        });
      }

      if (currentTask.parentTask) {
        const pId = currentTask.parentTask;
        const pDef = taskMap[pId];
        if (pDef && pDef.trigger === 'ONE_TIME_FOR_EVERY_LEVEL') {
          currentTask.parentTask = makeLevelId(pId, parentFloor);
        }
      }
    }

    for (let level = 0; level < numLevels; level++) {
      const deShutId = makeLevelId(TaskIDs.DE_SHUTTERING_ORIG_ID, level);
      if (!expandedMap[deShutId]) continue;

      expandedMap[deShutId].nextTasks = [];

      const levelWorkId = makeLevelId(TaskIDs.FLOOR_WORK_ORIG_ID, level);
      if (expandedMap[levelWorkId]) {
        expandedMap[deShutId].nextTasks.push(levelWorkId);
      }

      if (level < numLevels) {
        const nextWallsId = makeLevelId(TaskIDs.WALLS_ORIG_ID, level + 1);
        if (expandedMap[nextWallsId]) {
          expandedMap[deShutId].nextTasks.push(nextWallsId);
        }
      } else {
        TaskIDs.ROOF_TASK_IDS.forEach(rId => {
          if (expandedMap[rId]) {
            expandedMap[deShutId].nextTasks.push(rId);
          }
        });
      }
    }

    if (expandedMap[LAND_TASK_ID]) {
      const task2 = expandedMap[TaskIDs.CHOOSE_TYPE_OF_LAND];
      let chosenId = null;
      if (landType === 'Raw') chosenId = TaskIDs.LAND_TYPES.RAW;
      else if (landType === 'Constructed') TaskIDs.LAND_TYPES.CONSTRUCTED
      else if (landType === 'Water') TaskIDs.LAND_TYPES.WATER

      if (chosenId && expandedMap[chosenId]) {
        task2.nextTasks = [chosenId];
      } else {
        task2.nextTasks = [];
      }
    }

    return expandedMap;
  }

  computeTimesForAllTasks(taskMap, projectStartDate) {
    const rootIds = ['1']
    const baseDate = projectStartDate ? new Date(projectStartDate) : new Date();

    for (const rId of rootIds) {
      this.assignTimes(taskMap, rId, 0);
      this.convertOffsetsToDates(taskMap, rId, baseDate);
    }
  }

  assignTimes(taskMap, taskId, currentStart) {
    const task = taskMap[taskId];
    if (!task) return;

    let dur = task.duration || 0;
    task.startOffset = currentStart;
    task.endOffset = currentStart + dur;

    if (task.subtasks && task.subtasks.length > 0) {
      for (const subId of task.subtasks) {
        const sub = taskMap[subId];
        if (!sub) continue;
        sub.startOffset = task.startOffset;
        sub.endOffset = task.endOffset;
      }
    }

    const nextStart = task.endOffset;
    if (task.nextTasks && task.nextTasks.length > 0) {
      for (const nId of task.nextTasks) {
        this.assignTimes(taskMap, nId, nextStart);
      }
    }
  }

  convertOffsetsToDates(taskMap, taskId, baseDate) {
    const task = taskMap[taskId];
    if (!task) return;

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

    if (task.subtasks && task.subtasks.length > 0) {
      for (const subId of task.subtasks) {
        this.convertOffsetsToDates(taskMap, subId, baseDate);
      }
    }
    if (task.nextTasks && task.nextTasks.length > 0) {
      for (const nId of task.nextTasks) {
        this.convertOffsetsToDates(taskMap, nId, baseDate);
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
        .populate('subtasks', 'title status startDate endDate')
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
  
    // Prevent invalid status transitions (e.g., from COMPLETED back to IN_PROGRESS)
    if (StatusOrder[desiredStatus] < StatusOrder[task.status]) {
      throw new ApiError(400, "Cannot move to a previous status");
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

  async updateTaskStatus(taskId, newStatus) {
    // Validate if the task can be updated
    await this.canUpdateTask(taskId, newStatus);
  
    // Fetch the task again to update
    const task = await this.model.findById(taskId)
      .populate('subtasks')
      .populate('nextTasks')
      .populate('parentTask')
      .exec();
  
    // Update status and progressPercentage
    task.status = newStatus;
  
    // Update progressPercentage based on status using enums
    switch (newStatus) {
      case TaskStatuses.PENDING:
      case TaskStatuses.OPEN:
        task.progressPercentage = 0;
        break;
      case TaskStatuses.IN_PROGRESS:
        task.progressPercentage = 50;
        break;
      case TaskStatuses.REVIEW:
        task.progressPercentage = 75;
        break;
      case TaskStatuses.COMPLETED:
        task.progressPercentage = 100;
        break;
      case TaskStatuses.NEVER:
        task.progressPercentage = 0; // Define specific behavior if required
        break;
    }
  
    // Save the updated task
    await task.save();
  
    // Handle transitions if task is completed
    if (newStatus === TaskStatuses.COMPLETED) {
      // Handle Next Tasks
      if (task.nextTasks && task.nextTasks.length > 0) {
        if (task.isParallel) {
          // Parallel Flow: Start all next tasks simultaneously
          await Promise.all(task.nextTasks.map(async (nextTask) => {
            if ([TaskStatuses.OPEN, TaskStatuses.PENDING].includes(nextTask.status)) {
              nextTask.status = TaskStatuses.IN_PROGRESS;
              await nextTask.save();
            }
          }));
        } else {
          // Sequential Flow: Start only the immediate next task
          const firstPending = task.nextTasks.find(t =>
            [TaskStatuses.OPEN, TaskStatuses.PENDING].includes(t.status)
          );
          if (firstPending) {
            firstPending.status = TaskStatuses.IN_PROGRESS;
            await firstPending.save();
          }
        }
      }
  
      // Handle Parent Task Completion
      if (task.parentTask) {
        const parent = await this.model.findById(task.parentTask)
          .populate('subtasks')
          .exec();
  
        if (parent) {
          const allSubtasksCompleted = parent.subtasks.every(sub => sub.status === TaskStatuses.COMPLETED);
          if (allSubtasksCompleted && parent.status !== TaskStatuses.COMPLETED) {
            parent.status = TaskStatuses.COMPLETED;
            parent.progressPercentage = 100;
            await parent.save();
  
            if (parent.nextTasks && parent.nextTasks.length > 0) {
              if (parent.isParallel) {
                await Promise.all(parent.nextTasks.map(async (nextTask) => {
                  if ([TaskStatuses.OPEN, TaskStatuses.PENDING].includes(nextTask.status)) {
                    nextTask.status = TaskStatuses.IN_PROGRESS;
                    await nextTask.save();
                  }
                }));
              } else {
                const firstPendingParentNext = parent.nextTasks.find(t =>
                  [TaskStatuses.OPEN, TaskStatuses.PENDING].includes(t.status)
                );
                if (firstPendingParentNext) {
                  firstPendingParentNext.status = TaskStatuses.IN_PROGRESS;
                  await firstPendingParentNext.save();
                }
              }
            }
          }
        }
      }
    }
  
    // Return the updated task with populated references
    const updatedTask = await this.model.findById(taskId)
      .populate('subtasks')
      .populate('nextTasks')
      .populate('parentTask')
      .exec();
  
    return {
      success: true,
      data: updatedTask,
    };
  }
  
  async addSubTask(parentTaskId, subTaskData) {

    try {
      const parentTask = await Task.findById(parentTaskId);
      if (!parentTaskId) {
        throw new ApiError(404, "Parent Task does not exist");
      }
      subTaskData.site = parentTask.site;
      subTaskData.org = parentTask.org;
      subTaskData.parentTask = parentTaskId;

      const newSubtask = await Task.create(subTaskData);

      parentTask.subtasks.push(newSubtask._id);

      await parentTask.save();

      return newSubtask;
    } catch (error) {
      console.error("Error adding subtask:", error);
      throw new ApiError(500, "An unexpected error occurred while adding the subtask");
    }
  }

  async deleteSubtask(parentTaskId, subtaskId) {
    try {
      // Find the parent task
      const parentTask = await Task.findById(parentTaskId);
      if (!parentTask) {
        throw new ApiError(404, "Parent Task does not exist");
      }

      // Check if the subtask exists in the parent task's subtasks array
      if (!parentTask.subtasks.includes(subtaskId)) {
        throw new ApiError(404, "Sub Task does not exist");
      }

      // Remove the subtask from the subtasks array
      parentTask.subtasks = parentTask.subtasks.filter(
        (task) => task.toString() !== subtaskId
      );

      // Save the updated parent task
      const updatedTask = await parentTask.save();

      // Optionally delete the subtask itself
      await TaskModel.findByIdAndDelete(subtaskId);

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
}

module.exports = new TaskService();
