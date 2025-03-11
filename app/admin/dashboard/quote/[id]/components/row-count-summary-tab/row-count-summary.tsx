"use client";
import { useEffect, useState } from "react";
import CostBreakdownTable from "./cost-breakdown-table";
import MarginTaxes from "./margin-taxes";
import ScopeItemsAndNotes from "./scope-and-notes.";
import { apiRequest } from "@/utils/client-side-api";
import { useQuote } from "../../context/quote-context";
import { Switch } from "@/components/ui/switch"; // Importa el componente Switch
import { Label } from "@/components/ui/label"; // Importa el componente Label

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
  materialCost?: number;
}

interface Props {
  quoteId: string;
}

export default function RownCountSummary({ quoteId }: Props) {
  const { quote } = useQuote();
  const [materialCost, setMaterialCost] = useState<number>(0);
  const [marginTaxes, setMarginTaxes] = useState<MarginTax>({
    materialMargin: quote.materialMargin,
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
  const [showMarginTaxes, setShowMarginTaxes] = useState(true); // Estado para controlar la visibilidad

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
    <div className="flex flex-col p-6 gap-6 w-full">
      <ScopeItemsAndNotes />

      {/* Toggle para mostrar/ocultar MarginTaxes */}
      <div className="flex items-center space-x-2">
        <Switch
          id="show-margin-taxes"
          checked={showMarginTaxes}
          onCheckedChange={setShowMarginTaxes}
        />
        <Label htmlFor="show-margin-taxes">Show Margin Taxes</Label>
      </div>

      <div
        className={`grid ${
          showMarginTaxes ? "grid-cols-2" : "grid-cols-1"
        } gap-4`}
      >
        <div className="w-full">
          <CostBreakdownTable
            marginTaxes={marginTaxes}
            costItems={costItems}
            setCostItems={setCostItems}
            materialCost={materialCost}
          />
        </div>
        {showMarginTaxes && (
          <div className="w-full">
            <MarginTaxes
              marginTax={marginTaxes}
              setMarginTax={setMarginTaxes}
            />
          </div>
        )}
      </div>
    </div>
  );
}
