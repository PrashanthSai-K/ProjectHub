const express = require('express');
const router = express.Router();
const { getCalendarEvents } = require('../controller/calendar.controller');
const { userAuthorize } = require('../middleware/auth.middleware');

router.get('/', userAuthorize, getCalendarEvents);

module.exports = router;