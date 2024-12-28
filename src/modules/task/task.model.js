const mongoose = require('mongoose');
const extendSchema = require('../base/BaseModel');
const { TaskStatuses, TaskPriorities, TaskTypes, TaskDepartments, TriggerTask } = require('../../utils/enums'); // Enums
const { type } = require('os');

// Define Task-specific fields
const taskFields = {
    title: { type: String,  }, // Task title
    description: { type: String, default: null }, // Task description
    startDate: { type: Date,  }, // Task start date
    endDate: { type: Date,  }, // Task end date
    status: { type: String, enum: TaskStatuses,  }, // Task status
    subtasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: [] }], // Subtasks references
    nextTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: [] }], // Subtasks references
    parentTask: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null }, // Parent task reference
    progressPercentage: { type: Number, default: 0 }, // Progress percentage
    isSystemGenerated: { type: Boolean,  default: false }, // System-generated task flag
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }], // Users assigned to the task
    org: { type: mongoose.Schema.Types.ObjectId, ref: 'Org',  }, // Organization reference
    site: { type: mongoose.Schema.Types.ObjectId, ref: 'Site',  }, // Site reference
    priority: { type: String, enum: TaskPriorities,  }, // Task priority
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Creator of the task
    attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File', default: [] }], // File attachments
    changeHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: [] }], // History of task changes
    type: { type: String, enum: TaskTypes,  }, // Task type
    raisedByDept: { type: String, enum: TaskDepartments,  }, // Department that raised the task
    raisedToDept: { type: String, enum: TaskDepartments,  }, // Department to which the task is assigned
    penalty: { type: mongoose.Schema.Types.ObjectId, ref: 'Penalty', default: null }, // Reference to penalty
    isParallel: { type: Boolean, default: false }, // Determines parallel or sequential
    level: { type: Number },
    floor: { type: Number }, 
    trigger: { type:String, enum: TriggerTask}
};

// Create the extended schema with timestamps
const taskSchema = extendSchema(taskFields, { timestamps: true });

// Create and export the Mongoose model
const TaskModel = mongoose.model('Task', taskSchema);

module.exports = TaskModel;
