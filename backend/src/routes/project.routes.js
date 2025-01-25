const express = require('express');
const router = express.Router();
const { createProject, getAllProjects, getProjectById, updateProject, deleteProject, getAllProjectFiles, deleteProjectFiles, downloadProjectFile, uploadProjectFiles } = require('../controller/project.controller');
const { projectValidator } = require('../utils/validators/project.validator');
const upload = require('../utils/file-upload/file-upload');

router.post('/', projectValidator, createProject);
router.get('/', getAllProjects);
router.get('/:id', getProjectById);
router.put('/:id', projectValidator, updateProject);
router.delete('/:id', deleteProject);

router.post('/:id/files', upload.array('files', 10), uploadProjectFiles)
router.get('/:id/files', getAllProjectFiles);
router.delete('/:id/files', deleteProjectFiles);
router.get('/:id/files/:filename', downloadProjectFile)

module.exports = router;