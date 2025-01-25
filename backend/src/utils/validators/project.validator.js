const { body } = require('express-validator');

const projectValidator = [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('department').notEmpty().withMessage('Department is required'),
    body('startDate').notEmpty().withMessage('Start date is required').isDate().withMessage("Start date is invalid date"),
    body('endDate').notEmpty().withMessage('End date is required').isDate().withMessage("End date is invalid date"),
    body('priority').notEmpty().withMessage('Priority is required').isIn(['Low', 'Medium', 'High']).withMessage("Priority is not valid"),
    body('teamMembers').isArray().withMessage("Team members should be an array"),
    body('budget').optional().isNumeric().withMessage("Budget must be a number"),
    body('status').optional().isIn(['Not Started', 'In Progress', 'Completed']).withMessage("Status is not valid")
];

module.exports = {
    projectValidator
}