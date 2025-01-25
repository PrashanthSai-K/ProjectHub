const express = require('express');
const projectRoutes = require('./src/routes/project.routes');
const sequelize = require('./config/database');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4500;
require('dotenv').config()


app.use(cors());
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Routes
app.use('/api/projects', projectRoutes);

// Test DB connection
sequelize.authenticate()
.then(() => {
  console.log('Database connection has been established successfully.');
  return sequelize.sync()
 })
.then(() => {
    console.log("Database synced")
    app.listen(PORT, () => {
         console.log(`Server is running on port ${PORT}`);
       })
    })
 .catch(error => {
  console.error('Unable to connect to the database:', error);
});