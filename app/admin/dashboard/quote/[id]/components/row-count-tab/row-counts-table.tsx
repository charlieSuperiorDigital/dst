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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
  const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>([]);
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
      if (selectedAreaIds.length === 0) return true;
      return selectedAreaIds.some((areaId) => {
        const section = sectionData?.find((s) => s.area.id === areaId);
        return section?.rows.includes(row.rowId);
      });
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
      selectedAreaIds.length > 0
        ? partWithBays.rows.some((row) => {
            return selectedAreaIds.some((areaId) => {
              const section = sectionData?.find((s) => s.area.id === areaId);
              return section?.rows.includes(row.rowId);
            });
          })
        : true;

    return hideZeroQuantity
      ? matchesSearch && hasNonZeroQuantity && matchesArea
      : matchesSearch && matchesArea;
  });

  const calculateTotalCostForAllParts = (
    parts: PartWithRows[],
    areaIds: string[]
  ): number => {
    return parts.reduce((total, partWithBays) => {
      const filteredRows =
        areaIds.length > 0
          ? partWithBays.rows.filter((row) => {
              return areaIds.some((areaId) => {
                const section = sectionData?.find((s) => s.area.id === areaId);
                return section?.rows.includes(row.rowId);
              });
            })
          : partWithBays.rows;

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
      selectedAreaIds
    );
    setTotalCost(newTotalCost);
  }, [filteredBayWithRows, selectedAreaIds]);

  if (loading) {
    return <div>Loading ...</div>;
  }
  if (error) {
    return <div>{error}</div>;
  }

  const calculateTotalQuantity = (
    partWithBays: PartWithRows,
    areaIds: string[]
  ): number => {
    const filteredRows =
      areaIds.length > 0
        ? partWithBays.rows.filter((row) => {
            return areaIds.some((areaId) => {
              const section = sectionData?.find((s) => s.area.id === areaId);
              return section?.rows.includes(row.rowId);
            });
          })
        : partWithBays.rows;

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
        rowId: `Row-${newRowNumber}`,
        quantity: 0,
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
            quotationId: quote.id.toString(),
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

    if (
      findSection.area.color !== value.color ||
      findSection.area.name !== value.name
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
    try {
      await apiRequest({
        url: `/api/Area?AreaId=${areaId}`,
        method: "delete",
      });
      setSelectedAreaIds((prev) => prev.filter((id) => id !== areaId));
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
        <div className="flex items-center space-x-4">
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
          <div className="w-64">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  {selectedAreaIds.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {selectedAreaIds.map((id) => {
                        const section = sectionData?.find(
                          (s) => s.area.id === id
                        );
                        return section ? (
                          <Badge
                            key={id}
                            className="inline-flex items-center px-2 py-1 rounded text-xs"
                            style={{
                              backgroundColor: `${section.area.color}20`,
                              border: `1px solid ${section.area.color}`,
                              color: "inherit",
                            }}
                          >
                            {section.area.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    "Filter by section..."
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2">
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setSelectedAreaIds([])}
                  >
                    Clear all
                  </Button>
                  {sectionData?.map((section) => (
                    <div
                      key={section.area.id}
                      className="flex items-center space-x-2 p-2 hover:bg-accent rounded cursor-pointer"
                      onClick={() => {
                        setSelectedAreaIds((prev) =>
                          prev.includes(section.area.id)
                            ? prev.filter((id) => id !== section.area.id)
                            : [...prev, section.area.id]
                        );
                      }}
                    >
                      <Checkbox
                        checked={selectedAreaIds.includes(section.area.id)}
                        onCheckedChange={() => {}} // Handled by parent div click
                      />
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: section.area.color }}
                      />
                      <Label>{section.area.name}</Label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
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
                  selectedAreaIds
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
