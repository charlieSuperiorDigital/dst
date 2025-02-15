"use client";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Part } from "@/app/entities/Part";
import { formatCurrency } from "@/utils/format-currency";
import { AddPartDialog } from "./add-part.modal";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { apiRequest } from "@/utils/client-side-api";
import { DeletePartDialog } from "./delete-part.modal";
import { UpdatePartDialog } from "./update-part.modal";
import { PaginatedResponse } from "@/app/entities/Paginate-Response-Base";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { useParts } from "@/hooks/use-parts";
import { ClonePartDialog } from "./clone-part.modal";
import { paintTypes } from "@/app/entities/colors-enum";

interface Props {
  initialPartsResponse: PaginatedResponse<Part, "parts">;
}

export default function PartsTable({ initialPartsResponse }: Props) {
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCloneDialogOpen, setIsCloneDialogOpen] = useState(false);
  const {
    partsResponse,
    currentPage,
    setCurrentPage,
    searchTerm,
    setSearchTerm,
    fetchParts,
  } = useParts(initialPartsResponse);

  const handleRowClick = (part: Part) => {
    setSelectedPart(part);
    setIsEditDialogOpen(true);
  };

  const handleRowDelete = (e, part: Part) => {
    e.stopPropagation();
    setSelectedPart(part);
    setIsDeleteDialogOpen(true);
  };
  const handleUpdate = async (updatedPart: Part) => {
    try {
      await apiRequest({
        method: "put",
        url: `/api/PartLibrary`,
        data: updatedPart,
      });
      fetchParts(currentPage, searchTerm);
    } catch (error) {
      console.error("Error updating part:", error);
    }
  };

  const handleAdd = async (newPart: Part) => {
    try {
      await apiRequest<number>({
        method: "post",
        url: "/api/PartLibrary",
        data: newPart,
      });
      fetchParts(currentPage, searchTerm);
    } catch (error) {
      console.error("Error adding part:", error);
    }
  };
  const handleDelete = async (part: Part) => {
    try {
      await apiRequest({
        method: "delete",
        url: `/api/PartLibrary/${part.id}`,
      });
      fetchParts(currentPage, searchTerm);
    } catch (error) {
      console.error("Error deleting part:", error);
    }
  };
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchParts(1, searchTerm);
  };

  const handleClone = async (partToClone: Part) => {
    try {
      await apiRequest<number>({
        method: "post",
        url: "/api/part",
        data: partToClone,
      });
      fetchParts(currentPage, searchTerm);
      setIsCloneDialogOpen(false);
    } catch (error) {
      console.error("Error cloning part:", error);
    }
  };

  const totalPages = Math.ceil(
    partsResponse.totalCount / partsResponse.perPage
  );
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder="Search parts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </form>
        <Button variant="success" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Part
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Part No.</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Color</TableHead>
              <TableHead className="text-right">Unit Weight</TableHead>
              <TableHead className="text-right">Unit Mat/lb</TableHead>
              <TableHead className="text-right">Unit Labor</TableHead>
              <TableHead className="text-right">Unit Cost</TableHead>
              {/* <TableHead className="text-right">Unit Sell</TableHead> */}
              <TableHead className="text-right">Labor EA</TableHead>
              {/* <TableHead className="text-right">Total </TableHead> */}
              <TableHead className="text-right"> - </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {partsResponse.parts?.map((part) => (
              <TableRow
                key={part.id}
                className="cursor-pointer hover:bg-muted even:bg-gray-50"
                onClick={() => handleRowClick(part)}
              >
                <TableCell className="font-medium">{part.partNumber}</TableCell>
                <TableCell>{part.description}</TableCell>
                <TableCell>{paintTypes?.find((p) => p.id === part.colorId)?.description || "-"}</TableCell>
                <TableCell className="text-right">
                  {part.unitWeight.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(part.unitMatLb)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(part.unitLabor)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(
                    part.unitWeight * part.unitMatLb + part.unitLabor
                  )}
                </TableCell>

                {/* <TableCell className="text-right">
                {formatCurrency(part.unitSell)}
              </TableCell> */}
                <TableCell className="text-right">{part.laborEA}</TableCell>

                <TableCell className="text-left">
                  <Trash2
                    size={20}
                    onClick={(e) => handleRowDelete(e, part)}
                    className="text-red-500"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="ghost"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className={`h-9 w-9 p-0 ${currentPage <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </PaginationItem>
            {[...Array(totalPages)].map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  onClick={() => setCurrentPage(index + 1)}
                  isActive={currentPage === index + 1}
                  className="cursor-pointer"
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <Button
                variant="ghost"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className={`h-9 w-9 p-0 ${currentPage >= totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        {selectedPart && (
          <UpdatePartDialog
            part={selectedPart}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onSave={handleUpdate}
            onClone={() => setIsCloneDialogOpen(true)}
          />
        )}

        <AddPartDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onAdd={handleAdd}
        />
        {selectedPart && (
          <DeletePartDialog
            isOpen={isDeleteDialogOpen}
            part={selectedPart}
            onClose={() => setIsDeleteDialogOpen(false)}
            onDelete={handleDelete}
          />
        )}

        {selectedPart && (
          <ClonePartDialog
            isOpen={isCloneDialogOpen}
            part={selectedPart}
            onClose={() => setIsCloneDialogOpen(false)}
            onClone={handleClone}
          />
        )}
      </div>
    </div>
  );
}
