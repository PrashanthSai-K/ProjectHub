const sequelize = require('../../config/database');

const getCalendarEvents = async (req, res) => {
    const userId = req.user.id;

    try {
        // Fetch user's projects
        const [projects] = await sequelize.query(
            `SELECT * FROM projects 
            WHERE user_id = ? 
            OR team_members LIKE CONCAT('%"', ?, '"%')`,
            { replacements: [userId, userId] }
        );

        if (projects.length === 0) return res.status(200).json([]);

        // Get project IDs
        const projectIds = projects.map(p => p.id);

        // Fetch tasks for these projects
        const [tasks] = await sequelize.query(
            `SELECT * FROM tasks 
            WHERE project_id IN (?)`,
            { replacements: [projectIds] }
        );

        // Group tasks by project ID
        const tasksByProject = tasks.reduce((acc, task) => {
            acc[task.project_id] = acc[task.project_id] || [];
            acc[task.project_id].push(task);
            return acc;
        }, {});

        // Format response
        const formattedData = projects.map(project => ({
            ...project,
            startDate: project.start_date,
            endDate: project.end_date,
            team_members: project.team_members,
            tasks: (tasksByProject[project.id] || []).map(task => ({
                id: task.id,
                title: task.title,
                dueDate: task.deadline,
                status: task.status
            }))
        }));

        res.status(200).json(formattedData);
    } catch (error) {
        console.error('Error fetching calendar data:', error);
        res.status(500).json({ message: 'Failed to fetch calendar data' });
    }
};

module.exports = { getCalendarEvents };