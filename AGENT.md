# Core Admin Portal — AGENT.md

## Project
Internal admin dashboard for Core, a Nigerian fintech lending app by Princeps Credit Systems.
Manages users, loans, wallets, VAS transactions, notifications and audit logs.

## Stack
- Next.js 14 (App Router, TypeScript)
- Tailwind CSS
- shadcn/ui as component base
- Hugeicons Pro (@hugeicons/react + @hugeicons-pro/core-stroke-rounded)
- Plus Jakarta Sans via @fontsource/plus-jakarta-sans

## Fonts
- Headings: SN Pro (self-hosted in /public/fonts/, weights 400 500 600 700)
- Body/UI: Plus Jakarta Sans (npm, weights 400 500 600)
- @font-face rules already in globals.css

## Design Language
Linear-inspired: quiet, restrained, compact. Primary color #00B3FF.
- Buttons: rounded-lg (NOT pills). h-10/h-8, text-[13px] font-medium.
- Inputs: h-9, rounded-lg, bg-[#F8FAFC], border border-[#E2E8F0], label text-[12px] text-[#475569].
- Sidebar active: bg-[#F2F7F9] text-[#0F172A] (grey, NOT blue). Icons 16px. Items py-1.5 text-[13px].
- Modals: rounded-xl, border border-[#E2E8F0], shadow-sm, max-w-[480px].
  Header: px-5 py-4 border-b, title text-[15px] font-semibold.
  Close: Cancel01Icon size=16, hover:bg-[#F2F7F9] rounded-md p-1.
  Body: px-5 py-5.

## Design Tokens
primary: #00B3FF | primaryHover: #009FE6 | primary10: rgba(0,179,255,0.10)
textPrimary: #0F172A | textSecondary: #475569 | textPlaceholder: #94A3B8
appBg: #F8FAFC | cardBg: #F2F7F9 | white: #FFFFFF
border: #E2E8F0 | divider: #E2E8F0
success: #22C55E | warning: #F59E0B | error: #EF4444 | info: #00B3FF

## Typography — Web Scale
Headings — SN Pro
H1: 32px / 130% / 700
H2: 24px / 130% / 600
H3: 20px / 130% / 600
H4: 18px / 130% / 600
H5: 16px / 130% / 600
H6: 15px / 130% / 600

Body — Plus Jakarta Sans
Body XL:   18px / 150% / 400
Body LG:   16px / 150% / 400
Body MD:   14px / 150% / 400
Body SM:   13px / 150% / 400
Body XS:   12px / 150% / 400

UI Labels — Plus Jakarta Sans
Label LG:  14px / 130% / 500
Label MD:  13px / 130% / 500
Label SM:  12px / 130% / 500
Caption:   11px / 130% / 400

## Spacing — Web Scale
4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80px

## Hugeicons
import { HugeiconsIcon } from "@hugeicons/react"
import { IconName } from "@hugeicons-pro/core-stroke-rounded"
<HugeiconsIcon icon={IconName} size={20} color="currentColor" strokeWidth={1.5} />
Activate license in layout.tsx: hugeiconsConfig.licenseKey = "YOUR_KEY"

## Logo
/public/images/core-logo.png

## Modules (9 modules, 38 screens)
1. Auth — Login, Password Reset, Change Password
2. User Management & Roles
3. Dashboard & Metrics
4. Customer Management
5. Loans Management
6. Wallet & Accounts
7. VAS / Bill Payments
8. Notifications
9. Activity & Audit Logs

## FRD Rules
- Currency: ₦ 2dp + thousands separator e.g. ₦1,234,567.00
- All lists: search + filter + sort + pagination
- Filters persist on back navigation
- BVN/KYC masked unless role permits
- Confirm modal before: delete admin, role change, suspend customer, bulk notification
- Export disabled when no data
- 5 failed logins = 15min lockout
- 15min inactivity = session timeout
