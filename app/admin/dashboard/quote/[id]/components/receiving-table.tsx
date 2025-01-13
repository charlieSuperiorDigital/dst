import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";

const ReceivingTable = () => {
  return (
    <div>
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
          </TableRow>
        </TableHeader>
        <TableBody></TableBody>
      </Table>
    </div>
  );
};

export default ReceivingTable;
