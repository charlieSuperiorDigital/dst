"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface User {
  id: string;
  fullName: string;
  login: string;
  email: string;
  active: boolean;
  verified: boolean;
}

interface UserEditModalProps {
  user: User | null;
  isOpen: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: (user: User) => Promise<void>;
}

export function UserEditModal({
  user,
  isOpen,
  isSaving,
  onClose,
  onSave,
}: UserEditModalProps) {
  const [editedUser, setEditedUser] = useState<User | null>(null);

  // Reset edited user when modal opens with new user
  if (user && !editedUser) {
    setEditedUser({ ...user });
  }

  const handleSave = async () => {
    if (!editedUser) return;
    await onSave(editedUser);
  };

  const handleClose = () => {
    setEditedUser(null);
    onClose();
  };

  if (!editedUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fullName" className="text-right">
              Full Name
            </Label>
            <Input
              id="fullName"
              value={editedUser.fullName}
              onChange={(e) =>
                setEditedUser({ ...editedUser, fullName: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          {/* <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="login" className="text-right">
              Login
            </Label>
            <Input
              id="login"
              value={editedUser.login}
              className="col-span-3"
              disabled
            />
          </div> */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={editedUser.email}
              onChange={(e) =>
                setEditedUser({ ...editedUser, email: e.target.value })
              }
              className="col-span-3"
            />
          </div>
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
