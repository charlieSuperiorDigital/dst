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
import { apiRequest } from "@/utils/client-side-api";
import { AddPartList } from "../add-parts-list";
import { set } from "react-hook-form";
import { Part } from "@/app/entities/Part";

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

const MiscCount = () => {
  const [misc, setMisc] = useState<Part[]>([]);
  const [rows, setRows] = useState<Row[]>(mockRows);
  const [counts, setCounts] = useState<{
    [key: string]: { [key: string]: number };
  }>({});

  const handleInputChange = (bayId: string, rowId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setCounts((prevCounts) => ({
      ...prevCounts,
      [bayId]: {
        ...prevCounts[bayId],
        [rowId]: numValue,
      },
    }));
  };

  const calculateTotal = (bayId: string) => {
    return Object.values(counts[bayId] || {}).reduce(
      (sum, count) => sum + count,
      0
    );
  };

  const handleAddPartlist = (part: Part, qty: number) => {
    setMisc((prevMisc) => [...prevMisc, part]);
  };

  const handleSave = async () => {};

  return (
    <div className="container mx-auto p-4">
      <div className=" flex  align-middle space-x-4">
        <AddPartList onAdd={handleAddPartlist} />
        <Button onClick={handleSave} className="mb-4">
          Save
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Part Nro</TableHead>
            <TableHead className="w-[200px]">Description</TableHead>
            <TableHead className="w-[100px]">Total</TableHead>
            {mockRows.map((row) => (
              <TableHead key={row.id} className="text-center">
                {row.name}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {misc.map((misc) => (
            <TableRow key={misc.id}>
              <TableCell className="font-medium">{misc.id}</TableCell>
              <TableCell className="font-medium">{misc.description}</TableCell>

              <TableCell className="font-bold text-center">
                {calculateTotal(misc.id)}
              </TableCell>
              {rows.map((row) => (
                <TableCell key={row.id} className="text-center">
                  <Input
                    type="number"
                    className="w-16 mx-auto text-center"
                    value={counts[misc.id]?.[row.id] || ""}
                    onChange={(e) =>
                      handleInputChange(misc.id, row.id, e.target.value)
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

export default MiscCount;
