# UI Design System

House rules for building UI in this repo. Applies to every component, page, and style —
follow these before shipping anything visual. Calibrated against Mercury and Stripe's own
product UI.

## Spacing & sizing

- All spacing and sizing (padding, margin, gap, width, height) MUST come from the **4px / 8px
  scale**: 4, 8, 12, 16, 20, 24, 32, 40, 48px, etc. Never use arbitrary odd values (e.g. 6px,
  10px, 13px, 18px) for spacing — round to the nearest step on the scale.
- Never place two interactive elements (buttons, pills, rail items, list rows) directly
  adjacent with zero gap — always at least **4px** between tightly grouped controls, **8px+**
  between distinct groups.
- Err on the side of more generous padding over cramped/tight layouts. Reference Mercury and
  Stripe's own product UI for spacing/density calibration before shipping a new component.

## States & elevation

- **Selected / active states** use a solid, crisp border or filled background — never a soft
  `box-shadow` glow/ring around the element, which reads as a lingering focus outline rather
  than an intentional selected state.
- **Elevated surfaces** (dropdowns, modals, popovers, cards that float above content) use a
  layered shadow — a tight low-opacity contact shadow plus a soft ambient shadow — never a
  single flat `box-shadow`, which reads harsh/unpolished.

## Icons

- One icon set only: **`@hugeicons-pro/core-stroke-rounded`**.
- One stroke weight only: **1.75**, across the entire project.
- Never mix stroke weights or icon families on the same surface.
