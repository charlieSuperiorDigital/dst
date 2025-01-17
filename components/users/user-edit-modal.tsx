"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff } from "lucide-react";

interface User {
  id: string;
  fullName: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  active: boolean;
  verified: boolean;
}

interface UserEditModalProps {
  user: User | null;
  isOpen: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: (user: User) => Promise<void>;
  onRegister?: (user: { fullName: string; email: string; password: string; confirmPassword: string }) => Promise<boolean>;
}

export function UserEditModal({
  user,
  isOpen,
  isSaving,
  onClose,
  onSave,
  onRegister,
}: UserEditModalProps) {
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  // Reset edited user when modal opens with new user
  if (user && !editedUser) {
    setEditedUser({ ...user });
  }

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    
    if (!editedUser?.fullName?.trim()) {
      errors.fullName = "Full name is required";
    }
    
    if (!editedUser?.email?.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedUser.email)) {
      errors.email = "Invalid email format";
    }

    if (!editedUser?.id) { // New user
      if (!editedUser?.password) {
        errors.password = "Password is required";
      } else if (editedUser.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
      }

      if (!editedUser?.confirmPassword) {
        errors.confirmPassword = "Please confirm your password";
      } else if (editedUser.password !== editedUser.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!editedUser) return;

    if (!validateForm()) {
      return;
    }

    // If it's a new user (id is empty), use register
    if (!editedUser.id && onRegister && editedUser.password && editedUser.confirmPassword) {
      const success = await onRegister({
        fullName: editedUser.fullName,
        email: editedUser.email,
        password: editedUser.password,
        confirmPassword: editedUser.confirmPassword,
      });
      if (success) {
        handleClose();
      }
    } else {
      // Otherwise use normal save
      await onSave(editedUser);
    }
  };

  const handleClose = () => {
    setEditedUser(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setValidationErrors({});
    if (user) {
      user.password = "";  // Clear the password in the parent state
      user.confirmPassword = "";
      user.password = ""; // Clear the password in the parent state
    }
    onClose();
  };

  if (!editedUser) return null;

  const isNewUser = !editedUser.id;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isNewUser ? 'Create User' : 'Edit User Details'}</DialogTitle>
          <DialogDescription>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fullName" className="text-right">
              Full Name
            </Label>
            <div className="col-span-3">
              <Input
                id="fullName"
                value={editedUser.fullName}
                onChange={(e) =>
                  setEditedUser({ ...editedUser, fullName: e.target.value })
                }
                className={validationErrors.fullName ? "border-red-500" : ""}
              />
              {validationErrors.fullName && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.fullName}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <div className="col-span-3">
              <Input
                id="email"
                type="email"
                value={editedUser.email}
                onChange={(e) =>
                  setEditedUser({ ...editedUser, email: e.target.value })
                }
                className={validationErrors.email ? "border-red-500" : ""}
              />
              {validationErrors.email && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.email}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              Password
            </Label>
            <div className="col-span-3 relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={editedUser.password || ""}
                onChange={(e) =>
                  setEditedUser({ ...editedUser, password: e.target.value })
                }
                className={`pr-10 ${validationErrors.password ? "border-red-500" : ""}`}
                required={isNewUser}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </button>
              {validationErrors.password && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.password}</p>
              )}
            </div>
          </div>
          {isNewUser && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="confirmPassword" className="text-right">
                Confirm Password
              </Label>
              <div className="col-span-3 relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={editedUser.confirmPassword || ""}
                  onChange={(e) =>
                    setEditedUser({ ...editedUser, confirmPassword: e.target.value })
                  }
                  className={`pr-10 ${validationErrors.confirmPassword ? "border-red-500" : ""}`}
                  required={isNewUser}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </button>
                {validationErrors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.confirmPassword}</p>
                )}
              </div>
            </div>
          )}
          {!isNewUser && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Active</Label>
                <Switch
                  checked={editedUser.active}
                  onCheckedChange={(checked) =>
                    setEditedUser({ ...editedUser, active: checked })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Verified</Label>
                <Switch
                  checked={editedUser.verified}
                  onCheckedChange={(checked) =>
                    setEditedUser({ ...editedUser, verified: checked })
                  }
                />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="destructive" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : isNewUser ? "Create" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
