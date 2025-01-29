"use client"

import Layout from "@/app/admin/components/layout";
import ProjectDetails from "@/app/admin/components/project-details";
import projectService from "@/services/project-service";
import { useParams } from "next/navigation";
import { parseCookies } from "nookies";
import { useState, useEffect } from "react";

export default function AdminProjectPage() {
    
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const params = useParams();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null);
    const cookies = parseCookies();

    const fetchProjectData = async () => {
        try {
            if (!params || !params.id) {
                throw new Error('Invalid route parameters');
            }

            const projectId = Number.parseInt(params.id, 10);

            if (isNaN(projectId)) {
                throw new Error('Invalid project ID');
            }
            const projectData = await projectService.getProjectByIdAdmin(projectId, cookies?.token);
            setProject(projectData);
            setMessages(projectData.chats || []);
        }
        catch (error) {
            console.error('Error fetching project:', error);
            setError(error.message || 'Failed to load project');
        } finally {
            setLoading(false)
        }
    };
    useEffect(() => {
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
                <ProjectDetails 
                project={project} 
                fetchProjectData={fetchProjectData} 
                messages={messages} 
                />
            </div>
        </Layout>
    );
}