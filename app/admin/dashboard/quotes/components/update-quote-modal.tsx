"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { Quotes, QuotesStatus } from "@/app/entities/Quotes";
import { QuotesStatusDropdown } from "./status-quote-dropdown";
import { UserDropdown } from "./user-dropdow";

interface EditQuoteDialogProps {
  quote: Quotes | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedPart: Quotes) => void;
}

export function UpdateQuoteModal({
  quote,
  open,
  onOpenChange,
  onSave,
}: EditQuoteDialogProps) {
  const [editedPart, setEditedPart] = useState<Quotes | null>(quote);
  const [status, setStatus] = useState<QuotesStatus>(
    quote?.status || QuotesStatus.New
  );

  useEffect(() => {
    if (quote) {
      setEditedPart({ ...quote });
    }
  }, [quote]);

  if (!editedPart) return "nothin here";

  const handleSave = () => {
    onSave(editedPart);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Part: {editedPart.id}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Name
            </Label>
            <Input
              id="description"
              value={editedPart.name}
              onChange={(e) =>
                setEditedPart({ ...editedPart, name: e.target.value })
              }
              className="col-span-3"
            />
          </div>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="unitWeight" className="text-right">
            Status
          </Label>
          <QuotesStatusDropdown
            value={status}
            onChange={(newStatus) => {
              setStatus(newStatus);
              setEditedPart((prevState) => ({
                ...prevState!,
                status: newStatus,
              }));
            }}
          />
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
