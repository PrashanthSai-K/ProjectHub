// chatService.js
import axios from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4500"}/api/chats`; 

const chatService = {
    getProjectChats: async (projectId, token) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/${projectId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
      } catch (error) {
          console.error("Error fetching chats:", error);
          toast.error('Failed to fetch chat messages. Please try again.');
        throw error;
      }
    },

    sendMessage: async (projectId, userId, message, token) => {
      try {
          const response = await axios.post(`${API_BASE_URL}/${projectId}`, {
              userId,
              message
          }, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
      } catch (error) {
        console.error('Error sending message:', error);
        toast.error('Failed to send message. Please try again.');
          throw error;
      }
    },
};

export default chatService;