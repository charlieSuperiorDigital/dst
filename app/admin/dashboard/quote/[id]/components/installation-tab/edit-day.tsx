"use client";

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
import { Input } from "@/components/ui/input";
import { InstallationDay } from "./installation-table";

const formSchema = z.object({
  name: z.string().min(1, "Day is required"),
  day: z.date({
    required_error: "Date is required",
    invalid_type_error: "That's not a valid date!",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  onEdit: (day: InstallationDay) => void;
  day: InstallationDay;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditDayInstallationTab({
  onEdit,
  day,
  open,
  onOpenChange,
}: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: day.name,
      day: new Date(day.day),
    },
  });

  const handleOnEdit = (values: Omit<InstallationDay, "id">) => {
    onEdit({ ...values, id: day.id });
    onOpenChange(false);
  };

  const onSubmit = (data: { name: string; day: Date }) => {
    const formattedData: Omit<InstallationDay, "id"> = {
      name: data.name,
      day: data.day,
      installationId: day.installationId,
      quotationId: day.quotationId,
      quantityReceived: day.quantityReceived || 0
    };

    handleOnEdit(formattedData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Day</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
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
                      min="1900-01-01"
                      max={new Date().toISOString().split("T")[0]}
                      className="rounded-md border shadow"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Save Changes</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
