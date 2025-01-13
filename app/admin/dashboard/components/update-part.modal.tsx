"use client";

import { Part } from "@/app/entities/Part";
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
import { PaintTypeDropdown } from "./paint-type-dropdow";
import { paintTypes } from "@/app/entities/colors-enum";

interface EditPartDialogProps {
  part: Part | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedPart: Part) => void;
}

export function UpdatePartDialog({
  part,
  open,
  onOpenChange,
  onSave,
}: EditPartDialogProps) {
  const [editedPart, setEditedPart] = useState<Part | null>(null);

  useEffect(() => {
    if (part) {
      setEditedPart({ ...part });
    }
  }, [part]);

  if (!editedPart) return null;

  const handleSave = () => {
    onSave(editedPart);
    onOpenChange(false);
  };

  const handleColorChange = (colorId: string) => {
    if (colorId) {
      setEditedPart({
        ...editedPart,
        colorId: Number(colorId),
        color: paintTypes.find((p) => p.id === Number(colorId)) || {
          id: 0,
          name: "Color not found",
          description: "Color not found",
        },
      });
    }
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
              Description
            </Label>
            <Input
              id="description"
              value={editedPart.description}
              onChange={(e) =>
                setEditedPart({ ...editedPart, description: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="color" className="text-right">
              Color
            </Label>
            <PaintTypeDropdown
              value={editedPart.colorId.toString()}
              paintTypes={paintTypes}
              onChange={handleColorChange}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="unitWeight" className="text-right">
              Unit Weight
            </Label>
            <Input
              id="unitWeight"
              type="number"
              value={editedPart.unitWeight}
              onChange={(e) =>
                setEditedPart({
                  ...editedPart,
                  unitWeight: parseFloat(e.target.value),
                })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="unitMatLb" className="text-right">
              Unit Mat/lb
            </Label>
            <Input
              id="unitMatLb"
              value={editedPart.unitMatLb}
              onChange={(e) =>
                setEditedPart({
                  ...editedPart,
                  unitMatLb: Number(e.target.value),
                })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="unitLabor" className="text-right">
              Unit Labor
            </Label>
            <Input
              id="unitLabor"
              value={editedPart.unitLabor}
              onChange={(e) =>
                setEditedPart({
                  ...editedPart,
                  unitLabor: Number(e.target.value),
                })
              }
              className="col-span-3"
            />
          </div>
          {/* <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="unitCost" className="text-right">
              Unit Cost
            </Label>
            <Input
              id="unitCost"
              value={editedPart.unitCost}
              onChange={(e) =>
                setEditedPart({
                  ...editedPart,
                  unitCost: Number(e.target.value),
                })
              }
              className="col-span-3"
            />
          </div> */}
          {/* <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="unitSell" className="text-right">
              Unit Sell
            </Label>
            <Input
              id="unitSell"
              value={editedPart.unitSell}
              onChange={(e) =>
                setEditedPart({
                  ...editedPart,
                  unitSell: Number(e.target.value),
                })
              }
              className="col-span-3"
            />
          </div> */}
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
