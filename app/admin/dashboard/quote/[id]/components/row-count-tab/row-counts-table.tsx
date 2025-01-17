import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React, { useState } from "react";
import { AddRowsTab } from "./add-row";
import { apiRequest } from "@/utils/client-side-api";

type Props = {
  quoteId: string;
};

type Rows = {
  id: number;
  name: string;
};

const mockDataRows = [
  {
    id: 1,
    name: "ROW-1",
  },
];

const mockDataBody = [
  {
    partNo: "12345",
    description: "Description of part 1",
    finish: "Polished",
    total: 100,
  },
  {
    partNo: "67890",
    description: "Description of part 2",
    finish: "Matte",
    total: 200,
  },
  {
    partNo: "54321",
    description: "Description of part 3",
    finish: "Glossy",
    total: 300,
  },
  {
    partNo: "98765",
    description: "Description of part 4",
    finish: "Brushed",
    total: 400,
  },
  // You can add more mock data here to see the scrolling effect
];

const RowCounts = ({ quoteId }: Props) => {
  const [rows, setRows] = useState<Rows[]>(mockDataRows);

  const handleAdd = async (values: number) => {
    const newRows: Rows[] = [];

    const maxRowNum = Math.max(
      ...rows.map((row) => parseInt(row.name.replace("ROW-", ""), 10)),
      0 // Si no hay filas, comienza desde 0
    );

    const startIndex = maxRowNum + 1;
    const rowsToCreate = Array.from({ length: values }, (_, index) => ({
      id: 0, // Temporal ID, will be replaced by the response ID
      name: `ROW-${startIndex + index}`,
    }));

    try {
      const createdRows = await Promise.all(
        rowsToCreate.map(async (row) => {
          const response = await apiRequest({
            url: `/api/row/add`,
            method: "post",
            data: {
              quotationId: quoteId,
              rowName: row.name,
            },
          });
          return { ...row, id: response };
        })
      );

      setRows((prev) => [...prev, ...createdRows]);
      console.log("Rows created successfully");
    } catch (error) {
      console.log("Failed to create rows", error);
    }
  };
  return (
    <div className="relative overflow-x-auto overflow-y-auto max-h-[500px]">
      <AddRowsTab onAdd={handleAdd} />
      <Table className="w-full">
        <TableHeader className="">
          <TableRow className="bg-background">
            <TableHead className="">Part No.</TableHead>
            <TableHead className="w-[100px]">Description</TableHead>
            <TableHead className="">Finish</TableHead>
            <TableHead className="">Total</TableHead>
            {rows.map((row) => (
              <TableHead key={row.id} className="w-[100px]">
                {row.name}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockDataBody.map((data, index) => (
            <TableRow key={index} className="bg-background">
              <TableCell className="w-[120px] sticky left-0 bg-background">
                {data.partNo}
              </TableCell>
              <TableCell className="w-[100px] sticky left-12 bg-background">
                {data.description}
              </TableCell>
              <TableCell className="w-[100px] sticky left-32 bg-background">
                {data.finish}
              </TableCell>
              <TableCell className="w-[100px] sticky left-48 bg-background">
                {data.total}
              </TableCell>
              {rows.map((row) => (
                <TableCell key={row.id}>Example data for {row.name}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RowCounts;
