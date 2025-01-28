import axios from 'axios';
import { toast } from 'sonner'; // Or however you import toast

const API_BASE_URL = 'http://localhost:4500/api/projects'; // Replace with your actual API base URL

const projectService = {
    createProject: async (projectData, token) => {
        try {
            const response = await axios.post(API_BASE_URL, projectData, {headers: {Authorization: `Bearer ${token}`}});
            toast.success('Project created successfully!');
            return response.data;
        } catch (error) {
            console.log("error", error)
            toast.error(error?.response?.data?.message || error?.message || 'Failed to create project. Please try again.');
            throw error;
        }
    },
    getAllProjects: async (userId) => {
        try {
            const response = await axios.get(API_BASE_URL, { params: { userId } });
            return response.data;
        } catch (error) {
            toast.error('Failed to fetch projects. Please try again.');
            throw error;
        }
    },
    getProjectById: async (id, token) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            return response.data;
        } catch (error) {
            toast.error('Failed to fetch project. Please try again.');
            throw error;
        }
    },
    updateProject: async (id, projectData, userId) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/${id}`, projectData, { params: { userId } });
            toast.success('Project updated successfully!');
            return response.data;
        } catch (error) {
            toast.error('Failed to update project. Please try again.');
            throw error;
        }
    },
    deleteProject: async (id, userId) => {
        try {
            await axios.delete(`${API_BASE_URL}/${id}`, { params: { userId } });
            toast.success('Project deleted successfully!');
        } catch (error) {
            toast.error('Failed to delete project. Please try again.');
            throw error;
        }
    },
    uploadProjectFiles: async (id, files, token) => {
        console.log(token);
        
        try {
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append('files', files[i])
            }
            const response = await axios.post(`${API_BASE_URL}/${id}/files`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                },
            });
            toast.success('Files uploaded successfully!');
            return response.data;
        } catch (error) {
            toast.error('Failed to upload files. Please try again.');
            throw error;
        }
    },
    getAllProjectFiles: async (id, token) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/${id}/files`, { headers: { Authorization: `Bearer ${token}` } });
            return response.data;
        } catch (error) {
            toast.error('Failed to fetch files. Please try again.');
            throw error;
        }
    },
    deleteProjectFiles: async (id, fileNames, token) => {
        try {
            await axios.delete(`${API_BASE_URL}/${id}/files`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { fileNames }, // Include data in the config object
            });
            toast.success('Files deleted successfully!');
        } catch (error) {
            toast.error('Failed to delete files. Please try again.');
            throw error;
        }
    },
    
    downloadProjectFile: async (id, filename, token) => {
        try {
            const encodedFilename = encodeURIComponent(filename);
            const url = `${API_BASE_URL}/${id}/files/${encodedFilename}`;


            // Create a new link element with the correct target
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);

            // Fetch the file using fetch API with Authorization Header
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });


            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Download failed: ${response.status} - ${errorData?.message || response.statusText}`);
            }

            // Convert the response to a blob
            const blob = await response.blob();

            // Create an object URL for the blob
            const blobUrl = URL.createObjectURL(blob);
            link.href = blobUrl;


            // Append, click, and then remove the link
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Revoke the object URL to free resources
            URL.revokeObjectURL(blobUrl);

        } catch (error) {
            console.error("Download Error:", error);
            throw error;
        }
    }

};

export default projectService;