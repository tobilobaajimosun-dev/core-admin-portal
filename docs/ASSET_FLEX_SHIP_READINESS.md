# Asset Flex Admin — Ship-Readiness Review

> Reviewed from three lenses — QA, Product Manager, Product Designer — by walking
> every screen in the running app (logged in as staff "Wisdom"). Design direction
> benchmarked against Mercury, Stripe, and Clerk.
> Last refreshed: 2026-08-19.

## Verdict

**Ship-ready as a demo/pilot today. Not yet ready as a live product — the gap is
backend coverage, not front-end quality.**

The front end is complete and polished: every list and detail screen exists and is
wired to the real API, every "view one" screen (vendor, customer, loan, loan product,
settlement) is built, all interaction states (loading / empty / error / detail / modal)
are present, the design system is consistent, and there are **0 console errors across
every route**. A demo-mode toggle serves full, internally-consistent fixture data so
the entire product can be clicked through end-to-end with no backend at all.

What blocks *go-live* is that four areas render sample/prototype data because the
endpoints don't exist yet (see `ASSET_FLEX_API_REQUIREMENTS.md`, Parts B & C).

---

## QA lens — correctness & completeness

**Verified this pass (demo mode, 0 console errors):** dashboard, vendors list+detail,
customers list+detail, loans list+detail, loan-products list+detail, settlements
list+detail, payment methods, notifications, providers, and the new global search
results screen all load, navigate, and render consistent related data.

**Closed since last review:** loan-product and settlement **detail pages now exist**;
settlement **receipt modal**; **log-manual-repayment with receipt upload**; customer
**risk calculator**; vendor **ownership / industry / CAC / address** sections;
**notify-customer** and **notify-businesses** flows; category reflected across loans;
**global search** across customers/loans/vendors; nav search hover/focus/clear states;
stat-card and info icons re-rendered as inline SVG (hugeicons glyph breakage fixed).

**Still open (all backend-dependent):**
| Sev | Finding |
|---|---|
| HIGH | Dashboard reports (payout volume, status breakdown, top-N, money movement) are **sample data** — no analytics endpoint (B1). |
| HIGH | Vendor onboarding collects & live-verifies CAC number, address, ownership BVN/NIN but the API **discards** them — compliance data loss (B3/C1). |
| HIGH | API leaks `passwordHash` / `secretKeyLive` in vendor responses — strip server-side (A). |
| MED | `Add payment method`, notify-businesses, and manual-repayment write to **no endpoint** yet (B2/C4/C5). |
| MED | Notifications bell + feed are a hardcoded mock (B4). |
| MED | Risk score is computed **client-side**; should be server-side & auditable (C3). |
| MED | Global search filters **client-side** over full datasets — needs a real `/search` endpoint before the data grows (B7). |
| LOW | Loans/customers/settlements have no live records, so write actions (approve/reject/blacklist, mark-settled, T+1 cutoff, product CRUD) are **unverified against a real DB** — needs a staging pass. |

---

## PM lens — is it valuable & complete enough?

**The product spine is fully built and navigable:** onboard a vendor → review KYB →
approve → assign loan products → customers finance purchases → repayments logged →
vendors settled T+1 → notify businesses. A pilot user can walk that entire journey
today in demo mode, and can do real KYB review the moment the API is seeded.

**What's left for go-live (in leverage order):**
1. **Real numbers** — the dashboard is the first screen staff see and it's sample data.
   Reporting endpoints (B1) are the single highest-value backend task.
2. **Compliance persistence** — CAC / address / ownership must be stored, not just
   verified (B3/C1).
3. **Operational truth** — seed real loans + settlements so the ledger, T+1 cutoff and
   repayment history mean something.
4. **Last prototypes → real** — payment-method create, notifications feed, manual
   repayment, notify-businesses (B2/B4/C4/C5).

**Open scope calls:** is a customer-facing reference ID (`AF-CUST-…`) in scope? Are
utility providers v1 or identity-only? Is the payment-method catalog admin-editable or
fixed? Should risk scoring move server-side for v1 or stay a UI heuristic for the pilot?

---

## Designer lens — craft & direction

**Strong and consistent.** 4/8 spacing scale, one icon set/weight (Hugeicons 1.75),
edge-to-edge tables per the house style, restrained colour, accessible status pills,
good empty states. The Mercury-style area chart (gradient fill, thin line, minimal axis)
and donut land the fintech aesthetic. Detail pages follow the Stripe record-detail
pattern (main column + sticky key-value rail). Search results reuse the exact list-page
table, so results read identically to the screens they link into.

**Remaining polish (non-blocking):**
- Staff identity shows initials ("WE"), not an avatar photo — ties into the future
  workspace-hub refinement (full name + avatar image).
- Once notifications are real, keep *transactional* alerts separate from *product
  updates / release notes*.

**Design references (Mobbin):** Mercury balance chart (area), Stripe/Clerk (card + list
density), Attio/Twenty (record detail).

---

## What will make this go live (ordered)
1. Reporting/analytics endpoints (B1) → replace all dashboard sample data.
2. Persist vendor CAC/address/ownership (B3/C1) + strip leaked secrets (A).
3. Seed real loans + settlements → verify those flows end-to-end on staging.
4. Payment-method create (B2), notifications feed (B4), manual repayment (C4),
   notify-businesses (C5).
5. Move risk scoring server-side (C3) and add a real `/search` endpoint (B7) when
   dataset size warrants.

Once 1–4 land and the write actions are QA'd on a seeded staging DB, this is a
shippable v1 admin for Asset Flex.
