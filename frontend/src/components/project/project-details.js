"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Users, FileText } from "lucide-react"
import TaskManagement from "@/components/task/task-management"
import ChatOption from "@/components/chat/chat-option"
import { ChatButton } from "@/components/chat/chat-button"
import { EditProjectSidebar } from "@/components/project/edit-project-sidebar"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ProjectDetails({ project: initialProject, tasks, messages }) {
  const [project, setProject] = useState(initialProject)
  const [isChatOpen, setIsChatOpen] = useState(false)

  const handleProjectUpdated = (updatedProject) => {
    setProject(updatedProject)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
            <CardTitle className="text-2xl">{project.title}</CardTitle>
            <Badge
              variant={
                project.priority === "High" ? "destructive" : project.priority === "Medium" ? "default" : "secondary"
              }
            >
              {project.priority}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 mb-4">{project.description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>
                {project.start_date} - {project.end_date}
              </span>
            </div>
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              <span>{JSON.parse(project.team_members)?.join(", ")}</span>
            </div>
            <div>
              <strong>Department:</strong> {project.department}
            </div>
            <div>
              <strong>Budget:</strong> ${project.budget?.toLocaleString()}
            </div>
            <div>
              <strong>Status:</strong> {project.status}
            </div>
            <div>
              <Link href={`/user/projects/${project.id}/files`}>
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  View Project Files
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <TaskManagement projectId={project.id} initialTasks={tasks} teamMembers={JSON.parse(project.team_members)} />

      {isChatOpen && (
        <div className="fixed bottom-20 right-4 w-80 h-96 z-50">
          <ChatOption projectId={project.id} initialMessages={messages} onClose={() => setIsChatOpen(false)} />
        </div>
      )}

      <ChatButton onClick={() => setIsChatOpen(!isChatOpen)} />
      <EditProjectSidebar project={project} onProjectUpdated={handleProjectUpdated} />
    </div>
  )
}