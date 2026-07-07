export type WalletStatus = 'ACTIVE' | 'INACTIVE' | 'FROZEN';

export type WalletDateRange =
  | 'today'
  | 'yesterday'
  | 'last_7_days'
  | 'past_14_days'
  | 'last_30_days'
  | 'this_month'
  | 'custom';

export interface WalletCustomer {
  id:        string;
  firstName: string;
  lastName:  string;
  email:     string;
}

export interface WalletRaw {
  id:           string;
  public_id:    string;
  account_number: string;
  balance:      number;
  status?:      WalletStatus;
  totalFunded?: number;
  created_at:   string;   // ISO date string
  customer:     WalletCustomer | null;
}

export interface TopFundedWallet {
  id:               string;
  rank:             number;
  customer:         WalletCustomer;
  totalFunded:      number;
  lastFundedAmount: number;
}

export interface WalletStat {
  label:    string;
  value:    number | string;
  trend:    number | null;
  trendUp:  boolean;
  prefix?:  string;
}

export interface WalletMetricsData {
  total_wallets_created: number;
  total_funded_amount:   number;
  total_debit_amount:    number;
  total_transactions:    number;
}

export interface WalletMetricsResponse {
  statusCode:   number;
  status:       string;
  message:      string;
  data:         WalletMetricsData;
  responseCode: string;
}

// ─── Export ───────────────────────────────────────────────────────────────────

export interface WalletExportParams {
  page?:       number;
  limit?:      number;
  search?:     string;
  status?:     string;
  start_date?: string;
  end_date?:   string;
  sortField?:  string;
  sortOrder?:  'ASC' | 'DESC';
}

// ─── List response ──────────────────────────────────────────────────────────

export interface WalletMeta {
  page:       number;
  limit:      number;
  total:      number;
  totalPages: number;
}

export interface WalletListData {
  data: WalletRaw[];
  meta: WalletMeta;
}

export interface WalletListResponse {
  statusCode:   number;
  status:       string;
  message:      string;
  data:         WalletListData;
  responseCode: string;
}

// ─── List query params ───────────────────────────────────────────────────────

export interface WalletListParams {
  page?:         number;
  limit?:        number;
  search?:       string;
  status?:       string;
  custom_range?: WalletDateRange;
  start_date?:   string;
  end_date?:     string;
  sortField?:    string;
  sortOrder?:    'ASC' | 'DESC';
}

// ─── Wallet detail ────────────────────────────────────────

export interface WalletDetailCustomer {
  id:                        string;
  firstName:                 string;
  lastName:                  string;
  email:                     string;
  phone:                     string;
  gender?:                   string;
  religion?:                 string;
  bvn?:                      string;
  nin?:                      string | null;
  profile_image?:            string;
  bvnVerified?:              string | null;
  dateOfBirth?:              string;
  isActive?:                 boolean;
  is_bvn_verified?:          boolean;
  has_wallet?:               boolean;
  createdAt?:                string;
  updatedAt?:                string;
}

export interface WalletDetailRaw {
  id:                 string;
  customer_id:        string;
  customer:           WalletDetailCustomer;
  public_id:          string;
  account_number:     string;
  account_name:       string;
  bank_name:          string;
  bank_code:          string;
  available_balance:  number;
  balance:             number;
  on_hold:             number;
  created_at:          string;
  updated_at:          string;
}

export interface WalletDetailMetrics {
  total_funded:      number;
  total_spent:       number;
  transaction_count: number;
  last_funded_date:  string | null;
}

export interface WalletTransactionDetail {
  id:                 string;
  action_type:        'DEBIT' | 'CREDIT';
  top_up_method:      string;
  reference:          string;
  amount:             number;
  current_balance:    number;
  fee:                number;
  description:        string;
  status:             string;
  created_at:         string;
}

export interface WalletDetailData {
  wallet:              WalletDetailRaw;
  metrics:             WalletDetailMetrics;
  recent_transactions: WalletTransactionDetail[];
}

export interface WalletDetailResponse {
  statusCode:   number;
  status:       string;
  message:      string;
  data:         WalletDetailData;
  responseCode: string;
}