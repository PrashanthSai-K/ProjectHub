"use client"

import "./calendar-style.css"
import { useState, useEffect } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
// import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Layout from "@/components/project/layout"

// Dummy data for preview
const dummyProjects = [
  {
    id: 1,
    title: "Website Redesign",
    description: "Overhaul the company website with a modern design",
    startDate: "2025-06-01",
    endDate: "2025-06-31",
    status: "In Progress",
    priority: "High",
    department: "IT",
    budget: 50000,
    team_members: JSON.stringify(["Alice", "Bob", "Charlie"]),
    tasks: [
      { id: 1, title: "Design mockups", dueDate: "2025-06-15", status: "Completed" },
      { id: 2, title: "Frontend development", dueDate: "2025-06-31", status: "In Progress" },
      { id: 3, title: "Backend integration", dueDate: "2025-06-15", status: "Not Started" },
    ],
  },
  {
    id: 2,
    title: "Product Launch",
    description: "Launch new product line in Q3",
    startDate: "2023-07-01",
    endDate: "2023-09-30",
    status: "Not Started",
    priority: "Medium",
    department: "Marketing",
    budget: 100000,
    team_members: JSON.stringify(["David", "Eve", "Frank"]),
    tasks: [
      { id: 4, title: "Market research", dueDate: "2023-07-15", status: "Not Started" },
      { id: 5, title: "Create marketing materials", dueDate: "2023-08-31", status: "Not Started" },
      { id: 6, title: "Organize launch event", dueDate: "2023-09-15", status: "Not Started" },
    ],
  },
]

export default function CalendarPage() {
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
//   const { toast } = useToast()

  useEffect(() => {
    setDummyProjects()
  }, [])

  const setDummyProjects = () => {
    try {
      const formattedEvents = formatProjectsForCalendar(dummyProjects)
      setEvents(formattedEvents)
    } catch (error) {
      console.error("Error setting dummy projects:", error)
      toast({
        title: "Error",
        description: "Failed to load projects. Please try again.",
        variant: "destructive",
      })
    }
  }

  const formatProjectsForCalendar = (projects) => {
    const formattedEvents = []

    projects.forEach((project) => {
      // Add project start date
      formattedEvents.push({
        title: `${project.title} (Start)`,
        start: project.startDate,
        color: "#4CAF50",
        extendedProps: { type: "project", project },
      })

      // Add project end date
      formattedEvents.push({
        title: `${project.title} (End)`,
        start: project.endDate,
        color: "#F44336",
        extendedProps: { type: "project", project },
      })

      // Add tasks
      if (project.tasks) {
        project.tasks.forEach((task) => {
          formattedEvents.push({
            title: task.title,
            start: task.dueDate,
            color: "#2196F3",
            extendedProps: { type: "task", task, project },
          })
        })
      }
    })

    return formattedEvents
  }

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event)
    setIsModalOpen(true)
  }

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Project Calendar</h1>
        <div className="bg-white p-4 rounded-lg shadow">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            eventClick={handleEventClick}
            height="auto"
          />
        </div>
        <EventDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} event={selectedEvent} />
      </div>
    </Layout>
  )
}

function EventDetailsModal({ isOpen, onClose, event }) {
  if (!event) return null

  const { extendedProps } = event

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {extendedProps.type === "project" && (
            <>
              <p>
                <strong>Project:</strong> {extendedProps.project.title}
              </p>
              <p>
                <strong>Description:</strong> {extendedProps.project.description}
              </p>
              <p>
                <strong>Start Date:</strong> {extendedProps.project.startDate}
              </p>
              <p>
                <strong>End Date:</strong> {extendedProps.project.endDate}
              </p>
              <p>
                <strong>Status:</strong> {extendedProps.project.status}
              </p>
              <p>
                <strong>Priority:</strong> {extendedProps.project.priority}
              </p>
              <p>
                <strong>Department:</strong> {extendedProps.project.department}
              </p>
              <p>
                <strong>Budget:</strong> ${extendedProps.project.budget.toLocaleString()}
              </p>
              <p>
                <strong>Team Members:</strong> {JSON.parse(extendedProps.project.team_members).join(", ")}
              </p>
            </>
          )}
          {extendedProps.type === "task" && (
            <>
              <p>
                <strong>Task:</strong> {extendedProps.task.title}
              </p>
              <p>
                <strong>Project:</strong> {extendedProps.project.title}
              </p>
              <p>
                <strong>Due Date:</strong> {extendedProps.task.dueDate}
              </p>
              <p>
                <strong>Status:</strong> {extendedProps.task.status}
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

