import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { UserService } from "@/services/user-service";

export function UserForm({ user, isCreating, onUserSaved }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        password: "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        role: "",
        password: "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
  };

  const handleRoleChange = (value) => {
    setFormData((prev) => ({ ...prev, role: value }));
    setErrors(prevErrors => ({ ...prevErrors, role: null }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      let response;
      if (isCreating) {
        response = await UserService.createUser(formData);
      } else {
        response = await UserService.updateUser(user.id, formData);
      }

      if (response) {
        toast({
          title: isCreating ? "User Created" : "User Updated",
          description: `Successfully ${isCreating ? "created" : "updated"} user ${formData.name}`,
        });
        onUserSaved();
      } else {
        toast({
          title: "Error",
          description: `Failed to ${isCreating ? "create" : "update"} user. Please try again.`,
          variant: "destructive",
        });
      }

    } catch (error) {
      console.log(error);

      if (error?.response.data?.field === 'email') { // Check for our specific error field
        setErrors({ email: error.response.data.error });
        toast({
          title: "Error",
          description: "Please correct the errors below.",
          variant: "destructive",
        });
      }
      else if (error?.response?.data?.errors) {
        const formattedErrors = {};
        error.response.data.errors.forEach((err) => {
          formattedErrors[err.path] = err.msg;
        });
        setErrors(formattedErrors);
        toast({
          title: "Error",
          description: "Please correct the errors below.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: `Failed to ${isCreating ? "create" : "update"} user. ${error.message}`,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        {errors.name && <p className="text-red-500">{errors.name}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        {errors.email && <p className="text-red-500">{errors.email}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select
          name="role"
          value={formData.role}
          onValueChange={handleRoleChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
        {errors.role && <p className="text-red-500">{errors.role}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required={isCreating}
        />
        {errors.password && <p className="text-red-500">{errors.password}</p>}
      </div>
      <Button type="submit" className="w-full">
        {isCreating ? "Create User" : "Update User"}
      </Button>
    </form>
  );
}