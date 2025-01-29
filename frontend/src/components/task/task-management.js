"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import taskService from "@/services/task-management-service"
import { useToast } from "@/hooks/use-toast"
import { UserService } from "@/services/user-service"

export default function TaskManagement({ projectId, teamMembers, showOnlyMyTasks, userId }) {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState({ title: "", assignee: "", status: "Not Started", deadline: undefined })
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [users, setUsers] = useState([]);

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const tasks = await taskService.getTasks(projectId)
      setTasks(tasks)
      if (showOnlyMyTasks && userId) {
        const filtered = tasks.filter(task => task.assignee === userId.toString())
        setFilteredTasks(filtered)
      } else {
        setFilteredTasks(tasks);
      }
      setLoading(false)
    }
    catch (error) {
      console.error('Error fetching tasks:', error)
      setError(error.message || "Failed to load tasks")
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const userData = await UserService.getAllUsers();
      setUsers(userData);
      // setFilteredUsers(userData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        variant: "destructive",
        title: "Failed to fetch users",
        description: error
      })
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTasks();
  }, [userId, showOnlyMyTasks])

  const handleAddTask = async (e) => {
    e.preventDefault()
    try {
      const formattedDeadline = newTask.deadline ? format(newTask.deadline, 'yyyy-MM-dd') : null
      const task = { ...newTask, deadline: formattedDeadline }
      await taskService.createTask(projectId, task)
      toast({
        title: "Task Created",
        description: "Task Created Successfully"
      })
      fetchTasks()
      setNewTask({ title: "", assignee: "", status: "Not Started", deadline: undefined })
    }
    catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to create task",
        description: error
      })
    }
  }

  const handleTaskChange = async (taskId, field, value) => {
    try {
      const updatedTask = tasks.find((task) => task.id === taskId)
      let taskData = { ...updatedTask, [field]: value }
      if (field === 'deadline') {
        taskData = { ...updatedTask, [field]: format(value, 'yyyy-MM-dd') }
      }
      await taskService.updateTask(taskId, taskData)
      setTasks(tasks.map((task) => (task.id === taskId ? { ...task, [field]: value } : task)))
      toast({
        title: "Task Updated",
        description: "Task Updated Successfully"
      })
      fetchTasks()
    }
    catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to update task",
        description: error
      })
      console.error("Failed to update task", error)
    }
  }
  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(taskId)
      toast({
        title: "Task Deleted",
        description: "Task Deleted Successfully"
      })
      fetchTasks()
    }
    catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to delete task",
        description: error
      })
      console.error("Failed to delete task", error)
    }
  }
  const canModifyTask = !showOnlyMyTasks;
  if (loading) {
    return <div>Loading Tasks...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Management</CardTitle>
      </CardHeader>
      <CardContent>
        {canModifyTask && <form onSubmit={handleAddTask} className="mb-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <Label htmlFor="taskTitle">Task Title</Label>
              <Input
                id="taskTitle"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="taskAssignee">Assignee</Label>
              <Select
                value={newTask.assignee}
                onValueChange={(value) => setNewTask({ ...newTask, assignee: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee">
                    {newTask.assignee ? users.find(u => u.id === newTask.assignee)?.name : ""}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((memberId) => {
                    const user = users.find(u => u.id === parseInt(memberId));
                    if (!user) return null;

                    return (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="taskStatus">Status</Label>
              <Select value={newTask.status} onValueChange={(value) => setNewTask({ ...newTask, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="taskDeadline">Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !newTask.deadline && "text-muted-foreground"
                    )}
                  >
                    {newTask.deadline ? format(newTask.deadline, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newTask.deadline}
                    onSelect={(date) => setNewTask({ ...newTask, deadline: date })}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <Button type="submit">Add Task</Button>
        </form>}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deadline</TableHead>
                {canModifyTask && <TableHead>Action</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>
                    <Select
                      value={task.assignee}
                      disabled={!canModifyTask}
                      onValueChange={(value) => handleTaskChange(task.id, "assignee", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignee">
                          {task.assignee ? users.find(u => u.id === parseInt(task.assignee))?.name : ""}
                        </SelectValue>                      </SelectTrigger>
                      <SelectContent>
                        {teamMembers.map((member) => {
                          const user = users.find((u) => u.id == parseInt(member));
                          return (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={task.status}
                      onValueChange={(value) => handleTaskChange(task.id, "status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue>
                          <Badge
                            variant={
                              task.status === "Completed"
                                ? "success"
                                : task.status === "In Progress"
                                  ? "warning"
                                  : "secondary"
                            }
                          >
                            {task.status}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Not Started">Not Started</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          disabled={!canModifyTask}
                          className={cn(
                            "w-[150px] justify-start text-left font-normal",
                            !task.deadline && "text-muted-foreground"
                          )}
                        >
                          {task.deadline ? format(new Date(task.deadline), "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          disabled={!canModifyTask}
                          selected={task.deadline ? new Date(task.deadline) : undefined}
                          onSelect={(date) => handleTaskChange(task.id, "deadline", date)}
                        />
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                  {canModifyTask && <TableCell>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteTask(task.id)}>
                      Delete
                    </Button>
                  </TableCell>}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}