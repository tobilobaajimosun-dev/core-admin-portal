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
  product_id?:   string;
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
export interface LoanMetricValue {
  count: number;
  sum:   number;
}

export interface LoanMetricPeriod {
  custom_range: string;
  start_date:   string;
  end_date:     string;
}
export interface LoanMetricsData {
  period:                     LoanMetricPeriod;
  total_loan_applications:    LoanMetricValue;
  total_disbursed_loans:      LoanMetricValue;
  total_active_loans:         LoanMetricValue;
  total_outstanding_balance:  LoanMetricValue;
  total_repaid:               LoanMetricValue;
  rate_of_defaulting:         LoanMetricValue;
  failed_disbursements:       { count: number; amount: number };
  repayment_due:              { count: number; amount: number };
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

export interface LoanStatCard {
  label:              string;
  value:              number;
  isCurrency:         boolean;
  suffix?:            string;
  tooltipDescription: string;
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
  id:            string;
  dateGenerated: string;
  letterType:    string; // "Letter of Indebtedness" | "Letter of Non-indebtedness"
  reference:     string;
}

export interface IndebtednessLetterData {
  id:         string;
  loan_id:    string;
  letter_type: string;
  issued_at:  string;
  reference:  string;
  filename:   string;
  pdf_base64: string;
}
export interface IndebtednessLetterResponse {
  statusCode:   number;
  status:       string;
  message:      string;
  data:         IndebtednessLetterData;
  responseCode: string;
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
  indebtedness_letters: LoanIndebtednessLetter[];
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
  status:              string;
}

export interface LoanIndebtednessLetter {
  id:                  string;
  letter_type:         'indebtedness' | 'non_indebtedness';
  reference:           string;
  filename:            string;
  issued_at:           string;
  is_indebted:         boolean;
  outstanding_balance: number;
  active_loan_count:   number;
  created_at:          string;
}

// ─── Loan Products (for filter dropdown) ───────────────────────────────────

export interface LoanProductRaw {
  id:                  string;
  title:               string;
  description:         string;
  product_tag:         string;
  employer_type:       string;
  period_type:         string;
  min_tenor:           number;
  max_tenor:           number;
  min_loan_amount:     number;
  max_loan_amount:     number;
  interest_rate:       number;
  actual_tenor_days:   number;
  image:               string;
  loan_product_id:     string;
  job_option_id:       string;
  is_active:           number;
  selected_durations:  number[] | null;
  createdAt:           string;
  updatedAt:            string;
}

export interface LoanProductListResponse {
  statusCode:   number;
  status:       string;
  message:      string;
  data:         LoanProductRaw[];
  responseCode: string;
}