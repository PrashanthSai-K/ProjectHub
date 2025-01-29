import { activityHelper } from '@/lib/activity';
import axios from 'axios';

const API_URL = 'http://localhost:4500/api';

const taskService = {
    async createTask(projectId, taskData, user) {
        try {
            const response = await axios.post(`${API_URL}/projects/${projectId}/tasks`, taskData);
            const activity = activityHelper.createActivity(user,"created task", taskData.title )
            return {
              task: response.data,
              activity: activity
            };
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    async getTasks(projectId) {
        try {
            const response = await axios.get(`${API_URL}/projects/${projectId}/tasks`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    async updateTask(taskId, taskData, user) {
        try {
            const response = await axios.put(`${API_URL}/projects/tasks/${taskId}`, taskData);
             const activity = activityHelper.createActivity(user,"updated task", taskData.title )

            return {
             task: response.data,
             activity
            }
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
    async deleteTask(taskId, user){
      try {
           const response = await axios.delete(`${API_URL}/projects/tasks/${taskId}`);
            const activity = activityHelper.createActivity(user,"deleted task", "task name" )
            return {
              task: response.data,
              activity
            }
       } catch (error) {
           throw error.response?.data || error.message;
       }
    }
};

export default taskService;