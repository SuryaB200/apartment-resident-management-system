---
name: Tenancy OS
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#464554'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#777586'
  outline-variant: '#c7c4d7'
  surface-tint: '#5148d7'
  primary: '#2a14b4'
  on-primary: '#ffffff'
  primary-container: '#4338ca'
  on-primary-container: '#c1beff'
  inverse-primary: '#c3c0ff'
  secondary: '#515f74'
  on-secondary: '#ffffff'
  secondary-container: '#d5e3fd'
  on-secondary-container: '#57657b'
  tertiary: '#003f5c'
  on-tertiary: '#ffffff'
  tertiary-container: '#00577e'
  on-tertiary-container: '#84cdff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e3dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#100069'
  on-primary-fixed-variant: '#372abf'
  secondary-fixed: '#d5e3fd'
  secondary-fixed-dim: '#b9c7e0'
  on-secondary-fixed: '#0d1c2f'
  on-secondary-fixed-variant: '#3a485c'
  tertiary-fixed: '#c9e6ff'
  tertiary-fixed-dim: '#89ceff'
  on-tertiary-fixed: '#001e2f'
  on-tertiary-fixed-variant: '#004c6e'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-hero:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.025em
  display-hero-mobile:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  tabular-metric:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  gutter-lg: 2rem
  margin: 1.5rem
  margin-sm: 1rem
  margin-lg: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embodies an ultra-minimal, high-precision aesthetic engineered specifically for high-efficiency property management workflows. It removes decorative chrome to focus entirely on actionable property data, lease cycles, financial ledgers, and maintenance routing.

### Target Audience & Personality
- **Audience:** Institutional property managers, boutique portfolio owners, leasing agents, and operational staff handling high-frequency multi-tenant operations across desktop and mobile devices.
- **Personality:** Methodical, unhurried, razor-sharp, and dependable. It delivers the calm authority of high-end architectural documentation merged with modern enterprise utility.
- **Visual Style:** Modern Functional Minimalist. Characterized by generous breathing room, structured wireframe-thin borders, tactile micro-interactions, and a disciplined lack of gratuitous gradients or heavy skeuomorphism.

## Colors

The palette employs a high-contrast, low-distraction philosophy. Surfaces rely on crisp warm whites and pale slate fills, framed by architectural `#E2E8F0` hairline rules.

### Functional Palette Mapping
- **Primary (`#4338CA` - Indigo 700):** Reserved strictly for key interactive elements, verified active states, and confirmed navigational anchors. Delivers confident accessibility against light surfaces.
- **Secondary (`#334155` - Slate 700):** Utilized for structural metadata, tab labels, and secondary interactive buttons.
- **Tertiary (`#0EA5E9` - Sky 500):** Deployed selectively for informational indicators, active inspection markers, or real-time event pings.
- **Neutral Core (`#0F172A` - Slate 900):** Anchors all primary typography, numeric readouts, and high-priority states.
- **Canvas & Surface Fills:** Canvas background rests on `#F8FAFC` (Slate 50), with card containers elevated via pure white `#FFFFFF` paired with an inner crisp outline.
- **Status & Feedback Accents:**
  - *Occupied / Paid / Healthy:* `#059669` (Emerald 600) fill on `#ECFDF5` (Emerald 50).
  - *Pending / Late Notice:* `#D97706` (Amber 600) fill on `#FFFBEB` (Amber 50).
  - *Vacant / Delinquent / Urgent Maintenance:* `#DC2626` (Red 600) fill on `#FEF2F2` (Red 50).

## Typography

The typography system relies exclusively on **Inter** to maintain absolute visual continuity, exceptional optical legibility at small sizes, and tabular numeral alignment for monetary balances, square footage, and lease timelines.

### Implementation Rules
- **Tabular Figures:** Always apply `font-feature-settings: "tnum" 1` to financial tables, unit numbers, metric cards, and dates to preserve column tracking.
- **Visual Weight Discipline:** Headlines maintain a restrained Semi-Bold weight (`600`) rather than aggressive bold weights to prevent visual heaviness.
- **High Information Density vs. Comfort:** Body text defaults to `14px` (`body-md`) with a `20px` line-height, granting comfortable visual breathing room within property registries and inspection ledgers.
- **Label Tracking:** Metadata tags, column headers, and status badges use `label-sm` or `label-md` with gentle uppercase letter spacing (`0.02em` - `0.04em`) to establish crisp visual distinction from variable tenant data.

## Layout & Spacing

The layout adopts an adaptive fluid column framework engineered for high-density administrative dashboards that gracefully collapse to single-column workflows on handheld devices.

### Grid & Breakpoints
- **Desktop (1280px and above):** 12-column fluid grid. Outer section margins set to `margin-lg` (`3rem`), column gutters to `gutter-lg` (`2rem`). Supports persistent left-hand utility navigation (`240px` fixed) paired with dynamic multi-card workspace grids.
- **Tablet (768px - 1279px):** 8-column layout. Gutters scale to `gutter` (`1.5rem`), canvas margins to `margin` (`1.5rem`). Complex KPI rows shift from 4 across to 2x2 formations.
- **Mobile (< 768px):** 4-column flow. Gutters scale to `gutter-sm` (`1rem`), margins collapse to `margin-sm` (`1rem`). Nav bars compress into a bottom contextual dock or collapsible sheet.

### Spacing Principles
- **Interior Container Rhythm:** Use `space-md` (`1rem`) to `space-lg` (`1.5rem`) for interior card padding. Never pack data against card borders.
- **Vertical Hierarchy:** Metric value stacks use tight `space-xs` (`0.25rem`) between labels and numbers. Adjacent cards or table rows separate by `space-md`. Major dashboard module groupings separate by `space-xl` (`2.5rem`).

## Elevation & Depth

Visual hierarchy is established primarily through **structural borders and tonal contrast** rather than multi-layered ambient drop shadows. This preserves crispness on non-retina displays and prevents visual mud in data-dense table views.

### Layer Architecture
- **Base Canvas (Level 0):** Filled with neutral warm-slate `#F8FAFC`.
- **Card & Data Panels (Level 1):** Solid `#FFFFFF` surface with a continuous `1px` structural outline in `#E2E8F0`. No drop shadow in standard rest state.
- **Interactive Hover & Overlay Focus (Level 2):** Subtle micro-shadow tinted with cool slate: `box-shadow: 0 4px 12px -2px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.03)`. Border shifts dynamically to `#CBD5E1`.
- **Modals, Flyout Drawers & Dropdowns (Level 3):** Grounded by a higher-depth isolation shadow: `box-shadow: 0 12px 32px -4px rgba(15, 23, 42, 0.1), 0 4px 8px -2px rgba(15, 23, 42, 0.04)`. Paired with a backdrop dimming layer of `rgba(15, 23, 42, 0.3)` overlaid with `backdrop-filter: blur(2px)`.

## Shapes

The design system uses a **Soft** shape geometry (`roundedness: 1`), conveying strict precision, architectural structure, and professional restraint.

### Geometric Rules
- **Micro Elements (Inputs, Buttons, Badges):** Standardized at `0.25rem` (4px) to `0.375rem` (6px) corner radius. This prevents toy-like roundness and feels like a specialized tool.
- **Containers & Surfaces (Cards, Tables, Modals):** Scaled at `rounded-lg` (`0.5rem` / 8px).
- **Status Pills & Count Chips:** Configured with complete pill roundness (`9999px`) to create an unmistakable semantic distinction between actionable structural containers and read-only status labels.

## Components

### Buttons
- **Primary:** Solid `#4338CA` background, text `#FFFFFF`, 4px border radius. Height: 36px (compact) or 40px (default). Hover: `#3730A3`. Active: `#312E81`. Focus: `0 0 0 2px #FFFFFF, 0 0 0 4px #4338CA`.
- **Secondary / Outline:** Background `#FFFFFF`, 1px border `#E2E8F0`, text `#334155`. Hover: `#F8FAFC` background with border `#CBD5E1`.
- **Ghost / Destructive:** Ghost buttons use transparent backgrounds with `#475569` text. Destructive actions use `#DC2626` text, with light tint `#FEF2F2` on hover.

### Inputs & Form Fields
- **Container:** Height 40px, background `#FFFFFF`, border `1px solid #CBD5E1`, border radius 6px, padding horizontal 12px.
- **Typography:** `body-md` (14px), placeholder text in `#94A3B8`.
- **Active State:** Focus changes border to `#4338CA` with an ambient glow ring: `box-shadow: 0 0 0 3px rgba(67, 56, 202, 0.12)`.
- **Validation:** Error triggers `1px solid #DC2626` accompanied by an inline alert icon and `label-md` error helper text below the field.

### Status Tags & Badges
- **Shape & Size:** Inline-flex, height 22px, padding horizontal 8px, border radius 9999px (pill).
- **Semantics:**
  - *Occupied / Good Standing:* Text `#065F46`, background `#ECFDF5`, border `1px solid #A7F3D0`.
  - *Pending Lease / Maintenance In Progress:* Text `#92400E`, background `#FFFBEB`, border `1px solid #FDE68A`.
  - *Vacant / Notice Served:* Text `#991B1B`, background `#FEF2F2`, border `1px solid #FECACA`.
  - *Neutral Unit Metadata (e.g., "Commercial", "2B/2BA"):* Text `#475569`, background `#F1F5F9`, border `1px solid #E2E8F0`.

### Data Cards & Property Metrics
- **Structure:** Crisp white card container with `1px solid #E2E8F0`. Padding `1.25rem`.
- **Header:** Secondary label in `label-sm` uppercase `#64748B`, paired with an optional top-right contextual sparkline or trend pill.
- **Value:** `tabular-metric` (24px `#0F172A`), stacked above a secondary subtext line (e.g., "98.2% vs last month") set in `body-sm`.

### Data Tables & Property Records
- **Header:** Background `#F8FAFC`, border-bottom `1px solid #E2E8F0`, text `label-sm` uppercase `#64748B`, padding vertical 10px, padding horizontal 16px.
- **Rows:** White background, border-bottom `1px solid #F1F5F9`, height 52px. Hover state highlights row with `#F8FAFC`.
- **Selection:** Checkbox column fixed to 48px width with aligned multi-select state actions.

### Checkboxes & Radios
- **Control:** 16px x 16px, border `1.5px solid #CBD5E1`, border radius 4px (checkbox) or circular (radio).
- **Checked:** Background `#4338CA`, border `#4338CA`, inner white checkmark icon.

### Specialized Component: Rent Ledger & Lease Progress Bar
- **Lease Meter:** A 6px horizontal bar with `#E2E8F0` track; active elapsed duration filled with `#4338CA`. If lease expires within 30 days, track automatically shifts to warning accent `#D97706`.