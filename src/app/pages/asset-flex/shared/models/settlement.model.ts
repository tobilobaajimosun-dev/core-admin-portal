export type SettlementStatus = 'PENDING' | 'DUE' | 'SETTLED' | 'FAILED' | string;

export interface Settlement {
  id: string;
  settlementReference: string;
  vendorId: string;
  loanId: string;
  checkoutSessionId: string | null;
  grossOrderAmount: string;
  platformFeeDeduction: string;
  netSettlementAmount: string;
  status: SettlementStatus;
  settlementDueDate: string | null;
  settledAt: string | null;
  batchPayoutReference: string | null;
  createdAt: string;
  updatedAt: string;
  vendor?: { id: string; businessName?: string } | null;
  loan?: { id: string; loanReference?: string } | null;
}

export interface MarkSettledPayload {
  settlement_ids: string[];
  batch_payout_reference: string;
}

export interface MarkSettledResult {
  settledCount: number;
  batchPayoutReference: string;
  settledAt: string;
}

export interface T1CutoffResult {
  processedCount: number;
  statusTransitionedTo: string;
}
