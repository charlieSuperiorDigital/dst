"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddBayDefinitonTab } from "../bay-definition-tab/add-bay-definition";
import { Button } from "@/components/ui/button";

type Bay = {
  id: number;
  name: string;
};

type Row = {
  id: string;
  name: string;
};

const mockRows: Row[] = [
  { id: "row001", name: "Row A" },
  { id: "row002", name: "Row B" },
  { id: "row003", name: "Row C" },
  { id: "row004", name: "Row D" },
  { id: "row005", name: "Row E" },
];

const mockBays: Bay[] = [
  { id: 1, name: "Assembly Bay A" },
  { id: 2, name: "Assembly Bay B" },
  { id: 3, name: "Paint Bay" },
];

const BayCounts = () => {
  const [baysDefinition, setBaysDefinition] = useState<Bay[]>(mockBays);
  const [rows, setRows] = useState<Row[]>(mockRows);
  const [counts, setCounts] = useState<{
    [key: string]: { [key: string]: number };
  }>({});

  const handleInputChange = (bayId: number, rowId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setCounts((prevCounts) => ({
      ...prevCounts,
      [bayId]: {
        ...prevCounts[bayId],
        [rowId]: numValue,
      },
    }));
  };

  const calculateTotal = (bayId: number) => {
    return Object.values(counts[bayId] || {}).reduce(
      (sum, count) => sum + count,
      0
    );
  };
  const handleAddBayDefinition = (value) => {
    const bayToAdd = {
      id: baysDefinition.length + 1,
      name: value.name,
    };

    setBaysDefinition((prevBays) => [...prevBays, bayToAdd]);
  };

  const handleSave = () => {
    console.log("save");
  };

  return (
    <div className="container mx-auto p-4">
      <div className=" flex  align-middle space-x-4">
        <AddBayDefinitonTab onAdd={handleAddBayDefinition} />
        <Button onClick={handleSave} className="mb-4">
          Save
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Bay Name</TableHead>
            <TableHead className="w-[100px]">Total</TableHead>
            {mockRows.map((row) => (
              <TableHead key={row.id} className="text-center">
                {row.name}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {baysDefinition.map((bay) => (
            <TableRow key={bay.id}>
              <TableCell className="font-medium">{bay.name}</TableCell>
              <TableCell className="font-bold text-center">
                {calculateTotal(bay.id)}
              </TableCell>
              {rows.map((row) => (
                <TableCell key={row.id} className="text-center">
                  <Input
                    type="number"
                    className="w-16 mx-auto text-center"
                    value={counts[bay.id]?.[row.id] || ""}
                    onChange={(e) =>
                      handleInputChange(bay.id, row.id, e.target.value)
                    }
                    min="0"
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default BayCounts;
