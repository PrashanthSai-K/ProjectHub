"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Users, FileText } from "lucide-react"
import TaskManagement from "@/components/task/task-management"
import ChatOption from "@/components/chat/chat-option"
import { ChatButton } from "@/components/chat/chat-button"
import { EditProjectSidebar } from "@/components/project/edit-project-sidebar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { UserService } from "@/services/user-service"

export default function ProjectDetails({ project: initialProject, messages, fetchProjectData, userRole, userId }) {
  const [project, setProject] = useState(initialProject)
  const [isChatOpen, setIsChatOpen] = useState(false)

  const canEdit = project.user_id === parseInt(userId);
  const canManageTasks = project.user_id === parseInt(userId);
  const [users, setUsers] = useState([]);

  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userData = await UserService.getAllUsers();
        setUsers(userData);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          variant: "destructive",
          title: "Failed to fetch users",
          description: error
        })
      }
    };
    fetchUsers();
  }, []);

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
              <div className="text-xs">
                {
                  JSON.parse(project.team_members)?.map((m) => {
                    const user = users.find((u) => u.id == parseInt(m));
                    return user ? (
                      <span key={user.id}>
                        {user.name},
                      </span>
                    ) : (
                      null
                    )
                  })
                }
              </div>
              {/* <span>{JSON.parse(project.team_members)?.join(", ")}</span> */}
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

      {canManageTasks && <TaskManagement projectId={project.id} teamMembers={JSON.parse(project.team_members)} userId={userId} />}
      {!canManageTasks && <TaskManagement projectId={project.id} teamMembers={JSON.parse(project.team_members)} userId={userId} showOnlyMyTasks={true} />}

      {isChatOpen && (
        <div className="fixed bottom-20 right-4 w-80 h-96 z-50">
          <ChatOption projectId={project.id} initialMessages={messages} onClose={() => setIsChatOpen(false)} />
        </div>
      )}

      <ChatButton onClick={() => setIsChatOpen(!isChatOpen)} />
      {canEdit && <EditProjectSidebar project={project} fetchProjectData={fetchProjectData} />}
    </div>
  )
}