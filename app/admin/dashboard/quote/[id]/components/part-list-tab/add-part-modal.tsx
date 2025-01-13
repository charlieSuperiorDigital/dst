"use client";

import { useState, useEffect } from "react";
import { Plus, ChevronsUpDown } from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Part {
  id: string;
  name: string;
}

// This is a mock function. Replace it with your actual search function.
const searchParts = async (query: string): Promise<Part[]> => {
  // Simulating an API call
  await new Promise((resolve) => setTimeout(resolve, 500));
  return [
    { id: "1", name: "Part A" },
    { id: "2", name: "Part B" },
    { id: "3", name: "Part C" },
    { id: "4", name: "Part D" },
    { id: "5", name: "Part E" },
  ].filter((part) => part.name.toLowerCase().includes(query.toLowerCase()));
};

const formSchema = z.object({
  partId: z.string().min(1, "Please select a part"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

type FormValues = z.infer<typeof formSchema>;

export function PartsDialog() {
  const [searchResults, setSearchResults] = useState<Part[]>([]);
  const [open, setOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      partId: "",
      quantity: 1,
    },
  });

  const handleSearch = async (value: string) => {
    if (value) {
      const results = await searchParts(value);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleAdd = (values: FormValues) => {
    console.log(values);
    // Handle adding the part with the specified quantity
    setOpen(false);
  };

  useEffect(() => {
    if (commandOpen) {
      handleSearch("");
    }
  }, [commandOpen]);

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
            <FormField
              control={form.control}
              name="partId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Search Part</FormLabel>
                  <Popover open={commandOpen} onOpenChange={setCommandOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={`w-full justify-between ${
                            !field.value && "text-muted-foreground"
                          }`}
                        >
                          {field.value
                            ? searchResults.find(
                                (result) => result.id === field.value
                              )?.name
                            : "Select part"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <div className="relative w-full">
                        <input
                          type="text"
                          placeholder="Search part..."
                          onChange={(e) => handleSearch(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                        {searchResults.length === 0 ? (
                          <div className="mt-2 p-2 text-sm text-gray-500 bg-gray-100 border border-gray-300 rounded-md">
                            No part found.
                          </div>
                        ) : (
                          <ul className="mt-2 max-h-48 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-sm">
                            {searchResults.map((result) => (
                              <li
                                key={result.id}
                                className={`flex items-center px-4 py-2 cursor-pointer hover:bg-blue-50 ${
                                  form.getValues("partId") === result.id
                                    ? "bg-blue-100"
                                    : ""
                                }`}
                                onClick={() => {
                                  form.setValue("partId", result.id);
                                  setCommandOpen(false);
                                }}
                              >
                                <svg
                                  className={`mr-2 h-4 w-4 ${
                                    form.getValues("partId") === result.id
                                      ? "opacity-100 text-blue-500"
                                      : "opacity-0"
                                  }`}
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                {result.name}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
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
