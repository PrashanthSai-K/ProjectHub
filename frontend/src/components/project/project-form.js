"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

import  projectService  from "@/services/project-service"; // Make sure this path is correct


export default function ProjectForm({ initialData, onProjectCreated }) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        department: "",
        startDate: "",
        endDate: "",
        priority: "",
        teamMembers: [],
        budget: "",
        status: "Not Started",
        milestones: "",
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);


    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleTeamMemberChange = (member) => {
        setFormData((prev) => ({
            ...prev,
            teamMembers: prev.teamMembers.includes(member)
                ? prev.teamMembers.filter((m) => m !== member)
                : [...prev.teamMembers, member],
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Project submitted:", formData)
        try {
            const createdProject = await projectService.createProject(formData); // pass formData only
            // onProjectCreated(createdProject); // Notify parent of the new project
            if (!initialData) {
                setFormData({
                    title: "",
                    description: "",
                    department: "",
                    startDate: "",
                    endDate: "",
                    priority: "",
                    teamMembers: [],
                    budget: "",
                    status: "Not Started",
                    milestones: "",
                });
            }
        } catch (error) {
            console.error("Error creating project:", error);
           
        }
    };



    return (
        <form onSubmit={handleSubmit} className="space-y-4 w-full">
            <div>
                <Label htmlFor="title">Project Title</Label>
                <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
            </div>
            <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" value={formData.description} onChange={handleChange} required />
            </div>
            <div>
                <Label htmlFor="department">Department</Label>
                <Input id="department" name="department" value={formData.department} onChange={handleChange} required />
            </div>
            <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleChange} required />
            </div>
            <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                    name="priority"
                    value={formData.priority}
                    onValueChange={(value) => handleSelectChange("priority", value)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label>Team Members</Label>
                <div className="flex flex-wrap gap-2">
                    {["Alice", "Bob", "Charlie", "David", "Eve"].map((member) => (
                        <div key={member} className="flex items-center space-x-2">
                            <Checkbox
                                id={`member-${member}`}
                                checked={formData.teamMembers.includes(member)}
                                onCheckedChange={() => handleTeamMemberChange(member)}
                            />
                            <label htmlFor={`member-${member}`}>{member}</label>
                        </div>
                    ))}
                </div>
            </div>
            
            <div>
                <Label htmlFor="budget">Budget</Label>
                <Input
                    id="budget"
                    name="budget"
                    type="number"
                    value={formData.budget}
                    onChange={handleChange}
                    placeholder="Enter budget amount"
                />
            </div>
            <div>
                <Label htmlFor="status">Status</Label>
                <Select name="status" value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
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
                <Label htmlFor="milestones">Milestones</Label>
                <Textarea
                    id="milestones"
                    name="milestones"
                    value={formData.milestones}
                    onChange={handleChange}
                    placeholder="Enter key milestones, separated by commas"
                />
            </div>
             <Button type="submit">{initialData ? "Update Project" : "Create Project"}</Button>
        </form>
    );
}