'use client'
import Layout from "@/components/project/layout";
import ProjectList from "@/components/project/project-list";
import { useState, useEffect } from 'react';
import projectService from "@/services/project-service";


export default function Home() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await projectService.getAllProjects();
        setProjects(data);
      } catch (err) {
        console.log(err)
        setError(err.message || "Failed to fetch projects");
      } finally {
        setLoading(false)
      }
    };

    fetchProjects();
  }, []);


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