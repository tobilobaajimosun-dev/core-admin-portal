// ─── Raw API response ─────────────────────────────────────────────────────────

export type LoanStatusRaw = 'NEW' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'ACTIVE' | 'PENDING';

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

export interface LoanRaw {
  id:                string;
  customer_id:       string;
  product_id:        string;
  product_tag:       string;
  reference_no:      string;
  loan_id:           string | null;
  partner_loan_id:   string;
  loan_amount:       number;
  loan_duration:     number;
  repayment_amount:  number;
  status:            LoanStatusRaw;
  start_date:        string;
  end_date:          string;
  unique_loan_id:    string;
  disbursedAt:       string | null;
  createdAt:         string;
  updatedAt:         string;
  customer:          LoanCustomer;
  product:           LoanProduct;
}

export interface LoanMeta {
  page:            number;
  limit:           number;
  total:           number;
  totalPages:      number;
  hasNextPage:     boolean;
  hasPreviousPage: boolean;
}

export interface LoanListData {
  data: LoanRaw[];
  meta: LoanMeta;
}

export interface LoanListResponse {
  statusCode:   number;
  status:       string;
  message:      string;
  data:         LoanListData;
  responseCode: string;
}

// ─── Query params ─────────────────────────────────────────────────────────────

export type LoanDateRange =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'this_month'
  | 'past_3_months'
  | 'past_6_months'
  | 'this_year'
  | 'custom';

export interface LoanListParams {
  page?:         number;
  limit?:        number;
  search?:       string;
  status?:       string;
  custom_range?: LoanDateRange;
  start_date?:   string;
  end_date?:     string;
  tenor?:        string | number;
  product?:    string;
  min_amount?: number;
  max_amount?: number;
}

export interface LoanView {
  id:               string;
  applicationDate:  string;
  applicationTime:  string;
  customerName:     string;
  customerEmail:    string;
  initials:         string;
  loanId:           string;
  amount:           string;
  tenor:            string;
  product:          string;
  status:           string;
}

// ─── Loan Metrics ─────────────────────────────────────────────────────────────

export interface LoanMetricsData {
  total_loan_applications: number;
  total_disbursed_loans:   number;
  total_active_loans:      number;
  total_outstanding_balance: number;
  total_repaid:            number;
  rate_of_defaulting:      number;
}

export interface LoanMetricsResponse {
  statusCode:   number;
  status:       string;
  message:      string;
  data:         LoanMetricsData;
  responseCode: string;
}

export interface FailedDisbursementRaw {
  id:               string;
  customer_id:      string;
  product_id:       string;
  product_tag:      string;
  loan_amount:      number;
  loan_duration:    number;
  unique_loan_id:   string | null;
  status:           LoanStatusRaw;
  failure_reason:   string | null;
  createdAt:        string;
  updatedAt:        string;
  customer:         LoanCustomer;
  product:          LoanProduct;
}

export interface FailedDisbursementListData {
  data: FailedDisbursementRaw[];
  meta: LoanMeta;
}

export interface FailedDisbursementListResponse {
  statusCode:   number;
  status:       string;
  message:      string;
  data:         FailedDisbursementListData;
  responseCode: string;
}

export interface FailedDisbursementListParams {
  page?:       number;
  limit?:      number;
  search?:     string;
  status?:     string;
  start_date?: string;
  end_date?:   string;
}

export interface FailedDisbursementView {
  id:               string;
  applicationDate:  string;
  applicationTime:  string;
  customerName:     string;
  customerEmail:    string;
  initials:         string;
  loanId:           string;
  amount:           string;
  tenor:            string;
  product:          string;
  product_tag:      string;
  reason:           string;
}

export interface RepaymentDueRaw {
  id:               string;
  customer_id:      string;
  product_id:       string;
  product_tag:      string;
  loan_amount:      number;
  loan_duration:    number;
  repayment_amount: number;
  amount_due:       number;
  unique_loan_id:   string | null;
  status:           LoanStatusRaw;
  due_date:         string;
  createdAt:        string;
  updatedAt:        string;
  customer:         LoanCustomer;
  product:          LoanProduct;
}

export interface RepaymentDueListData {
  data: RepaymentDueRaw[];
  meta: LoanMeta;
}

export interface RepaymentDueListResponse {
  statusCode:   number;
  status:       string;
  message:      string;
  data:         RepaymentDueListData;
  responseCode: string;
}

export interface RepaymentDueListParams {
  page?:       number;
  limit?:      number;
  search?:     string;
  status?:     string;
  start_date?: string;
  end_date?:   string;
}

export interface RepaymentDueView {
  id:               string;
  customerName:     string;
  customerEmail:    string;
  initials:         string;
  loanId:           string;
  amountDue:        string;
  product:          string;
  product_tag:      string;
  dueDate:          string;
}

// ─── Loan Detail (single loan view) ────────────────────────────────────────

export interface LoanDetailCards {
  amountRequested:    number;
  amountDisbursed:    number;
  outstandingBalance: number;
  totalRepaid:        number;
  interest:            number;
  applicationDate:     string;
  dueDate:              string;
  tenor:                number;
}

export interface LoanDetailLoanDetails {
  loanAmount:          number;
  totalRepayment:      number;
  loanId:               string;
  borrowerId:           string;
  disbursementMethod:   string;
}

export interface LoanDetailInterestAndFees {
  interestRate:                number;
  interestIsCharged:           string;
  interestAmount:               number;
  startChargingInterestFrom:    string;
  principalFees:                number;
  adminFees:                    number;
  tax:                          number;
}

export interface LoanDetailRepaymentDetails {
  bankName:               string;
  accountNumber:           string;
  totalNumberOfRepayments: number;
  repaymentFrequency:      string;
  monthlyRepayment:        number;
  firstRepaymentDate:      string;
  firstRepaymentAmount:    number;
  lastRepaymentAmount:     number;
}

export interface LoanDetailLiquidationDetails {
  releaseDate:        string;
  maturityDate:        string;
  principal:            number;
  interestRate:         number;
  monthlyRepayment:     number;
  fees:                 number;
  penalty:              number;
  amountDue:            number;
  amountPaidToDate:     number;
  interest:             number;
}

export interface LoanDetailAbout {
  loanDetails:         LoanDetailLoanDetails;
  interestAndFees:     LoanDetailInterestAndFees;
  repaymentDetails:    LoanDetailRepaymentDetails;
  liquidationDetails:  LoanDetailLiquidationDetails;
}

export interface LoanDetailDocument {
  name:       string;
  link:       string;
  uploadedAt: string;
}

export interface LoanDetailLiquidationSummary {
  totalAmount: number;
  amountPaid:  number;
  balance:     number;
}

export interface LoanDetailScheduleRow {
  scheduledDate: string;
  narration:     string;
  principal:     number;
  interest:      number | null;
  fees:          number | null;
  totalAmount:   number;
  status:        string;
}

export interface LoanDetailGeneratedLetter {
  dateGenerated: string;
  letterType:    string;
  link?:         string;
}

export interface LoanDetailLogEntry {
  event: string;
  date:  string;
}

export interface LoanDetailTabs {
  about:         LoanDetailAbout;
  logs:          LoanDetailLogEntry[];
  documents:     LoanDetailDocument[];
  schedule:      LoanDetailScheduleRow[];
  liquidation:   LoanDetailLiquidationSummary;
  loanDocuments: LoanDetailGeneratedLetter[];
}

export interface LoanDetailRaw {
  id:                            string;
  customer_id:                   string;
  customer:                      LoanCustomer;
  product_id:                    string;
  product:                       LoanProduct;
  product_tag:                   string;
  external_loan_product_id:      string | null;
  loan_id:                       string | null;
  partner_loan_id:               string;
  reference_no:                  string;
  loan_amount:                   number;
  loan_duration:                 number;
  bank_code:                     string;
  bank_account_number:           string;
  identity_type:                 string;
  identity_number:               string;
  repayment_amount:              number;
  start_date:                    string;
  end_date:                      string;
  status:                        string;
  place_of_work:                 string;
  unique_loan_id:                string;
  external_customer_id:          string;
  is_existing_loan_application:  boolean;
  has_been_disbursed:            boolean;
  has_repayments:                boolean;
  awaiting_sync_to_caltos:       boolean;
  disbursedAt:                   string | null;
  createdAt:                     string;
  updatedAt:                     string;
  logoUrl:                       string;
  cards:                         LoanDetailCards;
  tabs:                          LoanDetailTabs;
}

export interface LoanDetailResponse {
  statusCode:   number;
  status:       string;
  message:      string;
  data:         LoanDetailRaw;
  responseCode: string;
}

// ─── View models consumed by components ────────────────────────────────────

export interface LoanDetailHeaderView {
  id:                  string;
  customerId:          string;
  customerName:        string;
  customerEmail:       string;
  customerPhone:       string;
  customerAvatar:      string;
  walletType:          string;
  isNew:               boolean;
  amountRequested:     number;
  amountDisbursed:     number;
  outstandingBalance:  number;
  totalRepaid:         number;
  interestRate:        string;
  applicationDate:     string;
  dueDate:             string;
  tenor:               string;
}