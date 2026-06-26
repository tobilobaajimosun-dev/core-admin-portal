// ─── Raw API response ─────────────────────────────────────────────────────────

export type TransactionType   = 'DEBIT' | 'CREDIT';
export type TransactionStatus = 'SUCCESSFUL' | 'PENDING' | 'FAILED' | 'REVERSED';
export type TransactionCategory =
  | 'Airtime'
  | 'Data Subscription'
  | 'Electricity'
  | 'TV Subscription'
  | 'Wallet Funding'
  | 'Transfer'
  | 'Loan Disbursement'
  | 'Loan Repayment';

export interface TransactionCustomer {
  id:        string;
  firstName: string;
  lastName:  string;
  email:     string;
}

export interface TransactionRaw {
  id:           string;
  reference_no: string;
  type:         TransactionType;
  category:     TransactionCategory;
  status:       TransactionStatus;
  amount:       number;
  createdAt:    string;
  customer:     TransactionCustomer;
}

export interface TransactionMeta {
  page:       number;
  limit:      number;
  total:      number;
  totalPages: number;
}

export interface TransactionListData {
  data: TransactionRaw[];
  meta: TransactionMeta;
}

export interface TransactionListResponse {
  statusCode:   number;
  status:       string;
  message:      string;
  data:         TransactionListData;
  responseCode: string;
}

// ─── Query params ─────────────────────────────────────────────────────────────

export type TransactionDateRange =
  | 'today'
  | 'yesterday'
  | 'last_7_days'
  | 'last_30_days'
  | 'custom';

export interface TransactionListParams {
  page?:         number;
  limit?:        number;
  search?:       string;
  type?:         string;
  category?:     string;
  status?:       string;
  custom_range?: TransactionDateRange;
  start_date?:   string;
  end_date?:     string;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface TransactionStat {
  label:   string;
  value:   number | string;
  trend:   number | null;
  trendUp: boolean;
  prefix?: string;
}

export interface TransactionWalletPayload {
  id:                   string;
  fee:                  number;
  amount:               number;
  status:               string;
  reference:            string;
  created_at:           string;
  action_type:          string;
  description:          string;
  top_up_method:        string;
  account_number:       string;
  current_balance:      number;
  available_balance:    number;
  customer_wallet_id:   string;
}

export interface TransactionTransactionable {
  id:                            string;
  reference_no:                  string;
  amount:                        number;
  provider:                      string;
  category:                      string;
  service:                       string;
  details:                       string | null;
  customer_id:                   string;
  status:                        string;
  tag:                           string;
  message:                       string | null;
  wallet_transaction_reference:  string;
  wallet_transaction_payload:    TransactionWalletPayload;
  createdAt:                     string;
  updatedAt:                     string;
  logoUrl:                       string;
}

export interface TransactionDetailRaw {
  id:                   string;
  reference_no:         string;
  amount:               number;
  transactionable_id:   string;
  transactionable_type: string;
  customer_id:          string;
  type:                 TransactionType;
  status:               TransactionStatus;
  external_customer_id: string | null;
  createdAt:            string;
  updatedAt:            string;
  transactionable:      TransactionTransactionable;
}

export interface TransactionDetailResponse {
  statusCode:   number;
  status:       string;
  message:      string;
  data:         TransactionDetailRaw;
  responseCode: string;
}