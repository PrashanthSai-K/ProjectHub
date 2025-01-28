const { validationResult } = require('express-validator');
const sequelize = require('../../config/database');

const createTask = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { projectId } = req.params;
    const { title, assignee, status, deadline } = req.body;

    try {
        const [results, metadata] = await sequelize.query(
            `INSERT INTO tasks (project_id, title, assignee, status, deadline) VALUES (?, ?, ?, ?, ?)`,
            {
                replacements: [projectId, title, assignee, status, deadline],
            }
        );
        res.status(201).json({ message: 'Task created successfully' });
    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ message: "Failed to create task" });
    }
};

const getTasksByProjectId = async (req, res) => {
    const { projectId } = req.params;

    try {
        const [results, metadata] = await sequelize.query(
            `SELECT * FROM tasks WHERE project_id = ?`,
            {
                replacements: [projectId]
            }
        );
        res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ message: "Failed to fetch tasks" });
    }
};

const updateTask = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const { title, assignee, status, deadline } = req.body;

    try {
        const [results, metadata] = await sequelize.query(
            `UPDATE tasks SET title=?, assignee=?, status=?, deadline=? WHERE id=?`,
            {
                replacements: [title, assignee, status, deadline, id]
            }
        );
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).json({ message: 'Task updated successfully' });
    } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ message: "Failed to update task" });
    }
};

const deleteTask = async (req, res) => {
    const { id } = req.params;
    try {
        const [results, metadata] = await sequelize.query(
            `DELETE FROM tasks WHERE id=?`, {
            replacements: [id]
        }
        );
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).json({ message: "Task deleted successfully" })
    }
    catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ message: "Failed to delete the task" })
    }
};

module.exports = {
    createTask,
    getTasksByProjectId,
    updateTask,
    deleteTask
};