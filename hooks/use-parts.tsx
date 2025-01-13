import { useEffect, useState } from "react";
import { apiRequest } from "@/utils/client-side-api";

export const useParts = (initialPartsResponse) => {
  const [partsResponse, setPartsResponse] = useState(initialPartsResponse);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchParts = async (page: number, search: string) => {
    try {
      const response = await apiRequest({
        method: "get",
        url: `/api/part/${page}/10?search=${search}`,
      });
      setPartsResponse(response);
    } catch (error) {
      console.error("Error fetching parts:", error);
    }
  };

  useEffect(() => {
    fetchParts(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  return {
    partsResponse,
    currentPage,
    setCurrentPage,
    searchTerm,
    setSearchTerm,
    fetchParts,
  };
};
