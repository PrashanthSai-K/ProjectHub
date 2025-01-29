"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/project/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon, Users, Search, Mail } from "lucide-react";
import { NeedMembersToggle } from "@/components/project/need-members-toggle";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import exploreService from "@/services/explore-service";
import { parseCookies } from "nookies";

export default function ExplorePage() {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyNeedsMembers, setShowOnlyNeedsMembers] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 6;

  const cookies = parseCookies();

  const handleNeedMembersToggle = async (projectId, needsMembers) => {
    // Optimistically update the state
    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.project_id === projectId
          ? { ...project, need_members: needsMembers }
          : project
      )
    );

    // Call API to update backend
    try {
      await exploreService.updateProjectNeedMembers(projectId, needsMembers);
    } catch (error) {
      console.log("Error updating backend", error);
      // Revert the optimistic update if backend update fails
      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project.project_id === projectId
            ? { ...project, need_members: !needsMembers }
            : project
        )
      );
    }
  };

  const filteredProjects = projects.filter(
    (project) =>
      (project.project_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.project_description
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) &&
      (!showOnlyNeedsMembers || project.need_members)
  );

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(
    indexOfFirstProject,
    indexOfLastProject
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const fetchProjectDetails = async () => {
    try {
      const response = await exploreService.getProjectDetails();
      setProjects(response);
    } catch (error) {
      console.log("Error Fetching Project Details", error);
    }
  };

  const openGmail = (email) => {
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      email
    )}`;
    window.open(gmailUrl, "_blank");
  };

  useEffect(() => {
    fetchProjectDetails();
  }, []);

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
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-needs-members"
              checked={showOnlyNeedsMembers}
              onCheckedChange={() =>
                setShowOnlyNeedsMembers(!showOnlyNeedsMembers)
              }
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
            <Card key={project.project_id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{project.project_title}</CardTitle>
                <CardDescription>{project.project_department}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-gray-600 mb-4">
                  {project.project_description}
                </p>
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>
                    {project.start_date} - {project.end_date}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                  <Users className="h-4 w-4" />
                  <span>{project.team_members.length} team members</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.split(",").map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarImage
                      src={project.user_name.avatar}
                      alt={project.user_name.name}
                    />
                    <AvatarFallback>
                      {project.user_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {project.user_name}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <div className="flex justify-between items-center w-full">
                  <Badge
                    variant={
                      project.status === "In Progress" ? "default" : "secondary"
                    }
                  >
                    {project.status}
                  </Badge>
                  {cookies?.user &&
                    JSON.parse(cookies?.user).id !== project.user_id && (
                      <button
                        onClick={() => openGmail(project.user_email)}
                        className=" hover:text-blue-600 text-2xl"
                      >
                        <Mail className="h-5 w-5 text-gray-600" />
                      </button>
                    )}

                  {/* Render only if current user is the project creator */}
                  {cookies?.user &&
                  JSON.parse(cookies?.user).id === project.user_id ? (
                    <NeedMembersToggle
                      projectId={project.project_id}
                      initialState={project.need_members}
                      onToggle={handleNeedMembersToggle}
                    />
                  ) : null}
                </div>
                {project.need_members ? (
                  <Badge variant="outline" className="w-full justify-center">
                    Seeking New Members
                  </Badge>
                ) : (
                  <Badge variant="outline" className="w-full justify-center">
                    Team Full
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
                {Array.from(
                  {
                    length: Math.ceil(
                      filteredProjects.length / projectsPerPage
                    ),
                  },
                  (_, i) => (
                    <li key={i}>
                      <Button
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        onClick={() => paginate(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    </li>
                  )
                )}
              </ul>
            </nav>
          </div>
        )}
      </div>
    </Layout>
  );
}
