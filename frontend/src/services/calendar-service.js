import axios from "axios";


export const getCalendarEvents = async (token) => {
  try {
      const response = await axios.get('http://localhost:4500/api/calendar', {headers: {Authorization: `Bearer ${token}`}});      
    //   if (!response.ok) throw new Error('Failed to fetch calendar events');
      return await response.data;
  } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
  }
};