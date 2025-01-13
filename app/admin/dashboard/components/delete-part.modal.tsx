"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Part } from "@/app/entities/Part";

interface AddPartDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (newPart: Part) => void;
  part: Part | null;
}

export function DeletePartDialog({
  isOpen,
  onClose,
  onDelete,
  part,
}: AddPartDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDelete(part as Part);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Part</DialogTitle>
        </DialogHeader>
        <div>
          <p>Are you sure you want to delete this part? {part?.description}</p>

          <div className="flex space-x-4 mt-4">
            <Button className="w-full" onClick={handleSubmit}>
              Delete
            </Button>
            <Button className="w-full" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
