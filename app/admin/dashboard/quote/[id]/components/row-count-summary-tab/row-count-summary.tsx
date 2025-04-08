"use client";
import { useEffect, useState } from "react";
import CostBreakdownTable from "./cost-breakdown-table";
import MarginTaxes from "./margin-taxes";
import SalesTaxes, { SalesTaxes as SalesTaxesType } from "./sales-taxes";
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
  const { quote, quoteContext } = useQuote();
  const [materialCost, setMaterialCost] = useState<number>(0);
  const [marginTaxes, setMarginTaxes] = useState<MarginTax>({
    materialMargin: quote.materialMargin,
    freightMargin: quote.freightMargin,
    installationMargin: quote.installationMargin,
    rentalsMargin: quote.rentalsMargin,
    permitsMargin: quote.permitsMargin,
    engCalsMargin: quote.engCalsMargin,
  });

  // Initialize sales taxes with values from quoteContext
  const [salesTaxes, setSalesTaxes] = useState<SalesTaxesType>({
    materialSalesTax: quoteContext?.materialSalesTaxApplicable || false,
    materialSalesTaxRate: quoteContext?.materialSalesTax || 0,
    freightSalesTax: quoteContext?.freightSalesTaxApplicable || false,
    freightSalesTaxRate: quoteContext?.freightSalesTax || 0,
    installationSalesTax: quoteContext?.installationSalesTaxApplicable || false,
    installationSalesTaxRate: quoteContext?.installationSalesTax || 0,
    rentalsSalesTax: quoteContext?.rentalsSalesTaxApplicable || false,
    rentalsSalesTaxRate: quoteContext?.rentalsSalesTax || 0,
    permitsSalesTax: quoteContext?.permitsSalesTaxApplicable || false,
    permitsSalesTaxRate: quoteContext?.permitsSalesTax || 0,
    engCalsSalesTax: quoteContext?.engCalcsSalesTaxApplicable || false,
    engCalsSalesTaxRate: quoteContext?.engCalcsSalesTax || 0,
  });

  // Update salesTaxes when quoteContext changes
  useEffect(() => {
    if (quoteContext) {
      setSalesTaxes({
        materialSalesTax: quoteContext.materialSalesTaxApplicable || false,
        materialSalesTaxRate: quoteContext.materialSalesTax || 0,
        freightSalesTax: quoteContext.freightSalesTaxApplicable || false,
        freightSalesTaxRate: quoteContext.freightSalesTax || 0,
        installationSalesTax: quoteContext.installationSalesTaxApplicable || false,
        installationSalesTaxRate: quoteContext.installationSalesTax || 0,
        rentalsSalesTax: quoteContext.rentalsSalesTaxApplicable || false,
        rentalsSalesTaxRate: quoteContext.rentalsSalesTax || 0,
        permitsSalesTax: quoteContext.permitsSalesTaxApplicable || false,
        permitsSalesTaxRate: quoteContext.permitsSalesTax || 0,
        engCalsSalesTax: quoteContext.engCalcsSalesTaxApplicable || false,
        engCalsSalesTaxRate: quoteContext.engCalcsSalesTax || 0,
      });
    }
  }, [quoteContext]);

  const [costItems, setCostItems] = useState<CostItem>({
    freight: quote.freight,
    installation: quote.installation,
    rentals: quote.rentals,
    permits: quote.permits,
    engCals: quote.engCals,
    salesTax: quote.salesTax,
    materialCost: 0,
  });
  const [showMarginTaxes, setShowMarginTaxes] = useState(true);
  const [showSalesTaxes, setShowSalesTaxes] = useState(true);

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

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="show-margin-taxes"
            checked={showMarginTaxes}
            onCheckedChange={setShowMarginTaxes}
          />
          <Label htmlFor="show-margin-taxes">Show Margin Taxes</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="show-sales-taxes"
            checked={showSalesTaxes}
            onCheckedChange={setShowSalesTaxes}
          />
          <Label htmlFor="show-sales-taxes">Show Sales Taxes</Label>
        </div>
      </div>

      <div
        className={`grid ${
          !showMarginTaxes && !showSalesTaxes
            ? "grid-cols-1"
            : showMarginTaxes && showSalesTaxes
            ? "grid-cols-3"
            : "grid-cols-2"
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
        {showSalesTaxes && (
          <div className="w-full">
            <SalesTaxes salesTaxes={salesTaxes} setSalesTaxes={setSalesTaxes} />
          </div>
        )}
      </div>
    </div>
  );
}
