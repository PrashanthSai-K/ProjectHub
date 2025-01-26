"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import projectService from "@/services/project-service"

export default function ProjectUpdateForm({ initialData, onProjectCreated }) {

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        department: "",
        startDate: "",
        endDate: "",
        priority: "",
        teamMembers: [],
        budget: "",
        status: "",
        milestones: "",
    })

    const { toast } = useToast();

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                startDate: initialData.start_date ? new Date(initialData.start_date).toISOString().split("T")[0] : "",
                endDate: initialData.end_date ? new Date(initialData.end_date).toISOString().split("T")[0] : "",
                teamMembers: Array.isArray(initialData.team_members)
                    ? initialData.team_members
                    : JSON.parse(initialData.team_members || "[]"),
            })
        }
    }, [initialData])

    const handleChange = (e) => {
        const { name, value } = e.target
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
        e.preventDefault()

        try {
            const response = await projectService.updateProject(initialData.id, formData)
            if (response) {
                toast.success("Project updated successfully!")
                onProjectCreated()
            } else {
                toast.error("Failed to update project. Please try again.")
            }
        } catch (error) {
            toast.error("Failed to update project. Please try again.")
            console.error("Error updating project:", error)
        }
    }

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
                <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm leading-5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                    <option value="" disabled>
                        Select priority
                    </option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                </select>
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
                <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm leading-5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                    <option value="" disabled>
                        Select status
                    </option>
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                </select>
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
            <Button type="submit">Update Project</Button>
        </form>
    )
}

