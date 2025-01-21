import { debounce } from "@/utils/debounce";
import React, { useState, useCallback, useEffect } from "react";

interface RowFilterFormProps {
  onChangeFilter: (from: number, to: number, extraIds: string[]) => void;
}

export function RowFilterForm({ onChangeFilter }: RowFilterFormProps) {
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [extraIds, setExtraIds] = useState("");

  const debouncedChangeFilter = useCallback(
    debounce((f: number, t: number, e: string) => {
      const parsedExtra = e
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
      onChangeFilter(f, t, parsedExtra);
    }, 300),
    [onChangeFilter]
  );

  useEffect(() => {
    debouncedChangeFilter(from, to, extraIds);
  }, [from, to, extraIds, debouncedChangeFilter]);

  return (
    <div className="mb-4 flex gap-4">
      <div>
        <label className="block text-sm font-medium">From</label>
        <input
          type="number"
          value={from}
          onChange={(e) => setFrom(Number.parseInt(e.target.value, 10) || 0)}
          className="border p-1"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">To</label>
        <input
          type="number"
          value={to}
          onChange={(e) => setTo(Number.parseInt(e.target.value, 10) || 0)}
          className="border p-1"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">
          Extra Row IDs (comma-separated)
        </label>
        <input
          type="text"
          value={extraIds}
          onChange={(e) => setExtraIds(e.target.value)}
          className="border p-1"
        />
      </div>
    </div>
  );
}
