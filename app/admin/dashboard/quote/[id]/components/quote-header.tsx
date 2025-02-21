"use client";

import { Quotes, QuotesStatus } from "@/app/entities/Quotes";
import { formatDate } from "@/utils/format-date";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { PartsDialog } from "../components/part-list-tab/add-part-modal";
import { AddPartDialog } from "@/app/admin/dashboard/components/add-part.modal";
import { Part } from "@/app/entities/Part";
import { apiRequest } from "@/utils/client-side-api";
import { toast } from "@/hooks/use-toast";
import { AddRowsTab } from "../components/row-count-tab/add-row";
import { useSearchParams } from "next/navigation";

type Props = {
  quote: Quotes;
  onPartAdded: () => void;
  showAddPartButtons: boolean;
};

const QuoteHeader = ({ quote, onPartAdded, showAddPartButtons }: Props) => {
  const [isCustomPartModalOpen, setIsCustomPartModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");

  const handleAdd = async (part: Part, partNumber: string) => {
    try {
      await apiRequest({
        method: "post",
        url: `/api/part`,
        data: {
          partLibId: part.id,
          quotationId: quote.id,
          partNumber: partNumber,
        },
      });

      toast({
        title: "Part Added",
        description: "Part has been added successfully",
      });
      onPartAdded();
      window.location.reload();
    } catch (error) {
      console.error("Error adding part:", error);
      toast({
        title: "Error",
        description: "Error adding part",
        variant: "destructive",
      });
    }
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
          quotationId: quote.id,
          partNumber: customPart.partNumber,
        },
      });
      toast({
        title: "Part Added",
        description: "Part has been added successfully",
      });
      onPartAdded();
      window.location.reload();
    } catch (error) {
      console.error("Error adding part:", error);
      toast({
        title: "Error",
        description: "Error adding part",
        variant: "destructive",
      });
    }
  };

  const handleAddRow = async (quantityStr: string) => {
    const quantity = parseInt(quantityStr, 10);
    
    if (isNaN(quantity) || quantity <= 0) {
      toast({
        title: "Error",
        description: "Quantity must be a positive number.",
        variant: "destructive",
      });
      return;
    }

    try {
      // First, get the existing rows to determine the next row number
      const existingRows = await apiRequest({
        url: `/api/count/row/${quote.id}`,
        method: "get",
      });

      // Find the highest row number
      const highestRowNumber = existingRows.reduce((max, part) => {
        const rowNumbers = part.rows.map(row => {
          const match = row.rowName.match(/Row-(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        });
        return Math.max(max, ...rowNumbers);
      }, 0);

      // Create new rows starting from the next number
      const requests = Array.from({ length: quantity }, (_, index) => {
        const newRowNumber = highestRowNumber + index + 1;
        return apiRequest({
          url: `/api/Row/Add`,
          method: "post",
          data: {
            quotationId: quote.id,
            rowName: `Row-${newRowNumber}`,
          },
        });
      });

      await Promise.all(requests);
      toast({
        title: "Success",
        description: `${quantity} row${quantity > 1 ? 's' : ''} added successfully.`,
      });
      
      // Refresh the page after successful addition
      window.location.reload();
    } catch (error) {
      console.error("Error adding rows:", error);
      toast({
        title: "Error",
        description: "Failed to add rows. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="bg-white shadow-md p-6 rounded-md">
      <div className="grid grid-rows-3 gap-6">
        {/* First Row */}
        <div className="grid grid-cols-5 gap-6">
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium text-gray-600">Quotes Name:</p>
            <h1 className="text-xl font-semibold text-gray-800">
              {quote.name}
            </h1>
            {/* <p className="text-sm text-gray-500">Quotes Number: {quote.id}</p> */}
          </div>
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium text-gray-600">Author:</p>
            <p className="text-lg font-semibold text-gray-800">
              {quote.responsible}
            </p>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium text-gray-600">Date:</p>
            <p className="text-lg font-semibold text-gray-800">
              {formatDate(quote.creationDate)}
            </p>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium text-gray-600">Status:</p>
            <p className="text-lg font-semibold text-gray-800">
              {QuotesStatus[quote.status || 0]}
            </p>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium text-gray-600">Customer Name:</p>
            <p className="text-lg font-semibold text-gray-800">
              {quote.customerName}
            </p>
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-5 gap-6">
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium text-gray-600">Contact Name:</p>
            <p className="text-lg font-semibold text-gray-800">
              {quote.contactName}
            </p>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium text-gray-600">Email:</p>
            <p className="text-lg font-semibold text-gray-800">{quote.email}</p>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium text-gray-600">Phone Number 1:</p>
            <p className="text-lg font-semibold text-gray-800">
              {quote.phoneNumber1}
            </p>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium text-gray-600">Phone Number 2:</p>
            <p className="text-lg font-semibold text-gray-800">
              {quote.phoneNumber2}
            </p>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium text-gray-600">Address:</p>
            <p className="text-lg font-semibold text-gray-800">
              {quote.address}, {quote.state}, {quote.zipCode}
            </p>
          </div>
        </div>

        {/* Third Row - Add Part Buttons */}
        {showAddPartButtons && (
          <div className="flex justify-end gap-3">
            {currentTab !== "row-count" && <AddRowsTab onAdd={handleAddRow} />}
            <PartsDialog onAdd={handleAdd} />
            <Button
              variant="success"
              onClick={() => setIsCustomPartModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Custom Part
            </Button>
            <AddPartDialog
              isOpen={isCustomPartModalOpen}
              onClose={() => setIsCustomPartModalOpen(false)}
              onAdd={handleAddCustomPart}
            />
          </div>
        )}
      </div>
    </header>
  );
};

export default QuoteHeader;
