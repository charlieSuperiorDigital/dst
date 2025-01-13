import { useEffect, useState } from "react";
import { apiRequest } from "@/utils/client-side-api";
import { toast } from "./use-toast";

export const useQuotes = (initialPartsResponse) => {
  const [QuotesResponse, setQuotesResponse] = useState(initialPartsResponse);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchQuotes = async (page: number, search: string) => {
    try {
      const response = await apiRequest({
        method: "get",
        url: `/api/quotation/${page}/10?search=${search}`,
      });
      setQuotesResponse(response);
    } catch (error) {
      console.error("Error fetching parts:", error);
      toast({
        title: "Error",
        description: "Error getting quotes.",
      });
    }
  };

  useEffect(() => {
    fetchQuotes(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  return {
    QuotesResponse,
    currentPage,
    setCurrentPage,
    searchTerm,
    setSearchTerm,
    fetchQuotes,
  };
};
