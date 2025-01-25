import axios from 'axios';
import { toast } from 'sonner'; // Or however you import toast

const API_BASE_URL = 'http://localhost:4500/api/projects'; // Replace with your actual API base URL

const projectService = {
    createProject: async (projectData) => {
        try {
            const response = await axios.post(API_BASE_URL, projectData);
            toast.success('Project created successfully!');
            return response.data;
        } catch (error) {
            console.log("error", error)
            toast.error(error?.response?.data?.message || error?.message || 'Failed to create project. Please try again.');
            throw error;
        }
    },
    getAllProjects: async () => {
        try {
            const response = await axios.get(API_BASE_URL);
            return response.data;
        } catch (error) {
            toast.error('Failed to fetch projects. Please try again.');
            throw error;
        }
    },
    getProjectById: async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            toast.error('Failed to fetch project. Please try again.');
            throw error;
        }
    },
    updateProject: async (id, projectData) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/${id}`, projectData);
            toast.success('Project updated successfully!');
            return response.data;
        } catch (error) {
            toast.error('Failed to update project. Please try again.');
            throw error;
        }
    },
    deleteProject: async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/${id}`);
            toast.success('Project deleted successfully!');
        } catch (error) {
            toast.error('Failed to delete project. Please try again.');
            throw error;
        }
    },
    uploadProjectFiles: async (id, files) => {
        try {
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append('files', files[i])
            }
            const response = await axios.post(`${API_BASE_URL}/${id}/files`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success('Files uploaded successfully!');
            return response.data;
        } catch (error) {
            toast.error('Failed to upload files. Please try again.');
            throw error;
        }
    },
    getAllProjectFiles: async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/${id}/files`);
            return response.data;
        } catch (error) {
            toast.error('Failed to fetch files. Please try again.');
            throw error;
        }
    },
    deleteProjectFiles: async (id, fileNames) => {
        try {
            await axios.delete(`${API_BASE_URL}/${id}/files`, { data: { fileNames } });
            toast.success('Files deleted successfully!');
        } catch (error) {
            toast.error('Failed to delete files. Please try again.');
            throw error;
        }
    },
    downloadProjectFile: async (id, filename) => {
        console.log(filename);
        try {
            const encodedFilename = encodeURIComponent(filename); // Encode the filename
            const url = `${API_BASE_URL}/${id}/files/${encodedFilename}`;
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename); // Set filename
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }

};

export default projectService;