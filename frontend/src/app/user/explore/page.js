"use client"

import { useState } from "react"
import Layout from "@/components/project/layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarIcon, Users, Search } from "lucide-react"
import { NeedMembersToggle } from "@/components/project/need-members-toggle"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

const dummyProjects = [
  {
    id: 1,
    title: "AI-Powered Customer Service Bot",
    description: "Develop an AI chatbot to improve customer service efficiency and response times.",
    department: "IT",
    startDate: "2023-07-01",
    endDate: "2023-12-31",
    status: "In Progress",
    teamSize: 5,
    needsMembers: true,
    tags: ["AI", "Customer Service", "Chatbot"],
    manager: {
      name: "Alice Johnson",
      avatar: "/avatars/alice.jpg",
    },
  },
  {
    id: 2,
    title: "Sustainable Packaging Initiative",
    description: "Research and implement eco-friendly packaging solutions for our product line.",
    department: "Product Development",
    startDate: "2023-08-15",
    endDate: "2024-02-29",
    status: "Not Started",
    teamSize: 4,
    needsMembers: false,
    tags: ["Sustainability", "Packaging", "Research"],
    manager: {
      name: "Bob Smith",
      avatar: "/avatars/bob.jpg",
    },
  },
  {
    id: 3,
    title: "Global Market Expansion Strategy",
    description: "Develop a comprehensive strategy for entering new international markets.",
    department: "Marketing",
    startDate: "2023-09-01",
    endDate: "2024-08-31",
    status: "In Progress",
    teamSize: 7,
    needsMembers: true,
    tags: ["Market Research", "International", "Strategy"],
    manager: {
      name: "Carol Martinez",
      avatar: "/avatars/carol.jpg",
    },
  },
  {
    id: 4,
    title: "Mobile App Redesign",
    description: "Overhaul the user interface and experience of our mobile application.",
    department: "IT",
    startDate: "2023-10-01",
    endDate: "2024-03-31",
    status: "Not Started",
    teamSize: 6,
    needsMembers: true,
    tags: ["Mobile", "UI/UX", "Design"],
    manager: {
      name: "David Lee",
      avatar: "/avatars/david.jpg",
    },
  },
  {
    id: 5,
    title: "Supply Chain Optimization",
    description: "Streamline our supply chain processes to reduce costs and improve efficiency.",
    department: "Operations",
    startDate: "2023-11-01",
    endDate: "2024-10-31",
    status: "In Progress",
    teamSize: 8,
    needsMembers: false,
    tags: ["Supply Chain", "Optimization", "Logistics"],
    manager: {
      name: "Emma Wilson",
      avatar: "/avatars/emma.jpg",
    },
  },
  {
    id: 6,
    title: "Employee Wellness Program",
    description: "Develop and implement a comprehensive wellness program for all employees.",
    department: "Human Resources",
    startDate: "2023-12-01",
    endDate: "2024-05-31",
    status: "Not Started",
    teamSize: 3,
    needsMembers: true,
    tags: ["Wellness", "HR", "Employee Engagement"],
    manager: {
      name: "Frank Thomas",
      avatar: "/avatars/frank.jpg",
    },
  },
]

export default function ExplorePage() {
  const [projects, setProjects] = useState(dummyProjects)
  const [searchTerm, setSearchTerm] = useState("")
  const [showOnlyNeedsMembers, setShowOnlyNeedsMembers] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const projectsPerPage = 6

  const handleJoinRequest = (projectId) => {
    // In a real application, this would send a request to join the project
    console.log(`Requested to join project ${projectId}`)
  }

  const handleNeedMembersToggle = (projectId, needsMembers) => {
    // In a real application, this would update the project's status in the backend
    setProjects(projects.map((project) => (project.id === projectId ? { ...project, needsMembers } : project)))
  }

  // Simulating the current user as a project manager for demo purposes
  const isProjectManager = true

  const filteredProjects = projects.filter(
    (project) =>
      (project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!showOnlyNeedsMembers || project.needsMembers),
  )

  const indexOfLastProject = currentPage * projectsPerPage
  const indexOfFirstProject = indexOfLastProject - projectsPerPage
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Explore Projects</h1>
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-needs-members"
              checked={showOnlyNeedsMembers}
              onCheckedChange={() => setShowOnlyNeedsMembers(!showOnlyNeedsMembers)}
            />
            <label
              htmlFor="show-needs-members"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Show only projects seeking members
            </label>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentProjects.map((project) => (
            <Card key={project.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{project.title}</CardTitle>
                <CardDescription>{project.department}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-gray-600 mb-4">{project.description}</p>
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>
                    {project.startDate} - {project.endDate}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                  <Users className="h-4 w-4" />
                  <span>{project.teamSize} team members</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarImage src={project.manager.avatar} alt={project.manager.name} />
                    <AvatarFallback>
                      {project.manager.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{project.manager.name}</span>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <div className="flex justify-between items-center w-full">
                  <Badge variant={project.status === "In Progress" ? "default" : "secondary"}>{project.status}</Badge>
                  {isProjectManager ? (
                    <NeedMembersToggle
                      projectId={project.id}
                      initialState={project.needsMembers}
                      onToggle={handleNeedMembersToggle}
                    />
                  ) : (
                    <Button onClick={() => handleJoinRequest(project.id)}>Request to Join</Button>
                  )}
                </div>
                {project.needsMembers && (
                  <Badge variant="outline" className="w-full justify-center">
                    Seeking New Members
                  </Badge>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
        {filteredProjects.length > projectsPerPage && (
          <div className="mt-6 flex justify-center">
            <nav>
              <ul className="flex space-x-2">
                {Array.from({ length: Math.ceil(filteredProjects.length / projectsPerPage) }, (_, i) => (
                  <li key={i}>
                    <Button variant={currentPage === i + 1 ? "default" : "outline"} onClick={() => paginate(i + 1)}>
                      {i + 1}
                    </Button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}
      </div>
    </Layout>
  )
}

