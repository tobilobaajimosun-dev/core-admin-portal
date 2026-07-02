// NOTE: Mirrors the implied shape of '@core/interfaces/transaction.model'.
// Adjust field names to match your actual API response shape once available
// (similar correction cycles happened for customer.model.ts based on real API data).

export type WalletStatus = 'ACTIVE' | 'INACTIVE' | 'FROZEN';

export type WalletDateRange =
  | 'today'
  | 'yesterday'
  | 'last_7_days'
  | 'past_14_days'
  |'last_30_days'
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
  walletId:     string;
  status:       WalletStatus;
  balance:      number;
  totalFunded:  number;
  createdAt:    string;   // ISO date string
  customer:     WalletCustomer;
}

export interface TopFundedWallet {
  id:           string;
  rank:         number;
  customer:     WalletCustomer;
  totalFunded:  number;
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