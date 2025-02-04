import { apiRequest } from "@/utils/client-side-api";
import React, { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AddRowsTab } from "./add-row";
import { SectionCreationModal } from "./section-creation-modal";
import { Button } from "@/components/ui/button";
import { RowInfoModal } from "./row-info-modal";
import { formatCurrency } from "@/utils/format-currency";
import { Scan } from "lucide-react";

export type Row = {
  rowName: string;
  rowId: string;
  quantity: number;
  displayName?: string;
};

type Part = {
  id: string;
  partNumber: string;
  description: string;
  unitCost: number;
};
export type PartWithRows = {
  part: Part;
  rows: Row[];
};

type Props = {
  quoteId: string;
};
const RowCountTable = ({ quoteId }: Props) => {
  const [bayWithRows, setbayWithRows] = useState<PartWithRows[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [hideZeroQuantity, setHideZeroQuantity] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const fetchData = async () => {
    try {
      const response: PartWithRows[] = await apiRequest({
        url: `/api/count/row/${quoteId}`,
        method: "get",
      });

      const sanitizedResponse = response.map((item) => ({
        part: item.part || {
          id: "",
          partNumber: "",
          description: "",
          unitCost: 0,
        },
        rows: item.rows || [],
      }));

      setbayWithRows(sanitizedResponse);
      setLoading(false);
    } catch (err) {
      setError("Error Loading data");
      setLoading(false);
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [quoteId]);

  const allBays = Array.from(
    new Map(
      bayWithRows
        .flatMap((part) =>
          part.rows.map((row) => ({ rowName: row.rowName, rowId: row.rowId }))
        )
        .map((row) => [`${row.rowName}-${row.rowId}`, row]) // Use a unique key for each row
    ).values() // Extract the unique rows from the Map
  ).sort((a, b) => {
    const isARowNumber = a.rowName.match(/Row-(\d+)/);
    const isBRowNumber = b.rowName.match(/Row-(\d+)/);

    if (!isARowNumber && !isBRowNumber) {
      return a.rowName.localeCompare(b.rowName);
    } else if (!isARowNumber) {
      return -1;
    } else if (!isBRowNumber) {
      return 1;
    } else {
      const aNumber = parseInt(isARowNumber[1], 10);
      const bNumber = parseInt(isBRowNumber[1], 10);
      return aNumber - bNumber;
    }
  });
  if (loading) {
    return <div>Loading ...</div>;
  }
  if (error) {
    return <div>{error}</div>;
  }

  const calculateTotalQuantity = (partWithBays: PartWithRows): number => {
    return partWithBays.rows.reduce((total, bay) => total + bay.quantity, 0);
  };

  const calculateTotalCost = (partWithBays: PartWithRows): number => {
    return partWithBays.rows.reduce(
      (total, row) => total + row.quantity * partWithBays.part.unitCost,
      0
    );
  };
  const calculateTotalCostForAllParts = (parts: PartWithRows[]): number => {
    return parts.reduce((total, partWithBays) => {
      return total + calculateTotalCost(partWithBays);
    }, 0);
  };

  const filteredBayWithRows = bayWithRows.filter((partWithBays) => {
    // Ensure partWithBays.part exists and partNumber is a valid string
    const partNumber = partWithBays?.part?.partNumber ?? ""; // Default to empty string if null/undefined
    const matchesSearch = partNumber
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const hasNonZeroQuantity =
      partWithBays?.rows?.some((row) => row.quantity !== 0) ?? false;

    return hideZeroQuantity
      ? matchesSearch && hasNonZeroQuantity
      : matchesSearch;
  });

  const handleAddRow = async (quantity: number) => {
    if (quantity <= 0) {
      toast({
        title: "Error",
        description: "Quantity must be greater than 0.",
        variant: "destructive",
      });
      return;
    }

    const existingRows = bayWithRows.flatMap((part) =>
      part.rows.map((row) => row.rowName)
    );
    const highestRowNumber = existingRows.reduce((max, rowName) => {
      const match = rowName.match(/Row-(\d+)/);
      if (match) {
        const rowNumber = parseInt(match[1], 10);
        return Math.max(max, rowNumber);
      }
      return max;
    }, 0);

    const newRows = Array.from({ length: quantity }, (_, index) => {
      const newRowNumber = highestRowNumber + index + 1;
      return {
        rowName: `Row-${newRowNumber}`,
        rowId: `Row-${newRowNumber}`, // You can generate a unique ID if needed
        quantity: 0, // Default quantity for new rows
      };
    });

    const updatedPartsWithBays = bayWithRows.map((part) => ({
      ...part,
      rows: [...part.rows, ...newRows],
    }));

    // Update the state
    setbayWithRows(updatedPartsWithBays);

    try {
      const requests = newRows.map((row) =>
        apiRequest({
          url: `/api/Row/Add`,
          method: "post",
          data: {
            quotationId: quoteId,
            rowName: row.rowName,
          },
        })
      );

      // Wait for all requests to complete
      await Promise.all(requests);
      toast({
        title: "Success",
        description: "Rows added successfully.",
      });
    } catch (error) {
      console.error("Error adding rows:", error);
      toast({
        title: "Error",
        description: "Failed to add rows. Please try again.",
        variant: "destructive",
      });
    }
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOnSubmit = async (value) => {
    console.log(value);
  };
  const handleOnEdit = async (value) => {
    console.log(value);
  };

  const handleHeaderClick = (row) => {
    setSelectedRow(row);
  };

  return (
    <div className="mt-6">
      <SectionCreationModal
        allRows={allBays}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleOnSubmit}
        onEdit={handleOnEdit}
        existingSections={[]}
      />
      <div className="flex items-center space-x-4 mb-4">
        <Button onClick={() => setIsModalOpen(true)}>
          <Scan />
        </Button>
        <div>
          <Input
            type="text"
            placeholder="Search by Part Number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="hide-zero"
            checked={hideZeroQuantity}
            onCheckedChange={setHideZeroQuantity}
          />
          <Label htmlFor="hide-zero">Hide zero quantity</Label>
        </div>
        <AddRowsTab onAdd={handleAddRow} />
        <div className="flex items-center space-x-2">
          <span className="font-bold">Total Cost:</span>
          <span className="text-blue-600 font-semibold">
            {formatCurrency(calculateTotalCostForAllParts(filteredBayWithRows))}
          </span>
        </div>
      </div>

      <div className="table-component overflow-auto max-w-full max-h-full outline-none relative">
        <table className="border-collapse border border-gray-300 bg-white min-w-full user-select-none">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2 font-bold text-left w-[350px] sticky left-0 bg-white z-20">
                Part Number / Description
              </th>
              {allBays.map((bayName, colIndex) => (
                <th
                  key={colIndex + bayName.rowId}
                  className={`border border-gray-300 p-2 font-bold text-center  cursor-pointer`}
                  style={{ minWidth: "100px" }}
                  onDoubleClick={() => handleHeaderClick(bayName)}
                >
                  {bayName.rowName}
                </th>
              ))}
              <th className="border border-gray-300 p-2 font-bold text-center sticky right-0 bg-white z-20">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {allBays.length === 0 ? (
              <tr>
                <td colSpan={2} className="text-center p-4 text-gray-500">
                  No rows exist or no part added to any row.
                </td>
              </tr>
            ) : (
              filteredBayWithRows.map((partWithBays, rowIndex) => {
                const totalQuantity = calculateTotalQuantity(partWithBays);
                return (
                  <tr key={`${partWithBays.part.id}-${rowIndex}`}>
                    <td
                      className={`border w-[350px] border-gray-300 p-2 text-left sticky left-0 bg-white z-10 flex items-center`}
                      style={{
                        height: "60px",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                      }}
                      title={`${partWithBays.part.description}`}
                    >
                      <span className="font-bold text-blue-600 text-lg">
                        {partWithBays.part.partNumber}-
                      </span>
                      <span>{partWithBays.part.description}</span>
                    </td>
                    {allBays.map((bayName, colIndex) => {
                      const bay = partWithBays.rows.find(
                        (b) => b.rowName === bayName.rowName
                      );
                      const quantity = bay ? bay.quantity : 0;

                      return (
                        <td
                          key={`${partWithBays.part.id}-${bayName.rowId}-${colIndex}`}
                          className="border border-gray-300 p-2 text-center"
                          style={{ minWidth: "100px" }}
                        >
                          <div
                            className="cell-content p-2 whitespace-nowrap overflow-hidden text-ellipsis"
                            title={quantity.toString()}
                          >
                            {quantity}
                          </div>
                        </td>
                      );
                    })}
                    <td className="border border-gray-300 p-2 text-center sticky right-0 bg-white z-10">
                      {totalQuantity}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <RowInfoModal
        isOpen={!!selectedRow}
        onClose={() => setSelectedRow(null)}
        row={selectedRow}
        setbayWithRows={setbayWithRows}
      />
    </div>
  );
};

export default RowCountTable;
