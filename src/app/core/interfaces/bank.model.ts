// ─── Raw API response ─────────────────────────────────────────────────────────

export interface BankRaw {
  name: string;
  code: string;
  id:   string;
}

export interface BankListResponse {
  statusCode:   number;
  status:       string;
  message:      string;
  data:         BankRaw[];
  responseCode: string;
}

// ─── View model (if you need a label/value shape elsewhere, e.g. a select) ────

export interface BankOption {
  label: string; // name
  value: string; // id (same as code here, but id is the canonical field)
}