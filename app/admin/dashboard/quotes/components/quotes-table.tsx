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
import { PaginatedResponse } from "@/app/entities/Paginate-Response-Base";
import { Quotes, QuotesStatus } from "@/app/entities/Quotes";
import { apiRequest } from "@/utils/client-side-api";
import { toast } from "@/hooks/use-toast";
import { useQuotes } from "@/hooks/user-quotes";
import { useState } from "react";
import { UpdateQuoteModal } from "./update-quote-modal";
import { useRouter } from "next/navigation";

interface ExtensibleTableProps {
  initialQuotes: PaginatedResponse<Quotes, "quotations">;
}

export function QuotesTable({ initialQuotes }: ExtensibleTableProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [quoteToEdit, setQuoteToEdit] = useState<Quotes | null>(null);
  const {
    QuotesResponse,
    currentPage,
    setCurrentPage,
    searchTerm,
    setSearchTerm,
    fetchQuotes,
  } = useQuotes(initialQuotes.quotations);

  const router = useRouter();

  const form = useForm<Quotes>({
    defaultValues: {
      name: "",
      responsible: "",
    },
  });

  const handleAdd = async (quote: Quotes) => {
    try {
      await apiRequest<number>({
        method: "post",
        url: "/api/quotation",
        data: quote,
      });
      toast({
        title: "Quote Added",
        description: "Quote has been added successfully.",
      });
      fetchQuotes(currentPage, searchTerm);
    } catch (error) {
      console.error("Error adding part:", error);
      toast({
        title: "Error",
        description: "Error adding quote.",
      });
    }
  };

  //     try {
  //       await apiRequest({
  //         method: "put",
  //         url: `/api/quotation/${quote.id}/${quote.responsible}/${quote.name}/${quote.status}`,
  //       });

  //       fetchQuotes(currentPage, searchTerm);
  //     } catch (error) {
  //       console.error("Error updating part:", error);
  //     }
  //   };

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
      await apiRequest({
        method: "put",
        url: `/api/quotation/${quote.id}/${quote.responsible}/${quote.name}/${quote.status}`,
      });
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
    router.push(`/admin/dashboard/quote/${quote.id}`);
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
            placeholder="Search Quote Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </form>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Item</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleAdd)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="responsible"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsible</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Id</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Responsible</TableHead>
              <TableHead>Status</TableHead>
              <TableHead> - </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {QuotesResponse.quotations?.map((item) => (
              <TableRow
                key={item.id}
                onClick={(e) => handleRedirect(e, item)}
                className="cursor-pointer"
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
                      className="cursor-pointer"
                    />
                    <Trash2
                      size={20}
                      onClick={(e) => handleRowDelete(e, item)}
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
