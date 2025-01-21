import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { AddPartReceivingTab } from "./add-part";
import { AddLoadReceivingTab } from "./add-load";
import { PartRecieve } from "@/app/entities/PartRecieve";
import { Load } from "@/app/entities/Load";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EditLoadReceivingTab } from "./edit-load";
import { EditPartReceivingTab } from "./edit-part";

const initialParts: PartRecieve[] = [
  {
    id: "0001",
    qtyRequired: 3,
    qtyOrdered: 3,
    qtyReceived: 3,
    description: "445-312-42 Frame, boxed both legs 164/164, w/ WRR, WPP4",
  },
  {
    id: "0002",
    qtyRequired: 3,
    qtyOrdered: 3,
    qtyReceived: 3,
    description: "335-312-42 Frame, boxed 096/096, w/WRR, WPP4",
  },
  {
    id: "0003",
    qtyRequired: 3,
    qtyOrdered: 3,
    qtyReceived: 3,
    description: "335-240-42 DOCK Frame,NO BASE PLATES",
  },
  {
    id: "0009",
    qtyRequired: 3,
    qtyOrdered: 3,
    qtyReceived: 3,
    description: "335-96 Beam, 4200 lbs cap/level",
  },
  {
    id: "0010",
    qtyRequired: 3,
    qtyOrdered: 3,
    qtyReceived: 3,
    description: "445-96 Beam, 7700 lbs cap/level",
  },
];

const ReceivingTable = () => {
  const [parts, setParts] = useState<PartRecieve[]>(initialParts);
  const [loads, setLoads] = useState<Load[]>([
    {
      id: 1,
      bol: "BOL001",
      carrier: "Carrier A",
      date: new Date("2025-01-01"),
    },
  ]);
  const [receivedQuantities, setReceivedQuantities] = useState<{
    [key: string]: { [key: string]: number };
  }>({});
  const [loadToEdit, setLoadToEdit] = useState<Load | null>(null);
  const [partToEdit, setPartToEdit] = useState<PartRecieve | null>(null);
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false);
  const [isPartDialogOpen, setIsPartDialogOpen] = useState(false);

  const handleAddPart = (part: PartRecieve) => {
    setParts((prevParts) => [...prevParts, part]);
  };

  const handleLoad = (load: Load) => {
    setLoads((prevLoads) => [...prevLoads, load]);
    setReceivedQuantities((prevQuantities) => ({
      ...prevQuantities,
      [load.id]: {},
    }));
  };

  const handleQuantityChange = (
    partId: string,
    loadId: number,
    quantity: number
  ) => {
    setReceivedQuantities((prevQuantities) => ({
      ...prevQuantities,
      [loadId]: {
        ...prevQuantities[loadId],
        [partId]: quantity,
      },
    }));
  };

  const calculateTotalReceived = (partId: string) => {
    return Object.values(receivedQuantities).reduce((total, loadQuantities) => {
      return total + (loadQuantities[partId] || 0);
    }, 0);
  };

  const calculateBalanceDue = (part: PartRecieve) => {
    const totalReceived = calculateTotalReceived(part.id);
    return part.qtyOrdered - totalReceived;
  };

  const handleLoadToEdit = (load: Load) => {
    console.log(load);
    setLoadToEdit(load);
  };

  const handleOpenModal = (load: Load) => {
    console.log(load);
    setLoadToEdit(load);
    setIsLoadDialogOpen(true);
  };
  const handleDelete = (load: Load) => {
    console.log("delete", load);
  };

  const handleOpenEditPart = (part: PartRecieve) => {
    console.log(part);
    setPartToEdit(part);
    setIsPartDialogOpen(true);
  };
  const handleEditPart = (part: PartRecieve) => {
    console.log(part);
  };
  const deletePart = (part: PartRecieve) => {
    console.log(part);
  };

  return (
    <div>
      <div className="flex space-x-4">
        <AddPartReceivingTab onAdd={handleAddPart} />
        <AddLoadReceivingTab onAdd={handleLoad} loads={loads} />
        {loadToEdit && (
          <EditLoadReceivingTab
            onEdit={handleLoadToEdit}
            load={loadToEdit}
            open={isLoadDialogOpen}
            onOpenChange={setIsLoadDialogOpen}
            onDelete={handleDelete}
          />
        )}
        {partToEdit && (
          <EditPartReceivingTab
            open={isPartDialogOpen}
            onOpenChange={setIsPartDialogOpen}
            partToEdit={partToEdit}
            onEdit={handleEditPart}
            onDelete={deletePart}
          />
        )}
        <Button onClick={() => console.log("save")}>Save</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px] border">Part No.</TableHead>
            <TableHead className="border">Description</TableHead>
            <TableHead className="border">Finish</TableHead>
            <TableHead className="border">Qty Required</TableHead>
            <TableHead className="border">Qty Ordered</TableHead>
            <TableHead className="border">Qty Received</TableHead>
            <TableHead className="border">Balance Due</TableHead>
            {loads.map((load) => (
              <TableHead
                key={load.id}
                onClick={() => handleOpenModal(load)}
                className="cursor-pointer border"
              >
                Load {load.id}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {parts.map((part) => (
            <TableRow key={part.id} className="cursor-pointer border">
              <TableCell className="border">{part.id}</TableCell>
              <TableCell
                onClick={() => handleOpenEditPart(part)}
                className="border"
              >
                {part.description}
              </TableCell>
              <TableCell className="border">-</TableCell>
              <TableCell className="border">{part.qtyRequired}</TableCell>
              <TableCell className="border">{part.qtyOrdered}</TableCell>
              <TableCell className="border">
                {calculateTotalReceived(part.id)}
              </TableCell>
              <TableCell className="border">
                {calculateBalanceDue(part)}
              </TableCell>
              {loads.map((load) => (
                <TableCell key={`${part.id}-${load.id}`} className="border">
                  <Input
                    type="number"
                    value={receivedQuantities[load.id]?.[part.id] || 0}
                    onChange={(e) =>
                      handleQuantityChange(
                        part.id,
                        load.id,
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

export default ReceivingTable;
