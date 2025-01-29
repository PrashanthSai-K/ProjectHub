import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CalendarIcon, Users } from "lucide-react";
import { Button } from "@/components/ui/button"; // Import the button component
import projectService from "@/services/project-service";
import { useToast } from "@/hooks/use-toast";

export default function ProjectList({ projects , fetchProjects }) {
  const { toast } = useToast();

  const getProgressValue = (status) => {
    switch (status) {
      case "Not Started":
        return 0;
      case "In Progress":
        return 50;
      case "Completed":
        return 100;
      default:
        return 0;
    }
  };

  const updatePost = async (id, data) => {
    try {
      const response = await projectService.updatePost(id, data);
      if (response) {
        fetchProjects();
        toast({
          title: "Post Updated",
          description: "Post Updated Successfully",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Failed to Update Post",
          description: "error",
        });
      }
    } catch (error) {
      console.log("Error Updating Post Status", error);
    }
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Card
          key={project.id}
          className="h-full flex flex-col transform transition duration-300 hover:scale-105"
        >
          <Link
            href={`/admin/projects/${project.id}`}
            className="block w-full h-full"
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl mb-2">{project.title}</CardTitle>
                <Badge
                  variant={
                    project.priority === "High"
                      ? "destructive"
                      : project.priority === "Medium"
                      ? "default"
                      : "secondary"
                  }
                >
                  {project.priority}
                </Badge>
              </div>
              <CardDescription className="text-sm line-clamp-2">
                {project.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex  items-center text-sm text-gray-500">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {project.start_date} - {project.end_date}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="mr-2 h-4 w-4" />
                  {JSON.parse(project.team_members)?.join(", ")}
                </div>
              </div>
            </CardContent>
          </Link>
          {/* Progress and Button Container */}
          <div className=" px-6 pb-6 pt-0 flex justify-between items-center">
            <div className="flex-1">
              {" "}
              {/* Make the progress take available space */}
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">{project.status}</span>
                <span className="text-sm text-gray-500">
                  {getProgressValue(project.status)}%
                </span>
              </div>
              <Progress
                value={getProgressValue(project.status)}
                className="w-full"
              />
            </div>
            <div className="ml-2">
              {" "}
              {/* Some margin on the left */}
              {project.posted === "NO" ? (
                <Button
                  onClick={() => updatePost(project.id, "YES")}
                  size="sm"
                >
                  Post
                </Button>
              ) : (
                <Button
                  onClick={() => updatePost(project.id, "NO")}
                  size="sm"
                >
                  UnPost
                </Button>
              )}{" "}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}