"use client";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { PaginatedResponse } from "@/app/entities/Paginate-Response-Base";
import { type Quotes, QuotesStatus } from "@/app/entities/Quotes";
import { apiRequest } from "@/utils/client-side-api";
import { toast } from "@/hooks/use-toast";
import { useQuotes } from "@/hooks/user-quotes";
import { useState, useRef } from "react";
import { UpdateQuoteModal } from "./update-quote-modal";
import { useRouter } from "next/navigation";

interface ExtensibleTableProps {
  initialQuotes: PaginatedResponse<Quotes, "quotations">;
}

export function QuotesTable({ initialQuotes }: ExtensibleTableProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [quoteToEdit, setQuoteToEdit] = useState<Quotes | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false); // Added state for add dialog
  const {
    QuotesResponse,
    currentPage,
    setCurrentPage,
    searchTerm,
    setSearchTerm,
    fetchQuotes,
  } = useQuotes(initialQuotes.quotations);

  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null); // Changed ref type to HTMLDialogElement

  const form = useForm<Quotes>({
    defaultValues: {
      name: "",
      customerName: "",
      contactName: "",
      contactName2: "",
      city: "",
      address: "",
      phoneNumber1: "",
      phoneNumber2: "",
      zipCode: "",
      email: "",
      state: "",
    },
  });

  const handleAdd = async (quote: Quotes) => {
    try {
      const response = await apiRequest<number>({
        method: "post",
        url: "/api/quotation",
        data: quote,
      });
      console.log(response);
      toast({
        title: "Quote Added",
        description: "Quote has been added successfully.",
      });
      fetchQuotes(currentPage, searchTerm);
      form.reset(); // Reset the form
      setIsAddDialogOpen(false); // Close the dialog
      return true; // Return true to indicate success
    } catch (error) {
      console.error("Error adding quote:", error);
      toast({
        title: "Error",
        description: "Error adding quote.",
      });
      return false; // Return false to indicate failure
    }
  };

  const handleRowDelete = async (e, quote) => {
    e.stopPropagation();
    try {
      await apiRequest({
        method: "delete",
        url: `/api/quotation/${quote.id}`,
      });
      fetchQuotes(currentPage, searchTerm);
    } catch (error) {
      console.error("Error deleting quote:", error);
    }
  };

  const handleEditOnClick = (e, quote: Quotes) => {
    e.stopPropagation();
    setQuoteToEdit(quote);
    setIsEditDialogOpen(true);
  };

  const handleEditQuote = async (quote) => {
    try {
      if (quote.status === 1) {
        const response = await apiRequest({
          method: "get",
          url: `/api/quotation/clone/${quote.id}`,
        });
        console.log(response);
      } else {
        await apiRequest({
          method: "put",
          url: `/api/quotation/`,
          data: quote,
        });
      }

      setIsEditDialogOpen(false);
      toast({
        title: "Quote Updated",
        description: "Quote has been updated successfully.",
      });
      fetchQuotes(currentPage, searchTerm);
    } catch (error) {
      console.error("Error updating quote:", error);
      toast({
        title: "Quote Error",
        description: "Quote has not been updated.",
      });
    }
  };
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchQuotes(1, searchTerm);
  };

  const handleRedirect = (e, quote) => {
    e.preventDefault();
    router.push(`/admin/dashboard/quote/${quote.id}?tab=summary`);
  };

  const totalPages = Math.ceil(
    QuotesResponse.totalCount / QuotesResponse.perPage
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder="Search Quotes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </form>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="success" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Quote
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Quote</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(async (data) => {
                  const success = await handleAdd(data);
                  if (success) {
                    setIsAddDialogOpen(false); // Close the dialog after successful add
                  }
                })}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quote Name </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactName2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Name 2</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number 1</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number 2</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip Code</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="col-span-1 md:col-span-2">
                  <Button type="submit">Add</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Id</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead> - </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {QuotesResponse.quotations?.map((item) => (
              <TableRow
                key={item.id}
                onClick={(e) => handleRedirect(e, item)}
                className="cursor-pointer even:bg-gray-50 hover:bg-muted"
              >
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.responsible}</TableCell>
                <TableCell>{QuotesStatus[item.status]}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Pencil
                      size={20}
                      onClick={(e) => handleEditOnClick(e, item)}
                      className="cursor-pointer text-orange-500"
                    />
                    <Trash2
                      size={20}
                      onClick={(e) => handleRowDelete(e, item)}
                      className="text-red-500"
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            />
          </PaginationItem>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => setCurrentPage(page)}
                isActive={currentPage === page}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {quoteToEdit && (
        <UpdateQuoteModal
          quote={quoteToEdit}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleEditQuote}
        />
      )}
    </div>
  );
}
