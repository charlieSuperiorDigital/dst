"use client";
import { useEffect, useState } from "react";
import CostBreakdownTable from "./cost-breakdown-table";
import MarginTaxes from "./margin-taxes";
import ScopeItemsAndNotes from "./scope-and-notes.";
import { apiRequest } from "@/utils/client-side-api";

export interface MarginTax {
  name: string;
  price: number;
}

export interface CostItem {
  item: string;
  price: number;
  highlight?: boolean;
  note?: string;
}

const mockMarginTaxes: MarginTax[] = [
  {
    name: "Material Margin",
    price: 15, // 15%
  },
  {
    name: "Sales Tax Rate",
    price: 8.25, // 20.5%
  },
  {
    name: "Permits Cost Plus",
    price: 5.75, // 5.75%
  },
];

interface Props {
  quoteId: string;
}

export default function RownCountSummary({ quoteId }: Props) {
  console.log(quoteId);
  const [marginTaxes, setMarginTaxes] = useState<MarginTax[]>(mockMarginTaxes);
  const [costItems, setCostItems] = useState<CostItem[]>([
    { item: "Material", price: 0 },
    { item: "Freight", price: 19618 },
    { item: "Installation (non union)", price: 62750 },
    { item: "Rentals", price: 8900 },
    {
      item: "Permits Package",
      price: 2800,
    },
    {
      item: "Engineer calculations",
      price: 2800,
    },
  ]);

  useEffect(() => {
    const fetchMaterialCost = async () => {
      const response = await apiRequest({
        method: "get",
        url: `/api/Part/TotalMaterialCost/${quoteId}`,
      });

      setCostItems((prev) => {
        return prev.map((item) => {
          if (item.item === "Material") {
            return { ...item, price: response };
          }
          return item;
        });
      });
    };

    fetchMaterialCost();
  }, [quoteId]);

  return (
    <div className="flex flex-col p-6 gap-1 w-full">
      <ScopeItemsAndNotes />

      <div className="flex gap-1 w-full">
        <CostBreakdownTable
          marginTaxes={marginTaxes}
          costItems={costItems}
          setCostItems={setCostItems}
        />
        <MarginTaxes
          marginTaxes={marginTaxes}
          setMarginTaxes={setMarginTaxes}
        />
      </div>
    </div>
  );
}
