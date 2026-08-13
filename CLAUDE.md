# Security Policies — MUST READ

This project uses ShipSecure security policies. Before writing or modifying code, you MUST read and follow every policy file that exists in this repository.

## Policy Files

Read each of these files if they exist before making changes:

### Core
- SECURITY.md — Secrets management, attack surface, enforced architecture
- AUTH.md — Token handling, session rules, password policy, roles
- API.md — Input validation, rate limiting, error handling
- ACCESSIBILITY.md — WCAG compliance, semantic HTML, keyboard navigation, screen readers

### Extended
- DATABASE.md — Query safety, access control, migrations
- ENV_VARIABLES.md — Environment variable handling, secret rotation
- DEPLOYMENT.md — Deploy pipeline, environment isolation
- INCIDENT_RESPONSE.md — Breach response, escalation procedures
- ACCESS_CONTROL.md — Role-based access, permission boundaries
- DATA_PRIVACY.md — PII handling, data retention, GDPR compliance
- PAYMENTS.md — Payment processing, PCI compliance
- FILE_UPLOADS.md — Upload validation, storage security
- RATE_LIMITING.md — Throttling, abuse prevention
- THIRD_PARTY.md — Dependency security, vendor risk
- LOGGING_PII.md — Log sanitization, PII redaction
- TESTING.md — Security test requirements
- OBSERVABILITY.md — Monitoring, alerting, audit trails
- THREAT_MODEL.md — Known threats and mitigations
- PR_CHECKLIST.md — Pre-merge security checklist
- CONTRIBUTING_SECURITY.md — Security contribution guidelines
- VULNERABILITY_REPORTING.md — Responsible disclosure process
- POLICY_INDEX.md — Index of all policies
- FULL_AUDIT_CHECKLIST.md — 100+ point security audit checklist

### Stack Presets
- supabase-preset/ — Supabase-specific security rules (if present)
- firebase-preset/ — Firebase-specific security rules (if present)

## Rules

1. Always check policy files before writing code — if your task touches auth, APIs, database, payments, file uploads, or any area with a policy file, read that file first.
2. Never violate a policy — if a policy says "never do X", do not do X. Flag it if unsure.
3. Secrets are never hardcoded — no API keys, tokens, passwords, or credentials in source code.
4. Validate all input — every endpoint, every form, every external data source.
5. Follow the principle of least privilege — only request the permissions you need.

# UI Design System

- All spacing and sizing (padding, margin, gap, width, height) MUST come from the 4px/8px scale: 4, 8, 12, 16, 20, 24, 32, 40, 48px, etc. Never use arbitrary odd values (e.g. 6px, 10px, 13px, 18px) for spacing — round to the nearest step on the scale.
- Never place two interactive elements (buttons, pills, rail items, list rows) directly adjacent with zero gap — always at least 4px between tightly grouped controls, 8px+ between distinct groups.
- Selected/active states use a solid, crisp border or filled background — never a soft `box-shadow` glow/ring around the element, which reads as a lingering focus outline rather than an intentional selected state.
- Elevated surfaces (dropdowns, modals, popovers, cards that float above content) use a layered shadow — a tight low-opacity contact shadow plus a soft ambient shadow — never a single flat `box-shadow`, which reads harsh/unpolished.
- Icons: one icon set only (`@hugeicons-pro/core-stroke-rounded`), one stroke weight only (`1.75`) across the entire project. Never mix stroke weights or icon families on the same surface.
- Reference Mercury and Stripe's own product UI for spacing/density calibration before shipping a new component — err on the side of more generous padding over cramped/tight layouts.
