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
  const defaultPartState = {
    description: "",
    colorId: 1,
    partNumber: "",
    laborEA: 0,
    unitCost: 0,
    unitLabor: 0,
    unitMatLb: 0,
    unitSell: 0,
    unitWeight: 0,
  };

  const [newPart, setNewPart] = useState<Partial<Part>>(defaultPartState);
  const [tempValues, setTempValues] = useState({
    laborEA: "0.00",
    unitCost: "0.00",
    unitLabor: "0.00",
    unitMatLb: "0.00",
    unitSell: "0.00",
    unitWeight: "0.000"
  });

  const handleCloseModal = (open: boolean) => {
    if (!open) {
      setNewPart(defaultPartState); // Reset form to default values
      setTempValues({
        laborEA: "0.00",
        unitCost: "0.00",
        unitLabor: "0.00",
        unitMatLb: "0.00",
        unitSell: "0.00",
        unitWeight: "0.000"
      });
    }
    onClose();
  };

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

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPart({
      ...newPart,
      [name]: value,
    });
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setTempValues({
      ...tempValues,
      [field]: e.target.value
    });
  };

  const handleNumericBlur = (field: string) => {
    const value = parseFloat(tempValues[field]);
    if (!isNaN(value)) {
      setNewPart({
        ...newPart,
        [field]: value
      });
      setTempValues({
        ...tempValues,
        [field]: field === 'unitWeight' ? value.toFixed(3) : value.toFixed(2)
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(newPart as Part);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
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
              onChange={handleTextChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              value={newPart.description}
              onChange={handleTextChange}
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="unitWeight" className="text-right">Unit Weight</Label>
            <div className="col-span-3">
              <Input
                id="unitWeight"
                name="unitWeight"
                type="number"
                step="0.001"
                value={tempValues.unitWeight}
                onChange={(e) => handleNumericChange(e, 'unitWeight')}
                onBlur={() => handleNumericBlur('unitWeight')}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4" style={{ display: "none" }}>
            <Label htmlFor="unitMatLb" className="text-right">Unit Mat/lb</Label>
            <div className="col-span-3">
              <Input
                id="unitMatLb"
                name="unitMatLb"
                type="number"
                step="0.01"
                value={tempValues.unitMatLb}
                onChange={(e) => handleNumericChange(e, 'unitMatLb')}
                onBlur={() => handleNumericBlur('unitMatLb')}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="unitLabor" className="text-right">Unit Labor</Label>
            <div className="col-span-3">
              <Input
                id="unitLabor"
                name="unitLabor"
                type="number"
                step="0.01"
                value={tempValues.unitLabor}
                onChange={(e) => handleNumericChange(e, 'unitLabor')}
                onBlur={() => handleNumericBlur('unitLabor')}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="unitCost" className="text-right">Unit Cost</Label>
            <div className="col-span-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                <Input
                  id="unitCost"
                  name="unitCost"
                  type="number"
                  step="0.01"
                  value={tempValues.unitCost}
                  onChange={(e) => handleNumericChange(e, 'unitCost')}
                  onBlur={() => handleNumericBlur('unitCost')}
                  required
                  className="pl-6"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="unitSell" className="text-right">Unit Sell</Label>
            <div className="col-span-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                <Input
                  id="unitSell"
                  name="unitSell"
                  type="number"
                  step="0.01"
                  value={tempValues.unitSell}
                  onChange={(e) => handleNumericChange(e, 'unitSell')}
                  onBlur={() => handleNumericBlur('unitSell')}
                  required
                  className="pl-6"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="laborEA" className="text-right">Labor EA</Label>
            <div className="col-span-3">
              <Input
                id="laborEA"
                name="laborEA"
                type="number"
                step="0.01"
                value={tempValues.laborEA}
                onChange={(e) => handleNumericChange(e, 'laborEA')}
                onBlur={() => handleNumericBlur('laborEA')}
                required
              />
            </div>
          </div>
          <div className="flex justify-between gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Part</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
