import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Part } from "@/app/entities/Part";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { PaintTypeDropdown } from "./paint-type-dropdow";
import { paintTypes } from "@/app/entities/colors-enum";
import { ErrorModal } from "./error-modal";

interface Props {
  part: Part;
  isOpen: boolean;
  onClose: () => void;
  onClone: (part: Part) => Promise<void>;
}

export function ClonePartDialog({ part, isOpen, onClose, onClone }: Props) {
  const [editedPart, setEditedPart] = useState<Part | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize state when modal opens
  useEffect(() => {
    if (isOpen && part) {
      setEditedPart({ ...part });
      setError(null);
    }
  }, [isOpen, part]);

  const handleClose = () => {
    setEditedPart(null);
    setError(null);
    onClose();
  };

  const handleClone = async () => {
    try {
      if (!editedPart) return;
      await onClone(editedPart);
      handleClose();
    } catch (error) {
      console.error("Error cloning part:", error);
      setError("Failed to clone part. Please try again.");
    }
  };

  const handleColorChange = (colorId: string) => {
    if (colorId && editedPart) {
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

  if (!editedPart) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Clone Part</DialogTitle>
            <DialogDescription>
              Create a copy of part number {part.partNumber} with new properties.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="partNumber" className="text-right">
                Part Number *
              </Label>
              <Input
                id="partNumber"
                value={editedPart.partNumber}
                onChange={(e) => {
                  setEditedPart({ ...editedPart, partNumber: e.target.value });
                  setError(null);
                }}
                className="col-span-3"
                placeholder="Enter part number"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={editedPart.description}
                onChange={(e) => {
                  setEditedPart({ ...editedPart, description: e.target.value });
                  setError(null);
                }}
                className="col-span-3"
                placeholder="Enter description"
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
                type="number"
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
                type="number"
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
              <Label htmlFor="laborEA" className="text-right">
                Labor EA
              </Label>
              <Input
                id="laborEA"
                type="number"
                value={editedPart.laborEA}
                onChange={(e) =>
                  setEditedPart({
                    ...editedPart,
                    laborEA: Number(e.target.value),
                  })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleClone}>Clone Part</Button>
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