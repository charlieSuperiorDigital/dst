"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";

interface MarginTaxes {
  name: string;
  price: number;
}

const mockMarginTaxes: MarginTaxes[] = [
  {
    name: "Material Margin",
    price: 15, // 15%
  },
  {
    name: "Sales Tax Rate",
    price: 20.5, // 20.5%
  },
  {
    name: "Taxable Sales",
    price: 5.75, // 5.75%
  },
];

export default function MarginTaxes() {
  const [marginTaxes] = useState<MarginTaxes[]>(mockMarginTaxes);

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead className="w-[100px]">%</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {marginTaxes.map((marginTaxe, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{marginTaxe.name}</TableCell>
              <TableCell>{marginTaxe.price.toFixed(2)}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
