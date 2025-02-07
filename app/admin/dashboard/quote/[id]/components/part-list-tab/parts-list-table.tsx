"use client";

import { use, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditPartDialog } from "./edit-part-modal";
import type { PartList } from "../../../../../../entities/PartList";
import { formatCurrency } from "@/utils/format-currency";
import { Input } from "@/components/ui/input";
import { PartsDialog } from "./add-part-modal";
import type { Part } from "@/app/entities/Part";
import { paintTypes } from "@/app/entities/colors-enum";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/utils/client-side-api";
import { useQuote } from "../../context/quote-context";
import { AddPartDialog } from "@/app/admin/dashboard/components/add-part.modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const materialMargin = 0.2;

interface Props {
  quoteId: string;
}

export default function PartsListTable({ quoteId }: Props) {
  const { isLocked } = useQuote();
  const [parts, setParts] = useState<PartList[]>([]);
  const [filteredParts, setFilteredParts] = useState<PartList[]>([]);
  const [selectedPart, setSelectedPart] = useState<PartList | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isCustomPartModalOpen, setIsCustomPartModalOpen] = useState(false);

  const fetchParts = async () => {
    const response = await apiRequest({
      method: "get",
      url: `/api/Part/PartsFromQuotation/${quoteId}`,
    });
    console.log(response);
    setFilteredParts(response.parts);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredParts = parts.filter((part) =>
      part.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setParts(filteredParts);
  };

  const handleRowClick = (part: PartList) => {
    setSelectedPart(part);
    setIsDialogOpen(true);
  };

  const handleSave = async (updatedPart: PartList) => {
    try {
      await apiRequest({
        method: "put",
        url: `/api/part`,
        data: updatedPart,
      });
      await fetchParts();

      toast({
        title: "Details Updated",
        description: "Details have been updated successfully",
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Error updating part details",
        variant: "destructive",
      });
    }
  };
  const handleDelete = async (part: PartList) => {
    try {
      await apiRequest({
        method: "delete",
        url: `/api/part/${part.id}`,
      });
      await fetchParts();
      toast({
        title: "Part Deleted",
        description: "Part has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error deleting part",
        variant: "destructive",
      });
    }
  };

  const handleAdd = async (part: Part, partNumber: string) => {
    try {
      const isDuplicate = filteredParts.some(
        (p) => p.description === part.description
      );
      if (isDuplicate) {
        toast({
          title: "Error",
          description: "This part was already added",
          variant: "destructive",
        });
        return;
      }

      await apiRequest({
        method: "post",
        url: `/api/part`,
        data: {
          partLibId: part.id,
          quotationId: quoteId,
          partNumber: partNumber,
        },
      });
      await fetchParts();

      toast({
        title: "Part Added",
        description: "Part has been added successfully",
      });
    } catch (error) {
      console.error("Error adding part:", error);
      toast({
        title: "Error",
        description: "Error adding part",
        variant: "destructive",
      });
    }
  };

  const handleSearchPartlist = (search: string) => {
    setSearchTerm(search);

    if (search.trim() === "") {
      setFilteredParts(parts);
      return;
    }

    const filteredParts = parts.filter((part) =>
      part.description.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredParts(filteredParts);
  };

  const handleAddCustomPart = async (customPart) => {
    try {
      const response = await apiRequest<number>({
        method: "post",
        url: "/api/PartLibrary",
        data: customPart,
      });
      await apiRequest({
        method: "post",
        url: `/api/part`,
        data: {
          partLibId: response,
          quotationId: quoteId,
          partNumber: customPart.partNumber,
        },
      });
      await fetchParts();
      toast({
        title: "Part Added",
        description: "Part has been added successfully",
      });
    } catch (error) {
      console.error("Error adding part:", error);
      toast({
        title: "Error",
        description: "Error adding part",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const fetchParts = async () => {
      try {
        setLoading(true);
        const response = await apiRequest({
          method: "get",
          url: `/api/Part/PartsFromQuotation/${quoteId}`,
        });
        console.log(response);
        setParts(response.parts);
        setFilteredParts(response.parts);
      } catch (error) {
        console.log(error);
        toast({
          title: "Error",
          description: "Error fetching parts",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchParts();
  }, [quoteId]);
  return (
    <div className="rounded-md border">
      <div className="flex justify-between items-center p-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder="Search part..."
            value={searchTerm}
            onChange={(e) => handleSearchPartlist(e.target.value)}
            className="w-64"
          />
        </form>
        <div className=" flex gap-3">
          {!isLocked && <PartsDialog onAdd={handleAdd} />}
          {!isLocked && (
            <Button
              variant="success"
              onClick={() => setIsCustomPartModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Custom Part
            </Button>
          )}
          {!isLocked && (
            <AddPartDialog
              isOpen={isCustomPartModalOpen}
              onClose={() => setIsCustomPartModalOpen(false)}
              onAdd={handleAddCustomPart}
            />
          )}
        </div>
      </div>
      <Table>
        <TableHeader className="border">
          <TableRow>
            <TableHead className="w-[100px] border ">Part No.</TableHead>
            <TableHead className="border">Qty</TableHead>
            <TableHead className="border">Description</TableHead>
            <TableHead className="border">Color</TableHead>
            <TableHead className="text-right border">Unit Weight</TableHead>
            <TableHead className=" border text-right">Total Weight</TableHead>

            <TableHead className="text-right border">Unit Labor</TableHead>
            <TableHead className="text-right border">Unit Cost</TableHead>
            <TableHead className="text-right border">Total Cost</TableHead>
            <TableHead className="text-right border">Unit Sell</TableHead>
            <TableHead className="text-right border">Total Man Hours</TableHead>
            <TableHead className="text-right border">Total Sell</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={12} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : (
            <>
              {/* <TableRow className="bg-blue-200">
                <TableCell colSpan={9} className="font-medium border">
                  <div className="flex">
                    <p>Total:</p>
                    {formatCurrency(totalSell)}
                  </div>
                </TableCell>
                <TableCell colSpan={3} className="border" />
              </TableRow> */}
              {filteredParts.map((part) => (
                <TableRow
                  key={part.id}
                  className="cursor-pointer hover:bg-muted border"
                  onClick={() => handleRowClick(part)}
                >
                  <TableCell className="font-medium border">
                    {part.partNumber}
                  </TableCell>
                  <TableCell className="border">{part.qty || 0}</TableCell>
                  <TableCell className="border">{part.description}</TableCell>
                  <TableCell className="border">
                    {paintTypes?.find((p) => p.id === part.colorId)?.name}
                  </TableCell>
                  <TableCell className="text-right border">
                    {part.unitWeight.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right border">
                    {part.unitWeight * (part.qty ?? 0)}
                  </TableCell>
                  <TableCell className="text-right border">
                    {part.unitLabor}
                  </TableCell>
                  <TableCell className="text-right border">
                    {formatCurrency(part.unitCost)}
                  </TableCell>
                  <TableCell className="text-right border">
                    {formatCurrency(part.unitCost * (part.qty ?? 0))}
                  </TableCell>
                  <TableCell className="text-right border">
                    {formatCurrency(part.unitCost / (1 - materialMargin))}
                  </TableCell>
                  <TableCell className="text-right border">
                    {(part.qty || 0 * part.laborEA).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right border">
                    {formatCurrency(
                      (part.unitCost / (1 - materialMargin)) * (part.qty ?? 0)
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </>
          )}
        </TableBody>
      </Table>

      <EditPartDialog
        part={selectedPart}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
