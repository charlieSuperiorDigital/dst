import {apiRequest} from '@/utils/client-side-api';
import React, {useState, useRef, useEffect} from 'react';
import {toast} from '@/hooks/use-toast';
import {useQuote} from '../../context/quote-context';
import {AddFrameLineDefinitonTab} from '../frameline-definition-tab/add-frameline-definition';
import {Input} from '@/components/ui/input';
import {Switch} from '@/components/ui/switch';
import {Label} from '@/components/ui/label';
import {Button} from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {Trash2} from 'lucide-react';

const sortRows = (rows: Row[]): Row[] => {
  return rows.sort((a, b) => {
    const numA = parseInt(a.rowName.replace('Row-', ''), 10);
    const numB = parseInt(b.rowName.replace('Row-', ''), 10);

    return numA - numB;
  });
};

type Row = {
  rowName: string;
  rowId: string;
  quantity: number;
};

type FrameLine = {
  id: string;
  name: string;
  quotationId: string;
};

type Bay = {
  id: string;
  name: string;
  quotationId: string;
};

type BayWithRows = {
  bay: Bay;
  rows: Row[];
};

type FrameWithRows = {
  frameline: FrameLine;
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
const FramilineCountTable = ({quoteId}: Props) => {
  const {setFrameLinesDefinitionContext, isLocked} = useQuote();
  const [bayWithRows, setbayWithRows] = useState<FrameWithRows[]>([]);
  const [bays, setBays] = useState<BayWithRows[]>([]);
  const [selectedCell, setSelectedCell] = useState({row: -1, col: -1});
  const [editingCell, setEditingCell] = useState({row: -1, col: -1});
  const [selectedRow, setSelectedRow] = useState(-1);
  const [selectedColumn, setSelectedColumn] = useState(-1);
  const tableRef = useRef<HTMLDivElement>(null);
  const activeInput = useRef<HTMLInputElement>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState({row: -1, col: -1});
  const [selectionEnd, setSelectionEnd] = useState({row: -1, col: -1});
  const [isDragging, setIsDragging] = useState(false);
  const [mousePosition, setMousePosition] = useState({x: 0, y: 0});
  const [dragSource, setDragSource] = useState<DragSource>({
    row: -1,
    col: -1,
  });
  const [dragTarget, setDragTarget] = useState({row: -1, col: -1});
  const [columnWidths, setColumnWidths] = useState<{[key: number]: number}>({});
  const [rowHeights, setRowHeights] = useState<{[key: number]: number}>({});
  const [copiedCells, setCopiedCells] = useState<string[][]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [hideZeroQuantity, setHideZeroQuantity] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [forceDelete, setForceDelete] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    rowId: string;
    rowName: string;
  }>({
    isOpen: false,
    rowId: '',
    rowName: '',
  });

  const fetchData = async () => {
    try {
      const [framelineResponse, bayResponse] = await Promise.all([
        apiRequest({
          url: `/api/count/frameline/${quoteId}`,
          method: 'get',
        }),
        apiRequest({
          url: `/api/count/bay/${quoteId}`,
          method: 'get',
        }),
      ]);

      const sortedResponse = framelineResponse.map((part) => ({
        ...part,
        rows: sortRows(part.rows),
      }));

      setbayWithRows(sortedResponse);
      setBays(bayResponse);
      setLoading(false);
    } catch (err) {
      setError('Error Loading data');
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

    const {startRow, endRow, startCol, endCol} = range;
    const copiedData: string[][] = [];

    for (let row = startRow; row <= endRow; row++) {
      const rowData: string[] = [];
      for (let col = startCol; col <= endCol; col++) {
        const bayWithRows1 = bayWithRows[row];
        const rowDataItem = bayWithRows1.rows[col];
        rowData.push(rowDataItem ? rowDataItem.quantity.toString() : '');
      }
      // Para depuración
      copiedData.push(rowData);
    }
    console.log('Celdas copiadas:', copiedData); // Para depuración
    setCopiedCells(copiedData);
    toast({
      title: 'Success',
      description: 'Cells copied successfully',
    });
    console.log('Celdas copiadas:', copiedData); // Para depuración
  };
  const pasteCopiedCells = (targetRow: number, targetCol: number) => {
    if (copiedCells.length === 0 || copiedCells[0].length === 0) {
      console.warn('No hay celdas copiadas para pegar.');
      return;
    }

    const newPartsWithBays = [...bayWithRows]; // Copia del estado actual
    const updates: {freamelineid: string; rowId: string; quantity: number}[] =
      [];
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
              freamelineid: part.frameline.id,
              rowId: bay.rowId,
              quantity: newQuantity,
            });
          }
        }
      }
    }

    // Actualizar el estado de la tabla
    console.log('Actualizando celdas:', updates); // Para depuración
    setbayWithRows(newPartsWithBays);
    // if (updateBayDefinitionContext) {
    //   updateBayDefinitionContext(newPartsWithBays);
    //   console.error("updateBayDefinitionContext is undefined");
    // }

    updateMultipleQuantities(updates);
  };
  const selectCell = (row: number, col: number) => {
    setSelectedCell({row, col});
    setSelectedRow(-1);
    setSelectedColumn(-1);
    setSelectionStart({row: -1, col: -1});
    setSelectionEnd({row: -1, col: -1});
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
      setEditingCell({row, col});
      setSelectedCell({row, col});
      setTimeout(() => {
        if (activeInput.current) {
          activeInput.current.focus();
        }
      }, 0);
    } else {
      console.warn('Intento de editar una celda fuera de los límites.');
    }
  };
  const stopEditing = () => {
    setEditingCell({row: -1, col: -1});
  };

  const isEditingCell = (row: number, col: number): boolean => {
    return editingCell.row === row && editingCell.col === col;
  };

  const handleKeyNavigation = (event: React.KeyboardEvent) => {
    if (event.ctrlKey) {
      switch (event.key.toLowerCase()) {
        case 'c': // Copy
          event.preventDefault();
          copySelectedCells();
          break;
        case 'v': // Paste
          event.preventDefault();
          if (selectedCell.row >= 0 && selectedCell.col >= 0) {
            pasteCopiedCells(selectedCell.row, selectedCell.col);
          }
          break;
        default:
          break;
      }
      return;
    }

    // Handle arrow keys in edit mode
    if (editingCell.row !== -1 && editingCell.col !== -1) {
      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowRight':
        case 'ArrowUp':
        case 'ArrowDown':
          handleArrowInEdit(
            event.key.toLowerCase().replace('arrow', '') as
              | 'up'
              | 'down'
              | 'left'
              | 'right',
            event
          );
          return;
        case 'Enter':
          event.preventDefault();
          stopEditing();
          moveToNextCell('down');
          return;
      }
    }

    // Navigation with arrow keys and Enter
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        event.preventDefault();
        moveToNextCell(
          event.key.toLowerCase().replace('arrow', '') as
            | 'up'
            | 'down'
            | 'left'
            | 'right',
          event
        );
        return;
      case 'Enter':
        event.preventDefault();
        if (editingCell.row === -1 && editingCell.col === -1) {
          startEditing(selectedCell.row, selectedCell.col);
        } else {
          stopEditing();
          moveToNextCell('down');
        }
        return;
    }
  };
  // const handleArrowInEdit = (
  //   direction: "up" | "down" | "left" | "right",
  //   event: React.KeyboardEvent
  // ) => {
  //   const input = activeInput.current;
  //   if (!input) return;

  //   const currentCellContent = partsWithBays[editingCell.row].framelines[editingCell.col]
  //     .quantity.toString();

  //   // For left/right movement, check cursor position
  //   if (direction === "left" || direction === "right") {
  //     const selectionStart = input.selectionStart || 0;
  //     const selectionEnd = input.selectionEnd || 0;
  //     const atStart = selectionStart === 0 && selectionEnd === 0;
  //     const atEnd =
  //       selectionStart === currentCellContent.length &&
  //       selectionEnd === currentCellContent.length;

  //     if (
  //       (direction === "left" && atStart) ||
  //       (direction === "right" && atEnd)
  //     ) {
  //       event.preventDefault();
  //       stopEditing();
  //       moveToNextCell(direction);
  //     }
  //   } else {
  //     // For up/down movement, always move
  //     event.preventDefault();
  //     stopEditing();
  //     moveToNextCell(direction);
  //   }
  // };
  const getSelectionRange = (): SelectionRange | null => {
    if (selectionStart.row === -1 || selectionEnd.row === -1) return null;

    const startRow = Math.min(selectionStart.row, selectionEnd.row);
    const endRow = Math.max(selectionStart.row, selectionEnd.row);
    const startCol = Math.min(selectionStart.col, selectionEnd.col);
    const endCol = Math.max(selectionStart.col, selectionEnd.col);

    return {startRow, endRow, startCol, endCol};
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
    setSelectionStart({row, col});
    setSelectionEnd({row, col});

    setSelectedRow(-1);
    setSelectedColumn(-1);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const updateSelection = (
    event: React.MouseEvent,
    row: number,
    col: number
  ) => {
    if (!isSelecting) return;

    setSelectionEnd({row, col});
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!event.ctrlKey) {
      endSelection();
      return;
    }

    const element = document.elementFromPoint(event.clientX, event.clientY);
    if (!element) return;

    const cell = element.closest('td');
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
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const getSelectionStyle = () => {
    const range = getSelectionRange();
    if (!range) return {};

    const table = tableRef.current?.querySelector('table');
    if (!table) return {};

    // Check if rows exist
    if (!table.rows[range.startRow + 1] || !table.rows[range.endRow + 1])
      return {};

    const startCell = table.rows[range.startRow + 1]?.cells[range.startCol + 1];
    const endCell = table.rows[range.endRow + 1]?.cells[range.endCol + 1];

    // Check if cells exist
    if (!startCell || !endCell) return {};

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
    if (!dragSource) return 'Moving cell';

    // Verificar si dragSource tiene selectionRange
    if (dragSource.selectionRange) {
      const range = dragSource.selectionRange;
      const cellCount =
        (range.endRow - range.startRow + 1) *
        (range.endCol - range.startCol + 1);
      return `Moving ${cellCount} cells`;
    }

    // Si no hay selectionRange, mostrar el contenido de la celda
    const {row, col} = dragSource;
    if (
      row >= 0 &&
      col >= 0 &&
      row < bayWithRows.length &&
      col < allBays.length
    ) {
      const part = bayWithRows[row];
      const bay = part.rows[col];
      return bay ? bay.quantity.toString() : 'Moving cell';
    }

    return 'Moving cell';
  };

  const handleDragStart = (
    event: React.DragEvent,
    row: number,
    col: number
  ) => {
    if (!event.dataTransfer) return;

    setIsDragging(true);
    setMousePosition({x: event.clientX, y: event.clientY});

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({x: e.clientX, y: e.clientY});
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener(
      'dragend',
      () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', handleMouseMove);
      },
      {once: true}
    );

    const range = getSelectionRange();
    if (range && isInSelectionRange(row, col)) {
      setDragSource({row, col, selectionRange: range});
      const dragEl = document.createElement('div');
      dragEl.style.padding = '8px';
      dragEl.style.background = 'white';
      dragEl.style.border = '1px solid #ccc';
      dragEl.style.borderRadius = '4px';
      dragEl.style.position = 'absolute';
      dragEl.style.top = '-1000px';
      dragEl.textContent = `Moving ${
        (range.endRow - range.startRow + 1) *
        (range.endCol - range.startCol + 1)
      } cells`;
      document.body.appendChild(dragEl);
      event.dataTransfer.setDragImage(dragEl, 0, 0);
      setTimeout(() => document.body.removeChild(dragEl), 0);
    } else {
      setDragSource({row, col});
      const part = bayWithRows[row];
      const bay = part.rows[col];
      const content = bay ? bay.quantity.toString() : '';
      event.dataTransfer.setData('text/plain', content);
      const dragEl = document.createElement('div');
      dragEl.textContent = content || 'Moving cell';
      dragEl.style.padding = '8px';
      dragEl.style.background = 'white';
      dragEl.style.border = '1px solid #ccc';
      dragEl.style.borderRadius = '4px';
      dragEl.style.position = 'absolute';
      dragEl.style.top = '-1000px';
      document.body.appendChild(dragEl);
      event.dataTransfer.setDragImage(dragEl, 0, 0);
      setTimeout(() => document.body.removeChild(dragEl), 0);
    }

    event.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (event: React.DragEvent, row: number, col: number) => {
    event.preventDefault();
    setDragTarget({row, col});
    setMousePosition({x: event.clientX, y: event.clientY});
  };

  const handleDragLeave = (
    event: React.DragEvent,
    row: number,
    col: number
  ) => {
    if (dragTarget.row === row && dragTarget.col === col) {
      setDragTarget({row: -1, col: -1});
    }
  };

  const handleDrop = (
    event: React.DragEvent,
    targetRow: number,
    targetCol: number
  ) => {
    event.preventDefault();

    if (!dragSource) return;

    if ('selectionRange' in dragSource && dragSource.selectionRange) {
      const range = dragSource.selectionRange;
      const rowOffset = targetRow - dragSource.row;
      const colOffset = targetCol - dragSource.col;

      const newPartsWithBays = [...bayWithRows];
      const updates: {
        freamelineid: string;
        rowId: string;
        quantity: number;
      }[] = [];

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
              updates.push({
                freamelineid: targetPart.frameline.id,
                rowId: targetBay.rowId,
                quantity: sourceBay.quantity,
              });
            }
          }
        }
      }

      setbayWithRows(newPartsWithBays);
      if (updates.length > 0) {
        updateMultipleQuantities(updates);
      }
    } else {
      const {row: sourceRow, col: sourceCol} = dragSource;

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
          setbayWithRows(newPartsWithBays);

          updateSingleQuantity({
            freamelineid: targetPart.frameline.id,
            rowId: targetBay.rowId,
            quantity: sourceBay.quantity,
          });
        }
      }
    }

    setDragSource({row: -1, col: -1});
    setDragTarget({row: -1, col: -1});
  };

  const isDragOver = (row: number, col: number): boolean => {
    return dragTarget.row === row && dragTarget.col === col;
  };

  const getColumnStyle = (colIndex: number) => {
    const width = columnWidths[colIndex];
    return width ? {width: `${width}px`} : {};
  };

  const getRowStyle = (rowIndex: number) => {
    const height = rowHeights[rowIndex];
    return height ? {height: `${height}px`} : {};
  };

  const startColumnResize = (event: React.MouseEvent, colIndex: number) => {
    if (event.button !== 0 || event.detail > 1) return;

    event.preventDefault();
    const table = tableRef.current?.querySelector('table');
    if (!table) return;

    const cell = table.rows[0].cells[colIndex + 1];
    const initialSize = cell.offsetWidth;
    const initialMousePos = event.clientX;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - initialMousePos;
      const newSize = Math.max(20, initialSize + delta);
      setColumnWidths((prev) => ({...prev, [colIndex]: newSize}));
    };

    const stopResize = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', stopResize);
      table.classList.remove('resizing');
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResize);

    table.classList.add('resizing');
  };

  const startRowResize = (event: React.MouseEvent, rowIndex: number) => {
    event.preventDefault();
    const table = tableRef.current?.querySelector('table');
    if (!table) return;

    const row = table.rows[rowIndex + 1];
    const initialSize = row.offsetHeight;
    const initialMousePos = event.clientY;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientY - initialMousePos;
      const newSize = Math.max(20, initialSize + delta);
      setRowHeights((prev) => ({...prev, [rowIndex]: newSize}));
    };

    const stopResize = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', stopResize);
      table.classList.remove('resizing');
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResize);

    table.classList.add('resizing');
  };

  const autoSizeColumn = (colIndex: number) => {
    const measureSpan = document.createElement('span');
    measureSpan.style.visibility = 'hidden';
    measureSpan.style.position = 'absolute';
    measureSpan.style.whiteSpace = 'nowrap';
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

    setColumnWidths((prev) => ({...prev, [colIndex]: maxWidth}));
  };

  const isColumnSelected = (col: number): boolean => {
    return selectedColumn === col;
  };

  const isRowSelected = (row: number): boolean => {
    return selectedRow === row;
  };

  const selectEntireRow = (row: number) => {
    setSelectedRow(row);
    setSelectedCell({row: -1, col: -1});
  };
  const moveToNextCell = (
    direction: 'up' | 'down' | 'left' | 'right',
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
      case 'up':
        newRow = Math.max(0, currentRow - 1);
        break;
      case 'down':
        newRow = Math.min(bayWithRows.length - 1, currentRow + 1);
        break;
      case 'left':
        newCol = Math.max(0, currentCol - 1);
        break;
      case 'right':
        newCol = Math.min(allBays.length - 1, currentCol + 1);
        break;
    }

    if (editingCell.row !== -1) {
      const isHorizontalMove = direction === 'left' || direction === 'right';

      if (isHorizontalMove) {
        const input = activeInput.current;
        if (!input) return;

        const atStart = input.selectionStart === 0 && input.selectionEnd === 0;
        const atEnd =
          input.selectionStart === input.value.length &&
          input.selectionEnd === input.value.length;

        if (
          (direction === 'left' && atStart) ||
          (direction === 'right' && atEnd)
        ) {
          stopEditing();
          selectCell(newRow, newCol);
          startEditing(newRow, newCol);
          return;
        }
      }

      stopEditing();
      selectCell(newRow, newCol);
      startEditing(newRow, newCol);
    } else {
      selectCell(newRow, newCol);
    }
  };

  const autoSizeRow = (rowIndex: number) => {
    const table = tableRef.current?.querySelector('table');
    if (!table) return;

    const cells = Array.from(table.rows[rowIndex + 1].cells);

    let maxHeight = 40;
    cells.forEach((cell) => {
      const content = cell.querySelector('.cell-content');
      if (content) {
        const temp = document.createElement('div');
        temp.style.position = 'absolute';
        temp.style.visibility = 'hidden';
        temp.style.width = cell.offsetWidth + 'px';
        temp.style.whiteSpace = 'normal';
        temp.innerHTML = content.innerHTML;
        document.body.appendChild(temp);

        const contentHeight = temp.offsetHeight;
        maxHeight = Math.max(maxHeight, contentHeight + 16);

        document.body.removeChild(temp);
      }
    });

    setRowHeights((prev) => ({...prev, [rowIndex]: maxHeight}));
  };

  const handleEnterKey = (rowIndex: number) => {
    // Mover a la siguiente fila al presionar Enter
    moveToNextCell('down');
  };

  const handleArrowInEdit = (
    direction: 'up' | 'down' | 'left' | 'right',
    event: React.KeyboardEvent
  ) => {
    const input = activeInput.current;
    if (!input) return;

    const currentCellContent =
      bayWithRows[editingCell.row].rows[editingCell.col].quantity.toString();

    // Para movimiento izquierda/derecha, verificar la posición del cursor
    if (direction === 'left') {
      // Solo mover a la celda anterior si el cursor está al inicio
      if (input.selectionStart === 0 && input.selectionEnd === 0) {
        moveToNextCell(direction, event);
      }
    } else if (direction === 'right') {
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
    updates: {freamelineid: string; rowId: string; quantity: number}[]
  ) => {
    try {
      console.log(updates);
      const results = await Promise.allSettled(
        updates.map((update) =>
          apiRequest({
            url: `/api/row/frameline/update`,
            method: 'put',
            data: update,
          })
        )
      );

      const successfulUpdates: {
        freamelineid: string;
        rowId: string;
        quantity: number;
      }[] = [];
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successfulUpdates.push(updates[index]);
        } else {
          console.error('Error updating quantity:', result.reason);
          toast({
            title: 'Error',
            description: `Failed to update quantity for part ${updates[index].freamelineid} and bay ${updates[index].rowId}.`,
            variant: 'destructive',
          });
        }
      });

      if (successfulUpdates.length > 0) {
        setbayWithRows((prevPartsWithBays) =>
          prevPartsWithBays.map((partWithBays) => {
            const updatedBays = partWithBays.rows.map((bay) => {
              const update = successfulUpdates.find(
                (u) =>
                  u.freamelineid === partWithBays.frameline.id &&
                  u.freamelineid === bay.rowId
              );
              return update ? {...bay, quantity: update.quantity} : bay;
            });
            return {...partWithBays, bays: updatedBays};
          })
        );
        setFrameLinesDefinitionContext?.((prevPartsWithBays) =>
          prevPartsWithBays.map((partWithBays) => {
            const updatedBays = partWithBays.framelines.map((bay) => {
              const update = successfulUpdates.find(
                (u) =>
                  u.freamelineid === partWithBays.part.id &&
                  u.freamelineid === bay.framelineId
              );
              return update ? {...bay, quantity: update.quantity} : bay;
            });
            return {...partWithBays, bays: updatedBays};
          })
        );

        toast({
          title: 'Success',
          description: 'Quantities updated successfully',
        });
      }
    } catch (error) {
      console.error('Error updating quantities:', error);
      toast({
        title: 'Error',
        description: 'Failed to update quantities. Please try again.',
        variant: 'destructive',
      });
    }
  };
  const updateSingleQuantity = async (update: {
    freamelineid: string;
    rowId: string;
    quantity: number;
  }) => {
    try {
      // Send a single request to update the quantity
      await apiRequest({
        url: `/api/row/frameline/update`,
        method: 'put',
        data: update,
      });

      // If the request is successful, update the local state
      setbayWithRows((prevPartsWithBays) =>
        prevPartsWithBays.map((partWithBays) => {
          const updatedBays = partWithBays.rows.map((bay) => {
            if (
              bay.rowId === update.freamelineid &&
              partWithBays.frameline.id === update.freamelineid
            ) {
              return {...bay, quantity: update.quantity}; // Update the quantity
            }
            return bay; // Return the unchanged bay
          });
          return {...partWithBays, bays: updatedBays}; // Return the updated part
        })
      );
      setFrameLinesDefinitionContext?.((prevPartsWithBays) =>
        prevPartsWithBays.map((partWithBays) => {
          const updatedBays = partWithBays.framelines.map((bay) => {
            if (
              bay.framelineId === update.freamelineid &&
              partWithBays.part.id === update.freamelineid
            ) {
              return {...bay, quantity: update.quantity}; // Update the quantity
            }
            return bay; // Return the unchanged bay
          });
          return {...partWithBays, bays: updatedBays}; // Return the updated part
        })
      );

      // Show a success toast
      toast({
        title: 'Success',
        description: 'Quantity updated successfully',
      });
    } catch (error) {
      console.error('Error updating quantity:', error);
      // Show an error toast
      toast({
        title: 'Error',
        description: 'Failed to update quantity. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const calculateTotalQuantity = (partWithBays: FrameWithRows): number => {
    return partWithBays.rows.reduce((total, bay) => total + bay.quantity, 0);
  };

  const handleAddFrameline = async (value) => {
    try {
      const response = await apiRequest({
        url: `/api/definition/frameline/${value.name}/${quoteId}`,
        method: 'post',
      });

      const newFrame = {id: response, name: value.name, quotationId: quoteId};
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
        {frameline: newFrame, rows: newRows},
      ]);

      setFrameLinesDefinitionContext?.((prevState) =>
        prevState.map((partWithBays) => ({
          ...partWithBays,
          framelines: [
            ...partWithBays.framelines,
            {framelineName: value.name, framelineId: response, quantity: 0},
          ],
        }))
      );

      toast({
        title: 'Success',
        description: 'Frameline added successfully',
      });
    } catch (error) {
      console.error('Error adding Frameline:', error);
      toast({
        title: 'Error',
        description: 'Failed to add frameline. Please try again.',
        variant: 'destructive',
      });
    }
  };
  const filteredBayWithRows = bayWithRows.filter((partWithBays) => {
    // Filtrar por término de búsqueda
    const matchesSearch = partWithBays.frameline.name
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
  const debounceUpdate = (update: {
    freamelineid: string;
    rowId: string;
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

  // Forzar la ejecución del debounce en onBlur
  const handleBlur = () => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current); // Cancelar el debounce
      const update = {
        freamelineid: bayWithRows[editingCell.row].frameline.id,
        rowId: bayWithRows[editingCell.row].rows[editingCell.col].rowId,
        quantity: bayWithRows[editingCell.row].rows[editingCell.col].quantity,
      };
      updateSingleQuantity(update); // Forzar la actualización
    }
    stopEditing();
  };

  const handleDeleteRow = async (rowId: string) => {
    try {
      await apiRequest({
        url: `/api/row/del/${rowId}`,
        method: 'delete',
      });

      // Update all framelines to remove this row
      setbayWithRows((prev) =>
        prev.map((frameline) => ({
          ...frameline,
          rows: frameline.rows.filter((r) => r.rowId !== rowId),
        }))
      );

      toast({
        title: 'Success',
        description: 'Row Deleted',
      });
      setDeleteConfirmation({isOpen: false, rowId: '', rowName: ''});
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  // Add this function to sum the total quantity for a bay (column) across all framelines
  const sumFramelineQuantitiesForColumn = (
    bayName: string,
    framelines: FrameWithRows[]
  ): number => {
    const total = framelines.reduce((sum, frameline) => {
      const row = frameline.rows.find((row) => row.rowName === bayName);
      return sum + (row ? row.quantity : 0);
    }, 0);
    return total;
  };

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
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="hide-zero"
              checked={hideZeroQuantity}
              onCheckedChange={setHideZeroQuantity}
            />
            <Label htmlFor="hide-zero">Hide zero quantity</Label>
          </div>
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
        {!isLocked && <AddFrameLineDefinitonTab onAdd={handleAddFrameline} />}
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
            {/* Add a row to show the total framelines for each bay (column) */}
            <tr>
              <th className="border border-gray-300 p-2 font-bold text-left w-[350px] sticky left-0 bg-white z-20">
                Total Framelines
              </th>
              <th className="border border-gray-300 p-2 font-bold text-center sticky left-[350px] bg-white z-20"></th>
              {allBays.map((bayName, colIndex) => (
                <th
                  key={colIndex}
                  className="border border-gray-300 p-2 font-bold text-center bg-white z-20"
                >
                  {sumFramelineQuantitiesForColumn(bayName, bayWithRows)}
                </th>
              ))}
            </tr>
            {/* Existing Total Bays row */}
            <tr>
              <th className="border border-gray-300 p-2 font-bold text-left w-[350px] sticky left-0 bg-white z-20">
                Total Bays
              </th>
              <th className="border border-gray-300 p-2 font-bold text-center sticky left-[350px] bg-white z-20"></th>
              {allBays.map((bayName, colIndex) => {
                // Sum for this column, only for filtered (visible) framelines
                const colTotal = bays.reduce((sum, part) => {
                  const bay = part.rows.find((b) => b.rowName === bayName);
                  return sum + (bay ? bay.quantity : 0);
                }, 0);
                return (
                  <th
                    key={colIndex}
                    className="border border-gray-300 p-2 font-bold text-center bg-white z-20"
                  >
                    {colTotal}
                  </th>
                );
              })}
            </tr>
            <tr>
              <th className="border border-gray-300 p-2 font-bold text-left w-[350px] sticky left-0 bg-white z-20">
                Frameline
              </th>
              <th className="border border-gray-300 p-2 font-bold text-center sticky left-[350px] bg-white z-20">
                Total
              </th>
              {allBays.map((bayName, colIndex) => (
                <th
                  key={colIndex}
                  className={`border border-gray-300 p-2 font-bold text-center cursor-pointer relative ${
                    isColumnSelected(colIndex) ? 'bg-blue-100' : 'bg-gray-100'
                  }`}
                  style={{minWidth: '100px', ...getColumnStyle(colIndex)}}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex-1">{bayName}</span>
                    {!isLocked && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          const row = bayWithRows[0]?.rows.find(
                            (r) => r.rowName === bayName
                          );
                          if (!row) return;

                          if (forceDelete) {
                            handleDeleteRow(row.rowId);
                          } else {
                            setDeleteConfirmation({
                              isOpen: true,
                              rowId: row.rowId,
                              rowName: row.rowName,
                            });
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
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
            </tr>
          </thead>
          <tbody>
            {filteredBayWithRows.map((partWithBays, rowIndex) => {
              const totalQuantity = calculateTotalQuantity(partWithBays);
              return (
                <tr key={partWithBays.frameline.id}>
                  <td
                    className={`border w-[350px] border-gray-300 p-2 text-left cursor-pointer sticky left-0 bg-white z-10 flex items-center ${
                      isRowSelected(rowIndex) ? 'bg-blue-100' : 'bg-gray-100'
                    }`}
                    style={{
                      height: '60px',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                    }}
                    title={`${partWithBays.frameline.name}`}
                    onClick={() => selectEntireRow(rowIndex)}
                  >
                    <span className="font-bold text-blue-600 text-lg">
                      {partWithBays.frameline.name}
                    </span>
                  </td>
                  <td className="border border-gray-300 p-2 text-center sticky left-[350px] bg-white z-10">
                    {totalQuantity}
                  </td>
                  {allBays.map((bayName, colIndex) => {
                    const bay = partWithBays.rows.find(
                      (b) => b.rowName === bayName
                    );
                    const quantity = bay ? bay.quantity : 0;

                    return (
                      <td
                        key={`${partWithBays.frameline.id}-${bayName}`}
                        className={`
                          border border-gray-300 p-2 text-center cursor-move relative
                          ${
                            isSelectedCell(rowIndex, colIndex) ||
                            isInSelectionRange(rowIndex, colIndex)
                              ? 'bg-blue-50 outline outline-2 outline-blue-500'
                              : ''
                          }
                          ${isRowSelected(rowIndex) ? 'bg-blue-50' : ''}
                          ${isColumnSelected(colIndex) ? 'bg-blue-50' : ''}
                          ${
                            isDragOver(rowIndex, colIndex)
                              ? 'bg-green-100 outline-dashed outline-2 outline-green-500'
                              : ''
                          }
                        `}
                        style={{
                          minWidth: '100px',
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

                                debounceUpdate({
                                  freamelineid: part.frameline.id,
                                  rowId: bay.rowId,
                                  quantity: newQuantity,
                                });
                              } else {
                                console.error(
                                  'Bay not found for the given row and column.'
                                );
                                toast({
                                  title: 'Error',
                                  description:
                                    'Bay not found. Please try again.',
                                  variant: 'destructive',
                                });
                              }
                            }}
                            onBlur={handleBlur}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                stopEditing();
                                moveToNextCell('down');
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog
        open={deleteConfirmation.isOpen}
        onOpenChange={(open) =>
          setDeleteConfirmation({isOpen: open, rowId: '', rowName: ''})
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
                setDeleteConfirmation({isOpen: false, rowId: '', rowName: ''})
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

export default FramilineCountTable;
