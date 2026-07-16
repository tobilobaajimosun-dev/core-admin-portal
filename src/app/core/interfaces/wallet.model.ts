export type WalletStatus = 'ACTIVE' | 'INACTIVE' | 'FROZEN';

export type WalletDateRange =
  | 'today'
  | 'yesterday'
  | 'this_week'
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
  total_funded_amount?: number;  
  created_at:   string;   // ISO date string
  customer:     WalletCustomer | null;
}

export interface WalletStat {
  label:    string;
  value:    number | string;
  trend:    number | null;
  trendUp:  boolean;
  prefix?:  string;
  tooltipDescription: string;

}

export interface WalletMetricsData {
  total_wallets_created: number;
  total_active_wallet:   number;
  total_inactive_wallet: number;
  total_funded_amount:   number;
  total_debit_amount:    number;
  total_transactions:    number;
  custom_range?:         string;
  period_start?:         string;
  period_end?:           string;
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
  status?:             WalletStatus;
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

// ─── Adjust balance (credit/debit) ───────────────────────────────────────────

export type WalletAdjustActionType = 'CREDIT' | 'DEBIT';

export interface WalletAdjustParams {
  action_type:   WalletAdjustActionType;
  top_up_method: string;
  amount:        number;
  description:   string;
}

export interface WalletAdjustData {
  wallet:      WalletDetailRaw;
  transaction: WalletTransactionDetail;
}

export interface WalletAdjustResponse {
  statusCode:   number;
  status:       string;
  message:      string;
  data:         WalletAdjustData;
  responseCode: string;
}

// ─── Update status (freeze / unfreeze) ───────────────────────────────────────

export interface WalletStatusUpdateParams {
  status: WalletStatus;
}

export interface WalletStatusUpdateResponse {
  statusCode:   number;
  status:       string;
  message:      string;
  data:         WalletDetailRaw;
  responseCode: string;
}

export interface TopFundedWalletCustomer {
  firstName: string;
  lastName:  string;
  email:     string;
  phone:     string;
}

export interface TopWalletBalanceRaw {
  rank:              number;
  wallet_id:         string;
  customer_id:       string;
  balance:           number;
  available_balance: number;
  status:            WalletStatus;
  account_number:    string;
  account_name:      string;
  customer:          TopFundedWalletCustomer;
}

export interface TopFundedWalletsData {
  top_wallet_balances: TopWalletBalanceRaw[];
}

export interface TopFundedWalletsResponse {
  statusCode:   number;
  status:       string;
  message:      string;
  data:         TopFundedWalletsData;
  responseCode: string;
}

export interface TopFundedWallet {
  id:            string;   // wallet_id
  rank:          number;
  balance:       number;
  availableBalance: number;
  accountNumber: string;
  accountName:   string;
  status:        WalletStatus;
  customer:      TopFundedWalletCustomer;
}