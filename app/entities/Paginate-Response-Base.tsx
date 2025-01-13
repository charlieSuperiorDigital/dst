export interface PaginatedResponseBase {
  currentPage: number;
  perPage: number;
  totalCount: number;
}

export type PaginatedResponse<T, K extends string> = PaginatedResponseBase & {
  [key in K]: T[] | null;
};
