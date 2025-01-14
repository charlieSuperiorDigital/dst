"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AddDayInstallationTab } from "./add-day";
import { EditDayInstallationTab } from "./edit-day";

export type RowsInstallation = {
  id: string;
  baysRequired: number;
  baysInstalled: number;
};

export type DaysInstallation = {
  id: number;
  day: string;
  date: string;
};

const initialRows: RowsInstallation[] = [
  { id: "1", baysRequired: 5, baysInstalled: 3 },
  { id: "2", baysRequired: 10, baysInstalled: 10 },
  { id: "3", baysRequired: 8, baysInstalled: 6 },
];

const InstallationTable = () => {
  const [rows, setRows] = useState<RowsInstallation[]>(initialRows);
  const [days, setDays] = useState<DaysInstallation[]>([
    { id: 1, day: "Monday", date: "2022-01-01" },
  ]);
  const [openEditDay, setOpenEditDay] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DaysInstallation | null>(null);
  const [receivedQuantities, setReceivedQuantities] = useState<{
    [key: string]: { [key: string]: number };
  }>({});

  const handleQuantityChange = (
    rowId: string,
    dayId: number,
    quantity: number
  ) => {
    setReceivedQuantities((prevQuantities) => ({
      ...prevQuantities,
      [dayId]: {
        ...prevQuantities[dayId],
        [rowId]: quantity,
      },
    }));
  };

  const calculateTotalInstalled = (rowId: string) => {
    return Object.values(receivedQuantities).reduce((total, dayQuantities) => {
      return total + (dayQuantities[rowId] || 0);
    }, 0);
  };

  const calculateBaysRemaining = (row: RowsInstallation) => {
    const totalInstalled = calculateTotalInstalled(row.id);
    return row.baysRequired - totalInstalled;
  };

  useEffect(() => {
    setRows((prevRows) =>
      prevRows.map((row) => ({
        ...row,
        baysInstalled: calculateTotalInstalled(row.id),
      }))
    );
  }, [receivedQuantities]);

  const handleAddNewDay = (day: DaysInstallation) => {
    setDays((prevDays) => [...prevDays, day]);
  };

  const handleEditOpenModal = (day: DaysInstallation) => {
    setSelectedDay(day);
    setOpenEditDay(true);
  };

  const handleEditDay = (day: DaysInstallation) => {
    console.log(day);
  };

  return (
    <div>
      <div className="flex space-x-4">
        <AddDayInstallationTab onAdd={handleAddNewDay} days={days} />
        {selectedDay && (
          <EditDayInstallationTab
            day={selectedDay}
            onEdit={handleEditDay}
            open={openEditDay}
            onOpenChange={setOpenEditDay}
          />
        )}
        <Button onClick={() => console.log("save")}>Save</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Rows No.</TableHead>
            <TableHead>Bays Required</TableHead>
            <TableHead>Bays Installed</TableHead>
            <TableHead>Bays Remaining</TableHead>
            {days.map((day) => (
              <TableHead
                key={day.id}
                onClick={() => handleEditOpenModal(day)}
                className="cursor-pointer"
              >
                Day {day.id}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} className="cursor-pointer">
              <TableCell>Row-{row.id}</TableCell>
              <TableCell>{row.baysRequired}</TableCell>
              <TableCell>{row.baysInstalled}</TableCell>
              <TableCell>{calculateBaysRemaining(row)}</TableCell>
              {days.map((day) => (
                <TableCell key={`${day.id}-${row.id}`}>
                  <Input
                    type="number"
                    value={receivedQuantities[day.id]?.[row.id] || 0}
                    onChange={(e) =>
                      handleQuantityChange(
                        row.id,
                        day.id,
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-16"
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default InstallationTable;
