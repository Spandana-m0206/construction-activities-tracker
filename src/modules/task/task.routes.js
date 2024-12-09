const express = require('express');
const TaskController = require('./task.controller');

const router = express.Router();

// Base routes from BaseController
router.post('/', TaskController.create.bind(TaskController)); // Create task
router.get('/', TaskController.find.bind(TaskController)); // Get all tasks
router.get('/:id', TaskController.findOne.bind(TaskController)); // Get task by ID
router.put('/:id', TaskController.update.bind(TaskController)); // Update task
router.delete('/:id', TaskController.delete.bind(TaskController)); // Delete task

// Custom route: Get tasks by site
router.get('/site/:siteId', TaskController.getTasksBySite.bind(TaskController)); // Find tasks by site

module.exports = router;
