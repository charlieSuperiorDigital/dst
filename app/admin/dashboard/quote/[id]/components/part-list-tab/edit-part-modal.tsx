"use client";

import { PartList } from "@/app/entities/PartList";
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
import { PaintTypeDropdown } from "@/app/admin/dashboard/components/paint-type-dropdow";
import { paintTypes } from "@/app/entities/colors-enum";
import { formatCurrency } from "@/utils/format-currency";

interface EditPartDialogProps {
  part: PartList | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedPart: PartList) => void;
  onDelete: (deletePart: PartList) => void;
}

export function EditPartDialog({
  part,
  open,
  onOpenChange,
  onSave,
  onDelete,
}: EditPartDialogProps) {
  const [editedPart, setEditedPart] = useState<PartList | null>(null);
  const [tempValues, setTempValues] = useState({
    laborEA: "",
    unitCost: "",
    unitLabor: "",
    unitMatLb: "",
    unitSell: "",
    unitWeight: ""
  });

  useEffect(() => {
    if (part) {
      // Convert null values to appropriate defaults
      const sanitizedPart = {
        ...part,
        qty: part.qty ?? undefined, // Convert null to undefined for qty
        color: part.color ?? undefined, // Convert null to undefined for color
        description: part.description ?? '', // Convert null to empty string for description
        partNumber: part.partNumber ?? '', // Convert null to empty string for partNumber
        unitWeight: part.unitWeight ?? 0, // Convert null to 0 for numeric values
        unitLabor: part.unitLabor ?? 0,
        unitMatLb: part.unitMatLb ?? 0,
        unitSell: part.unitSell ?? 0,
        unitCost: part.unitCost ?? 0,
        laborEA: part.laborEA ?? 0
      };
      setEditedPart(sanitizedPart as PartList);
      setTempValues({
        laborEA: Number(sanitizedPart.laborEA).toFixed(2),
        unitCost: Number(sanitizedPart.unitCost).toFixed(2),
        unitLabor: Number(sanitizedPart.unitLabor).toFixed(2),
        unitMatLb: Number(sanitizedPart.unitMatLb).toFixed(2),
        unitSell: Number(sanitizedPart.unitSell).toFixed(2),
        unitWeight: Number(sanitizedPart.unitWeight).toFixed(2)
      });
    }
  }, [part]);

  if (!editedPart) return null;

  const handleSave = () => {
    onSave(editedPart);
    onOpenChange(false);
  };

  const handleDelete = () => {
    onDelete(editedPart);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Part: {editedPart.partNumber}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="partNumber" className="text-right">
              Part Number
            </Label>
            <Input
              id="partNumber"
              value={editedPart.partNumber}
              onChange={(e) =>
                setEditedPart({ ...editedPart, partNumber: e.target.value })
              }
              className="col-span-3"
            />
          </div>
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
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="colorId" className="text-right">
              Color
            </Label>
            <div className="col-span-3">
              <PaintTypeDropdown
                value={editedPart.colorId?.toString() || "1"}
                paintTypes={paintTypes}
                onChange={(colorId) => 
                  setEditedPart({ 
                    ...editedPart, 
                    colorId: parseInt(colorId),
                    color: paintTypes.find(p => p.id === parseInt(colorId)) || paintTypes[0]
                  })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="laborEA" className="text-right">
              Labor EA
            </Label>
            <Input
              id="laborEA"
              type="number"
              step="0.01"
              value={tempValues.laborEA}
              onChange={(e) => setTempValues({ ...tempValues, laborEA: e.target.value })}
              onBlur={() => {
                const newVal = parseFloat(tempValues.laborEA);
                if (!isNaN(newVal) && editedPart) {
                  setEditedPart({ ...editedPart, laborEA: newVal });
                  setTempValues({ ...tempValues, laborEA: newVal.toFixed(2) });
                }
              }}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="unitCost" className="text-right">
              Unit Cost
            </Label>
            <div className="col-span-3 relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
              <Input
                id="unitCost"
                type="number"
                step="0.01"
                value={tempValues.unitCost}
                onChange={(e) => setTempValues({ ...tempValues, unitCost: e.target.value })}
                onBlur={() => {
                  const newVal = parseFloat(tempValues.unitCost);
                  if (!isNaN(newVal) && editedPart) {
                    setEditedPart({ ...editedPart, unitCost: newVal });
                    setTempValues({ ...tempValues, unitCost: newVal.toFixed(2) });
                  }
                }}
                className="pl-6"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="unitLabor" className="text-right">
              Unit Labor
            </Label>
            <Input
              id="unitLabor"
              type="number"
              step="0.01"
              value={tempValues.unitLabor}
              onChange={(e) => setTempValues({ ...tempValues, unitLabor: e.target.value })}
              onBlur={() => {
                const newVal = parseFloat(tempValues.unitLabor);
                if (!isNaN(newVal) && editedPart) {
                  setEditedPart({ ...editedPart, unitLabor: newVal });
                  setTempValues({ ...tempValues, unitLabor: newVal.toFixed(2) });
                }
              }}
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
              step="0.01"
              value={tempValues.unitMatLb}
              onChange={(e) => setTempValues({ ...tempValues, unitMatLb: e.target.value })}
              onBlur={() => {
                const newVal = parseFloat(tempValues.unitMatLb);
                if (!isNaN(newVal) && editedPart) {
                  setEditedPart({ ...editedPart, unitMatLb: newVal });
                  setTempValues({ ...tempValues, unitMatLb: newVal.toFixed(2) });
                }
              }}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="unitSell" className="text-right">
              Unit Sell
            </Label>
            <div className="col-span-3 relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
              <Input
                id="unitSell"
                type="number"
                step="0.01"
                value={tempValues.unitSell}
                onChange={(e) => setTempValues({ ...tempValues, unitSell: e.target.value })}
                onBlur={() => {
                  const newVal = parseFloat(tempValues.unitSell);
                  if (!isNaN(newVal) && editedPart) {
                    setEditedPart({ ...editedPart, unitSell: newVal });
                    setTempValues({ ...tempValues, unitSell: newVal.toFixed(2) });
                  }
                }}
                className="pl-6"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="unitWeight" className="text-right">
              Unit Weight
            </Label>
            <Input
              id="unitWeight"
              type="number"
              step="0.01"
              value={tempValues.unitWeight}
              onChange={(e) => setTempValues({ ...tempValues, unitWeight: e.target.value })}
              onBlur={() => {
                const newVal = parseFloat(tempValues.unitWeight);
                if (!isNaN(newVal) && editedPart) {
                  setEditedPart({ ...editedPart, unitWeight: newVal });
                  setTempValues({ ...tempValues, unitWeight: newVal.toFixed(2) });
                }
              }}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <div className="flex justify-between w-full">
            <Button type="submit" variant="destructive" onClick={handleDelete}>
              Delete part
            </Button>
            <Button type="submit" variant="success" onClick={handleSave}>
              Save changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
