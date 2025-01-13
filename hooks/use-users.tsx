import { useState } from "react";
import { getUserList, updateUser } from "@/utils/client-side-api";
import { toast } from "sonner";

interface User {
  id: string;
  fullName: string;
  login: string;
  email: string;
  active: boolean;
  verified: boolean;
}

interface UseUsersReturn {
  users: User[];
  totalPages: number;
  isLoading: boolean;
  isSaving: boolean;
  error: string;
  fetchUsers: (search: string, page: number) => Promise<void>;
  updateUserDetails: (user: User) => Promise<boolean>;
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
      });

      // Update the local state
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === user.id ? user : u))
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

  return {
    users,
    totalPages,
    isLoading,
    isSaving,
    error,
    fetchUsers,
    updateUserDetails,
  };
} 