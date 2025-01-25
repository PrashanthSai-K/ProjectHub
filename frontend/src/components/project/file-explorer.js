"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import projectService from "@/services/project-service";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DotsHorizontalIcon, DownloadIcon, TrashIcon, CheckIcon } from "@radix-ui/react-icons";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { getFileIcon } from "@/components/project/get-fileicon";

const FileExplorer = ({ initialFiles, projectId, setFiles, fetchProjectAndFiles }) => {
    const [files, setLocalFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [filesToDelete, setFilesToDelete] = useState([]);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const router = useRouter();

    useEffect(() => {
        setLocalFiles(initialFiles?.files || []);
    }, [initialFiles]);

    const handleDownload = async (filename) => {
        try {
             setLoading(true);
           await projectService.downloadProjectFile(projectId, filename);
         } catch (error) {
            console.log(error);
        } finally {
             setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            setDeleteLoading(true);
            await projectService.deleteProjectFiles(projectId, filesToDelete);
            fetchProjectAndFiles();
            setSelectedFiles([]); // clear selected files after delete
            setOpenDeleteModal(false);
        } catch (error) {
            console.error("Error deleting file:", error);
        } finally {
            setDeleteLoading(false);
            setFilesToDelete([]); // clear files to delete
        }
    };

    const toggleFileSelection = (filename) => {
        setSelectedFiles((prev) => (prev.includes(filename) ? prev.filter((f) => f !== filename) : [...prev, filename]));
        setFilesToDelete((prev) => (prev.includes(filename) ? prev.filter((f) => f !== filename) : [...prev, filename]));
    };


    const isAllSelected = files.length > 0 && selectedFiles.length === files.length;

    return (
        <>
            {loading && <div className="text-muted-foreground">Downloading file(s)..</div>}
            {deleteLoading && <div className="text-muted-foreground">Deleting file..</div>}
            {files?.length === 0 ? (
                <p className="text-muted-foreground">No files uploaded yet.</p>
            ) : (
                <div className="border rounded-lg shadow-sm p-6 bg-white">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800">Files</h2>
                         <Button
                            onClick={() => setOpenDeleteModal(true)}
                            disabled={selectedFiles.length === 0}
                            variant="outline"
                            className="bg-red-50 text-red-600 hover:bg-red-100"
                        >
                            <TrashIcon className="mr-2 h-4 w-4" />
                            Delete ({selectedFiles.length})
                        </Button>
                    </div>
                    {files.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No files uploaded yet.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">
                                        <Checkbox
                                            checked={isAllSelected}
                                            onCheckedChange={(checked) => {
                                                setSelectedFiles(checked ? files.map((f) => f) : []);
                                                 setFilesToDelete(checked ? files.map((f) => f) : []);
                                            }}
                                        />
                                    </TableHead>
                                    <TableHead>File Name</TableHead>
                                    <TableHead className="w-[100px]">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {files.map((file) => {
                                    const FileTypeIcon = getFileIcon(file);
                                    return (
                                        <TableRow key={file}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedFiles.includes(file)}
                                                    onCheckedChange={() => toggleFileSelection(file)}
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center space-x-2">
                                                    <FileTypeIcon className="h-5 w-5 text-gray-500" />
                                                    <span className="truncate">{file}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="flex justify-end">
                                                 <Button
                                                   variant="outline"
                                                    onClick={() => handleDownload(file)}
                                                  >
                                                    <DownloadIcon className="mr-2 h-4 w-4" />
                                                    Download
                                                </Button>
                                             </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </div>
            )}
            <AlertDialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete
                             {filesToDelete?.length > 0 ? ` ${filesToDelete?.length} files` : null}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={deleteLoading}>
                            {deleteLoading ? "Deleting" : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default FileExplorer;