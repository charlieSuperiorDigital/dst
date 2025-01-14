"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditPartDialog } from "./edit-part-modal";
import { PartList } from "../../../../../../entities/PartList";
import { formatCurrency } from "@/utils/format-currency";
import { Input } from "@/components/ui/input";
import { PartsDialog } from "./add-part-modal";

const initialParts: PartList[] = [
  {
    partNo: "0001",
    qty: 3,
    description: "445-312-42 Frame, boxed both legs 164/164, w/ WRR, WPP4",
    color: "Std Blue",
    unitWeight: 446.0,
    totalWeight: 0,
    unitMatLb: 2,
    unitLabor: 446.0,
    unitCost: 4.0,
    totalCost: 0.0,
    unitSell: 524.71,
    totalSell: 0.0,
    laborEA: 0.1,
  },
  {
    partNo: "0002",
    qty: 0,
    description: "335-312-42 Frame, boxed 096/096, w/WRR, WPP4",
    color: "Std Blue",
    unitWeight: 333.0,
    totalWeight: 0,
    unitMatLb: 12.2,
    unitLabor: 5,
    unitCost: 346.32,
    totalCost: 0.0,
    unitSell: 407.44,
    totalSell: 0.0,
    laborEA: 0.2,
  },
  {
    partNo: "0003",
    qty: 0,
    description: "335-240-42 DOCK Frame,NO BASE PLATES",
    color: "Std Blue",
    unitWeight: 220.0,
    totalWeight: 0,
    unitMatLb: 12.8,
    unitLabor: 10.2,
    unitCost: 220.0,
    totalCost: 0.0,
    unitSell: 258.82,
    totalSell: 0.0,
    laborEA: 0.3,
  },
  {
    partNo: "0009",
    qty: 0,
    description: "335-96 Beam, 4200 lbs cap/level",
    color: "Std Orange",
    unitWeight: 32.0,
    totalWeight: 0,
    unitMatLb: 1,
    unitLabor: 5,
    unitCost: 32.0,
    totalCost: 0.0,
    unitSell: 37.65,
    totalSell: 0.0,
    laborEA: 0.4,
  },
  {
    partNo: "0010",
    qty: 0,
    description: "445-96 Beam, 7700 lbs cap/level",
    color: "Std Orange",
    unitWeight: 39.0,
    totalWeight: 0,
    unitMatLb: 3,
    unitLabor: 30,
    unitCost: 38.61,
    totalCost: 0.0,
    unitSell: 45.42,
    totalSell: 0.0,
    laborEA: 0.5,
  },
];

export default function PartsListTable() {
  const [parts, setParts] = useState<PartList[]>(initialParts);
  const [selectedPart, setSelectedPart] = useState<PartList | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredParts = initialParts.filter((part) =>
      part.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setParts(filteredParts);
  };

  const handleRowClick = (part: PartList) => {
    setSelectedPart(part);
    setIsDialogOpen(true);
  };

  const handleSave = (updatedPart: PartList) => {
    setParts(
      parts.map((part) =>
        part.partNo === updatedPart.partNo ? updatedPart : part
      )
    );
  };

  return (
    <div className="rounded-md border">
      <div className="flex justify-between items-center p-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder="Search part..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </form>
        <PartsDialog />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Part No.</TableHead>
            <TableHead>Qty</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Color</TableHead>
            <TableHead className="text-right">Unit Weight</TableHead>
            <TableHead className="text-right">Total Weight</TableHead>
            <TableHead className="text-right">Unit Mat/lb</TableHead>
            <TableHead className="text-right">Unit Labor</TableHead>
            <TableHead className="text-right">Unit Cost</TableHead>
            <TableHead className="text-right">Total Cost</TableHead>
            <TableHead className="text-right">Unit Sell</TableHead>
            <TableHead className="text-right">Total Man Hours</TableHead>
            {/* <TableHead className="text-right">Total Sell</TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {parts.map((part) => (
            <TableRow
              key={part.partNo}
              className="cursor-pointer hover:bg-muted"
              onClick={() => handleRowClick(part)}
            >
              <TableCell className="font-medium">{part.partNo}</TableCell>
              <TableCell>{part.qty}</TableCell>
              <TableCell>{part.description}</TableCell>
              <TableCell>{part.color}</TableCell>
              <TableCell className="text-right">
                {part.unitWeight.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                {part.unitWeight * part.qty}
              </TableCell>
              <TableCell className="text-right">{part.unitMatLb}</TableCell>
              <TableCell className="text-right">{part.unitLabor}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(
                  part.unitWeight * part.unitMatLb + part.unitLabor
                )}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(
                  (part.unitWeight * part.unitMatLb + part.unitLabor) * part.qty
                )}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(part.unitSell)}
              </TableCell>
              <TableCell className="text-right">
                {(part.qty * part.laborEA).toFixed(2)}
              </TableCell>
              {/* <TableCell className="text-right">{formatCurrency(part.totalSell)}</TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <EditPartDialog
        part={selectedPart}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSave}
      />
    </div>
  );
}