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

interface User {
  id: string;
  fullName: string;
  login: string;
  email: string;
  active: boolean;
  verified: boolean;
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
  } = useUsers();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers(search, page);
  }, [page, search]);

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
  };

  const handleSaveChanges = async (editedUser: User) => {
    const success = await updateUserDetails(editedUser);
    if (success) {
      handleCloseModal();
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">User List</h1>
        <div className="flex gap-4">
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
        </div>
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
                    } cursor-pointer hover:shadow-lg transition-shadow`}
                    onClick={() => handleUserClick(user)}
                  >
                    <CardHeader>
                      <CardTitle>{user.fullName}</CardTitle>
                      {/* <CardDescription>{user.login}</CardDescription> */}
                    </CardHeader>
                    <CardContent>
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
      />
    </div>
  );
}
