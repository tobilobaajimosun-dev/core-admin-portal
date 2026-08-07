export type VendorStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'SUSPENDED' | 'BLACKLISTED' | 'REJECTED';
export type SettlementSchedule = 'T_PLUS_1' | 'INSTANT' | 'WEEKLY';
export type DocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Vendor {
  id: string;
  businessName: string;
  contactEmail: string;
  contactPhone: string;
  status: VendorStatus;
  apiKeyLive?: string;
  secretKeyLive?: string;
  webhookUrl: string | null;
  platformFeePercentage: string;
  settlementBankCode: string;
  settlementAccountNumber: string;
  settlementAccountName: string;
  settlementSchedule: SettlementSchedule;
  loanProducts?: unknown[];
  createdAt: string;
  updatedAt: string;
}

export interface VendorDocument {
  id: string;
  vendorId: string;
  documentType: string;
  fileUrl: string;
  status: DocumentStatus;
  uploadedAt: string;
}

export interface RejectVendorKycPayload {
  reason: string;
}

export interface UpdateVendorStatusPayload {
  status: VendorStatus;
}
