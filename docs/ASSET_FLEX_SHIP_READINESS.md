# Asset Flex Admin — Ship-Readiness Review

> Reviewed from three lenses — QA, Product Manager, Product Designer — by walking
> every screen in the running app (logged in as staff "Wisdom") against the live API.
> Design direction benchmarked against Mercury, Stripe, and Clerk.

## Verdict

**Not yet ship-ready as a live product — but ready to ship as a demo/pilot.**

The front end is genuinely well-built: every list is wired to the real API, states
(loading / empty / error / detail) exist, accessibility and the design system are
consistent, and 0 console errors across all pages. What blocks *go-live* is **backend
coverage**, not UI quality. Four areas render sample/prototype data because the
endpoints don't exist yet (see `ASSET_FLEX_API_REQUIREMENTS.md`, Part B).

---

## QA lens — correctness & completeness

**Fixed this pass:** disabled-primary button now reads as disabled; raw customer UUID
removed; loans empty-state copy no longer assumes filters; utilities-providers reachable
in nav; prototype banner 13px.

**Still open:**
| Sev | Finding |
|---|---|
| HIGH | Dashboard reports (payout volume, status breakdown, top-N, money movement) are **sample data** — no analytics endpoint. Honestly labelled, but not real. |
| HIGH | Vendor onboarding **discards** CAC number, address, and ownership BVN/NIN (verified live but not persisted). Compliance data loss. |
| HIGH | API leaks `passwordHash` / `secretKeyLive` in vendor responses. Security. |
| MED | `Add payment method` is a client-only prototype (no create endpoint). |
| MED | Notifications bell is a hardcoded mock feed. |
| MED | No detail screen for **loan products** or **settlements** (list only) — user-requested "view one" screens. |
| LOW | Loans & settlements have no live data, so those flows are unverified end-to-end against real records. |

**Not yet tested:** write actions against live data (approve/reject/blacklist, mark-settled,
T+1 cutoff, product CRUD) were not mutated on the live environment — needs a QA pass on a
seeded/staging DB.

---

## PM lens — is it valuable & complete enough?

**What works as a product story:** onboard a vendor → review KYB → approve → assign loan
products → customers finance purchases → settle vendors T+1. That spine is fully built
and navigable. A pilot user could do real KYB review today.

**What's missing for go-live:**
1. **Real numbers.** The dashboard is the first thing staff see and it's sample data.
   Reporting endpoints (B1) are the single highest-leverage backend task.
2. **Compliance persistence.** CAC/ownership data must be stored, not just verified (B3).
3. **Operational truth.** Settlements/loans need real records flowing so the ledger and
   T+1 cutoff mean something.
4. **Notifications** as a real signal, not a demo.

**Scope calls to make:** does a customer-facing reference ID exist? Are utility providers
in scope for v1 or identity-only? Is the payment-method catalog admin-editable or fixed?

---

## Designer lens — craft & direction

**Strong.** Consistent 4/8 spacing, one icon set/weight (Hugeicons 1.75), edge-to-edge
tables per the house style, restrained colour, good empty-state illustrations, accessible
status pills. The new **Mercury-style area chart** (gradient fill, thin line, minimal axis)
and clean donut land the intended fintech aesthetic. Vendor detail already mirrors the
Attio/Twenty record-detail pattern.

**Polish opportunities (post-fix):**
- Staff identity shows initials ("WE"), not an avatar photo — ties into the workspace-hub
  refinement (full name + avatar image).
- Give **loan products** and **settlements** proper detail pages matching the vendor-detail
  layout (header + key-value panels + timeline), per Attio/Twenty references.
- Notifications: once real, split *transactional* alerts from *product updates / release notes*.

**Design references (Mobbin):** Mercury balance chart (area), Attio / Twenty (record detail),
Stripe/Clerk (card + list density).

---

## What will make this go live (ordered)
1. Reporting/analytics endpoints (B1) → replace all dashboard sample data.
2. Persist vendor CAC/address/ownership (B3) + strip leaked secrets (A).
3. Seed real loans + settlements → verify those flows end-to-end.
4. Payment-method create (B2) + notifications feed (B4).
5. Build loan-product & settlement detail screens.
6. QA pass on all write actions against a staging DB.

Once 1–4 land, this is a shippable v1 admin for Asset Flex.
