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
import { Input } from "@/components/ui/input";

interface MarginTax {
  name: string;
  price: number;
}

type Props = {
  marginTaxes: MarginTax[];
  setMarginTaxes: (marginTaxes: MarginTax[]) => void;
};

export default function MarginTaxes({ marginTaxes, setMarginTaxes }: Props) {
  const handlePriceChange = (index: number, newPrice: string) => {
    const updatedMarginTaxes = [...marginTaxes];
    updatedMarginTaxes[index].price = parseFloat(newPrice) || 0;
    setMarginTaxes(updatedMarginTaxes);
  };

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
          {marginTaxes.map((marginTax, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{marginTax.name}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={marginTax.price}
                  onChange={(e) => handlePriceChange(index, e.target.value)}
                  className="w-24"
                  step="0.01"
                  min="0"
                  max="100"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
