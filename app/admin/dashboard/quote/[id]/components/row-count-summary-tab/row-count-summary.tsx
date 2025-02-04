"use client";
import { useEffect, useState } from "react";
import CostBreakdownTable from "./cost-breakdown-table";
import MarginTaxes from "./margin-taxes";
import ScopeItemsAndNotes from "./scope-and-notes.";
import { apiRequest } from "@/utils/client-side-api";
import { useQuote } from "../../context/quote-context";

export interface MarginTax {
  freightMargin?: number;
  installationMargin?: number;
  rentalsMargin?: number;
  permitsMargin?: number;
  engCalsMargin?: number;
  materialMargin?: number;
}

export interface CostItem {
  freight?: number;
  installation?: number;
  rentals?: number;
  permits?: number;
  engCals?: number;
  salesTax?: number;
}

interface Props {
  quoteId: string;
}

export default function RownCountSummary({ quoteId }: Props) {
  const { quote } = useQuote();
  const [materialCost, setMaterialCost] = useState<number>(0);
  const [marginTaxes, setMarginTaxes] = useState<MarginTax>({
    freightMargin: quote.freightMargin,
    installationMargin: quote.installationMargin,
    rentalsMargin: quote.rentalsMargin,
    permitsMargin: quote.permitsMargin,
    engCalsMargin: quote.engCalsMargin,
  });
  const [costItems, setCostItems] = useState<CostItem>({
    freight: quote.freight,
    installation: quote.installation,
    rentals: quote.rentals,
    permits: quote.permits,
    engCals: quote.engCals,
    salesTax: quote.salesTax,
  });

  useEffect(() => {
    const fetchMaterialCost = async () => {
      const response = await apiRequest({
        method: "get",
        url: `/api/Part/TotalMaterialCost/${quoteId}`,
      });
      setMaterialCost(response);
    };
    fetchMaterialCost();
  }, [quoteId]);

  return (
    <div className="flex flex-col p-6 gap-1 w-full">
      <ScopeItemsAndNotes />

      <div className="flex gap-1 w-full justify-center">
        <CostBreakdownTable
          marginTaxes={marginTaxes}
          costItems={costItems}
          setCostItems={setCostItems}
          materialCost={materialCost}
        />
        <MarginTaxes marginTax={marginTaxes} setMarginTax={setMarginTaxes} />
      </div>
    </div>
  );
}
