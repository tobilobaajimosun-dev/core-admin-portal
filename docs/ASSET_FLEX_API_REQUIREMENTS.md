# Asset Flex Admin — API Requirements

> Source of truth for the backend team. Generated from the actual HTTP calls in
> `src/app/pages/asset-flex/shared/services/*`. Base URL: `assetFlexApiBaseUrl`
> (env `NG_APP_...`). Auth: `Authorization: Bearer <admin access_token>`.
>
> Two parts:
> - **Part A — Implemented** (UI depends on these; keep the contract stable).
> - **Part B — Missing** (UI ships sample/prototype data today; build these to go live). Each includes an example payload so the data shape is unambiguous.

## Response envelope conventions

```jsonc
// ApiResponse<T>
{ "message": "OK", "data": { /* T */ } }

// PaginatedResponse<T>  (list endpoints)
{ "message": "OK", "data": { "data": [ /* T[] */ ], "pagination": { "total": 42, "page": 1, "limit": 20, "totalPages": 3 } } }
```

---

## Part A — Implemented endpoints (UI depends on these)

### Vendors
| Method | Path | Query / Body | Purpose |
|---|---|---|---|
| GET | `/api/v1/admin/vendors` | `status, search, page, limit` | List / filter vendors |
| GET | `/api/v1/admin/vendors/:id` | — | Vendor detail |
| GET | `/api/v1/admin/vendors/:id/documents` | — | KYB documents |
| POST | `/api/v1/vendors/onboard` | onboard payload | Create vendor (self-serve or admin) |
| POST | `/api/v1/admin/vendors/:id/approve` | `{}` | Approve KYB |
| POST | `/api/v1/admin/vendors/:id/kyc/reject` | `{ reason }` | Reject KYC |
| POST | `/api/v1/admin/vendors/:id/blacklist` | `{}` | Blacklist |
| PATCH | `/api/v1/admin/vendors/:id/status` | `{ status }` | Change status |
| POST | `/api/v1/admin/vendors/:id/assign-products` | `{ loanProductIds: [] }` | Assign loan products |

### Loans
| Method | Path | Query / Body | Purpose |
|---|---|---|---|
| GET | `/api/v1/admin/loans` | `status, search, page, limit` | List / filter loans |
| GET | `/api/v1/admin/loans/:id` | — | Loan detail |
| PATCH | `/api/v1/admin/loans/:id/status` | `{ status }` | Change loan status |

### Loan products
| Method | Path | Body | Purpose |
|---|---|---|---|
| GET | `/api/v1/loan-products` | — | List |
| GET | `/api/v1/loan-products/:id` | — | Detail |
| POST | `/api/v1/loan-products` | product | Create |
| PATCH | `/api/v1/loan-products/:id` | product | Update |
| DELETE | `/api/v1/loan-products/:id` | — | Delete |
| PATCH | `/api/v1/loan-products/:id/auto-disburse` | `{ autoDisburse }` | Toggle auto-disburse |
| GET | `/api/v1/loan-products/caltos-catalog` | — | Caltos catalog for creation |
| GET | `/api/v1/loan-products/:id/payment-methods` | — | Linked payment methods |
| POST | `/api/v1/loan-products/:id/payment-methods` | rule | Link a payment method |
| DELETE | `/api/v1/loan-products/:id/payment-methods/:methodId` | — | Unlink |

### Customers
| Method | Path | Query | Purpose |
|---|---|---|---|
| GET | `/api/v1/admin/customers` | `status, search, page, limit` | List / filter |
| GET | `/api/v1/admin/customers/:id` | — | Detail |

### Settlements
| Method | Path | Body | Purpose |
|---|---|---|---|
| GET | `/api/v1/admin/settlements` | `status` (query) | List settlement ledger |
| POST | `/api/v1/admin/settlements/mark-settled` | `{ settlement_ids: [], batch_payout_reference }` | Mark batch paid |
| POST | `/api/v1/admin/settlements/trigger-t1-cutoff` | `{}` | Run T+1 cutoff |

### Payment methods
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/admin/payment-methods` | List collection methods |

### Providers
| Method | Path | Body | Purpose |
|---|---|---|---|
| GET | `/api/v1/admin/identity-providers` | — | List identity providers |
| PATCH | `/api/v1/admin/identity-providers/:code/set-default` | `{}` | Set default |
| GET | `/api/v1/admin/utilities/providers` | — | List utility providers |
| PATCH | `/api/v1/admin/utilities/providers/:code/set-default` | `{}` | Set default |

### Identity / utilities verification
| Method | Path | Body | Purpose |
|---|---|---|---|
| GET | `/api/v1/utilities/banks` | — | Bank list |
| POST | `/api/v1/identity/account/verify` | `{ accountNumber, bankCode }` | Resolve account |
| POST | `/api/v1/identity/bvn/verify` | `{ bvn }` | Verify BVN |
| POST | `/api/v1/identity/nin/verify` | `{ nin }` | Verify NIN |

### ⚠️ Security defect (existing)
Vendor responses currently leak `passwordHash` and `secretKeyLive`. Strip these
from all admin vendor payloads — the UI never needs them and they must not cross the wire.

---

## Part B — Missing endpoints the UI needs (build to go live)

These power screens that currently render **sample/prototype data**. Example
payloads below are the exact shapes the UI expects.

### B1. Reporting / analytics — Dashboard (highest priority)
The whole dashboard "Reports" section (gross payout volume, loan status
breakdown, top vendors/customers/categories, money movement) is sample data —
there is no analytics endpoint. Proposed:

**GET `/api/v1/admin/reports/payout-volume?from=&to=`**
```json
{ "message": "OK", "data": {
  "total": 24600000, "previousTotal": 25080000,
  "series": [
    { "period": "2025-09", "value": 12400000, "vendorsServed": 18 },
    { "period": "2025-10", "value": 14100000, "vendorsServed": 21 }
  ] } }
```

**GET `/api/v1/admin/reports/loan-status-breakdown`**
```json
{ "message": "OK", "data": [
  { "status": "ACTIVE", "count": 412 },
  { "status": "PAID_OFF", "count": 268 },
  { "status": "OVERDUE", "count": 34 },
  { "status": "PENDING_DISBURSEMENT", "count": 19 } ] }
```

**GET `/api/v1/admin/reports/top?metric=vendors|customers|categories&limit=5`**
```json
{ "message": "OK", "data": [ { "name": "Northgate Retail", "amount": 18400000 } ] }
```

**GET `/api/v1/admin/reports/money-movement?month=YYYY-MM`**
```json
{ "message": "OK", "data": {
  "moneyIn": 6318385, "moneyOut": 3547727,
  "topSources": [ { "name": "Ifeoma Chukwu", "amount": 2140000 } ],
  "topSpend":   [ { "name": "Northgate Retail", "amount": 1840000 } ] } }
```

Also: the dashboard summary cards currently make 4 separate list calls just to read
`pagination.total`. A single **GET `/api/v1/admin/vendors/summary?from=&to=`** returning
`{ total, pending, approved, blacklisted }` would replace that.

### B2. Payment method — create (prototype today)
`Add payment method` is client-only; there is no create endpoint.
**POST `/api/v1/admin/payment-methods`**
```json
{ "name": "Opay Direct Debit", "code": "OPAY_DD", "type": "DIRECT_DEBIT" }
```
Returns the created `PaymentMethod`.

### B3. Vendor onboarding — persist extra fields
The onboarding wizard collects and live-verifies **CAC registration number**,
**business address**, and **ownership BVN/NIN**, but the vendor model has no
fields for them, so they are discarded. Add to the vendor entity + accept on
`POST /api/v1/vendors/onboard`:
```jsonc
{
  "businessName": "Northgate Retail Ltd",
  "cacRegistrationNumber": "RC1234567",   // NEW
  "businessAddress": "12 Admiralty Way, Lekki, Lagos", // NEW
  "contactPhone": "+234...", "contactEmail": "ops@vendor.com",
  "owners": [ { "fullName": "...", "bvn": "...", "nin": "..." } ], // NEW (verified, persist result)
  "settlement": { "accountName": "...", "accountNumber": "...", "bankCode": "058" }
}
```

### B4. Notifications feed (mock today)
The header bell renders a hardcoded list. Needed:
- **GET `/api/v1/admin/notifications?page=&limit=`** → paginated notifications
  `{ id, type, title, body, createdAt, readAt }`
- **PATCH `/api/v1/admin/notifications/read-all`** → mark all read
- **PATCH `/api/v1/admin/notifications/:id/read`** → mark one read

```json
{ "id": "ntf_01", "type": "LOAN_REPAYMENT", "title": "Loan repayment",
  "body": "John Doe (₦50,000) made a repayment", "createdAt": "2026-08-19T11:00:00Z", "readAt": null }
```
(Note: the future workspace hub also wants a separate **product updates / release notes**
channel — keep that distinct from transactional notifications.)

### B5. Customer reference (nice-to-have)
The list can show a human-facing `internalCustomerId` (e.g. `AF-CUST-00412`) under the
name. It's currently absent, so the UI shows nothing there. Add if a customer-facing
reference is desired.

### B6. Loan detail sub-resources (verify)
Confirm `GET /api/v1/admin/loans/:id` returns the repayment schedule / history the
detail page needs (installments, amounts, due dates, paid status). If not, add
**GET `/api/v1/admin/loans/:id/repayments`**.

### B7. Global search (client-side today)
The top-nav search and the `/asset-flex/search` results screen currently fetch the
**entire** customers, loans and vendors datasets and filter in the browser. That is fine
for the demo but does not scale. Needed:

**GET `/api/v1/admin/search?q=&limit=`** → grouped matches across entities:
```json
{ "message": "OK", "data": {
  "customers": [ { "id": "cus_…", "firstName": "Ifeoma", "lastName": "Chukwu", "email": "…",
                   "internalCustomerId": "AF-CUST-00412", "isTriadVerified": true, "status": "ACTIVE" } ],
  "loans":     [ { "id": "loan_…", "loanReference": "AF-LN-2026-0103", "itemDescription": "iPhone 15 Pro Max",
                   "category": "GADGETS", "principalAmount": 1320000, "status": "ACTIVE",
                   "vendor": { "businessName": "Northgate Retail Ltd" } } ],
  "vendors":   [ { "id": "ven_…", "businessName": "Bluewave Electronics", "industry": "…", "status": "APPROVED" } ]
} }
```
The query must match customer name/email/reference, loan reference/item/customer/vendor, and
business name/industry (the fields the client filters on today).

---

## Priority for go-live
1. **B1 Reporting** — the dashboard is the first screen; sample data is the biggest gap.
2. **B3 Vendor fields** — CAC/address/ownership are compliance data that must persist.
3. **A security fix** — stop leaking `passwordHash`/`secretKeyLive`.
4. **B2 Payment-method create**, **B4 Notifications** — remove the last prototypes.
5. **B5 / B6 / B7** — polish (search can stay client-side until dataset size forces B7).

---

## Part C — Detail-page & feature data (added this round)

The redesigned detail pages, risk scoring, and notifications need the following.
Fields marked **(persist)** are collected in the UI but currently discarded.

### C1. Vendor — persist onboarding data + expose on GET
`GET /api/v1/admin/vendors/:id` should return (and onboarding should persist):
```jsonc
{
  "cacRegistrationNumber": "RC-482910",     // (persist)
  "businessAddress": "14 Adeniran Ogunsanya St, Surulere, Lagos", // (persist)
  "industry": "Retail & Supermarkets",       // (persist)
  "owners": [                                  // (persist) ownership / directors
    { "fullName": "Chidi Northgate", "role": "Director / CEO", "bvn": "…", "nin": "…", "sharePercentage": 60 }
  ]
}
```
- `GET /api/v1/admin/vendors/:id/documents` — already exists; ensure it returns every
  required doc (CAC, TIN, proof of address, director ID, bank statement) with status.
- **Vendor loans**: the vendor detail lists loans processed by the vendor. Either add a
  `vendorId` filter to `GET /api/v1/admin/loans?vendorId=` or a
  `GET /api/v1/admin/vendors/:id/loans`.

### C2. Customer — richer profile
`GET /api/v1/admin/customers/:id` should return:
```jsonc
{
  "homeAddress": "13 Admiralty Way, Lekki, Lagos",
  "work": { "employer": "MTN Nigeria", "jobTitle": "Account Manager", "monthlyIncome": "620000", "employmentType": "Full-time", "workEmail": "…" },
  "salaryPartner": { "provider": "Remita", "employer": "MTN Nigeria", "staffId": "STF-1000", "accountNumber": "…" },
  "bvnVerification": { "status": "SUCCESS", "matchedName": "…", "dateOfBirth": "…", "provider": "Mono BVN", "verifiedAt": "…" },
  "ninVerification": { "status": "SUCCESS", "provider": "Prembly NIN", "verifiedAt": "…" },
  "documents": [ { "id": "…", "name": "Government ID", "type": "Identity", "uploadedAt": "…", "status": "VERIFIED" } ]
}
```
- **Customer loans / repayments**: same as vendor — filter loans by `customerId` (or
  `GET /api/v1/admin/customers/:id/loans`) to power loan + repayment history.

### C3. Risk score
The customer risk score is computed client-side today from on-time rate, verification,
debt-to-income, and history. Preferred: compute server-side and return
```json
{ "riskScore": 82, "riskBand": "LOW", "factors": [ { "key": "onTime", "impact": "positive", "detail": "…" } ] }
```
on the customer payload, so the model is centralized and auditable.

### C4. Loan repayments + manual repayment
- `GET /api/v1/admin/loans/:id` (or `/repayments`) must return the **repayment schedule**
  (installments: number, dueDate, amount, status, paidAt) and **repayment records**.
- **NEW — log a manual repayment (with receipt upload):**
  `POST /api/v1/admin/loans/:id/repayments` (multipart/form-data)
  ```
  amount, date, method, reference?, receipt (file)
  ```
  returns the created repayment record.

### C5. Notifications to businesses
- `POST /api/v1/admin/notifications` — send to one/many/all vendors:
  ```json
  { "recipientVendorIds": ["…"] , "allVendors": false, "subject": "…", "body": "…",
    "ctaLabel": "View settlements", "ctaUrl": "/…", "channels": ["dashboard","email"] }
  ```
  → creates in-app notifications for those vendors and/or queues emails.
- `GET /api/v1/admin/notifications/sent` — the sent log (subject, recipientCount,
  channels, sentAt, sentBy).

### C6. Reporting — add category dimension
Extend the reporting endpoints (Part B1) with a **category** breakdown and per-category
filters: `GET /api/v1/admin/reports/loans-by-category` →
`[ { "category": "GADGETS", "count": 268 } ]`, and accept `?category=` on loan list +
payout-volume reports.

### C7. Caltos vendor sync
Map an Asset Flex vendor to its Caltos vendor record so settlements/reporting can
reconcile across systems. The admin links this manually from the vendor detail view.

- **Vendor payload** — extend the vendor record (list + detail) with:
  ```
  caltosVendorId: string | null
  caltosVendorName: string | null   // resolved Caltos name, for display
  caltosLinkedAt: string | null     // ISO timestamp
  ```
- `GET /api/v1/admin/caltos/vendors?search=` — searchable Caltos vendor directory
  for the link picker:
  ```json
  [ { "id": "CV-1001", "name": "Everstone Motors", "email": "ops@…", "status": "ACTIVE" } ]
  ```
  (Bare array, `{data:[…]}`, or `{data:{items:[…]}}` all accepted client-side.)
- `POST /api/v1/admin/vendors/:id/caltos-link` — body `{ "caltos_vendor_id": "CV-1001" }`
  → returns the updated Vendor with the `caltos*` fields populated. Should validate
  the Caltos ID exists; consider enforcing one Caltos vendor ↔ one Asset Flex vendor
  and rejecting (409) if already linked elsewhere.
- `DELETE /api/v1/admin/vendors/:id/caltos-link` → clears the link, returns the vendor.
- **Filtering**: ideally accept `?caltosLinked=true|false` on the vendor list so the
  "Linked / Not linked" table filter can be server-side (currently client-side).
- **Audit**: record who linked/unlinked and when.

_Until these ship, the UI runs against demo-mode fixtures (see demo-mode.interceptor)._
