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
import { apiRequest } from "@/utils/client-side-api";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

export interface SalesTaxes {
  materialSalesTax: boolean;
  materialSalesTaxRate: number;
  freightSalesTax: boolean;
  freightSalesTaxRate: number;
  installationSalesTax: boolean;
  installationSalesTaxRate: number;
  rentalsSalesTax: boolean;
  rentalsSalesTaxRate: number;
  permitsSalesTax: boolean;
  permitsSalesTaxRate: number;
  engCalsSalesTax: boolean;
  engCalsSalesTaxRate: number;
}

type TaxToggleKey =
  | "materialSalesTax"
  | "freightSalesTax"
  | "installationSalesTax"
  | "rentalsSalesTax"
  | "permitsSalesTax"
  | "engCalsSalesTax";
type TaxRateKey =
  | "materialSalesTaxRate"
  | "freightSalesTaxRate"
  | "installationSalesTaxRate"
  | "rentalsSalesTaxRate"
  | "permitsSalesTaxRate"
  | "engCalsSalesTaxRate";

type Props = {
  salesTaxes: SalesTaxes;
  setSalesTaxes: (salesTaxes: SalesTaxes) => void;
};

export default function SalesTaxes({ salesTaxes, setSalesTaxes }: Props) {
  const { isLocked, quoteContext, setQuoteContext } = useQuote();
  console.log("quote context full structure:", quoteContext);
  console.log("rentals fields:", {
    rentalsSalesTaxApplicable: quoteContext?.rentalsSalesTaxApplicable,
    rentalsSalesTax: quoteContext?.rentalsSalesTax,
  });

  // Map UI field names to API field names
  const uiToApiFieldMap = {
    materialSalesTax: "materialSalesTaxApplicable",
    materialSalesTaxRate: "materialSalesTax",
    freightSalesTax: "freightSalesTaxApplicable",
    freightSalesTaxRate: "freightSalesTax",
    installationSalesTax: "installationSalesTaxApplicable",
    installationSalesTaxRate: "installationSalesTax",
    rentalsSalesTax: "rentalsSalesTaxApplicable",
    rentalsSalesTaxRate: "rentalsSalesTax",
    permitsSalesTax: "permitsSalesTaxApplicable",
    permitsSalesTaxRate: "permitsSalesTax",
    engCalsSalesTax: "engCalcsSalesTaxApplicable",
    engCalsSalesTaxRate: "engCalcsSalesTax",
  };

  const handleToggleChange = (field: TaxToggleKey, checked: boolean) => {
    const updatedSalesTaxes = { ...salesTaxes };
    updatedSalesTaxes[field] = checked;
    setSalesTaxes(updatedSalesTaxes);

    // Immediately update the API for a more fluid experience
    handleToggleBlur(field, checked);
  };

  const handleRateChange = (field: TaxRateKey, value: string) => {
    const updatedSalesTaxes = { ...salesTaxes };
    updatedSalesTaxes[field] = parseFloat(value) || 0;
    setSalesTaxes(updatedSalesTaxes);
    
    // Immediately update the API for a more fluid experience
    handleRateBlur(field, value);
  };

  const handleToggleBlur = async (field: TaxToggleKey, value: boolean) => {
    try {
      const apiField = uiToApiFieldMap[field];

      const response = await apiRequest({
        method: "put",
        url: `/api/Quotation`,
        data: {
          ...quoteContext,
          [apiField]: value,
        },
      });

      setQuoteContext(response);
      toast({
        title: "Success",
        description: "Sales tax toggle updated",
        duration: 2000,
      });
    } catch (e) {
      console.log(e);
      toast({
        title: "Error",
        description: "Error updating sales tax toggle",
        variant: "destructive",
      });
    }
  };

  const handleRateBlur = async (field: TaxRateKey, value: string) => {
    try {
      const numValue = parseFloat(value) || 0;
      const apiField = uiToApiFieldMap[field];

      const response = await apiRequest({
        method: "put",
        url: `/api/Quotation`,
        data: {
          ...quoteContext,
          [apiField]: numValue,
        },
      });

      setQuoteContext(response);
      toast({
        title: "Success",
        description: "Sales tax rate updated",
        duration: 2000,
      });
    } catch (e) {
      console.log(e);
      toast({
        title: "Error",
        description: "Error updating sales tax rate",
        variant: "destructive",
      });
    }
  };

  // Group related fields (toggle and rate) for each item
  const getItemGroups = () => {
    const groups: { name: string; toggle: TaxToggleKey; rate: TaxRateKey }[] = [
      {
        name: "Material",
        toggle: "materialSalesTax",
        rate: "materialSalesTaxRate",
      },
      {
        name: "Freight",
        toggle: "freightSalesTax",
        rate: "freightSalesTaxRate",
      },
      {
        name: "Installation",
        toggle: "installationSalesTax",
        rate: "installationSalesTaxRate",
      },
      {
        name: "Rentals",
        toggle: "rentalsSalesTax",
        rate: "rentalsSalesTaxRate",
      },
      {
        name: "Permits",
        toggle: "permitsSalesTax",
        rate: "permitsSalesTaxRate",
      },
      {
        name: "Eng Calcs",
        toggle: "engCalsSalesTax",
        rate: "engCalsSalesTaxRate",
      },
    ];
    return groups;
  };

  return (
    <Card className="w-full">
      <div className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Item</TableHead>
              <TableHead className="text-right">Apply Tax</TableHead>
              <TableHead className="text-right">Rate (%)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getItemGroups().map((group) => (
              <TableRow key={group.name}>
                <TableCell className="font-medium">{group.name}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <Switch
                      checked={salesTaxes[group.toggle]}
                      onCheckedChange={(checked) =>
                        handleToggleChange(group.toggle, checked)
                      }
                      disabled={isLocked}
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    value={salesTaxes[group.rate]}
                    onChange={(e) =>
                      handleRateChange(group.rate, e.target.value)
                    }
                    className="w-24 ml-auto"
                    step="0.01"
                    min="0"
                    max="100"
                    disabled={isLocked || !salesTaxes[group.toggle]}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
