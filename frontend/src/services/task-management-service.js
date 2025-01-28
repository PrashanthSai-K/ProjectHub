import axios from 'axios';

const API_URL = 'http://localhost:4500/api';

const taskService = {
    async createTask(projectId, taskData) {
        try {
            const response = await axios.post(`${API_URL}/projects/${projectId}/tasks`, taskData);
            return response.data;
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

    async updateTask(taskId, taskData) {
        try {
            const response = await axios.put(`${API_URL}/projects/tasks/${taskId}`, taskData);
             return response.data
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
    async deleteTask(taskId){
      try {
           const response = await axios.delete(`${API_URL}/projects/tasks/${taskId}`);
           return response.data;
       } catch (error) {
           throw error.response?.data || error.message;
       }
    }
};

export default taskService;