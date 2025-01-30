// utils/api.js or services/auth.js
const API_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4500"}/api`; 

const handleResponse = async (response) => {
    if (!response.ok) {
      const error = await response.json();
      console.error('API Error:', error);
      throw new Error(error?.message || 'An error occurred');
    }
    return response.json();
  };

export const api = {
    post: async (url, body) => {
        const response = await fetch(`${API_URL}${url}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        return handleResponse(response)
    },
    get: async (url, token) => {
        const response = await fetch(`${API_URL}${url}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        return handleResponse(response);
      },
    put: async (url, body, token) => {
        const response = await fetch(`${API_URL}${url}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                 Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });
        return handleResponse(response)
    },
    delete: async (url, token) => {
        const response = await fetch(`${API_URL}${url}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                 Authorization: `Bearer ${token}`
            }
        });
        return handleResponse(response);
    }
}