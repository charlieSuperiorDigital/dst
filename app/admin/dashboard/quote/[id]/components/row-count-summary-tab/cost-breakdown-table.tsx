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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuote } from "../../context/quote-context";
import { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/utils/client-side-api";
import { formatCurrency } from "@/utils/format-currency";

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
  const { isLocked, quoteContext, setQuoteContext, areaMaterialcost } =
    useQuote();
  const [totalBeforeTaxes, setTotalBeforeTaxes] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");
  const [currentMaterialCost, setCurrentMaterialCost] = useState(materialCost);

  const TOTAL_TAB_ID = "total";

  // Set default selected area when component mounts
  useEffect(() => {
    if (areaMaterialcost && areaMaterialcost.length > 0 && !selectedAreaId) {
      setSelectedAreaId(areaMaterialcost[0].areaId);
      setCurrentMaterialCost(areaMaterialcost[0].totalMaterialCost);
    }
  }, [areaMaterialcost, selectedAreaId]);

  const handleTabChange = (areaId: string) => {
    setSelectedAreaId(areaId);
    if (areaId === TOTAL_TAB_ID) {
      setCurrentMaterialCost(calculateTotalMaterialCost());
    } else {
      const selectedArea = areaMaterialcost?.find(
        (area) => area.areaId === areaId
      );
      if (selectedArea) {
        setCurrentMaterialCost(selectedArea.totalMaterialCost);
      }
    }
  };

  const calculateTotalMaterialCost = useCallback(() => {
    if (!areaMaterialcost || areaMaterialcost.length === 0) return materialCost;
    return areaMaterialcost.reduce(
      (sum, area) => sum + area.totalMaterialCost,
      0
    );
  }, [areaMaterialcost, materialCost]);

  const handleCostChange = (key: keyof CostItem, value: string) => {
    const newCostItems = { ...costItems, [key]: Number(value) || 0 };
    setCostItems(newCostItems);
  };

  const calculateTotalWithMargin = useCallback(
    (cost: number | undefined, margin: number | undefined): number => {
      if (cost === undefined || margin === undefined) return 0;
      return cost / (1 - margin / 100);
    },
    []
  );

  useEffect(() => {
    let total = calculateTotalWithMargin(
      currentMaterialCost,
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

    setTotalBeforeTaxes(total);
    setGrandTotal(total + (costItems.salesTax || 0));
  }, [costItems, marginTaxes, currentMaterialCost, calculateTotalWithMargin]);

  const costItemsArray: { key: keyof CostItem; label: string }[] = [
    { key: "freight", label: "Freight" },
    { key: "installation", label: "Installation" },
    { key: "rentals", label: "Rentals" },
    { key: "permits", label: "Permits" },
    { key: "engCals", label: "Engineering Calculations" },
  ];

  const handleBlur = async (field: keyof CostItem, value: string) => {
    const updatedValue = Number.parseFloat(value) || 0;
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
      setCostItems(updatedCostItems);
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
    <Card className="w-full">
      <div className="p-6">
        {areaMaterialcost && areaMaterialcost.length > 0 ? (
          <Tabs
            defaultValue={areaMaterialcost[0].areaId}
            onValueChange={handleTabChange}
            className="mb-6"
          >
            <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {areaMaterialcost.map((area) => (
                <TabsTrigger key={area.areaId} value={area.areaId}>
                  {area.areaName}
                </TabsTrigger>
              ))}
              <TabsTrigger value={TOTAL_TAB_ID} className="font-bold">
                Total
              </TabsTrigger>
            </TabsList>

            {areaMaterialcost.map((area) => (
              <TabsContent key={area.areaId} value={area.areaId}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="text-right">
                        Total w/ Margin
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">
                        Material Cost ({area.areaName})
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(area.totalMaterialCost)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(
                          calculateTotalWithMargin(
                            area.totalMaterialCost,
                            marginTaxes.materialMargin
                          )
                        )}
                      </TableCell>
                    </TableRow>
                    {costItemsArray.map(({ key, label }) => (
                      <TableRow key={key}>
                        <TableCell className="font-medium">{label}</TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            value={costItems[key] || 0}
                            onChange={(e) =>
                              handleCostChange(key, e.target.value)
                            }
                            onBlur={(e) => handleBlur(key, e.target.value)}
                            className="w-32 ml-auto"
                            disabled={isLocked}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(
                            calculateTotalWithMargin(
                              costItems[key],
                              marginTaxes[`${key}Margin` as keyof MarginTax]
                            )
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold">
                      <TableCell>Total Before Taxes</TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(totalBeforeTaxes)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Sales Tax</TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          value={costItems.salesTax || 0}
                          onChange={(e) =>
                            handleCostChange("salesTax", e.target.value)
                          }
                          onBlur={(e) => handleBlur("salesTax", e.target.value)}
                          className="w-32 ml-auto"
                          disabled={isLocked}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow className="font-bold">
                      <TableCell>Grand Total</TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(grandTotal)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TabsContent>
            ))}

            <TabsContent value={TOTAL_TAB_ID}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">
                      Total w/ Margin
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">
                      Total Material Cost (All Areas)
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(calculateTotalMaterialCost())}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(
                        calculateTotalWithMargin(
                          calculateTotalMaterialCost(),
                          marginTaxes.materialMargin
                        )
                      )}
                    </TableCell>
                  </TableRow>
                  {costItemsArray.map(({ key, label }) => (
                    <TableRow key={key}>
                      <TableCell className="font-medium">{label}</TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          value={costItems[key] || 0}
                          onChange={(e) =>
                            handleCostChange(key, e.target.value)
                          }
                          onBlur={(e) => handleBlur(key, e.target.value)}
                          className="w-32 ml-auto"
                          disabled={isLocked}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(
                          calculateTotalWithMargin(
                            costItems[key],
                            marginTaxes[`${key}Margin` as keyof MarginTax]
                          )
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold">
                    <TableCell>Total Before Taxes</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(totalBeforeTaxes)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Sales Tax</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        value={costItems.salesTax || 0}
                        onChange={(e) =>
                          handleCostChange("salesTax", e.target.value)
                        }
                        onBlur={(e) => handleBlur("salesTax", e.target.value)}
                        className="w-32 ml-auto"
                        disabled={isLocked}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow className="font-bold">
                    <TableCell>Grand Total</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(grandTotal)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="text-right">Total w/ Margin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Material Cost</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(materialCost)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(
                    calculateTotalWithMargin(
                      materialCost,
                      marginTaxes.materialMargin
                    )
                  )}
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
                      className="w-32 ml-auto"
                      disabled={isLocked}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(
                      calculateTotalWithMargin(
                        costItems[key],
                        marginTaxes[`${key}Margin` as keyof MarginTax]
                      )
                    )}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold">
                <TableCell>Total Before Taxes</TableCell>
                <TableCell></TableCell>
                <TableCell className="text-right">
                  {formatCurrency(totalBeforeTaxes)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Sales Tax</TableCell>
                <TableCell></TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    value={costItems.salesTax || 0}
                    onChange={(e) =>
                      handleCostChange("salesTax", e.target.value)
                    }
                    onBlur={(e) => handleBlur("salesTax", e.target.value)}
                    className="w-32 ml-auto"
                    disabled={isLocked}
                  />
                </TableCell>
              </TableRow>
              <TableRow className="font-bold">
                <TableCell>Grand Total</TableCell>
                <TableCell></TableCell>
                <TableCell className="text-right">
                  {formatCurrency(grandTotal)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </div>
    </Card>
  );
}
