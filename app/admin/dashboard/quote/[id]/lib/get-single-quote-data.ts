import { adaptRequest } from "@/adapters/axios-request-adapter";
import { getServerSideApiClient } from "@/utils/server-side-api-client";

export async function getSingleQuoteData(id: string) {
  const apiClient = await getServerSideApiClient();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/Part/PartsFromQuotation/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiClient.defaults.headers.common["Authorization"]}`,
        "Content-Type": "application/json",
      },
      next: {
        revalidate: 300,
        tags: [`quote-${id}`], // Tag for manual revalidation
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch quote data");
  }

  const data = await response.json();
  return data;
}
