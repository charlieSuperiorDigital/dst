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

  return (
    <div>
      <div className="flex space-x-4">
        <AddPartReceivingTab onAdd={handleAddPart} />
        <AddLoadReceivingTab onAdd={handleLoad} loads={loads} />
        <Button onClick={() => console.log("save")}>Save</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Part No.</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Finish</TableHead>
            <TableHead>Qty Required</TableHead>
            <TableHead>Qty Ordered</TableHead>
            <TableHead>Qty Received</TableHead>
            <TableHead>Balance Due</TableHead>
            {loads.map((load) => (
              <TableHead key={load.id}>Load {load.id}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {parts.map((part) => (
            <TableRow key={part.id}>
              <TableCell>{part.id}</TableCell>
              <TableCell>{part.description}</TableCell>
              <TableCell>-</TableCell>
              <TableCell>{part.qtyRequired}</TableCell>
              <TableCell>{part.qtyOrdered}</TableCell>
              <TableCell>{calculateTotalReceived(part.id)}</TableCell>
              <TableCell>{calculateBalanceDue(part)}</TableCell>
              {loads.map((load) => (
                <TableCell key={`${part.id}-${load.id}`}>
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
