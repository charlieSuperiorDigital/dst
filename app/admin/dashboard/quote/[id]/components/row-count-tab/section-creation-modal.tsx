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

type RowData = {
  rowName: string;
  rowId: string;
};

type SectionData = {
  id: string;
  name: string;
  bays: RowData[];
  color: string;
};

interface SectionCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sectionData: SectionData) => void;
  onEdit: (sectionData: SectionData) => void;
  allRows: RowData[];
  existingSections: SectionData[];
}

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
}: SectionCreationModalProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [sectionName, setSectionName] = useState("");
  const [selectedBays, setSelectedBays] = useState<RowData[]>([]);
  const [selectedColor, setSelectedColor] = useState("#3b82f6");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (isEditMode && selectedSectionId) {
      const sectionToEdit = existingSections.find(
        (section) => section.id === selectedSectionId
      );
      if (sectionToEdit) {
        setSectionName(sectionToEdit.name);
        setSelectedBays(sectionToEdit.bays);
        setSelectedColor(sectionToEdit.color);
      }
    } else {
      resetForm();
    }
  }, [isEditMode, selectedSectionId, existingSections]);

  const resetForm = () => {
    setSectionName("");
    setSelectedBays([]);
    setSelectedColor("#3b82f6");
    setSelectedSectionId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sectionData: SectionData = {
      id:
        isEditMode && selectedSectionId
          ? selectedSectionId
          : Date.now().toString(),
      name: sectionName,
      bays: selectedBays,
      color: selectedColor,
    };
    if (isEditMode) {
      onEdit(sectionData);
    } else {
      onSubmit(sectionData);
    }
    onClose();
    resetForm();
  };

  const toggleBay = (bay: RowData) => {
    setSelectedBays((prev) =>
      prev.some((b) => b.rowId === bay.rowId)
        ? prev.filter((b) => b.rowId !== bay.rowId)
        : [...prev, bay]
    );
  };

  const handleBayRemove = (bay: RowData) => {
    setSelectedBays((prev) => prev.filter((b) => b.rowId !== bay.rowId));
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
              <SelectValue placeholder="Select section to edit" />
            </SelectTrigger>
            <SelectContent>
              {existingSections.map((section) => (
                <SelectItem key={section.id} value={section.id}>
                  {section.name}
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
              <Input
                id="name"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bays" className="text-right">
                Rows
              </Label>
              <div className="col-span-3 relative">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  Select Rows
                  <span className="ml-2">▼</span>
                </Button>
                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg">
                    <div className="max-h-60 overflow-auto">
                      {allRows.map((bay) => (
                        <div
                          key={bay.rowId}
                          className="flex items-center px-3 py-2 hover:bg-accent cursor-pointer"
                          onClick={() => toggleBay(bay)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedBays.some(
                              (b) => b.rowId === bay.rowId
                            )}
                            onChange={() => {}}
                            className="mr-2"
                          />
                          {bay.rowName}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedBays.map((bay) => (
              <div
                key={bay.rowId}
                className="flex items-center bg-accent text-accent-foreground text-xs font-medium px-2.5 py-0.5 rounded"
              >
                {bay.rowName}
                <button
                  type="button"
                  onClick={() => handleBayRemove(bay)}
                  className="ml-1 text-accent-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="submit">
              {isEditMode ? "Update Section" : "Create Section"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
