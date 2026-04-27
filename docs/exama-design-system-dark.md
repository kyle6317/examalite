# Exama Design System — Dark Mode

**Version 1.0** · Online Examination Platform · Dark Mode Only

---

## Table of Contents

1. [Overview & Philosophy](#1-overview--philosophy)
2. [Design Principles](#2-design-principles)
3. [Foundations](#3-foundations)
   - 3.1 [Color](#31-color)
   - 3.2 [Typography](#32-typography)
   - 3.3 [Spacing](#33-spacing)
   - 3.4 [Border Radius](#34-border-radius)
   - 3.5 [Shadows & Elevation](#35-shadows--elevation)
   - 3.6 [Iconography](#36-iconography)
4. [Components](#4-components)
   - 4.1 [Buttons](#41-buttons)
   - 4.2 [Form Controls](#42-form-controls)
   - 4.3 [Badges & Tags](#43-badges--tags)
   - 4.4 [Cards](#44-cards)
   - 4.5 [Alerts & Callouts](#45-alerts--callouts)
   - 4.6 [Progress Indicators](#46-progress-indicators)
   - 4.7 [Tooltips](#47-tooltips)
   - 4.8 [Modals & Dialogs](#48-modals--dialogs)
   - 4.9 [Tables](#49-tables)
   - 4.10 [Navigation — Breadcrumb](#410-navigation--breadcrumb)
   - 4.11 [Navigation — Pagination](#411-navigation--pagination)
   - 4.12 [Navigation — Tabs](#412-navigation--tabs)
   - 4.13 [Empty States](#413-empty-states)
5. [Patterns](#5-patterns)
   - 5.1 [Sidebar Layout](#51-sidebar-layout)
   - 5.2 [Dashboard Header](#52-dashboard-header)
   - 5.3 [Data Filters](#53-data-filters)
6. [Exam UI](#6-exam-ui)
   - 6.1 [Exam Topbar](#61-exam-topbar)
   - 6.2 [Question Map — Desktop (Left Panel)](#62-question-map--desktop-left-panel)
   - 6.3 [Question Panel](#63-question-panel)
   - 6.4 [Answer Options](#64-answer-options)
   - 6.5 [Timer](#65-timer)
   - 6.6 [Result Screen](#66-result-screen)
   - 6.7 [Review Mode](#67-review-mode)
   - 6.8 [Display Mode: Paged vs Continuous Scroll](#68-display-mode-paged-vs-continuous-scroll)
7. [Mobile Design System](#7-mobile-design-system)
   - 7.1 [Breakpoints & Responsive Strategy](#71-breakpoints--responsive-strategy)
   - 7.2 [Mobile Typography](#72-mobile-typography)
   - 7.3 [Mobile Spacing & Touch Targets](#73-mobile-spacing--touch-targets)
   - 7.4 [Mobile Navigation — Bottom Tab Bar](#74-mobile-navigation--bottom-tab-bar)
   - 7.5 [Mobile Navigation — Hamburger Drawer](#75-mobile-navigation--hamburger-drawer)
   - 7.6 [Mobile Cards & Lists](#76-mobile-cards--lists)
   - 7.7 [Mobile Forms](#77-mobile-forms)
   - 7.8 [Mobile Tables → List View](#78-mobile-tables--list-view)
   - 7.9 [Mobile Modals → Bottom Sheet](#79-mobile-modals--bottom-sheet)
   - 7.10 [Mobile Exam UI — Topbar](#710-mobile-exam-ui--topbar)
   - 7.11 [Mobile Exam UI — Question Map Drawer](#711-mobile-exam-ui--question-map-drawer)
   - 7.12 [Mobile Exam UI — Question Panel](#712-mobile-exam-ui--question-panel)
   - 7.13 [Mobile Exam UI — Continuous Scroll Mode](#713-mobile-exam-ui--continuous-scroll-mode)
   - 7.14 [Mobile Exam UI — Result Screen](#714-mobile-exam-ui--result-screen)
8. [Motion & Interaction](#8-motion--interaction)
9. [Accessibility](#9-accessibility)
10. [Writing Style](#10-writing-style)
11. [Token Reference](#11-token-reference)

---

## 1. Overview & Philosophy

Exama is an online examination and LMS (Learning Management System) platform built for teachers and students. The design system exists to ensure every interaction is **clear, calm, and trustworthy** — allowing users to focus entirely on the task at hand rather than the interface itself.

### The Dark Slate Metaphor

The dark mode edition of Exama replaces the "clean sheet of paper" metaphor with the **academic chalkboard** — dark surfaces, luminous type, sharp contrast, evoking a serious learning environment under low-light conditions. The translation principles are:

- **Warm dark backgrounds** rather than cold grey or pure black — preserving the color temperature of the original system.
- **Off-white text with warmth** rather than pure white — preventing eye strain against dark surfaces.
- **Lighter accent values** to ensure sufficient contrast and recognizability on dark backgrounds.
- **No glassmorphism**, no heavy gradients, no translucency — the interface is opaque and legible, like chalk on a board.
- **Elevation expressed through surface lightness** rather than shadows — surfaces higher in the z-stack are slightly lighter.

### Single Mode

Exama Dark Mode is **dark mode only**. This is a deliberate decision. This edition serves examination contexts in low-light environments (dim rooms, evening sessions, late-night study) or personal preference for reduced screen brightness. Maintaining a single visual mode ensures absolute color consistency, reduces implementation complexity, and keeps the "chalkboard" metaphor intact throughout.

---

## 2. Design Principles

### 1. Clarity over Cleverness
Every element must communicate its purpose immediately. Labels are explicit. States are unambiguous. We never sacrifice readability for aesthetics — especially critical on dark surfaces where contrast is easily traded away for visual style.

### 2. Calm by Default
The interface is not trying to impress. It is a tool. Neutral tones, modest shadow depths, and restrained motion prevent the UI from competing for the user's attention during high-stakes moments like active exams.

### 3. Structured Hierarchy
Information is layered clearly: page background → card surface → interactive element → focused/active state. In dark mode, hierarchy is expressed through **surface lightness** rather than drop shadows — surfaces higher in the z-stack use a slightly lighter `slate` token.

### 4. Educational Context Respect
Typography leans on serif faces for headings to communicate academic seriousness. Content density is appropriate — not too sparse (patronizing) and not too dense (overwhelming). We treat users as intelligent adults.

### 5. Reliability over Delight
This system favors **predictability** over surprise. Hover states are subtle. Transitions are quick. Feedback is immediate and unambiguous. Trust is built through consistency, not animation.

---

## 3. Foundations

### 3.1 Color

The palette is organized into four groups: **Slate** (dark surfaces), **Glow** (light foregrounds), **Accent**, and **Semantic**.

#### Slate — Surface Colors

Used for page backgrounds, card surfaces, dividers, and input backgrounds. A slight warm tone (brown-black) is maintained throughout to avoid the cold feeling of pure grey.

| Token | Hex | Usage |
|---|---|---|
| `slate-900` | `#16140f` | Page background (body) — darkest |
| `slate-800` | `#1e1c16` | Sidebar background, primary card surface |
| `slate-700` | `#272419` | Secondary card surface, hover states, input background |
| `slate-600` | `#312e22` | Prominent borders, elevated panel background |
| `slate-500` | `#3d392c` | Dividers, active borders, active nav background |

The warm undertone (brown-black) in all slate values is intentional — it preserves the color temperature of the original light mode system rather than shifting to cold grey. Pure `#000000` is never used.

#### Glow — Text & Foreground Colors

Used for all typographic content and iconography. The name "Glow" reflects the nature of light text on a dark surface.

| Token | Hex | Usage |
|---|---|---|
| `glow-100` | `#2e2b22` | Very subtle — decorative details, text shadows |
| `glow-200` | `#4a4638` | Disabled text, placeholder text |
| `glow-300` | `#6b6555` | Secondary labels, helper text, captions |
| `glow-400` | `#9e9784` | Secondary body text, resting nav items |
| `glow-500` | `#cec7b5` | Primary body text |
| `glow-600` | `#e2ddd1` | Headings, strong content |
| `glow-700` | `#f2ede4` | Maximum contrast — display headings only |

Pure white (`#fff`) is never used. The lightest tone `glow-700` retains warmth.

#### Accent — Interactive Blue

The single interactive color in the system. Values are lighter than the light mode counterpart to ensure sufficient contrast on dark backgrounds. The scale is inverted: lower numbers are darker (used for backgrounds), higher numbers are lighter (used for text and icons on dark surfaces).

| Token | Hex | Usage |
|---|---|---|
| `accent-900` | `#0d2035` | Answered question bubble background |
| `accent-800` | `#112b47` | Border on info alerts and selected tags |
| `accent-700` | `#1a4268` | Hover border on interactive cards |
| `accent-600` | `#2d6899` | Pressed state, darkest interactive accent |
| `accent-500` | `#4e84b4` | Primary button background, active state |
| `accent-400` | `#7aa3c8` | Outline button text, secondary accent, links |
| `accent-300` | `#adc5df` | Subtle accent tints, icon fills |

The blue reads as authoritative and calm rather than playful or urgent, consistent with the light mode system.

#### Semantic — Status Colors

Four semantic colors, each with a dark background tint, a mid border tint, and a bright base value suitable for text and icons on dark surfaces.

| Role | Base (text/icon) | Background | Border | Usage |
|---|---|---|---|---|
| **Success** | `#6ec46e` | `#0d200d` | `#1a4a1a` | Correct answers, submitted exams, passing scores |
| **Warning** | `#e8b84b` | `#221800` | `#4a3200` | Expiring timers, flagged questions, draft status |
| **Danger** | `#e07272` | `#220d0d` | `#4a1a1a` | Wrong answers, violations, failed submissions |
| **Info** | `#7aa3c8` | `#0d1e2d` | `#112b47` | Informational callouts (shares accent palette) |

Each semantic color is used at three tonal levels:
- **Background tint** — alert/callout background (very dark, low saturation)
- **Border tint** — alert border or tag border (mid value)
- **Base** — icon, text, or progress fill (brightest, sufficient contrast on dark backgrounds)

Semantic colors are **never used for decorative purposes**, only to communicate status.

#### Color Contrast & Accessibility

- All body text (`glow-500` on `slate-900`) achieves a minimum contrast ratio of **8.2:1** (WCAG AAA).
- Primary button (`glow-700` on `accent-500`) achieves **4.8:1** (WCAG AA).
- Semantic badge text (semantic base on semantic background) achieves minimum **5.0:1**.

---

### 3.2 Typography

The type system uses two typefaces: one serif for authority and hierarchy, one sans-serif for readability at small sizes. **Typography is identical to the light mode system** — only color values change between modes.

#### Typefaces

| Face | Family | Role |
|---|---|---|
| **Display & Headings** | Noto Serif | Serif — academic, authoritative, traditional |
| **Body & UI** | DM Sans | Sans-serif — geometric, neutral, functional |

**Noto Serif** was chosen over modern serifs (Playfair, Georgia) because it maintains legibility at smaller heading sizes while still projecting academic credibility. Its letterforms render cleanly on screen and provide full Vietnamese language support.

**DM Sans** was chosen for its generous x-height, open counters, and near-invisible personality — ideal for long-form reading during exams and for UI labels that should fade into the background.

#### Type Scale

| Name | Font | Size | Weight | Line Height | Usage |
|---|---|---|---|---|---|
| Display | Noto Serif | 48px / 3rem | 700 | 1.15 | Hero titles, landing |
| H1 | Noto Serif | 30px / 1.875rem | 700 | 1.25 | Page titles |
| H2 | Noto Serif | 24px / 1.5rem | 700 | 1.3 | Section headings |
| H3 | Noto Serif | 20px / 1.25rem | 700 | 1.4 | Card/panel headings |
| H4 | DM Sans | 16px / 1rem | 600 | 1.4 | Subheadings, group labels |
| Body Large | DM Sans | 16px / 1rem | 400 | 1.6 | Primary body content |
| Body | DM Sans | 14px / 0.875rem | 400 | 1.6 | Default body, descriptions |
| Body Small | DM Sans | 13px / 0.8125rem | 400 | 1.5 | Helper text, captions |
| Label | DM Sans | 11px / 0.6875rem | 600 | 1 | UI labels, all-caps only |
| Mono | System Mono | 14px / 0.875rem | 400 | 1 | Timer display, codes |

#### Label Convention

Labels (table headers, section identifiers, metadata) use **DM Sans 11px, font-weight 600, letter-spacing 0.07em, uppercase**. This creates visual separation from content without requiring a different color or size.

#### Question Text

Exam question body text uses **Noto Serif at 18px, glow-700, line-height 1.7**. The serif face signals "this is content to be read carefully." The generous line height reduces eye-tracking errors on dense mathematical or scientific questions.

---

### 3.3 Spacing

The spacing scale is based on a **4px base unit**. All component padding, margin, and gap values are multiples of 4. **Identical to the light mode system.**

| Token | Value | Common Usage |
|---|---|---|
| `space-1` | 4px | Icon-to-label gap, tight inline spacing |
| `space-2` | 8px | Input padding vertical, compact component gaps |
| `space-3` | 12px | Badge padding, small component internal padding |
| `space-4` | 16px | Card padding (compact), section gutters |
| `space-5` | 20px | Default component padding |
| `space-6` | 24px | Card padding (standard), section spacing |
| `space-8` | 32px | Large section separation |
| `space-10` | 40px | Page-level vertical rhythm |
| `space-12` | 48px | Major section breaks |
| `space-16` | 64px | Page top/bottom padding |

**Grid:** The main content grid uses a 12-column system with a `24px` gutter and `24px` column padding. The max content width is `1280px` (`max-w-7xl`).

---

### 3.4 Border Radius

Border radius values are identical to the light mode system — they do not change between modes.

| Token | Value | Usage |
|---|---|---|
| `radius-sm` | 4px | Badges, tags, small chips, table header cells |
| `radius-base` | 6px | Inputs, selects, buttons, answer options |
| `radius-md` | 8px | Cards, panels, modals |
| `radius-lg` | 12px | Large cards, dialogs |
| `radius-xl` | 16px | Feature panels, illustration frames |
| `radius-full` | 9999px | Avatars, pill buttons, circular icon buttons |

`radius-base` (6px) is the most commonly used value. It provides just enough softness to feel approachable without looking like a consumer app.

---

### 3.5 Shadows & Elevation

On dark mode, drop shadows are nearly invisible because the background is already dark. **Elevation is expressed primarily through surface lightness** — surfaces higher in the z-stack use a lighter `slate` token. Subtle shadows supplement this where additional separation is needed.

| Token | CSS Value | Surface Token | Usage |
|---|---|---|---|
| `shadow-flat` | none + `border: 1px solid slate-600` | `slate-800` | Table rows, inactive elements |
| `shadow-dark` | `0 1px 3px rgba(0,0,0,0.30)` | `slate-800` | Default card elevation |
| `shadow-dark-md` | `0 3px 8px rgba(0,0,0,0.40)` | `slate-700` | Hover card state, dropdowns |
| `shadow-dark-lg` | `0 8px 20px rgba(0,0,0,0.50)` | `slate-600` | Modals, floating panels |
| `shadow-inset` | `inset 0 1px 3px rgba(0,0,0,0.30)` | — | Input fields, inset elements |

**Elevation Rule:** Each z-stack layer uses a one-step lighter slate token. Example: page background uses `slate-900`, cards use `slate-800`, modals use `slate-700`. A border (`slate-600`) is still required to define element shape — never use shadow alone.

---

### 3.6 Iconography

Icons are sourced from **Heroicons (outline)**, 24px viewBox, rendered at 16px or 20px depending on context. Line weight is `stroke-width: 1.5` for UI icons and `stroke-width: 2` for status icons (which need to be read quickly at small sizes).

**Color rules (dark mode):**
- Navigation icons: `glow-400` (resting), `accent-400` (active)
- Action icons within buttons: inherit from button text color
- Status icons: use the corresponding semantic base color (`#6ec46e`, `#e07272`, etc.)
- Decorative/empty-state icons: `glow-300` or `glow-400`

Icons are **never used alone** without an accessible label (either visible text or an ARIA label).

---

## 4. Components

### 4.1 Buttons

Buttons are the primary action trigger. The system defines six variants, four sizes, and four interaction states.

#### Variants

| Variant | Background | Text | Border | Usage |
|---|---|---|---|---|
| **Primary** | `accent-500` | `glow-700` | None | Main CTA — submit exam, create exam, save |
| **Secondary** | `slate-700` | `glow-500` | `slate-500` | Supporting actions — cancel, back, export |
| **Outline** | Transparent | `accent-400` | `accent-500` | Alternate primary action in a secondary position |
| **Ghost** | Transparent | `glow-500` | None | Low-priority actions in content areas |
| **Success** | `#0d200d` | `#6ec46e` | `#1a4a1a` | Confirming correct state, approve |
| **Danger** | `#220d0d` | `#e07272` | `#4a1a1a` | Destructive actions — delete, disqualify |

#### Sizes

| Size | Padding | Font size | Usage |
|---|---|---|---|
| `xs` | `10px 10px` | 12px | Inline within table cells, tight contexts |
| `sm` | `6px 12px` | 12px | Sidebar actions, secondary toolbar |
| `md` (default) | `9px 16px` | 14px | Default for all standalone buttons |
| `lg` | `10px 20px` | 16px | Primary CTA on landing/hero sections |

#### States

- **Resting:** Defined by variant above.
- **Hover:** Background lightens by one token step (e.g., `accent-500` → `accent-400`). No scale transform.
- **Active/Pressed:** Background lightens by two steps. `box-shadow: inset 0 1px 2px rgba(0,0,0,0.20)`.
- **Disabled:** `opacity: 0.4`, `cursor: not-allowed`. No color change.
- **Loading:** Spinner icon (16px, `animate-spin`) prepended, button text retained, button disabled. Spinner inherits button text color.

#### Icon Buttons

Square icon-only buttons use equal padding to form a perfect square (`w-8 h-8` / `w-9 h-9`). They must always carry a `title` attribute and ARIA label. They follow the same variant system as text buttons.

#### Button Groups

When two or more buttons share a context (e.g., modal footer, question navigation), they are placed in a `flex` row with a `gap-3` (12px) separation. The primary action is always on the **right**. Destructive actions are always on the **left** or separated with additional space.

---

### 4.2 Form Controls

#### Text Input

```
border: 1px solid slate-500
border-radius: 6px
padding: 9px 13px
font: DM Sans 14px, glow-500
background: slate-700
```

**Focus state:** `border-color: accent-400`, `box-shadow: 0 0 0 3px rgba(78,132,180,0.20)`
**Error state:** `border-color: #e07272`, `box-shadow: 0 0 0 3px rgba(224,114,114,0.18)`
**Success state:** `border-color: #6ec46e`, optional checkmark icon on the right
**Disabled state:** `background: slate-800`, `color: glow-300`, `cursor: not-allowed`

Error messages appear **below the input** in `#e07272`, 12px, DM Sans. Never inside the input or as a tooltip.

#### Textarea

Identical to text input. `resize: vertical` is permitted but `resize: horizontal` is disabled. Minimum height: 3 rows (~72px).

#### Select

Identical border/radius/padding to text input. The native `<select>` arrow is preserved but can be replaced with a custom SVG chevron in custom implementations. `cursor: pointer` is required.

#### Checkbox

Custom checkboxes are 16×16px with a 3px rounded border (`radius-sm`). The checked state uses `accent-500` fill with a `glow-700` SVG checkmark. The indeterminate state uses a horizontal bar in `accent-400`.

```
Unchecked:  border: 1.5px solid glow-300, background: slate-700
Checked:    border: none, background: accent-500, checkmark: glow-700
Disabled:   background: slate-800, border: slate-500
```

#### Radio Button

Custom radio buttons are 16×16px circles. The selected state shows an 8px inner dot in `accent-500`.

```
Unselected:  border: 1.5px solid glow-300, background: slate-700
Selected:    border: 1.5px solid accent-500, inner dot: accent-500
Disabled:    background: slate-800, border: slate-500
```

#### Search Input

A standard text input with a `search` icon (`glow-400`, 16px) absolutely positioned at `left: 12px`. Input padding-left increases to 36px to avoid text overlap.

#### Form Label

Labels sit **above** their control, never inside (placeholder is not a label). Typography: DM Sans 14px, `font-weight: 500`, `glow-500`. Required fields append a `*` in `#e07272`.

Section labels (grouping related inputs) use the Label convention: DM Sans 11px, 600 weight, uppercase, `letter-spacing: 0.07em`, `glow-300`.

---

### 4.3 Badges & Tags

#### Status Badges

Used exclusively for **machine states** — exam status, submission status, score category. They are non-interactive.

```
font: DM Sans 11px, font-weight: 600, uppercase, letter-spacing: 0.06em
padding: 2px 8px
border-radius: 4px
border: 1px solid (semantic border tint)
```

| Status | Background | Text | Border |
|---|---|---|---|
| Active / Open | `#0d200d` | `#6ec46e` | `#1a4a1a` |
| Upcoming | `#221800` | `#e8b84b` | `#4a3200` |
| Ended / Closed | `#220d0d` | `#e07272` | `#4a1a1a` |
| Draft | `slate-700` | `glow-400` | `slate-500` |
| Grading | `accent-900` | `accent-400` | `accent-800` |

A colored dot prefix (`●`) may precede the label for "live" states (Active, Grading) to further distinguish them.

#### Score Badges

Used to display numerical scores at a glance. Same visual spec as status badges but font size is 12px and no uppercase.

| Score Range | Background | Text |
|---|---|---|
| ≥ 8.0 | `#0d200d` | `#6ec46e` |
| 5.0 – 7.9 | `#221800` | `#e8b84b` |
| < 5.0 | `#220d0d` | `#e07272` |

#### Subject/Category Tags

Interactive or filterable tags used to classify content. They support an optional remove icon (`×`).

```
font: DM Sans 12px, font-weight: 500
padding: 3px 9px
border-radius: 4px
border: 1px solid (matching dark tint)
```

Tags use color to distinguish subject categories (blue for math, green for science, etc.) but any category-to-color mapping must use dark-mode-appropriate tints and be applied consistently across the product.

---

### 4.4 Cards

Cards are the primary content containers. All cards share:

```
background: slate-800
border: 1px solid slate-600
border-radius: 8px
box-shadow: shadow-dark
```

#### Card Variants

**Default Card** — Standard container for data, forms, and content groupings.

**Hoverable Card** (`card-hover`) — Used when the card is clickable (e.g., exam list items). On hover: `border-color: accent-600`, `background: slate-700`, `box-shadow: shadow-dark-md`. No transform or scale effect.

**Stat Card** — Displays a single KPI metric. Structure: label (Label style, `glow-300`) → large number (Noto Serif, 36px, `glow-700`) → supporting text (12px, `glow-300`). May include a small progress bar below.

**Accent Border Card** — A left `3px solid accent-500` border is added for informational or highlighted content (e.g., a "Note" card). This replaces the default 1px border on the left side.

**Semantic Border Card** — Same as above but using `#6ec46e`, `#e8b84b`, or `#e07272` for the left border to communicate status context.

#### Card Anatomy

```
[Card]
  ├── [Header] (optional) — title, subtitle, action button
  ├── [Divider] — 1px, slate-600
  ├── [Body] — primary content
  └── [Footer] (optional) — metadata, action row
```

Internal card padding is `p-5` (20px) for compact cards or `p-6` (24px) for standard cards.

---

### 4.5 Alerts & Callouts

Alerts communicate system-level feedback. They are full-width within their container and not dismissible by default (dismissible variants must be explicitly implemented).

#### Structure

```
[Icon 16px] + [Message text 14px] + [optional action link]
padding: 16px
border-radius: 6px
border: 1px solid (semantic border tint)
background: (semantic background tint — very dark)
```

#### Variants

| Variant | Background | Border | Icon color | Text color |
|---|---|---|---|---|
| Info | `#0d1e2d` | `accent-800` | `accent-400` | `accent-300` |
| Success | `#0d200d` | `#1a4a1a` | `#6ec46e` | `#8ed98e` |
| Warning | `#221800` | `#4a3200` | `#e8b84b` | `#f0cc72` |
| Danger | `#220d0d` | `#4a1a1a` | `#e07272` | `#ea9090` |

Alert messages use complete sentences with a period. They describe the **situation** followed by **what the user should do**, when applicable.

> ✅ "Your exam has been submitted successfully at 09:42."
> ✅ "5 minutes remaining. Review any unanswered questions."
> ❌ "Submitted" (too terse)
> ❌ "ERROR: submission failed!!!" (alarming tone)

---

### 4.6 Progress Indicators

#### Linear Progress Bar

Used to display completion of an exam, number of students who have submitted, or score percentage.

```
Track:  background: slate-600, border-radius: 99px, height: 6px or 8px
Fill:   border-radius: 99px, height: 100%
```

Fill colors: `accent-500` (default / neutral progress), `#6ec46e` (positive metric), `#e8b84b` (caution metric).

Progress bars are always accompanied by a label row above showing the current value and total (e.g., "18 / 25 answered").

#### Circular / Spinner

Used only in button loading states and async data loading. 16px, `stroke-width: 3`, `stroke-dasharray: 30 60`, with a rotation animation at 1s linear infinite. Color inherits from context.

**The system does not use skeleton loaders.** Loading states are handled with a spinner in the triggering button or a minimal "Loading…" text within the content area.

---

### 4.7 Tooltips

Tooltips provide supplemental context on hover. They are non-critical — content that is essential must be visible by default.

```
background: slate-600
color: glow-600
font: DM Sans 12px
padding: 4px 10px
border-radius: 4px
border: 1px solid slate-500
arrow: 5px triangle pointing down
position: above the trigger (bottom: calc(100% + 6px))
delay: 200ms appear, instant disappear
```

Tooltips appear on `?` help icons, truncated text, and icon-only buttons. They do not contain interactive elements (links, buttons). Maximum width: 240px with text wrapping.

---

### 4.8 Modals & Dialogs

Modals interrupt the current flow to request a decision or display focused content.

**Overlay:** `background: rgba(0, 0, 0, 0.60)` — darker than the light mode equivalent to create sufficient contrast against the dark page background.

**Dialog card:**
```
background: slate-800
border: 1px solid slate-600
border-radius: 8px
box-shadow: shadow-dark-lg
max-width: 480px (confirmation), 640px (form), 800px (content)
padding: 24px
```

**Modal anatomy:**
```
[Header row]
  ├── Title (H3, Noto Serif, glow-700)
  └── Close button (top-right, Ghost icon button)
[Divider] — slate-600 (optional)
[Body] — description, form, or content
[Footer row] — right-aligned, Secondary + Primary button
```

**Usage rules:**
- Maximum one modal open at a time. No nested modals.
- All modals must have an `aria-modal="true"` and focus-trap behavior.
- Close on: ✕ button, Escape key, overlay click (unless the action is destructive — then overlay click is disabled).
- Destructive confirmation modals (delete, end exam) must require explicit button click. They cannot be dismissed by clicking the overlay.

---

### 4.9 Tables

Tables display structured data sets — student lists, exam results, question banks.

#### Header Row

```
background: slate-700
font: DM Sans 11px, weight 600, uppercase, letter-spacing: 0.07em
color: glow-400
padding: 10px 14px
border-bottom: 1px solid slate-600
```

#### Data Row

```
font: DM Sans 14px, glow-500
padding: 12px 14px
border-bottom: 1px solid slate-700
vertical-align: middle
```

Row hover state: `background: slate-700`. This is subtle — just enough to show the row boundary without being distracting.

Last row has no bottom border (visual closure).

#### Column Types

- **Identity column** (student name): Avatar (28px circle, initials, accent tint) + name in `glow-600 font-medium`.
- **Date/Time column:** `glow-400`, monospace if precision is needed.
- **Score column:** Colored by semantic thresholds — `#6ec46e` (≥ 8.0), `#e8b84b` (5.0–7.9), `#e07272` (< 5.0).
- **Status column:** Status badge.
- **Action column:** Text links in `accent-400`, right-aligned, 14px. Never icon-only in tables (accessibility).

#### Empty Table

When no data exists, the table body is replaced with an empty state component centered in a row that spans all columns.

#### Sortable Columns

Sortable headers append a small chevron icon (16px). Active sort column: `glow-600` text, filled chevron. Inactive columns: `glow-400` text, muted chevron.

---

### 4.10 Navigation — Breadcrumb

Breadcrumbs show the current page location within the application hierarchy.

```
font: DM Sans 14px
separator: chevron-right SVG, 14px, glow-400
ancestor links: accent-400, no underline by default, underline on hover
current page: glow-500, not a link
```

Maximum depth: 4 levels. If deeper navigation exists, intermediate levels are truncated with `…`.

---

### 4.11 Navigation — Pagination

```
button size: 32px × 32px
border-radius: 6px
font: DM Sans 14px

Resting:       background transparent, glow-400
Active:        background accent-500, text glow-700
Hover:         background slate-700
Previous/Next: background slate-700, border slate-500
Ellipsis:      glow-300, not interactive
```

Always show: Previous, first page, current neighborhood (±1), last page, Next. Ellipsis fills gaps.

---

### 4.12 Navigation — Tabs

Tabs switch between parallel views of the same content context (not between pages).

```
Tab strip: border-bottom: 1px solid slate-600 (full width)
Tab item:  padding 12px 20px, DM Sans 14px

Resting:  glow-400, border-bottom: 2px solid transparent
Active:   accent-400, font-weight 600, border-bottom: 2px solid accent-500
Hover:    glow-600
Disabled: glow-200, cursor not-allowed
```

Tab content area has `padding-top: 20px`. Maximum recommended tabs: 6. Beyond 6, use a Select dropdown instead.

---

### 4.13 Empty States

Empty states are shown when a data container has no items to display — new accounts, filtered results with no matches, or cleared data.

#### Anatomy

```
[Icon container] — 48×48px, border-radius: 8px, slate-700 or semantic background tint
    └── [Icon] — 24px, glow-300 or semantic base color
[Heading] — Noto Serif, 18px, glow-600
[Description] — DM Sans 14px, glow-400, max-width 280px, centered
[CTA Button] (optional) — Primary or Outline variant
```

Center-aligned within the container. Minimum container height for an empty state to breathe: 200px.

**Empty state copy should be:**
- Friendly, not apologetic ("No exams yet" not "No data found")
- Action-oriented when a user action resolves the state
- Specific to the context ("No exams yet" not just "Empty")

---

## 5. Patterns

### 5.1 Sidebar Layout

The primary application shell for the teacher dashboard.

```
[Shell]
  ├── [Sidebar]   width: 208px, fixed, height: 100vh, background: slate-800
  │     ├── [Branding area] — logo + product name, border-bottom: slate-600
  │     ├── [Navigation items]
  │     │     ├── Nav item — 40px height, 12px 16px padding, gap-2.5
  │     │     └── Active item — nav-active style (see below)
  │     └── [User profile row] — bottom, border-top: slate-600
  └── [Main content area] — flex-1, overflow-y-auto, padding: 20px–24px, background: slate-900
```

**Active nav item style:**
```
background: slate-700
border-left: 3px solid accent-500
color: accent-400
font-weight: 600
```
The 3px left border is the primary active indicator. It replaces the left padding, so the icon/text alignment remains consistent.

**Nav item structure:** `[Icon 16px] [Label 14px]` — icon is always present to aid scanning and quick recognition.

**User profile row:** Avatar (28px) + name (12px, `glow-600`, truncated) + email (11px, `glow-300`, truncated). An overflow menu (⋮) gives access to logout and settings.

---

### 5.2 Dashboard Header

Each page within the teacher dashboard has a consistent header row at the top of the main content area.

```
[Page Header]
  ├── [Left]
  │     ├── Breadcrumb (if depth > 1)
  │     ├── Page title (H1, Noto Serif, glow-700)
  │     └── Subtitle / context (14px, glow-400)
  └── [Right]
        └── Primary action button (e.g., "+ New Exam")
```

The page title uses H1 sizing (`30px`), but visually aligns with the card content below using consistent left padding. No decorative lines or underlines beneath the title.

---

### 5.3 Data Filters

Placed directly above a table or card list.

```
[Filter bar]
  ├── [Search input] — flex-1, max-width 320px
  ├── [Select dropdowns] — for category/status/class filters
  └── [Right-aligned] — Sort control, Export button (Ghost)
```

Active filters appear as **removable tags** below the filter bar, using the Tag component with a `×` icon.

---

## 6. Exam UI

The exam interface is a distinct visual context from the teacher dashboard. It is designed to maximize focus for the student and minimize cognitive load during high-stakes assessment.

### Desktop Layout Overview

Exama supports two **display modes** for rendering exam questions. The mode is set by the teacher when creating the exam and cannot be changed by students mid-session.

| Mode | Default | Description |
|---|---|---|
| **Paged** | No | One question at a time. Navigation via ← Previous / Next → buttons. |
| **Continuous Scroll** | **Yes** | All questions rendered in a single scrollable column. Navigation via scrolling or Question Map jump-links. |

Continuous Scroll is the default because it more closely resembles a physical exam paper — students can scroll freely, review earlier answers in context, and have a full sense of the exam's scope at a glance. Paged mode is available for exams where question isolation is pedagogically required.

On desktop (≥ 1024px), both modes share the same three-region shell:

```
┌─────────────────────────────────────────────────────────────┐
│                      EXAM TOPBAR (56px)                     │
├──────────────────┬──────────────────────────────────────────┤
│  QUESTION MAP    │                                          │
│  (left panel)    │         QUESTION PANEL                   │
│  width: 220px    │         (main content area)              │
│  fixed height    │         flex-1, scrollable               │
│  scrolls indep.  │                                          │
│                  │  — Paged:  one question + Prev/Next      │
│  [Submit Exam]   │  — Scroll: all questions stacked         │
└──────────────────┴──────────────────────────────────────────┘
```

The Question Map is deliberately placed on the **left** because it serves a navigational role — analogous to a table of contents. Users scan left-to-right; placing the map on the left means it is seen first, giving context before engaging with the question content.

---

### 6.1 Exam Topbar

A persistent bar at the top of the exam screen throughout the session.

```
height: 56px
background: slate-800
border-bottom: 1px solid slate-600
padding: 0 20px
position: sticky, top: 0, z-index: 40
```

**Left side:** Product logo (Noto Serif, `glow-700`) + separator (`slate-600`, 1px vertical) + exam name (DM Sans 14px, `glow-500`).
**Right side:** Timer component + progress indicator ("18 / 25 answered").

The topbar does not contain a Submit button or navigation links. It communicates identity, time, and progress only. The Submit action lives exclusively in the Question Map panel where it requires deliberate spatial navigation to reach.

---

### 6.2 Question Map — Desktop (Left Panel)

The Question Map is a **fixed-width left panel** (220px) that persists alongside the scrollable question area. It serves as both a navigation tool and a visual progress overview.

```
width: 220px
height: calc(100vh - 56px)
position: sticky
top: 56px
border-right: 1px solid slate-600
background: slate-800
padding: 16px
overflow-y: auto
display: flex
flex-direction: column
gap: 16px
```

**Section header:** Label style ("QUESTION MAP"), `glow-300`, `letter-spacing: 0.07em`.

**Question bubbles:** 32×32px squares in a responsive grid using `grid-template-columns: repeat(auto-fill, minmax(32px, 1fr))`, `gap: 6px`. Each bubble is a click target that navigates directly to that question. Never hard-code a column count.

| State | Background | Text color | Border |
|---|---|---|---|
| Unanswered | `slate-700` | `glow-300` | None |
| Answered | `accent-900` | `accent-400` | None |
| Current | `accent-500` | `glow-700` | None |
| Flagged | `#221800` | `#e8b84b` | `1.5px solid #4a3200` |
| Flagged + Answered | `#2a1e00` | `#f0cc72` | `1.5px solid #4a3200` |

A small dot indicator (6px circle, `#e8b84b` fill) appears at the top-right corner of any flagged bubble to remain visible even when the bubble is in Answered state.

**Legend:** A compact legend block below the grid. Four rows, each with a 12×12px swatch and a label (DM Sans 12px, `glow-400`).

**Spacer:** `flex: 1` between the legend and the submit button, pushing the submit button to the very bottom of the panel.

**Submit button:** Full-width, Danger variant, `margin-top: auto`, pinned to the bottom of the panel. Placement here is deliberate — it is spatially separated from answer options, reducing accidental submission. On click, it triggers a confirmation Modal before submitting.

```
[Submit button]
  └── onClick → opens Confirmation Modal
        ├── Title: "Submit Exam"
        ├── Body: "You have X unanswered questions. This cannot be undone."
        └── Actions: [Back to Exam] (Secondary)  [Submit Now] (Danger)
```

---

### 6.3 Question Panel

The main reading and answering area. Takes all remaining horizontal space after the left panel.

```
flex: 1
padding: 28px 32px
overflow-y: auto
height: calc(100vh - 56px)
background: slate-900
max-width: none
```

Internal content (question body + answer options) is constrained to `max-width: 680px` for comfortable line length, but this constraint sits on the content wrapper inside the panel — not on the panel itself.

#### Paged Mode

One question is displayed at a time. The panel renders a single question block and a navigation footer.

**Question header row:**
- Question number badge: 28×28px square, `border-radius: 6px`, `background: accent-500`, `glow-700`, DM Sans 14px bold
- "Question X / Y" in Label style (`glow-400`, uppercase, `letter-spacing: 0.07em`)
- Flag toggle button (Ghost, icon-only): Toggles flagged state. Icon: flag outline → flag filled (`#e8b84b`) when active.

**Question body:** Noto Serif 18px, `glow-700`, `line-height: 1.7`. Maximum content width: `680px`.

**Answer options area:** Directly below the question body, `margin-top: 24px`.

**Navigation footer:** A `border-top: 1px solid slate-600` divider, `margin-top: 32px`, above a `flex justify-between` row:
- Left: "← Previous" (Secondary button) — disabled and visually muted on question 1
- Right: "Next →" (Primary button) — label changes to "Finish" on the last question

#### Continuous Scroll Mode *(default)*

All questions are rendered as a single vertically stacked document. The student scrolls through all questions without any pagination step.

**Question block:**
```
padding: 28px 32px
border-bottom: 1px solid slate-600
max-width: 680px
```

The last question block has no `border-bottom`. There is no outer card border or shadow on individual question blocks — they are delimited only by the divider line, keeping the feel of sections on a continuous page.

**Question block anatomy:**
```
[Question block]
  ├── [Header row]  number badge + "Q X / Y" + flag button
  ├── [Question body]  Noto Serif 18px, glow-700
  ├── [Answer options]  margin-top: 24px
  └── [Block footer]  border-top slate-600, padding-top: 20px
                       "Mark for review" ghost button (left)
```

**Scroll-linked Question Map:** In continuous scroll mode, the Question Map tracks the currently visible question as the user scrolls via `IntersectionObserver` with a root margin of `-40% 0px -40% 0px`.

**Anchor navigation:** Clicking a Question Map bubble smooth-scrolls the panel to that question's block using `element.scrollIntoView({ behavior: 'smooth', block: 'start' })` with a `scroll-padding-top` offset for the topbar.

```css
.question-panel {
  scroll-padding-top: 56px;
}
```

**No navigation footer** in continuous scroll mode. The only "end of exam" affordance is the Submit Exam button in the Question Map panel.

---

### 6.4 Answer Options

#### Multiple Choice (Single Answer)

Each option is a full-width clickable row with a custom radio button, letter label, and answer text.

```
border: 1.5px solid slate-500
border-radius: 6px
padding: 12px 16px
background: slate-800
cursor: pointer
gap: 12px
```

| State | Border | Background | Radio |
|---|---|---|---|
| Default | `slate-500` | `slate-800` | Unchecked |
| Hover | `accent-600` | `slate-700` | Unchecked |
| Selected | `accent-500` | `accent-900` | Checked (accent dot) |
| Correct (review) | `#1a4a1a` | `#0d200d` | Checked (green dot) |
| Wrong (review) | `#4a1a1a` | `#220d0d` | Checked (red dot), text struck through |
| Unselected correct (review) | `#1a4a1a` | `#0d200d` | Unchecked |

In review mode, incorrect options that were not selected appear at reduced opacity (`0.5`) to de-emphasize them.

#### Multiple Choice (Multiple Answers)

Same layout as single-answer but uses the custom Checkbox component instead of Radio. Instructions explicitly state "Select all that apply." in DM Sans 13px, `glow-400`, italic, directly above the options list.

#### Short Answer / Essay

A full-width Textarea with a character/word count indicator (DM Sans 12px, `glow-400`) positioned below-right. No border changes on answered state — text presence implies an answer.

---

### 6.5 Timer

The timer component is displayed in the Exam Topbar and reflects remaining time.

**Default state (> 5 minutes):**
```
background: slate-700
border: 1px solid slate-500
padding: 6px 12px
border-radius: 6px
icon: clock, glow-400
font: system monospace, 14px, font-weight 700, glow-600
```

**Warning state (≤ 5 minutes):**
```
background: #221800
border: #4a3200
icon: clock, #e8b84b
font: #f0cc72
```

**Critical state (≤ 1 minute):**
```
background: #220d0d
border: #4a1a1a
icon: clock, #e07272
font: #ea9090
```

The timer switches states at exactly 5:00 and 1:00. There is no animation on the state change — the color shift is the communication. The timer format is `MM:SS`. Hours are shown (`HH:MM:SS`) only for exams longer than 60 minutes.

---

### 6.6 Result Screen

Shown after an exam is submitted or after the timer expires. It is a focused, centered page.

**Score circle:** 80×80px circle. Border: `4px solid` in semantic base color (success, warning, or danger based on score threshold). Inside: the score as `font-serif text-3xl font-bold` in the matching semantic text color. Circle background uses the semantic background tint.

**Score thresholds:**
- ≥ 8.0 → Success (green)
- 5.0–7.9 → Warning (amber)
- < 5.0 → Danger (red)

**Stat row:** Three equal-width cells — Correct, Incorrect, Skipped. Each shows a large number (Noto Serif 28px, `glow-700`) with a label (12px, `glow-300`).

**Progress bar:** Full-width, shows score percentage with semantic fill color.

**Actions:** Two buttons — "Review Answers" (Secondary) and "Back to Dashboard" (Primary).

---

### 6.7 Review Mode

After submission, students (and teachers) can review the exam with correct/incorrect states revealed.

**Correct answer (student chose correctly):**
- Green border + dark green background on the option (`border: #1a4a1a`, `background: #0d200d`)
- Checkmark icon on the right (`#6ec46e`)
- Answer text: `#6ec46e`, font-weight: 500

**Wrong answer (student chose incorrectly):**
- Red border + dark red background on the option (`border: #4a1a1a`, `background: #220d0d`)
- X icon on the right (`#e07272`)
- Answer text: `#e07272`, `text-decoration: line-through`

**Correct answer (student did not choose it):**
- Green border + dark green background
- No icon (to distinguish from student-selected-correct)

**Explanation callout:** Below the answer options, an `Info` callout displays the explanation. Label: "Explanation" in `glow-500 font-semibold`. Body: DM Sans 14px, `glow-400`.

---

### 6.8 Display Mode: Paged vs Continuous Scroll

This section consolidates all behavioral differences between the two display modes for reference during implementation.

#### Mode Selection

The teacher selects the display mode in the exam creation settings. The default is **Continuous Scroll**.

```
[Exam Settings — Display Mode]
  ● Continuous Scroll (default)
    "All questions on one page. Students scroll freely."
  ○ Paged
    "One question per screen. Students navigate with Prev / Next."
```

The mode is stored on the exam object and is read-only for students during the session.

#### Behavioral Comparison

| Behavior | Paged | Continuous Scroll |
|---|---|---|
| Questions rendered | One at a time | All at once |
| Navigation | ← Prev / Next → buttons | Scroll + Question Map anchor jump |
| Question Map "Current" tracking | Set explicitly by navigation | Set by scroll position (IntersectionObserver) |
| Navigation footer | Present | Absent |
| Student can see future questions | No (unless navigating forward) | Yes |
| Scroll position on Map jump | Page replaces current question | Smooth scroll to anchor |
| Answer auto-save trigger | On any option click | On any option click (identical) |
| Progress bar update | On navigation to answered question | Immediately on option click |
| "Finish" / summary step before submit | Yes (after last Next →) | No — submit directly from Map panel |
| Back-button browser behavior | Returns to previous question | Exits exam (warn user) |
| Keyboard shortcut: Enter / Space | Selects focused option | Selects focused option (identical) |
| Keyboard shortcut: → / ↓ | Next question (Paged only) | Scroll down (browser default) |

#### Question Divider in Continuous Scroll

Each question block is separated by a `border-bottom: 1px solid slate-600` rule. A subtle question number label floats in the left margin of each block using `position: relative` + a `::before` pseudo-element, styled as Label (`glow-300`, 11px, uppercase).

```css
.question-block::before {
  content: 'Q' attr(data-question-number);
  position: absolute;
  left: -48px;
  top: 28px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--color-glow-300);
}
```

This requires the question panel to have `position: relative` and `padding-left: 72px` when margin notes are enabled (desktop only, never on mobile).

#### Summary Screen (Paged Mode Only)

In Paged mode, clicking "Finish" on the last question navigates to a summary screen before submission:

```
[Summary screen]
  ├── Title: "Review Before Submitting"
  ├── Subtitle: "X of Y questions answered."
  ├── [Summary table]
  │     Columns: Q# | Status | Jump
  │     Rows: one per question
  │       Status: "Answered" (success), "Unanswered" (glow-400), "Flagged" (warning)
  │       Jump: text link → returns to that question in paged view
  └── [Footer]
        [Back to Exam] (Secondary)    [Submit Exam] (Danger)
```

In Continuous Scroll mode, no summary screen exists. The Submit confirmation modal (see §6.2) still lists the number of unanswered questions before final submission.

---

## 7. Mobile Design System

Mobile is a first-class context in Exama. Students frequently access exams on phones, especially in classroom settings where laptops are unavailable. Teachers use mobile to monitor live exam sessions and check results on the go. Every component and pattern defined in the desktop system has a corresponding mobile behavior specified here.

### 7.1 Breakpoints & Responsive Strategy

Exama uses four breakpoints derived from common device categories:

| Breakpoint | Range | Context |
|---|---|---|
| `xs` | 0 – 479px | Small phones (iPhone SE, older Android) |
| `sm` | 480 – 767px | Large phones, narrow phablets |
| `md` | 768 – 1023px | Tablets, large phablets (portrait) |
| `lg` | 1024 – 1279px | Tablets (landscape), small laptops |
| `xl` | 1280px+ | Desktop, full layout |

**Mobile** refers to `xs` and `sm`. **Tablet** refers to `md`. **Desktop** refers to `lg` and `xl`.

#### Strategy: Mobile-First

All base styles target mobile. Desktop styles are added via `min-width` media queries. This ensures the base bundle is never loaded with unused desktop-only CSS on mobile.

#### Layout Shifts by Breakpoint

| Feature | Mobile (xs/sm) | Tablet (md) | Desktop (lg+) |
|---|---|---|---|
| Sidebar | Hidden → Bottom tab bar | Collapsible icon-rail (48px) | Fixed sidebar (220px) |
| Exam Question Map | Expandable top drawer | Collapsible left panel (180px) | Fixed left panel (220px) |
| Exam layout | Single column, full-width | Two column (map 180px + content) | Two column (map 220px + content) |
| Cards | Full-width, no horizontal margin | 2-column grid | 3-column grid |
| Tables | Replaced by list-card view | Horizontal scroll or list-card | Full table |
| Modals | Bottom sheet (full width, partial height) | Centered dialog | Centered dialog |
| Pagination | Prev / Next only, no page numbers | Condensed (3 pages + ellipsis) | Full |

---

### 7.2 Mobile Typography

All type sizes scale down modestly on mobile. Line heights are slightly increased for touch-screen reading contexts.

| Style | Desktop | Mobile (xs/sm) | Change |
|---|---|---|---|
| Display | 48px / lh 1.15 | 32px / lh 1.2 | −16px |
| H1 | 30px / lh 1.25 | 24px / lh 1.3 | −6px |
| H2 | 24px / lh 1.3 | 20px / lh 1.35 | −4px |
| H3 | 20px / lh 1.4 | 18px / lh 1.4 | −2px |
| H4 | 16px / lh 1.4 | 15px / lh 1.45 | −1px |
| Body Large | 16px / lh 1.6 | 16px / lh 1.65 | unchanged |
| Body | 14px / lh 1.6 | 14px / lh 1.65 | unchanged |
| Body Small | 13px / lh 1.5 | 13px / lh 1.55 | unchanged |
| Label | 11px, uppercase | 11px, uppercase | unchanged |
| **Question body** | **18px / lh 1.7** | **16px / lh 1.75** | −2px |

Question body is reduced by 2px on mobile to allow full question text to appear without excessive scrolling, while line-height increases to compensate for reading density.

---

### 7.3 Mobile Spacing & Touch Targets

#### Touch Target Minimum

All interactive elements must meet a **minimum touch target of 44×44px** (Apple HIG) regardless of their visual size. Small visual elements are surrounded by invisible padding to reach this minimum.

```css
/* Example: small icon button visual 32px, touch target 44px */
.icon-button-sm {
  width: 32px;
  height: 32px;
  position: relative;
}
.icon-button-sm::before {
  content: '';
  position: absolute;
  inset: -6px;   /* expands clickable area to 44px */
}
```

#### Mobile Spacing Adjustments

On mobile, standard `p-6` (24px) card padding reduces to `p-4` (16px). Section gaps reduce from `space-8` (32px) to `space-6` (24px). Page horizontal padding reduces from `px-6` (24px) to `px-4` (16px).

| Token | Desktop | Mobile |
|---|---|---|
| Card padding | 24px (`p-6`) | 16px (`p-4`) |
| Page horizontal padding | 24px (`px-6`) | 16px (`px-4`) |
| Section gap | 32px | 24px |
| Form field gap | 20px | 16px |
| Button height (md) | 38px | 44px (touch minimum) |
| Input height | 38px | 44px (touch minimum) |

---

### 7.4 Mobile Navigation — Bottom Tab Bar

On mobile, the teacher dashboard uses a **bottom tab bar** instead of the desktop sidebar. The bottom tab bar is universally understood on mobile and keeps thumb-reachable navigation within the natural zone of one-handed phone use.

```
position: fixed
bottom: 0
left: 0
right: 0
height: 56px (+ safe-area-inset-bottom for notch/home indicator)
background: slate-800
border-top: 1px solid slate-600
display: flex
z-index: 50
```

**Tab items:** Equal-width columns (typically 4–5 tabs). Each tab contains:
- Icon (20px, centered horizontally)
- Label (DM Sans 10px, centered, `letter-spacing: 0.03em`)
- `gap: 3px` between icon and label

```
[Tab item]
  ├── Icon (20px)
  │     Resting: glow-400
  │     Active:  accent-400
  └── Label (10px)
        Resting: glow-400
        Active:  accent-400, font-weight: 600
```

Active tab: Icon and label both in `accent` tones. No background pill or underline — color is sufficient.

**Tab items for teacher role:**

| Tab | Icon | Label |
|---|---|---|
| Home | house | Overview |
| Exams | document-text | Exams |
| Students | users | Students |
| Results | chart-bar | Results |
| More | ellipsis-horizontal | More |

The "More" tab opens a **bottom sheet** listing infrequently accessed items (Settings, Profile, Help, Logout).

**Page content** must account for the bottom tab bar. Add `padding-bottom: calc(56px + env(safe-area-inset-bottom))` to all page content containers.

---

### 7.5 Mobile Navigation — Hamburger Drawer

On tablet (`md`), a collapsed icon-rail sidebar (48px wide, icons only) is used. Tapping an icon expands a full sidebar overlay (220px) that slides in from the left.

On mobile, a **hamburger menu** (`☰`) in the top-left of the mobile topbar opens the same full-width drawer for accessing deep links (Settings, Profile, etc.) not reachable via the bottom tab bar.

**Mobile Topbar (Dashboard):**
```
height: 48px
background: slate-800
border-bottom: 1px solid slate-600
padding: 0 16px
display: flex, align-items: center, justify-content: space-between

Left:  [☰ icon button, 44×44px touch target] + [Product name, Noto Serif 18px, glow-700]
Right: [Avatar, 32px circle] (taps to Profile)
```

**Drawer:**
```
position: fixed
top: 0, left: 0, bottom: 0
width: min(80vw, 280px)
background: slate-800
border-right: 1px solid slate-600
box-shadow: shadow-dark-lg
z-index: 60
transform: translateX(-100%)   /* closed */
transform: translateX(0)       /* open */
transition: transform 200ms ease-out
```

**Overlay behind drawer:** `background: rgba(0,0,0,0.60)`, tapping it closes the drawer.

---

### 7.6 Mobile Cards & Lists

#### Exam Cards

On mobile, exam cards are **full-width** (no grid). They stack vertically with a `gap: 12px` between cards. Horizontal padding from the page container (`px-4`) creates visual breathing room.

Card internal layout changes from a complex multi-column header to a simplified linear stack:

```
[Card]  background: slate-800
  ├── [Top row] Subject tag (left) + Status badge (right)
  ├── [Title] H3 (18px, Noto Serif, glow-700)
  ├── [Subtitle] Class name · Student count (13px, glow-400)
  └── [Footer row] Question count · Duration (left) + Submitted count (right)
```

Min-height: `80px`. Cards do not display hover states on mobile (no hover concept). Instead, the entire card has an `active:` state — `background: slate-700` — to provide press feedback.

#### Stat Cards

On mobile, stat cards arrange in a **2-column grid** with reduced padding (`p-4`). The large number size reduces from `text-4xl` (36px) to `text-3xl` (30px).

---

### 7.7 Mobile Forms

Form layout is always **single-column** on mobile. Multi-column form layouts from desktop collapse to sequential stacked fields.

**Input fields:** Height increases to 44px minimum (from 38px on desktop) to meet touch target requirements. Padding adjusts accordingly: `padding: 10px 13px`.

**Keyboard-aware layout:** Pages containing forms must be wrapped in a scroll container that remains usable when the virtual keyboard appears. The focused input must be scrolled into view and not obscured by the keyboard. Use `scroll-padding-bottom: 16px` on the scroll container.

**Select on mobile:** The native `<select>` element is preferred on mobile because it uses the platform's native picker, which is thumb-optimized and accessible. Custom select dropdowns should only be used if filtering or search within the list is needed (> 10 options).

**Date/time pickers:** Always use native `<input type="date">` and `<input type="time">` on mobile to leverage the platform's native date picker UI.

---

### 7.8 Mobile Tables → List View

Full tables (with multiple columns) are not usable on small screens. On mobile (`xs`/`sm`), all table instances are replaced by **list-card views**.

Each table row becomes a card:

```
[Row Card]  padding: 14px 16px, border-bottom: 1px solid slate-700
            background: slate-800
  ├── [Top row]
  │     ├── [Left] Identity (avatar + name, font-weight: 500, glow-600)
  │     └── [Right] Primary value (score, status badge)
  └── [Bottom row]  margin-top: 6px
        ├── [Left] Secondary info (class, date) — 13px, glow-400
        └── [Right] Action link — accent-400, 13px
```

The list-card view does not show table headers. Instead, a **sort/filter bar** (single horizontal scrollable row of compact filter chips) sits above the list.

On tablet (`md`), full tables are permitted if the column count is ≤ 4. Wider tables should scroll horizontally within a container with `-webkit-overflow-scrolling: touch`.

---

### 7.9 Mobile Modals → Bottom Sheet

On mobile, all modals transform into **bottom sheets** — panels that slide up from the bottom of the screen. This is more ergonomic on touch screens and avoids the cramped experience of a centered modal on a narrow viewport.

```
position: fixed
bottom: 0, left: 0, right: 0
background: slate-800
border-radius: 12px 12px 0 0     /* rounded top corners only */
border-top: 1px solid slate-600
padding: 20px 16px
padding-bottom: calc(20px + env(safe-area-inset-bottom))
box-shadow: 0 -4px 24px rgba(0,0,0,0.50)
z-index: 60
max-height: 90vh
overflow-y: auto
```

**Drag handle:** A 36×4px pill, `background: slate-600`, `border-radius: 2px`, centered horizontally at the top of the sheet with 12px margin below it. It serves as a visual affordance that the sheet can be dragged down to dismiss.

**Overlay:** `rgba(0,0,0,0.60)`. Tapping the overlay dismisses the bottom sheet.

**Confirmation bottom sheets** (e.g., submit exam, delete exam) are limited to `max-height: 50vh` and contain only the title, a short description, and two action buttons stacked vertically (Danger/Destructive on top, Secondary cancel below).

---

### 7.10 Mobile Exam UI — Topbar

On mobile, the exam topbar adapts to fit critical information in 48px height.

```
height: 48px
background: slate-800
border-bottom: 1px solid slate-600
padding: 0 12px
position: sticky, top: 0, z-index: 40
```

```
[Left]   [☰ Map icon] (44×44px, opens Question Map Drawer)
[Center] Exam name (DM Sans 14px, glow-500, truncated with ellipsis)
[Right]  Timer component (compact)
```

The Map icon is the primary affordance for opening the Question Map drawer. Its touch target is 44×44px. A badge showing the count of unanswered questions appears over it when any questions remain unanswered.

**Badge on map icon:**
```
position: absolute, top-right of icon
background: #e8b84b
color: slate-900
font: DM Sans 10px, font-weight: 700
border-radius: full
min-width: 16px, height: 16px
padding: 0 4px
```

Progress bar (the thin 4px strip showing answered/total) sits at the very bottom edge of the topbar — full width, `slate-600` track, `accent-500` fill.

---

### 7.11 Mobile Exam UI — Question Map Drawer

On mobile, the Question Map is not a persistent panel. It is a **collapsible top drawer** triggered by tapping the Map icon in the topbar.

**Closed state:** The drawer is fully hidden. The progress bar in the topbar communicates overall progress passively.

**Open state:** The drawer slides down from beneath the topbar, overlaying the question content.

```
position: fixed
top: 48px   /* directly below topbar */
left: 0, right: 0
background: slate-800
border-bottom: 1px solid slate-600
box-shadow: shadow-dark-md
padding: 16px
z-index: 39   /* below topbar, above question content */
max-height: calc(60vh)
overflow-y: auto

open:   transform: translateY(0),   opacity: 1
closed: transform: translateY(-8px), opacity: 0
transition: 200ms ease-out
```

**Drawer contents:**

```
[Header row]
  ├── "QUESTION MAP" label (glow-300, uppercase)
  └── [✕ Close button] (Ghost, 44×44px, right-aligned)

[Bubble grid]
  └── grid-template-columns: repeat(auto-fill, minmax(40px, 1fr))
      gap: 8px
      Bubble size: 40×40px (larger than desktop for touch)
      Same state colors as desktop

[Legend row]
  └── Horizontal flex, gap: 16px (compact horizontal legend)
      Each: 10×10px swatch + 12px label

[Submit button]
  └── Full-width, Danger variant, margin-top: 16px
```

The bubble grid uses `repeat(auto-fill, minmax(40px, 1fr))` — column count is derived automatically from the available drawer width after horizontal padding is subtracted. On a 360px phone with `16px` padding on each side (328px usable), this yields ~7 columns; on a 430px phone (~398px usable) ~9 columns. Bubble size is **40×40px** on mobile (vs 32×32px on desktop) to meet touch target minimums.

Tapping any bubble closes the drawer and scrolls to that question.

**Overlay:** `rgba(0,0,0,0.40)` (lighter than modal overlay) behind the drawer. Tapping the overlay closes the drawer.

---

### 7.12 Mobile Exam UI — Question Panel

On mobile, the Question Panel is full-width and scrollable. There is no persistent sidebar.

```
padding: 16px
padding-bottom: 80px   /* space for fixed navigation footer */
background: slate-900
```

**Question header:** Number badge (24×24px, `background: accent-500`, `glow-700`) + "Q X / Y" label, horizontal row.

**Flag button:** Placed inline in the header row, right-aligned. 44×44px touch target.

**Question body:** Noto Serif 16px, `glow-700`, `line-height: 1.75`. Slightly smaller than desktop (18px) to avoid excessive line wrapping on narrow screens.

**Answer options:** Full-width. Padding increases to `14px 16px` for comfortable touch. Gap between options: `10px`.

**Fixed navigation footer:** The Previous/Next navigation is **fixed to the bottom** of the screen, above any safe-area inset.

```
position: fixed
bottom: 0, left: 0, right: 0
height: 56px
padding: 8px 16px
padding-bottom: calc(8px + env(safe-area-inset-bottom))
background: slate-800
border-top: 1px solid slate-600
display: flex, gap: 12px, align-items: center
z-index: 30
```

```
[← Prev]  flex: 1, Secondary button, height: 40px
[Next →]  flex: 1, Primary button, height: 40px
```

Question content has `padding-bottom: 80px` to ensure the last answer option is not obscured by this fixed footer.

---

### 7.13 Mobile Exam UI — Continuous Scroll Mode

Continuous Scroll is the default mode and works particularly well on mobile. The linear, top-to-bottom layout matches the natural gesture of scrolling a phone screen and eliminates the need to repeatedly tap navigation buttons.

**Layout:** The question panel is a single tall scroll container. No fixed navigation footer is rendered. The only fixed elements are the topbar (top) and the safe-area-aware padding at the bottom.

```
padding: 16px
padding-bottom: calc(32px + env(safe-area-inset-bottom))
/* no fixed footer — extra bottom padding replaces it */
```

**Question blocks on mobile:**

```
padding-bottom: 24px
border-bottom: 1px solid slate-600
margin-bottom: 24px
```

No left-margin question number pseudo-element on mobile (insufficient horizontal space). The number badge inside each block header serves as the sole question identifier.

**Scroll-linked Question Map:** The same `IntersectionObserver` logic applies on mobile. As the student scrolls, the active bubble in the Question Map drawer updates. When the drawer is opened mid-scroll, the active bubble is immediately visible.

**Anchor jump behavior:** Tapping a bubble in the Question Map drawer closes the drawer, then smooth-scrolls the question panel to the target block. The `scroll-padding-top` value on mobile must account for the topbar height (`48px`):

```css
.question-panel-mobile {
  scroll-padding-top: 48px;
}
```

**"Back to top" affordance:** In continuous scroll mode on mobile, once the student has scrolled past question 5, a small "↑ Top" Ghost button appears pinned at `bottom: calc(16px + env(safe-area-inset-bottom))`, `right: 16px`. It smooth-scrolls back to question 1. This button does not appear in Paged mode.

```
position: fixed
bottom: calc(16px + env(safe-area-inset-bottom))
right: 16px
padding: 8px 12px
background: slate-700
border: 1px solid slate-500
border-radius: 6px
font: DM Sans 12px, glow-400
box-shadow: shadow-dark-md
z-index: 20
```

**Paged mode on mobile:** When the teacher has selected Paged mode, the mobile question panel behaves identically to the existing §7.12 spec — one question per screen, fixed navigation footer at the bottom.

---

### 7.14 Mobile Exam UI — Result Screen

The result screen on mobile is a single full-page scroll. Elements stack vertically.

```
padding: 24px 16px
padding-bottom: calc(24px + env(safe-area-inset-bottom))
background: slate-900
```

**Score circle:** Reduces from 80px to 72px diameter. Remains centered at the top. Circle background uses the semantic background tint.

**Stat row:** On mobile, the three stats (Correct / Incorrect / Skipped) stack as a horizontal row with equal columns. If space is insufficient (< 360px wide), they stack vertically instead.

**Progress bar:** Full-width, 8px height (slightly thicker than dashboard progress bars for visual emphasis in the result context).

**Action buttons:** Stack vertically — "Review Answers" on top, "Back to Home" below. Each button is full-width, 44px height.

---

## 8. Motion & Interaction

Exama is deliberately **low-motion**. The examination context demands focus, and unnecessary animation is a distraction.

### Permitted Transitions

| Element | Property | Duration | Easing |
|---|---|---|---|
| Button hover | `background-color`, `border-color` | 120ms | `ease-out` |
| Card hover | `border-color`, `box-shadow`, `background-color` | 150ms | `ease-out` |
| Answer option hover/select | `background-color`, `border-color` | 100ms | `ease-out` |
| Input focus | `border-color`, `box-shadow` | 120ms | `ease-out` |
| Timer state change | `background-color`, `color` | 300ms | `ease` |
| Modal open (desktop) | `opacity` (overlay) | 180ms | `ease-out` |
| Tab switch | `border-color` (active indicator) | 120ms | `ease` |
| Bottom sheet open (mobile) | `transform: translateY` | 250ms | `ease-out` |
| Question Map drawer open (mobile) | `transform: translateY`, `opacity` | 200ms | `ease-out` |
| Sidebar drawer open (mobile) | `transform: translateX` | 200ms | `ease-out` |
| Bottom tab bar active change | `color` | 100ms | `ease` |

### Mobile-Specific Motion Notes

On mobile, transitions serve a different purpose: they communicate spatial relationships (drawers sliding in from directions that match their origin) and confirm touch events. The principles remain the same — transitions are quick and functional, not decorative.

`prefers-reduced-motion: reduce` must be respected. All transitions must be wrapped:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
```

### Prohibited

- Scale transforms on hover or active (desktop or mobile)
- Slide-in/slide-out transitions for page navigation (use instant swap)
- Scroll-triggered animations
- Parallax effects
- Loading skeleton pulse animations
- Bouncing or elastic easing curves
- Spring physics in drawers or sheets

### Loading State

The spinning indicator on buttons is the only persistent animation in the system. All other loading states are represented by static UI: a spinner in the button, or "Loading…" text in the content area.

---

## 9. Accessibility

### Color

- All text meets WCAG AA (4.5:1) at minimum; primary text meets AAA (7:1).
- Status is **never conveyed by color alone** — icons, labels, or patterns accompany all semantic color uses.
- Focus rings use `box-shadow: 0 0 0 3px rgba(78,132,180,0.35)` — visible against both `slate-800` and `slate-900` backgrounds.

### Keyboard Navigation

- All interactive elements are reachable by Tab in logical DOM order.
- Modals trap focus within themselves when open.
- The Question Map bubbles are navigable with arrow keys (role: `grid`).
- Submit Exam requires an explicit button press — no keyboard shortcut triggers submission.

### Touch & Mobile Accessibility

- All interactive elements meet the **44×44px minimum touch target** (Apple HIG / WCAG 2.5.5).
- Touch targets that appear visually smaller use invisible padding extensions (see §7.3).
- Bottom sheets and drawers can be dismissed by swiping down or tapping the overlay.
- The Question Map drawer on mobile receives focus on open; focus returns to the Map icon on close.
- Bottom tab bar items have `role="tab"` and `aria-selected` to communicate active state to screen readers.

### Screen Readers

- All icon-only buttons have `aria-label`.
- Status badges have `role="status"` or are wrapped in `aria-live="polite"` regions when they update dynamically.
- The timer announces remaining time at the 5-minute and 1-minute thresholds via `aria-live="assertive"`.
- Form errors are associated with their control via `aria-describedby`.
- The Question Map drawer has `aria-expanded` on its trigger and `role="dialog"` on the drawer panel.
- The unread-count badge on the mobile Map icon is announced via `aria-label="X unanswered questions"`.

### Focus Management

- When a modal or bottom sheet opens, focus moves to the panel's first interactive element.
- When a modal or bottom sheet closes, focus returns to the trigger element.
- When the Question Map drawer opens on mobile, focus moves to the first bubble or the close button.
- Page navigation does not scroll to top — focus is placed on the main `<h1>` of the new view.

---

## 10. Writing Style

Exama's copy is **clear, direct, and respectful**. Users are under time pressure; every word must earn its place.

### Voice Attributes

- **Calm** — Never alarming, even for error states.
- **Direct** — Action-first sentences.
- **Respectful** — No condescension. Treat users as intelligent adults.
- **Specific** — Avoid vague messages like "Something went wrong."

### Copy Conventions

| Context | Style |
|---|---|
| Page titles | Title case, Noto Serif |
| Button labels | Title case, imperative verb-first ("Submit Exam", "Add Question") |
| Status badges | Title case ("In Progress", "Draft") |
| Table column headers | Title case |
| Label/section headers | ALL CAPS |
| Alert messages | Sentence case, end with period |
| Error messages | Sentence case, specific action ("Enter a valid email address.") |
| Empty states | Friendly, no period on headings |
| Tooltips | Sentence case, no period |

### Numbers

- Scores are displayed with one decimal place: `8.5`, not `8.50` or `8`.
- Time is displayed as `MM:SS` during exam, `09:38 AM` in result lists.
- Large numbers use a space as thousands separator: `20 000`, not `20,000` (consistent with Vietnamese convention).
- Fractions (questions answered): `18 / 25`, not `18/25` — spaces around the slash aid legibility.

---

## 11. Token Reference

Complete design token reference for implementation.

### Breakpoint Tokens

```css
:root {
  --bp-xs: 0px;
  --bp-sm: 480px;
  --bp-md: 768px;
  --bp-lg: 1024px;
  --bp-xl: 1280px;
}
```

### Touch Target Token

```css
:root {
  --touch-target-min: 44px;
}
```

### Color Tokens

```css
:root {
  /* Slate — Surface Colors */
  --color-slate-900: #16140f;
  --color-slate-800: #1e1c16;
  --color-slate-700: #272419;
  --color-slate-600: #312e22;
  --color-slate-500: #3d392c;

  /* Glow — Text & Foreground */
  --color-glow-100: #2e2b22;
  --color-glow-200: #4a4638;
  --color-glow-300: #6b6555;
  --color-glow-400: #9e9784;
  --color-glow-500: #cec7b5;
  --color-glow-600: #e2ddd1;
  --color-glow-700: #f2ede4;

  /* Accent */
  --color-accent-900: #0d2035;
  --color-accent-800: #112b47;
  --color-accent-700: #1a4268;
  --color-accent-600: #2d6899;
  --color-accent-500: #4e84b4;
  --color-accent-400: #7aa3c8;
  --color-accent-300: #adc5df;

  /* Success */
  --color-success-bg:     #0d200d;
  --color-success-border: #1a4a1a;
  --color-success-base:   #6ec46e;
  --color-success-light:  #8ed98e;

  /* Warning */
  --color-warning-bg:     #221800;
  --color-warning-border: #4a3200;
  --color-warning-base:   #e8b84b;
  --color-warning-light:  #f0cc72;

  /* Danger */
  --color-danger-bg:     #220d0d;
  --color-danger-border: #4a1a1a;
  --color-danger-base:   #e07272;
  --color-danger-light:  #ea9090;

  /* Info (shares accent) */
  --color-info-bg:     #0d1e2d;
  --color-info-border: #112b47;
  --color-info-base:   #7aa3c8;
  --color-info-light:  #adc5df;
}
```

### Spacing Tokens

```css
:root {
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
}
```

### Typography Tokens

```css
:root {
  --font-serif: 'Noto Serif', Georgia, serif;
  --font-sans:  'DM Sans', system-ui, sans-serif;
  --font-mono:  ui-monospace, 'Cascadia Code', monospace;

  --text-xs:      11px;
  --text-sm:      13px;
  --text-base:    14px;
  --text-body:    16px;
  --text-h4:      16px;
  --text-h3:      20px;
  --text-h2:      24px;
  --text-h1:      30px;
  --text-display: 48px;

  --leading-tight:   1.25;
  --leading-snug:    1.4;
  --leading-normal:  1.5;
  --leading-relaxed: 1.6;
  --leading-loose:   1.7;
}
```

### Shadow Tokens

```css
:root {
  --shadow-dark:    0 1px 3px 0 rgba(0,0,0,0.30), 0 1px 2px -1px rgba(0,0,0,0.20);
  --shadow-dark-md: 0 3px 8px 0 rgba(0,0,0,0.40), 0 1px 3px -1px rgba(0,0,0,0.25);
  --shadow-dark-lg: 0 8px 20px 0 rgba(0,0,0,0.50), 0 2px 6px -1px rgba(0,0,0,0.30);
  --shadow-inset:   inset 0 1px 3px rgba(0,0,0,0.30);
  --shadow-focus:   0 0 0 3px rgba(78,132,180,0.35);
}
```

### Border Radius Tokens

```css
:root {
  --radius-sm:   4px;
  --radius-base: 6px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-full: 9999px;
}
```

---

*Exama Design System Dark Mode v1.0 — Maintained by [kyle2910 (Github)](https://github.com/kyle2910). Covers desktop and mobile.*
