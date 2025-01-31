import { apiRequest } from "@/utils/client-side-api";
import React, { useState, useRef, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AddRowsTab } from "./add-row";

type Row = {
  rowName: string;
  rowId: string;
  quantity: number;
};

type Part = {
  id: string;
  partNumber: string;
  description: string;
};
type PartWithRows = {
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

  const fetchData = async () => {
    try {
      const response: PartWithRows[] = await apiRequest({
        url: `/api/count/row/${quoteId}`,
        method: "get",
      });

      setbayWithRows(response);
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
    new Set(bayWithRows.flatMap((part) => part.rows.map((row) => row.rowName)))
  );

  if (loading) {
    return <div>Loading ...</div>;
  }
  if (error) {
    return <div>{error}</div>;
  }

  const calculateTotalQuantity = (partWithBays: PartWithRows): number => {
    return partWithBays.rows.reduce((total, bay) => total + bay.quantity, 0);
  };

  const filteredBayWithRows = bayWithRows.filter((partWithBays) => {
    const matchesSearch = partWithBays.part.partNumber
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const hasNonZeroQuantity = partWithBays.rows.some(
      (row) => row.quantity !== 0
    );
    if (hideZeroQuantity) {
      return matchesSearch && hasNonZeroQuantity;
    }
    return matchesSearch;
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

    // Find the highest existing row number
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

    // Generate new rows
    const newRows = Array.from({ length: quantity }, (_, index) => {
      const newRowNumber = highestRowNumber + index + 1;
      return {
        rowName: `Row-${newRowNumber}`,
        rowId: `Row-${newRowNumber}`, // You can generate a unique ID if needed
        quantity: 0, // Default quantity for new rows
      };
    });

    // Update the state with new rows
    const updatedPartsWithBays = bayWithRows.map((part) => ({
      ...part,
      rows: [...part.rows, ...newRows],
    }));

    // Update the state
    setbayWithRows(updatedPartsWithBays);

    // Optionally, send a request to the backend to save the new rows
    try {
      const requests = newRows.map((row) =>
        apiRequest({
          url: `/api/Row/Add`,
          method: "post",
          data: {
            quotationId: quoteId, // Use the quoteId from props
            rowName: row.rowName, // Send the row name
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

  return (
    <div className="mt-6">
      <div className="flex items-center space-x-4 mb-4">
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
                  key={colIndex}
                  className={`border border-gray-300 p-2 font-bold text-center `}
                  style={{ minWidth: "100px" }}
                >
                  {bayName}
                </th>
              ))}
              <th className="border border-gray-300 p-2 font-bold text-center sticky right-0 bg-white z-20">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredBayWithRows.map((partWithBays, rowIndex) => {
              const totalQuantity = calculateTotalQuantity(partWithBays);
              return (
                <tr key={partWithBays.part.id}>
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
                      (b) => b.rowName === bayName
                    );
                    const quantity = bay ? bay.quantity : 0;

                    return (
                      <td
                        key={`${partWithBays.part.id}-${bayName}`}
                        className={`border border-gray-300 p-2 text-center`}
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
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RowCountTable;
