//routes/chat.routes.js

const express = require('express');
const router = express.Router();
const chatController = require('../controller/chat.controller');

router.get('/:projectId', chatController.getProjectChats);
router.post('/:projectId', chatController.createChatMessage)

module.exports = router;