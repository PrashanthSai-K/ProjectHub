'use client'
import Layout from "@/components/project/layout";
import ProjectList from "@/components/project/project-list";
import { useState, useEffect } from 'react';
import projectService from "@/services/project-service";
import { parseCookies } from 'nookies';

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const cookies = parseCookies()
    const userData = cookies?.user ? JSON.parse(cookies.user) : null;
    setUserId(userData?.id);
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!userId) {
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await projectService.getAllProjects(userId);
        setProjects(data);
      } catch (err) {
        console.log(err)
        setError(err.message || "Failed to fetch projects");
      } finally {
        setLoading(false)
      }
    };

    fetchProjects();
  }, [userId]);


  if (loading) {
    return <Layout>
      <p>Loading projects...</p>
    </Layout>
  }

  if (error) {
    return (
      <Layout>
        <p>Error: {error}</p>
      </Layout>
    )
  }

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Projects</h1>
      <ProjectList projects={projects} />
    </Layout>
  );
}