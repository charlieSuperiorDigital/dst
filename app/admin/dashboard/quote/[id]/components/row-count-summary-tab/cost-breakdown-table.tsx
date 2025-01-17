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
  const handlePriceChange = (index: number, newPrice: string) => {
    const updatedItems = [...costItems];
    updatedItems[index].price = parseFloat(newPrice) || 0;
    setCostItems(updatedItems);
  };

  // Calculate total and additional costs based on marginTaxes
  const calculateWithMargins = () => {
    let totalBeforeTaxes = 0;
    let totalSalesTax = 0;
    let totalTaxableSales = 0;

    const updatedItems = costItems.map((item) => {
      let taxAmount = 0;

      if (item.item.toLowerCase().includes("material")) {
        // Apply Material Margin
        const materialMargin = marginTaxes.find((tax) =>
          tax.name.toLowerCase().includes("material margin")
        );
        taxAmount = (item.price * (materialMargin?.price || 0)) / 100;
      } else if (item.item.toLowerCase().includes("calculations")) {
        // Apply Permits Cost Plus
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

    // Apply Sales Tax Rate
    const salesTaxRate = marginTaxes.find((tax) =>
      tax.name.toLowerCase().includes("sales tax rate")
    );
    totalSalesTax = (totalBeforeTaxes * (salesTaxRate?.price || 0)) / 100;

    // Apply Taxable Sales
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

  const {
    updatedItems,
    totalBeforeTaxes,
    totalSalesTax,
    totalTaxableSales,
    grandTotal,
  } = calculateWithMargins();

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Item</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Total w/ Margin or Tax</TableHead>
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
              ${totalSalesTax.toLocaleString()}
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
  );
}
