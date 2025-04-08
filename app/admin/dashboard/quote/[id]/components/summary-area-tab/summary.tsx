"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

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

interface AreaWithStatus extends AreaData {
  active: boolean;
}

// Helper function to format currency values
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

// Helper function to format weight values
const formatWeight = (value: number) => {
  return `${value.toLocaleString("en-US", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  })} lbs`;
};

export default function Summary({ quoteId }: Props) {
  const { data: session, status } = useSession();
  const token = session?.user?.token;
  const [areas, setAreas] = useState<AreaWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      const areasWithStatus = response.data.map((area) => ({
        ...area,
        active: true,
      }));

      setAreas(areasWithStatus);
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

  const calculateColumnTotals = () => {
    const totals = {
      weight: 0,
      material: 0,
      freight: 0,
      installation: 0,
      rentals: 0,
      permits: 0,
      engCalcs: 0,
      miscellaneous: 0,
      grandTotal: 0,
    };

    areas.forEach((area) => {
      if (!area.active) return;

      totals.weight += area.totalMaterialWeight;
      totals.material += area.totalMaterialCost;
      totals.freight += area.freightWithMargin + area.freightSalesTaxCost;
      totals.installation += area.installation + area.installationSalesTaxCost;
      totals.rentals += area.rentals + area.rentalsSalesTaxCost || 0;
      totals.permits += area.permits + area.permitsSalesTaxCost;
      totals.engCalcs += area.engCalcs + area.engCalcsSalesTaxCost;
      totals.miscellaneous +=
        (area.miscellaneous || 0) + (area.materialSalesTaxCost || 0);
      totals.grandTotal += calculateTotal(area);
    });

    return totals;
  };

  const toggleAreaActive = (areaId: string) => {
    setAreas((prevAreas) =>
      prevAreas.map((area) =>
        area.areaId === areaId ? { ...area, active: !area.active } : area
      )
    );
  };

  if (status === "loading" || loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const columnTotals = calculateColumnTotals();

  return (
    <div className="table-component overflow-auto max-w-full max-h-full outline-none relative">
      <table className="border-collapse border border-gray-300 bg-white min-w-full user-select-none">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2 font-bold text-left w-[50px] bg-white z-20">
              Activo
            </th>
            <th className="border border-gray-300 p-2 font-bold text-left w-[150px] bg-white z-20">
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
              <td colSpan={11} className="text-center p-4 text-gray-500">
                No area data available
              </td>
            </tr>
          ) : (
            <>
              {areas.map((area) => (
                <tr
                  key={area.areaId}
                  className={`border-gray-300 border ${
                    !area.active
                      ? "bg-gray-100 text-gray-500"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <td className="border border-gray-300 p-2 text-center">
                    <input
                      type="checkbox"
                      checked={area.active}
                      onChange={() => toggleAreaActive(area.areaId)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td
                    className="border border-gray-300 p-2"
                    title={area.areaName}
                  >
                    {area.areaName}
                  </td>
                  <td className="border border-gray-300 p-2 text-right">
                    {formatWeight(area.totalMaterialWeight)}
                  </td>
                  <td className="border border-gray-300 p-2 text-right">
                    {formatCurrency(area.totalMaterialCost)}
                  </td>
                  <td className="border border-gray-300 p-2 text-right">
                    {formatCurrency(
                      area.freightWithMargin + area.freightSalesTaxCost
                    )}
                  </td>
                  <td className="border border-gray-300 p-2 text-right">
                    {formatCurrency(
                      area.installation + area.installationSalesTaxCost
                    )}
                  </td>
                  <td className="border border-gray-300 p-2 text-right">
                    {formatCurrency(
                      (area.rentals || 0) + (area.rentalsSalesTaxCost || 0)
                    )}
                  </td>
                  <td className="border border-gray-300 p-2 text-right">
                    {formatCurrency(area.permits + area.permitsSalesTaxCost)}
                  </td>
                  <td className="border border-gray-300 p-2 text-right">
                    {formatCurrency(area.engCalcs + area.engCalcsSalesTaxCost)}
                  </td>
                  <td className="border border-gray-300 p-2 text-right">
                    {formatCurrency(
                      (area.miscellaneous || 0) +
                        (area.materialSalesTaxCost || 0)
                    )}
                  </td>
                  <td className="border border-gray-300 p-2 text-right font-bold">
                    {formatCurrency(calculateTotal(area))}
                  </td>
                </tr>
              ))}
              {/* Totals row */}
              <tr className="bg-blue-50 font-bold">
                <td
                  colSpan={2}
                  className="border border-gray-300 p-2 text-center"
                >
                  Total
                </td>
                <td className="border border-gray-300 p-2 text-right">
                  {formatWeight(columnTotals.weight)}
                </td>
                <td className="border border-gray-300 p-2 text-right">
                  {formatCurrency(columnTotals.material)}
                </td>
                <td className="border border-gray-300 p-2 text-right">
                  {formatCurrency(columnTotals.freight)}
                </td>
                <td className="border border-gray-300 p-2 text-right">
                  {formatCurrency(columnTotals.installation)}
                </td>
                <td className="border border-gray-300 p-2 text-right">
                  {formatCurrency(columnTotals.rentals)}
                </td>
                <td className="border border-gray-300 p-2 text-right">
                  {formatCurrency(columnTotals.permits)}
                </td>
                <td className="border border-gray-300 p-2 text-right">
                  {formatCurrency(columnTotals.engCalcs)}
                </td>
                <td className="border border-gray-300 p-2 text-right">
                  {formatCurrency(columnTotals.miscellaneous)}
                </td>
                <td className="border border-gray-300 p-2 text-right bg-blue-100">
                  {formatCurrency(columnTotals.grandTotal)}
                </td>
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}
