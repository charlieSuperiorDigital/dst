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
import { Scan, Trash2 } from "lucide-react";
import { useQuote } from "../../context/quote-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [forceDelete, setForceDelete] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    rowId: string;
    rowName: string;
  }>({
    isOpen: false,
    rowId: "",
    rowName: "",
  });

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
      if (!selectionAreaId || selectionAreaId === "clear") return true;
      const section = sectionData?.find(
        (section) => section.area.id === selectionAreaId
      );
      return section?.rows.includes(row.rowId);
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

      fetchData();
      fetchSectionData();
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

    if (!findSection) return;

    const currentRowIds = findSection.rows || [];
    const newRowIds = value.rows.map((row) => row.rowId);

    const rowsToAdd = newRowIds.filter((id) => !currentRowIds.includes(id));
    // const rowsToRemove = currentRowIds.filter((id) => !newRowIds.includes(id));

    if (
      findSection.area.color !== value.color ||
      findSection.area.name !== value.name
    ) {
      try {
        console.log("aca");
        await apiRequest({
          url: `/api/Area/`,
          method: "put",
          data: {
            areaId: value.id,
            color: value.color,
            name: value.name,
          },
        });

        setSectionData((prev) => {
          if (!prev) return null;
          return prev.map((section) => {
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
          });
        });
      } catch (e) {
        console.log(e);
        toast({
          title: "Error",
          description: "Failed to update section. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }

    if (rowsToAdd.length > 0) {
      try {
        const addPromises = rowsToAdd.map((rowId) =>
          apiRequest({
            url: `/api/area/row/${value.id}/${rowId}`,
            method: "post",
          })
        );
        await Promise.all(addPromises);

        setSectionData((prev) => {
          if (!prev) return null;
          return prev.map((section) => {
            if (section.area.id === value.id) {
              return {
                ...section,
                rows: [...section.rows, ...rowsToAdd],
              };
            }
            return section;
          });
        });
      } catch (e) {
        console.log(e);
        toast({
          title: "Error",
          description: "Failed to add rows. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }

    if (value.removedRows?.length > 0) {
      try {
        const removePromises = value.removedRows.map((rowId) =>
          apiRequest({
            url: `/api/area/row/${value.id}/${rowId}`,
            method: "delete",
          })
        );
        await Promise.all(removePromises);

        setSectionData((prev) => {
          if (!prev) return null;
          return prev.map((section) => {
            if (section.area.id === value.id) {
              return {
                ...section,
                rows: section.rows.filter(
                  (rowId) => !value.removedRows.includes(rowId)
                ),
              };
            }
            return section;
          });
        });
      } catch (e) {
        console.log(e);
        toast({
          title: "Error",
          description: "Failed to remove rows. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }

    toast({
      title: "Success",
      description: "Section updated successfully.",
    });
  };
  const handleRemoveArea = async (areaId) => {
    console.log("remove");
    try {
      await apiRequest({
        url: `/api/Area?AreaId=${areaId}`,
        method: "delete",
      });
      fetchData();
      fetchSectionData();
      toast({
        title: "Success",
        description: "Section removed successfully.",
      });
    } catch (e) {
      console.log(e);
      toast({
        title: "Error",
        description: "Failed to remove section. Please try again.",
        variant: "destructive",
      });
    }
  };
  const handleHeaderClick = (row) => {
    setSelectedRow(row);
  };

  const handleDeleteRow = async (rowId: string) => {
    try {
      await apiRequest({
        url: `/api/row/del/${rowId}`,
        method: "delete",
      });

      setbayWithRows((prev) =>
        prev.map((part) => {
          const updatedPart = { ...part };
          updatedPart.rows = part.rows.filter((r) => r.rowId !== rowId);
          return updatedPart;
        })
      );

      toast({
        title: "Success",
        description: "Row Deleted",
      });
      setDeleteConfirmation({ isOpen: false, rowId: "", rowName: "" });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };
  const handleAddRowAtEnd = async (quantity: number) => {
    // Mantén tu función original para agregar al final
    if (quantity <= 0) return;

    const existingRows = bayWithRows.flatMap((part) => part.rows);
    const highestRowNumber = getHighestRowNumber(existingRows);

    const newRows = Array.from({ length: quantity }, (_, index) => ({
      rowName: `Row-${highestRowNumber + index + 1}`,
      rowId: `Row-${highestRowNumber + index + 1}`,
      quantity: 0,
    }));

    await createNewRows(newRows);
  };

  const handleInsertRowBetween = async (position: number) => {
    try {
      const existingRows = bayWithRows.flatMap((part) => part.rows);
      if (position < 0 || position >= existingRows.length) {
        throw new Error("Invalid position");
      }

      const currentRow = existingRows[position];
      const nextRow = existingRows[position + 1];

      const currentNumber = extractRowNumber(currentRow.rowName);
      const nextNumber = nextRow
        ? extractRowNumber(nextRow.rowName)
        : currentNumber + 2;

      let newRowNumber: number;

      if (nextNumber - currentNumber > 1) {
        newRowNumber = Math.floor((currentNumber + nextNumber) / 2);
        // Si el número resultante es igual al actual, sumamos 1
        if (newRowNumber === currentNumber) newRowNumber++;
      } else {
        newRowNumber = currentNumber + 1;
        await renumberFollowingRows(position + 1, newRowNumber + 1);
      }

      const newRow = {
        rowName: `Row-${newRowNumber}`,
        rowId: `Row-${newRowNumber}`,
        quantity: 0,
      };

      // Crear la nueva fila
      await apiRequest({
        url: `/api/Row/Add`,
        method: "post",
        data: {
          quotationId: quoteId,
          rowName: newRow.rowName,
        },
      });

      // Actualizar estado local
      setbayWithRows((prev) =>
        prev.map((part) => ({
          ...part,
          rows: [
            ...part.rows.slice(0, position + 1),
            newRow,
            ...part.rows.slice(position + 1),
          ],
        }))
      );

      toast({
        title: "Success",
        description: `Row ${newRow.rowName} inserted successfully`,
      });

      // Recargar para sincronizar
      window.location.reload();
    } catch (error) {
      console.error("Error inserting row:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to insert row",
        variant: "destructive",
      });
    }
  };

  // Funciones auxiliares
  const getHighestRowNumber = (rows: Row[]): number => {
    return rows.reduce((max, row) => {
      const match = row.rowName.match(/Row-(\d+)/);
      return match ? Math.max(max, parseInt(match[1], 10)) : max;
    }, 0);
  };

  const createNewRows = async (newRows: Row[], insertAfter?: number) => {
    try {
      // Actualizar estado local
      setbayWithRows((prev) =>
        prev.map((part) => ({
          ...part,
          rows:
            insertAfter !== undefined
              ? [
                  ...part.rows.slice(0, insertAfter + 1),
                  ...newRows,
                  ...part.rows.slice(insertAfter + 1),
                ]
              : [...part.rows, ...newRows],
        }))
      );

      // Crear filas en la API
      await Promise.all(
        newRows.map((row) =>
          apiRequest({
            url: `/api/Row/Add`,
            method: "post",
            data: {
              quotationId: quoteId,
              rowName: row.rowName,
            },
          })
        )
      );

      toast({
        title: "Success",
        description: `Row${newRows.length > 1 ? "s" : ""} added successfully`,
      });

      // Recargar para sincronizar cambios
      window.location.reload();
    } catch (error) {
      console.error("Error creating rows:", error);
      toast({
        title: "Error",
        description: "Failed to add rows",
        variant: "destructive",
      });
    }
  };

  const renumberFollowingRows = async (
    startIndex: number,
    newStartNumber: number
  ) => {
    const allRows = bayWithRows.flatMap((part) => part.rows);
    const rowsToRenumber = allRows.slice(startIndex);

    // Renumerar en el estado local primero
    const updatedRows = rowsToRenumber.map((row, index) => ({
      ...row,
      rowName: `Row-${newStartNumber + index}`,
      rowId: row.rowId, // Mantenemos el mismo ID, solo cambiamos el nombre
    }));

    // Actualizar estado local
    setbayWithRows((prev) =>
      prev.map((part) => ({
        ...part,
        rows: part.rows.map((row) => {
          const index = allRows.findIndex((r) => r.rowId === row.rowId);
          return index >= startIndex ? updatedRows[index - startIndex] : row;
        }),
      }))
    );

    // Actualizar en la API usando el endpoint correcto
    try {
      await Promise.all(
        rowsToRenumber.map((row, index) => {
          const newName = `Row-${newStartNumber + index}`;
          return apiRequest({
            url: `/api/Row/Update/${row.rowId}/${newName}`,
            method: "put",
          });
        })
      );
      toast({
        title: "Success",
        description: "Rows renumbered successfully",
      });

      window.location.reload();
    } catch (error) {
      console.error("Error renumbering rows:", error);
      // Revertir cambios locales si falla la API
      setbayWithRows((prev) => prev);
      throw error;
    }
  };
  const extractRowNumber = (rowName: string): number => {
    const match = rowName.match(/Row-(\d+)/);
    if (!match) {
      // Manejar casos donde el formato no es "Row-XX"
      const alternativeMatch = rowName.match(/\d+/);
      return alternativeMatch ? parseInt(alternativeMatch[0], 10) : 0;
    }
    return parseInt(match[1], 10);
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
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="force-delete"
                      checked={forceDelete}
                      onCheckedChange={setForceDelete}
                    />
                    <Label htmlFor="force-delete">Force delete</Label>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    When this field is checked the delete confirmation is not
                    going show, the deletion is going to happen immediately
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
              <th className="border border-gray-300 p-2 font-bold text-center sticky left-[350px] bg-white z-20">
                Total
              </th>
              {allBays.map((bayName, colIndex) => {
                const areaName =
                  sectionData?.find((section) =>
                    section.rows.includes(bayName.rowId)
                  )?.area.name || "No Area";
                return (
                  <th
                    key={colIndex + bayName.rowId}
                    className="border border-gray-300 p-2 font-bold text-center cursor-pointer"
                    style={{
                      minWidth: "100px",
                      backgroundColor:
                        getBayColor(bayName.rowId) || "transparent",
                    }}
                    onDoubleClick={() => handleHeaderClick(bayName)}
                    title={`Area: ${areaName}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex-1">{bayName.rowName}</span>
                      {!isLocked && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (forceDelete) {
                              handleDeleteRow(bayName.rowId);
                            } else {
                              setDeleteConfirmation({
                                isOpen: true,
                                rowId: bayName.rowId,
                                rowName: bayName.rowName,
                              });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </th>
                );
              })}
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
                    <td className="border border-gray-300 p-2 text-center sticky left-[350px] bg-white z-10">
                      {totalQuantity}
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
      <Dialog
        open={deleteConfirmation.isOpen}
        onOpenChange={(open) =>
          setDeleteConfirmation({ isOpen: open, rowId: "", rowName: "" })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Row</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete row {deleteConfirmation.rowName}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setDeleteConfirmation({ isOpen: false, rowId: "", rowName: "" })
              }
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeleteRow(deleteConfirmation.rowId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RowCountTable;
