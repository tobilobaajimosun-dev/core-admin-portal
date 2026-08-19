export type VendorStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'SUSPENDED' | 'BLACKLISTED' | 'REJECTED';
export type SettlementSchedule = 'T_PLUS_1' | 'INSTANT' | 'WEEKLY';
export type DocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface VendorOwner {
  fullName: string;
  role: string;
  bvn?: string | null;
  nin?: string | null;
  sharePercentage?: number | null;
}

export interface Vendor {
  id: string;
  businessName: string;
  contactEmail: string;
  contactPhone: string;
  status: VendorStatus;
  cacRegistrationNumber?: string | null;
  businessAddress?: string | null;
  industry?: string | null;
  owners?: VendorOwner[];
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
