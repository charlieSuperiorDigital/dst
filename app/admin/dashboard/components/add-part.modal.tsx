"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Part } from "@/app/entities/Part";
import { PaintTypeDropdown } from "./paint-type-dropdow";
import { paintTypes } from "@/app/entities/colors-enum";

interface AddPartDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newPart: Part) => void;
}

export function AddPartDialog({ isOpen, onClose, onAdd }: AddPartDialogProps) {
  const [newPart, setNewPart] = useState<Partial<Part>>({
    description: "",
    colorId: 1,
    partNumber: "",
    laborEA: 0,
    unitCost: 0,
    unitLabor: 0,
    unitMatLb: 0,
    unitSell: 0,
    unitWeight: 0,
  });

  const handleColorChange = (colorId: string) => {
    if (colorId) {
      setNewPart({
        ...newPart,
        colorId: Number(colorId),
        color: paintTypes.find((p) => p.id === Number(colorId)) || {
          id: 0,
          name: "Color not found",
          description: "Color not found",
        },
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPart({
      ...newPart,
      [name]:
        name === "description" || name === "partNumber"
          ? value
          : parseFloat(value),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(newPart as Part);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Part</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="partNumber">Part Number</Label>
            <Input
              id="partNumber"
              name="partNumber"
              value={newPart.partNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              value={newPart.description}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="colorId">Color ID</Label>
            <PaintTypeDropdown
              value={newPart.colorId?.toString() || "0"}
              paintTypes={paintTypes}
              onChange={handleColorChange}
            />
          </div>
          <div>
            <Label htmlFor="unitWeight">Unit Weight</Label>
            <Input
              id="unitWeight"
              name="unitWeight"
              type="number"
              step="0.01"
              value={newPart.unitWeight}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="unitMatLb">Unit Mat/lb</Label>
            <Input
              id="unitMatLb"
              name="unitMatLb"
              type="number"
              step="0.01"
              value={newPart.unitMatLb}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="unitLabor">Unit Labor</Label>
            <Input
              id="unitLabor"
              name="unitLabor"
              type="number"
              step="0.01"
              value={newPart.unitLabor}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="unitCost">Unit Cost</Label>
            <Input
              id="unitCost"
              name="unitCost"
              type="number"
              step="0.01"
              value={newPart.unitCost}
              onChange={handleChange}
              required
            />
          </div>
          {/* <div>
            <Label htmlFor="unitSell">Unit Sell</Label>
            <Input
              id="unitSell"
              name="unitSell"
              type="number"
              step="0.01"
              value={newPart.unitSell}
              onChange={handleChange}
              required
            />
          </div> */}
          <div>
            <Label htmlFor="laborEA">Labor EA</Label>
            <Input
              id="laborEA"
              name="laborEA"
              type="number"
              step="0.01"
              value={newPart.laborEA}
              onChange={handleChange}
              required
            />
          </div>
          <Button type="submit">Add Part</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
