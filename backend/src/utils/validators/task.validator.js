const { body } = require('express-validator');

const taskValidator = [
 body('title').notEmpty().withMessage('Title is required'),
 body('assignee').notEmpty().withMessage('Assignee is required'),
 body('status').isIn(['Not Started', 'In Progress', 'Completed']).withMessage('Invalid status'),
 body('deadline').isISO8601().toDate().withMessage('Invalid deadline')
]
module.exports = { taskValidator }