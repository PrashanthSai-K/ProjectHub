const sequelize = require('../../config/database');
// You don't need to import Server here since the socket.io server is already initialized in index.js.
//const { Server } = require('socket.io');

const getProjectChats = async (req, res) => {
    const projectId = parseInt(req.params.projectId, 10);

    if (isNaN(projectId)) {
        return res.status(400).json({ message: 'Invalid project ID provided' });
    }

  try {
    const query = `
        SELECT chats.*, users.name as user_name 
        FROM chats 
        INNER JOIN users ON chats.user_id = users.id 
        WHERE project_id = :projectId
        ORDER BY timestamp ASC;
    `;
        const results = await sequelize.query(query, {
            replacements: { projectId },
             type: sequelize.QueryTypes.SELECT,
        });
    res.status(200).json(results);
  }
    catch (error) {
        console.error('Error getting messages:', error);
      return res.status(500).json({ message: 'Error fetching chat messages' });
    }
  };

const createChatMessage = async (req, res) => {
  const projectId = parseInt(req.params.projectId, 10);
  const { userId, message } = req.body;

    if (isNaN(projectId) || !userId || !message) {
        return res.status(400).json({ message: 'Invalid input data provided' });
    }

    try {
        const insertQuery = `
            INSERT INTO chats (project_id, user_id, message)
            VALUES (:projectId, :userId, :message);
        `;
        const insertResult = await sequelize.query(insertQuery, {
            replacements: { projectId, userId, message },
            type: sequelize.QueryTypes.INSERT,
        });

        // Fetch the newly created message to return it with the user_name
        const selectQuery = `
            SELECT chats.*, users.name as user_name 
            FROM chats 
            INNER JOIN users ON chats.user_id = users.id 
            WHERE chats.id = :insertId
        `;
        const messageResult = await sequelize.query(selectQuery, {
            replacements: { insertId: insertResult[0] },
            type: sequelize.QueryTypes.SELECT
          });
        
        if (messageResult && messageResult.length > 0) {
            const newMessage = messageResult[0];
            //Emit the new message to clients
            //Since io was initialized in the server you must export the io connection from the server

            const io = req.app.get('io');
            io.to(projectId).emit('newMessage', newMessage);
            res.status(201).json(newMessage);

        } else {
        res.status(500).json({ message: 'Failed to retrieve created message' });
    }
    }
    catch (error) {
        console.error('Error creating message:', error);
        return res.status(500).json({ message: 'Failed to send message' });
    }
};


module.exports = {
    getProjectChats,
    createChatMessage,
};