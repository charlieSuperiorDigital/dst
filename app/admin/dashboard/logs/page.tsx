"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/utils/client-side-api";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "@/hooks/use-toast";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Log {
  id: string;
  when: string;
  whoId: string;
  whoName: string;
  what: string;
  quotationId: string;
}

interface LogsResponse {
  logs: Log[];
  currentPage: number;
  perPage: number;
  totalCount: number;
}

type SortColumn = "When" | "WhoName" | "What" | "QuotationId";

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [orderBy, setOrderBy] = useState<SortColumn>("When");
  const [isAscending, setIsAscending] = useState(false);

  const fetchLogs = async (page: number, search: string) => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        search,
        page: page.toString(),
        perPage: "15",
        orderBy,
        isAscending: isAscending.toString()
      });
      
      const response = await apiRequest<LogsResponse>({
        method: "get",
        url: `/api/Log/search?${queryParams}`,
      });

      if (response) {
        setLogs(response.logs);
        setTotalPages(Math.ceil(response.totalCount / response.perPage));
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch logs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(currentPage, searchTerm);
  }, [currentPage, searchTerm, orderBy, isAscending]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchLogs(1, searchTerm);
  };

  const handleSort = (column: SortColumn) => {
    if (orderBy === column) {
      setIsAscending(!isAscending);
    } else {
      setOrderBy(column);
      setIsAscending(true);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getVisiblePages = (currentPage: number, totalPages: number) => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  const handlePageJump = (direction: 'forward' | 'backward', amount: number) => {
    if (direction === 'forward') {
      const newPage = Math.min(currentPage + amount, totalPages);
      setCurrentPage(newPage);
    } else {
      const newPage = Math.max(currentPage - amount, 1);
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-4">
      <h1 className="text-2xl font-bold mb-4">System Logs</h1>
      
      <div className="flex justify-between items-center">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </form>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("When")}
                  className="flex items-center gap-1"
                >
                  When
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("WhoName")}
                  className="flex items-center gap-1"
                >
                  Who
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("What")}
                  className="flex items-center gap-1"
                >
                  Action
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("QuotationId")}
                  className="flex items-center gap-1"
                >
                  Quote ID
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No logs found
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{formatDate(log.when)}</TableCell>
                  <TableCell>{log.whoName}</TableCell>
                  <TableCell>{log.what}</TableCell>
                  <TableCell>{log.quotationId}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageJump('backward', 10)}
                className="cursor-pointer"
              >
                {"<<"}
              </PaginationPrevious>
            </PaginationItem>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageJump('backward', 1)}
                className="cursor-pointer"
              >
                {"<"}
              </PaginationPrevious>
            </PaginationItem>
            
            {getVisiblePages(currentPage, totalPages).map((pageNum, idx) => (
              <PaginationItem key={idx}>
                {pageNum === '...' ? (
                  <span className="px-4 py-2">...</span>
                ) : (
                  <PaginationLink
                    onClick={() => setCurrentPage(Number(pageNum))}
                    isActive={currentPage === pageNum}
                    className="cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageJump('forward', 1)}
                className="cursor-pointer"
              >
                {">"}
              </PaginationNext>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageJump('forward', 10)}
                className="cursor-pointer"
              >
                {">>"}
              </PaginationNext>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
} 