import React, { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EditLoadReceivingTab } from "./edit-load";
import { EditPartReceivingTab } from "./edit-part";
import { ReceivingInfo, ReceivingLoad } from "@/app/entities/ReceivingInfo";
import { apiRequest } from "@/utils/client-side-api";
import { toast } from "@/hooks/use-toast";
import { Trash2, Loader2 } from "lucide-react";

interface Props {
  quoteId: string;
}

const ReceivingTable = ({ quoteId }: Props) => {
  const [receivingInfo, setReceivingInfo] = useState<ReceivingInfo[]>([]);
  const [loadToEdit, setLoadToEdit] = useState<ReceivingLoad | null>(null);
  const [partToEdit, setPartToEdit] = useState<ReceivingInfo | null>(null);
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false);
  const [isPartDialogOpen, setIsPartDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingLoads, setLoadingLoads] = useState<{ [key: string]: boolean }>({});

  const fetchReceivingData = async () => {
    try {
      const response = await apiRequest<ReceivingInfo[]>({
        method: "get",
        url: `/receiving/${quoteId}`,
      });
      
      // Calculate balance due for each part
      const updatedResponse = response?.map(info => {
        const totalReceived = info.receivingLoad.reduce((sum, load) => sum + (load.quantityReceived || 0), 0);
        return {
          ...info,
          totalQuantityReceived: totalReceived,
          balanceDue: Math.max(0, info.quantityRequired - totalReceived)
        };
      }) || [];

      setReceivingInfo(updatedResponse);
    } catch (error) {
      console.error("Error fetching receiving data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch receiving data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceivingData();
  }, [quoteId]);

  const handleAddLoad = async (name: string) => {
    try {
      setLoadingLoads(prev => ({ ...prev, [name]: true }));
      const response = await apiRequest<ReceivingLoad[]>({
        method: "post",
        url: `/receiving/AddLoad?id=${quoteId}&name=${encodeURIComponent(name)}`,
      });
      
      if (response) {
        await fetchReceivingData();
        toast({
          title: "Success",
          description: "Load added successfully",
        });
      }
    } catch (error) {
      console.error("Error adding load:", error);
      toast({
        title: "Error",
        description: "Failed to add load",
        variant: "destructive",
      });
    } finally {
      setLoadingLoads(prev => {
        const newState = { ...prev };
        delete newState[name];
        return newState;
      });
    }
  };

  const handleQuantityChange = async (
    partId: string,
    loadId: string,
    quantity: number
  ) => {
    const updatedInfo = receivingInfo.map(info => {
      if (info.partId === partId) {
        const updatedLoads = info.receivingLoad.map(load => {
          if (load.id === loadId) {
            return { ...load, quantityReceived: quantity };
          }
          return load;
        });
        
        // Calculate total received from all loads
        const totalReceived = updatedLoads.reduce((sum, load) => sum + (load.quantityReceived || 0), 0);
        const balanceDue = Math.max(0, info.quantityRequired - totalReceived);
        
        return { 
          ...info, 
          receivingLoad: updatedLoads,
          totalQuantityReceived: totalReceived,
          balanceDue: balanceDue
        };
      }
      return info;
    });

    setReceivingInfo(updatedInfo);
  };

  const handleSync = async () => {
    try {
      const response = await apiRequest({
        method: "put",
        url: "/receiving/UpdateReceiving",
        data: receivingInfo,
      });

      if (response === "Ok") {
        toast({
          title: "Success",
          description: "Data synchronized successfully",
        });
        await fetchReceivingData();
      }
    } catch (error) {
      console.error("Error syncing data:", error);
      toast({
        title: "Error",
        description: "Failed to synchronize data",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLoad = async (loadName: string) => {
    try {
      setLoadingLoads(prev => ({ ...prev, [loadName]: true }));
      const response = await apiRequest({
        method: "delete",
        url: "/receiving/DeleteLoad",
        data: {
          quotationId: quoteId,
          loadName: loadName,
        },
      });

      if (response === "Ok") {
        await fetchReceivingData();
        toast({
          title: "Success",
          description: "Load deleted successfully",
        });
      }
    } catch (error) {
      console.error("Error deleting load:", error);
      toast({
        title: "Error",
        description: "Failed to delete load",
        variant: "destructive",
      });
    } finally {
      setLoadingLoads(prev => {
        const newState = { ...prev };
        delete newState[loadName];
        return newState;
      });
    }
  };

  const handleOpenEditLoad = (load: ReceivingLoad) => {
    setLoadToEdit(load);
    setIsLoadDialogOpen(true);
  };

  const handleOpenEditPart = (part: ReceivingInfo) => {
    setPartToEdit(part);
    setIsPartDialogOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between mb-4 mt-4">
        <div className="flex space-x-4">
          <AddLoadReceivingTab onAdd={handleAddLoad} />
          {loadToEdit && (
            <EditLoadReceivingTab
              onEdit={fetchReceivingData}
              load={loadToEdit}
              open={isLoadDialogOpen}
              onOpenChange={setIsLoadDialogOpen}
              onDelete={handleDeleteLoad}
            />
          )}
        </div>
        <Button 
          onClick={handleSync}
          className="bg-green-600 hover:bg-green-700"
        >
          Save Changes
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px] border">Part No.</TableHead>
            <TableHead className="border">Description</TableHead>
            <TableHead className="border">Color</TableHead>
            <TableHead className="border">Qty Required</TableHead>
            <TableHead className="border">Total Received</TableHead>
            <TableHead className="border">Balance Due</TableHead>
            {receivingInfo[0]?.receivingLoad.map((load) => (
              <TableHead
                key={load.id}
                className="cursor-pointer border group"
              >
                <div className="flex items-center justify-between">
                  <span onClick={() => handleOpenEditLoad(load)}>
                    Load {load.name}
                  </span>
                  {loadingLoads[load.name] ? (
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  ) : (
                    <Trash2 
                      className="h-4 w-4 text-red-500 cursor-pointer ml-2" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLoad(load.name);
                      }}
                    />
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6 + (receivingInfo[0]?.receivingLoad.length || 0)} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : (
            receivingInfo.map((info) => (
              <TableRow key={info.partId} className="border">
                <TableCell className="border">{info.partNo}</TableCell>
                <TableCell
                  onClick={() => handleOpenEditPart(info)}
                  className="border cursor-pointer"
                >
                  {info.partDescription}
                </TableCell>
                <TableCell className="border">{info.color?.name || "-"}</TableCell>
                <TableCell className="border">{info.quantityRequired}</TableCell>
                <TableCell className="border">{info.totalQuantityReceived}</TableCell>
                <TableCell className="border">{info.balanceDue}</TableCell>
                {info.receivingLoad.map((load) => (
                  <TableCell key={`${info.partId}-${load.id}`} className="border">
                    <Input
                      type="number"
                      value={load.quantityReceived}
                      onChange={(e) =>
                        handleQuantityChange(
                          info.partId,
                          load.id,
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-16"
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ReceivingTable;
