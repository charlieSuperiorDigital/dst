"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/utils/client-side-api";
import { Part } from "@/app/entities/Part";

const formSchema = z.object({
  partId: z.string().min(1, "Please select a part"),
  partNumber: z.string().min(1, "Please enter a part number"),
  laborEA: z.string(),
  unitCost: z.string(),
  unitLabor: z.string(),
  unitMatLb: z.string(),
  unitSell: z.string(),
  unitWeight: z.string()
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  onAdd: (part: Part, partNumber: string) => void;
};

export function PartsDialog({ onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [filteredParts, setFilteredParts] = useState<Part[]>([]);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      partId: "",
      partNumber: "",
      laborEA: "0.00",
      unitCost: "0.00",
      unitLabor: "0.00",
      unitMatLb: "0.00",
      unitSell: "0.00",
      unitWeight: "0.000"
    },
  });

  const handleCloseModal = (open: boolean) => {
    setOpen(open);
    if (!open) {
      // Reset all form data when modal is closed
      form.reset();
      setSearchQuery("");
      setSelectedPart(null);
      setFilteredParts([]);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setSelectedPart(null);

    if (query) {
      setLoading(true);
      const response = await apiRequest({
        method: "get",
        url: `/api/PartLibrary/1/10?search=${encodeURIComponent(query)}`,
      });

      setFilteredParts(response.parts);
      setLoading(false);
    } else {
      setFilteredParts([]);
    }
  };

  const handlePartSelect = (part: Part) => {
    setSelectedPart(part);
    form.setValue("partId", part.id);
    form.setValue("partNumber", part.partNumber);
    form.setValue("laborEA", part.laborEA != null ? Number(part.laborEA).toFixed(2) : "0.00");
    form.setValue("unitCost", part.unitCost != null ? Number(part.unitCost).toFixed(2) : "0.00");
    form.setValue("unitLabor", part.unitLabor != null ? Number(part.unitLabor).toFixed(2) : "0.00");
    form.setValue("unitMatLb", part.unitMatLb != null ? Number(part.unitMatLb).toFixed(2) : "0.00");
    form.setValue("unitSell", part.unitSell != null ? Number(part.unitSell).toFixed(2) : "0.00");
    form.setValue("unitWeight", part.unitWeight != null ? Number(part.unitWeight).toFixed(3) : "0.000");
    setFilteredParts([]);
  };

  const handleAdd = (values: FormValues) => {
    if (selectedPart) {
      const newPart: Part = {
        ...selectedPart,
        partNumber: values.partNumber,
        laborEA: parseFloat(values.laborEA),
        unitCost: parseFloat(values.unitCost),
        unitLabor: parseFloat(values.unitLabor),
        unitMatLb: parseFloat(values.unitMatLb),
        unitSell: parseFloat(values.unitSell),
        unitWeight: parseFloat(values.unitWeight)
      };
      onAdd(newPart, values.partNumber);
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleCloseModal}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Part
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Part</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleAdd)} className="space-y-4">
            {/* Part Search Field */}
            <FormField
              control={form.control}
              name="partId"
              render={() => (
                <FormItem className="flex flex-col">
                  <FormLabel>Search Part</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Type to search for parts..."
                      value={
                        selectedPart ? selectedPart.description : searchQuery
                      }
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </FormControl>
                  {loading && (
                    <div className="mt-2 text-sm text-gray-500">
                      Searching...
                    </div>
                  )}
                  {!loading && searchQuery && (
                    <div className="mt-2 max-h-40 overflow-y-auto border rounded-md bg-white">
                      {filteredParts.length > 0 ? (
                        filteredParts.map((part) => (
                          <div
                            key={part.id}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                            onClick={() => handlePartSelect(part)}
                          >
                            {part.description}
                          </div>
                        ))
                      ) : (
                        <></>
                      )}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="partNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Part Number</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="laborEA"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Labor EA</FormLabel>
                    <div className="col-span-3">
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value)}
                          onBlur={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value)) {
                              field.onChange(value.toFixed(2));
                            }
                            field.onBlur();
                          }}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unitCost"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Unit Cost</FormLabel>
                    <div className="col-span-3">
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value)}
                            onBlur={(e) => {
                              const value = parseFloat(e.target.value);
                              if (!isNaN(value)) {
                                field.onChange(value.toFixed(2));
                              }
                              field.onBlur();
                            }}
                            className="pl-6"
                          />
                        </div>
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unitLabor"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Unit Labor</FormLabel>
                    <div className="col-span-3">
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value)}
                          onBlur={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value)) {
                              field.onChange(value.toFixed(2));
                            }
                            field.onBlur();
                          }}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unitMatLb"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4" style={{ display: "none" }}>
                    <FormLabel className="text-right">Unit Mat/lb</FormLabel>
                    <div className="col-span-3">
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value)}
                          onBlur={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value)) {
                              field.onChange(value.toFixed(2));
                            }
                            field.onBlur();
                          }}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unitSell"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Unit Sell</FormLabel>
                    <div className="col-span-3">
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value)}
                            onBlur={(e) => {
                              const value = parseFloat(e.target.value);
                              if (!isNaN(value)) {
                                field.onChange(value.toFixed(2));
                              }
                              field.onBlur();
                            }}
                            className="pl-6"
                          />
                        </div>
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unitWeight"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Unit Weight</FormLabel>
                    <div className="col-span-3">
                      <FormControl>
                        <Input
                          type="number"
                          step="0.001"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value)}
                          onBlur={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value)) {
                              field.onChange(value.toFixed(3));
                            }
                            field.onBlur();
                          }}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit">Add</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
