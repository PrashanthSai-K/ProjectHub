'use client'
import FileExplorer from "@/components/project/file-explorer";
import Layout from "@/components/project/layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import projectService from "@/services/project-service";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseCookies } from 'nookies';
import { useToast } from "@/hooks/use-toast";
// import { useSession } from 'next-auth/react'; // Removed this import


export default function ProjectFiles() {

  const [project, setProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const params = useParams();
  const [projectId, setProjectId] = useState(null)
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState(null);
const {toast} = useToast();
  
  const [userId, setUserId] = useState(null);
  const cookies = parseCookies()
// console.log("cooke", );

  useEffect(() => {
    const userData = cookies?.user ? JSON.parse(cookies.user) : null;
    setUserId(userData?.id);
  }, []);

  useEffect(() => {
    if (params?.id) {
      setProjectId(Number.parseInt(params.id));
    }
  }, [params]);


  const fetchProjectAndFiles = async () => {
    try {

      if (isNaN(projectId)) {
        throw new Error('Invalid project ID');
      }
      const projectData = await projectService.getProjectById(projectId, cookies?.token);
      setProject(projectData);
      const filesData = await projectService.getAllProjectFiles(projectId, cookies?.token)
      setFiles(filesData)
    }
    catch (error) {
      console.error("Error fetching project files", error);
      setError(error.message || 'Failed to load project files');
    }
    finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (projectId && userId) {
      fetchProjectAndFiles()
    }

  }, [projectId, userId])

  const handleFileUpload = async () => {
    if (!selectedFiles) {
      return toast({
        title: "Error",
        description: 'Please select files to upload',
      })
    }
    try {
      setUploading(true)
      await projectService.uploadProjectFiles(projectId, selectedFiles, cookies?.token)
      const filesData = await projectService.getAllProjectFiles(projectId, cookies?.token)
      setFiles(filesData);
      setOpen(false);
    }
    catch (error) {
      toast({
        title: "Error",
        description: error.message || 'Failed to upload files',
      })
    }
    finally {
      setUploading(false)
      setSelectedFiles(null)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div>Loading project files...</div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div>Error: {error}</div>
      </Layout>
    )
  }


  if (!project) {
    return (
      <Layout>
        <div>Project not found</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{project.title} - Files</h1>
          <div className='flex items-center gap-2'>
            <Drawer open={open} onOpenChange={setOpen}>
              <DrawerTrigger asChild>
                <Button>Upload Files</Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Upload Files</DrawerTitle>
                  <DrawerDescription>
                    Select one or more files to upload to this project
                  </DrawerDescription>
                </DrawerHeader>
                <div className='p-4 space-y-4'>
                  <div>
                    <Label htmlFor="files">
                      Select Files
                    </Label>
                    <Input
                      id="files"
                      type="file"
                      multiple
                      onChange={(e) => setSelectedFiles(e.target.files)}
                    />
                  </div>
                </div>
                <DrawerFooter>
                  <div className="flex w-full justify-end gap-2">
                    <DrawerClose>
                      <div className="px-2.5 py-1.5 border-2 rounded-lg hover:bg-gray-100 hover:border-gray-300" variant="outline">Cancel</div>
                    </DrawerClose>
                    <Button onClick={handleFileUpload} disabled={uploading} >{uploading ? "Uploading" : "Upload"}</Button>
                  </div>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
            <Link href={`/user/projects/${projectId}`}>
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Project
              </Button>
            </Link>
          </div>

        </div>
        <FileExplorer initialFiles={files} fetchProjectAndFiles={fetchProjectAndFiles} projectId={projectId} setFiles={setFiles} />
      </div>
    </Layout>
  );
}