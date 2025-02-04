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
import { Trash2 } from "lucide-react";
import { AddDayInstallationTab } from "./add-day";
import { EditDayInstallationTab } from "./edit-day";
import { apiRequest } from "@/utils/client-side-api";
import { toast } from "@/hooks/use-toast";

// Match C# InstallationDays model
export type InstallationDay = {
  id: string;
  installationId: string;
  quotationId: string;
  name: string;
  quantityReceived: number;
  day: Date;
};

// Match C# InstallationRows model exactly
export type InstallationRow = {
  rowName: string;
  rowId: string;
  quotationId: string;
  installationId: string;
  baysRequired: number;
  baysRemaining: number;
  installationDays: InstallationDay[];
};

interface Props {
  quoteId: string;
}

const InstallationTable = ({ quoteId }: Props) => {
  const [installations, setInstallations] = useState<InstallationRow[]>([]);
  const [openEditDay, setOpenEditDay] = useState(false);
  const [selectedDay, setSelectedDay] = useState<InstallationDay | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInstallationData = async (quotationId: string) => {
    try {
      console.log('Starting fetchInstallationData with quoteId:', quotationId);
      setLoading(true);
      
      const response = await apiRequest<InstallationRow[]>({
        method: "get",
        url: `/installation/${quotationId}`
      });
      
      if (response && response.length > 0) {
        setInstallations(response);
      } else {
        console.log('No data received from API');
      }
    } catch (error) {
      console.error("Error fetching installation data:", error);
      toast({
        title: "Error",
        description: "Failed to load installation data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlQuoteId = window.location.href.split('/quote/')[1]?.split('/')[0];
    if (!urlQuoteId) {
      console.log('No quoteId found in URL, skipping fetch');
      return;
    }
    fetchInstallationData(urlQuoteId);
  }, []);

  const handleQuantityChange = (
    rowId: string,
    dayId: string,
    quantity: number
  ) => {
    // Update local state only, no API call
    setInstallations(prevInstallations =>
      prevInstallations.map(row => {
        if (row.installationId !== rowId) return row;
        if (!row.installationDays) return { ...row, installationDays: [] };
        
        return {
          ...row,
          installationDays: row.installationDays.map(day =>
            day.id === dayId
              ? { ...day, quantityReceived: quantity }
              : day
          )
        };
      })
    );
  };

  const calculateTotalInstalled = (row: InstallationRow): number => {
    if (!row.installationDays || row.installationDays.length === 0) return 0;
    return row.installationDays.reduce((total, day) => total + (day.quantityReceived || 0), 0);
  };

  const calculateBaysRemaining = (row: InstallationRow): number => {
    if (!row.baysRequired) return 0;
    const totalInstalled = calculateTotalInstalled(row);
    return Math.max(0, row.baysRequired - totalInstalled);
  };

  const handleAddNewDay = async () => {
    const urlQuoteId = window.location.href.split('/quote/')[1]?.split('/')[0];
    if (!urlQuoteId) {
      console.log('No quoteId found in URL, skipping fetch');
      return;
    }
    await fetchInstallationData(urlQuoteId);
  };

  const handleEditDay = async (day: InstallationDay) => {
    try {
      const response = await apiRequest<string>({
        method: "put", 
        url: "/installation/UpdateInstallationDay",
        data: installations
      });

      if (response === "Ok") {
        toast({
          title: "Success",
          description: "Day updated successfully"
        });
      } else {
        throw new Error("Failed to update day");
      }
    } catch (error) {
      console.error("Error updating day:", error);
      toast({
        title: "Error", 
        description: "Failed to update day",
        variant: "destructive"
      });
    }
  };

  const handleDeleteDay = async (dayName: string, quotationId: string) => {
    try {
      const response = await apiRequest<string>({
        method: "delete",
        url: "/installation/DeleteInstallationDay",
        data: {
          quotationId,
          dayName
        }
      });

      if (response === "Ok") {
        setInstallations(prevInstallations =>
          prevInstallations.map(installation => ({
            ...installation,
            installationDays: installation.installationDays.filter(day => day.name !== dayName)
          }))
        );

        toast({
          title: "Success",
          description: "Day deleted successfully",
        });
      } else {
        throw new Error("Failed to delete day");
      }
    } catch (error) {
      console.error("Error deleting day:", error);
      toast({
        title: "Error",
        description: "Failed to delete day",
        variant: "destructive",
      });
    }
  };

  const handleSync = async () => {
    try {
      // Mock API call to sync data
      const response = await apiRequest<string>({
        method: "put",
        url: "/installation/UpdateInstallationDay",
        data: installations
      });

      if (response === "Ok") {
        toast({
          title: "Success",
          description: "Data synchronized successfully",
        });
      } else {
        throw new Error("Failed to sync data");
      }
    } catch (error) {
      console.error("Error syncing data:", error);
      toast({
        title: "Error",
        description: "Failed to sync data",
        variant: "destructive",
      });
    }
  };

  const handleEditOpenModal = (day: InstallationDay) => {
    setSelectedDay(day);
    setOpenEditDay(true);
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit'
    });
  };

  if (loading) {
    return <div>Loading installation data...</div>;
  }

  return (
    <div>
      <div className="flex justify-between mb-4 mt-4">
        <div className="flex space-x-4">
          <AddDayInstallationTab 
            onAdd={handleAddNewDay}
            days={installations[0]?.installationDays || []} 
            quoteId={quoteId}
          />
          {selectedDay && (
            <EditDayInstallationTab
              day={selectedDay}
              onEdit={handleEditDay}
              open={openEditDay}
              onOpenChange={setOpenEditDay}
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
            <TableHead className="w-[100px] border">Row Name</TableHead>
            <TableHead className="border">Bays Required</TableHead>
            <TableHead className="border">Bays Installed</TableHead>
            <TableHead className="border">Bays Remaining</TableHead>
            {installations[0]?.installationDays && installations[0].installationDays.length > 0 ? (
              installations[0].installationDays
                .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime())
                .map((day) => (
                  <TableHead
                    key={`header-day-${day.id}`}
                    className="cursor-pointer border group"
                  >
                    <div className="flex items-center justify-between">
                      <span onClick={() => handleEditOpenModal(day)}>
                        {day.name} - {formatDate(day.day)}
                      </span>
                      <Trash2 
                        className="h-4 w-4 text-red-500 cursor-pointer ml-2" 
                        onClick={(e) => {
                          e.stopPropagation();
                          const urlQuoteId = window.location.href.split('?')[0].split('/quote/')[1]?.split('/')[0];
                          if (!urlQuoteId) return;
                          handleDeleteDay(day.name, urlQuoteId);
                        }}
                      />
                    </div>
                  </TableHead>
                ))
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {installations.map((row) => (
            <TableRow key={`installation-${row.installationId}`} className="cursor-pointer border">
              <TableCell className="border">{row.rowName}</TableCell>
              <TableCell className="border">{row.baysRequired}</TableCell>
              <TableCell className="border">{calculateTotalInstalled(row)}</TableCell>
              <TableCell className="border">{calculateBaysRemaining(row)}</TableCell>
              {row.installationDays && row.installationDays.length > 0 ? (
                row.installationDays
                  .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime())
                  .map((day) => (
                    <TableCell key={`cell-${row.installationId}-${day.id}`} className="border">
                      <Input
                        type="number"
                        value={day.quantityReceived}
                        onChange={(e) =>
                          handleQuantityChange(
                            row.installationId,
                            day.id,
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-20"
                      />
                    </TableCell>
                  ))
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default InstallationTable;
