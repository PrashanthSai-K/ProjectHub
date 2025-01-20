# SPL Lab Project Management App

## Overview
The SPL Lab Project Management App is a comprehensive web and mobile-based application designed to manage software projects and products developed by the SPL (Software Projects Lab) team. This application enhances collaboration, progress tracking, and project/product lifecycle management.

## Features

### 1. User Management
- Role-based access control (Admin, Project Lead, Team Member, Guest)
- User authentication and profile management

### 2. Project/Product Management
- Create, view, and edit projects
- Add project descriptions, timelines, milestones, and deliverables
- Attach project-related documents (PDFs, images, reports)
- Archive and retrieve historical projects

### 3. Task Management
- Break projects into tasks and subtasks
- Assign tasks to team members with deadlines
- Track task status (Pending, In Progress, Completed)
- Task prioritization and progress indicators

### 4. Collaboration and Communication
- Team communication via chat, comments, or message boards
- Notifications and reminders for project updates, task deadlines, or changes
- Integration with email or messaging platforms for alerts

### 5. Progress Monitoring and Reporting
- Dashboard with project progress metrics (Gantt charts, task completion rates)
- Generate detailed reports on project status, team performance, and deadlines
- Visual representation of project timelines (e.g., charts, graphs)

### 6. Product Management
- Manage product lifecycle stages: Development, Testing, Deployment, Maintenance
- Track product versioning and releases
- Add bug tracking or feature update logs

### 7. Search and Filter
- Search projects/products using filters like project name, team, status, or date

### 8. Document Repository
- Upload, manage, and access project documents securely
- Document version control to track changes

## Technical Details

### Technology Stack
- **Frontend:** React (Web) & React Native (Mobile)
- **Backend:** Node.js (Express)
- **Database:** MySQL / PostgreSQL
- **Authentication:** JWT-based authentication
- **Deployment:** Docker, Kubernetes

### Project Structure
```
/frontend    - Contains React-based frontend code
/backend     - Contains Node.js backend code
/database    - SQL scripts for database setup
/weeklyReport        - Project documentation
```

## Installation and Setup

### Prerequisites
- Node.js v16+ and npm v8+
- Docker and Docker Compose
- MySQL or PostgreSQL database
- Git

### Steps

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd repo
   ```

2. Set up the database:
   - Import the SQL schema from `/database/schema.sql`
   - Update the database configuration in `/backend/config.js`

3. Install dependencies:
   ```bash
   cd frontend
   npm install
   cd ../backend
   npm install
   ```

4. Run the application locally:
   ```bash
   docker-compose up -d
   ```

5. Access the application:
   - Web: `http://localhost:3000`
   - Mobile: Run the React Native app on your device or emulator

## Contributing

We welcome contributions! Follow these steps to contribute:

1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit your changes and push them to your fork
4. Submit a pull request

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Contact

For any queries or issues, please reach out to:
- **Project Lead:** Sai Prashanth K (saiprashanth.cs21@bitsathy.ac.in)
