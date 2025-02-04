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
import { Input } from "@/components/ui/input";
import { ReceivingLoad } from "@/app/entities/ReceivingInfo";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  onEdit: () => Promise<void>;
  load: ReceivingLoad;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (loadName: string) => Promise<void>;
}

export function EditLoadReceivingTab({
  onEdit,
  load,
  open,
  onOpenChange,
  onDelete,
}: Props) {
  const [loadToEdit, setLoadToEdit] = useState<ReceivingLoad>(load);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: load.name,
    },
  });

  const handleEdit = async (values: FormValues) => {
    setLoadToEdit({ ...loadToEdit, name: values.name });
    await onEdit();
    onOpenChange(false);
  };

  const handleDelete = async () => {
    await onDelete(load.name);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Load</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleEdit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name:</FormLabel>
                  <FormControl>
                    <Input {...field} value={loadToEdit.name} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between">
              <Button type="submit">Save changes</Button>
              <Button type="button" variant="destructive" onClick={handleDelete}>
                Delete Load
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
