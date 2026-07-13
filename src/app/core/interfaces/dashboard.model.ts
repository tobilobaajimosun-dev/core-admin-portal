// ─── Raw API response shapes ──────────────────────────────────────────────────

export interface DashboardCardCountRaw {
  count:   number;
  average: number; // % change vs previous period
}

export interface DashboardCardAmountRaw {
  amount:  number;
  average: number;
}

export interface DashboardCardCountAmountRaw {
  count:   number;
  amount:  number;
  average: number;
}

// ── Nested group shapes ───────────────────────────────────────────────────────

export interface DashboardWalletsData {
  created:       DashboardCardCountAmountRaw;
  funded:        DashboardCardCountAmountRaw;
  total_balance: DashboardCardCountAmountRaw;
}

export interface DashboardTransactionsData {
  total_amount: DashboardCardCountAmountRaw;
  inflow:       DashboardCardCountAmountRaw;
  outflow:      DashboardCardCountAmountRaw;
}

export interface DashboardBillingsData {
  total:        DashboardCardCountAmountRaw;
  successful:   DashboardCardCountAmountRaw;
  success_rate: DashboardCardCountAmountRaw;
}

export interface DashboardCardsData {
  // Flat numbers (no trend)
  total_customers?:      number;
  monthly_active_users?: number;
  daily_active_users?:   number;
  // Count + trend
  new_sign_ups?:          DashboardCardCountRaw;
  completed_kyc?:         DashboardCardCountRaw;
  pending_kyc?:           DashboardCardCountRaw;
  new_loan_applications?: DashboardCardCountRaw;
  disbursed_loans?:       DashboardCardCountRaw;
  // Amount + trend
  disbursed_loan_amount?: DashboardCardAmountRaw;
  // Nested groups
  wallets?:      DashboardWalletsData;
  transactions?: DashboardTransactionsData;
  billings?:     DashboardBillingsData;
}

export interface DashboardCardsResponse {
  statusCode:   number;
  status:       string;
  message:      string;
  data:         DashboardCardsData;
  responseCode: string;
}

// ─── View model ───────────────────────────────────────────────────────────────

export interface DashboardStatCard {
  key:      string;        // unique dotted path e.g. "wallets.created"
  label:    string;
  value:    number;
  trend:    number | null; // % change, null = not available
  trendUp:  boolean;
  isAmount: boolean;       // true → format as currency
}

// ─── Query params ─────────────────────────────────────────────────────────────

export type DashboardCustomRange =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'this_month'
  | 'custom';

export interface DashboardCardParams {
  page?:         number;
  limit?:        number;
  email?:        string;
  custom_range?: DashboardCustomRange;
  start_date?:   string;
  end_date?:     string;
}

// ─── Card definitions ─────────────────────────────────────────────────────────
// Single source of truth: order, label, amount flag, and how to extract from raw data.

export interface CardDefinition {
  key:      string;
  label:    string;
  isAmount: boolean;
  /** Returns { value, trend } from raw DashboardCardsData, or null if field is absent */
  extract: (data: DashboardCardsData) => { value: number; trend: number | null } | null;
}

export const CARD_DEFINITIONS: CardDefinition[] = [
  // ── User counts (flat, no trend) ──────────────────────────────────────────
  {
    key: 'total_customers', label: 'Number of Users till Date', isAmount: false,
    extract: (d) => d.total_customers != null
      ? { value: d.total_customers, trend: null }
      : null,
  },
  {
    key: 'monthly_active_users', label: 'Monthly Active Users', isAmount: false,
    extract: (d) => d.monthly_active_users != null
      ? { value: d.monthly_active_users, trend: null }
      : null,
  },
  {
    key: 'daily_active_users', label: 'Daily Active Users', isAmount: false,
    extract: (d) => d.daily_active_users != null
      ? { value: d.daily_active_users, trend: null }
      : null,
  },
  // ── Sign-ups / KYC ────────────────────────────────────────────────────────
  {
    key: 'new_sign_ups', label: 'New Sign Ups', isAmount: false,
    extract: (d) => d.new_sign_ups != null
      ? { value: d.new_sign_ups.count, trend: d.new_sign_ups.average }
      : null,
  },
  {
    key: 'completed_kyc', label: 'Completed KYC', isAmount: false,
    extract: (d) => d.completed_kyc != null
      ? { value: d.completed_kyc.count, trend: d.completed_kyc.average }
      : null,
  },
  {
    key: 'pending_kyc', label: 'Pending KYC', isAmount: false,
    extract: (d) => d.pending_kyc != null
      ? { value: d.pending_kyc.count, trend: d.pending_kyc.average }
      : null,
  },
  // ── Loans ─────────────────────────────────────────────────────────────────
  {
    key: 'new_loan_applications', label: 'Loan Applications', isAmount: false,
    extract: (d) => d.new_loan_applications != null
      ? { value: d.new_loan_applications.count, trend: d.new_loan_applications.average }
      : null,
  },
  {
    key: 'disbursed_loans', label: 'Loans Disbursed', isAmount: false,
    extract: (d) => d.disbursed_loans != null
      ? { value: d.disbursed_loans.count, trend: d.disbursed_loans.average }
      : null,
  },
  {
    key: 'disbursed_loan_amount', label: 'Amount Disbursed', isAmount: true,
    extract: (d) => d.disbursed_loan_amount != null
      ? { value: d.disbursed_loan_amount.amount, trend: d.disbursed_loan_amount.average }
      : null,
  },
  // ── Wallets ───────────────────────────────────────────────────────────────
  {
    key: 'wallets.created', label: 'Wallets Created', isAmount: false,
    extract: (d) => d.wallets?.created != null
      ? { value: d.wallets.created.count, trend: d.wallets.created.average }
      : null,
  },
  {
    key: 'wallets.funded', label: 'Wallets Funded', isAmount: false,
    extract: (d) => d.wallets?.funded != null
      ? { value: d.wallets.funded.count, trend: d.wallets.funded.average }
      : null,
  },
  {
    key: 'wallets.amount_funded', label: 'Amount Funded', isAmount: true,
    extract: (d) => d.wallets?.funded != null
      ? { value: d.wallets.funded.amount, trend: d.wallets.funded.average }
      : null,
  },
  // ── Transactions ──────────────────────────────────────────────────────────
  {
    key: 'transactions.total_amount', label: 'Total Transaction Amount', isAmount: true,
    extract: (d) => d.transactions?.total_amount != null
      ? { value: d.transactions.total_amount.amount, trend: d.transactions.total_amount.average }
      : null,
  },
  {
    key: 'transactions.inflow', label: 'Inflow Amount', isAmount: true,
    extract: (d) => d.transactions?.inflow != null
      ? { value: d.transactions.inflow.amount, trend: d.transactions.inflow.average }
      : null,
  },
  {
    key: 'transactions.outflow', label: 'Outflow Amount', isAmount: true,
    extract: (d) => d.transactions?.outflow != null
      ? { value: d.transactions.outflow.amount, trend: d.transactions.outflow.average }
      : null,
  },
  // ── Billings / VAS ────────────────────────────────────────────────────────
  {
    key: 'billings.total_count', label: 'Number of VAS Transactions', isAmount: false,
    extract: (d) => d.billings?.total != null
      ? { value: d.billings.total.count, trend: d.billings.total.average }
      : null,
  },
  {
    key: 'billings.total_amount', label: 'VAS Transaction Amount', isAmount: true,
    extract: (d) => d.billings?.total != null
      ? { value: d.billings.total.amount, trend: d.billings.total.average }
      : null,
  },
  {
    key: 'billings.success_rate', label: 'VAS Success Rate', isAmount: false,
    extract: (d) => d.billings?.success_rate != null
      ? { value: d.billings.success_rate.count, trend: d.billings.success_rate.average }
      : null,
  },
];

// ─── Convenience label map (key → label) — kept for any legacy consumers ──────
export const DASHBOARD_CARD_LABELS: Record<string, string> = Object.fromEntries(
  CARD_DEFINITIONS.map(({ key, label }) => [key, label])
);

// ─── Daily Performance ────────────────────────────────────────────────────────

export interface DailyPerformanceProduct {
  id:                     string;
  title:                  string;
  description:            string;
  employer_type:          string;
  product_tag:            string;
  interest_rate:          number;
  is_active:              boolean;
  min_loan_amount:        number;
  max_loan_amount:        number;
  total_disbursed_amount: number;
  total_disbursed_count:  number;
}

export interface DailyPerformanceData {
  data: DailyPerformanceProduct[];
}

export interface DailyPerformanceResponse {
  statusCode:   number;
  status:       string;
  message:      string;
  data:         DailyPerformanceData | null;
  responseCode: string;
}

// ─── Recent Loan Applications ─────────────────────────────────────────────────

export interface LoanCustomer {
  id:              string;
  firstName:       string;
  lastName:        string;
  email:           string;
  phone:           string;
  is_bvn_verified: boolean;
}

export interface LoanProduct {
  id:            string;
  title:         string;
  product_tag:   string;
  employer_type: string;
  interest_rate: number;
  is_active:     boolean;
}

export interface RecentLoan {
  id:               string;
  customer_id:      string;
  product_id:       string;
  product_tag:      string;
  reference_no:     string;
  loan_id:          string | null;
  partner_loan_id:  string | null;
  loan_amount:      number;
  loan_duration:    number;
  repayment_amount: number;
  status:           string;
  start_date:       string;
  end_date:         string;
  unique_loan_id:   string | null;
  disbursedAt:      string | null;
  createdAt:        string;
  updatedAt:        string;
  customer:         LoanCustomer;
  product:          LoanProduct;
}

export interface RecentLoansMeta {
  page:            number;
  limit:           number;
  total:           number;
  totalPages:      number;
  hasNextPage:     boolean;
  hasPreviousPage: boolean;
}

export interface RecentLoansResponse {
  statusCode:   number;
  status:       string;
  message:      string;
  data: {
    data: RecentLoan[];
    meta: RecentLoansMeta;
  } | null;
  responseCode: string;
}

export interface RecentLoansParams {
  page?:        number;
  limit?:       number;
  search?:      string;
  status?:      string;
  product_id?:  string;
  customer_id?: string;
  start_date?:  string;
  end_date?:    string;
}

// ─── Transaction History ──────────────────────────────────────────────────────

export interface TransactionCustomer {
  id:              string;
  firstName:       string;
  lastName:        string;
  email:           string;
  phone:           string;
  is_bvn_verified: boolean;
}

export interface TransactionableDetail {
  type:            string; // 'bill' | 'wallet'
  id:              string;
  reference_no:    string;
  amount:          number;
  // bill-specific
  provider?:       string;
  category?:       string;
  service?:        string;
  status?:         string;
  tag?:            string;
  message?:        string | null;
  // wallet-specific
  account_number?: string;
  action_type?:    string;
  createdAt:       string;
}

export interface Transaction {
  id:                   string;
  customer_id:          string;
  reference_no:         string;
  amount:               number;
  type:                 string; // DEBIT | CREDIT
  transactionable_type: string; // bill | wallet
  transactionable_id:   string;
  external_customer_id: string | null;
  status:               string; // SUCCESS | FAILED | PENDING | PROCESSING
  createdAt:            string;
  updatedAt:            string;
  customer:             TransactionCustomer;
  transactionable:      TransactionableDetail;
}

export interface TransactionsMeta {
  page:            number;
  limit:           number;
  total:           number;
  totalPages:      number;
  hasNextPage:     boolean;
  hasPreviousPage: boolean;
}

export interface TransactionsResponse {
  statusCode:   number;
  status:       string;
  message:      string;
  data: {
    data: Transaction[];
    meta: TransactionsMeta;
  } | null;
  responseCode: string;
}

export interface TransactionsParams {
  page?:                 number;
  limit?:                number;
  search?:               string;
  status?:               string;
  type?:                 string;
  transactionable_type?: string;
  customer_id?:          string;
  start_date?:           string;
  end_date?:             string;
}