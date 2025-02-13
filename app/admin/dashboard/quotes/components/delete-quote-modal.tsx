"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { type Quotes } from "@/app/entities/Quotes";

interface DeleteQuoteModalProps {
  quote: Quotes | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (quote: Quotes) => void;
}

export function DeleteQuoteModal({
  quote,
  open,
  onOpenChange,
  onConfirm,
}: DeleteQuoteModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Quotation</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this quotation? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-2">
          <div className="flex-1">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
          <Button
            variant="destructive"
            onClick={() => quote && onConfirm(quote)}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 