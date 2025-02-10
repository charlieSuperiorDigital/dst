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

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async (page: number, search: string) => {
    try {
      setIsLoading(true);
      const response = await apiRequest<LogsResponse>({
        method: "post",
        url: "/api/Log",
        data: {
          search: search,
          page: page,
          perpage: 15,
          quotationId: null
        },
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
  }, [currentPage, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchLogs(1, searchTerm);
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
              <TableHead>When</TableHead>
              <TableHead>Who</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Quote ID</TableHead>
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