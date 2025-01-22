import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import axios, { AxiosError } from "axios";
import { getServerSession } from "next-auth";

type ServerSideApiClientErrorCode =
  | "INVALID_REFRESH_TOKEN"
  | "UNEXPECTED_ERROR";

export class ServerSideApiClientError {
  readonly code: ServerSideApiClientErrorCode;
  readonly error: AxiosError;

  constructor(code: ServerSideApiClientErrorCode, error: AxiosError) {
    this.code = code;
    this.error = error;
  }
}

type RefreshAccessTokenResult = {
  accessToken: string;
};

export async function getServerSideApiClient() {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
  });

  const session = await getServerSession(authOptions);
  const token = session?.user?.token;
  if (token) {
    client.interceptors.request.use((config) => {
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }

  let refreshed = false;

  client.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      if (refreshed) {
        return Promise.reject(
          new ServerSideApiClientError("INVALID_REFRESH_TOKEN", error)
        );
      }

      if (error.response?.status === 401 && session?.user.refreshToken) {
        refreshed = true;
        try {
          const { data } = await client.post<RefreshAccessTokenResult>(
            "auth/refresh",
            {
              refreshToken: session?.user.refreshToken,
            }
          );

          if (error.config) {
            error.config.headers.Authorization = `Bearer ${data.accessToken}`;
            return axios.request(error.config);
          }
        } catch (err) {
          return Promise.reject(
            new ServerSideApiClientError("UNEXPECTED_ERROR", err as AxiosError)
          );
        }
      }

      if (error.response?.status === 401) {
        return Promise.reject(
          new ServerSideApiClientError("INVALID_REFRESH_TOKEN", error)
        );
      }

      return Promise.reject(error);
    }
  );

  return client;
}
