"use client";

import React, { useState } from "react";
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
import { Part } from "@/app/entities/Part";
import { AddBayDefinitonTab } from "./add-bay-definition";
import { EditBayDefinitionTab } from "./edit-bay-definition";
import { apiRequest } from "@/utils/client-side-api";

const initialParts: Part[] = [
  {
    id: "1",
    partNumber: "445-312-42",
    description: "445-312-42 Frame, boxed both legs 164/164, w/ WRR, WPP4",
    colorId: 1,
    color: {
      id: 1,
      name: "Std Blue",
      description: "blue",
    },
    unitWeight: 446.0,
    unitMatLb: 2,
    unitLabor: 446.0,
    unitCost: 4.0,
    unitSell: 524.71,
    laborEA: 0.1,
  },
  {
    id: "3",
    partNumber: "823-124-18",
    description: "823-124-18 Frame, single leg, w/ WRR, WPP3",
    colorId: 2,
    color: {
      id: 2,
      name: "Bright Red",
      description: "red",
    },
    unitWeight: 385.5,
    unitMatLb: 1.8,
    unitLabor: 385.5,
    unitCost: 3.5,
    unitSell: 462.99,
    laborEA: 0.12,
  },
  {
    id: "33",
    partNumber: "912-812-78",
    description: "912-812-78 Frame, boxed triple legs 200/200, w/ WRR, WPP5",
    colorId: 3,
    color: {
      id: 3,
      name: "Matte Black",
      description: "black",
    },
    unitWeight: 512.3,
    unitMatLb: 2.5,
    unitLabor: 512.3,
    unitCost: 5.0,
    unitSell: 605.42,
    laborEA: 0.15,
  },
  {
    id: "4",
    partNumber: "645-928-31",
    description: "645-928-31 Frame, boxed dual legs 150/150, w/ WRR, WPP2",
    colorId: 4,
    color: {
      id: 4,
      name: "Gloss White",
      description: "white",
    },
    unitWeight: 420.0,
    unitMatLb: 2.2,
    unitLabor: 420.0,
    unitCost: 4.2,
    unitSell: 498.35,
    laborEA: 0.11,
  },
  {
    id: "5",
    partNumber: "322-675-90",
    description: "322-675-90 Frame, single leg, w/ WRR, WPP1",
    colorId: 5,
    color: {
      id: 5,
      name: "Forest Green",
      description: "green",
    },
    unitWeight: 310.8,
    unitMatLb: 1.5,
    unitLabor: 310.8,
    unitCost: 3.0,
    unitSell: 378.22,
    laborEA: 0.08,
  },
];

export type BayDefinition = {
  id: number;
  name: string;
};
// const bayDefinition = [{ id: 1, name: "Bay 1" }];

const BayDefinitionTable = () => {
  const [parts] = useState<Part[]>(initialParts);
  const [selectedBayDefinition, setSelecetedBayDefinition] =
    useState<BayDefinition | null>(null);
  const [isEditDefinitionOpen, setIsEditDefinitionOpen] = useState(false);
  const [baysDefinition, setBaysDefinition] = useState<BayDefinition[]>([
    { id: 1, name: "test-bay" },
  ]);
  const [quantities, setQuantities] = useState<{
    [key: number]: { [key: number]: number };
  }>({});

  const handleQuantityChange = (
    partId: string,
    bayId: number,
    quantity: number
  ) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [partId]: {
        ...prevQuantities[partId],
        [bayId]: quantity,
      },
    }));
  };
  const handleAddBay = async (value) => {
    try {
      const response = await apiRequest({
        url: `/api/definition/bay/${value.name}`,
        method: "post",
      });
      const bayToAdd = {
        id: response,
        name: value.name,
      };
      setBaysDefinition((prevBays) => [...prevBays, bayToAdd]);
    } catch (err) {
      console.log(err);
    }
  };

  const handleUpdateBay = (value) => {
    console.log("Updated Bay:", value);

    setBaysDefinition((prevBays) =>
      prevBays.map((bay) => (bay.id === value.id ? value : bay))
    );
  };
  const handleDeleteBay = (bay) => {
    setBaysDefinition((prevBays) => prevBays.filter((b) => b.id !== bay.id));
  };

  const handleOpenUpdateModal = (bay) => {
    console.log("Selected Bay:", bay);
    setSelecetedBayDefinition(bay);
    setIsEditDefinitionOpen(true);
  };

  const handleSave = async () => {
    const result = baysDefinition.map((bay) => ({
      id: bay.id,
      bayName: bay.name,
      parts: parts.map((part) => ({
        partid: part.id,
        id: bay.id,
        quantity: quantities[part.id]?.[bay.id] || 0,
      })),
    }));

    console.log("Formatted Data:", result);

    try {
      for (const bay of result) {
        for (const part of bay.parts) {
          const existingPart = await apiRequest({
            url: `/api/part/${part.partid}`,
            method: "get",
          });

          if (existingPart) {
            // Update existing part
            await apiRequest({
              url: `/api/part/${part.partid}`,
              method: "put",
              data: {
                id: part.id,
                quantity: part.quantity,
              },
            });
          } else {
            // Create new part
            await apiRequest({
              url: `/api/part`,
              method: "post",
              data: {
                partid: part.partid,
                id: part.id,
                quantity: part.quantity,
              },
            });
          }
        }
      }
      console.log("Parts saved successfully");
    } catch (error) {
      console.log("Failed to save parts", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex align-center space-x-4">
        <AddBayDefinitonTab onAdd={handleAddBay} />
        {selectedBayDefinition && (
          <EditBayDefinitionTab
            bay={selectedBayDefinition}
            onDelete={handleDeleteBay}
            onEdit={handleUpdateBay}
            open={isEditDefinitionOpen}
            onOpenChange={setIsEditDefinitionOpen}
          />
        )}
        <Button onClick={handleSave} className="mb-4">
          Save
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] border">Part No.</TableHead>
              <TableHead className="border">Description</TableHead>
              <TableHead className="border">Finish</TableHead>
              {baysDefinition.map((bay, index) => (
                <TableHead
                  key={index}
                  className="text-center border"
                  onClick={() => handleOpenUpdateModal(bay)}
                >
                  {bay.name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {parts.map((part) => (
              <TableRow key={part.id} className="border">
                <TableCell className="border">{part.id}</TableCell>
                <TableCell className="border">{part.description}</TableCell>
                <TableCell className="border">{part.color.name}</TableCell>
                {baysDefinition.map((bay) => (
                  <TableCell
                    key={`${bay.id}-${part.id}`}
                    className="text-center border"
                  >
                    <Input
                      type="number"
                      value={quantities[part.id]?.[bay.id] || ""}
                      onChange={(e) =>
                        handleQuantityChange(
                          part.id,
                          bay.id,
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-16 mx-auto"
                      min="0"
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BayDefinitionTable;
