"use client";

import { useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Load } from "@/app/entities/Load";

const formSchema = z.object({
  bol: z.string().min(1, "BOL is required"),
  carrier: z.string().min(1, "Carrier is required"),
  date: z.date({
    required_error: "Date is required",
    invalid_type_error: "That's not a valid date!",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  onEdit: (load: Load) => void;
  load: Load;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (load: Load) => void;
}

export function EditLoadReceivingTab({
  onEdit,
  load,
  open,
  onOpenChange,
  onDelete,
}: Props) {
  const [loadToEdit, setLoadToEdit] = useState<Load | null>(load);
  //   const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });
  const handleEdit = (values: FormValues) => {
    const updatedLoad = { ...loadToEdit, ...values, id: load.id } as Load;
    setLoadToEdit(updatedLoad);
    onEdit(updatedLoad);
  };

  const handleDelete = () => {
    onDelete(load);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Load</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleEdit)} className="space-y-4">
            <FormField
              control={form.control}
              name="bol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>BOL:</FormLabel>
                  <FormControl>
                    <Input {...field} value={loadToEdit?.bol} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="carrier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carrier</FormLabel>
                  <FormControl>
                    <Input {...field} value={loadToEdit?.carrier} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Calendar
                      mode="single"
                      selected={load.date}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      className="rounded-md border shadow"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-x-4">
              <Button type="submit">Edit Load</Button>
              <Button type="button" onClick={() => handleDelete}>
                Delete Load
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
