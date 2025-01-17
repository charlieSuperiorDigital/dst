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
import { ErrorModal } from "./error-modal";

interface EditPartDialogProps {
  part: Part | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedPart: Part) => void;
  onClone?: (part: Part) => void;
}

export function UpdatePartDialog({
  part,
  open,
  onOpenChange,
  onSave,
  onClone,
}: EditPartDialogProps) {
  const [editedPart, setEditedPart] = useState<Part | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (part) {
      setEditedPart({ ...part });
    }
  }, [part]);

  if (!editedPart) return null;

  const handleSave = () => {
    try {
      onSave(editedPart);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving part:", error);
      setError("Failed to save part. Please try again.");
    }
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
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Part: {editedPart.partNumber}</DialogTitle>
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="partNumber" className="text-right">
                Part Number
              </Label>
              <Input
                id="partNumber"
                value={editedPart.partNumber}
                onChange={(e) =>
                  setEditedPart({
                    ...editedPart,
                    partNumber: e.target.value,
                  })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <Button
              type="button"
              variant="success"
              onClick={() => onClone && part && onClone(part)}
              className="mr-auto"
            >
              Clone Part
            </Button>
            <div className="flex gap-2">
              <Button variant="destructive" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" onClick={handleSave}>
                Save changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ErrorModal
        isOpen={!!error}
        onClose={() => setError(null)}
        message={error || ""}
      />
    </>
  );
}
