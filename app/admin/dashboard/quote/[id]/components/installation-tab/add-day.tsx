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
import { InstallationDay, InstallationRow } from "./installation-table";
import { apiRequest } from "@/utils/client-side-api";
import { toast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  day: z.date({
    required_error: "Date is required",
    invalid_type_error: "That's not a valid date!",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  onAdd: () => Promise<void>;
  days: InstallationDay[];
  quoteId: string;
}

export function AddDayInstallationTab({ onAdd, days, quoteId }: Props) {
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      day: new Date(),
    },
  });

  const handleAdd = async (values: FormValues) => {
    try {
      // Encode parameters to handle special characters
      const encodedName = encodeURIComponent(values.name);
      const encodedDate = encodeURIComponent(values.day.toISOString());
      
      // Extract quote ID from URL
      const urlQuoteId = window.location.href.split('/quote/')[1]?.split('/')[0]?.split('?')[0];
      if (!urlQuoteId) {
        console.log('No quoteId found in URL, skipping fetch');
        return;
      }

      // Make API call to add the day
      const response = await apiRequest<InstallationRow[]>({
        method: "post",
        url: `/installation/AddDayToInstallation?id=${urlQuoteId}&name=${encodedName}&day=${encodedDate}`
      });

      if (response && response.length > 0) {
        toast({
          title: "Success",
          description: "Day added successfully",
        });
        setOpen(false);
        form.reset();

        // Trigger parent refresh
        await onAdd();
      } else {
        throw new Error("Failed to add day");
      }
    } catch (error) {
      console.error("Error adding day:", error);
      toast({
        title: "Error",
        description: "Failed to add new day",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Day
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Day</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleAdd)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name:</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="day"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={
                        field.value
                          ? new Date(field.value).toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) => {
                        const selectedDate = e.target.value
                          ? new Date(e.target.value)
                          : null;
                        field.onChange(selectedDate);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Add Day</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
