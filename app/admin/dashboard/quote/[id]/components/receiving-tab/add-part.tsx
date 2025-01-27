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
              render={() => (
                <FormItem className="flex flex-col">
                  <FormLabel>Search Part</FormLabel>

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
