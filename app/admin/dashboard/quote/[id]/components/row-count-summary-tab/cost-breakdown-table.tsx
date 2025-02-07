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
import { Card } from "@/components/ui/card";
import { useQuote } from "../../context/quote-context";
import { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/utils/client-side-api";

export interface CostItem {
  freight?: number;
  installation?: number;
  rentals?: number;
  permits?: number;
  engCals?: number;
  salesTax?: number;
}

export interface MarginTax {
  freightMargin?: number;
  installationMargin?: number;
  rentalsMargin?: number;
  permitsMargin?: number;
  engCalsMargin?: number;
  salesTaxRate?: number;
  materialMargin?: number;
}

type Props = {
  marginTaxes: MarginTax;
  costItems: CostItem;
  setCostItems: (costItems: CostItem) => void;
  materialCost: number;
};

export default function CostBreakdownTable({
  marginTaxes,
  costItems,
  setCostItems,
  materialCost,
}: Props) {
  const { isLocked, quoteContext, setQuoteContext } = useQuote();
  const [totalBeforeTaxes, setTotalBeforeTaxes] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  const handleCostChange = (key: keyof CostItem, value: string) => {
    const newCostItems = { ...costItems, [key]: Number(value) || 0 };
    setCostItems(newCostItems);
  };

  const calculateTotalWithMargin = useCallback(
    (cost: number | undefined, margin: number | undefined): number => {
      if (cost === undefined || margin === undefined) return 0;
      return cost + (cost * margin) / 100;
    },
    []
  );

  useEffect(() => {
    let total = calculateTotalWithMargin(
      materialCost,
      marginTaxes.materialMargin
    );
    total += calculateTotalWithMargin(
      costItems.freight,
      marginTaxes.freightMargin
    );
    total += calculateTotalWithMargin(
      costItems.installation,
      marginTaxes.installationMargin
    );
    total += calculateTotalWithMargin(
      costItems.rentals,
      marginTaxes.rentalsMargin
    );
    total += calculateTotalWithMargin(
      costItems.permits,
      marginTaxes.permitsMargin
    );
    total += calculateTotalWithMargin(
      costItems.engCals,
      marginTaxes.engCalsMargin
    );
    total += calculateTotalWithMargin(materialCost, marginTaxes.materialMargin);

    setTotalBeforeTaxes(total);
    setGrandTotal(total + (costItems.salesTax || 0));
  }, [costItems, marginTaxes, materialCost, calculateTotalWithMargin]);

  const costItemsArray: { key: keyof CostItem; label: string }[] = [
    { key: "freight", label: "Freight" },
    { key: "installation", label: "Installation" },
    { key: "rentals", label: "Rentals" },
    { key: "permits", label: "Permits" },
    { key: "engCals", label: "Engineering Calculations" },
  ];

  const handleBlur = async (field: keyof CostItem, value: string) => {
    const updatedValue = parseFloat(value) || 0;
    const updatedCostItems = { ...costItems, [field]: updatedValue };

    try {
      const response = await apiRequest({
        method: "put",
        url: `/api/Quotation`,
        data: {
          ...quoteContext,
          [field]: updatedValue,
        },
      });

      toast({
        title: "Success",
        description: "Cost item updated successfully",
      });

      setQuoteContext(response);
      setCostItems(updatedCostItems); // Update local state after successful request
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Error updating cost item",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-[500px]">
      <div className="container mx-auto p-6 max-w-3xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Item</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead className="text-right">Total w/ Margin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Material Cost</TableCell>
              <TableCell className="text-right">
                ${materialCost.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                $
                {calculateTotalWithMargin(
                  materialCost,
                  marginTaxes.materialMargin
                ).toLocaleString()}
              </TableCell>
            </TableRow>
            {costItemsArray.map(({ key, label }) => (
              <TableRow key={key}>
                <TableCell className="font-medium">{label}</TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    value={costItems[key] || 0}
                    onChange={(e) => handleCostChange(key, e.target.value)}
                    onBlur={(e) => handleBlur(key, e.target.value)}
                    className="w-32 text-right"
                    disabled={isLocked}
                  />
                </TableCell>
                <TableCell className="text-right">
                  $
                  {calculateTotalWithMargin(
                    costItems[key],
                    marginTaxes[`${key}Margin` as keyof MarginTax]
                  ).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="font-bold">
              <TableCell>Total Before Taxes</TableCell>
              <TableCell></TableCell>
              <TableCell className="text-right">
                ${totalBeforeTaxes.toLocaleString()}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Sales Tax</TableCell>
              <TableCell></TableCell>
              <TableCell className="text-right">
                <Input
                  type="number"
                  value={costItems.salesTax || 0}
                  onChange={(e) => handleCostChange("salesTax", e.target.value)}
                  onBlur={(e) => handleBlur("salesTax", e.target.value)}
                  className="w-32 text-right"
                  disabled={isLocked}
                />
              </TableCell>
            </TableRow>
            <TableRow className="font-bold">
              <TableCell>Grand Total</TableCell>
              <TableCell></TableCell>
              <TableCell className="text-right">
                ${grandTotal.toLocaleString()}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
