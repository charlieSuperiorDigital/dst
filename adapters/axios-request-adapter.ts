import { ServerSideApiClientError } from "@/utils/server-side-api";
import { ServerSideResult } from "@/utils/server-side-result";
import { AxiosResponse } from "axios";

export const adaptRequest = async <T>(
  axiosResponse: Promise<AxiosResponse<T>>
): Promise<ServerSideResult<T>> => {
  try {
    const { data } = await axiosResponse;

    return { result: data };
  } catch (error) {
    if (error instanceof ServerSideApiClientError) {
      return { signout: true, result: null };
    }

    return { result: null };
  }
};
