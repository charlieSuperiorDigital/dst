import React, { useState, useEffect, useCallback } from "react";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { debounce } from "lodash";
import { apiRequest } from "@/utils/client-side-api";
import { Color } from "@/app/entities/color";
import { AddBayDefinitonTab } from "./add-bay-definition";
import { AddPartDialog } from "@/app/admin/dashboard/components/add-part.modal";
import { AddPartFromPartlistModal } from "@/components/part-list/add-part-from-part-list";
import { PartList } from "@/app/entities/PartList";
import { useQuote } from "../../context/quote-context";
interface Bay {
  bayName: string;
  bayId: string;
  quantity: number;
}
export interface PartFromBay {
  id: string;
  tempId?: string;
  partNumber: string;
  qty?: number;
  description: string;
  color: Color | null;
  colorId: number;
  unitWeight: number;
  unitMatLb: number;
  unitLabor: number;
  unitCost: number;
  unitSell: number;
  totalSell?: number;
  laborEA: number;
  quotationId: string;
}

interface PartWithBays {
  part: PartFromBay;
  bays: Bay[];
}

interface PartsBayTableProps {
  quoteId: string;
  parts?: PartList[];
}

export default function PartsBayTable({ quoteId, parts }: PartsBayTableProps) {
  const { isLocked } = useQuote();
  const [partsWithBays, setPartsWithBays] = useState<PartWithBays[]>([]);
  const [bays, setBays] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const response1: PartWithBays[] = await apiRequest({
        url: `/api/definition/bay/${quoteId}`,
        method: "get",
      });

      setPartsWithBays(response1);

      const uniqueBays = Array.from(
        new Set(
          response1.flatMap((item) => item.bays.map((bay) => bay.bayName))
        )
      );
      setBays(uniqueBays);
    };

    fetchData();
  }, []);
  const updateQuantity = useCallback(
    async (partId: string, bayId: string, newQuantity: number) => {
      try {
        setPartsWithBays((prevState) =>
          prevState.map((item) =>
            item.part.id === partId
              ? {
                  ...item,
                  bays: item.bays.map((bay) =>
                    bay.bayId === bayId
                      ? { ...bay, quantity: newQuantity }
                      : bay
                  ),
                }
              : item
          )
        );
        console.log("partId", partId);
        console.log("bayId", bayId);
        console.log("newQuantity", newQuantity);
        await apiRequest({
          url: `/api/part/bay/updatePart`,
          method: "put",
          data: { partId, bayId, quantity: newQuantity },
        });
        // await apiRequest({
        //   url: `/api/part/bay/addPart`,
        //   method: "post",
        //   data: { partId, id: bayId, quantity: newQuantity },
        // });

        // const partWithBays = partsWithBays.find(
        //   (item) => item.part.id === partId
        // );
        // const bay = partWithBays?.bays.find((b) => b.bayId === bayId);

        // const previousQuantity = bay?.quantity || 0;
        // const isNewEntry = previousQuantity === 0 && newQuantity > 0;
        // console.log("isNewEntry", isNewEntry);

        // if (isNewEntry) {
        //   await apiRequest({
        //     url: `/api/part/bay/addPart`,
        //     method: "post",
        //     data: { partId, id: bayId, quantity: newQuantity },
        //   });
        // } else {
        //   await apiRequest({
        //     url: `/api/part/bay/updatePart`,
        //     method: "put",
        //     data: { partId, bayId, quantity: newQuantity },
        //   });
        // }

        toast({
          title: "Success",
          description: "Quantity updated successfully",
        });
      } catch (error) {
        console.error("Error updating quantity:", error);
        toast({
          title: "Error",
          description: "Failed to update quantity. Please try again.",
          variant: "destructive",
        });
      }
    },
    []
  );
  const debouncedUpdateQuantity = useCallback(debounce(updateQuantity, 1000), [
    updateQuantity,
  ]);

  const handleQuantityChange = (
    partId: string,
    bayId: string,
    newQuantity: number
  ) => {
    setPartsWithBays((prevState) =>
      prevState.map((item) =>
        item.part.id === partId
          ? {
              ...item,
              bays: item.bays.map((bay) =>
                bay.bayId === bayId ? { ...bay, quantity: newQuantity } : bay
              ),
            }
          : item
      )
    );
    debouncedUpdateQuantity(partId, bayId, newQuantity);
  };

  const handleAddBay = async (bayName) => {
    try {
      const response = await apiRequest({
        url: `/api/definition/bay/${bayName}/${quoteId}`,
        method: "post",
      });

      setBays((prevState) => [...prevState, bayName]);
      setPartsWithBays((prevState) =>
        prevState.map((partWithBays) => ({
          ...partWithBays,
          bays: [
            ...partWithBays.bays,
            { bayName: bayName, bayId: response, quantity: 0 },
          ],
        }))
      );

      toast({
        title: "Success",
        description: "Bay added successfully",
      });
    } catch (error) {
      console.error("Error adding bay:", error);
      toast({
        title: "Error",
        description: "Failed to add bay. Please try again.",
        variant: "destructive",
      });
    }
  };

  // const handleAddPart = (part: PartFromBay) => {
  //   setPartsWithBays((prevState) => [
  //     ...prevState,
  //     {
  //       part: { ...part, tempId: Math.random().toString(36).substring(7) },
  //       bays: [],
  //     },
  //   ]);

  //   toast({
  //     title: "Success",
  //     description: "Part added successfully.",
  //   });
  // };

  return (
    <div className="container mx-auto py-10">
      <div className="space-x-4 mb-4">
        {!isLocked && <AddBayDefinitonTab onAdd={handleAddBay} />}
        {/* <AddPartFromPartlistModal onAdd={handleAddPart} partList={parts} /> */}
      </div>
      <Table className="border">
        <TableHeader className="border">
          <TableRow>
            <TableHead className="border w-[50px]">Part Number</TableHead>
            <TableHead className="border">Description</TableHead>
            <TableHead className="border">Total</TableHead>
            {bays.map((bay) => (
              <TableHead key={bay}>{bay}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="border">
          {partsWithBays.map((partWithBays) => (
            <TableRow className="border" key={partWithBays.part.id}>
              <TableCell className="border ">
                {partWithBays.part.partNumber}
              </TableCell>
              <TableCell className="border">
                {partWithBays.part.description}
              </TableCell>
              <TableCell className="border">
                {partWithBays.bays.reduce(
                  (acc, bay) => acc + (bay.quantity || 0),
                  0
                )}
              </TableCell>
              {bays.map((bayName) => {
                const bay = partWithBays.bays.find(
                  (b) => b.bayName === bayName
                );
                return (
                  <TableCell key={bayName} className="border">
                    <Input
                      type="number"
                      value={bay?.quantity || 0}
                      onChange={(e) =>
                        handleQuantityChange(
                          partWithBays.part.id,
                          bay?.bayId || "",
                          Number.parseInt(e.target.value, 10)
                        )
                      }
                      className="w-20 border-none"
                      disabled={isLocked}
                    />
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
