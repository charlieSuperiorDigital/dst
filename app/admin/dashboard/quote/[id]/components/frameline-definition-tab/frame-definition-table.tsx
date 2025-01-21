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
import { AddFrameLineDefinitonTab } from "./add-frameline-definition";
import { EditBayDefinitionTab } from "./edit-frame-definition";
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
    id: "2",
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
    id: "3",
    partNumber: "111-11",
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
    partNumber: "13123-123",
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

export type FrameLineDefinition = {
  id: number;
  name: string;
};

const FrameLineDefinitionTable = () => {
  const [parts] = useState<Part[]>(initialParts);
  const [selectedFrameLineDefinition, setSelecetedFrameDefinition] =
    useState<FrameLineDefinition | null>(null);
  const [isEditDefinitionOpen, setIsEditDefinitionOpen] = useState(false);
  const [framelinesDefinition, setFramelinesDefinition] = useState<
    FrameLineDefinition[]
  >([]);
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
  const handleAddFramelineDef = async (value) => {
    try {
      const response = await apiRequest({
        url: `/api/definition/frameLine/${value.name.trim()}`,
        method: "post",
      });
      const bayToAdd = {
        id: response,
        name: value.name,
      };
      setFramelinesDefinition((prevBays) => [...prevBays, bayToAdd]);
    } catch (err) {
      console.log(err);
    }
  };

  const handleUpdateBay = (value) => {
    setFramelinesDefinition((prevFrame) =>
      prevFrame.map((frame) => (frame.id === value.id ? value : frame))
    );
  };
  const handleDeleteBay = (bay) => {
    setFramelinesDefinition((prevBays) =>
      prevBays.filter((b) => b.id !== bay.id)
    );
  };

  const handleOpenUpdateModal = (bay) => {
    setSelecetedFrameDefinition(bay);
    setIsEditDefinitionOpen(true);
  };
  const handleSave = () => {
    const result = framelinesDefinition.map((bay) => ({
      id: bay.id,
      bayName: bay.name,
      parts: parts
        .map((part) => ({
          partId: part.id,
          qty: quantities[part.id]?.[bay.id] || 0,
        }))
        .filter((part) => part.qty > 0),
    }));

    console.log("Formatted Data:", result);
  };

  return (
    <div className="space-y-4">
      <div className="flex align-center space-x-4">
        <AddFrameLineDefinitonTab onAdd={handleAddFramelineDef} />
        {selectedFrameLineDefinition && (
          <EditBayDefinitionTab
            bay={selectedFrameLineDefinition}
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
              {framelinesDefinition.map((bay) => (
                <TableHead
                  key={bay.id}
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
                {framelinesDefinition.map((bay) => (
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

export default FrameLineDefinitionTable;
