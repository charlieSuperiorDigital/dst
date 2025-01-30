import { apiRequest } from "@/utils/client-side-api";
import React, { useState, useRef, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useQuote } from "../../context/quote-context";
import { AddFlueDefinitonTab } from "../flue-dinition-tab/add-flue-definition";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
const data = [
  {
    flue: {
      id: "d2d12631-67be-4e32-8387-4d11b3d37232",
      name: "fl-1",
      quotationId: "ab29564c-fa0c-42ae-94dd-f1dd0d67a8f8",
    },
    rows: [
      {
        rowName: "Row-1",
        row2Name: "Row-1",
        rowId: "f9312335-0eb5-41f6-a59f-b1892d262391",
        rowId2: "f9312335-0eb5-41f6-a59f-b1892d262391",
        quantity: 1,
      },
      {
        rowName: "Row-2",
        row2Name: null, // Removed empty string
        rowId: "b88a3e88-c074-494f-84cc-33b3ac0522c3",
        rowId2: "00000000-0000-0000-0000-000000000000",
        quantity: 0,
      },
      {
        rowName: "Row-3",
        row2Name: null, // Removed empty string
        rowId: "c45b210a-7d3e-4a8f-bf34-5d8e7c9a1b22",
        rowId2: "00000000-0000-0000-0000-000000000000",
        quantity: 0,
      },
      {
        rowName: "Row-4",
        row2Name: "Row-4",
        rowId: "a12b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
        rowId2: "a12b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
        quantity: 2,
      },
      {
        rowName: "Row-5",
        row2Name: null, // Removed empty string
        rowId: "b23c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q",
        rowId2: "00000000-0000-0000-0000-000000000000",
        quantity: 1,
      },
      {
        rowName: "Row-6",
        row2Name: "Row-6",
        rowId: "c34d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r",
        rowId2: "c34d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r",
        quantity: 3,
      },
      {
        rowName: "Row-7",
        row2Name: null, // Removed empty string
        rowId: "d45e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s",
        rowId2: "00000000-0000-0000-0000-000000000000",
        quantity: 0,
      },
      {
        rowName: "Row-8",
        row2Name: "Row-8",
        rowId: "e56f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t",
        rowId2: "e56f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t",
        quantity: 4,
      },
    ],
  },
  {
    flue: {
      id: "8ef4227a-343f-4e3e-b62a-271eb742ae4f",
      name: "fl-2",
      quotationId: "ab29564c-fa0c-42ae-94dd-f1dd0d67a8f8",
    },
    rows: [
      {
        rowName: "Row-1",
        row2Name: "Row-1",
        rowId: "f9312335-0eb5-41f6-a59f-b1892d262391",
        rowId2: "f9312335-0eb5-41f6-a59f-b1892d262391",
        quantity: 1,
      },
      {
        rowName: "Row-2",
        row2Name: null, // Removed empty string
        rowId: "b88a3e88-c074-494f-84cc-33b3ac0522c3",
        rowId2: "00000000-0000-0000-0000-000000000000",
        quantity: 0,
      },
      {
        rowName: "Row-3",
        row2Name: "Row-3",
        rowId: "d89e4f2a-1b5d-4c7a-9a3b-6e8f5c2d1a7e",
        rowId2: "d89e4f2a-1b5d-4c7a-9a3b-6e8f5c2d1a7e",
        quantity: 2,
      },
      {
        rowName: "Row-4",
        row2Name: null, // Removed empty string
        rowId: "f67g8h9i-0j1k-2l3m-4n5o-6p7q8r9s0t1u",
        rowId2: "00000000-0000-0000-0000-000000000000",
        quantity: 1,
      },
      {
        rowName: "Row-5",
        row2Name: "Row-5",
        rowId: "g78h9i0j-1k2l-3m4n-5o6p-7q8r9s0t1u2v",
        rowId2: "g78h9i0j-1k2l-3m4n-5o6p-7q8r9s0t1u2v",
        quantity: 0,
      },
      {
        rowName: "Row-6",
        row2Name: null, // Removed empty string
        rowId: "h89i0j1k-2l3m-4n5o-6p7q-8r9s0t1u2v3w",
        rowId2: "00000000-0000-0000-0000-000000000000",
        quantity: 3,
      },
      {
        rowName: "Row-7",
        row2Name: "Row-7",
        rowId: "i90j1k2l-3m4n-5o6p-7q8r-9s0t1u2v3w4x",
        rowId2: "i90j1k2l-3m4n-5o6p-7q8r-9s0t1u2v3w4x",
        quantity: 2,
      },
      {
        rowName: "Row-8",
        row2Name: null, // Removed empty string
        rowId: "j01k2l3m-4n5o-6p7q-8r9s-0t1u2v3w4x5y",
        rowId2: "00000000-0000-0000-0000-000000000000",
        quantity: 1,
      },
    ],
  },
  {
    flue: {
      id: "9ac45b21-3d7e-4f2a-b63c-1e8d9f7a0b34",
      name: "fl-3",
      quotationId: "ab29564c-fa0c-42ae-94dd-f1dd0d67a8f8",
    },
    rows: [
      {
        rowName: "Row-1",
        row2Name: "",
        rowId: "f9312335-0eb5-41f6-a59f-b1892d262391",
        rowId2: "f9312335-0eb5-41f6-a59f-b1892d262391",
        quantity: 1,
      },
      {
        rowName: "Row-2",
        row2Name: "",
        rowId: "b88a3e88-c074-494f-84cc-33b3ac0522c3",
        rowId2: "00000000-0000-0000-0000-000000000000",
        quantity: 0,
      },
      {
        rowName: "Row-3",
        row2Name: "",
        rowId: "e76f5c2d-1a7e-4a8f-bf34-5d8e7c9a1b22",
        rowId2: "00000000-0000-0000-0000-000000000000",
        quantity: 3,
      },
      {
        rowName: "Row-4",
        row2Name: "",
        rowId: "k12l3m4n-5o6p-7q8r-9s0t-1u2v3w4x5y6z",
        rowId2: "k12l3m4n-5o6p-7q8r-9s0t-1u2v3w4x5y6z",
        quantity: 2,
      },
      {
        rowName: "Row-5",
        row2Name: "",
        rowId: "l23m4n5o-6p7q-8r9s-0t1u-2v3w4x5y6z7a",
        rowId2: "00000000-0000-0000-0000-000000000000",
        quantity: 1,
      },
      {
        rowName: "Row-6",
        row2Name: "Row-6",
        rowId: "m34n5o6p-7q8r-9s0t-1u2v-3w4x5y6z7a8b",
        rowId2: "m34n5o6p-7q8r-9s0t-1u2v-3w4x5y6z7a8b",
        quantity: 0,
      },
      {
        rowName: "Row-7",
        row2Name: "", // Removed empty string
        rowId: "n45o6p7q-8r9s-0t1u-2v3w-4x5y6z7a8b9c",
        rowId2: "00000000-0000-0000-0000-000000000000",
        quantity: 4,
      },
      {
        rowName: "Row-8",
        row2Name: "Row-8",
        rowId: "o56p7q8r-9s0t-1u2v-3w4x-5y6z7a8b9c0d",
        rowId2: "o56p7q8r-9s0t-1u2v-3w4x-5y6z7a8b9c0d",
        quantity: 3,
      },
    ],
  },
];

type Row = {
  rowName: string;
  rowId: string;
  quantity: number;
};

type Flue = {
  id: string;
  name: string;
  quotationId: string;
};
type FlueWithRows = {
  flue: Flue;
  rows: Row[];
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
const FlueCountTable = ({ quoteId }: Props) => {
  const { setFluesDefinitionContext } = useQuote();
  const [bayWithRows, setbayWithRows] = useState<FlueWithRows[]>([]);
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
  const [rowHeights, setRowHeights] = useState<{ [key: number]: number }>({});
  const [copiedCells, setCopiedCells] = useState<string[][]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [hideZeroQuantity, setHideZeroQuantity] = useState(false);

  const fetchData = async () => {
    try {
      const response: FlueWithRows[] = await apiRequest({
        url: `/api/count/flue/${quoteId}`,
        method: "get",
      });

      setbayWithRows(response);
      setLoading(false);
    } catch (err) {
      setError("Error Loading data");
      setLoading(false);
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [quoteId]);
  const allBays = Array.from(
    new Set(bayWithRows.flatMap((part) => part.rows.map((row) => row.rowName)))
  );
  if (loading) {
    return <div>Loading ...</div>;
  }
  if (error) {
    return <div>{error}</div>;
  }

  // Funciones adaptadas para trabajar con `partsWithBays`
  const copySelectedCells = () => {
    const range = getSelectionRange();
    if (!range) return;

    const { startRow, endRow, startCol, endCol } = range;
    const copiedData: string[][] = [];

    for (let row = startRow; row <= endRow; row++) {
      const rowData: string[] = [];
      for (let col = startCol; col <= endCol; col++) {
        const bayWithRows1 = bayWithRows[row];
        const rowDataItem = bayWithRows1.rows[col];
        rowData.push(rowDataItem ? rowDataItem.quantity.toString() : "");
      }
      // Para depuración
      copiedData.push(rowData);
    }
    console.log("Celdas copiadas:", copiedData); // Para depuración
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

    const newPartsWithBays = [...bayWithRows]; // Copia del estado actual
    const updates: { flueid: string; rowId: string; quantity: number }[] = [];
    for (let rowOffset = 0; rowOffset < copiedCells.length; rowOffset++) {
      for (let colOffset = 0; colOffset < copiedCells[0].length; colOffset++) {
        const row = targetRow + rowOffset;
        const col = targetCol + colOffset;

        // Verificar límites de la tabla
        if (row < newPartsWithBays.length && col < allBays.length) {
          const part = newPartsWithBays[row];
          const bay = part.rows.find((b) => b.rowName === allBays[col]);
          if (bay) {
            const newQuantity =
              parseInt(copiedCells[rowOffset][colOffset]) || 0;
            bay.quantity = newQuantity; // Actualizar la cantidad
            updates.push({
              flueid: part.flue.id,
              rowId: bay.rowId,
              quantity: newQuantity,
            });
          }
        }
      }
    }

    // Actualizar el estado de la tabla
    console.log("Actualizando celdas:", updates); // Para depuración
    setbayWithRows(newPartsWithBays);
    // if (updateBayDefinitionContext) {
    //   updateBayDefinitionContext(newPartsWithBays);
    //   console.error("updateBayDefinitionContext is undefined");
    // }

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
      row < bayWithRows.length &&
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
      row < bayWithRows.length &&
      col < allBays.length
    ) {
      const part = bayWithRows[row];
      const bay = part.rows[col];
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
      const part = bayWithRows[row];
      const bay = part.rows[col];
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

      const newPartsWithBays = [...bayWithRows];

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
            const sourceBay = sourcePart.rows[col];
            const targetBay = targetPart.rows[newCol];

            if (sourceBay && targetBay) {
              targetBay.quantity = sourceBay.quantity;
              sourceBay.quantity = 0;
            }
          }
        }
      }

      setbayWithRows(newPartsWithBays);
    } else {
      const { row: sourceRow, col: sourceCol } = dragSource;

      if (sourceRow === targetRow && sourceCol === targetCol) {
        return;
      }

      if (
        sourceRow >= 0 &&
        sourceCol >= 0 &&
        sourceRow < bayWithRows.length &&
        sourceCol < allBays.length &&
        targetRow >= 0 &&
        targetCol >= 0 &&
        targetRow < bayWithRows.length &&
        targetCol < allBays.length
      ) {
        const sourcePart = bayWithRows[sourceRow];
        const targetPart = bayWithRows[targetRow];
        const sourceBay = sourcePart.rows[sourceCol];
        const targetBay = targetPart.rows[targetCol];

        if (sourceBay && targetBay) {
          const newPartsWithBays = [...bayWithRows];
          newPartsWithBays[targetRow].rows[targetCol].quantity =
            sourceBay.quantity;
          newPartsWithBays[sourceRow].rows[sourceCol].quantity = 0;
          setbayWithRows(newPartsWithBays);
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

  const getRowStyle = (rowIndex: number) => {
    const height = rowHeights[rowIndex];
    return height ? { height: `${height}px` } : {};
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

  const startRowResize = (event: React.MouseEvent, rowIndex: number) => {
    event.preventDefault();
    const table = tableRef.current?.querySelector("table");
    if (!table) return;

    const row = table.rows[rowIndex + 1];
    const initialSize = row.offsetHeight;
    const initialMousePos = event.clientY;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientY - initialMousePos;
      const newSize = Math.max(20, initialSize + delta);
      setRowHeights((prev) => ({ ...prev, [rowIndex]: newSize }));
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

    bayWithRows.forEach((part) => {
      const cellContent = part.rows[colIndex].quantity.toString();
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
        newRow = Math.min(bayWithRows.length - 1, currentRow + 1);
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

  const autoSizeRow = (rowIndex: number) => {
    const table = tableRef.current?.querySelector("table");
    if (!table) return;

    const cells = Array.from(table.rows[rowIndex + 1].cells);

    let maxHeight = 40;
    cells.forEach((cell) => {
      const content = cell.querySelector(".cell-content");
      if (content) {
        const temp = document.createElement("div");
        temp.style.position = "absolute";
        temp.style.visibility = "hidden";
        temp.style.width = cell.offsetWidth + "px";
        temp.style.whiteSpace = "normal";
        temp.innerHTML = content.innerHTML;
        document.body.appendChild(temp);

        const contentHeight = temp.offsetHeight;
        maxHeight = Math.max(maxHeight, contentHeight + 16);

        document.body.removeChild(temp);
      }
    });

    setRowHeights((prev) => ({ ...prev, [rowIndex]: maxHeight }));
  };

  const handleEnterKey = (rowIndex: number) => {
    // Mover a la siguiente fila al presionar Enter
    moveToNextCell("down");
  };

  const handleArrowInEdit = (
    direction: "up" | "down" | "left" | "right",
    event: React.KeyboardEvent
  ) => {
    const input = activeInput.current;
    if (!input) return;

    const currentCellContent =
      bayWithRows[editingCell.row].rows[editingCell.col].quantity.toString();

    // Para movimiento izquierda/derecha, verificar la posición del cursor
    if (direction === "left") {
      // Solo mover a la celda anterior si el cursor está al inicio
      if (input.selectionStart === 0 && input.selectionEnd === 0) {
        moveToNextCell(direction, event);
      }
    } else if (direction === "right") {
      // Solo mover a la celda siguiente si el cursor está al final
      if (
        input.selectionStart === currentCellContent.length &&
        input.selectionEnd === currentCellContent.length
      ) {
        moveToNextCell(direction, event);
      }
    } else {
      // Para movimiento arriba/abajo, siempre mover
      moveToNextCell(direction, event);
    }
  };

  const updateMultipleQuantities = async (
    updates: { flueid: string; rowId: string; quantity: number }[]
  ) => {
    try {
      console.log(updates);
      const results = await Promise.allSettled(
        updates.map((update) =>
          apiRequest({
            url: `/api/row/flue/update`,
            method: "put",
            data: update,
          })
        )
      );

      const successfulUpdates: {
        flueid: string;
        rowId: string;
        quantity: number;
      }[] = [];
      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          successfulUpdates.push(updates[index]);
        } else {
          console.error("Error updating quantity:", result.reason);
          toast({
            title: "Error",
            description: `Failed to update quantity for part ${updates[index].flueid} and bay ${updates[index].rowId}.`,
            variant: "destructive",
          });
        }
      });

      if (successfulUpdates.length > 0) {
        setbayWithRows((prevPartsWithBays) =>
          prevPartsWithBays.map((partWithBays) => {
            const updatedBays = partWithBays.rows.map((bay) => {
              const update = successfulUpdates.find(
                (u) =>
                  u.flueid === partWithBays.flue.id && u.flueid === bay.rowId
              );
              return update ? { ...bay, quantity: update.quantity } : bay;
            });
            return { ...partWithBays, bays: updatedBays };
          })
        );
        setFluesDefinitionContext?.((prevPartsWithBays) =>
          prevPartsWithBays.map((partWithBays) => {
            const updatedBays = partWithBays.flues.map((bay) => {
              const update = successfulUpdates.find(
                (u) =>
                  u.flueid === partWithBays.part.id && u.flueid === bay.flueId
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
    flueid: string;
    rowId: string;
    quantity: number;
  }) => {
    try {
      // Send a single request to update the quantity
      await apiRequest({
        url: `/api/row/flue/update`,
        method: "put",
        data: update,
      });

      // If the request is successful, update the local state
      setbayWithRows((prevPartsWithBays) =>
        prevPartsWithBays.map((partWithBays) => {
          const updatedBays = partWithBays.rows.map((bay) => {
            if (
              bay.rowId === update.flueid &&
              partWithBays.flue.id === update.flueid
            ) {
              return { ...bay, quantity: update.quantity }; // Update the quantity
            }
            return bay; // Return the unchanged bay
          });
          return { ...partWithBays, bays: updatedBays }; // Return the updated part
        })
      );
      setFluesDefinitionContext?.((prevPartsWithBays) =>
        prevPartsWithBays.map((partWithBays) => {
          const updatedBays = partWithBays.flues.map((bay) => {
            if (
              bay.flueId === update.flueid &&
              partWithBays.part.id === update.flueid
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

  const calculateTotalQuantity = (partWithBays: FlueWithRows): number => {
    return partWithBays.rows.reduce((total, bay) => total + bay.quantity, 0);
  };

  const handleAddFlue = async (value) => {
    try {
      const response = await apiRequest({
        url: `/api/definition/flue/${value.name}/${quoteId}`,
        method: "post",
      });

      const newFrame = { id: response, name: value.name, quotationId: quoteId };
      const newRows =
        bayWithRows.length > 0
          ? bayWithRows[0].rows.map((row) => ({
              rowName: row.rowName,
              rowId: row.rowId,
              quantity: 0,
            }))
          : [];

      setbayWithRows((prevState) => [
        ...prevState,
        { flue: newFrame, rows: newRows },
      ]);

      setFluesDefinitionContext?.((prevState) =>
        prevState.map((partWithBays) => ({
          ...partWithBays,
          flues: [
            ...partWithBays.flues,
            { flueName: value.name, flueId: response, quantity: 0 },
          ],
        }))
      );

      toast({
        title: "Success",
        description: "Flue added successfully",
      });
    } catch (error) {
      console.error("Error adding bay:", error);
      toast({
        title: "Error",
        description: "Failed to add flue. Please try again.",
        variant: "destructive",
      });
    }
  };
  const filteredBayWithRows = bayWithRows.filter((partWithBays) => {
    // Filtrar por término de búsqueda
    const matchesSearch = partWithBays.flue.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // Filtrar por toggle de ocultar filas con todas las cantidades en 0
    const hasNonZeroQuantity = partWithBays.rows.some(
      (row) => row.quantity !== 0
    );

    // Si el toggle está activado, solo mostrar filas con al menos una cantidad no cero
    if (hideZeroQuantity) {
      return matchesSearch && hasNonZeroQuantity;
    }

    return matchesSearch;
  });

  return (
    <div className="mt-6">
      <div className="flex items-center space-x-4  mb-4">
        <div>
          <Input
            type="text"
            placeholder="Search by bay name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="flex items-center space-x-2 ">
          <Switch
            id="hide-zero"
            checked={hideZeroQuantity}
            onCheckedChange={setHideZeroQuantity}
          />
          <Label htmlFor="hide-zero">Hide zero quantity</Label>
        </div>
        <AddFlueDefinitonTab onAdd={handleAddFlue} />
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
                Flue
              </th>
              {allBays.slice(0, -1).map((bayName, colIndex) => (
                <th
                  key={colIndex}
                  className={`border border-gray-300 p-2 font-bold text-center cursor-pointer relative ${
                    isColumnSelected(colIndex) ? "bg-blue-100" : "bg-gray-100"
                  }`}
                  style={{ minWidth: "100px", ...getColumnStyle(colIndex) }}
                >
                  {bayName} -{" "}
                  {bayName.replace(/\d+/, (match) =>
                    (parseInt(match, 10) + 1).toString()
                  )}
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
            {filteredBayWithRows.map((partWithBays, rowIndex) => {
              const totalQuantity = calculateTotalQuantity(partWithBays); // Calculate the total for the row
              return (
                <tr key={partWithBays.flue.id}>
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
                    title={`${partWithBays.flue.name}`} // Tooltip for full text
                    onClick={() => selectEntireRow(rowIndex)}
                  >
                    <span className="font-bold text-blue-600 text-lg">
                      {partWithBays.flue.name}
                    </span>
                  </td>
                  {allBays.slice(0, -1).map((bayName, colIndex) => {
                    const bay = partWithBays.rows.find(
                      (b) => b.rowName === bayName
                    );
                    const quantity = bay ? bay.quantity : 0;

                    return (
                      <td
                        key={`${partWithBays.flue.id}-${bayName}`}
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
                              const newPartsWithBays = [...bayWithRows];
                              const part = newPartsWithBays[rowIndex];
                              const bay = part.rows.find(
                                (b) => b.rowName === allBays[colIndex]
                              );

                              if (bay) {
                                bay.quantity = newQuantity;
                                setbayWithRows(newPartsWithBays);

                                updateSingleQuantity({
                                  flueid: part.flue.id,
                                  rowId: bay.rowId,
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
                            onBlur={stopEditing}
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

export default FlueCountTable;
