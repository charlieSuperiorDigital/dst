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
  partId: z.number().min(1, "Please select a part"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

type FormValues = z.infer<typeof formSchema>;

export function PartsDialog() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [filteredParts, setFilteredParts] = useState<Part[]>([]);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      partId: 0,
      quantity: 1,
    },
  });

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setSelectedPart(null);
    if (query) {
      setLoading(true);
      const response = await apiRequest({
        method: "get",
        url: `/api/part/1/10?search=${query}`,
      });
      console.log(response.parts);
      setFilteredParts(response.parts);
      setLoading(false);
    } else {
      setFilteredParts([]);
    }
  };

  const handlePartSelect = (part: Part) => {
    setSelectedPart(part);
    form.setValue("partId", part.id);
    setFilteredParts([]);
  };

  const handleAdd = (values: FormValues) => {
    console.log("Selected Part:", values.partId);
    console.log("Quantity:", values.quantity);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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

            {/* Quantity Field */}
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Add</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
