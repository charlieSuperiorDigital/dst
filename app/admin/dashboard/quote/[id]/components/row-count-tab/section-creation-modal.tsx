import type React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type RowData = {
  rowName: string;
  rowId: string;
};

export type SectionArea = {
  area: {
    id: string;
    quotationId: string;
    color: string;
    name: string;
  };
  rows: string[]; // Array of rowIds
};

interface SectionCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sectionData: SectionData) => void;
  onEdit: (sectionData: SectionData) => void;
  onRemove: (sectionId: string) => void;
  allRows: RowData[];
  existingSections: SectionArea[];
}

export type SectionData = {
  id?: string;
  name: string;
  rows: RowData[];
  color: string;
  removedRows?: string[];
  rowsToAdd?: string[];
};

const colors = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
];

export function SectionCreationModal({
  isOpen,
  onClose,
  onSubmit,
  onEdit,
  allRows,
  existingSections,
  onRemove,
}: SectionCreationModalProps) {
  const { toast } = useToast();
  const [isEditMode, setIsEditMode] = useState(false);
  const [sectionName, setSectionName] = useState("");
  const [selectedBays, setSelectedBays] = useState<RowData[]>([]);
  const [selectedColor, setSelectedColor] = useState("#3b82f6");
  const [selectedFrom, setSelectedFrom] = useState<string | null>(null);
  const [selectedTo, setSelectedTo] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null
  );
  const [removedRows, setRemovedRows] = useState<string[]>([]);
  const [nameError, setNameError] = useState<string | null>(null);

  const validateName = (name: string): boolean => {
    if (!name || !name.trim()) {
      setNameError("Section name cannot be empty");
      return false;
    }
    setNameError(null);
    return true;
  };

  const getAvailableRows = () => {
    const assignedRowIds = new Set(
      existingSections.flatMap((section) => section.rows)
    );
    return allRows.filter((row) => !assignedRowIds.has(row.rowId));
  };

  useEffect(() => {
    if (selectedFrom && selectedTo) {
      const fromIndex = allRows.findIndex((row) => row.rowId === selectedFrom);
      const toIndex = allRows.findIndex((row) => row.rowId === selectedTo);
      if (fromIndex !== -1 && toIndex !== -1) {
        const start = Math.min(fromIndex, toIndex);
        const end = Math.max(fromIndex, toIndex);
        const selectedRows = allRows.slice(start, end + 1);
        setSelectedBays(selectedRows);
      }
    }
  }, [selectedFrom, selectedTo, allRows]);

  useEffect(() => {
    if (isEditMode && selectedSectionId) {
      const sectionToEdit = existingSections.find(
        (section) => section.area.id === selectedSectionId
      );
      if (sectionToEdit) {
        setSectionName(sectionToEdit.area.name);
        setSelectedColor(sectionToEdit.area.color);

        const rowsForSection = allRows.filter((row) =>
          sectionToEdit.rows.includes(row.rowId)
        );
        setSelectedBays(rowsForSection);
      }
    } else {
      resetForm();
    }
  }, [isEditMode, selectedSectionId, existingSections, allRows]);

  const resetForm = () => {
    setSectionName("");
    setSelectedBays([]);
    setSelectedColor("#3b82f6");
    setSelectedFrom(null);
    setSelectedTo(null);
    setSelectedSectionId(null);
    setRemovedRows([]);
    setNameError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate name
    if (!validateName(sectionName)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid section name",
        variant: "destructive",
      });
      return;
    }

    // Validate at least one row is selected
    if (selectedBays.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one row",
        variant: "destructive",
      });
      return;
    }

    const rowsToAdd =
      isEditMode && selectedSectionId
        ? selectedBays
            .filter((bay) => {
              const section = existingSections.find(
                (s) => s.area.id === selectedSectionId
              );
              return section && !section.rows.includes(bay.rowId);
            })
            .map((bay) => bay.rowId)
        : undefined;

    const sectionData: SectionData = {
      id: selectedSectionId || undefined,
      name: sectionName.trim(),
      rows: selectedBays,
      color: selectedColor,
      removedRows: isEditMode ? removedRows : undefined,
      rowsToAdd: rowsToAdd,
    };

    if (isEditMode) {
      onEdit(sectionData);
    } else {
      onSubmit(sectionData);
    }
    onClose();
    resetForm();
  };

  const handleBayRemove = (bay: RowData) => {
    if (isEditMode && selectedSectionId) {
      const section = existingSections.find(
        (s) => s.area.id === selectedSectionId
      );

      if (section?.rows.includes(bay.rowId)) {
        setRemovedRows((prev) => [...prev, bay.rowId]);
      }
    }

    setSelectedBays((prev) => prev.filter((b) => b.rowId !== bay.rowId));
  };

  const handleDelete = () => {
    if (selectedSectionId) {
      console.log("Deleting section with ID:", selectedSectionId);
      onRemove(selectedSectionId);
      onClose();
      resetForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Section" : "Create New Section"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-between mb-4">
          <Label htmlFor="edit-mode">Edit Mode</Label>
          <Switch
            id="edit-mode"
            checked={isEditMode}
            onCheckedChange={setIsEditMode}
          />
        </div>
        {isEditMode && (
          <Select onValueChange={(value) => setSelectedSectionId(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select section to edit " />
            </SelectTrigger>
            <SelectContent>
              {existingSections.map((section) => (
                <SelectItem key={section.area.id} value={section.area.id}>
                  {section.area.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <div className="col-span-3">
                <Input
                  id="name"
                  value={sectionName}
                  onChange={(e) => {
                    setSectionName(e.target.value);
                    validateName(e.target.value);
                  }}
                  className={nameError ? "border-red-500" : ""}
                />
                {nameError && (
                  <p className="text-red-500 text-xs mt-1">{nameError}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="from" className="text-right">
                From
              </Label>
              <Select onValueChange={(value) => setSelectedFrom(value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Select start row" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableRows().map((row) => (
                    <SelectItem key={row.rowId} value={row.rowId}>
                      {row.rowName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="to" className="text-right">
                To
              </Label>
              <Select onValueChange={(value) => setSelectedTo(value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Select end row" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableRows().map((row) => (
                    <SelectItem key={row.rowId} value={row.rowId}>
                      {row.rowName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="color" className="text-right">
                Color
              </Label>
              <div className="col-span-3 flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-6 h-6 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      selectedColor === color
                        ? "ring-2 ring-offset-2 ring-blue-500"
                        : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedBays.map((bay) => {
              return (
                <div
                  key={bay.rowId}
                  className={`flex items-center text-xs font-medium px-2.5 py-0.5 rounded
                     "bg-green-100 text-green-800"
                    "bg-accent text-accent-foreground"
                 `}
                >
                  {bay.rowName}
                  <button
                    type="button"
                    onClick={() => handleBayRemove(bay)}
                    className="ml-1 hover:text-destructive"
                    aria-label={`Remove ${bay.rowName}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            {isEditMode && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                className="mr-2"
              >
                Delete Section
              </Button>
            )}
            <Button type="submit">
              {isEditMode ? "Update Section" : "Create Section"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
