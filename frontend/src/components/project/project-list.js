import Link from "next/link";
 import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Progress } from "@/components/ui/progress";
 import { CalendarIcon, Users } from "lucide-react";

 export default function ProjectList({ projects }) {
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

   return (
     <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
       {projects.map((project) => (
         <Link
           href={`/user/projects/${project.id}`}
           key={project.id}
           className="transform transition duration-300 hover:scale-105"
         >
           <Card className="h-full flex flex-col">
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
               <CardDescription className="text-sm line-clamp-2">{project.description}</CardDescription>
             </CardHeader>
             <CardContent className="flex-grow flex flex-col justify-between">
               <div className="space-y-2">
                 <div className="flex items-center text-sm text-gray-500">
                   <CalendarIcon className="mr-2 h-4 w-4" />
                   {project.start_date} - {project.end_date}
                 </div>
                 <div className="flex items-center text-sm text-gray-500">
                   <Users className="mr-2 h-4 w-4" />
                   {JSON.parse(project.team_members)?.join(", ")}
                 </div>
               </div>
               <div className="mt-4">
                 <div className="flex justify-between items-center mb-1">
                   <span className="text-sm font-medium">{project.status}</span>
                   <span className="text-sm text-gray-500">{getProgressValue(project.status)}%</span>
                 </div>
                 <Progress value={getProgressValue(project.status)} className="w-full" />
               </div>
             </CardContent>
           </Card>
         </Link>
       ))}
     </div>
   );
 }