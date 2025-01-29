const express = require('express');
const router = express.Router();
const { createProject, getAllProjects, getProjectById, updateProject, deleteProject, getAllProjectFiles, deleteProjectFiles, downloadProjectFile, uploadProjectFiles , updatePost} = require('../controller/project.controller');
const { projectValidator } = require('../utils/validators/project.validator');
const upload = require('../utils/file-upload/file-upload');
const taskRoutes = require('./task.routes'); // Import task routes
const { userAuthorize } = require('../middleware/auth.middleware');

router.post('/', userAuthorize, projectValidator, createProject);
router.put('/', updatePost);
router.get('/', getAllProjects);
router.get('/:id', userAuthorize, getProjectById);
router.put('/:id', projectValidator, updateProject);
router.delete('/:id', deleteProject);

router.post('/:id/files', userAuthorize,upload.array('files', 10), uploadProjectFiles)
router.get('/:id/files', userAuthorize, getAllProjectFiles);
router.delete('/:id/files', userAuthorize,deleteProjectFiles);
router.get('/:id/files/:filename', userAuthorize,downloadProjectFile)

// Mount task routes under /projects
router.use('/', taskRoutes);

module.exports = router;