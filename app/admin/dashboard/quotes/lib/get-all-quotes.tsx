import { adaptRequest } from "@/adapters/axios-request-adapter";
import { PaginatedResponse } from "@/app/entities/Paginate-Response-Base";
import { Quotes } from "@/app/entities/Quotes";
import { getServerSideApiClient } from "@/utils/server-side-api-client";

export const getAllQoutes = async () => {
  const apiClient = await getServerSideApiClient();
  return adaptRequest<PaginatedResponse<Quotes, "quotations">>(
    apiClient.get("/api/quotation/1/10")
  );
};
