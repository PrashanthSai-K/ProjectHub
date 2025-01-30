import axios from "axios";


const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4500"}/api/calendar`; 

export const getCalendarEvents = async (token) => {
  try {
      const response = await axios.get(API_BASE_URL, {headers: {Authorization: `Bearer ${token}`}});      
    //   if (!response.ok) throw new Error('Failed to fetch calendar events');
      return await response.data;
  } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
  }
};