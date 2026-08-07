export interface ApiResponse<T> {
  statusCode?: number;
  status: string;
  message: string;
  responseCode?: string;
  data?: T;
}

/** Query params accepted by the Asset Flex admin list endpoints. */
export interface PaginatedSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Paginated list envelope: `data.data` is the page of items and
 * `data.pagination` carries the counters. Matches the Asset Flex admin API.
 */
export interface PaginatedResponse<T> {
  status: string;
  message: string;
  data: {
    data: T[];
    pagination: PaginationMeta;
  };
}
