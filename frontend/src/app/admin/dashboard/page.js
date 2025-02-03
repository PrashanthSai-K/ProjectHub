"use client";
import Layout from "@/app/admin/components/layout";
import { useEffect, useState } from "react";
import projectService from "@/services/project-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { parseCookies } from "nookies";
import taskService from "@/services/task-management-service";
import { UserService } from "@/services/user-service";

export default function AdminDashboard() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tasksChartData, setTasksChartData] = useState([]);
  const [projectChartData, setProjectChartData] = useState([]);
  const cookies = parseCookies();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setAnnouncements([
        {
          id: 1,
          title: "New Project Management Tool",
          content:
            "We're switching to a new project management tool next month. Training sessions will be scheduled soon.",
        },
        {
          id: 2,
          title: "Upcoming Team Building Event",
          content: "Mark your calendars for our annual team building event on August 15th!",
        },
      ]);
      setLoading(false);
    };

    const fetchUsersData = async () => {
      try {
        const allUsers = await UserService.getAllUsers();
        setUsers(allUsers);
      } catch (error) {
        setError(error.message || "Failed to fetch users");
      }
    };

    const fetchProjectsData = async () => {
      try {
        const projectData = await projectService.getAllProjectsAdmin(cookies?.token);
        setProjects(projectData);
        const allTasks = await Promise.all(
          projectData.map(async (project) => {
            return await taskService.getTasks(project.id);
          })
        );
        const flatTasks = allTasks.flat();
        setTasks(flatTasks);

        const taskData = await Promise.all(
          projectData.map(async (project) => {
            const { taskMetrics } = await projectService.getProjectMetrics(project.id, cookies?.token);
            return taskMetrics;
          })
        );
        setTasksChartData(taskData);
        const transformedProjectChartData = projectData.map((project) => ({
          name: project.title,
          value: project.status === "Completed" ? 100 : 0,
        }));
        setProjectChartData(transformedProjectChartData);
      } catch (error) {
        setError(error.message || "Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectsData();
    fetchUsersData();
    fetchAnnouncements();
  }, []);

  const getFormattedDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getRecentTasks = (tasks) => {
    return tasks.sort((a, b) => new Date(b.deadline) - new Date(a.deadline));
  };

  const generateTeamActivity = (tasksChartData) => {
    const teamActivities = {};
    tasksChartData?.forEach((taskData) => {
      taskData?.forEach((task) => {
        if (!task.assignee) return;
        if (!teamActivities[task.assignee]) {
          teamActivities[task.assignee] = {
            completed: 0,
            total: 0,
          };
        }
        teamActivities[task.assignee].total++;
        if (task.status === "Completed") {
          teamActivities[task.assignee].completed++;
        }
      });
    });
    return Object.entries(teamActivities).map(([assignee, { completed, total }]) => ({
      user: users.find((u) => u.id == Number.parseInt(assignee))?.name,
      completed,
      total,
      progress: total > 0 ? ((completed / total) * 100).toFixed(0) : 0,
      id: Date.now(),
    }));
  };

  const teamActivityData = generateTeamActivity(tasksChartData);

  const getActivities = () => {
    return [
      { id: 1, user: "John Doe", action: "commented on", target: "Website Redesign", time: "2 hours ago" },
      { id: 2, user: "Jane Smith", action: "completed task", target: "Prepare data schemas", time: "5 hours ago" },
      {
        id: 3,
        user: "Mike Johnson",
        action: "created new task",
        target: "Implement user authentication",
        time: "1 day ago",
      },
    ];
  };

  const activitiesData = getActivities();

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 text-gray-800">Dashboard</h1>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {/* Projects Status Card */}
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">Projects Status</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] sm:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={projectChartData}
                  layout="vertical"
                  className="text-sm"
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }} // Adjusted margins
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={50}
                    tick={{ fontSize: 12 }} // Smaller font size for YAxis labels
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      padding: "8px",
                      fontSize: "12px",
                    }} // Custom tooltip styling
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} /> // Rounded bar corners
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* All Projects Card */}
          <Card className="col-span-full lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">All Projects</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[300px] sm:max-h-[400px] scroll-bar-none overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div className="space-y-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white shadow-md rounded-lg p-4 transition duration-300 ease-in-out hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{project.title}</h3>
                      <div className="text-sm text-gray-500 flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        {getFormattedDate(project.end_date)}
                      </div>
                    </div>
                    <Progress value={project.status === "Completed" ? 100 : 0} className="w-full h-2" />
                    <p className="text-sm text-gray-600 mt-2">Status: {project.status}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tasks Due Soon Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">Tasks Due Soon</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[300px] sm:max-h-[400px] scroll-bar-none overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div className="space-y-4">
                {getRecentTasks(tasks).map((task) => (
                  <div
                    key={task.id}
                    className="bg-white shadow-md rounded-lg p-4 transition duration-300 ease-in-out hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">{task.title}</h3>
                        <p className="text-sm text-gray-500">
                          {projects.find((project) => project.id === task.project_id)?.title}
                        </p>
                      </div>
                      <div className="text-sm">
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
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team Performance Card */}
          <Card className="col-span-full sm:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">Team Performance</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[300px] sm:max-h-[400px] scroll-bar-none overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div className="space-y-4">
                {console.log(teamActivityData)}
                {teamActivityData?.map((team, index) => (
                  <div
                    key={index}
                    className="bg-white shadow-md rounded-lg p-4 transition duration-300 ease-in-out hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-800">{team.user}</p>
                      <div className="flex items-center space-x-2">
                        <Progress value={Number.parseInt(team.progress)} className="w-24 h-2" />
                        <span className="text-sm text-gray-500">{team.progress}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[300px] sm:max-h-[400px] scroll-bar-none overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div className="space-y-4">
                {activitiesData.map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-white shadow-md rounded-lg p-4 transition duration-300 ease-in-out hover:shadow-lg flex items-start"
                  >
                    <Avatar className="mr-3">
                      <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${activity.user}`} />
                      <AvatarFallback>
                        {activity.user
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium text-gray-800">{activity.user}</span> {activity.action}{" "}
                        <span className="font-medium text-gray-800">{activity.target}</span>
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Announcements Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Team Announcements</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[300px] sm:max-h-[400px] scroll-bar-none overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="bg-white shadow-md rounded-lg p-4 transition duration-300 ease-in-out hover:shadow-lg"
                >
                  <h3 className="font-semibold text-lg mb-2 text-gray-800">{announcement.title}</h3>
                  <p className="text-gray-600">{announcement.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}