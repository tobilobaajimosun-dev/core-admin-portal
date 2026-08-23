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
  product_code?: string;
  status?: string;
  /** Numeric values arrive as strings from the Caltos API. */
  rate?: string;
  minimum_loan_amount?: string;
  maximum_loan_amount?: string;
  minimum_loan_tenor?: string;
  maximum_loan_tenor?: string;
  loan_tenor_type?: string;
  interest_type?: string;
  interest_charge_frequency?: string;
  [key: string]: unknown;
}

const TENOR_UNIT: Record<string, string> = { DAY: 'd', WEEK: 'wk', MONTH: 'mo', YEAR: 'yr' };

/**
 * One-line summary of a Caltos product's terms — rate, tenor range, interest
 * type — for the catalog picker's secondary line. Skips fields the item omits
 * or leaves at zero.
 */
export function caltosCatalogDescription(item: CaltosCatalogItem): string {
  const parts: string[] = [];

  const rate = (item.rate ?? '').trim();
  if (rate) parts.push(`${rate}%`);

  const min = Number(item.minimum_loan_tenor);
  const max = Number(item.maximum_loan_tenor);
  const unit = TENOR_UNIT[(item.loan_tenor_type ?? '').toUpperCase()] ?? '';
  if (unit && (min > 0 || max > 0)) {
    parts.push(min > 0 && max > 0 && min !== max ? `${min}–${max} ${unit}` : `${max || min} ${unit}`);
  }

  const interest = (item.interest_type ?? '').trim();
  if (interest) parts.push(interest.charAt(0).toUpperCase() + interest.slice(1).toLowerCase());

  return parts.join(' · ');
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
