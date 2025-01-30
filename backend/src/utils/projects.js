exports.calculateTaskCompletion = async (projectId) => {
    const [tasks, metadata] = await sequelize.query(
        `SELECT COUNT(*) as totalTasks,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedTasks
        FROM tasks WHERE project_id = ?`,
        {
            replacements: [projectId]
        }
    );

    const totalTasks = tasks[0]?.totalTasks || 0;
    const completedTasks = tasks[0]?.completedTasks || 0;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return { totalTasks, completedTasks, completionRate };
};