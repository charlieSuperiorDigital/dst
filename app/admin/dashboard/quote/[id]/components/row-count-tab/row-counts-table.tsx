import { apiRequest } from "@/utils/client-side-api";
import React, { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AddRowsTab } from "./add-row";
import { SectionCreationModal } from "./section-creation-modal";
import { Button } from "@/components/ui/button";
import { RowInfoModal } from "./row-info-modal";
import { formatCurrency } from "@/utils/format-currency";
import { Scan } from "lucide-react";
import { useQuote } from "../../context/quote-context";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type Row = {
  rowName: string;
  rowId: string;
  quantity: number;
  displayName?: string;
};

type Part = {
  id: string;
  partNumber: string;
  description: string;
  unitCost: number;
};
export type PartWithRows = {
  part: Part;
  rows: Row[];
};
export type SectionArea = {
  area: {
    id: string;
    quotationId: string;
    color: string;
    name: string;
  };
  rows: string[];
};

type Props = {
  quoteId: string;
};
const RowCountTable = ({ quoteId }: Props) => {
  const { quote, isLocked } = useQuote();
  const [bayWithRows, setbayWithRows] = useState<PartWithRows[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [hideZeroQuantity, setHideZeroQuantity] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [sectionData, setSectionData] = useState<SectionArea[] | null>(null);
  const [selectionAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [totalCost, setTotalCost] = useState<number>(0);

  const getBayColor = useCallback(
    (rowId: string): string | null => {
      if (!sectionData) return null;

      for (const section of sectionData) {
        if (section.rows.includes(rowId)) {
          return section.area.color;
        }
      }

      return null;
    },
    [sectionData]
  );

  const fetchData = async () => {
    try {
      const response: PartWithRows[] = await apiRequest({
        url: `/api/count/row/${quoteId}`,
        method: "get",
      });

      const sanitizedResponse = response.map((item) => ({
        part: item.part || {
          id: "",
          partNumber: "",
          description: "",
          unitCost: 0,
        },
        rows: item.rows || [],
      }));

      setbayWithRows(sanitizedResponse);
      setLoading(false);
    } catch (err) {
      setError("Error Loading data");
      setLoading(false);
      console.error(err);
    }
  };
  const fetchSectionData = async () => {
    try {
      const areaResponse = await apiRequest({
        url: `/api/Area/${quoteId}`,
        method: "get",
      });
      console.log(areaResponse);
      setSectionData(areaResponse);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchSectionData();
  }, [quoteId]);

  const filteredBays = bayWithRows
    .flatMap((part) =>
      part.rows.map((row) => ({ rowName: row.rowName, rowId: row.rowId }))
    )
    .filter((row) => {
      if (!selectionAreaId || selectionAreaId === "clear") return true; // Si no hay filtro, incluir todas
      const section = sectionData?.find(
        (section) => section.area.id === selectionAreaId
      );
      return section?.rows.includes(row.rowId); // Incluir solo si está en la sección
    });

  const allBays = Array.from(
    new Map(
      filteredBays.map((row) => [`${row.rowName}-${row.rowId}`, row])
    ).values()
  ).sort((a, b) => {
    const isARowNumber = a.rowName.match(/Row-(\d+)/);
    const isBRowNumber = b.rowName.match(/Row-(\d+)/);

    if (!isARowNumber && !isBRowNumber) {
      return a.rowName.localeCompare(b.rowName);
    } else if (!isARowNumber) {
      return -1;
    } else if (!isBRowNumber) {
      return 1;
    } else {
      const aNumber = parseInt(isARowNumber[1], 10);
      const bNumber = parseInt(isBRowNumber[1], 10);
      return aNumber - bNumber;
    }
  });
  const filteredBayWithRows = bayWithRows.filter((partWithBays) => {
    const partNumber = partWithBays?.part?.partNumber ?? "";
    const matchesSearch = partNumber
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const hasNonZeroQuantity =
      partWithBays?.rows?.some((row) => row.quantity !== 0) ?? false;

    const matchesArea =
      selectionAreaId && selectionAreaId !== "clear"
        ? partWithBays.rows.some((row) => {
            const section = sectionData?.find(
              (section) => section.area.id === selectionAreaId
            );
            return section?.rows.includes(row.rowId);
          })
        : true;
    return hideZeroQuantity
      ? matchesSearch && hasNonZeroQuantity && matchesArea
      : matchesSearch && matchesArea;
  });

  const calculateTotalCostForAllParts = (
    parts: PartWithRows[],
    areaId: string | null
  ): number => {
    return parts.reduce((total, partWithBays) => {
      const filteredRows =
        areaId && areaId !== "clear"
          ? partWithBays.rows.filter((row) => {
              const section = sectionData?.find(
                (section) => section.area.id === areaId
              );
              return section?.rows.includes(row.rowId);
            })
          : partWithBays.rows; // Si no hay filtro, usar todas las filas

      return (
        total +
        filteredRows.reduce(
          (subtotal, row) =>
            subtotal + row.quantity * partWithBays.part.unitCost,
          0
        )
      );
    }, 0);
  };

  useEffect(() => {
    const newTotalCost = calculateTotalCostForAllParts(
      filteredBayWithRows,
      selectionAreaId
    );
    setTotalCost(newTotalCost);
  }, [filteredBayWithRows, selectionAreaId]);

  if (loading) {
    return <div>Loading ...</div>;
  }
  if (error) {
    return <div>{error}</div>;
  }

  const calculateTotalQuantity = (
    partWithBays: PartWithRows,
    areaId: string | null
  ): number => {
    const filteredRows =
      areaId && areaId !== "clear"
        ? partWithBays.rows.filter((row) => {
            const section = sectionData?.find(
              (section) => section.area.id === areaId
            );
            return section?.rows.includes(row.rowId);
          })
        : partWithBays.rows; // Si no hay filtro, usar todas las filas

    return filteredRows.reduce((total, row) => total + row.quantity, 0);
  };

  const handleAddRow = async (quantity: number) => {
    if (quantity <= 0) {
      toast({
        title: "Error",
        description: "Quantity must be greater than 0.",
        variant: "destructive",
      });
      return;
    }

    const existingRows = bayWithRows.flatMap((part) =>
      part.rows.map((row) => row.rowName)
    );
    const highestRowNumber = existingRows.reduce((max, rowName) => {
      const match = rowName.match(/Row-(\d+)/);
      if (match) {
        const rowNumber = parseInt(match[1], 10);
        return Math.max(max, rowNumber);
      }
      return max;
    }, 0);

    const newRows = Array.from({ length: quantity }, (_, index) => {
      const newRowNumber = highestRowNumber + index + 1;
      return {
        rowName: `Row-${newRowNumber}`,
        rowId: `Row-${newRowNumber}`, // You can generate a unique ID if needed
        quantity: 0, // Default quantity for new rows
      };
    });

    const updatedPartsWithBays = bayWithRows.map((part) => ({
      ...part,
      rows: [...part.rows, ...newRows],
    }));

    setbayWithRows(updatedPartsWithBays);

    try {
      const requests = newRows.map((row) =>
        apiRequest({
          url: `/api/Row/Add`,
          method: "post",
          data: {
            quotationId: quoteId,
            rowName: row.rowName,
          },
        })
      );

      await Promise.all(requests);
      toast({
        title: "Success",
        description: "Rows added successfully.",
      });
    } catch (error) {
      console.error("Error adding rows:", error);
      toast({
        title: "Error",
        description: "Failed to add rows. Please try again.",
        variant: "destructive",
      });
    }
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOnSubmit = async (sectionData1) => {
    try {
      const response = await apiRequest({
        url: `/api/Area`,
        method: "post",
        data: {
          quotationId: quote.id,
          name: sectionData1.name,
          color: sectionData1.color,
        },
      });
      const addRows = sectionData1.rows.map((row) => {
        return apiRequest({
          url: `/api/area/row/${response}/${row.rowId}`,
          method: "post",
        });
      });
      await Promise.all(addRows);
      setSectionData((prevSectionData) => [
        ...(prevSectionData || []),
        {
          area: {
            id: response,
            quotationId: quote.id.toString(), // Ensure quotationId is a string
            color: sectionData1.color,
            name: sectionData1.name,
          },
          rows: sectionData1.rows.map((row) => row.rowId),
        },
      ]);
      toast({
        title: "Success",
        description: "Section added successfully.",
      });
    } catch (e) {
      console.log(e);
      toast({
        title: "Error",
        description: "Failed to add section. Please try again.",
        variant: "destructive",
      });
    }
  };
  const handleOnEdit = async (value) => {
    const findSection = sectionData?.find(
      (section) => section.area.id === value.id
    );
    if (
      findSection?.area.color !== value.color ||
      findSection?.area.name !== value.name
    ) {
      try {
        await apiRequest({
          url: `/api/Area/`,
          method: "put",
          data: {
            areaId: value.id,
            color: value.color,
            name: value.name,
          },
        });

        toast({
          title: "Success",
          description: "Section updated successfully.",
        });
        if (sectionData) {
          setSectionData(
            sectionData.map((section) => {
              if (section.area.id === value.id) {
                return {
                  ...section,
                  area: {
                    ...section.area,
                    color: value.color,
                    name: value.name,
                  },
                };
              }
              return section;
            })
          );
        }
      } catch (e) {
        console.log(e);
        toast({
          title: "Error",
          description: "Failed to update section. Please try again.",
          variant: "destructive",
        });
      }
    }

    const findRows = findSection?.rows || [];
    const rowsToAdd = value.rows.filter((row) => !findRows.includes(row.rowId));

    const rowsToRemove = findRows.filter(
      (row) => !value.rows.map((r) => r.rowId).includes(row)
    );

    if (rowsToAdd.length > 0) {
      try {
        const addRows = rowsToAdd.map((row) => {
          return apiRequest({
            url: `/api/area/row/${value.id}/${row.rowId}`,
            method: "post",
          });
        });
        await Promise.all(addRows);

        if (sectionData) {
          setSectionData(
            sectionData.map((section) => {
              if (section.area.id === value.id) {
                return {
                  ...section,
                  rows: [...section.rows, ...rowsToAdd.map((row) => row.rowId)],
                };
              }
              return section;
            })
          );
        }
        toast({
          title: "Success",
          description: "Rows added successfully.",
        });
      } catch (e) {
        console.log(e);
        toast({
          title: "Error",
          description: "Failed to add rows. Please try again.",
          variant: "destructive",
        });
      }
    }
    if (rowsToRemove.length > 0) {
      try {
        const removeRows = rowsToRemove.map((row) => {
          return apiRequest({
            url: `/api/area/row/${value.id}/${row}`,
            method: "delete",
          });
        });
        await Promise.all(removeRows);
        if (sectionData) {
          setSectionData(
            sectionData.map((section) => {
              if (section.area.id === value.id) {
                return {
                  ...section,
                  rows: section.rows.filter(
                    (row) => !rowsToRemove.includes(row)
                  ),
                };
              }
              return section;
            })
          );
        }
        toast({
          title: "Success",
          description: "Rows removed successfully.",
        });
      } catch (e) {
        console.log(e);
        toast({
          title: "Error",
          description: "Failed to remove rows. Please try again.",
          variant: "destructive",
        });
      }
    }
  };
  const handleRemoveArea = async (areaId) => {
    try {
      await apiRequest({
        url: `/api/Area?AreaId=${areaId}`,
        method: "delete",
      });
      if (sectionData) {
        setSectionData(
          sectionData.filter((section) => section.area.id !== areaId)
        );
      }
    } catch (e) {
      console.log(e);
    }
  };
  const handleHeaderClick = (row) => {
    setSelectedRow(row);
  };

  return (
    <div className="mt-6">
      <SectionCreationModal
        allRows={allBays}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleOnSubmit}
        onEdit={handleOnEdit}
        onRemove={handleRemoveArea}
        existingSections={sectionData || []}
      />
      <div className="flex justify-between mb-4">
        <div className=" flex items-center space-x-4">
          <div>
            <Input
              type="text"
              placeholder="Search by Part Number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="hide-zero"
              checked={hideZeroQuantity}
              onCheckedChange={setHideZeroQuantity}
            />
            <Label htmlFor="hide-zero">Hide zero quantity</Label>
          </div>
          {!isLocked && <AddRowsTab onAdd={handleAddRow} />}
          <div className="flex items-center space-x-2">
            <span className="font-bold">Total Cost:</span>
            <span className="text-blue-600 font-semibold">
              {formatCurrency(totalCost)}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-44">
            <Select
              onValueChange={(value) =>
                setSelectedAreaId(value === "clear" ? null : value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select section to edit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clear">Clear Filter</SelectItem>
                {sectionData?.map((section) => (
                  <SelectItem key={section.area.id} value={section.area.id}>
                    {section.area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {!isLocked && (
            <Button onClick={() => setIsModalOpen(true)}>
              <Scan />
            </Button>
          )}
        </div>
      </div>

      <div className="table-component overflow-auto max-w-full max-h-full outline-none relative">
        <table className="border-collapse border border-gray-300 bg-white min-w-full user-select-none">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2 font-bold text-left w-[350px] sticky left-0 bg-white z-20">
                Part Number / Description
              </th>
              {allBays.map((bayName, colIndex) => {
                const areaName =
                  sectionData?.find((section) =>
                    section.rows.includes(bayName.rowId)
                  )?.area.name || "No Area";
                return (
                  <th
                    key={colIndex + bayName.rowId}
                    className={`border border-gray-300 p-2 font-bold text-center cursor-pointer`}
                    style={{
                      minWidth: "100px",
                      backgroundColor:
                        getBayColor(bayName.rowId) || "transparent",
                    }}
                    onDoubleClick={() => handleHeaderClick(bayName)}
                    title={`Area: ${areaName}`}
                  >
                    {bayName.rowName}
                  </th>
                );
              })}
              <th className="border border-gray-300 p-2 font-bold text-center sticky right-0 bg-white z-20">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {allBays.length === 0 ? (
              <tr>
                <td colSpan={2} className="text-center p-4 text-gray-500">
                  No rows exist or no part added to any row.
                </td>
              </tr>
            ) : (
              filteredBayWithRows.map((partWithBays, rowIndex) => {
                const totalQuantity = calculateTotalQuantity(
                  partWithBays,
                  selectionAreaId
                );
                return (
                  <tr key={`${partWithBays.part.id}-${rowIndex}`}>
                    <td
                      className={`border w-[350px] border-gray-300 p-2 text-left sticky left-0 bg-white z-10 flex items-center`}
                      style={{
                        height: "60px",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                      }}
                      title={`${partWithBays.part.description}`}
                    >
                      <span className="font-bold text-blue-600 text-lg">
                        {partWithBays.part.partNumber}-
                      </span>
                      <span>{partWithBays.part.description}</span>
                    </td>
                    {allBays.map((bayName, colIndex) => {
                      const bay = partWithBays.rows.find(
                        (b) => b.rowName === bayName.rowName
                      );
                      const quantity = bay ? bay.quantity : 0;

                      return (
                        <td
                          key={`${partWithBays.part.id}-${bayName.rowId}-${colIndex}`}
                          className="border border-gray-300 p-2 text-center"
                          style={{ minWidth: "100px" }}
                        >
                          <div
                            className="cell-content p-2 whitespace-nowrap overflow-hidden text-ellipsis"
                            title={quantity.toString()}
                          >
                            {quantity}
                          </div>
                        </td>
                      );
                    })}
                    <td className="border border-gray-300 p-2 text-center sticky right-0 bg-white z-10">
                      {totalQuantity}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <RowInfoModal
        isOpen={!!selectedRow}
        onClose={() => setSelectedRow(null)}
        row={selectedRow}
        setbayWithRows={setbayWithRows}
      />
    </div>
  );
};

export default RowCountTable;
