"use client";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { UserForm } from "@/components/users-manage/user-form";
import { UserList } from "@/components/users-manage/user-list";
import { UserService } from "@/services/user-service";

export default function UserManagement() {

    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setIsCreating(false);
        setIsSidebarOpen(true);
    };

    const handleCreateUser = () => {
        setSelectedUser(null);
        setIsCreating(true);
        setIsSidebarOpen(true);
    };

    const handleUserSaved = () => {
        setSelectedUser(null);
        setIsCreating(false);
        setIsSidebarOpen(false);
        fetchUsers()
    };

    const fetchUsers = async () => {
        try {
            const usersData = await UserService.getAllUsers();
            setUsers(usersData);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        }
    };

    useEffect(()=>{
        console.log(JSON.parse(Cookies.get("user")));
    },[])

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">User Management</h1>
                <   Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                    <SheetTrigger asChild>
                        <Button onClick={handleCreateUser}>
                            <PlusIcon className="mr-2 h-4 w-4" /> Create User
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-[425px]">
                        <SheetHeader>
                            <SheetTitle>
                                {isCreating ? "Create User" : "Edit User"}
                            </SheetTitle>
                        </SheetHeader>
                        <UserForm
                            user={selectedUser}
                            isCreating={isCreating}
                            onUserSaved={handleUserSaved}
                        />
                    </SheetContent>
                </Sheet>
            </div>
            <UserList users={users} onEditUser={handleEditUser} fetchUsers={fetchUsers} />
        </div>
    );
}