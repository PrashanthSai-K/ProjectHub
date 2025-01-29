const sequelize = require("../../config/database");

// Utility function to check user permissions
// const hasProjectAccess = (project, userId) => {
//     if (!project || !userId) return false;
//     const parsedTeamMembers = JSON.parse(project.team_members || '[]');

//     return project.user_id === parseInt(userId) || parsedTeamMembers.includes(`${userId}`);
// };

const getProjectDetails = async (req, res) => {
  try {
    query = `SELECT * FROM project_details WHERE posted = "YES"`;
    const [results, metadata] = await sequelize.query(query);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching project Details:", error);
    res.status(500).json({ message: "Failed to fetch project Details" });
  }
};

const updateProjectNeedMember = async (req, res) => {
  const projectId = req.params.id;
  const { need_members } = req.body;

  try {
    const query = `
      UPDATE projects
      SET need_members = :need_members
      WHERE id = :projectId
      `;

    const [results] = await sequelize.query(query, {
      replacements: {
        need_members: need_members,
        projectId: projectId,
      },
    });    

    if (results.affectedRows > 0) {
      res.status(200).json({
        message: "Project Updated Successfully",
        data: results[0],
      });
    } else {
      res.status(404).json({ message: "Project Not Found" });
    }
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Failed to update project" });
  }
};
module.exports = {
  getProjectDetails,
  updateProjectNeedMember,
};
