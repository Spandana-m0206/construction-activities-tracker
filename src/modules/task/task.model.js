const mongoose = require('mongoose');
const extendSchema = require('../base/BaseModel');
const { TaskStatuses, TaskPriorities, TaskTypes, TaskDepartments, TriggerTask } = require('../../utils/enums'); // Enums
const enumToArray = require('../../utils/EnumToArray');

// Define Task-specific fields
const taskFields = {
    title: { type: String, required:true }, // Task title
    description: { type: String, default: null }, // Task description
    startTime: { type: Date, required:true }, // Task start date
    endTime: { type: Date,  required:true}, // Task end date
    status: { type: String, enum: enumToArray(TaskStatuses), required:true, default: "UPCOMING"}, // Task status
    subtasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: [] }], // Subtasks references
    nextTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: [] }], // Subtasks references
    parentTask: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null }, // Parent task reference
    progressPercentage: { type: Number, default: 0 }, // Progress percentage
    isSystemGenerated: { type: Boolean, required:true, default: true }, // System-generated task flag
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }], // Users assigned to the task
    org: { type: mongoose.Schema.Types.ObjectId, ref: 'Org', required:true }, // Organization reference
    site: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required:true }, // Site reference
    priority: { type: String, enum: enumToArray(TaskPriorities),  }, // Task priority
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Creator of the task
    attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File', default: [] }], // File attachments
    changeHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: [] }], // History of task changes
    type: { type: String, enum: TaskTypes,  }, // Task type
    raisedByDept: { type: String, enum: enumToArray(TaskDepartments),  required:true, default:"Site" }, // TODO Department that raised the task
    raisedToDept: { type: String, enum: enumToArray(TaskDepartments), required:true }, // Department to which the task is assigned
    penalty: { type: mongoose.Schema.Types.ObjectId, ref: 'Penalty', default: null }, // Reference to penalty
    isParallel: { type: Boolean, default: false }, // Determines parallel or sequential
    level: { type: Number },
    floor: { type: Number }, 
    tempId: { type: Number }, // Temporary ID for mapping
    trigger: { type:String, enum: enumToArray(TriggerTask)}
};

// Create the extended schema with timestamps
const taskSchema = extendSchema(taskFields, { timestamps: true });

// Create and export the Mongoose model
const TaskModel = mongoose.model('Task', taskSchema);

module.exports = TaskModel;
