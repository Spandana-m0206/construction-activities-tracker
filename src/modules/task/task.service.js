const ApiError = require('../../utils/apiError');
const { TaskStatuses } = require('../../utils/enums');
const taskMap = require('../../utils/taskMap');
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

    const expandedMap = this.expandTaskMap(taskMap, site.level, site.landType);
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

  expandTaskMap(taskMap, numLevels, landType) {
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
        level: 0
      };
    });

    function makeLevelId(origId, floor) {
      return origId * 1000 + floor;
    }

    perLevelTasks.forEach(origTask => {
      const origId = origTask.id;
      for (let level = 0; level < numLevels; level++) {
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

    const DE_SHUTTERING_ORIG_ID = 36;
    const WALLS_ORIG_ID = 27;
    const FLOOR_WORK_ORIG_ID = 127;
    const ROOF_TASK_IDS = [91, 92];

    for (let level = 0; level < numLevels; level++) {
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

    const LAND_TASK_ID = 2;
    if (expandedMap[LAND_TASK_ID]) {
      const task2 = expandedMap[LAND_TASK_ID];
      let chosenId = null;
      if (landType === 'Raw') chosenId = 3;
      else if (landType === 'Constructed') chosenId = 4;
      else if (landType === 'Water') chosenId = 5;

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

    // Validate desiredStatus
    if (!TaskStatuses.includes(desiredStatus)) {
      throw new ApiError(400, "Invalid status value");
    }

    // Prevent invalid status transitions (e.g., from COMPLETED back to IN_PROGRESS)
    const statusOrder = {
      'PENDING': 1,
      'IN_PROGRESS': 2,
      'COMPLETED': 3,
      // Add other statuses as needed
    };

    if (statusOrder[desiredStatus] < statusOrder[task.status]) {
      throw new ApiError(400, "Cannot move to a previous status");
    }

    // If updating to COMPLETED, perform additional checks
    if (desiredStatus === 'COMPLETED') {
      // 1. If it's a parent task, ensure all subtasks are completed
      if (task.subtasks && task.subtasks.length > 0) {
        const incompleteSubtasks = task.subtasks.filter(sub => sub.status !== 'COMPLETED');
        if (incompleteSubtasks.length > 0) {
          throw new ApiError(400, "Cannot complete this task until all subtasks are completed");
        }
      }

      // 2. If it's a subtask, ensure preceding subtasks are completed (for sequential flows)
      if (task.parentTask) {
        const parent = await this.model.findById(task.parentTask)
          .populate({
            path: 'subtasks',
            options: { sort: { level: 1 } } // Assuming 'level' defines the order
          })
          .exec();

        if (parent && parent.isParallel === false) { // Sequential Flow
          const taskIndex = parent.subtasks.findIndex(sub => sub._id.toString() === taskId);
          if (taskIndex > 0) { // If not the first subtask
            const precedingSubtasks = parent.subtasks.slice(0, taskIndex);
            const incompletePreceding = precedingSubtasks.filter(sub => sub.status !== 'COMPLETED');
            if (incompletePreceding.length > 0) {
              throw new ApiError(400, "Cannot complete this subtask until all preceding subtasks are completed");
            }
          }
        }
      }

      // 3. Additional Checks (Other Cases)
      // Example: Ensure no dependencies are blocking this task
      // Implement as needed based on your task relationships
    }

    // Additional validations can be added here (e.g., deadlines, dependencies)

    return true; // All checks passed
  }

  /**
   * Updates the status of a task after validating it can be updated.
   * @param {String} taskId - The ID of the task to update.
   * @param {String} newStatus - The new status to set.
   * @returns {Object} - The updated task.
   */
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

    // Update progressPercentage based on status
    switch (newStatus) {
      case 'open':
      case 'PENDING':
        task.progressPercentage = 0;
        break;
      case 'IN_PROGRESS':
        task.progressPercentage = 50;
        break;
      case 'REVIEW':
        task.progressPercentage = 75;
        break;
      case 'COMPLETED':
        task.progressPercentage = 100;
        break;
      case 'never':
        // Define behavior for 'never' if applicable
        break;
      default:
        break;
    }

    // Save the updated task
    await task.save();

    // Handle transitions if task is completed
    if (newStatus === 'COMPLETED') {
      // Handle Next Tasks
      if (task.nextTasks && task.nextTasks.length > 0) {
        if (task.isParallel) {
          // Parallel Flow: Start all next tasks simultaneously
          await Promise.all(task.nextTasks.map(async (nextTask) => {
            if (nextTask.status === 'open' || nextTask.status === 'PENDING') {
              nextTask.status = 'IN_PROGRESS';
              // Note: Do not modify startTime and endTime as per instructions
              await nextTask.save();
            }
          }));
        } else {
          // Sequential Flow: Start only the immediate next task
          const firstPending = task.nextTasks.find(t => t.status === 'open' || t.status === 'PENDING');
          if (firstPending) {
            firstPending.status = 'IN_PROGRESS';
            // Note: Do not modify startTime and endTime as per instructions
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
          const allSubtasksCompleted = parent.subtasks.every(sub => sub.status === 'COMPLETED');
          if (allSubtasksCompleted && parent.status !== 'COMPLETED') {
            parent.status = 'COMPLETED';
            parent.progressPercentage = 100;
            await parent.save();

            // Optionally, handle parent's next tasks
            if (parent.nextTasks && parent.nextTasks.length > 0) {
              if (parent.isParallel) {
                // Parallel Flow
                await Promise.all(parent.nextTasks.map(async (nextTask) => {
                  if (nextTask.status === 'open' || nextTask.status === 'PENDING') {
                    nextTask.status = 'IN_PROGRESS';
                    // Note: Do not modify startTime and endTime as per instructions
                    await nextTask.save();
                  }
                }));
              } else {
                // Sequential Flow
                const firstPendingParentNext = parent.nextTasks.find(t => t.status === 'open' || t.status === 'PENDING');
                if (firstPendingParentNext) {
                  firstPendingParentNext.status = 'IN_PROGRESS';
                  // Note: Do not modify startTime and endTime as per instructions
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
      data: updatedTask
    };
  }
}

module.exports = new TaskService();
