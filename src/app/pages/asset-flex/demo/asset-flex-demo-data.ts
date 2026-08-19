import { Loan, LoanStatus, RepaymentInstallment, RepaymentRecord } from '@pages/asset-flex/shared/models/loan.model';
import { LoanCategory } from '@pages/asset-flex/shared/models/category.model';
import { Settlement } from '@pages/asset-flex/shared/models/settlement.model';

const TEAM = ['Wisdom Okafor', 'Blessing Ade', 'Emeka Obi', 'Ngozi Umeh'];
const BANKS = [
  { name: 'GTBank', code: '058' },
  { name: 'Access Bank', code: '044' },
  { name: 'Zenith Bank', code: '057' },
  { name: 'UBA', code: '033' },
];

/**
 * Deterministic Asset Flex fixtures for demo mode. Realistic Nigerian names,
 * vendors and amounts; values are hand-derived so the numbers are internally
 * consistent (interest, repayable, monthly installment). Served by the
 * demo-mode interceptor — never fetched from the network.
 */

const VENDORS = [
  { id: 'ven_northgate', businessName: 'Northgate Retail Ltd' },
  { id: 'ven_everstone', businessName: 'Everstone Motors' },
  { id: 'ven_palmcourt', businessName: 'Palm Court Appliances' },
  { id: 'ven_bluewave', businessName: 'Bluewave Electronics' },
  { id: 'ven_arofashion', businessName: 'Aro Fashion House' },
];

const CUSTOMERS = [
  { id: 'cus_ifeoma', firstName: 'Ifeoma', lastName: 'Chukwu', ref: 'AF-CUST-00412' },
  { id: 'cus_tunde', firstName: 'Tunde', lastName: 'Bakare', ref: 'AF-CUST-00398' },
  { id: 'cus_amaka', firstName: 'Amaka', lastName: 'Obi', ref: 'AF-CUST-00377' },
  { id: 'cus_david', firstName: 'David', lastName: 'Eze', ref: 'AF-CUST-00356' },
  { id: 'cus_grace', firstName: 'Grace', lastName: 'Adeyemi', ref: 'AF-CUST-00341' },
  { id: 'cus_yusuf', firstName: 'Yusuf', lastName: 'Bello', ref: 'AF-CUST-00330' },
  { id: 'cus_ronke', firstName: 'Ronke', lastName: 'Adisa', ref: 'AF-CUST-00318' },
  { id: 'cus_halima', firstName: 'Halima', lastName: 'Suleiman', ref: 'AF-CUST-00305' },
];

const PRODUCTS = [
  { id: 'prd_flex30', name: 'Flex 30', code: 'PROD_SAL_1M', tenor: 1 },
  { id: 'prd_flex60', name: 'Flex 60', code: 'PROD_SAL_2M', tenor: 2 },
  { id: 'prd_flex90', name: 'Flex 90', code: 'PROD_SAL_3M', tenor: 3 },
  { id: 'prd_stressfree', name: 'Stress free', code: 'PROD_SAL_3M', tenor: 3 },
];

const ITEMS = [1_320_000, 420_000, 265_000, 980_000, 145_000, 2_100_000, 540_000, 95_000,
  760_000, 310_000, 1_850_000, 220_000, 640_000, 180_000, 1_120_000, 375_000];

const CATEGORIES: LoanCategory[] = ['GADGETS', 'GADGETS', 'HOME', 'GADGETS', 'FASHION', 'AUTOMOTIVE',
  'HOME', 'FOOD', 'GADGETS', 'FASHION', 'AUTOMOTIVE', 'SERVICES', 'HOME', 'FOOD', 'GADGETS', 'SERVICES'];

const ITEM_DESC = ['iPhone 15 Pro Max', 'Samsung 55" Smart TV', 'LG Washing Machine', 'MacBook Air M3',
  'Designer wardrobe bundle', 'Toyota Corolla — service plan', 'Hisense Double-Door Fridge', 'Monthly grocery plan',
  'iPad Pro + accessories', 'Fashion House seasonal bundle', 'Honda Accord — full service', 'Home cleaning annual plan',
  'Home theatre system', 'Bulk foodstuff supply', 'Gaming PC build', 'Interior design consultation'];

const STATUS_CYCLE: LoanStatus[] = [
  'ACTIVE', 'ACTIVE', 'PAID_OFF', 'DISBURSED', 'OVERDUE', 'ACTIVE', 'PENDING_DISBURSEMENT',
  'PAID_OFF', 'ACTIVE', 'APPROVED', 'ACTIVE', 'DEFAULTED', 'PAID_OFF', 'ACTIVE', 'DISBURSED', 'OVERDUE',
];

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Build a stable ISO date in 2026, offset back by `daysAgo` from Aug 18. */
function isoDaysAgo(daysAgo: number): string {
  // Anchor: 2026-08-18. Subtract days without Date() to stay deterministic.
  const base = Date.UTC(2026, 7, 18, 9, 0, 0) - daysAgo * 86_400_000;
  const d = new Date(base);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:00:00.000Z`;
}

export const DEMO_LOANS: Loan[] = ITEMS.map((principal, i) => {
  const vendor = VENDORS[i % VENDORS.length];
  const customer = CUSTOMERS[i % CUSTOMERS.length];
  const product = PRODUCTS[i % PRODUCTS.length];
  const status = STATUS_CYCLE[i];
  const interest = Math.round(principal * 0.01 * product.tenor);
  const repayable = principal + interest;
  const monthly = Math.round(repayable / product.tenor);
  const created = isoDaysAgo(i * 3 + 2);
  const disbursed = status === 'APPROVED' || status === 'PENDING_DISBURSEMENT' ? null : isoDaysAgo(i * 3);
  const bank = BANKS[i % BANKS.length];
  const paidCount =
    status === 'PAID_OFF'
      ? product.tenor
      : status === 'ACTIVE' || status === 'OVERDUE'
        ? Math.min(product.tenor - 1, (i % product.tenor) + (status === 'OVERDUE' ? 0 : 1))
        : 0;
  const schedule: RepaymentInstallment[] = Array.from({ length: product.tenor }, (_, n) => {
    const dueDate = isoDaysAgo(i * 3 - (n + 1) * 30);
    const paid = n < paidCount;
    return {
      number: n + 1,
      dueDate,
      amount: String(monthly),
      status: paid ? 'PAID' : status === 'OVERDUE' && n === paidCount ? 'OVERDUE' : n === paidCount ? 'DUE' : 'UPCOMING',
      paidAt: paid ? dueDate : null,
    };
  });
  const repayments: RepaymentRecord[] = schedule
    .filter((s) => s.status === 'PAID')
    .map((s, k) => ({
      id: `rpy_${1000 + i}_${k}`,
      date: s.paidAt as string,
      amount: s.amount,
      method: i % 2 === 0 ? 'Remita salary deduction' : 'Mono direct debit',
      reference: `RPY-${50000 + i * 10 + k}`,
      loggedBy: null,
      manual: false,
    }));
  return {
    id: `loan_${1000 + i}`,
    loanReference: `AF-LN-2026-${pad(i + 1)}${pad(i + 3)}`,
    checkoutSessionId: `chk_${9000 + i}`,
    vendorId: vendor.id,
    customerId: customer.id,
    internalCustomerId: customer.ref,
    category: CATEGORIES[i],
    itemDescription: ITEM_DESC[i],
    loanProductId: product.id,
    principalAmount: String(principal),
    totalInterest: String(interest),
    totalRepayable: String(repayable),
    tenorMonths: product.tenor,
    monthlyInstallment: String(monthly),
    salaryProviderUsed: i % 2 === 0 ? 'REMITA_SALARY' : null,
    directDebitProvider: i % 2 === 0 ? null : 'MONO_DD',
    mandateReference: i % 2 === 0 ? null : `MND-${40000 + i}`,
    appliedAt: created,
    disbursedBy: disbursed ? TEAM[i % TEAM.length] : null,
    amountApplied: String(principal),
    amountDisbursed: disbursed ? String(principal) : null,
    vendorPayout: disbursed
      ? {
          accountName: vendor.businessName,
          accountNumber: `0${123456780 + i}`,
          bankCode: `${bank.name} · ${bank.code}`,
          reference: `PAYOUT-${70000 + i}`,
          paidAt: disbursed,
        }
      : null,
    repaymentSchedule: schedule,
    repayments,
    status,
    disbursedAt: disbursed,
    createdAt: created,
    updatedAt: created,
    vendor: { id: vendor.id, businessName: vendor.businessName },
    customer: { id: customer.id, firstName: customer.firstName, lastName: customer.lastName },
    loanProduct: { id: product.id, name: product.name, code: product.code },
  };
});

/** Settlements derive from the disbursed loans — one payout per funded order. */
export const DEMO_SETTLEMENTS: Settlement[] = DEMO_LOANS
  .filter((l) => l.status !== 'APPROVED' && l.status !== 'PENDING_DISBURSEMENT' && l.status !== 'REJECTED')
  .slice(0, 12)
  .map((l, i) => {
    const gross = Number(l.principalAmount);
    const fee = Math.round(gross * 0.025);
    const net = gross - fee;
    const settled = l.status === 'PAID_OFF' || i % 3 === 0;
    const due = isoDaysAgo(i * 2);
    return {
      id: `stl_${2000 + i}`,
      settlementReference: `AF-STL-2026-${pad(i + 1)}${pad(i + 4)}`,
      vendorId: l.vendorId,
      loanId: l.id,
      checkoutSessionId: l.checkoutSessionId,
      grossOrderAmount: String(gross),
      platformFeeDeduction: String(fee),
      netSettlementAmount: String(net),
      status: settled ? 'SETTLED' : i % 2 === 0 ? 'DUE' : 'PENDING',
      settlementDueDate: due,
      settledAt: settled ? due : null,
      batchPayoutReference: settled ? `REMITA-BULK-PAY-${99100 + i}` : null,
      createdAt: isoDaysAgo(i * 2 + 1),
      updatedAt: due,
      vendor: { id: l.vendorId, businessName: l.vendor?.businessName },
      loan: { id: l.id, loanReference: l.loanReference },
    };
  });

export function findDemoLoan(id: string): Loan | undefined {
  return DEMO_LOANS.find((l) => l.id === id);
}

export function findDemoSettlement(id: string): Settlement | undefined {
  return DEMO_SETTLEMENTS.find((s) => s.id === id);
}
