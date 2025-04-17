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
    const total = area.totalMaterialCost;
    const totalWithMargin = calculateTotalWithMargin(
      total,
      marginTaxes.materialMargin
    );
    const totalWithSales = calculateTotalWithSales(
      totalWithMargin,
      'materialCost'
    );
    return {
      name: area.areaName,
      total,
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
                      <TableHead className="text-right">
                        Total w/ Sales Tax
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
                      <TableCell className="text-right">
                        {formatCurrency(
                          calculateTotalWithSales(
                            calculateTotalWithMargin(
                              area.totalMaterialCost,
                              marginTaxes.materialMargin
                            ),
                            'materialCost'
                          )
                        )}
                      </TableCell>
                    </TableRow>
                    {costItemsArray.map(({key, label}) => (
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
                        <TableCell className="text-right">
                          {formatCurrency(
                            calculateTotalWithSales(
                              calculateTotalWithMargin(
                                costItems[key],
                                marginTaxes[`${key}Margin` as keyof MarginTax]
                              ),
                              key
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
                      <TableCell className="text-right">
                        {formatCurrency(
                          calculateTotalWithSales(
                            totalBeforeTaxes,
                            'materialCost'
                          )
                        )}
                      </TableCell>
                    </TableRow>
                    {/* <TableRow>
                      <TableCell>Sales Tax</TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          value={costItems.salesTax || 0}
                          onChange={(e) =>
                            handleCostChange('salesTax', e.target.value)
                          }
                          onBlur={(e) => handleBlur('salesTax', e.target.value)}
                          className="w-32 ml-auto"
                          disabled={isLocked}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(
                          calculateTotalWithSales(
                            costItems.salesTax || 0,
                            'salesTax'
                          )
                        )}
                      </TableCell>
                    </TableRow> */}
                    <TableRow className="font-bold">
                      <TableCell>Grand Total</TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(areaGrandTotal.total)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(
                          calculateTotalWithSales(
                            areaGrandTotal.total,
                            'materialCost'
                          )
                        )}
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
                    <TableHead className="text-right">Total w/ Sales</TableHead>
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
                    <TableCell className="text-right">
                      {formatCurrency(
                        calculateTotalWithSales(
                          calculateTotalWithMargin(
                            calculateTotalMaterialCost(),
                            marginTaxes.materialMargin
                          ),
                          'materialCost'
                        )
                      )}
                    </TableCell>
                  </TableRow>
                  {costItemsArray.map(({key, label}) => (
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
                      <TableCell className="text-right">
                        {formatCurrency(
                          calculateTotalWithSales(
                            calculateTotalWithMargin(
                              costItems[key],
                              marginTaxes[`${key}Margin` as keyof MarginTax]
                            ),
                            key
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
                    <TableCell className="text-right">
                      {formatCurrency(
                        calculateTotalWithSales(
                          totalBeforeTaxes,
                          'materialCost'
                        )
                      )}
                    </TableCell>
                  </TableRow>
                  {/* <TableRow>
                    <TableCell>Sales Tax</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        value={costItems.salesTax || 0}
                        onChange={(e) =>
                          handleCostChange('salesTax', e.target.value)
                        }
                        onBlur={(e) => handleBlur('salesTax', e.target.value)}
                        className="w-32 ml-auto"
                        disabled={isLocked}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(
                        calculateTotalWithSales(
                          costItems.salesTax || 0,
                          'salesTax'
                        )
                      )}
                    </TableCell>
                  </TableRow> */}
                  <TableRow className="font-bold">
                    <TableCell>Grand Total</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(grandTotal)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(
                        calculateTotalWithSales(grandTotal, 'materialCost')
                      )}
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
                <TableHead className="text-right">Total w/ Sales</TableHead>
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
                <TableCell className="text-right">
                  {formatCurrency(
                    calculateTotalWithSales(
                      calculateTotalWithMargin(
                        materialCost,
                        marginTaxes.materialMargin
                      ),
                      'materialCost'
                    )
                  )}
                </TableCell>
              </TableRow>
              {costItemsArray.map(({key, label}) => (
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
                  <TableCell className="text-right">
                    {formatCurrency(
                      calculateTotalWithSales(
                        calculateTotalWithMargin(
                          costItems[key],
                          marginTaxes[`${key}Margin` as keyof MarginTax]
                        ),
                        key
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
                <TableCell className="text-right">
                  {formatCurrency(
                    calculateTotalWithSales(totalBeforeTaxes, 'materialCost')
                  )}
                </TableCell>
              </TableRow>
              {/* <TableRow>
                <TableCell>Sales Tax</TableCell>
                <TableCell></TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    value={costItems.salesTax || 0}
                    onChange={(e) =>
                      handleCostChange('salesTax', e.target.value)
                    }
                    onBlur={(e) => handleBlur('salesTax', e.target.value)}
                    className="w-32 ml-auto"
                    disabled={isLocked}
                  />
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(
                    calculateTotalWithSales(costItems.salesTax || 0, 'salesTax')
                  )}
                </TableCell>
              </TableRow> */}
              <TableRow className="font-bold">
                <TableCell>Grand Total</TableCell>
                <TableCell></TableCell>
                <TableCell className="text-right">
                  {formatCurrency(grandTotal)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(
                    calculateTotalWithSales(grandTotal, 'materialCost')
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}

        {/* Area summary table */}
        {areaMaterialcost && areaMaterialcost.length > 0 && (
          <div className="mb-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Area</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Total w/ Margin</TableHead>
                  <TableHead className="text-right">
                    Total w/ Sales Tax
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {areaSummary.map((area) => (
                  <TableRow key={area.name}>
                    <TableCell className="font-medium">{area.name}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(area.total)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(area.totalWithMargin)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(area.totalWithSales)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold">
                  <TableCell>Grand Total</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(areaGrandTotal.total)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(areaGrandTotal.totalWithMargin)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(areaGrandTotal.totalWithSales)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </Card>
  );
}
