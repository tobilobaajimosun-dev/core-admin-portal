/**
 * Loan categories for the Asset Flex BNPL back-office. Businesses offer
 * financing across these categories; every loan and loan product carries one.
 * Drives the loans table column, the per-category filter, and reporting.
 */
export type LoanCategory = 'GADGETS' | 'FASHION' | 'FOOD' | 'SERVICES' | 'AUTOMOTIVE' | 'HOME';

export interface LoanCategoryMeta {
  value: LoanCategory;
  label: string;
  /** Solid accent used for the chip text, dot, and chart series. */
  color: string;
}

export const LOAN_CATEGORIES: LoanCategoryMeta[] = [
  { value: 'GADGETS', label: 'Gadgets & Electronics', color: '#2563eb' },
  { value: 'FASHION', label: 'Fashion & Apparel', color: '#db2777' },
  { value: 'FOOD', label: 'Food & Groceries', color: '#16a34a' },
  { value: 'SERVICES', label: 'Services', color: '#7c3aed' },
  { value: 'AUTOMOTIVE', label: 'Automotive', color: '#d97706' },
  { value: 'HOME', label: 'Home & Appliances', color: '#0891b2' },
];

const BY_VALUE = new Map(LOAN_CATEGORIES.map((c) => [c.value, c]));

export function categoryMeta(value: LoanCategory | null | undefined): LoanCategoryMeta | undefined {
  return value ? BY_VALUE.get(value) : undefined;
}
