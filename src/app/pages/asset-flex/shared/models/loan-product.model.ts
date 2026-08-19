export interface ProviderRule {
  provider_code: string;
  collection_method: string;
  is_required: boolean;
  priority_order: number;
}

import { LoanCategory } from './category.model';

export interface LoanProduct {
  id: string;
  code: string;
  caltosProductId: string;
  name: string;
  category?: LoanCategory | null;
  description: string | null;
  tenorMonths: number;
  interestRatePercentage: string;
  minPrincipalAmount: string;
  maxPrincipalAmount: string;
  isActive: boolean;
  autoDisburse: boolean;
  createdAt: string;
  updatedAt: string;
  providerRules?: ProviderRule[];
}

/** An entry in the Caltos catalog available to create products from. */
export interface CaltosCatalogItem {
  id: string;
  name?: string;
  code?: string;
  [key: string]: unknown;
}

export interface CreateLoanProductPayload {
  caltos_product_id: string;
  code?: string;
  product_code?: string;
  provider_rules?: ProviderRule[];
}

export interface UpdateLoanProductPayload {
  code?: string;
  isActive?: boolean;
  autoDisburse?: boolean;
}

export interface AssignProductsPayload {
  loan_product_ids: string[];
}
