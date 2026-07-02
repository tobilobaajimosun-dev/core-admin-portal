// ─── Raw API response ─────────────────────────────────────────────────────────

export interface NotificationDailyBreakdown {
  date:      string;  
  sent:      number;
  delivered: number;
  failed:    number;
  rate:      number;
}

export interface NotificationMetricsData {
  totalSent:      number;
  totalDelivered: number;
  totalFailed:    number;
  deliveryRate:   number;
  dailyBreakdown: NotificationDailyBreakdown[];
}

export interface NotificationMetricsResponse {
  statusCode:   number;
  status:       string;
  message:      string;
  data:         NotificationMetricsData;
  responseCode: string;
}

// ─── Query params ─────────────────────────────────────────────────────────────

export interface NotificationMetricsParams {
  startDate?: string; 
  endDate?:   string; 
}

export type NotificationMetricsCustomRange =
  | 'today'
  | 'yesterday'
  | 'past_7_days'
  | 'this_month'
  | 'custom';

// ─── Notification History ──────────────────────────────────────────────────────

export type NotificationChannel = 'sms' | 'email' | 'push' | 'in_app';
export type NotificationHistoryStatus = 'delivered' | 'pending' | 'failed';

export interface NotificationHistoryItemRaw {
  id:               string;
  templateSlug:     string;
  notificationType: string | null;
  channel:          string;   // e.g. 'sms' — kept as string since full enum isn't confirmed
  recipient:        string;
  title:            string | null;
  message:          string;
  status:           string;   // e.g. 'delivered' — kept as string, see note above
  errorMessage:     string | null;
  createdAt:        string;
}

// NOTE: unlike customer/loan/transaction lists, this endpoint returns
// items + pagination flattened directly under `data` (no nested meta object).
export interface NotificationHistoryListData {
  items:      NotificationHistoryItemRaw[];
  page:       number;
  limit:      number;
  total:      number;
  totalPages: number;
}

export interface NotificationHistoryListResponse {
  statusCode:   number;
  status:       string;
  message:      string;
  data:         NotificationHistoryListData;
  responseCode: string;
}

export interface NotificationHistoryParams {
  page?:      number;
  limit?:     number;
  type?:      string;   // filters by template slug OR notification type — free text, not an enum
  channel?:   string;
  status?:    string;
  search?:    string;   // matches title, message, or recipient
  startDate?: string;   // YYYY-MM-DD
  endDate?:   string;   // YYYY-MM-DD
}

// ─── Notification Templates ────────────────────────────────────────────────────

export interface NotificationTemplateRaw {
  id:         string;
  slug:       string;
  channel:    string;   // e.g. 'email' | 'push' — no confirmed exhaustive enum
  subject:    string | null;
  body:       string;
  variables:  string[];
  version:    number;
  active:     boolean;
  createdAt:  string;
  updatedAt:  string;
}

export interface NotificationTemplateListData {
  items:      NotificationTemplateRaw[];
  page:       number;
  limit:      number;
  total:      number;
  totalPages: number;
}

export interface NotificationTemplateListResponse {
  statusCode:   number;
  status:       string;
  message:      string;
  data:         NotificationTemplateListData;
  responseCode: string;
}

export type NotificationTemplateSortField = 'createdAt' | 'updatedAt' | 'slug' | 'channel';
export type NotificationTemplateSortOrder = 'ASC' | 'DESC';

export interface NotificationTemplateParams {
  page?:      number;
  limit?:     number;
  search?:    string;   
  channel?:   string;
  startDate?: string;   
  endDate?:   string;   
  sortField?: NotificationTemplateSortField;
  sortOrder?: NotificationTemplateSortOrder;
}

// ─── Template Create/Update ────────────────────────────────────────────────────

export interface NotificationTemplateUpsertPayload {
  slug:      string;
  channel:   string;
  subject:   string;
  body:      string;
  variables: string[]; 
}

export interface NotificationTemplateUpsertResponse {
  statusCode:   number;
  status:       string;
  message:      string;
  data:         NotificationTemplateRaw;
  responseCode: string;
}

// ─── Notification Send ─────────────────────────────────────────────────────────

export type NotificationRecipientType = 'all' | 'segment' | 'specific';

export interface NotificationSendFilters {
  employment_type?:         string;
  active_loan_status?:      string;
  kyc_status?:               string;
  wallet_balance_min?:      number;
  wallet_balance_max?:      number;
  registration_start_date?: string; // YYYY-MM-DD
  registration_end_date?:   string; // YYYY-MM-DD
  last_login_start_date?:   string; // YYYY-MM-DD
  last_login_end_date?:     string; // YYYY-MM-DD
}

export interface NotificationSendPayload {
  recipient_type: NotificationRecipientType;
  customer_ids?:  string[];
  filters?:       NotificationSendFilters;
  channel:        string;   // 'in-app' | 'email'
  templateSlug?:  string;
  title:          string;
  message:        string;
  // NOTE: confirm exact field name/shape against the full Swagger schema —
  // the request body panel was cut off after `message` in the screenshot.
  scheduledAt?:   string;   // ISO datetime, only present when scheduling for later
}

export interface NotificationSendData {
  queuedCount: number;
  delayMs:     number;
}

export interface NotificationSendResponse {
  statusCode:   number;
  status:       string;
  message:      string;
  data:         NotificationSendData;
  responseCode: string;
}