export type LoanStatus =
  | 'ACTIVE'
  | 'APPROVED'
  | 'PENDING_DISBURSEMENT'
  | 'DISBURSED'
  | 'PAID_OFF'
  | 'DEFAULTED'
  | 'OVERDUE'
  | 'REJECTED';

export const LOAN_STATUSES: LoanStatus[] = [
  'ACTIVE',
  'APPROVED',
  'PENDING_DISBURSEMENT',
  'DISBURSED',
  'PAID_OFF',
  'DEFAULTED',
  'OVERDUE',
  'REJECTED',
];

/**
 * Valid next statuses per current status. PAID_OFF, DEFAULTED and REJECTED are
 * terminal — an admin should not be able to move a loan out of them from here.
 */
export const LOAN_STATUS_TRANSITIONS: Record<LoanStatus, LoanStatus[]> = {
  APPROVED: ['PENDING_DISBURSEMENT', 'REJECTED'],
  PENDING_DISBURSEMENT: ['DISBURSED', 'REJECTED'],
  DISBURSED: ['ACTIVE'],
  ACTIVE: ['OVERDUE', 'PAID_OFF', 'DEFAULTED'],
  OVERDUE: ['ACTIVE', 'PAID_OFF', 'DEFAULTED'],
  PAID_OFF: [],
  DEFAULTED: [],
  REJECTED: [],
};

export interface Loan {
  id: string;
  loanReference: string;
  checkoutSessionId: string | null;
  vendorId: string;
  customerId: string;
  internalCustomerId: string | null;
  loanProductId: string;
  principalAmount: string;
  totalInterest: string;
  totalRepayable: string;
  tenorMonths: number;
  monthlyInstallment: string;
  salaryProviderUsed: string | null;
  directDebitProvider: string | null;
  mandateReference: string | null;
  status: LoanStatus;
  disbursedAt: string | null;
  createdAt: string;
  updatedAt: string;
  vendor?: { id: string; businessName?: string } | null;
  customer?: { id: string; firstName?: string; lastName?: string } | null;
  loanProduct?: { id: string; name?: string; code?: string } | null;
}

export interface UpdateLoanStatusPayload {
  status: LoanStatus;
}
