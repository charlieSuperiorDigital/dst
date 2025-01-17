import { useState } from "react";
import { getUserList, updateUser } from "@/utils/client-side-api";
import { toast } from "sonner";
import axios from "axios";

interface User {
  id: string;
  fullName: string;
  email: string;
  active: boolean;
  verified: boolean;
  password?: string;
}

interface UseUsersReturn {
  users: User[];
  totalPages: number;
  isLoading: boolean;
  isSaving: boolean;
  error: string;
  fetchUsers: (search: string, page: number) => Promise<void>;
  updateUserDetails: (user: User) => Promise<boolean>;
  registerUser: (user: { fullName: string; email: string; password: string; confirmPassword: string }) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchUsers = async (search: string, page: number) => {
    setIsLoading(true);
    setError("");
    try {
      const data = await getUserList(search, page);
      setUsers(data.users || []);
      setTotalPages(Math.ceil(data.totalCount / data.perPage));
    } catch (error: any) {
      setError("Failed to load users. Please try again later.");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserDetails = async (user: User): Promise<boolean> => {
    setIsSaving(true);
    try {
      await updateUser({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        active: user.active,
        verified: user.verified,
        password: user.password,
      });

      // Update the local state with cleared password
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === user.id ? { ...user, password: "" } : u))
      );

      toast.success("User updated successfully");
      return true;
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error(error.message || "Failed to update user");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const registerUser = async (user: { 
    fullName: string; 
    email: string; 
    password: string; 
    confirmPassword: string 
  }): Promise<boolean> => {
    setIsSaving(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/authorization/register`,
        user,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast.success("User created successfully");
        // Refresh the user list
        await fetchUsers("", 1);
        return true;
      } else {
        throw new Error("Failed to create user");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.response?.data?.errors?.confirmPassword?.[0] || error.message || "Failed to create user");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    setIsSaving(true);
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/User/${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast.success("User deleted successfully");
        // Update local state by removing the deleted user
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        return true;
      } else {
        throw new Error("Failed to delete user");
      }
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete user");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    users,
    totalPages,
    isLoading,
    isSaving,
    error,
    fetchUsers,
    updateUserDetails,
    registerUser,
    deleteUser,
  };
} 