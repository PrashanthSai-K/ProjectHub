'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarIcon, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import Layout from "@/components/project/layout"
import { useEffect, useState } from "react"
import projectService from "@/services/project-service"
import taskService from "@/services/task-management-service"
import { parseCookies } from 'nookies';
import { UserService } from "@/services/user-service"

import "@/app/globals.css"

export default function UserDashboard() {
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [activities, setActivities] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null)
  const [users, setUsers] = useState([])
  const cookies = parseCookies();

  useEffect(() => {
    const userData = cookies?.user ? JSON.parse(cookies.user) : null;
    setUserId(userData?.id);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const allUsers = await UserService.getAllUsers();
        setUsers(allUsers)
        setAnnouncements([
          {
            id: 1,
            title: "New Project Management Tool",
            content: "We're switching to a new project management tool next month. Training sessions will be scheduled soon.",
          },
          {
            id: 2,
            title: "Upcoming Team Building Event",
            content: "Mark your calendars for our annual team building event on August 15th!",
          },
        ]);
      } catch (error) {
        setError(error.message || 'Failed to fetch users');
      }
      finally {
        setLoading(false);
      }
    }

    const fetchProjectsData = async () => {
      try {
        if (!userId) {
          return;
        }
        const projectData = await projectService.getAllProjects(userId);

        setProjects(projectData)
        const allTasks = await Promise.all(
          projectData.map(async (project) => {
            return await taskService.getTasks(project.id);
          })
        );
        const flatTasks = allTasks.flat();
        setTasks(flatTasks)
      }
      catch (error) {
        console.log(error);
        
        setError(error.message || 'Failed to load projects')
      }
      finally {
        setLoading(false);
      }
    }
    fetchUserData()
    fetchProjectsData()

  }, [userId])

  // console.log();


  const getFormattedDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }
  const getRecentTasks = (tasks) => {
    return tasks.sort((a, b) => new Date(b.deadline) - new Date(a.deadline));
  }

  if (loading) {
    return (
      <Layout>
        <div>Loading data...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div>Error: {error}</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="scroll-bar-none">
            <CardHeader>
              <CardTitle>My Projects</CardTitle>
            </CardHeader>
            <CardContent className="max-h-72 overflow-y-auto scroll-bar-none">
              <div className="space-y-4">
                {
                  projects.length === 0
                    ?
                    <span className="text-gray-400 text-sm">
                      No Projects Yet.
                    </span>
                    :
                    projects.map((project) => (
                      <div key={project.id} className="flex items-center">
                        <div className="flex-1 space-y-1">
                          <p className="font-medium">{project.title}</p>
                          <Progress value={project.status === 'Completed' ? 100 : 0} className="w-full" />
                        </div>
                        <div className="ml-4 text-sm text-gray-500">
                          <CalendarIcon className="inline-block w-4 h-4 mr-1" />
                          {getFormattedDate(project.end_date)}
                        </div>
                      </div>
                    ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tasks Due Soon</CardTitle>
            </CardHeader>
            <CardContent className="max-h-72 overflow-y-auto scroll-bar-none">
              <div className="space-y-4">
                {tasks.length === 0
                  ?
                  <span className="text-gray-400 text-sm">
                    No Tasks Assigned.
                  </span>
                  :
                  getRecentTasks(tasks).map((task) => (
                    <div key={task.id} className="flex items-center">
                      <div className="flex-1">
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-gray-500">{projects.find(project => project.id === task.project_id)?.title}</p>
                      </div>
                      <div className="ml-4 text-sm">
                        {task.status === "Completed" ? (
                          <span className="text-green-500 flex items-center">
                            <CheckCircle2 className="w-4 h-4 mr-1" /> Done
                          </span>
                        ) : new Date(task.deadline) < new Date() ? (
                          <span className="text-red-500 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" /> Overdue
                          </span>
                        ) : (
                          <span className="text-orange-500 flex items-center">
                            <Clock className="w-4 h-4 mr-1" /> {getFormattedDate(task.deadline)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="max-h-72 overflow-y-auto">
              <div className="space-y-4">
                {activities.length === 0
                  ?
                  <span className="text-gray-400 text-sm">
                    No Recent Activity.
                  </span>
                  :
                  activities.map((activity) => (
                    <div key={activity.id} className="flex items-start">
                      <Avatar className="mr-2">
                        <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${activity.user}`} />
                        <AvatarFallback>
                          {activity.user
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{activity.user}</span> {activity.action}{" "}
                          <span className="font-medium">{activity.target}</span>
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Team Announcements</CardTitle>
          </CardHeader>
          <CardContent className="max-h-72 overflow-y-auto">
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement.id}>
                  <h3 className="font-medium">{announcement.title}</h3>
                  <p className="text-sm text-gray-500">{announcement.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}