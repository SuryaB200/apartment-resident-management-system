---
name: CivicQuarters Enterprise
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#515f74'
  on-secondary: '#ffffff'
  secondary-container: '#d5e3fd'
  on-secondary-container: '#57657b'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#00174b'
  on-tertiary-container: '#497cff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d5e3fd'
  secondary-fixed-dim: '#b9c7e0'
  on-secondary-fixed: '#0d1c2f'
  on-secondary-fixed-variant: '#3a485c'
  tertiary-fixed: '#dbe1ff'
  tertiary-fixed-dim: '#b4c5ff'
  on-tertiary-fixed: '#00174b'
  on-tertiary-fixed-variant: '#003ea8'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.005em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.025em
  data-mono:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-compact: 0.5rem
  margin: 1.5rem
  margin-compact: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system targets property managers, asset operators, leasing agents, and operational controllers managing multi-family portfolios and commercial units. The interface projects quiet authority, institutional reliability, and operational speed. It operates under a strict anti-decorative philosophy: zero neon diffusions, zero frosted translucent materials, and zero oversized aesthetic margins.

The style is utilitarian enterprise minimalism—drawing direct lineage from high-performance developer consoles and precision financial ledgers like Stripe, Retool, and modern ERP engines. Visual hierarchy is established strictly through layout geometry, structural hairline framing, disciplined typography scales, and categorical status tokens. Every screen prioritizes information throughput, rapid keyboard navigation, clear tabular comparisons, and deterministic feedback.

## Colors

The palette enforces a calibrated balance between deep navy structures and neutral slate tones, ensuring high-contrast clarity across multi-column data grids.

### Surface and Structure Tokens
- **Canvas Root:** `#F8FAFC` (Cool slate tint providing subtle contrast behind white data cards)
- **Primary Surface (Cards, Modals, Popovers):** `#FFFFFF`
- **Secondary Surface (Table Headers, Inset Panels):** `#F1F5F9`
- **Border Default (Hairline Grids & Dividers):** `#E2E8F0`
- **Border Strong (Active Inputs, Card Outlines):** `#CBD5E1`
- **Border Focus / Selection:** `#0F172A`

### Typography and Content
- **Text Primary:** `#0F172A` (Slate 900)
- **Text Secondary:** `#334155` (Slate 700)
- **Text Muted:** `#64748B` (Slate 500)
- **Text Disabled:** `#94A3B8` (Slate 400)

### Operational Status Tokens
Semantic colors are strictly pair-matched for accessible contrast and standard enterprise pills:
- **Success (Settled, Occupied, Active Lease):** Foreground `#16A34A`, Background `#DCFCE7`, Border `#BBF7D0`
- **Pending (Under Review, Draft, Maintenance Dispatched):** Foreground `#D97706`, Background `#FEF3C7`, Border `#FDE68A`
- **Critical / Overdue (Arrears, Notice to Vacate, Blocked):** Foreground `#DC2626`, Background `#FEE2E2`, Border `#FECACA`
- **Info (Inspection Scheduled, Periodic Notice):** Foreground `#2563EB`, Background `#DBEAFE`, Border `#BFDBFE`

## Typography

Typography prioritizes high-density vertical layout economy and legible rendering on dense desktop configurations. Inter is implemented across all tiers with strict tracking rules to eliminate loose text rendering.

Financial ledgers, rent rolls, square footages, and unit IDs must systematically enforce `font-feature-settings: "tnum" 1, "cv05" 1, "zero" 1` (tabular figures and slashed zero) through the `data-mono` role. All column data must align based on standard numeric conventions: monetary values and unit numbers right-aligned, strings and tenant entities left-aligned. Uppercase tracking is reserved exclusively for micro-tier meta tags (`label-sm`), never exceeding 11px.

## Layout & Spacing

The layout model is built on an operational workstation pattern featuring an invariant left-side navigation rail (64px collapsed, 240px expanded), an optional secondary context pane (280px for filter configurations or tenant directory tree), and a responsive canvas workspace.

- **Desktop (>= 1280px):** Primary work viewport. High density. Gaps remain locked to `space-md` (12px) or `space-lg` (16px) to maximize on-screen records per view.
- **Laptop / Small Display (1024px - 1279px):** Content conforms to fluid columns; non-essential metrics pane collapses into drawer format.
- **Tablet / Operational Field (768px - 1023px):** Data tables convert to scrollable horizontal matrix containers with frozen left identifier columns (Unit/Tenant ID).
- **Mobile (< 768px):** Linear single-column flow with pinned sticky bottom action bars for field inspections and emergency dispatch.

## Elevation & Depth

Visual hierarchy is communicated via strict structural framing rather than stacked drop shadows or ambient depth. 

- **Flat Framing:** Card panels and containers rest on 1px solid `#E2E8F0` borders without drop shadows.
- **Layer 1 (Card & Section):** Crisp hairline border `#E2E8F0` on white `#FFFFFF` against canvas `#F8FAFC`. Shadow is `none`.
- **Layer 2 (Dropdowns & Context Popovers):** Hairline border `#CBD5E1` with clean, low-diffusion boundary elevation: `0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)`.
- **Layer 3 (Modals & Sheet Drawers):** Hairline border `#CBD5E1` with structural shadow `0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -4px rgba(15, 23, 42, 0.05)`. Backing scrim is set to solid `rgba(15, 23, 42, 0.45)` with no blur.

## Shapes

The interface employs a firm, compact radius standard (`roundedness: 1`). 

- Default inputs, buttons, table cell selections, and cards share an exact `4px` (0.25rem) radius.
- Standard dialogue overlays and flyout sheets cap at `6px` or `8px` (`rounded-lg`).
- Status pills and operational tags are the only elements that allow a rounded silhouette (`9999px`), used purely to establish distinction between clickable components and static state indicators.

## Components

### Buttons
- **Primary:** Solid `#0F172A` background, `#FFFFFF` text, 1px solid `#0F172A`. Hover: `#1E293B`. Active: `#020617`. Height: 32px (default) or 28px (compact). Padding: 0 12px.
- **Secondary:** Solid `#FFFFFF` background, `#334155` text, 1px solid `#CBD5E1`. Hover: `#F8FAFC`, border `#94A3B8`.
- **Destructive:** Solid `#DC2626` background, `#FFFFFF` text. Hover: `#B91C1C`.
- **Tertiary / Ghost:** Transparent background, `#475569` text. Hover: `#F1F5F9`.

### Status Badges & Pills
- Inline pill components (height: 20px, padding: 0 8px, border-radius: 9999px).
- Pairwise foreground and background matching strictly adhered to:
  - *Active / Paid:* Text `#16A34A`, background `#DCFCE7`, border 1px solid `#BBF7D0`.
  - *Past Due / Eviction:* Text `#DC2626`, background `#FEE2E2`, border 1px solid `#FECACA`.
  - *Pending Verification:* Text `#D97706`, background `#FEF3C7`, border 1px solid `#FDE68A`.
  - *Unit Maintenance:* Text `#2563EB`, background `#DBEAFE`, border 1px solid `#BFDBFE`.

### Data Tables & Data Grids
- **Header:** Height 32px, background `#F8FAFC`, border-bottom 1px solid `#CBD5E1`, text uppercase 11px `#64748B`, font-weight 600.
- **Row:** Height 40px (default), 32px (dense mode). Border-bottom 1px solid `#E2E8F0`. Hover: `#F8FAFC`.
- **Selected Row:** Background `#F1F5F9`, border-left 3px solid `#0F172A`.
- **Numerical Alignment:** Tabular figures aligned right, metadata strings aligned left.

### Form Inputs & Filters
- **Text Inputs & Dropdowns:** Height 32px, background `#FFFFFF`, border 1px solid `#CBD5E1`, border-radius 4px, font-size 13px, padding 0 8px.
- **Focus State:** 1px solid `#0F172A` border with a crisp 1px outline offset in `#0F172A`. No wide luminous rings.
- **Checkboxes:** 14px x 14px square, 2px border radius, border 1px solid `#94A3B8`. Checked: solid `#0F172A` with white check glyph.

### Cards & Metrics Blocks
- Background `#FFFFFF`, 1px solid `#E2E8F0`, 4px radius. 
- KPI cards feature an upper row with an 11px uppercase label (`#64748B`), a 20px bold figure with tabular numbers, and a compact trend pill pinned to the top right. Zero ambient glowing drop shadows.