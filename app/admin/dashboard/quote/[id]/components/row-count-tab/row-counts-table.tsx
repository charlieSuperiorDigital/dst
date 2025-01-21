import React, { useState, useEffect, useMemo, useCallback } from "react";
import mockRows, { type MockRow } from "./mock-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RowFilterForm } from "./row-filter";

type Part = {
  id: number;
  description: string;
  quantity: number;
};

const getUniqueParts = (rows: MockRow[]): Part[] => {
  const seen: Record<number, Part> = {};
  rows.forEach((row) =>
    row.part.forEach((p) => {
      if (!seen[p.id]) {
        seen[p.id] = p;
      }
    })
  );
  return Object.values(seen);
};

const getPartTotal = (rows: MockRow[], partId: number): number => {
  return rows.reduce((acc, row) => {
    const found = row.part.find((p) => p.id === partId);
    return acc + (found?.quantity ?? 0);
  }, 0);
};

function filterRows(
  rows: MockRow[],
  from: number,
  to: number,
  extraIds: string[] = []
): MockRow[] {
  if (from === 0 && to === 0 && extraIds.length === 0) {
    return rows;
  }
  return rows.filter((row) => {
    const rowNumber = Number.parseInt(row.id, 10);
    return (rowNumber >= from && rowNumber <= to) || extraIds.includes(row.id);
  });
}

type Props = {
  quoteId: string;
};
export default function RowCounts({ quoteId }: Props) {
  const [rows, setRows] = useState<MockRow[]>([]);
  const [filterParams, setFilterParams] = useState({
    from: 0,
    to: 0,
    extraIds: [] as string[],
  });

  useEffect(() => {
    setRows(mockRows);
  }, []);

  const handleChangeFilter = useCallback(
    (from: number, to: number, extraIds: string[]) => {
      setFilterParams({ from, to, extraIds });
    },
    []
  );

  const filteredRows = useMemo(() => {
    return filterRows(
      rows,
      filterParams.from,
      filterParams.to,
      filterParams.extraIds
    );
  }, [rows, filterParams]);

  const uniqueParts = useMemo(
    () => getUniqueParts(filteredRows),
    [filteredRows]
  );

  return (
    <div className="overflow-x-auto p-4">
      <RowFilterForm onChangeFilter={handleChangeFilter} />
      <Table className="min-w-full bg-white border">
        <TableHeader>
          <TableRow>
            <TableHead className="border px-2 py-1">Part Name</TableHead>
            <TableHead className="border px-2 py-1">Total Qty</TableHead>
            {filteredRows.map((row) => (
              <TableHead key={row.id} className="border px-2 py-1">
                {row.name}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {uniqueParts.map((part) => (
            <TableRow key={part.id} className="border">
              <TableCell className="border px-2 py-1">
                {part.description}
              </TableCell>
              <TableCell className="border px-2 py-1">
                {getPartTotal(filteredRows, part.id)}
              </TableCell>
              {filteredRows.map((row) => {
                const found = row.part.find((p) => p.id === part.id);
                return (
                  <TableCell
                    key={`${part.id}-${row.id}`}
                    className="border px-2 py-1"
                  >
                    {found?.quantity ?? 0}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
