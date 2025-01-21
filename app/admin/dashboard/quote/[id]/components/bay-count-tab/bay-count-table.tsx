"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type Bay = {
  id: string;
  name: string;
};

type Row = {
  id: string;
  name: string;
};

export type RowWithDetails = {
  row: Row;
  bays: { bay: Bay; quantity: number }[];
};

// Mock data
const mockData: RowWithDetails[] = [
  {
    row: { id: "1", name: "ROW-1" },
    bays: [
      { bay: { id: "A", name: "BAY-A" }, quantity: 5 },
      { bay: { id: "B", name: "BAY-B" }, quantity: 3 },
      { bay: { id: "C", name: "BAY-C" }, quantity: 7 },
    ],
  },
  {
    row: { id: "2", name: "ROW-2" },
    bays: [
      { bay: { id: "A", name: "BAY-A" }, quantity: 2 },
      { bay: { id: "B", name: "BAY-B" }, quantity: 4 },
      { bay: { id: "C", name: "BAY-C" }, quantity: 6 },
    ],
  },
  {
    row: { id: "3", name: "ROW-3" },
    bays: [
      { bay: { id: "A", name: "BAY-A" }, quantity: 8 },
      { bay: { id: "B", name: "BAY-B" }, quantity: 1 },
      { bay: { id: "C", name: "BAY-C" }, quantity: 9 },
    ],
  },
  {
    row: { id: "4", name: "ROW-4" },
    bays: [
      { bay: { id: "A", name: "BAY-A" }, quantity: 8 },
      { bay: { id: "B", name: "BAY-B" }, quantity: 1 },
    ],
  },
];

const BayCounts = ({ initialData }) => {
  const [rowsWithDetails, setRowsWithDetails] =
    useState<RowWithDetails[]>(mockData);
  const [baysDefinition, setBaysDefinition] = useState<Bay[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [counts, setCounts] = useState<{
    [bayId: string]: { [rowId: string]: number };
  }>({});

  useEffect(() => {
    const uniqueBays = new Set<string>();
    const transformedRows: Row[] = [];
    const transformedCounts: { [bayId: string]: { [rowId: string]: number } } =
      {};

    rowsWithDetails.forEach((rowWithDetails) => {
      transformedRows.push(rowWithDetails.row);

      rowWithDetails.bays.forEach(({ bay, quantity }) => {
        uniqueBays.add(JSON.stringify(bay));

        if (!transformedCounts[bay.id]) {
          transformedCounts[bay.id] = {};
        }
        transformedCounts[bay.id][rowWithDetails.row.id] = quantity;
      });
    });

    setRows(transformedRows);
    setBaysDefinition(Array.from(uniqueBays).map((b) => JSON.parse(b)));
    setCounts(transformedCounts);
  }, [rowsWithDetails]);

  const handleInputChange = (bayId: string, rowId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setCounts((prevCounts) => ({
      ...prevCounts,
      [bayId]: {
        ...(prevCounts[bayId] || {}),
        [rowId]: numValue,
      },
    }));

    // Update rowsWithDetails state
    setRowsWithDetails((prevRowsWithDetails) =>
      prevRowsWithDetails.map((rowWithDetails) => {
        if (rowWithDetails.row.id === rowId) {
          return {
            ...rowWithDetails,
            bays: rowWithDetails.bays.map((bayItem) =>
              bayItem.bay.id === bayId
                ? { ...bayItem, quantity: numValue }
                : bayItem
            ),
          };
        }
        return rowWithDetails;
      })
    );
  };

  const calculateTotal = (bayId: string) => {
    return Object.values(counts[bayId] || {}).reduce(
      (sum, count) => sum + count,
      0
    );
  };

  const handleAddBay = () => {
    const newBayId = String.fromCharCode(65 + baysDefinition.length);
    const newBay: Bay = {
      id: newBayId,
      name: `BAY-${newBayId}`,
    };
    setBaysDefinition((prevBays) => [...prevBays, newBay]);

    // Update rowsWithDetails with the new bay
    setRowsWithDetails((prevRowsWithDetails) =>
      prevRowsWithDetails.map((rowWithDetails) => ({
        ...rowWithDetails,
        bays: [...rowWithDetails.bays, { bay: newBay, quantity: 0 }],
      }))
    );
  };

  const handleSave = () => {
    console.log("Saving data:", rowsWithDetails);
    // In a real application, you would send this data to your backend
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <Button onClick={handleAddBay} variant="outline">
          <Plus className="mr-2 h-4 w-4" /> Add Bay
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </div>
      <div className="overflow-x-auto border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px] sticky left-0 bg-background z-20 border">
                Bay Name
              </TableHead>
              {rows.map((row) => (
                <TableHead
                  key={row.id}
                  className="text-center min-w-[100px] border"
                >
                  {row.name}
                </TableHead>
              ))}
              <TableHead className="text-center min-w-[100px] border">
                Total
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {baysDefinition.map((bay) => (
              <TableRow key={bay.id}>
                <TableCell className="font-medium sticky left-0 bg-background z-10 border">
                  {bay.name}
                </TableCell>
                {rows.map((row) => (
                  <TableCell key={row.id} className="text-center p-0 border">
                    <Input
                      type="number"
                      className="w-full h-full text-center border-0"
                      value={counts[bay.id]?.[row.id] || ""}
                      onChange={(e) =>
                        handleInputChange(bay.id, row.id, e.target.value)
                      }
                      min="0"
                    />
                  </TableCell>
                ))}
                <TableCell className="font-bold text-center border">
                  {calculateTotal(bay.id)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BayCounts;
