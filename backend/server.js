const express = require('express');
const projectRoutes = require('./src/routes/project.routes');
const userRoutes = require('./src/routes/user.routes');
const authRoutes  = require('./src/routes/auth.routes');
const exploreRoutes = require('./src/routes/explore.routes')
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
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/explore', exploreRoutes);

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