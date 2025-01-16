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

interface EditPartDialogProps {
  part: PartList | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedPart: PartList) => void;
}

export function EditPartDialog({
  part,
  open,
  onOpenChange,
  onSave,
}: EditPartDialogProps) {
  const [editedPart, setEditedPart] = useState<PartList | null>(null);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Part: {editedPart.partNo}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="partNo" className="text-right">
              Part Number
            </Label>
            <Input
              id="partNo"
              value={editedPart.partNo}
              onChange={(e) =>
                setEditedPart({ ...editedPart, partNo: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="qty" className="text-right">
              Quantity
            </Label>
            <Input
              id="qty"
              value={editedPart.qty}
              onChange={(e) =>
                setEditedPart({ ...editedPart, qty: Number(e.target.value) })
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
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="color" className="text-right">
              Color
            </Label>
            <Input
              id="color"
              value={editedPart.color}
              onChange={(e) =>
                setEditedPart({ ...editedPart, color: e.target.value })
              }
              className="col-span-3"
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
            <Label htmlFor="totalWeight" className="text-right">
              Total Weight
            </Label>
            <Input
              id="totalWeight"
              value={editedPart.unitWeight * editedPart.qty}
              onChange={(e) =>
                setEditedPart({
                  ...editedPart,
                  totalWeight: Number(e.target.value),
                })
              }
              disabled={true}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="unitMatLb" className="text-right">
              Unit Mat/lb
            </Label>
            <Input
              id="unitMatLb"
              value={editedPart.unitMatLb.toString()}
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
              value={editedPart.unitLabor.toString()}
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
            <Label htmlFor="unitCost" className="text-right">
              Unit Cost
            </Label>
            <Input
              id="unitCost"
              value={
                editedPart.unitWeight * editedPart.unitMatLb +
                editedPart.unitLabor
              }
              disabled={true}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="totalCost" className="text-right">
              Total Cost
            </Label>
            <Input
              id="totalCost"
              value={
                (editedPart.unitWeight * editedPart.unitMatLb +
                  editedPart.unitLabor) *
                editedPart.qty
              }
              disabled={true}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
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
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="totalSell" className="text-right">
              Total Sell
            </Label>
            <Input
              id="totalSell"
              value={editedPart.totalSell}
              onChange={(e) =>
                setEditedPart({
                  ...editedPart,
                  totalSell: Number(e.target.value),
                })
              }
              className="col-span-3"
            />
          </div>
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
