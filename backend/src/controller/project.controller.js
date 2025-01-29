const { validationResult } = require('express-validator');
const sequelize = require('../../config/database');
const path = require('path');
const fs = require('fs').promises;

// Utility function to check user permissions
const hasProjectAccess = (project, userId) => {
    if (!project || !userId) return false;
    const parsedTeamMembers = JSON.parse(project.team_members || '[]');

    return project.user_id === parseInt(userId) || parsedTeamMembers.includes(`${userId}`);
};

const createProject = async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { title, description, department, startDate, endDate, priority, teamMembers, budget, status, milestones } = req.body;
    const user_id = req.user.id;
console.log(milestones);

    if (!user_id) {
        return res.status(400).json({ message: 'User ID is required' });
    }
    if (!Array.isArray(teamMembers)) {
        return res.status(400).json({ message: 'Team Members must be an array' });
    }

    const transaction = await sequelize.transaction();
    let projectId;
    let uploadPath;
    try {

        const teamMembersWithUserId = Array.from(new Set([...teamMembers, user_id].map(String)));

        const milestonesTags = Array.from(new Set(milestones.split(",").map(String)));

        const [results, metadata] = await sequelize.query(
            `INSERT INTO projects (title, description, department, start_date, end_date, priority, team_members, budget, status, tags, upload_path, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            {
                replacements: [title, description, department, startDate, endDate, priority, JSON.stringify(teamMembersWithUserId), budget, status, JSON.stringify(milestonesTags), "", user_id], // initially setting upload_path to null
                transaction
            }
        );
        console.log(results);
        projectId = results;
        uploadPath = path.join('uploads', projectId.toString());
        console.log(uploadPath);

        await sequelize.query(`UPDATE projects SET upload_path = :upload_path WHERE id = :project_id`, { replacements: { upload_path: uploadPath, project_id: projectId }, transaction });
        await fs.mkdir(uploadPath, { recursive: true });

        await transaction.commit();

        res.status(201).json({ message: 'Project created successfully', id: projectId });
    }
    catch (error) {
        await transaction.rollback();
        try {
            if (uploadPath) {
                await fs.rm(uploadPath, { recursive: true, force: true });
            }
        }
        catch (err) {
            console.error("Error deleting folder: ", err);
        }
        console.error("Error creating project:", error);
        res.status(500).json({ message: "Failed to create project" });
    }
};

const updatePost = async (req, res) => {
    const { id , data } = req.body;
    console.log(id , data);
    
    if (!id) {
        return res.status(400).json({ message: 'Project ID is required' });
    }
    try {
        const [results, metadata] = await sequelize.query(
            `UPDATE projects SET posted = ? WHERE id = ?`,
            {
                replacements: [data , id]
            }
        );
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Failed to update Post' });
        }
        res.status(200).json({ message: 'Post updated successfully' });
    } catch (error) {
        console.error("Error updating Post:", error);
        res.status(500).json({ message: "Failed to update Post" });
    }
};

const updateProject = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const userId = req.user.id;
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required for authorization' });
    }
    const { title, description, department, startDate, endDate, priority, teamMembers, budget, status, milestones } = req.body;
    if (!Array.isArray(teamMembers)) {
        return res.status(400).json({ message: 'Team Members must be an array' });
    }
    try {
        const [projectResults] = await sequelize.query(
            `SELECT user_id, team_members FROM projects WHERE id = ?`,
            {
                replacements: [id],
            }
        );
        if (projectResults.length === 0) {
            return res.status(404).json({ message: "Project not found" });
        }

        const project = projectResults[0];

        if (!hasProjectAccess(project, userId)) {
            return res.status(403).json({ message: "Access Denied: User is not authorized to update this project" });
        }

        const teamMembersWithUserId = Array.from(new Set([...teamMembers, userId].map(String)));

        const milestonesTags = Array.from(new Set(milestones.split(",").map(String)));

        const [results, metadata] = await sequelize.query(
            `UPDATE projects SET title=?, description=?, department=?, start_date=?, end_date=?, priority=?, team_members=?, budget=?, status=?, tags=? WHERE id=?`,
            {
                replacements: [title, description, department, startDate, endDate, priority, JSON.stringify(teamMembersWithUserId), budget, status, JSON.stringify(milestonesTags), id]
            }
        );
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.status(200).json({ message: 'Project updated successfully' });
    } catch (error) {
        console.error("Error updating project:", error);
        res.status(500).json({ message: "Failed to update project" });
    }
};

const uploadProjectFiles = async (req, res) => {
    const { id } = req.params;
    const files = req.files;
    const userId = req.user.id;
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required for authorization' });
    }
    if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
    }

    try {
        const [projectResults, metadata] = await sequelize.query(
            `SELECT upload_path, files, user_id, team_members FROM projects WHERE id = ?`,
            {
                replacements: [id]
            }
        );
        if (projectResults.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }
        const project = projectResults[0];
        if (!hasProjectAccess(project, userId)) {
            return res.status(403).json({ message: "Access Denied: User is not authorized to upload files to this project" });
        }
        const uploadPath = project?.upload_path;
        if (!uploadPath) {
            return res.status(404).json({ message: 'Upload path not found for this project' });
        }

        let storedFiles = JSON.parse(project?.files || '[]');

        const fileNames = files.map(file => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const fileName = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
            const oldPath = file.path;
            const newPath = path.join(uploadPath, fileName);
            fs.rename(oldPath, newPath);
            return fileName;
        })
        storedFiles.push(...fileNames);
        await sequelize.query(
            `UPDATE projects SET files=? WHERE id=?`, {
            replacements: [JSON.stringify(storedFiles), id],
        }
        );
        res.status(200).json({ message: 'Files uploaded successfully' });

    } catch (error) {
        console.error("Error uploading files:", error);
        res.status(500).json({ message: "Failed to upload files" });
    }
}

const getAllProjects = async (req, res) => {
    const userId = req.query.userId;

    try {
        let query = 'SELECT * FROM projects';
        let replacements = {};

        if (userId) {
            // Use JSON_CONTAINS if supported; fallback to LIKE for compatibility
            query = `
          SELECT * FROM projects
          WHERE user_id = :user_id
          OR team_members LIKE CONCAT('%"', :user_id, '"%')
        `;
            replacements = { user_id: userId };
        }

        const [results, metadata] = await sequelize.query(query, {
            replacements: replacements,
        });

        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'Failed to fetch projects' });
    }
};

const getAllProjectsAdmin = async (req, res) => {

    try {
        let query = 'SELECT * FROM projects';
        let replacements = {};

            query = `SELECT * FROM projects`;

        const [results, metadata] = await sequelize.query(query, {
            replacements: replacements,
        });

        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'Failed to fetch projects' });
    }
};
const getProjectById = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const [results, metadata] = await sequelize.query(
            `SELECT * FROM projects WHERE id = ?`,
            {
                replacements: [id]
            }
        );
        if (results.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const project = results[0];
        if (userId) {

            const isUserInProject = project.user_id === userId || JSON.parse(project.team_members).includes(`${userId}`)
            if (!isUserInProject) {
                return res.status(403).json({ message: "Access Denied: User is not authorized to view this project" });
            }
        }
        res.status(200).json(project);
    } catch (error) {
        console.error("Error fetching project:", error);
        res.status(500).json({ message: "Failed to fetch project" });
    }
};

const getProjectByIdAdmin = async (req, res) => {
    const { id } = req.params;

    try {
        const [results, metadata] = await sequelize.query(
            `SELECT * FROM projects WHERE id = ?`,
            {
                replacements: [id]
            }
        );
        if (results.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const project = results[0];
        // if (userId) {

        //     const isUserInProject = project.user_id === userId || JSON.parse(project.team_members).includes(`${userId}`)
        //     if (!isUserInProject) {
        //         return res.status(403).json({ message: "Access Denied: User is not authorized to view this project" });
        //     }
        // }
        res.status(200).json(project);
    } catch (error) {
        console.error("Error fetching project:", error);
        res.status(500).json({ message: "Failed to fetch project" });
    }
};
const getProjectByUserId = async (req, res) => {
    const { id } = req.params;
    const userId = req.query.userId;

    try {
        const [results, metadata] = await sequelize.query(
            `SELECT * FROM projects WHERE id = ?`,
            {
                replacements: [id]
            }
        );

        if (results.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }
        const project = results[0];
        if (userId) {
            const isUserInProject = project.user_id === parseInt(userId) || JSON.parse(project.team_members || '[]').includes(parseInt(userId))
            if (!isUserInProject) {
                return res.status(403).json({ message: "Access Denied: User is not authorized to view this project" });
            }
        }
        res.status(200).json(results[0]);
    } catch (error) {
        console.error("Error fetching project:", error);
        res.status(500).json({ message: "Failed to fetch project" });
    }
};

const deleteProject = async (req, res) => {
    const { id } = req.params;
    const userId = req.query.userId;
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required for authorization' });
    }
    try {
        const [projectResults, metadata] = await sequelize.query(
            `SELECT user_id, team_members FROM projects WHERE id = ?`,
            {
                replacements: [id],
            }
        );
        if (projectResults.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }
        const project = projectResults[0];
        if (!hasProjectAccess(project, userId)) {
            return res.status(403).json({ message: "Access Denied: User is not authorized to delete this project" });
        }

        const [results] = await sequelize.query(
            `DELETE FROM projects WHERE id = ?`,
            {
                replacements: [id]
            }
        );
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error("Error deleting project:", error);
        res.status(500).json({ message: "Failed to delete project" });
    }
};

const getAllProjectFiles = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required for authorization' });
    }
    try {
        const [projectResults, metadata] = await sequelize.query(
            `SELECT upload_path, files, user_id, team_members FROM projects WHERE id = ?`,
            {
                replacements: [id]
            }
        );
        if (projectResults.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }
        const project = projectResults[0];
        if (!hasProjectAccess(project, userId)) {
            return res.status(403).json({ message: "Access Denied: User is not authorized to view files for this project" });
        }
        const uploadPath = project?.upload_path;
        if (!uploadPath) {
            return res.status(404).json({ message: 'Upload Path not found for this project' })
        }
        const fileNames = JSON.parse(project?.files || '[]');
        if (!fileNames) {
            return res.status(404).json({ message: 'No files found for this project' })
        }

        const filePaths = fileNames?.map(fileName => fileName);
        res.status(200).json({ files: filePaths });
    } catch (error) {
        console.error("Error fetching files:", error);
        res.status(500).json({ message: "Failed to fetch files" });
    }
}


const deleteProjectFiles = async (req, res) => {
    const { id } = req.params;
    const { fileNames } = req.body;
    const userId = req.user.id;
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required for authorization' });
    }
    if (!fileNames || !Array.isArray(fileNames) || fileNames.length === 0) {
        return res.status(400).json({ message: 'Invalid file names' });
    }
    try {
        const [projectResults, metadata] = await sequelize.query(
            `SELECT upload_path, files, user_id, team_members FROM projects WHERE id = ?`,
            {
                replacements: [id]
            }
        );
        if (projectResults.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }
        const project = projectResults[0];
        if (!hasProjectAccess(project, userId)) {
            return res.status(403).json({ message: "Access Denied: User is not authorized to delete files for this project" });
        }
        const uploadPath = project?.upload_path;
        if (!uploadPath) {
            return res.status(404).json({ message: 'Upload path not found for this project' });
        }
        let storedFiles = JSON.parse(project?.files || '[]');

        await Promise.all(fileNames.map(async fileName => {
            const filePath = path.join(uploadPath, fileName);
            try {
                await fs.unlink(filePath);
                storedFiles = storedFiles.filter(file => file !== fileName);
            } catch (error) {
                console.error(`Error deleting file: ${fileName}, ${error}`);
            }
        }));
        await sequelize.query(
            `UPDATE projects SET files=? WHERE id=?`, {
            replacements: [JSON.stringify(storedFiles), id],
        }
        );
        res.status(200).json({ message: 'Files deleted successfully' });

    } catch (error) {
        console.error("Error deleting files:", error);
        res.status(500).json({ message: "Failed to delete files" });
    }
};


const downloadProjectFile = async (req, res) => {
    const { id } = req.params;
    let { filename } = req.params;
    const userId = req.user.id;
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required for authorization' });
    }

    if (!filename) {
        return res.status(400).json({ message: 'Filename is required' });
    }

    try {
        filename = decodeURIComponent(filename); // Decode the filename

        const [projectResults, metadata] = await sequelize.query(
            `SELECT upload_path, files, user_id, team_members FROM projects WHERE id = ?`,
            {
                replacements: [id]
            }
        );
        if (projectResults.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }
        const project = projectResults[0];
        if (!hasProjectAccess(project, userId)) {
            return res.status(403).json({ message: "Access Denied: User is not authorized to download files for this project" });
        }
        const uploadPath = project?.upload_path;
        if (!uploadPath) {
            return res.status(404).json({ message: 'Upload path not found for this project' });
        }
        const fileNames = JSON.parse(project?.files || '[]');
        if (!fileNames) {
            return res.status(404).json({ message: 'Files array not found for this project' });
        }
        if (!fileNames.includes(filename)) {
            return res.status(404).json({ message: "File not found in the project" });
        }

        const filePath = path.join(uploadPath, filename);
        await fs.access(filePath);
        res.download(filePath, filename, (err) => {
            if (err) {
                console.error("Error during file download:", err);
                return res.status(500).json({ message: "Failed to download the file." })
            }
        });

    } catch (error) {
        console.error("Error accessing file:", error);
        res.status(500).json({ message: "Failed to download the file" });
    }
}


module.exports = {
    createProject,
    getAllProjects,
    getAllProjectsAdmin,
    getProjectById,
    getProjectByIdAdmin,
    updateProject,
    deleteProject,
    getAllProjectFiles,
    deleteProjectFiles,
    downloadProjectFile,
    uploadProjectFiles,
    getProjectByUserId,
    updatePost
};