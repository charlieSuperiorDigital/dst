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
import { PartRecieve } from "@/app/entities/PartRecieve";

interface Part {
  id: string;
  name: string;
  description: string;
}

const searchParts = async (query: string): Promise<Part[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const parts = [
    {
      id: "1",
      name: "Part A",
      description: "This is the description for Part A",
    },
    {
      id: "2",
      name: "Part B",
      description: "This is the description for Part B",
    },
    {
      id: "3",
      name: "Part C",
      description: "This is the description for Part C",
    },
    {
      id: "4",
      name: "Part D",
      description: "This is the description for Part D",
    },
    {
      id: "5",
      name: "Part E",
      description: "This is the description for Part E",
    },
  ];

  return parts.filter((part) =>
    part.name.toLowerCase().includes(query.toLowerCase())
  );
};

const formSchema = z.object({
  id: z.string().min(1, "Please select a part"),
  qtyRequired: z.number().min(1, "Quantity must be at least 1"),
  qtyOrdered: z.number().min(1, "Quantity must be at least 1"),
  qtyReceived: z.number().min(0, "Quantity must be at least 1"),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  onAdd: (part: PartRecieve) => void;
}

export function AddPartReceivingTab({ onAdd }: Props) {
  const [searchResults, setSearchResults] = useState<Part[]>([]);
  const [open, setOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      qtyRequired: 0,
      qtyOrdered: 0,
      qtyReceived: 0,
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
    const valuesTosend: PartRecieve = {
      ...values,
      description:
        searchResults.find((result) => result.id === values.id)?.description ||
        "",
    };
    onAdd(valuesTosend);

    form.reset();
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
              name="id"
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
                                  form.getValues("id") === result.id
                                    ? "bg-blue-100"
                                    : ""
                                }`}
                                onClick={() => {
                                  form.setValue("id", result.id);
                                  setCommandOpen(false);
                                }}
                              >
                                <svg
                                  className={`mr-2 h-4 w-4 ${
                                    form.getValues("id") === result.id
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
              name="qtyRequired"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity Required</FormLabel>
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
            <FormField
              control={form.control}
              name="qtyReceived"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity Received</FormLabel>
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
            <FormField
              control={form.control}
              name="qtyOrdered"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity Ordered</FormLabel>
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
            <Button type="submit">Add Part</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
