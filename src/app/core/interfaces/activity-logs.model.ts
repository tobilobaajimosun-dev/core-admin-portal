export type DateCreatedFilter =
  | 'past_7_days'
  | 'past_14_days'
  | 'past_30_days'
  | 'past_90_days'
  | 'past_year'
  | 'custom_range';

export interface ActivityLog {
  id:          string;
  action:      string;
  actor_id:    string | null;
  entity_id:   string | null;
  old_values:  Record<string, unknown> | null;
  new_values:  Record<string, unknown> | null;
  route:       string;
  description: string;
  ip_address:  string;
  user_agent:  string;
  created_at:  string;
}

export interface ActivityLogPagination {
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
}

export interface ListActivityLogsConfig {
  page?:                number;
  limit?:               number;
  search?:              string;
  sortBy?:              string;
  sortOrder?:           'asc' | 'desc';
  start_date?:          string;
  end_date?:            string;
  date_created_filter?: DateCreatedFilter;
}