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

// ─── Display / view model (mirrors what LoanTableComponent's template needs) ──

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