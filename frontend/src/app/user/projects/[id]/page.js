'use client'
import Layout from "@/components/project/layout";
import ProjectDetails from "@/components/project/project-details";
import projectService from "@/services/project-service";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { parseCookies } from 'nookies';


export default function Project() {
    
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const params = useParams();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);
    const [userRole, setUserRole] = useState(null)

    const cookies = parseCookies()


    useEffect(() => {
        const userData = cookies?.user ? JSON.parse(cookies.user) : null;
        setUserId(userData?.id);
    }, []);

    const fetchProjectData = async () => {
        try {
            if (!userId) {
                return;
            }
            if (!params || !params.id) {
                throw new Error('Invalid route parameters');
            }

            const projectId = Number.parseInt(params.id, 10);

            if (isNaN(projectId)) {
                throw new Error('Invalid project ID');
            }
            const projectData = await projectService.getProjectById(projectId, cookies?.token);
            setProject(projectData);
             // Set user role after fetching project data
            determineUserRole(projectData, userId);
             // Assuming your backend returns tasks and messages as part of the project response
            setMessages(projectData.chats || []);
        }
        catch (error) {
            console.error('Error fetching project:', error);
            setError(error.message || 'Failed to load project');
        } finally {
            setLoading(false)
        }
    };
    // Function to determine user role
    const determineUserRole = (projectData, userId) => {
        if (projectData && userId) {
          if (projectData.owner_id === userId) {
            setUserRole('owner');
          } else if (projectData.team_members && JSON.parse(projectData.team_members).includes(userId)) {
            setUserRole('team_member');
          } else {
              setUserRole('viewer')
          }
        }
      };
    useEffect(() => {
        fetchProjectData();
    }, [params, userId]);

    if (loading) {
        return (
            <Layout>
                <div>Loading Project...</div>
            </Layout>
        )
    }

    if (error) {
        return (
            <Layout>
                <div>Error: {error}</div>
            </Layout>
        )
    }

    if (!project) {
        return (
            <Layout>
                <div>Project not found</div>
            </Layout>
        );
    }
    return (
        <Layout>
            <div className="space-y-6">
                <h2 className="text-3xl font-bold">Project Details</h2>
                <ProjectDetails 
                project={project} 
                fetchProjectData={fetchProjectData} 
                messages={messages} 
                userId={userId}
                />
            </div>
        </Layout>
    );
}