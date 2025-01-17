"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUsers } from "@/hooks/use-users";
import { UserEditModal } from "@/components/users/user-edit-modal";
import { DeleteConfirmationModal } from "@/components/users/delete-confirmation-modal";
import { ErrorModal } from "@/components/error-modal";
import { Plus, Trash2 } from "lucide-react";

interface User {
  id: string;
  fullName: string;
  email: string;
  active: boolean;
  verified: boolean;
  password?: string;
}

interface ErrorState {
  title: string;
  message: string;
}

export default function UserListPage() {
  const {
    users,
    totalPages,
    isLoading,
    isSaving,
    error,
    fetchUsers,
    updateUserDetails,
    registerUser,
    deleteUser,
  } = useUsers();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [errorState, setErrorState] = useState<ErrorState | null>(null);

  useEffect(() => {
    fetchUsers(search, page);
  }, [page, search]);

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
  };

  const handleCloseModal = () => {
    if (selectedUser) {
      selectedUser.password = "";
    }
    setSelectedUser(null);
  };

  const handleSaveChanges = async (editedUser: User) => {
    try {
      const success = await updateUserDetails(editedUser);
      if (success) {
        editedUser.password = "";
        handleCloseModal();
      }
    } catch (error: any) {
      setErrorState({
        title: "Error Updating User",
        message: error.message || "Failed to update user. Please try again.",
      });
    }
  };

  const handleRegisterUser = async (user: { fullName: string; email: string; password: string; confirmPassword: string }) => {
    try {
      const success = await registerUser(user);
      if (success) {
        handleCloseModal();
        return true;
      }
      return false;
    } catch (error: any) {
      setErrorState({
        title: "Error Creating User",
        message: error.message || "Failed to create user. Please try again.",
      });
      return false;
    }
  };

  const handleDeleteUser = async (e: React.MouseEvent, user: User) => {
    e.stopPropagation(); // Prevent card click event
    setUserToDelete(user);
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      try {
        const success = await deleteUser(userToDelete.id);
        if (success) {
          setUserToDelete(null);
        }
      } catch (error: any) {
        setErrorState({
          title: "Error Deleting User",
          message: error.message || "Failed to delete user. Please try again.",
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <form className="flex gap-2">
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
        </form>
        <Button variant="success" onClick={() => handleUserClick({ id: '', fullName: '', email: '', active: true, verified: false })}>
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users && users.length > 0
              ? users.map((user) => (
                  <Card
                    key={user.id}
                    className={`${
                      !user.active ? "opacity-60" : ""
                    } cursor-pointer hover:shadow-lg transition-shadow relative group`}
                    onClick={() => handleUserClick(user)}
                  >
                    <CardHeader className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-sm">
                            {user.fullName.charAt(0)}
                          </span>
                        </div>
                        <CardTitle className="text-base">{user.fullName}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <div className="flex gap-2 mt-2">
                        {user.verified && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                            Verified
                          </span>
                        )}
                        {!user.active && (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                    </CardContent>
                    <button
                      onClick={(e) => handleDeleteUser(e, user)}
                      className="absolute top-2 right-2 p-2 text-red-500"
                      title="Delete user"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </Card>
                ))
              : !isLoading && (
                  <div className="col-span-3 text-center py-8 text-gray-500">
                    No users found
                  </div>
                )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      <UserEditModal
        user={selectedUser}
        isOpen={!!selectedUser}
        isSaving={isSaving}
        onClose={handleCloseModal}
        onSave={handleSaveChanges}
        onRegister={handleRegisterUser}
      />

      <DeleteConfirmationModal
        isOpen={!!userToDelete}
        userName={userToDelete?.fullName || ""}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isSaving}
      />

      <ErrorModal
        isOpen={!!errorState}
        title={errorState?.title}
        error={errorState?.message || ""}
        onClose={() => setErrorState(null)}
      />
    </div>
  );
}
