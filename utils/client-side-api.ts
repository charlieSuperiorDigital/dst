import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { getSession } from "next-auth/react";

interface ApiRequestOptions {
  method: "get" | "post" | "put" | "delete" | "patch";
  url: string;
  data?: any;
  headers?: Record<string, string>;
  responseType?: "json" | "blob" | "arraybuffer" | "text" | "stream";
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  active: boolean;
  verified: boolean;
}

interface UserVM {
  id: string;
  fullName: string;
  email: string;
  active?: boolean;
  verified?: boolean;
  password?: string;
}

interface PaginatedUsers {
  currentPage: number;
  perPage: number;
  totalCount: number;
  users: User[];
}

export const apiRequest = async <T = any>({
  method,
  url,
  data = null,
  headers = {},
  responseType = "json",
}: ApiRequestOptions): Promise<T> => {
  const session = await getSession();

  const updatedHeaders = {
    ...headers,
    Authorization: `Bearer ${session?.user?.token}`,
  };
  try {
    const config: AxiosRequestConfig = {
      method,
      url: `${process.env.NEXT_PUBLIC_API_URL}${url}`,
      data,
      headers: updatedHeaders,
      responseType,
    };

    const response: AxiosResponse<T> = await axios(config);
    return response.data;
  } catch (error: any) {
    console.error("API Request Error:", error);
    if (error.response?.data) {
      throw new Error(
        typeof error.response.data === "string"
          ? error.response.data
          : JSON.stringify(error.response.data)
      );
    }
    throw error;
  }
};

export const getUserList = async (
  queryParams: string
): Promise<PaginatedUsers> => {
  return apiRequest({
    method: "get",
    url: `/User/UserList?${queryParams}`,
  });
};

export const updateUser = async (user: UserVM): Promise<string> => {
  return apiRequest({
    method: "put",
    url: "/User",
    data: user,
  });
};
