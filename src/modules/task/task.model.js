const mongoose = require('mongoose');
const extendSchema = require('../base/BaseModel');
const { TaskStatuses, TaskPriorities, TaskTypes, TaskDepartments } = require('../../utils/enums'); // Enums

// Define Task-specific fields
const taskFields = {
    title: { type: String, required: true }, // Task title
    description: { type: String, default: null }, // Task description
    startDate: { type: Date, required: true }, // Task start date
    endDate: { type: Date, required: true }, // Task end date
    status: { type: String, enum: TaskStatuses, required: true }, // Task status
    subtasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: [] }], // Subtasks references
    // dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: [] }], // Dependencies for sequential tasks
    parentTask: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null }, // Parent task reference
    progressPercentage: { type: Number, default: 0 }, // Progress percentage
    isSystemGenerated: { type: Boolean, required: true, default: false }, // System-generated task flag
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }], // Users assigned to the task
    org: { type: mongoose.Schema.Types.ObjectId, ref: 'Org', required: true }, // Organization reference
    site: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true }, // Site reference
    priority: { type: String, enum: TaskPriorities, required: true }, // Task priority
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Creator of the task
    attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File', default: [] }], // File attachments
    changeHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: [] }], // History of task changes
    type: { type: String, enum: TaskTypes, required: true }, // Task type
    raisedByDept: { type: String, enum: TaskDepartments, required: true }, // Department that raised the task
    raisedToDept: { type: String, enum: TaskDepartments, required: true }, // Department to which the task is assigned
    penalty: { type: mongoose.Schema.Types.ObjectId, ref: 'Penalty', default: null }, // Reference to penalty
    isParallel: { type: Boolean, default: false }, // Determines parallel or sequential
    // level: { type: Number, default: 0 }, // Task hierarchy level
};

// Create the extended schema with timestamps
const taskSchema = extendSchema(taskFields, { timestamps: true });

// Create and export the Mongoose model
const TaskModel = mongoose.model('Task', taskSchema);

module.exports = TaskModel;
