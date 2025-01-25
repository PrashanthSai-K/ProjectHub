"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import ProjectForm from "./project-form"

export function EditProjectSidebar({ project, onProjectUpdated }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleProjectUpdated = (updatedProject) => {
    onProjectUpdated(updatedProject)
    setIsOpen(false)
  }

  return (
    <Sheet className="" open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="fixed top-12 right-10">
          <Edit className="h-4 w-4" />
          <span className="sr-only">Edit project</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto" style={{width:"600px"}}>
        <SheetHeader>
          <SheetTitle>Edit Project</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <ProjectForm initialData={project} onProjectCreated={handleProjectUpdated} />
        </div>
      </SheetContent>
    </Sheet>
  )
}

