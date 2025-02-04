import type React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { useState } from "react";
import { apiRequest } from "@/utils/client-side-api";
import { toast } from "@/hooks/use-toast";
import { PartWithRows } from "./row-counts-table";

type RowInfoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  setbayWithRows: React.Dispatch<React.SetStateAction<PartWithRows[]>>;
  row: { rowName: string; rowId: string; displayName?: string } | null;
};

export const RowInfoModal: React.FC<RowInfoModalProps> = ({
  isOpen,
  onClose,
  row,
  setbayWithRows,
}) => {
  const [value, setValue] = useState(row?.displayName || "");
  if (!row) return null;

  const handleUpdateDisplayName = async () => {
    console.log(row.rowId);
    console.log(value);
    try {
      await apiRequest({
        url: `/api/row/update/${row.rowId}/${value}`,
        method: "put",
      });
      toast({
        title: "Success",
        description: "Display Name Updated",
      });
      setbayWithRows((prev) =>
        prev.map((part) => {
          const updatedPart = { ...part };
          updatedPart.rows = part.rows.map((r) => {
            if (r.rowId === row.rowId) {
              return { ...r, rowName: value };
            }
            return r;
          });
          return updatedPart;
        })
      );
      onClose();
    } catch (err) {
      console.error(err);
      toast({
        title: "Success",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{row.displayName || row.rowName} </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>
            <strong>Row Name:</strong> {row.rowName}
          </p>
          <div className="mt-4">
            <Label>Display Name :</Label>
            <Input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
          {/* Add more information about the row here */}
        </div>
        <DialogClose asChild>
          <div>
            <Button type="button" onClick={handleUpdateDisplayName}>
              Save
            </Button>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </div>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};
