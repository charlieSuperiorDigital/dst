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

const formSchema = z.object({
  name: z.string().min(1, "Day is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  onEdit: (bay) => void;
  bay;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (bay) => void;
}

export function EditBayDefinitionTab({
  onEdit,
  bay,
  open,
  onOpenChange,
  onDelete,
}: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: bay.name,
    },
  });

  const handleOnEdit = (values) => {
    const baytoUpdate = {
      id: bay.id,
      ...values,
    };
    onEdit(baytoUpdate);
    onOpenChange(false);
  };

  const handleDelete = () => {
    onDelete(bay);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit FramelineDefinition definition</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleOnEdit)}
            className="space-y-4"
          >
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
            <Button type="submit">Edit FramelineDefinition Definition</Button>
            <Button onClick={handleDelete}>
              Delete FramelineDefinition Definition
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
