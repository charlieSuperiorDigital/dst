"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PartList } from "@/app/entities/PartList";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Plus } from "lucide-react";
import { Button } from "../ui/button";
interface AddPartDialogProps {
  onAdd: (newPart: PartList) => void;
  partList: PartList[];
}

export function AddPartFromPartlistModal({
  onAdd,
  partList,
}: AddPartDialogProps) {
  const [selectedPart, setSelectedPart] = useState<PartList | null>(null);
  const [open, setOpen] = useState(false);

  const onChange = (partId) => {
    const part = partList.find((part) => part.id === partId);
    onAdd(part as PartList);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Part
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Part</DialogTitle>
        </DialogHeader>
        <Select onValueChange={onChange} value={selectedPart?.id}>
          <SelectTrigger className=" w-[180px]">
            <SelectValue placeholder="Select a part" />
          </SelectTrigger>
          <SelectContent>
            {partList.map((paintType) => (
              <SelectItem key={paintType.id} value={paintType.id}>
                {paintType.description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </DialogContent>
    </Dialog>
  );
}
