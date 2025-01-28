const { body, validationResult } = require('express-validator');

const userValidator = {
    createUser: [
        body('name').notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Invalid email format'),
        body('role').isIn(['admin', 'editor', 'user']).withMessage('Invalid role'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    ],
    updateUser: [
      body('name').optional().notEmpty().withMessage('Name cannot be empty'),
        body('email').optional().isEmail().withMessage('Invalid email format'),
        body('role').optional().isIn(['admin', 'editor', 'user']).withMessage('Invalid role'),
         body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    ],
      validate: (req, res, next) => {
        const errors = validationResult(req);
        console.log(errors);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      },
};

module.exports =  userValidator;