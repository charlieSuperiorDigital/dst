import { apiRequest } from "@/utils/client-side-api";
import React, { useState, useRef, useEffect } from "react";
import { AddBayDefinitonTab } from "./add-bay-definition";
import { toast } from "@/hooks/use-toast";
import { useQuote } from "../../context/quote-context";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { ConfirmationModal } from "../../../../../../../components/ui/confirmation-modal";
import { set } from "react-hook-form";

type Part = {
  id: string;
  partNumber: string;
  description: string;
};

type Bay = {
  bayName: string;
  bayId: string;
  quantity: number;
};

export type PartWithBays = {
  part: Part;
  bays: Bay[];
};
type SelectionRange = {
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
};
type DragSource = {
  row: number;
  col: number;
  selectionRange?: SelectionRange;
};

type Props = {
  quoteId: string;
};
const TableComponent = ({ quoteId }: Props) => {
  const {
    updateBayDefinitionContext,
    setBayDefinitionContext,
    quote,
    isLocked,
  } = useQuote();
  const [partsWithBays, setPartsWithBays] = useState<PartWithBays[]>([]);
  const [selectedCell, setSelectedCell] = useState({ row: -1, col: -1 });
  const [editingCell, setEditingCell] = useState({ row: -1, col: -1 });
  const [selectedRow, setSelectedRow] = useState(-1);
  const [selectedColumn, setSelectedColumn] = useState(-1);
  const tableRef = useRef<HTMLDivElement>(null);
  const activeInput = useRef<HTMLInputElement>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState({ row: -1, col: -1 });
  const [selectionEnd, setSelectionEnd] = useState({ row: -1, col: -1 });
  const [isDragging, setIsDragging] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [dragSource, setDragSource] = useState<DragSource>({
    row: -1,
    col: -1,
  });
  const [dragTarget, setDragTarget] = useState({ row: -1, col: -1 });
  const [columnWidths, setColumnWidths] = useState<{ [key: number]: number }>(
    {}
  );
  const [copiedCells, setCopiedCells] = useState<string[][]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [hideZeroQuantity, setHideZeroQuantity] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchData = async () => {
    try {
      const response: PartWithBays[] = await apiRequest({
        url: `/api/definition/bay/${quoteId}`,
        method: "get",
      });
      setPartsWithBays(response);
      setLoading(false);
    } catch (err) {
      setError("Error al cargar los datos");
      setLoading(false);
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [quoteId]);
  const allBays = Array.from(
    new Set(
      partsWithBays.flatMap((part) => part.bays.map((bay) => bay.bayName))
    )
  );
  if (loading) {
    return <div>Loading</div>;
  }
  if (error) {
    return <div>Error loading </div>;
  }

  const copySelectedCells = () => {
    const range = getSelectionRange();
    if (!range) return;

    const { startRow, endRow, startCol, endCol } = range;
    const copiedData: string[][] = [];

    for (let row = startRow; row <= endRow; row++) {
      const rowData: string[] = [];
      for (let col = startCol; col <= endCol; col++) {
        const part = partsWithBays[row];
        const bay = part.bays[col];
        rowData.push(bay ? bay.quantity.toString() : "");
      }
      copiedData.push(rowData);
    }

    setCopiedCells(copiedData);
    toast({
      title: "Success",
      description: "Cells copied successfully",
    });
    console.log("Celdas copiadas:", copiedData); // Para depuración
  };
  const pasteCopiedCells = (targetRow: number, targetCol: number) => {
    if (copiedCells.length === 0 || copiedCells[0].length === 0) {
      console.warn("No hay celdas copiadas para pegar.");
      return;
    }

    const newPartsWithBays = [...partsWithBays]; // Copia del estado actual
    const updates: { partId: string; bayId: string; quantity: number }[] = [];
    for (let rowOffset = 0; rowOffset < copiedCells.length; rowOffset++) {
      for (let colOffset = 0; colOffset < copiedCells[0].length; colOffset++) {
        const row = targetRow + rowOffset;
        const col = targetCol + colOffset;

        // Verificar límites de la tabla
        if (row < newPartsWithBays.length && col < allBays.length) {
          const part = newPartsWithBays[row];
          const bay = part.bays.find((b) => b.bayName === allBays[col]);
          if (bay) {
            const newQuantity =
              parseInt(copiedCells[rowOffset][colOffset]) || 0;
            bay.quantity = newQuantity; // Actualizar la cantidad
            updates.push({
              partId: part.part.id,
              bayId: bay.bayId,
              quantity: newQuantity,
            });
          }
        }
      }
    }

    // Actualizar el estado de la tabla
    setPartsWithBays(newPartsWithBays);
    if (updateBayDefinitionContext) {
      updateBayDefinitionContext(newPartsWithBays);
      console.error("updateBayDefinitionContext is undefined");
    }

    updateMultipleQuantities(updates);
  };
  const selectCell = (row: number, col: number) => {
    setSelectedCell({ row, col });
    setSelectedRow(-1);
    setSelectedColumn(-1);
    setSelectionStart({ row: -1, col: -1 });
    setSelectionEnd({ row: -1, col: -1 });
    if (tableRef.current) {
      tableRef.current.focus();
    }
  };

  const startEditing = (row: number, col: number) => {
    console.log(`Editando celda: Fila ${row}, Columna ${col}`);
    // Verificar que la fila y la columna estén dentro de los límites
    if (
      row >= 0 &&
      row < partsWithBays.length &&
      col >= 0 &&
      col < allBays.length
    ) {
      setEditingCell({ row, col });
      setSelectedCell({ row, col });
      setTimeout(() => {
        if (activeInput.current) {
          activeInput.current.focus();
        }
      }, 0);
    } else {
      console.warn("Intento de editar una celda fuera de los límites.");
    }
  };
  const stopEditing = () => {
    setEditingCell({ row: -1, col: -1 });
  };

  const isEditingCell = (row: number, col: number): boolean => {
    return editingCell.row === row && editingCell.col === col;
  };

  const handleKeyNavigation = (event: React.KeyboardEvent) => {
    if (event.ctrlKey) {
      switch (event.key.toLowerCase()) {
        case "c": // Copiar
          event.preventDefault();
          copySelectedCells();
          break;
        case "v": // Pegar
          event.preventDefault();
          if (selectedCell.row >= 0 && selectedCell.col >= 0) {
            pasteCopiedCells(selectedCell.row, selectedCell.col);
          }
          break;
        default:
          break;
      }
      return; // Salir de la función después de manejar Ctrl+C o Ctrl+V
    }

    // Navegación con flechas y Enter
    switch (event.key) {
      case "ArrowUp":
      case "ArrowDown":
      case "ArrowLeft":
      case "ArrowRight":
        event.preventDefault(); // Evitar el comportamiento predeterminado del navegador
        moveToNextCell(
          event.key.toLowerCase().replace("arrow", "") as
            | "up"
            | "down"
            | "left"
            | "right",
          event
        );
        return;
      case "Enter":
        event.preventDefault(); // Evitar el comportamiento predeterminado del navegador
        if (editingCell.row === -1 && editingCell.col === -1) {
          // Si no está en modo de edición, activar la edición
          startEditing(selectedCell.row, selectedCell.col);
        } else {
          // Si está en modo de edición, fijar el valor y mover el foco a la celda de abajo
          stopEditing();
          moveToNextCell("down");
        }
        return;
    }
  };

  const getSelectionRange = (): SelectionRange | null => {
    if (selectionStart.row === -1 || selectionEnd.row === -1) return null;

    const startRow = Math.min(selectionStart.row, selectionEnd.row);
    const endRow = Math.max(selectionStart.row, selectionEnd.row);
    const startCol = Math.min(selectionStart.col, selectionEnd.col);
    const endCol = Math.max(selectionStart.col, selectionEnd.col);

    return { startRow, endRow, startCol, endCol };
  };

  const isInSelectionRange = (row: number, col: number): boolean => {
    const range = getSelectionRange();
    if (!range) return false;

    return (
      row >= range.startRow &&
      row <= range.endRow &&
      col >= range.startCol &&
      col <= range.endCol
    );
  };
  const isSelectedCell = (row: number, col: number): boolean => {
    return selectedCell.row === row && selectedCell.col === col;
  };

  const startSelection = (
    event: React.MouseEvent,
    row: number,
    col: number
  ) => {
    if (event.button !== 0 || !event.ctrlKey) return;

    event.preventDefault();
    setIsSelecting(true);
    setSelectionStart({ row, col });
    setSelectionEnd({ row, col });

    setSelectedRow(-1);
    setSelectedColumn(-1);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const updateSelection = (
    event: React.MouseEvent,
    row: number,
    col: number
  ) => {
    if (!isSelecting) return;

    setSelectionEnd({ row, col });
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!event.ctrlKey) {
      endSelection();
      return;
    }

    const element = document.elementFromPoint(event.clientX, event.clientY);
    if (!element) return;

    const cell = element.closest("td");
    if (!cell) return;

    const rowElement = cell.parentElement;
    if (!rowElement) return;

    const tbody = rowElement.parentElement;
    if (!tbody) return;

    const row = Array.from(tbody.children).indexOf(rowElement);
    const col = Array.from(rowElement.children).indexOf(cell) - 1;

    if (row >= 0 && col >= 0) {
      updateSelection(event as unknown as React.MouseEvent, row, col);
    }
  };

  const handleMouseUp = () => {
    endSelection();
  };

  const endSelection = () => {
    if (!isSelecting) return;

    setIsSelecting(false);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const getSelectionStyle = () => {
    const range = getSelectionRange();
    if (!range) return {};

    const table = tableRef.current?.querySelector("table");
    if (!table) return {};

    const startCell = table.rows[range.startRow + 1].cells[range.startCol + 1];
    const endCell = table.rows[range.endRow + 1].cells[range.endCol + 1];
    const tableRect = table.getBoundingClientRect();
    const startRect = startCell.getBoundingClientRect();
    const endRect = endCell.getBoundingClientRect();

    return {
      left: `${startRect.left - tableRect.left}px`,
      top: `${startRect.top - tableRect.top}px`,
      width: `${endRect.right - startRect.left}px`,
      height: `${endRect.bottom - startRect.top}px`,
    };
  };

  const getGhostStyle = () => {
    return {
      left: `${mousePosition.x + 10}px`,
      top: `${mousePosition.y + 10}px`,
    };
  };

  const getDragText = () => {
    if (!dragSource) return "Moving cell";

    // Verificar si dragSource tiene selectionRange
    if (dragSource.selectionRange) {
      const range = dragSource.selectionRange;
      const cellCount =
        (range.endRow - range.startRow + 1) *
        (range.endCol - range.startCol + 1);
      return `Moving ${cellCount} cells`;
    }

    // Si no hay selectionRange, mostrar el contenido de la celda
    const { row, col } = dragSource;
    if (
      row >= 0 &&
      col >= 0 &&
      row < partsWithBays.length &&
      col < allBays.length
    ) {
      const part = partsWithBays[row];
      const bay = part.bays[col];
      return bay ? bay.quantity.toString() : "Moving cell";
    }

    return "Moving cell";
  };

  const handleDragStart = (
    event: React.DragEvent,
    row: number,
    col: number
  ) => {
    if (!event.dataTransfer) return;

    setIsDragging(true);
    setMousePosition({ x: event.clientX, y: event.clientY });

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener(
      "dragend",
      () => {
        setIsDragging(false);
        document.removeEventListener("mousemove", handleMouseMove);
      },
      { once: true }
    );

    const range = getSelectionRange();
    if (range && isInSelectionRange(row, col)) {
      setDragSource({ row, col, selectionRange: range });
      const dragEl = document.createElement("div");
      dragEl.style.padding = "8px";
      dragEl.style.background = "white";
      dragEl.style.border = "1px solid #ccc";
      dragEl.style.borderRadius = "4px";
      dragEl.style.position = "absolute";
      dragEl.style.top = "-1000px";
      dragEl.textContent = `Moving ${
        (range.endRow - range.startRow + 1) *
        (range.endCol - range.startCol + 1)
      } cells`;
      document.body.appendChild(dragEl);
      event.dataTransfer.setDragImage(dragEl, 0, 0);
      setTimeout(() => document.body.removeChild(dragEl), 0);
    } else {
      setDragSource({ row, col });
      const part = partsWithBays[row];
      const bay = part.bays[col];
      const content = bay ? bay.quantity.toString() : "";
      event.dataTransfer.setData("text/plain", content);
      const dragEl = document.createElement("div");
      dragEl.textContent = content || "Moving cell";
      dragEl.style.padding = "8px";
      dragEl.style.background = "white";
      dragEl.style.border = "1px solid #ccc";
      dragEl.style.borderRadius = "4px";
      dragEl.style.position = "absolute";
      dragEl.style.top = "-1000px";
      document.body.appendChild(dragEl);
      event.dataTransfer.setDragImage(dragEl, 0, 0);
      setTimeout(() => document.body.removeChild(dragEl), 0);
    }

    event.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (event: React.DragEvent, row: number, col: number) => {
    event.preventDefault();
    setDragTarget({ row, col });
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  const handleDragLeave = (
    event: React.DragEvent,
    row: number,
    col: number
  ) => {
    if (dragTarget.row === row && dragTarget.col === col) {
      setDragTarget({ row: -1, col: -1 });
    }
  };

  const handleDrop = (
    event: React.DragEvent,
    targetRow: number,
    targetCol: number
  ) => {
    event.preventDefault();

    if (!dragSource) return;

    if ("selectionRange" in dragSource && dragSource.selectionRange) {
      const range = dragSource.selectionRange;
      const rowOffset = targetRow - dragSource.row;
      const colOffset = targetCol - dragSource.col;

      const newPartsWithBays = [...partsWithBays];

      for (let row = range.startRow; row <= range.endRow; row++) {
        for (let col = range.startCol; col <= range.endCol; col++) {
          const newRow = row + rowOffset;
          const newCol = col + colOffset;

          if (
            newRow >= 0 &&
            newRow < newPartsWithBays.length &&
            newCol >= 0 &&
            newCol < allBays.length
          ) {
            const sourcePart = newPartsWithBays[row];
            const targetPart = newPartsWithBays[newRow];
            const sourceBay = sourcePart.bays[col];
            const targetBay = targetPart.bays[newCol];

            if (sourceBay && targetBay) {
              targetBay.quantity = sourceBay.quantity;
              sourceBay.quantity = 0;
            }
          }
        }
      }

      setPartsWithBays(newPartsWithBays);
    } else {
      const { row: sourceRow, col: sourceCol } = dragSource;

      if (sourceRow === targetRow && sourceCol === targetCol) {
        return;
      }

      if (
        sourceRow >= 0 &&
        sourceCol >= 0 &&
        sourceRow < partsWithBays.length &&
        sourceCol < allBays.length &&
        targetRow >= 0 &&
        targetCol >= 0 &&
        targetRow < partsWithBays.length &&
        targetCol < allBays.length
      ) {
        const sourcePart = partsWithBays[sourceRow];
        const targetPart = partsWithBays[targetRow];
        const sourceBay = sourcePart.bays[sourceCol];
        const targetBay = targetPart.bays[targetCol];

        if (sourceBay && targetBay) {
          const newPartsWithBays = [...partsWithBays];
          newPartsWithBays[targetRow].bays[targetCol].quantity =
            sourceBay.quantity;
          newPartsWithBays[sourceRow].bays[sourceCol].quantity = 0;
          setPartsWithBays(newPartsWithBays);
        }
      }
    }

    setDragSource({ row: -1, col: -1 });
    setDragTarget({ row: -1, col: -1 });
  };

  const isDragOver = (row: number, col: number): boolean => {
    return dragTarget.row === row && dragTarget.col === col;
  };

  const getColumnStyle = (colIndex: number) => {
    const width = columnWidths[colIndex];
    return width ? { width: `${width}px` } : {};
  };

  const startColumnResize = (event: React.MouseEvent, colIndex: number) => {
    if (event.button !== 0 || event.detail > 1) return;

    event.preventDefault();
    const table = tableRef.current?.querySelector("table");
    if (!table) return;

    const cell = table.rows[0].cells[colIndex + 1];
    const initialSize = cell.offsetWidth;
    const initialMousePos = event.clientX;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - initialMousePos;
      const newSize = Math.max(20, initialSize + delta);
      setColumnWidths((prev) => ({ ...prev, [colIndex]: newSize }));
    };

    const stopResize = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", stopResize);
      table.classList.remove("resizing");
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopResize);

    table.classList.add("resizing");
  };

  const autoSizeColumn = (colIndex: number) => {
    const measureSpan = document.createElement("span");
    measureSpan.style.visibility = "hidden";
    measureSpan.style.position = "absolute";
    measureSpan.style.whiteSpace = "nowrap";
    measureSpan.style.font = window.getComputedStyle(tableRef.current!).font;
    document.body.appendChild(measureSpan);

    const headerText = allBays[colIndex];
    measureSpan.textContent = headerText;
    let maxWidth = measureSpan.offsetWidth + 32;

    partsWithBays.forEach((part) => {
      const cellContent = part.bays[colIndex].quantity.toString();
      measureSpan.textContent = cellContent;
      const cellWidth = measureSpan.offsetWidth + 16;
      maxWidth = Math.max(maxWidth, cellWidth);
    });

    document.body.removeChild(measureSpan);

    setColumnWidths((prev) => ({ ...prev, [colIndex]: maxWidth }));
  };

  const isColumnSelected = (col: number): boolean => {
    return selectedColumn === col;
  };

  const isRowSelected = (row: number): boolean => {
    return selectedRow === row;
  };

  const selectEntireRow = (row: number) => {
    setSelectedRow(row);
    setSelectedCell({ row: -1, col: -1 });
  };
  const moveToNextCell = (
    direction: "up" | "down" | "left" | "right",
    event?: React.KeyboardEvent
  ) => {
    if (event) {
      event.preventDefault();
    }

    const currentRow =
      editingCell.row !== -1 ? editingCell.row : selectedCell.row;
    const currentCol =
      editingCell.row !== -1 ? editingCell.col : selectedCell.col;

    let newRow = currentRow;
    let newCol = currentCol;

    switch (direction) {
      case "up":
        newRow = Math.max(0, currentRow - 1);
        break;
      case "down":
        newRow = Math.min(partsWithBays.length - 1, currentRow + 1);
        break;
      case "left":
        newCol = Math.max(0, currentCol - 1);
        break;
      case "right":
        newCol = Math.min(allBays.length - 1, currentCol + 1);
        break;
    }

    if (editingCell.row !== -1) {
      const isHorizontalMove = direction === "left" || direction === "right";

      if (isHorizontalMove) {
        const input = activeInput.current;
        if (!input) return;

        const atStart = input.selectionStart === 0 && input.selectionEnd === 0;
        const atEnd =
          input.selectionStart === input.value.length &&
          input.selectionEnd === input.value.length;

        if (
          (direction === "left" && atStart) ||
          (direction === "right" && atEnd)
        ) {
          stopEditing();
          selectCell(newRow, newCol);
          startEditing(newRow, newCol);
        }
        return;
      }

      stopEditing();
      selectCell(newRow, newCol);
      startEditing(newRow, newCol);
    } else {
      selectCell(newRow, newCol);
    }
  };

  const handleAddBay = async (bayName) => {
    try {
      const response = await apiRequest({
        url: `/api/definition/bay/${bayName}/${quoteId}`,
        method: "post",
      });

      setPartsWithBays((prevState) =>
        prevState.map((partWithBays) => ({
          ...partWithBays,
          bays: [
            ...partWithBays.bays,
            { bayName: bayName, bayId: response, quantity: 0 },
          ],
        }))
      );
      setBayDefinitionContext?.((prevState) =>
        prevState.map((partWithBays) => ({
          ...partWithBays,
          bays: [
            ...partWithBays.bays,
            { bayName: bayName, bayId: response, quantity: 0 },
          ],
        }))
      );

      toast({
        title: "Success",
        description: "Bay added successfully",
      });
    } catch (error) {
      console.error("Error adding bay:", error);
      toast({
        title: "Error",
        description: "Failed to add bay. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateMultipleQuantities = async (
    updates: { partId: string; bayId: string; quantity: number }[]
  ) => {
    try {
      const results = await Promise.allSettled(
        updates.map((update) =>
          apiRequest({
            url: `/api/part/bay/updatePart`,
            method: "put",
            data: update,
          })
        )
      );

      const successfulUpdates: {
        partId: string;
        bayId: string;
        quantity: number;
      }[] = [];
      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          successfulUpdates.push(updates[index]);
        } else {
          console.error("Error updating quantity:", result.reason);
          toast({
            title: "Error",
            description: `Failed to update quantity for part ${updates[index].partId} and bay ${updates[index].bayId}.`,
            variant: "destructive",
          });
        }
      });

      if (successfulUpdates.length > 0) {
        setPartsWithBays((prevPartsWithBays) =>
          prevPartsWithBays.map((partWithBays) => {
            const updatedBays = partWithBays.bays.map((bay) => {
              const update = successfulUpdates.find(
                (u) =>
                  u.partId === partWithBays.part.id && u.bayId === bay.bayId
              );
              return update ? { ...bay, quantity: update.quantity } : bay;
            });
            return { ...partWithBays, bays: updatedBays };
          })
        );
        setBayDefinitionContext?.((prevPartsWithBays) =>
          prevPartsWithBays.map((partWithBays) => {
            const updatedBays = partWithBays.bays.map((bay) => {
              const update = successfulUpdates.find(
                (u) =>
                  u.partId === partWithBays.part.id && u.bayId === bay.bayId
              );
              return update ? { ...bay, quantity: update.quantity } : bay;
            });
            return { ...partWithBays, bays: updatedBays };
          })
        );

        toast({
          title: "Success",
          description: "Quantities updated successfully",
        });
      }
    } catch (error) {
      console.error("Error updating quantities:", error);
      toast({
        title: "Error",
        description: "Failed to update quantities. Please try again.",
        variant: "destructive",
      });
    }
  };
  const updateSingleQuantity = async (update: {
    partId: string;
    bayId: string;
    quantity: number;
  }) => {
    try {
      // Send a single request to update the quantity
      await apiRequest({
        url: `/api/part/bay/updatePart`,
        method: "put",
        data: update,
      });

      // If the request is successful, update the local state
      setPartsWithBays((prevPartsWithBays) =>
        prevPartsWithBays.map((partWithBays) => {
          const updatedBays = partWithBays.bays.map((bay) => {
            if (
              bay.bayId === update.bayId &&
              partWithBays.part.id === update.partId
            ) {
              return { ...bay, quantity: update.quantity }; // Update the quantity
            }
            return bay; // Return the unchanged bay
          });
          return { ...partWithBays, bays: updatedBays }; // Return the updated part
        })
      );
      setBayDefinitionContext?.((prevPartsWithBays) =>
        prevPartsWithBays.map((partWithBays) => {
          const updatedBays = partWithBays.bays.map((bay) => {
            if (
              bay.bayId === update.bayId &&
              partWithBays.part.id === update.partId
            ) {
              return { ...bay, quantity: update.quantity }; // Update the quantity
            }
            return bay; // Return the unchanged bay
          });
          return { ...partWithBays, bays: updatedBays }; // Return the updated part
        })
      );

      // Show a success toast
      toast({
        title: "Success",
        description: "Quantity updated successfully",
      });
    } catch (error) {
      console.error("Error updating quantity:", error);
      // Show an error toast
      toast({
        title: "Error",
        description: "Failed to update quantity. Please try again.",
        variant: "destructive",
      });
    }
  };

  const calculateTotalQuantity = (partWithBays: PartWithBays): number => {
    return partWithBays.bays.reduce((total, bay) => total + bay.quantity, 0);
  };

  const filteredBays = allBays.filter((bayName) =>
    bayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPartsWithBays = partsWithBays.filter((partWithBays) => {
    const matchesSearch = partWithBays.bays.some((bay) =>
      bay.bayName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const hasNonZeroQuantity =
      !hideZeroQuantity || partWithBays.bays.some((bay) => bay.quantity > 0);
    return matchesSearch && hasNonZeroQuantity;
  });
  const debounceUpdate = (update: {
    partId: string;
    bayId: string;
    quantity: number;
  }) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current); // Cancelar el debounce anterior
    }

    // Establecer un nuevo debounce
    debounceTimeout.current = setTimeout(() => {
      updateSingleQuantity(update);
    }, 500); // 500 ms de retraso
  };

  const handleBlur = () => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current); // Cancelar el debounce
      const update = {
        partId: partsWithBays[editingCell.row].part.id,
        bayId: partsWithBays[editingCell.row].bays[editingCell.col].bayId,
        quantity: partsWithBays[editingCell.row].bays[editingCell.col].quantity,
      };
      updateSingleQuantity(update); // Forzar la actualización
    }
    stopEditing();
  };

  const handleOpenDeleteModal = async (bayName) => {
    const findBay = partsWithBays.find((partWithBays) =>
      partWithBays.bays.some((bay) => bay.bayName === bayName)
    );
    if (!findBay) return;
    setItemToDelete(findBay.bays[0].bayId);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      setIsDeleting(true);
      console.log(quote.id, itemToDelete);

      const response = await apiRequest({
        url: `/api/Definition/Bay/${quote.id}?BayId=${itemToDelete}`,
        method: "delete",
      });
      console.log("response", response);
      setPartsWithBays((prevState) =>
        prevState.map((partWithBays) => ({
          ...partWithBays,
          bays: partWithBays.bays.filter((bay) => bay.bayId !== itemToDelete),
        }))
      );
      setBayDefinitionContext?.((prevState) =>
        prevState.map((partWithBays) => ({
          ...partWithBays,
          bays: partWithBays.bays.filter((bay) => bay.bayId !== itemToDelete),
        }))
      );
      toast({
        title: "Success",
        description: ` deleted successfully.`,
      });

      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error(`Error deleting `, error);
      toast({
        title: "Error",
        description: `Failed to delete Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mt-6">
      <ConfirmationModal
        confirmText="Delete"
        title="Delete Bay Definition"
        description={`Are you sure you want to delete this bay definition? This action cannot be undone.`}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        isConfirming={isDeleting}
        onConfirm={handleDelete}
      />
      <div className="flex items-center space-x-4 mb-6">
        <div className="">
          <Input
            type="search"
            placeholder="Search bays..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
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
        {!isLocked && <AddBayDefinitonTab onAdd={handleAddBay} />}
      </div>
      <div
        className="table-component overflow-auto max-w-full max-h-full outline-none relative"
        onKeyDown={handleKeyNavigation}
        tabIndex={0}
        ref={tableRef}
      >
        {isSelecting && (
          <div
            className="selection-area absolute bg-blue-100 border-2 border-blue-500 pointer-events-none z-10"
            style={getSelectionStyle()}
          ></div>
        )}

        {isDragging && (
          <div
            className="ghost-drag fixed bg-white rounded shadow-lg p-2 pointer-events-none z-1000 flex items-center gap-2"
            style={getGhostStyle()}
          >
            {getDragText()}
          </div>
        )}

        <table className="border-collapse border border-gray-300 bg-white min-w-full user-select-none">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2 font-bold text-left w-[350px] sticky left-0 bg-white z-20">
                Part Number / Description
              </th>
              {filteredBays.map((bayName, colIndex) => (
                <th
                  key={colIndex}
                  className={`border border-gray-300 p-2 font-bold text-center cursor-pointer relative ${
                    isColumnSelected(colIndex) ? "bg-blue-100" : "bg-gray-100"
                  }`}
                  style={{ minWidth: "100px", ...getColumnStyle(colIndex) }}
                  onClick={() => handleOpenDeleteModal(bayName)}
                >
                  <p className="flex items-center justify-center gap-1">
                    {bayName}
                    {!isLocked && <Trash2 size={18} />}
                  </p>

                  <div
                    className="col-resize-handle absolute top-0 right-0 w-1 h-full cursor-col-resize opacity-0 hover:opacity-100 hover:bg-blue-300"
                    onMouseDown={(e) => startColumnResize(e, colIndex)}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      autoSizeColumn(colIndex);
                    }}
                  ></div>
                </th>
              ))}
              {/* New Total Column */}
              <th className="border border-gray-300 p-2 font-bold text-center sticky right-0 bg-white z-20">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredPartsWithBays.map((partWithBays, rowIndex) => {
              const totalQuantity = calculateTotalQuantity(partWithBays); // Calculate the total for the row
              return (
                <tr key={partWithBays.part.id}>
                  <td
                    className={`border w-[350px] border-gray-300 p-2 text-left cursor-pointer sticky left-0 bg-white z-10 flex items-center ${
                      isRowSelected(rowIndex) ? "bg-blue-100" : "bg-gray-100"
                    }`}
                    style={{
                      height: "60px", // Fixed height
                      overflow: "hidden", // Hide overflowing content
                      whiteSpace: "nowrap", // Prevent text from wrapping
                      textOverflow: "ellipsis", // Add ellipsis for overflow
                    }}
                    title={`${partWithBays.part.partNumber} - ${partWithBays.part.description}`} // Tooltip for full text
                    onClick={() => selectEntireRow(rowIndex)}
                  >
                    <span className="font-bold text-blue-600 text-lg">
                      {partWithBays.part.partNumber}
                    </span>
                    <span className="text-gray-500 font-light text-sm mx-1">
                      -
                    </span>
                    <span className="text-gray-700 font-medium text-base">
                      {partWithBays.part.description}
                    </span>
                  </td>
                  {filteredBays.map((bayName, colIndex) => {
                    const bay = partWithBays.bays.find(
                      (b) => b.bayName === bayName
                    );
                    const quantity = bay ? bay.quantity : 0;

                    return (
                      <td
                        key={`${partWithBays.part.id}-${bayName}`}
                        className={`
                border border-gray-300 p-2 text-center cursor-move relative
                ${
                  isSelectedCell(rowIndex, colIndex) ||
                  isInSelectionRange(rowIndex, colIndex)
                    ? "bg-blue-50 outline outline-2 outline-blue-500"
                    : ""
                }
                ${isRowSelected(rowIndex) ? "bg-blue-50" : ""}
                ${isColumnSelected(colIndex) ? "bg-blue-50" : ""}
                ${
                  isDragOver(rowIndex, colIndex)
                    ? "bg-green-100 outline-dashed outline-2 outline-green-500"
                    : ""
                }
              `}
                        style={{
                          minWidth: "100px",
                          ...getColumnStyle(colIndex),
                        }}
                        onClick={(e) => {
                          if (e.ctrlKey && copiedCells.length > 0) {
                            pasteCopiedCells(rowIndex, colIndex);
                          }
                          selectCell(rowIndex, colIndex);
                        }}
                        onDoubleClick={() => startEditing(rowIndex, colIndex)}
                        onDragStart={(e) =>
                          handleDragStart(e, rowIndex, colIndex)
                        }
                        onDragOver={(e) =>
                          handleDragOver(e, rowIndex, colIndex)
                        }
                        onDragLeave={(e) =>
                          handleDragLeave(e, rowIndex, colIndex)
                        }
                        onDrop={(e) => handleDrop(e, rowIndex, colIndex)}
                        draggable
                        onMouseDown={(e) =>
                          startSelection(e, rowIndex, colIndex)
                        }
                        onMouseMove={(e) =>
                          updateSelection(e, rowIndex, colIndex)
                        }
                        onMouseUp={endSelection}
                      >
                        {isEditingCell(rowIndex, colIndex) ? (
                          <input
                            ref={activeInput}
                            value={quantity.toString()}
                            onChange={(e) => {
                              const newQuantity = parseInt(e.target.value) || 0;
                              const newPartsWithBays = [...partsWithBays];
                              const part = newPartsWithBays[rowIndex];
                              const bay = part.bays.find(
                                (b) => b.bayName === filteredBays[colIndex]
                              );

                              if (bay) {
                                bay.quantity = newQuantity;
                                setPartsWithBays(newPartsWithBays);

                                debounceUpdate({
                                  partId: part.part.id,
                                  bayId: bay.bayId,
                                  quantity: newQuantity,
                                });
                              } else {
                                console.error(
                                  "Bay not found for the given row and column."
                                );
                                toast({
                                  title: "Error",
                                  description:
                                    "Bay not found. Please try again.",
                                  variant: "destructive",
                                });
                              }
                            }}
                            onBlur={handleBlur}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                stopEditing();
                                moveToNextCell("down");
                              }
                            }}
                            className="cell-input absolute top-0 left-0 w-full h-full border-none p-2 box-border font-inherit text-inherit bg-white z-20 focus:outline-2 focus:outline-blue-500 focus:shadow-[0_0_0_4px_rgba(33,150,243,0.2)]"
                          />
                        ) : (
                          <div
                            className="cell-content absolute top-0 left-0 right-1 bottom-0 p-2 whitespace-nowrap overflow-hidden text-ellipsis"
                            title={quantity.toString()}
                          >
                            {quantity}
                          </div>
                        )}
                      </td>
                    );
                  })}
                  {/* New Total Column Cell */}
                  <td className="border border-gray-300 p-2 text-center sticky right-0 bg-white z-10">
                    {totalQuantity}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableComponent;
