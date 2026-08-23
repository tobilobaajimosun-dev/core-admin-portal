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
  /** Linked Caltos vendor, if this Asset Flex vendor has been synced. */
  caltosVendorId?: string | null;
  caltosVendorName?: string | null;
  caltosLinkedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** A vendor record in Caltos, for the sync picker. */
export interface CaltosVendor {
  id: string;
  name: string;
  email?: string | null;
  status?: string | null;
}

export interface LinkCaltosVendorPayload {
  caltos_vendor_id: string;
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
