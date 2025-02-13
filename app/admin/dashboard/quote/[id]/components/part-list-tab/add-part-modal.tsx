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
    setFilteredParts([]);
  };

  const handleAdd = (values: FormValues) => {
    if (selectedPart) {
      onAdd(selectedPart, values.partNumber);
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
            <Button type="submit">Add</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
