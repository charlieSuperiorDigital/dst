"use client";

import { useState, useEffect } from "react";
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
              render={() => (
                <FormItem className="flex flex-col">
                  <FormLabel>Search Part</FormLabel>

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
