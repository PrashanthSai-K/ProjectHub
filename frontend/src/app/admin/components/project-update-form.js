"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import projectService from "@/services/project-service"
import { UserService } from "@/services/user-service"
import { Badge } from "@/components/ui/badge";
import { parseCookies } from "nookies"

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

    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [users, setUsers] = useState([]);
    const [tags, setTags] = useState([])
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredUsers, setFilteredUsers] = useState([]);
    const searchInputRef = useRef(null);
    const cookies = parseCookies();

    const { toast } = useToast();
    const [selectedMembers, setSelectedMembers] = useState([]);


    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                startDate: initialData.start_date ? new Date(initialData.start_date).toISOString().split("T")[0] : "",
                endDate: initialData.end_date ? new Date(initialData.end_date).toISOString().split("T")[0] : "",
                teamMembers: Array.isArray(initialData.team_members)
                    ? initialData.team_members
                    : JSON.parse(initialData.team_members || "[]"),
            });

            setTags(Array.isArray(initialData.tags)
                ? initialData.tags
                : JSON.parse(initialData.tags || "[]"))

            setSelectedMembers(Array.isArray(initialData.team_members)
                ? initialData.team_members
                : JSON.parse(initialData.team_members || "[]"));
        }
    }, [initialData])


    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }
    const handleSearchFocus = () => {
        setIsSearchVisible(true);
    };
    const handleSearchBlur = () => {
        // Use a small delay to allow for checkbox clicks
        setTimeout(() => {
            setIsSearchVisible(false);
        }, 200);
    };
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const userData = await UserService.getAllUsers();
                setUsers(userData);
                setFilteredUsers(userData);
            } catch (error) {
                console.error("Error fetching users:", error);
                toast({
                    variant: "destructive",
                    title: "Failed to fetch users",
                    description: error
                })
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        if (searchQuery) {
            const filtered = users.filter(user =>
                user.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers(users);
        }
    }, [searchQuery, users]);


    const handleTeamMemberChange = (userId) => {
        setFormData((prev) => {
            const isAlreadyMember = prev.teamMembers.includes(userId);
            let updatedTeamMembers = isAlreadyMember
                ? prev.teamMembers.filter((id) => id !== userId)
                : [...prev.teamMembers, userId];
            setSelectedMembers(updatedTeamMembers)
            return {
                ...prev,
                teamMembers: updatedTeamMembers,
            };
        });
    };

    const isDataChanged = () => {
        if (formData.title !== initialData.title) return true;
        if (formData.description !== initialData.description) return true;
        if (formData.department !== initialData.department) return true;
        if (formData.startDate !== initialData.start_date) return true;
        if (formData.endDate !== initialData.end_date) return true;
        if (formData.priority !== initialData.priority) return true;
        if (JSON.stringify(formData.teamMembers) !== initialData.team_members) return true;
        if (formData.budget !== initialData.budget) return true;
        if (formData.status !== initialData.status) return true;
        if (formData.tags !== initialData.tags) return true;

        return false;
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!isDataChanged()) {
            toast({
                title: "No Changes",
                description: "No changes were made to the project."
            });
            return;
        }
        try {
            const response = await projectService.updateProject(initialData.id, { ...formData, milestones: tags.join(",") }, cookies?.token, cookies?.user)
            if (response) {
                toast({
                    title: "Project Updates",
                    description: "Project Updated successfully"
                })
            } else {
                toast({
                    variant: "destructive",
                    title: "Failed to update projects",
                    description: "Failed to update projects"
                })
            }
            onProjectCreated()
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Failed to update projects",
                description: "Failed to update projects"
            })
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

            <div className="space-y-2">
                <Label>Team Members</Label>
                <div className="relative">
                    <Input
                        type="text"
                        placeholder="Search team members..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onFocus={handleSearchFocus}
                        onBlur={handleSearchBlur}
                        ref={searchInputRef}
                        className="w-full"
                    />
                    {isSearchVisible && filteredUsers.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                            {filteredUsers.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => handleTeamMemberChange(user.id)}
                                >
                                    <label htmlFor={`member-${user.id}`} className="flex-grow">
                                        {user.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                    {selectedMembers.map((userId) => {
                        const user = users.find((u) => u.id === parseInt(userId))
                        return user ? (
                            <Badge key={userId} variant="secondary" className="text-sm">
                                {user.name}
                                <button
                                    onClick={() => handleTeamMemberChange(userId)}
                                    className="ml-1 text-xs font-semibold"
                                >
                                    ×
                                </button>
                            </Badge>
                        ) : null;
                    })}
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
                <Label htmlFor="tags">Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                            {tag}
                            <button
                                type="button"
                                onClick={() => setTags(tags.filter((_, i) => i !== index))}
                                className="ml-1 text-xs font-semibold"
                            >
                                ×
                            </button>
                        </Badge>
                    ))}
                </div>
                <Input
                    id="milestones"
                    name="milestones"
                    value={formData.milestones}
                    onChange={(e) => {
                        const value = e.target.value;
                        // Check if the input ends with a comma or space
                        if (value.endsWith(",") || value.endsWith(" ")) {
                            const newTag = value.slice(0, -1).trim(); // Remove the trailing comma/space and trim the rest
                            if (newTag && !tags.includes(newTag)) {
                                setTags([...tags, newTag]); // Add the new tag if it doesn't already exist
                            }
                            setFormData((prev) => ({ ...prev, milestones: "" })); // Clear the input field
                        } else {
                            // Update the input value normally
                            setFormData((prev) => ({ ...prev, milestones: value }));
                        }
                    }}
                    placeholder="Enter tags, separated by commas or spaces"
                />
            </div>
            <Button type="submit">Update Project</Button>
        </form>
    )
}