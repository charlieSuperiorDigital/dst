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
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { DaysInstallation } from "./installation-table";

const formSchema = z.object({
  day: z.string().min(1, "Day is required"),
  date: z.date({
    required_error: "Date is required",
    invalid_type_error: "That's not a valid date!",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  onAdd: (day: DaysInstallation) => void;
  days: DaysInstallation[];
}

export function AddDayInstallationTab({ onAdd, days }: Props) {
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      day: "",
      date: new Date(),
    },
  });

  const handleAdd = (values: Omit<DaysInstallation, "id">) => {
    const currentMaxId = Math.max(0, ...days.map((day) => Number(day.id)));

    const newInstallationDay: DaysInstallation = {
      id: currentMaxId + 1,
      ...values,
    };

    onAdd(newInstallationDay);
    setOpen(false);
    form.reset();
  };

  const onSubmit = (data: { day: string; date: Date }) => {
    const formattedData: Omit<DaysInstallation, "id"> = {
      day: data.day,
      date: data.date.toString(),
    };

    handleAdd(formattedData);
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="day"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Day:</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                      min="1900-01-01"
                      max={new Date().toISOString().split("T")[0]}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Add Load</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
