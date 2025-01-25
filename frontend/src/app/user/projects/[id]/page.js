'use client'
import Layout from "@/components/project/layout";
import ProjectDetails from "@/components/project/project-details";
import projectService from "@/services/project-service";
import { useState, useEffect } from "react";


export default function Project({ params }) {
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProjectData = async () => {
            try {
                if (!params || !params.id) {
                    throw new Error('Invalid route parameters');
                }

                const projectId = Number.parseInt(params.id, 10);

                if (isNaN(projectId)) {
                    throw new Error('Invalid project ID');
                }
                const projectData = await projectService.getProjectById(projectId);
                setProject(projectData);
                // Assuming your backend returns tasks and messages as part of the project response
                setTasks(projectData.tasks || []);
                setMessages(projectData.chats || []);
            }
            catch (error) {
                console.error('Error fetching project:', error);
                setError(error.message || 'Failed to load project');
            } finally {
                setLoading(false)
            }
        };

        fetchProjectData();
    }, [params]);

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
                <ProjectDetails project={project} tasks={tasks} messages={messages} />
            </div>
        </Layout>
    );
}