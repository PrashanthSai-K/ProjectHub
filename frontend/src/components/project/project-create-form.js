"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import projectService from "@/services/project-service";
import { UserService } from "@/services/user-service";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { parseCookies } from "nookies";
import { useToast } from "@/hooks/use-toast";


export default function ProjectCreateForm({ onProjectCreated }) {

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    department: "",
    startDate: "",
    endDate: "",
    priority: "",
    teamMembers: [], // Store user IDs here
    budget: "",
    start_date: "",
    end_date: "",
    status: "Not Started",
    milestones: "",
  });
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [users, setUsers] = useState([]);
  const [tags, setTags] = useState([])
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const searchInputRef = useRef(null);
  const cookies = parseCookies();

  const { toast } = useToast();

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
    const filtered = users
      .filter((user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 5);
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSearchFocus = () => {
    setIsSearchVisible(!isSearchVisible);
  };
  const handleSearchBlur = () => {
    // Use a small delay to allow for checkbox clicks
    setTimeout(() => {
      setIsSearchVisible(false);
    }, 200);
  };
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setIsSearchVisible(true);
  };
  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTeamMemberChange = (userId) => {
    setFormData((prev) => {
      const isAlreadyMember = prev.teamMembers.includes(userId);
      const updatedTeamMembers = isAlreadyMember
        ? prev.teamMembers.filter((id) => id !== userId)
        : [...prev.teamMembers, userId];

      return {
        ...prev,
        teamMembers: updatedTeamMembers,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const projectData = {
        ...formData,
        teamMembers: formData.teamMembers,
        start_date: formData.startDate,
        end_date: formData.endDate,
        milestones: tags.join(",")
      };

      const response = await projectService.createProject(projectData, cookies?.token);
      if (response) {
        toast({
          title: "Project Created",
          description: "Project Created Successfully"
        })
      } else {
        toast({
          variant: "destructive",
          title: "Failed to create project",
          description: "error"
        })
      }

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
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to create task",
        description: error
      })
      console.error("Error creating project:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      <div>
        <Label htmlFor="title">Project Title</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="department">Department</Label>
        <Input
          id="department"
          name="department"
          value={formData.department}
          onChange={handleChange}
          required
        />
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
        <Input
          id="endDate"
          name="endDate"
          type="date"
          value={formData.endDate}
          onChange={handleChange}
          required
        />
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
          {formData.teamMembers.map((userId) => {
            const user = users.find((u) => u.id === userId);
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
        <Select
          name="status"
          value={formData.status}
          onValueChange={(value) => handleSelectChange("status", value)}
        >
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
      <Button type="submit">Create Project</Button>
    </form>
  );
}