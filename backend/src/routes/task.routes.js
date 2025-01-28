const express = require('express');
const router = express.Router();
const { createTask, getTasksByProjectId, updateTask, deleteTask } = require('../controller/task.controller');
const { taskValidator } = require('../utils/validators/task.validator')

// Task Management Routes
router.post('/:projectId/tasks', taskValidator, createTask);
router.get('/:projectId/tasks', getTasksByProjectId);
router.put('/tasks/:id', taskValidator, updateTask);
router.delete('/tasks/:id', deleteTask)


module.exports = router;