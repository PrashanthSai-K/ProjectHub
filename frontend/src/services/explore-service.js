import axios from "axios";
import { toast } from "sonner"; // Or however you import toast

const API_BASE_URL = "http://localhost:4500/api/explore"; // Replace with your actual API base URL

const exploreService = {
  getProjectDetails: async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      return response.data;
    } catch (error) {
      toast.error("Failed to fetch projects. Please try again.");
      throw error;
    }
  },
  updateProjectNeedMembers: async (projectId, needsMembers) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/${projectId}`, {
        need_members: needsMembers,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default exploreService;
