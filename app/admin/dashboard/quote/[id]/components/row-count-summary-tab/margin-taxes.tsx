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
import { MarginTax } from "./row-count-summary";
import { apiRequest } from "@/utils/client-side-api";
import { toast } from "@/hooks/use-toast";

type Props = {
  marginTax: MarginTax;
  setMarginTax: (marginTax: MarginTax) => void;
};

export default function MarginTaxes({ marginTax, setMarginTax }: Props) {
  const { isLocked, quoteContext, setQuoteContext } = useQuote();

  const handleMarginChange = (field: keyof MarginTax, newValue: string) => {
    const updatedMarginTax = { ...marginTax };
    updatedMarginTax[field] = parseFloat(newValue) || 0; // Update the specific field
    setMarginTax(updatedMarginTax); // Update the state
  };
  const handleBlur = async (field: keyof MarginTax, value: string) => {
    const updatedValue = parseFloat(value) || 0;
    try {
      const response = await apiRequest({
        method: "put",
        url: `/api/Quotation`,
        data: {
          ...quoteContext,
          [field]: updatedValue,
        },
      });
      setQuoteContext(response);
      toast({
        title: "Success",
        description: "Margin tax updated",
      });
    } catch (e) {
      console.log(e);
      toast({
        title: "Error",
        description: "Error updating margin tax",
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
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead className="w-[100px]">%</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(marginTax).map(([field, value]) => (
              <TableRow key={field}>
                <TableCell className="font-medium">
                  {field
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())
                    .replace("Margin", "")}
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={value || 0}
                    onChange={(e) =>
                      handleMarginChange(
                        field as keyof MarginTax,
                        e.target.value
                      )
                    }
                    onBlur={(e) =>
                      handleBlur(field as keyof MarginTax, e.target.value)
                    }
                    className="w-24"
                    step="0.01"
                    min="0"
                    max="100"
                    disabled={isLocked}
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
