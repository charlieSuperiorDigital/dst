import { adaptRequest } from "@/adapters/axios-request-adapter";

import { getServerSideApiClient } from "@/utils/server-side-api-client";

export const getBayDefinitions = async (id) => {
  const apiClient = await getServerSideApiClient();
  return adaptRequest(apiClient.get(`/api/definition/bay/${id}`));
};
