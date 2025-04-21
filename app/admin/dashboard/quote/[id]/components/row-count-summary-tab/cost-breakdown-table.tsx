'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {Input} from '@/components/ui/input';
import {Card} from '@/components/ui/card';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {useQuote} from '../../context/quote-context';
import {useState, useEffect, useCallback} from 'react';
import {toast} from '@/hooks/use-toast';
import {apiRequest} from '@/utils/client-side-api';
import {formatCurrency} from '@/utils/format-currency';

export interface CostItem {
  freight?: number;
  installation?: number;
  rentals?: number;
  permits?: number;
  engCals?: number;
  salesTax?: number;
  miscellaneous?: number;
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
  salesTaxes: {
    freightSalesTax: boolean;
    installationSalesTax: boolean;
    rentalsSalesTax: boolean;
    permitsSalesTax: boolean;
    engCalsSalesTax: boolean;
    materialSalesTax: boolean;
    freightSalesTaxRate: number;
    installationSalesTaxRate: number;
    rentalsSalesTaxRate: number;
    permitsSalesTaxRate: number;
    engCalsSalesTaxRate: number;
    materialSalesTaxRate: number;
  };
};

export default function CostBreakdownTable({
  marginTaxes,
  costItems,
  setCostItems,
  materialCost,
  salesTaxes,
}: Props) {
  const {isLocked, quoteContext, setQuoteContext, areaMaterialcost} =
    useQuote();
  const [totalBeforeTaxes, setTotalBeforeTaxes] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const [currentMaterialCost, setCurrentMaterialCost] = useState(materialCost);

  const TOTAL_TAB_ID = 'total';

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
    const newCostItems = {...costItems, [key]: Number(value) || 0};
    setCostItems(newCostItems);
  };

  const calculateTotalWithMargin = useCallback(
    (cost: number | undefined, margin: number | undefined): number => {
      if (cost === undefined || margin === undefined) return 0;
      return cost + cost * (margin / 100);
    },
    []
  );

  // Helper to get sales tax toggle and rate for a given key
  const getSalesTaxToggleAndRate = (key: keyof CostItem | 'materialCost') => {
    switch (key) {
      case 'freight':
        return {
          toggle: salesTaxes.freightSalesTax,
          rate: salesTaxes.freightSalesTaxRate,
        };
      case 'installation':
        return {
          toggle: salesTaxes.installationSalesTax,
          rate: salesTaxes.installationSalesTaxRate,
        };
      case 'rentals':
        return {
          toggle: salesTaxes.rentalsSalesTax,
          rate: salesTaxes.rentalsSalesTaxRate,
        };
      case 'permits':
        return {
          toggle: salesTaxes.permitsSalesTax,
          rate: salesTaxes.permitsSalesTaxRate,
        };
      case 'engCals':
        return {
          toggle: salesTaxes.engCalsSalesTax,
          rate: salesTaxes.engCalsSalesTaxRate,
        };
      case 'materialCost':
        return {
          toggle: salesTaxes.materialSalesTax,
          rate: salesTaxes.materialSalesTaxRate,
        };
      default:
        return {toggle: false, rate: 0};
    }
  };

  // Helper to calculate total with sales tax
  const calculateTotalWithSales = (
    totalWithMargin: number,
    key: keyof CostItem | 'materialCost'
  ) => {
    const {toggle, rate} = getSalesTaxToggleAndRate(key);
    if (toggle) {
      return totalWithMargin + totalWithMargin * (rate / 100);
    }
    return totalWithMargin;
  };

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

  const costItemsArray: {key: keyof CostItem; label: string}[] = [
    {key: 'freight', label: 'Freight'},
    {key: 'installation', label: 'Installation'},
    {key: 'rentals', label: 'Rentals'},
    {key: 'permits', label: 'Permits'},
    {key: 'engCals', label: 'Engineering Calculations'},
  ];

  const handleBlur = async (field: keyof CostItem, value: string) => {
    const updatedValue = Number.parseFloat(value) || 0;
    const updatedCostItems = {...costItems, [field]: updatedValue};

    try {
      const response = await apiRequest({
        method: 'put',
        url: `/api/Quotation`,
        data: {
          ...quoteContext,
          [field]: updatedValue,
        },
      });

      toast({
        title: 'Success',
        description: 'Cost item updated successfully',
      });

      setQuoteContext(response);
      setCostItems(updatedCostItems);
    } catch (e) {
      console.error(e);
      toast({
        title: 'Error',
        description: 'Error updating cost item',
        variant: 'destructive',
      });
    }
  };

  // --- Area summary table logic ---
  const areaSummary = (areaMaterialcost || []).map((area) => {
    const areaCosts = costItems[area.areaId] || {};
    const material = area.totalMaterialCost;
    const freight = areaCosts.freight ?? 0;
    const installation = areaCosts.installation ?? 0;
    const rentals = areaCosts.rentals ?? 0;
    const permits = areaCosts.permits ?? 0;
    const engCals = areaCosts.engCals ?? 0;
    const totalWithMargin =
      calculateTotalWithMargin(material, marginTaxes.materialMargin) +
      calculateTotalWithMargin(freight, marginTaxes.freightMargin) +
      calculateTotalWithMargin(installation, marginTaxes.installationMargin) +
      calculateTotalWithMargin(rentals, marginTaxes.rentalsMargin) +
      calculateTotalWithMargin(permits, marginTaxes.permitsMargin) +
      calculateTotalWithMargin(engCals, marginTaxes.engCalsMargin);
    const totalWithSales = calculateTotalWithSales(
      totalWithMargin,
      'materialCost'
    );
    return {
      name: area.areaName,
      total: material,
      totalWithMargin,
      totalWithSales,
    };
  });
  const areaGrandTotal = areaSummary.reduce(
    (acc, area) => {
      acc.total += area.total;
      acc.totalWithMargin += area.totalWithMargin;
      acc.totalWithSales += area.totalWithSales;
      return acc;
    },
    {total: 0, totalWithMargin: 0, totalWithSales: 0}
  );

  return (
    <Card className="w-full">
      <div className="p-6">
        {areaMaterialcost && areaMaterialcost.length > 0 ? (
          <div className="table-component overflow-auto max-w-full max-h-full outline-none relative">
            <Table className="border-collapse border border-gray-300 bg-white min-w-full user-select-none">
              <TableHeader>
                <TableRow>
                  <TableHead className="border border-gray-300 p-2 font-bold text-left bg-white z-20">
                    Area
                  </TableHead>
                  <TableHead className="border border-gray-300 p-2 font-bold text-center">
                    Material
                  </TableHead>
                  <TableHead className="border border-gray-300 p-2 font-bold text-center">
                    Freight
                  </TableHead>
                  <TableHead className="border border-gray-300 p-2 font-bold text-center">
                    Installation
                  </TableHead>
                  <TableHead className="border border-gray-300 p-2 font-bold text-center">
                    Rentals
                  </TableHead>
                  <TableHead className="border border-gray-300 p-2 font-bold text-center">
                    Permits
                  </TableHead>
                  <TableHead className="border border-gray-300 p-2 font-bold text-center">
                    Engineering
                  </TableHead>
                  <TableHead className="border border-gray-300 p-2 font-bold text-center">
                    Total w/ Margin
                  </TableHead>
                  <TableHead className="border border-gray-300 p-2 font-bold text-center">
                    Total w/ Sales Tax
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {areaMaterialcost.map((area, idx) => {
                  // For each area, allow editing of cost items
                  const areaCosts = costItems[area.areaId] || {};
                  const handleAreaCostChange = (
                    key: keyof CostItem,
                    value: string
                  ) => {
                    const newAreaCosts = {
                      ...areaCosts,
                      [key]: Number(value) || 0,
                    };
                    setCostItems({...costItems, [area.areaId]: newAreaCosts});
                  };
                  // Calculate totals for this area
                  const material = area.totalMaterialCost;
                  const freight = areaCosts.freight ?? 0;
                  const installation = areaCosts.installation ?? 0;
                  const rentals = areaCosts.rentals ?? 0;
                  const permits = areaCosts.permits ?? 0;
                  const engCals = areaCosts.engCals ?? 0;
                  const totalWithMargin =
                    calculateTotalWithMargin(
                      material,
                      marginTaxes.materialMargin
                    ) +
                    calculateTotalWithMargin(
                      freight,
                      marginTaxes.freightMargin
                    ) +
                    calculateTotalWithMargin(
                      installation,
                      marginTaxes.installationMargin
                    ) +
                    calculateTotalWithMargin(
                      rentals,
                      marginTaxes.rentalsMargin
                    ) +
                    calculateTotalWithMargin(
                      permits,
                      marginTaxes.permitsMargin
                    ) +
                    calculateTotalWithMargin(
                      engCals,
                      marginTaxes.engCalsMargin
                    );
                  // For sales tax, use the same logic as before
                  const totalWithSalesTax = calculateTotalWithSales(
                    totalWithMargin,
                    'materialCost'
                  );
                  return (
                    <TableRow key={area.areaId}>
                      <TableCell className="border border-gray-300 p-2 text-left">
                        {area.areaName}
                      </TableCell>
                      <TableCell className="border border-gray-300 p-2 text-center">
                        {formatCurrency(material)}
                      </TableCell>
                      <TableCell className="border border-gray-300 p-2 text-center">
                        <Input
                          type="number"
                          value={freight}
                          onChange={(e) =>
                            handleAreaCostChange('freight', e.target.value)
                          }
                          className="w-24 mx-auto"
                          disabled={isLocked}
                        />
                      </TableCell>
                      <TableCell className="border border-gray-300 p-2 text-center">
                        <Input
                          type="number"
                          value={installation}
                          onChange={(e) =>
                            handleAreaCostChange('installation', e.target.value)
                          }
                          className="w-24 mx-auto"
                          disabled={isLocked}
                        />
                      </TableCell>
                      <TableCell className="border border-gray-300 p-2 text-center">
                        <Input
                          type="number"
                          value={rentals}
                          onChange={(e) =>
                            handleAreaCostChange('rentals', e.target.value)
                          }
                          className="w-24 mx-auto"
                          disabled={isLocked}
                        />
                      </TableCell>
                      <TableCell className="border border-gray-300 p-2 text-center">
                        <Input
                          type="number"
                          value={permits}
                          onChange={(e) =>
                            handleAreaCostChange('permits', e.target.value)
                          }
                          className="w-24 mx-auto"
                          disabled={isLocked}
                        />
                      </TableCell>
                      <TableCell className="border border-gray-300 p-2 text-center">
                        <Input
                          type="number"
                          value={engCals}
                          onChange={(e) =>
                            handleAreaCostChange('engCals', e.target.value)
                          }
                          className="w-24 mx-auto"
                          disabled={isLocked}
                        />
                      </TableCell>
                      <TableCell className="border border-gray-300 p-2 text-center font-bold">
                        {formatCurrency(totalWithMargin)}
                      </TableCell>
                      <TableCell className="border border-gray-300 p-2 text-center font-bold">
                        {formatCurrency(totalWithSalesTax)}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {/* Grand Total Row */}
                <TableRow className="font-bold bg-blue-50">
                  <TableCell className="border border-gray-300 p-2 text-center">
                    Total
                  </TableCell>
                  {/* Sum each column for all areas */}
                  <TableCell className="border border-gray-300 p-2 text-center">
                    {formatCurrency(
                      areaMaterialcost.reduce(
                        (sum, area) => sum + area.totalMaterialCost,
                        0
                      )
                    )}
                  </TableCell>
                  {/* Repeat for each cost item */}
                  <TableCell className="border border-gray-300 p-2 text-center">
                    {formatCurrency(
                      areaMaterialcost.reduce(
                        (sum, area, idx) =>
                          sum + (costItems[area.areaId]?.freight ?? 0),
                        0
                      )
                    )}
                  </TableCell>
                  <TableCell className="border border-gray-300 p-2 text-center">
                    {formatCurrency(
                      areaMaterialcost.reduce(
                        (sum, area, idx) =>
                          sum + (costItems[area.areaId]?.installation ?? 0),
                        0
                      )
                    )}
                  </TableCell>
                  <TableCell className="border border-gray-300 p-2 text-center">
                    {formatCurrency(
                      areaMaterialcost.reduce(
                        (sum, area, idx) =>
                          sum + (costItems[area.areaId]?.rentals ?? 0),
                        0
                      )
                    )}
                  </TableCell>
                  <TableCell className="border border-gray-300 p-2 text-center">
                    {formatCurrency(
                      areaMaterialcost.reduce(
                        (sum, area, idx) =>
                          sum + (costItems[area.areaId]?.permits ?? 0),
                        0
                      )
                    )}
                  </TableCell>
                  <TableCell className="border border-gray-300 p-2 text-center">
                    {formatCurrency(
                      areaMaterialcost.reduce(
                        (sum, area, idx) =>
                          sum + (costItems[area.areaId]?.engCals ?? 0),
                        0
                      )
                    )}
                  </TableCell>
                  <TableCell className="border border-gray-300 p-2 text-center font-bold">
                    {/* Sum of all totalWithMargin */}
                    {formatCurrency(
                      areaMaterialcost.reduce((sum, area, idx) => {
                        const areaCosts = costItems[area.areaId] || {};
                        const material = area.totalMaterialCost;
                        const freight = areaCosts.freight ?? 0;
                        const installation = areaCosts.installation ?? 0;
                        const rentals = areaCosts.rentals ?? 0;
                        const permits = areaCosts.permits ?? 0;
                        const engCals = areaCosts.engCals ?? 0;
                        return (
                          sum +
                          calculateTotalWithMargin(
                            material,
                            marginTaxes.materialMargin
                          ) +
                          calculateTotalWithMargin(
                            freight,
                            marginTaxes.freightMargin
                          ) +
                          calculateTotalWithMargin(
                            installation,
                            marginTaxes.installationMargin
                          ) +
                          calculateTotalWithMargin(
                            rentals,
                            marginTaxes.rentalsMargin
                          ) +
                          calculateTotalWithMargin(
                            permits,
                            marginTaxes.permitsMargin
                          ) +
                          calculateTotalWithMargin(
                            engCals,
                            marginTaxes.engCalsMargin
                          )
                        );
                      }, 0)
                    )}
                  </TableCell>
                  <TableCell className="border border-gray-300 p-2 text-center font-bold">
                    {/* Sum of all totalWithSalesTax */}
                    {formatCurrency(
                      areaMaterialcost.reduce((sum, area, idx) => {
                        const areaCosts = costItems[area.areaId] || {};
                        const material = area.totalMaterialCost;
                        const freight = areaCosts.freight ?? 0;
                        const installation = areaCosts.installation ?? 0;
                        const rentals = areaCosts.rentals ?? 0;
                        const permits = areaCosts.permits ?? 0;
                        const engCals = areaCosts.engCals ?? 0;
                        const totalWithMargin =
                          calculateTotalWithMargin(
                            material,
                            marginTaxes.materialMargin
                          ) +
                          calculateTotalWithMargin(
                            freight,
                            marginTaxes.freightMargin
                          ) +
                          calculateTotalWithMargin(
                            installation,
                            marginTaxes.installationMargin
                          ) +
                          calculateTotalWithMargin(
                            rentals,
                            marginTaxes.rentalsMargin
                          ) +
                          calculateTotalWithMargin(
                            permits,
                            marginTaxes.permitsMargin
                          ) +
                          calculateTotalWithMargin(
                            engCals,
                            marginTaxes.engCalsMargin
                          );
                        return (
                          sum +
                          calculateTotalWithSales(
                            totalWithMargin,
                            'materialCost'
                          )
                        );
                      }, 0)
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        ) : (
          <div>No area data available</div>
        )}
      </div>
    </Card>
  );
}
