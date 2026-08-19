import { Loan, LoanStatus, RepaymentInstallment, RepaymentRecord } from '@pages/asset-flex/shared/models/loan.model';
import { LoanCategory } from '@pages/asset-flex/shared/models/category.model';
import { Settlement } from '@pages/asset-flex/shared/models/settlement.model';
import { Customer, CustomerDocument, IdVerification, WorkDetails } from '@pages/asset-flex/shared/models/customer.model';
import { LoanProduct } from '@pages/asset-flex/shared/models/loan-product.model';
import { Vendor, VendorDocument, VendorOwner, VendorStatus, DocumentStatus } from '@pages/asset-flex/shared/models/vendor.model';

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
      orderItem: l.itemDescription,
      category: l.category,
      customer: { id: l.customerId, name: `${l.customer?.firstName ?? ''} ${l.customer?.lastName ?? ''}`.trim() },
      settlementBankCode: `${BANKS[i % BANKS.length].name} · ${BANKS[i % BANKS.length].code}`,
      settlementAccountNumber: `0${234567890 + (i % VENDORS.length)}`,
      vendor: { id: l.vendorId, businessName: l.vendor?.businessName },
      loan: { id: l.id, loanReference: l.loanReference },
    };
  });

export function findDemoLoan(id: string): Loan | undefined {
  return DEMO_LOANS.find((l) => l.id === id);
}

/** Loans belonging to a customer — for the customer detail loan history. */
export function demoLoansForCustomer(customerId: string): Loan[] {
  return DEMO_LOANS.filter((l) => l.customerId === customerId);
}

const EMPLOYERS = [
  { employer: 'Dangote Group', jobTitle: 'Operations Lead', income: 850_000, type: 'Full-time' },
  { employer: 'MTN Nigeria', jobTitle: 'Account Manager', income: 620_000, type: 'Full-time' },
  { employer: 'GTBank', jobTitle: 'Relationship Officer', income: 540_000, type: 'Full-time' },
  { employer: 'Independent', jobTitle: 'Fashion Retailer', income: 480_000, type: 'Self-employed' },
];

export const DEMO_CUSTOMERS: Customer[] = CUSTOMERS.map((c, i) => {
  const job = EMPLOYERS[i % EMPLOYERS.length];
  const created = isoDaysAgo(30 + i * 5);
  const verifiedAt = isoDaysAgo(29 + i * 5);
  const dob = `199${i % 8}-0${(i % 8) + 1}-1${i % 8}`;
  // Vary verification so risk levels spread: customer 3 fails NIN, customer 6 fails both.
  const bvnOk = i !== 6;
  const ninOk = i !== 3 && i !== 6;
  const idCheck = (provider: string, ok: boolean): IdVerification => ({
    status: ok ? 'SUCCESS' : 'FAILED',
    matchedName: ok ? `${c.firstName} ${c.lastName}` : null,
    dateOfBirth: dob,
    provider,
    verifiedAt: ok ? verifiedAt : null,
  });
  const work: WorkDetails = {
    employer: job.employer,
    jobTitle: job.jobTitle,
    monthlyIncome: String(job.income),
    employmentType: job.type,
    workEmail: `${c.firstName.toLowerCase()}@${job.employer.toLowerCase().replace(/[^a-z]/g, '')}.com`,
  };
  const documents: CustomerDocument[] = [
    { id: `doc_${i}_1`, name: 'Government ID (NIN slip)', type: 'Identity', uploadedAt: created, status: 'VERIFIED' },
    { id: `doc_${i}_2`, name: 'Proof of address', type: 'Address', uploadedAt: created, status: i % 3 === 0 ? 'PENDING' : 'VERIFIED' },
    { id: `doc_${i}_3`, name: 'Payslip (last 3 months)', type: 'Income', uploadedAt: created, status: 'VERIFIED' },
  ];
  return {
    id: c.id,
    internalCustomerId: c.ref,
    phoneNumber: `+23480${pad(i)}${1234567 + i}`,
    email: `${c.firstName.toLowerCase()}.${c.lastName.toLowerCase()}@gmail.com`,
    bvn: `221${pad(i)}45${pad(i + 3)}88`,
    nin: `${10000000000 + i * 111}`,
    dateOfBirth: dob,
    isTriadVerified: bvnOk && ninOk,
    firstName: c.firstName,
    lastName: c.lastName,
    status: 'ACTIVE',
    createdAt: created,
    updatedAt: created,
    homeAddress: `${12 + i} ${['Bourdillon Rd, Ikoyi', 'Admiralty Way, Lekki', 'Adeola Odeku, Victoria Island', 'Opebi Rd, Ikeja', 'Ozumba Mbadiwe, Victoria Island'][i % 5]}, Lagos`,
    referredByVendor: { id: VENDORS[i % VENDORS.length].id, businessName: VENDORS[i % VENDORS.length].businessName },
    work,
    salaryPartner: {
      provider: ['Remita', 'WACS Payroll', 'Dedukt'][i % 3],
      employer: job.employer,
      staffId: `STF-${1000 + i}`,
      accountNumber: `0${345678900 + i}`,
    },
    bvnVerification: idCheck('Mono BVN', bvnOk),
    ninVerification: idCheck('Prembly NIN', ninOk),
    documents,
  };
});

// A newly-onboarded customer with no loan history — demonstrates the
// "New — limited history" risk state (can't score repayments they don't have).
DEMO_CUSTOMERS.push({
  id: 'cus_new',
  internalCustomerId: 'AF-CUST-00501',
  phoneNumber: '+2348091234500',
  email: 'kelvin.osei@gmail.com',
  bvn: '22190045688',
  nin: '10000000900',
  dateOfBirth: '1996-05-14',
  isTriadVerified: true,
  firstName: 'Kelvin',
  lastName: 'Osei',
  status: 'ACTIVE',
  createdAt: isoDaysAgo(4),
  updatedAt: isoDaysAgo(4),
  homeAddress: '9 Freedom Way, Lekki Phase 1, Lagos',
  referredByVendor: { id: VENDORS[3].id, businessName: VENDORS[3].businessName },
  work: { employer: 'Flutterwave', jobTitle: 'Software Engineer', monthlyIncome: '780000', employmentType: 'Full-time', workEmail: 'kelvin@flutterwave.com' },
  salaryPartner: { provider: 'Remita', employer: 'Flutterwave', staffId: 'STF-2001', accountNumber: '0345679000' },
  bvnVerification: { status: 'SUCCESS', matchedName: 'Kelvin Osei', dateOfBirth: '1996-05-14', provider: 'Mono BVN', verifiedAt: isoDaysAgo(4) },
  ninVerification: { status: 'SUCCESS', matchedName: 'Kelvin Osei', dateOfBirth: '1996-05-14', provider: 'Prembly NIN', verifiedAt: isoDaysAgo(4) },
  documents: [
    { id: 'doc_new_1', name: 'Government ID (NIN slip)', type: 'Identity', uploadedAt: isoDaysAgo(4), status: 'VERIFIED' },
    { id: 'doc_new_2', name: 'Proof of address', type: 'Address', uploadedAt: isoDaysAgo(4), status: 'PENDING' },
  ],
});

export function findDemoCustomer(id: string): Customer | undefined {
  return DEMO_CUSTOMERS.find((c) => c.id === id);
}

const PRODUCT_CATEGORIES: LoanCategory[] = ['GADGETS', 'FASHION', 'HOME', 'SERVICES'];

export const DEMO_PRODUCTS: LoanProduct[] = PRODUCTS.map((p, i) => ({
  id: p.id,
  code: p.code,
  caltosProductId: String(20 + i),
  name: p.name,
  category: PRODUCT_CATEGORIES[i % PRODUCT_CATEGORIES.length],
  description: `${p.tenor}-month financing offered at vendor checkout.`,
  tenorMonths: p.tenor,
  interestRatePercentage: '1',
  minPrincipalAmount: '1000',
  maxPrincipalAmount: i === 0 ? '500000' : '2500000',
  isActive: true,
  autoDisburse: i % 2 === 0,
  createdAt: isoDaysAgo(60 - i * 5),
  updatedAt: isoDaysAgo(10),
}));

export function findDemoProduct(id: string): LoanProduct | undefined {
  return DEMO_PRODUCTS.find((p) => p.id === id);
}

export function demoLoansForProduct(productId: string): Loan[] {
  return DEMO_LOANS.filter((l) => l.loanProductId === productId);
}

const VENDOR_META = [
  { industry: 'Retail & Supermarkets', address: '14 Adeniran Ogunsanya St, Surulere, Lagos', cac: 'RC-482910' },
  { industry: 'Automotive', address: '3 Awolowo Rd, Ikoyi, Lagos', cac: 'RC-591027' },
  { industry: 'Home & Appliances', address: '22 Ogui Rd, Enugu', cac: 'RC-337218' },
  { industry: 'Consumer Electronics', address: '7 Aba Rd, Port Harcourt', cac: 'RC-778452' },
  { industry: 'Fashion & Apparel', address: '19 Allen Ave, Ikeja, Lagos', cac: 'RC-220913' },
];
const OWNER_FIRST = ['Chidi', 'Bello', 'Ada', 'Emeka', 'Ngozi'];
const PARTNER_FIRST = ['Ronke', 'Sadiq', 'Ify', 'Tayo', 'Uche'];

export const DEMO_VENDORS: Vendor[] = VENDORS.map((v, i) => {
  const meta = VENDOR_META[i % VENDOR_META.length];
  const bank = BANKS[i % BANKS.length];
  const status: VendorStatus = i === 0 ? 'PENDING_APPROVAL' : i === 4 ? 'SUSPENDED' : 'APPROVED';
  const owners: VendorOwner[] = [
    { fullName: `${OWNER_FIRST[i]} ${v.businessName.split(' ')[0]}`, role: 'Director / CEO', bvn: `221${pad(i)}9988${i}`, nin: `${20000000000 + i * 17}`, sharePercentage: 60 },
    { fullName: `${PARTNER_FIRST[i]} Adewale`, role: 'Co-founder', bvn: `221${pad(i)}1122${i}`, nin: `${21000000000 + i * 13}`, sharePercentage: 40 },
  ];
  return {
    id: v.id,
    businessName: v.businessName,
    contactEmail: `finance@${v.businessName.toLowerCase().replace(/[^a-z]/g, '')}.ng`,
    contactPhone: `+23480${pad(i)}5566${i}`,
    status,
    cacRegistrationNumber: meta.cac,
    businessAddress: meta.address,
    industry: meta.industry,
    owners,
    webhookUrl: null,
    platformFeePercentage: '2.5',
    settlementBankCode: `${bank.name} · ${bank.code}`,
    settlementAccountNumber: `0${234567890 + i}`,
    settlementAccountName: v.businessName,
    settlementSchedule: 'T_PLUS_1',
    apiKeyLive: `af_live_pk_${i}9x2beff2e3cf860560ac9b8e10`,
    createdAt: isoDaysAgo(120 - i * 10),
    updatedAt: isoDaysAgo(5),
  };
});

const VENDOR_DOC_TYPES = ['CAC Certificate', 'TIN Certificate', 'Proof of Address', "Director's ID", 'Bank Statement (3 months)'];

/** All required documents uploaded — approved for onboarded vendors, still under
 * review for the pending one. */
export function demoVendorDocuments(vendorId: string): VendorDocument[] {
  const idx = DEMO_VENDORS.findIndex((v) => v.id === vendorId);
  const i = idx < 0 ? 0 : idx;
  return VENDOR_DOC_TYPES.map((t, k) => ({
    id: `vdoc_${vendorId}_${k}`,
    vendorId,
    documentType: t,
    fileUrl: `https://files.demo/${vendorId}/${t.toLowerCase().replace(/[^a-z]/g, '')}.pdf`,
    status: (i === 0 && k >= 3 ? 'PENDING' : 'APPROVED') as DocumentStatus,
    uploadedAt: isoDaysAgo(115 - i * 10),
  }));
}

export function findDemoVendor(id: string): Vendor | undefined {
  return DEMO_VENDORS.find((v) => v.id === id);
}

export function demoLoansForVendor(vendorId: string): Loan[] {
  return DEMO_LOANS.filter((l) => l.vendorId === vendorId);
}

export function findDemoSettlement(id: string): Settlement | undefined {
  return DEMO_SETTLEMENTS.find((s) => s.id === id);
}
