const express = require('express');
const router = express.Router();
const explore = require('../controller/explore.controller');

router.get('/', explore.getProjectDetails);

router.put('/:id', explore.updateProjectNeedMember);


module.exports = router;