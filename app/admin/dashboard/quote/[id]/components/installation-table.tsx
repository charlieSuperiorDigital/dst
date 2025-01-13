import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";

const InstallationTable = () => {
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Row No.</TableHead>
            <TableHead>Bays Required</TableHead>
            <TableHead>Bays Installed</TableHead>
            <TableHead>Bays Remaining</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody></TableBody>
      </Table>
    </div>
  );
};

export default InstallationTable;
