# Strafe.js Documentation Design Direction

## Identity & Purpose
Technical reference and interactive protocol workbench for the Strafe.js TypeScript SDK (`@strafe-js/*` and `@strafe-js/strafebot`), serving developers integrating with the Strafe Chat HTTP REST API (`https://app.strafe.chat/api`) and Stargate WebSocket Gateway (`wss://app.strafe.chat/gateway/events`).

## Liveliness Dials
- `Dial: ENERGY 2 / RHYTHM 2 / MOTION 1`
- **ENERGY 2 (Balanced)**: High-density protocol specification tables, live 28-bit permission registers, and copy-pasteable TypeScript code blocks without decorative marketing fluff.
- **RHYTHM 2 (Consistent with intentional breaks)**: Asymmetric hero split (documentation entry + package installation on the left, live code window on the right), followed by a 2-column architectural package matrix, a structured guide index, and interactive protocol workbenches.
- **MOTION 1 (Hover and focus states only)**: Zero endless loops, zero floating animations, immediate border/background state transitions on hover and `:focus-visible`.

## Palette & Contrast Invariants (R-01, R-21, R-25, R-29)
- **Dark Theme Reason (R-21)**: Matches the native Strafe Chat dark workspace (`#101216`) and developer IDE environment for long-form code and JSON frame inspection.
- **Core Neutrals**:
  - Primary canvas: `#101216`
  - Elevated surface / card: `#161920`
  - Code / input well: `#0b0d11`
  - Structural divider border: `#2a303c`
  - Interactive control border: `#5c677a` (3.28:1 against `#101216`, 3.05:1 against `#161920`, 3.40:1 against `#0b0d11` - passes WCAG 1.4.11 non-text 3:1 contrast)
- **Typography Colors (WCAG AA 4.5:1 verified)**:
  - Primary text: `#e6e8ec` (15.28:1 on `#101216`)
  - Secondary text: `#b4bac6` (9.62:1 on `#101216`)
  - Muted / metadata text: `#949eb0` (6.45:1 on `#161920`, 7.01:1 on `#101216`)
- **Single Brand Accent (`R-29`)**:
  - Primary interactive fill: `#26613c` with `#ffffff` text (7.35:1 contrast ratio, passing WCAG AA 4.5:1)
  - Primary interactive hover: `#1f5433` with `#ffffff` text (8.85:1 contrast ratio)
  - Inline code & active register highlight: `#7fd19c` on `#0b0d11` / `#101216` (10.27:1 contrast ratio)
- **Semantic Status Colors (paired with text labels, never color-only)**:
  - Warning: `#f0be52` on `#161920`
  - Danger / Error: `#f28b8b` on `#161920`

## Written Reasons for Visual Decisions (R-31)
- **Color**: Uses Strafe Chat's native slate-charcoal (`#101216`) and forest green (`#26613c` / `#7fd19c`) so SDK docs match the target platform's developer portal while meeting WCAG AA 4.5:1 normal text and 3:1 non-text contrast.
- **Typography**: System UI sans-serif for prose readability and `JetBrains Mono` / `Fira Code` exclusively for TypeScript snippets, HTTP routes, bitshift expressions (`1 << n`), and Snowflake IDs (R-06).
- **Layout**: Varies section structure according to content role (split hero with runnable code, tabular package architecture, 2-column guide directory, and full-width interactive protocol tools) instead of repeating uniform card grids (R-05, R-14).
- **Elevation & Glassmorphism**: Only the sticky top navigation bar uses `backdrop-filter: blur(12px)` so scrolling code remains anchored beneath a single header layer; all cards and panels sit flat on solid `#161920` surfaces with `1px` borders (R-10, R-12, R-13).
- **Radius Hierarchy**: `10px` for outer tool workbenches and code windows, `6px` for buttons and form inputs, and `4px` for inline code tags and bit register cells (R-11).
- **Interactive Controls**: Every button, tab, and bit cell has a minimum `44x44px` touch target on mobile, explicit keyboard `:focus-visible` outlines (`2px solid #7fd19c`), and zero dead links (R-03, R-24, R-26, R-32).
