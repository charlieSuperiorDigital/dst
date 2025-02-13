"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUsers } from "@/hooks/use-users";
import { UserEditModal } from "@/components/users/user-edit-modal";
import { DeleteConfirmationModal } from "@/components/users/delete-confirmation-modal";
import { ErrorModal } from "@/components/error-modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";

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

type SortColumn = "fullName" | "email" | "active";

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
  const [orderBy, setOrderBy] = useState<SortColumn>("fullName");
  const [isAscending, setIsAscending] = useState(true);

  const isError = (error: unknown): error is Error => {
    return error instanceof Error;
  };

  useEffect(() => {
    fetchUsers(search, page, orderBy, isAscending);
  }, [page, search, orderBy, isAscending]);

  const handleSort = (column: SortColumn) => {
    if (orderBy === column) {
      setIsAscending(!isAscending);
    } else {
      setOrderBy(column);
      setIsAscending(true);
    }
  };

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
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorState({
          title: "Error Updating User",
          message: error.message || "Failed to update user. Please try again.",
        });
      } else {
        setErrorState({
          title: "Error Updating User",
          message: "Failed to update user. Please try again.",
        });
      }
    }
  };

  const handleRegisterUser = async (user: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    try {
      const success = await registerUser(user);
      if (success) {
        handleCloseModal();
        return true;
      }
      return false;
    } catch (error: unknown) {
      if (isError(error)) {
        setErrorState({
          title: "Error Registering User",
          message: error.message || "Failed to register user. Please try again.",
        });
      } else {
        setErrorState({
          title: "Error Registering User",
          message: "Failed to register user. Please try again.",
        });
      }
    }
    return false;
  };

  const handleDeleteUser = (e: React.MouseEvent, user: User) => {
    e.stopPropagation();
    setUserToDelete(user);
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      try {
        const success = await deleteUser(userToDelete.id);
        if (success) {
          setUserToDelete(null);
        }
      } catch (error: unknown) {
        if (isError(error)) {
          setErrorState({
            title: "Error Deleting User",
            message: error.message || "Failed to delete user. Please try again.",
          });
        } else {
          setErrorState({
            title: "Error Deleting User",
            message: "Failed to delete user. Please try again.",
          });
        }
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers(search, 1, orderBy, isAscending);
  };

  const handlePageJump = (direction: 'forward' | 'backward', amount: number) => {
    if (direction === 'forward') {
      const newPage = Math.min(page + amount, totalPages);
      setPage(newPage);
    } else {
      const newPage = Math.max(page - amount, 1);
      setPage(newPage);
    }
  };

  const getVisiblePages = (currentPage: number, totalPages: number) => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
        </form>
        <Button
          variant="success"
          onClick={() =>
            handleUserClick({
              id: "",
              fullName: "",
              email: "",
              active: true,
              verified: false,
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("fullName")}
                  className="flex items-center gap-1 h-8 px-2"
                >
                  Name
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("email")}
                  className="flex items-center gap-1 h-8 px-2"
                >
                  Email
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("active")}
                  className="flex items-center gap-1 h-8 px-2"
                >
                  Status
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  Loading...
                </TableCell>
              </TableRow>
            ) : users && users.length > 0 ? (
              users.map((user) => (
                <TableRow
                  key={user.id}
                  className={`${
                    !user.active ? "opacity-60" : ""
                  } cursor-pointer hover:bg-muted even:bg-gray-50`}
                  onClick={() => handleUserClick(user)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-sm">
                          {user.fullName.charAt(0)}
                        </span>
                      </div>
                      <span>{user.fullName}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {user.verified && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          Verified
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded ${
                        user.active 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {user.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Pencil
                              size={20}
                              onClick={() => handleUserClick(user)}
                              className="cursor-pointer text-orange-500 hover:text-orange-600"
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit user details</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Trash2
                              size={20}
                              onClick={(e) => handleDeleteUser(e, user)}
                              className="cursor-pointer text-red-500 hover:text-red-600"
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete user</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-center mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="ghost"
                onClick={() => page > 1 && handlePageJump('backward', 1)}
                className={`h-9 w-9 p-0 ${page <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </PaginationItem>
            
            {getVisiblePages(page, totalPages).map((pageNum, idx) => (
              <PaginationItem key={idx}>
                {pageNum === '...' ? (
                  <span className="px-4 py-2">...</span>
                ) : (
                  <PaginationLink
                    onClick={() => setPage(Number(pageNum))}
                    isActive={page === pageNum}
                    className="cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <Button
                variant="ghost"
                onClick={() => page < totalPages && handlePageJump('forward', 1)}
                className={`h-9 w-9 p-0 ${page >= totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={page >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

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
