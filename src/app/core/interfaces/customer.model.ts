// ─── Raw API response ─────────────────────────────────────────────────────────

export interface CustomerRaw {
  id:                        string;
  firstName:                 string;
  lastName:                  string;
  email:                     string | null;
  phone:                     string | null;
  gender:                    string | null;
  religion:                  string | null;
  dateOfBirth:               string | null;
  bvn:                       string | null;
  nin:                       string | null;
  bvnVerified:               string | null;   // ISO date string, not boolean
  is_bvn_verified:           boolean;
  emailVerified:             string | null;   // ISO date string, not boolean
  isActive:                  boolean;
  has_loan:                  boolean;
  has_wallet:                boolean;
  has_external_id_for_loan:  boolean;
  profile_image:             string | null;
  customer_external_uuid:    string | null;
  transaction_pin_hash:      string | null;
  deletedAt:                 string | null;
  createdAt:                 string;
  updatedAt:                 string;
  // relations
  kycs:                      null;
  loan_kyc_detail:           LoanKycDetail | null;
  customer_identity:         CustomerIdentity | null;
  customer_document_uploads: CustomerDocumentUpload[];
  customer_wallets:          CustomerWallet | null;
}

export interface CustomerMeta {
  page:       number;
  limit:      number;
  total:      number;
  totalPages: number;
}

export interface CustomerListData {
  data: CustomerRaw[];
  meta: CustomerMeta;
}

export interface CustomerListResponse {
  statusCode:   number;
  status:       string;
  message:      string;
  data:         CustomerListData;
  responseCode: string;
}

// ─── Query params ─────────────────────────────────────────────────────────────

export type CustomerCustomRange =
  | 'today'
  | 'yesterday'
  | 'past_7_days'
  | 'this_month'
  | 'custom';

export interface CustomerListParams {
  page?:         number;
  limit?:        number;
  email?:        string;
  search?:       string;
  custom_range?: CustomerCustomRange;
  kyc_status?:   string;
  loan_status?:  string;
  start_date?:   string;
  end_date?:     string;
}

// ─── Single customer response ─────────────────────────────────────────────────

export interface CustomerLoanCount {
  total: string;
}

export interface CustomerDetailData {
  customer:    CustomerRaw;
  loan_count:  CustomerLoanCount;
  active_loan: CustomerLoanCount;
}

export interface CustomerDetailResponse {
  statusCode:   number;
  status:       string;
  message:      string;
  data:         CustomerDetailData;
  responseCode: string;
}

// ─── Nested relation types ────────────────────────────────────────────────────

export interface SalaryPaymentType {
  id:           string;
  title:        string;
  tag:          string;
  verifier:     string;
  company_uuid: string | null;
  description:  string;
  createdAt:    string;
  updatedAt:    string;
}

export interface LoanKycDetail {
  id:                       string;
  email:                    string;
  pass_out_date:            string | null;
  identity_or_phone_number: string | null;
  bank_code:                string | null;
  bank_account_number:      string | null;
  customer_id:              string;
  salary_payment_type_id:   string | null;
  salary_payment_type:      SalaryPaymentType | null;
  job_option:               string | null;
  createdAt:                string;
  updatedAt:                string;
}

export interface CustomerIdentity {
  id:              string;
  identity_type:   string;
  identity_number: string;
  customer_id:     string;
  createdAt:       string;
  updatedAt:       string;
}

export interface CustomerDocumentUpload {
  id:                   string;
  image_link:           string;
  customer_id:          string;
  customer_identity_id: string;
  createdAt:            string;
  updatedAt:            string;
}

export interface CustomerWallet {
  id:                string;
  customer_id:       string;
  public_id:         string;
  account_number:    string;
  account_name:      string;
  bank_name:         string;
  bank_code:         string;
  available_balance: number;
  balance:           number;
  created_at:        string;
  updated_at:        string;
}

// ─── Financial Summary ────────────────────────────────────────────────────────

export interface CustomerWalletSummary {
  wallet_created_status: boolean;
  current_balance:       number;
  funded:                number;
  spent:                 number;
}

export interface CustomerLoanSummary {
  active:   number;
  borrowed: number;
  repaid:   number;
}

export interface CustomerFinancialSummaryData {
  wallet_detail: CustomerWalletSummary;
  loans:         CustomerLoanSummary;
  vas:           number;
}

export interface CustomerFinancialSummaryResponse {
  statusCode:   number;
  status:       string;
  message:      string;
  data:         CustomerFinancialSummaryData;
  responseCode: string;
}

// ─── Customer Loans ───────────────────────────────────────────────────────────

export interface LoanProduct {
  id:            string;
  title:         string;
  product_tag:   string;
  employer_type: string;
  interest_rate: number;
  is_active:     boolean;
}

export interface LoanCustomer {
  id:              string;
  firstName:       string;
  lastName:        string;
  email:           string;
  phone:           string;
  is_bvn_verified: boolean;
}

export interface CustomerLoanRaw {
  id:               string;
  customer_id:      string;
  product_id:       string;
  product_tag:      string;
  reference_no:     string;
  loan_id:          string | null;
  partner_loan_id:  string;
  loan_amount:      number;
  loan_duration:    number;         // tenor in months
  repayment_amount: number;
  status:           string;
  start_date:       string | null;
  end_date:         string | null;
  unique_loan_id:   string;
  disbursedAt:      string | null;
  createdAt:        string;
  updatedAt:        string;
  customer:         LoanCustomer;
  product:          LoanProduct;
}

export interface CustomerLoanMeta {
  page:            number;
  limit:           number;
  total:           number;
  totalPages:      number;
  hasNextPage:     boolean;
  hasPreviousPage: boolean;
}

export interface CustomerLoanListData {
  data: CustomerLoanRaw[];
  meta: CustomerLoanMeta;
}

export interface CustomerLoanListResponse {
  statusCode:   number;
  status:       string;
  message:      string;
  data:         CustomerLoanListData;
  responseCode: string;
}

export interface CustomerLoanListParams {
  page?:       number;
  limit?:      number;
  search?:     string;
  status?:     string;
  start_date?: string;
  end_date?:   string;
}

// ─── Customer Transactions ────────────────────────────────────────────────────

export interface TransactionableBill {
  type:         'bill';
  id:           string;
  reference_no: string;
  amount:       number;
  provider:     string;
  category:     string;
  service:      string;
  status:       string;
  tag:          string;
  message:      string | null;
  createdAt:    string;
}

export interface TransactionableLoanProduct {
  id:          string;
  title:       string;
  product_tag: string;
  image:       string;
}

export interface TransactionableLoan {
  type:             'loan';
  id:               string;
  reference_no:     string;
  loan_amount:      number;
  loan_duration:    number;
  repayment_amount: number;
  status:           string;
  product_tag:      string;
  partner_loan_id:  string;
  createdAt:        string;
  product:          TransactionableLoanProduct;
}

export interface CustomerTransactionRaw {
  id:                   string;
  customer_id:          string;
  reference_no:         string;
  amount:               number;
  type:                 string;   // 'DEBIT' | 'CREDIT' | 'loan'
  status:               string;   // 'PENDING' | 'COMPLETED' | 'FAILED'
  transactionable_type: string;   // 'bill' | 'loan'
  transactionable_id:   string;
  external_customer_id: string | null;
  createdAt:            string;
  updatedAt:            string;
  customer:             LoanCustomer;
  transactionable:      TransactionableBill | TransactionableLoan | null;
}

export interface CustomerTransactionMeta {
  page:            number;
  limit:           number;
  total:           number;
  totalPages:      number;
  hasNextPage:     boolean;
  hasPreviousPage: boolean;
}

export interface CustomerTransactionListData {
  data: CustomerTransactionRaw[];
  meta: CustomerTransactionMeta;
}

export interface CustomerTransactionListResponse {
  statusCode:   number;
  status:       string;
  message:      string;
  data:         CustomerTransactionListData;
  responseCode: string;
}

export interface CustomerTransactionListParams {
  page?:       number;
  limit?:      number;
  search?:     string;
  type?:       string;
  status?:     string;
  start_date?: string;
  end_date?:   string;
}

// ─── Customer Metrics ─────────────────────────────────────────────────────────

export interface CustomerMetricItem {
  count:   number;
  average: number;
}

export interface CustomerMetricsData {
  customers: {
    total:                CustomerMetricItem;
    bvn_verified:         CustomerMetricItem;
    transaction_active:   CustomerMetricItem;
    transaction_inactive: CustomerMetricItem;
  };
}

export interface CustomerMetricsResponse {
  statusCode:   number;
  status:       string;
  message:      string;
  data:         CustomerMetricsData;
  responseCode: string;
}

// ─── Needs Attention ──────────────────────────────────────────────────────────

export type CustomerIssue =
  | 'INCOMPLETE_BVN_VERIFICATION'
  | 'INCOMPLETE_WALLET_CREATION'
  | 'INCOMPLETE_ACCOUNT_CREATION_ON_CALTOS';

export interface CustomerNeedsActionRaw {
  id:                     string;
  firstName:              string;
  lastName:               string;
  email:                  string;
  phone:                  string;
  isActive:               boolean;
  is_bvn_verified:        boolean;
  has_wallet:             boolean;
  customer_external_uuid: string | null;
  createdAt:              string;
  issue:                  CustomerIssue;
}

export interface CustomerNeedsActionMeta {
  page:            number;
  limit:           number;
  total:           number;
  totalPages:      number;
  hasNextPage:     boolean;
  hasPreviousPage: boolean;
}

export interface CustomerNeedsActionListData {
  data: CustomerNeedsActionRaw[];
  meta: CustomerNeedsActionMeta;
}

export interface CustomerNeedsActionListResponse {
  statusCode:   number;
  status:       string;
  message:      string;
  data:         CustomerNeedsActionListData;
  responseCode: string;
}

export interface CustomerNeedsActionParams {
  page?:  number;
  limit?: number;
  search?: string;
}

// ─── Delete/Suspend Customer ───────────────────────────────────────────────────

export interface CustomerDeleteData {
  id:         string;
  customerId : string
  deleted_at: string;
}

export interface CustomerDeleteResponse {
  statusCode:   number;
  status:       string;
  message:      string;
  data:         CustomerDeleteData;
  responseCode: string;
}

// ─── Customer Recent Activity ─────────────────────────────────────────────────

export interface CustomerActivityRequestMetadata {
  action:  string;
  payload: Record<string, unknown>;
}

export interface CustomerActivityMetadata {
  request: CustomerActivityRequestMetadata;
}

export interface CustomerActivityRaw {
  id:            string;
  customer_id:   string;
  action:        string;
  module:        string;
  status:        string;
  description:   string;
  metadata:      CustomerActivityMetadata;
  ip_address:    string | null;
  user_agent:    string | null;
  duration_ms:   number;
  error_message: string | null;
  createdAt:     string;
}

export interface CustomerActivityMeta {
  page:            number;
  limit:           number;
  total:           number;
  totalPages:      number;
  hasNextPage:     boolean;
  hasPreviousPage: boolean;
}

export interface CustomerActivityListData {
  data: CustomerActivityRaw[];
  meta: CustomerActivityMeta;
}

export interface CustomerActivityListResponse {
  statusCode:   number;
  status:       string;
  message:      string;
  data:         CustomerActivityListData;
  responseCode: string;
}

export interface CustomerActivityListParams {
  page?:       number;
  limit?:      number;
  search?:     string;
  module?:     string;
  start_date?: string;
  end_date?:   string;
}