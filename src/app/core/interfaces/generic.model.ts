import { HttpHeaders } from '@angular/common/http';

export enum ROUTEMODULES {
  USERS = 'users/api/v1',
  ROLES = 'roles/api/v1',
  CUSTOMERS = 'customers/api/v1',
}

export type DynamicObjectType = {
  [key: string]: string | number | any;
};

export type DynamicType = string | number | boolean | DynamicObjectType | any[] | null;

export interface GenericApiResponse {
  status: string;
  message: string;
  data?: DynamicType;
}

export interface ApiResponse<T> {
  doc_url: string;
  status: string;
  message: string;
  data?: T;
}

export interface PaginatedSearchParams {
  page?: number;
  page_size?: number;
  search_text?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  role?: string;
}

export type HttpRequestOptionsType = DynamicObjectType & {
  headers: HttpHeaders;
};

interface PaginationLinks {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

export interface Pagination {
  total: number;
  count: number;
  perPage: number;
  currentPage: number;
  totalPages: number;
  links: PaginationLinks;
}

export interface BaseListConfig {
  page_size: number;
  page: number;
  search_text: string;
  start_date?: string;
  end_date?: string;
}

export interface ListConfig {
  page_size: number;
  page: number;
  search_text: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  shouldPaginate?: boolean;
  loan_product_status?: string;
  tenor_range?: string;
  export?: boolean | number;

  price?: string;
}

export interface BulkConfig {
  page_size: number;
  page: number;
  search_text?: string;
  is_bulk?: number;
  upload_history_id?: number;
}

export interface BulkConfig {
  page_size: number;
  page: number;
  search_text?: string;
  is_bulk?: number;
  upload_history_id?: number;
}

export interface Bank {
  name: string;
  code: string;
}

export interface ListActivityConfig {
  page_size: number;
  page: number;
}

export interface PresignedUrlResponse extends GenericApiResponse {
  data: { url: string; file_path: string };
}

export interface FileMetadata {
  file_name: string;
  file_type: string;
  tags?: string[];
}

export interface DeduktCompany {
  company_name: string;
  id: string;
  uuid: string;
}

export interface DeduktCompanyResponse {
  status: string;
  message: string;
  data: { company_name: string;  id: string; uuid: string }[];
}
