"use client";

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
import { Quotes, QuotesStatus } from "@/app/entities/Quotes";
import { QuotesStatusDropdown } from "./status-quote-dropdown";
import { set } from "react-hook-form";
interface EditQuoteDialogProps {
  quote: Quotes | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedPart: Quotes) => void;
}

export function UpdateQuoteModal({
  quote,
  open,
  onOpenChange,
  onSave,
}: EditQuoteDialogProps) {
  const [editedPart, setEditedPart] = useState<Quotes | null>(quote);
  const [status, setStatus] = useState<QuotesStatus>(
    quote?.status || QuotesStatus.New
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (quote) {
      setEditedPart({ ...quote });
    }
  }, [quote]);

  if (!editedPart) return "nothin here";

  const handleSave = () => {
    setLoading(true);
    onSave(editedPart);
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Edit Quote: {editedPart.id}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={editedPart.name}
                onChange={(e) =>
                  setEditedPart({ ...editedPart, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customerName" className="text-right">
                Customer Name
              </Label>
              <Input
                id="customerName"
                value={editedPart.customerName}
                onChange={(e) =>
                  setEditedPart({ ...editedPart, customerName: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contactName" className="text-right">
                Contact Name
              </Label>
              <Input
                id="contactName"
                value={editedPart.contactName}
                onChange={(e) =>
                  setEditedPart({ ...editedPart, contactName: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contactName2" className="text-right">
                Contact Name 2
              </Label>
              <Input
                id="contactName2"
                value={editedPart.contactName2}
                onChange={(e) =>
                  setEditedPart({ ...editedPart, contactName2: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                value={editedPart.email}
                type="email"
                onChange={(e) =>
                  setEditedPart({ ...editedPart, email: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phoneNumber1" className="text-right">
                Phone Number 1
              </Label>
              <Input
                id="phoneNumber1"
                value={editedPart.phoneNumber1}
                onChange={(e) =>
                  setEditedPart({ ...editedPart, phoneNumber1: e.target.value })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phoneNumber2" className="text-right">
                Phone Number 2
              </Label>
              <Input
                id="phoneNumber2"
                value={editedPart.phoneNumber2}
                onChange={(e) =>
                  setEditedPart({ ...editedPart, phoneNumber2: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Input
                id="address"
                value={editedPart.address}
                onChange={(e) =>
                  setEditedPart({ ...editedPart, address: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="city" className="text-right">
                City
              </Label>
              <Input
                id="city"
                value={editedPart.city}
                onChange={(e) =>
                  setEditedPart({ ...editedPart, city: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="zipCode" className="text-right">
                Zip Code
              </Label>
              <Input
                id="zipCode"
                value={editedPart.zipCode}
                onChange={(e) =>
                  setEditedPart({ ...editedPart, zipCode: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="state" className="text-right">
                State
              </Label>
              <Input
                id="state"
                value={editedPart.state}
                onChange={(e) =>
                  setEditedPart({ ...editedPart, state: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <QuotesStatusDropdown
                value={status}
                onChange={(newStatus) => {
                  setStatus(newStatus);
                  setEditedPart((prevState) => ({
                    ...prevState!,
                    status: newStatus,
                  }));
                }}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>
            {loading ? "Loading .." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
