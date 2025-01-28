import axios from "axios";
const API_BASE_URL = "http://localhost:4500/api/users";
export class UserService {
  static async getAllUsers() {
    try {
      const response = await axios.get(API_BASE_URL);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
   static async getUserById(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
    static async createUser(userData) {
        try {
            const response = await axios.post(API_BASE_URL, userData);
            return response.data;
        } catch (error) {
           
              throw error;
        }
    }
    static async updateUser(id, userData) {
        try {
          
            const response = await axios.put(`${API_BASE_URL}/${id}`, userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
   static async deleteUser(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
      throw error;
    }
  }
}