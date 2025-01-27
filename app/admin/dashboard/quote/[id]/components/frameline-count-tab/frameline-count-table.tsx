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
import { FrameLineDefinition } from "../frameline-definition-tab/frame-definition-table";
import { AddFrameLineDefinitonTab } from "../frameline-definition-tab/add-frameline-definition";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/utils/client-side-api";

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

const FrameLineCounts = () => {
  const [frameLineDefinition, setFramelineDefinition] = useState<
    FrameLineDefinition[]
  >([]);
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
  const handleAddFramelineDef = async (value) => {
    try {
      const response = await apiRequest({
        url: `/api/definition/frameLine/${value.name.trim()}`,
        method: "post",
      });
      const bayToAdd = {
        id: response,
        name: value.name,
      };
      setFramelineDefinition((prevBays) => [...prevBays, bayToAdd]);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSave = () => {
    const result = frameLineDefinition.map((bay) => ({
      ...bay,
      counts: counts[bay.id],
    }));
    console.log(result);
  };

  return (
    <div className="container mx-auto p-4">
      <div className=" flex  align-middle space-x-4">
        <AddFrameLineDefinitonTab onAdd={handleAddFramelineDef} />
        <Button onClick={handleSave} className="mb-4">
          Save
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border">
            <TableHead className="w-[200px] border">Flue Name</TableHead>
            <TableHead className="w-[100px] border">Total</TableHead>
            {mockRows.map((row) => (
              <TableHead key={row.id} className="text-center border">
                {row.name}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {frameLineDefinition.map((bay) => (
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

export default FrameLineCounts;
