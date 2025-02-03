const express = require('express');
const router = express.Router();
const { createProject, getAllProjects, getProjectById, updateProject, deleteProject, getAllProjectFiles, deleteProjectFiles, downloadProjectFile, uploadProjectFiles, updatePost, getAllProjectsAdmin, getProjectByIdAdmin, updateProjectAdmin, getAllProjectFilesAdmin, getProjectMetrics } = require('../controller/project.controller');
const { projectValidator } = require('../utils/validators/project.validator');
const upload = require('../utils/file-upload/file-upload');
const taskRoutes = require('./task.routes'); // Import task routes
const { userAuthorize, adminAuthorize } = require('../middleware/auth.middleware');

router.post('/', userAuthorize, projectValidator, createProject);
router.put('/', updatePost);
router.get('/', getAllProjects);
router.get("/admin", adminAuthorize, getAllProjectsAdmin);
router.get('/:id', userAuthorize, getProjectById);
router.get('/:id/admin', adminAuthorize, getProjectByIdAdmin);
router.put('/:id', userAuthorize, projectValidator, updateProject);
router.put('/:id/admin', adminAuthorize, projectValidator, updateProjectAdmin);
router.delete('/:id', deleteProject);

router.post('/:id/files', userAuthorize, upload.array('files', 10), uploadProjectFiles)
router.get('/:id/files', userAuthorize, getAllProjectFiles);
router.get('/:id/files/admin', adminAuthorize, getAllProjectFilesAdmin);
router.delete('/:id/files', userAuthorize, deleteProjectFiles);
router.get('/:id/files/:filename', userAuthorize, downloadProjectFile)

router.get('/:id/metrics', adminAuthorize, getProjectMetrics);
// Mount task routes under /projects
router.use('/', taskRoutes);

module.exports = router;