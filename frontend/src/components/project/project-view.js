"use client"

import { useState } from "react"
import ProjectForm from "./project-form"
import ProjectList from "./project-list"
import { Button } from "@/components/ui/button"

export default function ProjectView() {
  const [projects, setProjects] = useState([])
  const [showForm, setShowForm] = useState(false)

  const handleProjectCreated = (newProject) => {
    setProjects([...projects, { ...newProject, id: Date.now() }])
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? "Cancel" : "New Project"}</Button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Create New Project</h2>
          <ProjectForm onProjectCreated={handleProjectCreated} />
        </div>
      )}

      {projects.length > 0 ? (
        <ProjectList projects={projects} />
      ) : (
        <p className="text-center text-gray-500">No projects created yet.</p>
      )}
    </div>
  )
}

