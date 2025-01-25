const { validationResult } = require('express-validator');
const  sequelize  = require('../../config/database');
const path = require('path');
const fs = require('fs').promises;

const createProject = async (req, res) => {
    console.log(req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { title, description, department, startDate, endDate, priority, teamMembers, budget, status, milestones } = req.body;

    const transaction = await sequelize.transaction();
    let projectId;
    let uploadPath;
    try {

        const [results, metadata] = await sequelize.query(
            `INSERT INTO projects (title, description, department, start_date, end_date, priority, team_members, budget, status, milestones, upload_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            {
                replacements: [title, description, department, startDate, endDate, priority, JSON.stringify(teamMembers), budget, status, milestones, ""], // initially setting upload_path to null
                transaction
            }
        );
        console.log(results);
        
        projectId = results; 
        uploadPath = path.join('uploads', projectId.toString());
        console.log(uploadPath);
        
        await sequelize.query( `UPDATE projects SET upload_path = :upload_path WHERE id = :project_id`,{ replacements: {upload_path:uploadPath, project_id:projectId}, transaction} );
        await fs.mkdir(uploadPath, { recursive: true });

        await transaction.commit();
        res.status(201).json({ message: 'Project created successfully', id: projectId });
    } catch (error) {
        await transaction.rollback();
        try {
            if(uploadPath){
                await fs.rm(uploadPath, { recursive: true, force: true });
            }
        } catch (err) {
            console.error("Error deleting folder: ", err);
        }
        console.error("Error creating project:", error);
        res.status(500).json({ message: "Failed to create project" });
    }
};

const updateProject = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const { title, description, department, startDate, endDate, priority, teamMembers, budget, status, milestones } = req.body;

    try {
        const [results, metadata] = await sequelize.query(
            `UPDATE projects SET title=?, description=?, department=?, start_date=?, end_date=?, priority=?, team_members=?, budget=?, status=?, milestones=? WHERE id=?`,
            {
                replacements: [title, description, department, startDate, endDate, priority, JSON.stringify(teamMembers), budget, status, milestones, id]
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
    if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
    }

    try {
      const [results, metadata] = await sequelize.query(
            `SELECT upload_path, files FROM projects WHERE id = ?`,
            {
                replacements: [id]
            }
        );
         if (results.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }
      const project = results[0];
      const uploadPath = project?.upload_path;
       if (!uploadPath){
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
  try {
    const [results, metadata] = await sequelize.query(
      'SELECT * FROM projects'
    );
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
};


const getProjectById = async (req, res) => {
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
    res.status(200).json(results[0]);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ message: "Failed to fetch project" });
  }
};

const deleteProject = async (req, res) => {
  const { id } = req.params;
  try {
    const [results, metadata] = await sequelize.query(
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
    try {
        const [results, metadata] = await sequelize.query(
            `SELECT upload_path, files FROM projects WHERE id = ?`,
            {
                replacements: [id]
            }
        );
        if (results.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }
        const project = results[0];
         const uploadPath = project?.upload_path;
        if(!uploadPath){
            return res.status(404).json({ message: 'Upload Path not found for this project' })
        }
        const fileNames = JSON.parse(project?.files || '[]');
        if(!fileNames){
            return res.status(404).json({message: 'No files found for this project'} )
        }

        const filePaths = fileNames?.map(fileName =>  fileName);
        res.status(200).json({ files: filePaths });
    } catch (error) {
        console.error("Error fetching files:", error);
        res.status(500).json({ message: "Failed to fetch files" });
    }
}


const deleteProjectFiles = async (req, res) => {
    const { id } = req.params;
    const { fileNames } = req.body;

    if (!fileNames || !Array.isArray(fileNames) || fileNames.length === 0) {
        return res.status(400).json({ message: 'Invalid file names' });
    }
    try {
        const [results, metadata] = await sequelize.query(
            `SELECT upload_path, files FROM projects WHERE id = ?`,
            {
                replacements: [id]
            }
        );
        if (results.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }
        const project = results[0];
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
console.log(filename);

    if (!filename) {
        return res.status(400).json({ message: 'Filename is required' });
    }

    try {
        filename = decodeURIComponent(filename); // Decode the filename

        const [results, metadata] = await sequelize.query(
            `SELECT upload_path, files FROM projects WHERE id = ?`,
            {
                replacements: [id]
            }
        );
        
console.log(results[0]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }
        const project = results[0];
          const uploadPath = project?.upload_path;
          if (!uploadPath){
              return res.status(404).json({ message: 'Upload path not found for this project' });
          }
        const fileNames = JSON.parse(project?.files || '[]');
         if (!fileNames){
              return res.status(404).json({ message: 'Files array not found for this project' });
         }
        if(!fileNames.includes(filename)){
           return res.status(404).json({message: "File not found in the project"});
        }

        const filePath = path.join(uploadPath, filename);
        await fs.access(filePath);
        res.download(filePath, filename, (err) => {
            if (err) {
                console.error("Error during file download:", err);
                 return  res.status(500).json({ message: "Failed to download the file." })
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
  getProjectById,
  updateProject,
  deleteProject,
  getAllProjectFiles,
  deleteProjectFiles,
  downloadProjectFile,
    uploadProjectFiles
};