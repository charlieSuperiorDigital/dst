import { adaptRequest } from "@/adapters/axios-request-adapter";

import { getServerSideApiClient } from "@/utils/server-side-api-client";

export const getAreaMaterialCost = async (id) => {
  const apiClient = await getServerSideApiClient();
  return adaptRequest(
    apiClient.get(`/api/Part/TotalMaterialCostPerArea/${id}`)
  );
};
