import { activityHelper } from '@/lib/activity';
import axios from 'axios';
import { toast } from 'sonner'; // Or however you import toast
// import { activityHelper } from '@/utils/activity-helper';
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4500"}/api/projects`;

const projectService = {
    createProject: async (projectData, token, user) => {
        try {
            const response = await axios.post(API_BASE_URL, projectData, { headers: { Authorization: `Bearer ${token}` } });
            const activity = activityHelper.createActivity(user, "created", "project")
            toast.success('Project created successfully!');
            return {
                project: response.data,
                activity
            };
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
    getAllProjectsAdmin: async (token) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/admin`, { headers: { Authorization: `Bearer ${token}` } });
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
    getProjectByIdAdmin: async (id, token) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/${id}/admin`, { headers: { Authorization: `Bearer ${token}` } });
            return response.data;
        } catch (error) {
            toast.error('Failed to fetch project. Please try again.');
            throw error;
        }
    },
    updateProject: async (id, projectData, token, user) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/${id}`, projectData, { headers: { Authorization: `Bearer ${token}` } });
            const activity = activityHelper.createActivity(JSON.parse(user), "updated", "project")
            toast.success('Project updated successfully!');
            return {
                project: response.data,
                activity
            };
        } catch (error) {
            toast.error('Failed to update project. Please try again.');
            throw error;
        }
    },
       updateProjectAdmin: async (id, projectData, token, user) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/${id}/admin`, projectData, { headers: { Authorization: `Bearer ${token}` } });
            const activity = activityHelper.createActivity(JSON.parse(user), "updated", "project")
            toast.success('Project updated successfully!');
            return {
                project: response.data,
                activity
            };
        } catch (error) {
            toast.error('Failed to update project. Please try again.');
            throw error;
        }
    },
    updatePost: async (id, data) => {
        try {
            const response = await axios.put(`${API_BASE_URL}`, { id, data });
            toast.success("Posted successfully!");
            return response.data;
        } catch (error) {
            toast.error("Failed to Post project. Please try again.");
            throw error;
        }
    },
    deleteProject: async (id, userId, user) => {
        try {
            await axios.delete(`${API_BASE_URL}/${id}`, { params: { userId } });
            const activity = activityHelper.createActivity(user, "deleted", "project")

            toast.success('Project deleted successfully!');
            return activity;
        } catch (error) {
            toast.error('Failed to delete project. Please try again.');
            throw error;
        }
    },
    uploadProjectFiles: async (id, files, token, user) => {
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
            const activity = activityHelper.createActivity(user, "upload", "file")

            toast.success('Files uploaded successfully!');
            return {
                project: response.data,
                activity
            };
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
     getAllProjectFilesAdmin: async (id, token) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/${id}/files/admin`, { headers: { Authorization: `Bearer ${token}` } });
            return response.data;
        } catch (error) {
            toast.error('Failed to fetch files. Please try again.');
            throw error;
        }
    },
    deleteProjectFiles: async (id, fileNames, token, user) => {
        try {
            await axios.delete(`${API_BASE_URL}/${id}/files`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { fileNames }, // Include data in the config object
            });
            const activity = activityHelper.createActivity(user, "deleted", "file")

            toast.success('Files deleted successfully!');
            return activity;
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
    },
     getProjectMetrics: async (id, token) => {
         try {
             const response = await axios.get(`${API_BASE_URL}/${id}/metrics`, { headers: { Authorization: `Bearer ${token}` } });
                return response.data;
        } catch (error) {
            console.error("Error fetching project metrics:", error);
            toast.error('Failed to fetch project metrics. Please try again.');
            throw error;
        }
    }
}

export default projectService;