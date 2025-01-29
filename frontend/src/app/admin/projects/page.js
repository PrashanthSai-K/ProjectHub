"use client";
import Layout from "@/app/admin/components/layout";
import ProjectList from "@/app/admin/components/project-list";
import { useState, useEffect } from "react";
import projectService from "@/services/project-service";
import { parseCookies } from "nookies";

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cookies = parseCookies();

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectService.getAllProjectsAdmin(cookies?.token);
      setProjects(data);
    } catch (err) {
      console.log(err);
      setError(err.message || "Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  if (loading) {
    return (
      <Layout>
        <p>Loading projects...</p>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <p>Error: {error}</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">All Projects</h1>
      {projects.length === 0
        ?
        <span className="text-gray-400 text-sm">
          No Projects Yet.
        </span>
        :
        <ProjectList projects={projects} fetchProjects={fetchProjects} />
      }
    </Layout>
  );
}