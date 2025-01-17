"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CostItem {
  item: string;
  price: number;
  highlight?: boolean;
  note?: string;
}

export default function CostBreakdownTable() {
  const costItems: CostItem[] = [
    { item: "Material", price: 0 },
    { item: "Freight", price: 19618, highlight: true },
    { item: "Installation (non union)", price: 62750, highlight: true },
    { item: "Rentals", price: 8900 },
    { item: "Sales Tax 8.25%", price: 7761 },
    {
      item: "Calculations",
      price: 2800,
      note: "Permits Cost Plus 10%",
      highlight: true,
    },
  ];

  const total = costItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Item</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="w-[300px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {costItems.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{item.item}</TableCell>
              <TableCell className="text-right">
                ${item.price.toLocaleString()}
              </TableCell>
              <TableCell>{item.note}</TableCell>
            </TableRow>
          ))}
          <TableRow className="font-bold">
            <TableCell>TOTAL</TableCell>
            <TableCell className="text-right">
              ${total.toLocaleString()}
            </TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
