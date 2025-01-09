// task.routes.js

const express = require('express');
const TaskController = require('./task.controller');

const router = express.Router();

// Inherited CRUD endpoints from BaseController
router.post('/', TaskController.create.bind(TaskController));    // Create Task
router.get('/', TaskController.find.bind(TaskController));       // Get all Tasks
router.get('/:id', TaskController.findOne.bind(TaskController)); // Get one Task
router.put('/:id', TaskController.update.bind(TaskController));  // Update Task
router.delete('/:id', TaskController.delete.bind(TaskController)); // Delete Task

// Custom endpoints
router.post('/add-subtask/:parentTaskId', TaskController.addSubTask.bind(TaskController)); 
router.get('/get-subtasks/:parentTaskId', TaskController.getSubTasks.bind(TaskController)); 
router.delete('/delete-subtask/:subTaskId', TaskController.deleteSubtask.bind(TaskController)); 
router.get('/site/:siteId', TaskController.getTasksBySite.bind(TaskController)); 
router.post('/update-status/:taskId', TaskController.updateTask.bind(TaskController)); 
router.get('/site-tasks/count', TaskController.getTaskCountForSite.bind(TaskController));

module.exports = router;
