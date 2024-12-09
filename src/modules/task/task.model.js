const mongoose = require('mongoose');
const extendSchema = require('../base/BaseModel');
const { TaskStatuses, TaskPriorities } = require('../../utils/enums'); // Enums for status and priority

// Define Task-specific fields
const taskFields = {
    title: { type: String, required: true },
    description: { type: String, default: null },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: TaskStatuses, required: true }, // Enum for statuses
    subtasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: [] }], // Array of Task references
    progressPercentage: { type: Number, default: 0 }, // Float percentage
    isSystemGenerated: { type: Boolean, required: true },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }], // Array of User references
    org: { type: mongoose.Schema.Types.ObjectId, ref: 'Org', required: true }, // Reference to Org
    site: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true }, // Reference to Site
    priority: { type: String, enum: TaskPriorities, required: true }, // Enum for priorities
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Reference to User
};

// Create the extended schema
const taskSchema = extendSchema(taskFields);

// Create and export the Mongoose model
const TaskModel = mongoose.model('Task', taskSchema);

module.exports = TaskModel;
