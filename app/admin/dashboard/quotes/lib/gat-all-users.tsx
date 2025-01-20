import { adaptRequest } from "@/adapters/axios-request-adapter";
import { PaginatedResponse } from "@/app/entities/Paginate-Response-Base";
import { Quotes } from "@/app/entities/Quotes";
import { getServerSideApiClient } from "@/utils/server-side-api-client";

export const getAllUsers = async () => {
  const apiClient = await getServerSideApiClient();
  return adaptRequest<PaginatedResponse<Quotes, "users">>(
    apiClient.get("/api/User/UserList?page=1&perpage=100")
  );
};
