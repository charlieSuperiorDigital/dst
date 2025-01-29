"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { CostItem, MarginTax } from "./row-count-summary";
import { Card } from "@/components/ui/card";
import { useQuote } from "../../context/quote-context";
import { useState } from "react";

type Props = {
  marginTaxes: MarginTax[];
  costItems: CostItem[];
  setCostItems: (costItems: CostItem[]) => void;
};

export default function CostBreakdownTable({
  marginTaxes,
  costItems,
  setCostItems,
}: Props) {
  const { isLocked } = useQuote();

  const [manualSalesTax, setManualSalesTax] = useState<number | null>(null);

  const handlePriceChange = (index: number, newPrice: string) => {
    const updatedItems = [...costItems];
    updatedItems[index].price = parseFloat(newPrice) || 0;
    setCostItems(updatedItems);
  };

  const handleSalesTaxChange = (newTax: string) => {
    setManualSalesTax(parseFloat(newTax) || 0);
  };

  const calculateWithMargins = () => {
    let totalBeforeTaxes = 0;
    let totalSalesTax = 0;
    let totalTaxableSales = 0;

    const updatedItems = costItems.map((item) => {
      let taxAmount = 0;

      if (item.item.toLowerCase().includes("material")) {
        const materialMargin = marginTaxes.find((tax) =>
          tax.name.toLowerCase().includes("material margin")
        );
        taxAmount = (item.price * (materialMargin?.price || 0)) / 100;
      } else if (item.item.toLowerCase().includes("calculations")) {
        const permitsCostPlus = marginTaxes.find((tax) =>
          tax.name.toLowerCase().includes("permits cost plus")
        );
        taxAmount = (item.price * (permitsCostPlus?.price || 0)) / 100;
      }

      const totalWithTax = item.price + taxAmount;
      totalBeforeTaxes += totalWithTax;

      return {
        ...item,
        totalWithTax,
      };
    });

    // Use manual sales tax if provided, otherwise calculate it
    const salesTaxRate = marginTaxes.find((tax) =>
      tax.name.toLowerCase().includes("sales tax rate")
    );
    totalSalesTax =
      manualSalesTax !== null
        ? manualSalesTax
        : (totalBeforeTaxes * (salesTaxRate?.price || 0)) / 100;

    const taxableSalesRate = marginTaxes.find((tax) =>
      tax.name.toLowerCase().includes("taxable sales")
    );
    totalTaxableSales =
      (totalBeforeTaxes * (taxableSalesRate?.price || 0)) / 100;

    const grandTotal = totalBeforeTaxes + totalSalesTax + totalTaxableSales;

    return {
      updatedItems,
      totalBeforeTaxes,
      totalSalesTax,
      totalTaxableSales,
      grandTotal,
    };
  };

  const { updatedItems, totalBeforeTaxes, totalSalesTax, grandTotal } =
    calculateWithMargins();

  return (
    <Card className="w-[500px]">
      <div className="container mx-auto p-6 max-w-3xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Item</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">
                Total w/ Margin or Tax
              </TableHead>
              <TableHead className="w-[300px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {updatedItems.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.item}</TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    value={item.price}
                    onChange={(e) => handlePriceChange(index, e.target.value)}
                    className="w-32 text-right"
                    disabled={isLocked}
                  />
                </TableCell>
                <TableCell className="text-right">
                  ${item.totalWithTax.toLocaleString()}
                </TableCell>
                <TableCell>{item.note}</TableCell>
              </TableRow>
            ))}
            <TableRow className="font-bold">
              <TableCell>Total Before Taxes</TableCell>
              <TableCell></TableCell>
              <TableCell className="text-right">
                ${totalBeforeTaxes.toLocaleString()}
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Sales Tax</TableCell>
              <TableCell></TableCell>
              <TableCell className="text-right">
                <Input
                  type="number"
                  value={
                    manualSalesTax !== null ? manualSalesTax : totalSalesTax
                  }
                  onChange={(e) => handleSalesTaxChange(e.target.value)}
                  className="w-32 text-right"
                  disabled={isLocked}
                />
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
            <TableRow className="font-bold">
              <TableCell>Grand Total</TableCell>
              <TableCell></TableCell>
              <TableCell className="text-right">
                ${grandTotal.toLocaleString()}
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
