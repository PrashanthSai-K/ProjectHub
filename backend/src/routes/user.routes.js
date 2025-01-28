const express = require('express');
const userController = require('../controller/user.controller.js');
const userValidator = require('../utils/validators/user.validator.js');

const router = express.Router();

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post(
    '/',
    userValidator.createUser,
    userValidator.validate,
    userController.createUser
);
router.put(
    '/:id',
    userValidator.updateUser,
    userValidator.validate,
    userController.updateUser
);
router.delete('/:id', userController.deleteUser);

module.exports = router;