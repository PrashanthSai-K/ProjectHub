// src/lib/projects.js

const sequelize = require('../../config/database');

async function calculateTaskCompletion(projectId) {
    try {
        const [tasks, metadata] = await sequelize.query(
            `SELECT assignee, status, deadline FROM tasks WHERE project_id = ?`, {
            replacements: [projectId]
        }
        );
        return tasks;
    }
    catch (error) {
        console.error("Error getting tasks for completion rate:", error);
        throw error;
    }
}


module.exports = {
    calculateTaskCompletion
}