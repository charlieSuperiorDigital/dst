import { adaptRequest } from "@/adapters/axios-request-adapter";
import { Part } from "@/app/entities/Part";
import { PaginatedResponse } from "@/app/entities/Paginate-Response-Base";
import { getServerSideApiClient } from "@/utils/server-side-api-client";

export const getAllParts = async () => {
  const apiClient = await getServerSideApiClient();
  return adaptRequest<PaginatedResponse<Part, "parts">>(
    apiClient.get("/api/Part/1/15")
  );
};
