import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

interface ApiRequestOptions {
  method: "get" | "post" | "put" | "delete" | "patch";
  url: string;
  data?: any;
  headers?: Record<string, string>;
}

interface User {
  id: string;
  fullName: string;
  login: string;
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
}: ApiRequestOptions): Promise<T> => {
  try {
    const config: AxiosRequestConfig = {
      method,
      url: `${process.env.NEXT_PUBLIC_API_URL}${url}`,
      data,
      headers,
    };

    const response: AxiosResponse<T> = await axios(config);
    return response.data;
  } catch (error: any) {
    console.error("API Request Error:", error);
    if (error.response?.data) {
      throw new Error(typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data));
    }
    throw error;
  }
};

export const getUserList = async (search: string = "", page: number = 1, perpage: number = 12): Promise<PaginatedUsers> => {
  return apiRequest({
    method: "get",
    url: `/User/UserList?search=${encodeURIComponent(search)}&page=${page}&perpage=${perpage}`,
  });
};

export const updateUser = async (user: UserVM): Promise<string> => {
  return apiRequest({
    method: "put",
    url: "/User",
    data: user,
  });
};