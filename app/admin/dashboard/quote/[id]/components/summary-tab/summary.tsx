"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type Props = {
  quoteId: string;
};

interface AreaData {
  areaId: string;
  areaName: string;
  engCalcs: number;
  engCalcsPercentage: number;
  engCalcsSalesTax: number;
  engCalcsSalesTaxApplicable: boolean;
  engCalcsSalesTaxCost: number;
  engCalcsWithMargin: number;
  freight: number;
  freightPercentage: number;
  freightSalesTax: number;
  freightSalesTaxApplicable: boolean;
  freightSalesTaxCost: number;
  freightWithMargin: number;
  installation: number;
  installationPercentage: number;
  installationSalesTax: number;
  installationSalesTaxApplicable: boolean;
  installationSalesTaxCost: number;
  installationWithMargin: number;
  materialPercentage: number;
  materialSalesTax: number;
  materialSalesTaxApplicable: boolean;
  materialSalesTaxCost: number;
  permits: number;
  permitsPercentage: number;
  permitsSalesTax: number;
  permitsSalesTaxApplicable: boolean;
  permitsSalesTaxCost: number;
  permitsWithMargin: number;
  rentals: number;
  rentalsPercentage: number;
  rentalsSalesTax: number;
  rentalsSalesTaxApplicable: boolean;
  rentalsSalesTaxCost: number;
  rentalsWithMargin: number;
  salesTaxMessage: string;
  totalMaterialCost: number;
  totalMaterialCostWithMargin: number;
  totalMaterialWeight: number;
  totalSalesTax: number;
  miscellaneous?: number;
}

export default function Summary({ quoteId }: Props) {
  const { data: session, status } = useSession();
  const token = session?.user?.token;
  const [areas, setAreas] = useState<AreaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<AreaData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchAreaSummary = async () => {
    try {
      if (!token) return;

      setLoading(true);
      setError(null);

      const response = await axios.get<AreaData[]>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/Part/TotalMaterialCostPerArea/${quoteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data);
      setAreas(response.data);
    } catch (error) {
      console.error("Failed to fetch summary:", error);
      setError("Failed to load area data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchAreaSummary();
  }, [token, quoteId]);

  const calculateTotal = (area: AreaData) => {
    let total =
      area.totalMaterialCostWithMargin +
      area.freightWithMargin +
      area.installationWithMargin +
      (area.rentalsWithMargin || 0) +
      area.permitsWithMargin +
      area.engCalcsWithMargin +
      (area.miscellaneous || 0);

    if (area.materialSalesTaxApplicable) {
      total += area.materialSalesTaxCost || 0;
    }
    if (area.freightSalesTaxApplicable) {
      total += area.freightSalesTaxCost || 0;
    }
    if (area.installationSalesTaxApplicable) {
      total += area.installationSalesTaxCost || 0;
    }
    if (area.rentalsSalesTaxApplicable) {
      total += area.rentalsSalesTaxCost || 0;
    }
    if (area.permitsSalesTaxApplicable) {
      total += area.permitsSalesTaxCost || 0;
    }
    if (area.engCalcsSalesTaxApplicable) {
      total += area.engCalcsSalesTaxCost || 0;
    }

    return total;
  };
  const calculateTotalWithoutTaxes = (area: AreaData) => {
    const total =
      area.totalMaterialCostWithMargin +
      area.freightWithMargin +
      area.installationWithMargin +
      (area.rentalsWithMargin || 0) +
      area.permitsWithMargin +
      area.engCalcsWithMargin +
      (area.miscellaneous || 0);

    return total;
  };

  const handleRowClick = (area: AreaData) => {
    setSelectedArea({ ...area });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedArea(null);
  };

  const handleValueChange = (field: keyof AreaData, value: number) => {
    if (!selectedArea) return;

    console.log("handleValueChange1", field, value);
    setSelectedArea({
      ...selectedArea,
      [field]: value,
    });
  };

  const handleToggleChange = (field: keyof AreaData, checked: boolean) => {
    if (!selectedArea) return;

    setSelectedArea({
      ...selectedArea,
      [field]: checked,
    });
  };

  const saveChanges = async () => {
    if (!selectedArea || !token) return;

    try {
      setIsSaving(true);

      // Update local state optimistically
      setAreas(
        areas.map((area) =>
          area.areaId === selectedArea.areaId ? selectedArea : area
        )
      );

      // Send to API
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/Area`,
        selectedArea,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const response = await axios.get<AreaData[]>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/Part/TotalMaterialCostPerArea/${quoteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAreas(response.data);

      closeModal();
    } catch (error) {
      console.error("Failed to update area:", error);
      //   toast({
      //     title: "Error",
      //     description: "Failed to update area data",
      //     variant: "destructive",
      //   });
      // Revert optimistic update
      setAreas(areas);
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <>
      <div className="table-component overflow-auto max-w-full max-h-full outline-none relative">
        <table className="border-collapse border border-gray-300 bg-white min-w-full user-select-none">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2 font-bold text-left w-[200px]  bg-white z-20">
                Area
              </th>
              <th className="border border-gray-300 p-2 font-bold text-center">
                Weight
              </th>
              <th className="border border-gray-300 p-2 font-bold text-center">
                Material
              </th>
              <th className="border border-gray-300 p-2 font-bold text-center">
                Freight
              </th>
              <th className="border border-gray-300 p-2 font-bold text-center">
                Installation
              </th>
              <th className="border border-gray-300 p-2 font-bold text-center">
                Rentals
              </th>
              <th className="border border-gray-300 p-2 font-bold text-center">
                Permits
              </th>
              <th className="border border-gray-300 p-2 font-bold text-center">
                Engineering
              </th>
              <th className="border border-gray-300 p-2 font-bold text-center">
                Miscellaneous
              </th>
              <th className="border border-gray-300 p-2 font-bold text-center">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {areas.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center p-4 text-gray-500">
                  No area data available
                </td>
              </tr>
            ) : (
              areas.map((area) => (
                <tr
                  key={area.areaId}
                  onClick={() => handleRowClick(area)}
                  className="hover:bg-gray-50 cursor-pointer border-gray-300 border "
                >
                  <td title={area.areaName}>{area.areaName}</td>
                  <td className="border border-gray-300 p-2 text-center">
                    {area.totalMaterialWeight.toFixed(3)} kg
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    ${area.totalMaterialCost.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    $
                    {(
                      area.freightWithMargin + area.freightSalesTaxCost
                    ).toFixed(2)}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    $
                    {(
                      area.installation + area.installationSalesTaxCost
                    ).toFixed(2)}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    ${(area.rentals + area.rentalsSalesTaxCost || 0).toFixed(2)}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    ${(area.permits + area.permitsSalesTaxCost).toFixed(2)}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    ${(area.engCalcs + area.engCalcsSalesTaxCost).toFixed(2)}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    $
                    {(
                      (area.miscellaneous || 0) +
                      (area.materialSalesTaxCost || 0)
                    ).toFixed(2)}
                  </td>
                  <td className="border border-gray-300 p-2 text-center font-bold">
                    ${calculateTotal(area).toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detailed Area Modal */}
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Area Details - {selectedArea?.areaName}</DialogTitle>
          </DialogHeader>

          {selectedArea && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Basic Information</h3>
                  <DetailRow label="Area Name" value={selectedArea.areaName} />
                  <DetailRow
                    label="Total Weight"
                    value={`${selectedArea.totalMaterialWeight} kg`}
                  />
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Cost Summary</h3>
                  <DetailRow
                    label="Material Cost"
                    value={`$${selectedArea.totalMaterialCost.toFixed(2)}`}
                  />
                  <DetailRow
                    label="With Margin"
                    value={`$${selectedArea.totalMaterialCostWithMargin.toFixed(
                      2
                    )}`}
                  />
                  <DetailRow
                    label="Total Sales Tax"
                    value={`$${selectedArea.totalSalesTax.toFixed(2)}`}
                  />
                </div>

                {/* <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Total Calculations</h3>
                  <DetailRow
                    label="Subtotal"
                    value={`$${calculateTotalWithoutTaxes(selectedArea).toFixed(
                      2
                    )}`}
                  />
                  <DetailRow
                    label="With Tax"
                    value={`$${calculateTotal(selectedArea).toFixed(2)}`}
                  />
                </div> */}
              </div>

              {/* Editable Tax Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TaxSection
                  title="Material Tax"
                  baseValue={selectedArea.totalMaterialCost}
                  taxValue={selectedArea.materialSalesTax}
                  taxApplicable={selectedArea.materialSalesTaxApplicable}
                  onValueChange={(v) =>
                    handleValueChange("materialSalesTax", v)
                  }
                  onToggleChange={(c) =>
                    handleToggleChange("materialSalesTaxApplicable", c)
                  }
                />

                <TaxSection
                  title="Freight Tax"
                  baseValue={selectedArea.freight}
                  taxValue={selectedArea.freightSalesTax}
                  taxApplicable={selectedArea.freightSalesTaxApplicable}
                  onValueChange={(v) => handleValueChange("freightSalesTax", v)}
                  onToggleChange={(c) =>
                    handleToggleChange("freightSalesTaxApplicable", c)
                  }
                />

                <TaxSection
                  title="Installation Tax"
                  baseValue={selectedArea.installation}
                  taxValue={selectedArea.installationSalesTax}
                  taxApplicable={selectedArea.installationSalesTaxApplicable}
                  onValueChange={(v) =>
                    handleValueChange("installationSalesTax", v)
                  }
                  onToggleChange={(c) =>
                    handleToggleChange("installationSalesTaxApplicable", c)
                  }
                />

                <TaxSection
                  title="Permits Tax"
                  baseValue={selectedArea.permits}
                  taxValue={selectedArea.permitsSalesTax}
                  taxApplicable={selectedArea.permitsSalesTaxApplicable}
                  onValueChange={(v) => handleValueChange("permitsSalesTax", v)}
                  onToggleChange={(c) =>
                    handleToggleChange("permitsSalesTaxApplicable", c)
                  }
                />

                <TaxSection
                  title="Rentals Tax"
                  baseValue={selectedArea.rentals || 0}
                  taxValue={selectedArea.rentalsSalesTax}
                  taxApplicable={selectedArea.rentalsSalesTaxApplicable}
                  onValueChange={(v) => handleValueChange("rentalsSalesTax", v)}
                  onToggleChange={(c) =>
                    handleToggleChange("rentalsSalesTaxApplicable", c)
                  }
                />

                <TaxSection
                  title="Engineering Tax"
                  baseValue={selectedArea.engCalcs}
                  taxValue={selectedArea.engCalcsSalesTax}
                  taxApplicable={selectedArea.engCalcsSalesTaxApplicable}
                  onValueChange={(v) =>
                    handleValueChange("engCalcsSalesTax", v)
                  }
                  onToggleChange={(c) =>
                    handleToggleChange("engCalcsSalesTaxApplicable", c)
                  }
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button onClick={saveChanges} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex justify-between py-1 border-b">
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function TaxSection({
  title,
  baseValue,
  taxValue,
  taxApplicable,
  onValueChange,
  onToggleChange,
}: {
  title: string;
  baseValue: number;
  taxValue: number;
  taxApplicable: boolean;
  onValueChange: (value: number) => void;
  onToggleChange: (checked: boolean) => void;
}) {
  const calculatedTax = (baseValue * taxValue) / 100;

  // Mostramos el valor como porcentaje (20.2 para 20.2%)
  const [inputValue, setInputValue] = useState<string>(taxValue.toString());

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Validamos que sea un número válido
    if (/^\d*\.?\d*$/.test(value)) {
      setInputValue(value);

      const numericValue = parseFloat(value || "0");
      console.log("numericValue", numericValue);
      onValueChange(numericValue);
    }
  };

  const handleBlur = () => {
    const num = parseFloat(inputValue);
    if (!isNaN(num)) {
      // Formateamos a máximo 2 decimales
      const formatted = num.toFixed(2);
      setInputValue(formatted);
      onValueChange(parseFloat(formatted));
    } else {
      // Reseteamos si no es válido
      setInputValue((taxValue * 100).toFixed(2));
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">{title}</h3>
        <div className="flex items-center space-x-2">
          <Label htmlFor={`${title}-toggle`}>Apply Tax</Label>
          <Switch
            id={`${title}-toggle`}
            checked={taxApplicable}
            onCheckedChange={onToggleChange}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor={`${title}-rate`}>Tax Rate (%)</Label>
            <Input
              id={`${title}-rate`}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleBlur}
              disabled={!taxApplicable}
              placeholder="0.00"
            />
          </div>
          <div>
            <Label>Calculated Tax</Label>
            <div className="h-10 flex items-center px-3 border rounded-md bg-gray-50">
              ${calculatedTax.toFixed(2)}
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          Base value: ${baseValue.toFixed(2)} × {inputValue}% = $
          {calculatedTax.toFixed(2)}
        </div>
      </div>
    </div>
  );
}
