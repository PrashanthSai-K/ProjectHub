"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function TaskManagement({ projectId, initialTasks, teamMembers }) {
  const [tasks, setTasks] = useState(initialTasks)
  const [newTask, setNewTask] = useState({ title: "", assignee: "", status: "Not Started" })

  const handleAddTask = (e) => {
    e.preventDefault()
    const task = { ...newTask, id: Date.now() }
    setTasks([...tasks, task])
    setNewTask({ title: "", assignee: "", status: "Not Started" })
  }

  const handleTaskChange = (taskId, field, value) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, [field]: value } : task)))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Management</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddTask} className="mb-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
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
              <Select value={newTask.assignee} onValueChange={(value) => setNewTask({ ...newTask, assignee: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member} value={member}>
                      {member}
                    </SelectItem>
                  ))}
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
          </div>
          <Button type="submit">Add Task</Button>
        </form>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>
                    <Select
                      value={task.assignee}
                      onValueChange={(value) => handleTaskChange(task.id, "assignee", value)}
                    >
                      <SelectTrigger>
                        <SelectValue>{task.assignee}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {teamMembers.map((member) => (
                          <SelectItem key={member} value={member}>
                            {member}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select value={task.status} onValueChange={(value) => handleTaskChange(task.id, "status", value)}>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

