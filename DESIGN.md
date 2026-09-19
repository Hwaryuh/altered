---
name: Altered
description: A personal tool for transposing chord progressions and finding guitar voicings. A dense workbench built from one coral on warm neutral dark
colors:
  bg: "oklch(0.284 0.008 59.3)"
  surface: "oklch(0.226 0.002 106.551)"
  surface-subtle: "oklch(0.256 0.002 106.529)"
  text: "oklch(0.955 0.004 91.447)"
  text-muted: "oklch(0.82 0.008 106.607)"
  text-faint: "oklch(0.77 0.014 106.821)"
  border: "oklch(0.296 0.004 106.614)"
  border-strong: "oklch(0.359 0.007 106.735)"
  hover: "oklch(0.268 0.002 106.522)"
  accent: "oklch(0.690 0.158 27.4)"
  accent-hover: "color-mix(in srgb, oklch(0.690 0.158 27.4) 82%, white)"
  accent-foreground: "oklch(0.284 0.008 59.3)"
  accent-soft: "color-mix(in srgb, oklch(0.690 0.158 27.4) 24%, oklch(0.226 0.002 106.551))"
  accent-text: "color-mix(in srgb, oklch(0.690 0.158 27.4) 45%, white)"
  warning: "oklch(0.731 0.13 73.34)"
  warning-soft: "color-mix(in srgb, oklch(0.731 0.13 73.34) 16%, oklch(0.226 0.002 106.551))"
  warning-text: "color-mix(in srgb, oklch(0.731 0.13 73.34) 80%, white)"
  danger: "oklch(0.655 0.156 27.314)"
  danger-soft: "color-mix(in srgb, oklch(0.655 0.156 27.314) 18%, oklch(0.226 0.002 106.551))"
  danger-text: "color-mix(in srgb, oklch(0.655 0.156 27.314) 70%, white)"
  success: "oklch(0.681 0.086 157.749)"
typography:
  chord-symbol:
    fontFamily: "'SUIT Variable', SUIT, system-ui, sans-serif"
    fontSize: "32px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.03em"
  wordmark:
    fontFamily: "'SUIT Variable', SUIT, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 800
    letterSpacing: "-0.02em"
  section-title:
    fontFamily: "'SUIT Variable', SUIT, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    letterSpacing: "-0.01em"
  pane-title:
    fontFamily: "'SUIT Variable', SUIT, system-ui, sans-serif"
    fontSize: "14.5px"
    fontWeight: 700
    letterSpacing: "-0.01em"
  h3:
    fontFamily: "'SUIT Variable', SUIT, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: "18px"
  subhead:
    fontFamily: "'SUIT Variable', SUIT, system-ui, sans-serif"
    fontSize: "12.5px"
    fontWeight: 700
  body:
    fontFamily: "'SUIT Variable', SUIT, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "18px"
  body-small:
    fontFamily: "'SUIT Variable', SUIT, system-ui, sans-serif"
    fontSize: "11.5px"
    fontWeight: 400
    lineHeight: "17px"
  button:
    fontFamily: "'SUIT Variable', SUIT, system-ui, sans-serif"
    fontSize: "11.5px"
    fontWeight: 600
    lineHeight: 1
  label:
    fontFamily: "'SUIT Variable', SUIT, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: "16px"
  meta:
    fontFamily: "'SUIT Variable', SUIT, system-ui, sans-serif"
    fontSize: "10.5px"
    fontWeight: 600
  badge:
    fontFamily: "'SUIT Variable', SUIT, system-ui, sans-serif"
    fontSize: "10px"
    fontWeight: 600
    lineHeight: 1.25
  badge-soon:
    fontFamily: "'SUIT Variable', SUIT, system-ui, sans-serif"
    fontSize: "9.5px"
    fontWeight: 600
    lineHeight: 1.25
  sheet:
    fontFamily: "'Nanum Gothic Coding', ui-monospace, monospace"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "26px"
  sheet-mobile:
    fontFamily: "'Nanum Gothic Coding', ui-monospace, monospace"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "28px"
  control-mobile:
    fontFamily: "'SUIT Variable', SUIT, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
  button-mobile:
    fontFamily: "'SUIT Variable', SUIT, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1
rounded:
  badge: "3px"
  keycap: "4px"
  control: "4px"
  card: "5px"
  overlay: "6px"
  full: "50%"
spacing:
  "2": "2px"
  "4": "4px"
  "6": "6px"
  "8": "8px"
  "10": "10px"
  "12": "12px"
  "14": "14px"
  "16": "16px"
  "20": "20px"
  "24": "24px"
  "28": "28px"
  "32": "32px"
  ctl-h: "32px"
  ctl-h-mobile: "44px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-foreground}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "30px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-secondary:
    backgroundColor: "{colors.surface-subtle}"
    textColor: "{colors.text}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "30px"
  button-secondary-hover:
    backgroundColor: "{colors.hover}"
  button-ghost:
    textColor: "{colors.text-muted}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0 8px"
    height: "30px"
  button-ghost-hover:
    backgroundColor: "{colors.hover}"
    textColor: "{colors.text}"
  button-mobile:
    typography: "{typography.button-mobile}"
    padding: "0 14px"
    height: "44px"
  tab:
    textColor: "{colors.text-muted}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 10px"
    height: "30px"
  tab-active:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent-text}"
  select:
    backgroundColor: "{colors.surface-subtle}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 30px 0 10px"
    height: "{spacing.ctl-h}"
  toggle:
    textColor: "{colors.text-muted}"
    rounded: "{rounded.control}"
    padding: "0 10px"
    height: "36px"
  toggle-on:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent-text}"
  key-chip:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: "0 9px"
    height: "22px"
  tone:
    textColor: "{colors.text}"
    typography: "{typography.subhead}"
    rounded: "{rounded.control}"
    padding: "0 9px"
    height: "26px"
  tone-root:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent-text}"
  badge:
    textColor: "{colors.text-muted}"
    typography: "{typography.badge}"
    rounded: "{rounded.badge}"
    padding: "1px 5px"
  badge-accent:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent-text}"
  badge-warning:
    textColor: "{colors.warning-text}"
  badge-danger:
    textColor: "{colors.danger-text}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
  empty-note:
    backgroundColor: "{colors.surface-subtle}"
    textColor: "{colors.text-muted}"
    typography: "{typography.body-small}"
    rounded: "{rounded.card}"
    padding: "14px 16px"
  warn-row-active:
    backgroundColor: "{colors.accent-soft}"
  stepper:
    backgroundColor: "{colors.surface-subtle}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    height: "{spacing.ctl-h}"
  stepper-value-changed:
    textColor: "{colors.accent-text}"
  fret-dot:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent-text}"
    rounded: "{rounded.control}"
    size: "38px"
  fret-dot-root:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-foreground}"
  candidate-row:
    rounded: "{rounded.control}"
    padding: "0 9px"
    height: "34px"
  candidate-row-on:
    backgroundColor: "{colors.accent-soft}"
---

# Design System: Altered

## Overview

**Creative North Star: "The Dense Workbench"**

Altered is a dense working tool built from small type, thin hairlines and a single accent. The core tokens (neutral gray surfaces, ink, hairlines, the warning, danger and success colors, 4px control / 5px card / 6px overlay radii, the shadow border) are fixed reference values. Buttons, inputs, selects, chips, badges and cards all follow the same density rules: 11.5px buttons, 28–32px controls, 10–13px meta text with no capitals, shadow-border cards and dashed empty areas. New colors and states are made only by mixing core tokens with `color-mix`.

The density is a tool's density. On desktop the layout is tight, with 30–32px controls and 10–13px meta text; on mobile the same rules scale up to 44px touch density. The star of the screen is the sheet. A fixed-width font makes one Hangul syllable exactly two Latin columns wide, so chords stay right above their syllables. Color is used only for meaning: the coral accent means chords and selection, the danger color means notation issues, the warning color means harmony issues.

Surfaces are flat. Cards and lists are separated by layered hairline shadow borders alone, with no floating shadows. State changes are shown with fills and rings; motion is a short 150ms transition and a 0.96 scale on press, nothing more.

**Key Characteristics:**
- Working surfaces one step lighter than a neutral dark gray background (dark only, no theme switching)
- One coral accent (chords, selection, focus), defined in a single place, `--color-accent` in `tokens.css`; every other accent color derives from it
- All UI in SUIT Variable, only the sheet in Nanum Gothic Coding
- A dense ramp on desktop; 16px inputs and 44px touch targets on mobile
- Flat surfaces with shadow borders, and dashed empty states

## Colors

A palette of warm-tinted neutral grays with one coral, where amber (warning) and red (danger) carry meaning. OKLCH values are the source of truth; derived colors are made only with `color-mix(in srgb, …)`.

### Primary
- **Coral Accent** (`accent`): #ed6f63 (OKLCH 0.690 0.158 27.4). Used for chords, the primary button, focus ring, caret, root-note dot, capo marker and selection ring. This is the only place the accent is defined (`--color-accent` in `tokens.css`); changing it carries through to the wash, ink, hover and focus halo. The accent is light (L 0.69), so `accent-foreground` (text/icon on the accent fill) is the warm dark ink #2D2926, not white — that pair is 4.7:1 (white on the coral is only ~3:1 and fails AA). Note the accent shares its hue with `danger` (both ~OKLCH 27); coral no longer separates chords from notation errors by hue alone, so error meaning leans on the wavy underline and badge border it always carried.
- **Coral Wash** (`accent-soft`): the accent mixed 24% into the surface. The background of the active tab, selected toggle, active warning row, selected candidate, chord token, key chip and chord-tone dot.
- **Coral Ink** (`accent-text`): the accent mixed 45% with white, for contrast on dark backgrounds. Used for chord text, links, and active tab and toggle text.
- **Coral Hover** (`accent-hover`): the primary button's hover, with 18% white mixed in.

### Tertiary
- **Amber Warning** (`warning` / `warning-soft` / `warning-text`): musical warnings. Underlines and badge borders use the base color, fills the wash (16%), text the ink (80% white mix).
- **Red Danger** (`danger` / `danger-soft` / `danger-text`): notation-check items, muted strings, the hover of a delete on a progression item. The same wash, ink and base structure (18% / 70%).
- **Success** (`success`): rarely used on these screens.

### Neutral
- **Background gray** (`bg`): the page background.
- **Surface** (`surface`): cards, panels, warning lists, the mobile bottom bar.
- **Subtle surface** (`surface-subtle`): the background of controls (selects, steppers, secondary buttons, toggle groups), empty-state notes and keycaps.
- **Body ink** (`text`): body text, headings, the nut line.
- **Muted ink** (`text-muted`): labels, hints, meta, ghost buttons.
- **Faint ink** (`text-faint`): inactive tabs, string lines, the "coming soon" badge.
- **Hairline** (`border`): dividers between list rows, the top line of the bottom bar.
- **Strong hairline** (`border-strong`): control borders, badge borders, fret lines, inlay dots, dashed empty areas.
- **Hover gray** (`hover`): the hover fill of every row, button and tab.
- There is one dark theme only. All values are defined in a single `:root` block in `tokens.css` (no `prefers-color-scheme` or `data-theme` branches).

### Named Rules
**The Paint-Meaning-Only Rule.** Color appears only when it means one of the states: chord, selection or focus, notation issue, harmony issue. A colored element with no meaning is a bug.

**The Wash-Ink-Underline Rule.** Every warning uses the wash as fill, an ink tone for text, and the base color for the wavy underline or border. Base-color text is never placed on its own wash.

**The Fixed-Tokens Rule.** Core tokens keep their names and values. A new color is made by mixing existing tokens with `color-mix` into a derived token.

## Typography

**Display Font:** none (headings are SUIT Variable too)
**Body Font:** SUIT Variable (SUIT, system-ui, sans-serif)
**Sheet Font:** Nanum Gothic Coding (ui-monospace, monospace), only for the sheet, tokens and fingering codes

**Character:** No serifs; SUIT alone carries everything from headings to badges. Headings are tightened with 700/800 weight and −0.01 to −0.03em tracking; everything else follows a small, dense ramp.

### Hierarchy
- **Chord symbol** (800, 32px, −0.03em; 28px on mobile): the chord name identified on the fretboard.
- **Wordmark** (800, 17px, −0.02em): the product name in the header.
- **Section title** (700, 16px): titles of the review and progression sections.
- **Pane title** (700, 14.5px): panel headers such as source and result.
- **H3** (700, 13px): sub-group titles, chord names in progression items.
- **Subhead** (700, 12.5px): candidate chord names, chord-tone chips.
- **Body** (400, 12px/18px): default text, control text, tabs, fact lists.
- **Small body / button** (11.5px; buttons 600): buttons, toggle labels, warning details, empty-state notes.
- **Label / caption** (600, 11px/16px): field labels, legend, confidence.
- **Meta** (10.5px): fret numbers, candidate tags, progression codes, ghost note names.
- **Badge** (600, 10px): count badges, fingering-warning categories, toggle hints, keycaps.
- **Coming-soon badge** (600, 9.5px): the marker beside an inactive tab. Interval numbers (inside dots) are also 9.5px.
- **Sheet** (Nanum Gothic Coding 14px/26px; mobile 16px/28px): the source and result sheets. Warning tokens are 13px.
- **Mobile touch ramp:** inputs and sheet 16px (prevents iOS zoom), buttons and tabs 14px, labels, toggle labels and empty notes 13px, badges and keycaps 11px, every target 44px.

Known trade-off: on desktop several functional labels (badges, meta, interval numbers) stay at 9.5–10.5px under the density rules, and the detector flags them. Contrast passes AA; the size is recorded as a deliberate compromise.

### Named Rules
**The Column-Alignment Rule.** The sheet is set only in Nanum Gothic Coding, where a Hangul syllable is exactly two Latin columns wide. Sheet lines never wrap; they scroll horizontally.
**The No-Caps Meta Rule.** Meta text at 10–13px is told apart only by weight (600) and muted ink, never by capitals or wide tracking.

## Layout

At 1440px the desktop stacks, top to bottom, a 56px header (32px side padding, 32px between the wordmark and the tabs), a control band, two panels, and the review and progression sections. The transposer shows two equal panels (`repeat(2, minmax(0, 1fr))`, 24px gap, height `clamp(420px, 56vh, 600px)`); the fretboard screen shows a wide board panel and a 440px analysis column (560px tall). The section area uses 32px side margins and 28px top margin. Panels scroll internally, so the controls and the review area stay in place.

Mobile (390px) is a single column with 16px side margins. The transposer puts a two-way switch (48px; the second line shows the chord count and the target key) above the panel, showing source or result one at a time, with undo and notices below it. The fretboard settings fold into a collapsible card ("Fretboard settings") whose summary line shows tuning and capo. The fretboard bottom bar shows the chord name with confidence and chord tones (with intervals) beneath it, and the previous and next form buttons beside it. The key selects sit in a two-column grid, settings go into collapsible cards, and the main actions gather in a bottom bar stuck to the bottom (surface fill, a hairline on top, `10px 16px` plus safe-area padding). The fretboard turns into a vertical board. The sheet scrolls horizontally instead of wrapping.

Spacing follows a dense rhythm (2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32px): 6px between a label and its control, 8–12px between control groups, 20–28px between groups. Control height changes in one place through `--ctl-h` (32px on desktop, 44px on mobile).

## Elevation & Depth

A flat system. Cards and lists are outlined only with `--shadow-border` (a 1px ring at 8% white). Surfaces attached to the page have no drop shadow. The only floating surface is the key-wheel popover, and only it uses `--shadow-overlay`. Hierarchy comes from lightness layers rather than depth: a surface on the background (`bg`), a subtle control on the surface.

### Shadow Vocabulary
- **Shadow border** (`box-shadow: var(--shadow-border)`): panels, warning lists, progression cards, the mobile settings card, the fretboard ghost label.
- **Shadow border hover** (`box-shadow: var(--shadow-border-hover)`): the hover of a progression card.
- **Overlay** (`box-shadow: var(--shadow-overlay), 0 0 0 1px color-mix(in srgb, var(--color-text) 9%, transparent)`; `0 12px 32px` black at 45%): the key-wheel popover only.
- **Focus halo** (`box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-accent) 14%, transparent)`): focus of selects and steppers (with an accent border). A panel being edited gets a `0 0 0 1px accent, 0 0 0 3px` halo.
- **Token focus ring** (`box-shadow: 0 0 0 2px var(--color-surface), 0 0 0 4px var(--color-accent)`): a sheet token tied to a review item.
- **Selection ring** (`box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-accent) 24%, transparent)`): a selected toggle. Chord-tone dots use 36%.

### Named Rules
**The Hairlines-Are-Everything Rule.** Surfaces are told apart only by shadow borders and hairlines. A new surface attached to the page gets no drop shadow. Only floating popovers are the exception.

## Shapes

Weak, constant rounding. Corners are barely rounded and never exceed 6px. Controls (buttons, selects, inputs, steppers, tabs, toggles, candidate rows, mute buttons), chips (key chips, chord-tone chips) and fret note markers use 4px (3px for the inner corners of stepper buttons); cards, panels, lists and empty notes use 5px; toggle-group frames and overlay tokens use 6px; badges, keycaps, ghost labels, fingering-code displays and sheet-token highlights use 3px. There are no pills. Circles appear only for radios, fretboard inlay dots and the key wheel (its ring and center button). Empty states and drop areas are outlined with a 1px dashed `border-strong`.

## Components

### Buttons
Dense buttons.
- **Shape:** 4px radius, height 30px (small buttons 26px, icon buttons a `--ctl-h` square), 44px on mobile.
- **Primary:** coral fill with white text, 11.5px/600, 12px side padding. Hover uses `accent-hover`.
- **Secondary:** subtle surface, strong hairline border, body ink. Hover uses hover gray.
- **Ghost:** transparent, muted ink, 8px side padding. Hover turns hover gray with body ink.
- **Link:** transparent, 26px, coral ink 11.5px/600.
- **Hover / Focus / Active:** a 150ms `cubic-bezier(0.2, 0, 0, 1)` transition, `scale: 0.96` on press, a global focus outline of 2px accent (2px offset). Disabled is 0.42 opacity. Icons are 15px SVG (18px on mobile).

### Navigation (top tab pills)
- Transparent 30px pills, 12px/600 muted ink. Hover uses hover gray. The active tab is coral wash with coral ink. An inactive tab is faint ink with a 9.5px "coming soon" badge. On mobile: 44px, 14px, horizontal scroll.

### Segmented Toggle Group
- Inside a subtle-surface frame (2px padding, strong-hairline inset ring, 6px radius) sit 36px segments (label 11.5px/600 plus hint 10px). Selected is coral wash, a 24% accent inset ring and coral ink. 48px on mobile. The small variant (`sm`) hides the hint.

### Chips / Badges
- **Key chip:** the accent variant of a chip. 22px tall, 4px radius, an accent border, coral wash, body ink 11.5px/700.
- **Chord-tone chip:** 26px tall, 4px radius, strong-hairline border, 12.5px/700 plus a 10.5px interval. The root gets an accent border, wash and ink.
- **Badge:** 3px radius, strong-hairline border, 10px/600 tabular numbers. The accent, warning and danger variants change the border to the base color and the text to the ink tone (the accent adds a wash fill). The fingering-warning categories (music = warning, shape = accent, play = danger) are these badges too.
- **Keycap:** 10px/600, 3px radius, an inset ring on the subtle surface with a 1px lip below.

### Cards / Containers
- **Corner Style:** 5px.
- **Background:** the surface color.
- **Shadow Strategy:** shadow border (see Elevation). Only hoverable progression cards change to the shadow-border hover.
- **Border:** only a `border` hairline between list rows.
- **Internal Padding:** 12–16px (warning rows 12px 16px, the mobile settings card 14px on the sides).
- **Empty note:** subtle surface, a strong-hairline dashed outline, muted ink 11.5px/18px, 14px 16px padding.
- **Mobile settings fold:** a card-shaped `details`, a 48px summary line, and the arrow turns 180 degrees when open.

### Inputs / Fields
- **Style:** subtle surface, a 1px strong-hairline border, 4px radius, height `--ctl-h`. A select holds a muted-ink arrow in its right 30px. The semitone-shift stepper (transposer) puts icon buttons on both sides of a 56px-wide 13px/700 tabular-number input. The language select shows an inline SVG flag inside its left side.
- **Hover:** the border moves 28% toward faint ink.
- **Focus:** an accent border, a surface fill and a 14% accent halo.
- **Disabled:** 0.42 opacity.
- Field labels are 11px/600 muted ink (13px on mobile), 6px above the control.

### Joined Stepper (capo)
- One control frame (subtle surface, strong hairline, 6px, height `--ctl-h`) holds a − button, the value and a + button joined together. Buttons are 26px wide (44px on mobile) with 13px muted-ink icons (16px on mobile); hover turns hover gray, the icon scales to 0.85 on press, and it is disabled at the limits (0.35).
- The value has `role="spinbutton"` and takes focus. Up/right arrows are +1, down/left −1, PageUp/PageDown move the capo by ±3 (string tuning ±12), Home/End go to the minimum and maximum. When focused, the frame gets an accent border and a 14% halo.
- The value text is 12px/700 tabular numbers (16px on mobile). The capo value is "none" or "N fret", 0–11.
- **Tuning preset select:** a starting point that fills all six strings at once. When per-string edits match no preset, a "Custom" item that cannot be selected is shown.

### Key Wheel (original key, target key) (Signature)
A radial menu drawn as the circle of fifths. Pressing a select-shaped trigger (`--ctl-h` on desktop, 48px/700 in the mobile bottom bar) opens a popover below it (above it in the mobile bottom bar).
- **Popover:** surface fill, 6px radius, the overlay shadow, 10px 12px 12px padding. The header line holds a title (12px/700) and a hint on the right (10.5px muted ink). It appears with a 160ms scale from 0.96 to 1, and the disc turns from −14° into place over 260ms (decelerating). Both are turned off under reduced motion.
- **Disc:** diameter `--wheel` (264px on desktop, 300px on mobile). C sits at 12 o'clock, then clockwise G D A E B F# Db Ab Eb Bb F. The outer ring (radius 68.5–100%) holds major keys, the inner ring (40–67.5%) the relative minors (Am, Em…). The pieces are cut with a percentage `clip-path: polygon()`, and the strong-hairline background shows through the gaps between them as dividers. The outer ring is the surface color, the inner ring the subtle surface.
- **Text:** major 13px/700, minor 11.5px/600 (15px/13px on mobile). Spelling is the same as the app's key names (Db, F#, Ebm…).
- **States:** the selected key is an accent fill with white text. Chords of the same key as the selected one (IV and V, and ii, iii, vi; for a minor key, relative to the relative major) get coral wash with coral ink. A key found automatically gets a 24% accent fill and coral ink mixed 30% toward body ink. Hover is hover gray. In the target-key wheel, rings that differ in mode from the original key are disabled (faint ink), and an "original" label (9.5px) sits under the original key's piece.
- **Center button:** a circle (31% inset), subtle surface with a strong-hairline ring. In the original-key wheel it is "Auto" (showing the found key below); in the target-key wheel it is "Back to original" (showing the current semitone count). Selected is coral wash, a 40% accent ring and coral ink.
- **Keyboard:** pieces are `role="radio"` and the disc is a `radiogroup`. Left and right arrows go around the circle, up goes to the outer ring, down to the inner ring, and down from the inner ring goes to the center button. Enter or Space selects, closes, and returns focus to the trigger. Esc and an outside click close it. The focus ring is 2px around the piece's text (white on the selected piece).

### Per-string tuning (edit mode)
- Per-string tuning is an occasional feature, so the controls appear only when the "Tune strings" toggle in the fretboard header is on (a ghost button; when on, coral wash plus coral ink, `aria-pressed`). When off, string names are read-only text, and only strings that differ from standard are shown in coral ink.
- Horizontal board (desktop): to the left of the string name, a 28×48px vertical control (subtle surface, strong-hairline inset ring, 4px). ▲/▼ are 28×24px each (the WCAG 2.5.8 minimum of 24px), with a hairline between. The string head width is `--string-head`: 72px off, 110px on, and the inlay row follows the same variable (no width animation).
- Vertical board (mobile): ▲, the string name and ▼ stack under the mute button (buttons 36px tall, full cell width). When off, the string head shrinks to 75px.
- When on, the string name is `role="spinbutton"`: arrows ±1, PageUp/PageDown ±12, Home/End the limits. Range MIDI 24–76. The string name is the open-string note without the capo added.

### Work history and persistence
- On the fretboard, every edit of the board, tuning, capo and progression list is one undo step (up to 50). The board header has undo and redo icon buttons (`title` shows ⌘Z / ⇧⌘Z), and the keyboard shortcuts ⌘Z / ⇧⌘Z work outside input fields.
- Actions that erase or replace work (clearing all strings, loading, adding or removing a progression item) leave a sentence and an "Undo" link in a status line under the board.
- In the transposer, replacing the whole source and changing the original key each get one step of undo/redo. Switching the original key to its relative major or minor keeps the semitone count so the result chords stay the same; switching to another key announces the changed semitone count in a sentence.
- Both screens save work to localStorage at once and restore it on the next visit, announcing "Restored your last session." once. Saved values are shape-checked and ignored if they do not match.

### Sheet editor (Signature)
A transparent textarea has a mirror in the same font layered behind it, which draws the in-place highlights. The caret is the accent, and the selection is the accent at 22%.
- **Chord token:** coral wash with coral ink and a 2px wash ring (700 on the result side).
- **Notation check:** danger wash, danger ink and a 1px danger wavy underline (5px offset).
- **Harmony check:** warning wash, warning ink and a warning wavy underline.
- **Info marker:** a 2px dashed accent underline.
- **Focus token:** a double ring of 2px surface and 2px accent.

### Warning list
- A list of rows inside a shadow-border card, with hairlines between rows. On desktop a 200px token column plus a description column (16px gap); on mobile one column (8px gap). Hover is hover gray, the active row is coral wash. The token column is Nanum Gothic Coding 13px (14px on mobile).

### Fretboard (Signature)
- **Board:** string lines are faint ink (3→1px to show gauge), fret lines are 2px strong hairline, and inlays are 7px strong-hairline dots. The nut is 6px body ink, or 8px accent when a capo is set.
- **Cell:** 48px on the horizontal board, 44px on the vertical (mobile). Hover gives a 7% accent fill and a ghost note name (a shadow-border label, 10.5px).
- **Note marker:** a 38px square (36px on mobile, 34px for open strings), 4px radius. Chord tones are coral wash with a 36% accent inset ring and coral ink; the root is an accent fill with white text. Note name 12px/800, interval 9.5px/600.
- **Mute:** a 30px button (44px on mobile). When muted: danger wash, danger ink and a 32% danger ring, and that string's line at 0.35 opacity.

### Candidate list
- The same 34px rows as select options (44px on mobile), 4px radius. The 16px radio is a 1.5px strong-hairline ring, and a 5px accent ring when selected. The selected row is coral wash. Chord name 12.5px/700, tag 10.5px, confidence 11px/600 tabular numbers.

### Progression card
- A shadow-border card split into a load area (minimum 48px, 56px on mobile) and a 36px delete cell (44px on mobile, with a left hairline). Delete hover is danger wash with danger ink. The number is a 17px badge.

### Chord form (progression → fingering)
- **Fingering diagram:** read like tab. Strings run horizontally, from the top e B G D A E (string names 10.5px muted ink), frets left to right. A five-fret window; starting at fret 1 puts a 4px body-ink nut on the left, otherwise only the starting fret number appears under the first cell. An open string is a 7px ring, a mute a 9px ×. Inside a 20px note dot (4px radius) sits the note name (9.5px/800), colored as on the fretboard: chord tones coral wash with a 36% ring and coral ink, the root an accent fill with white text. A barre is a vertical bar in the same wash. No line of chord tones or finger counts sits under the card.
- **Path:** cards (shadow border; when selected an accent ring plus a 14% halo) four across on desktop (two below 1180px, one on mobile), and in a 56px cell after each card only the hand movement to the next chord ("no move", "N frets up"). Fingering-code strings and a "my form" marker do not appear on the card.
- **Settings:** the note count (3–6), the minimum and maximum fret of the position (0–15) and the string range (1–6, 1 = high e) are joined steppers, with an "unlimited" toggle beside each range (ghost; when on, coral wash). When one end passes the other, it drags along. If the string range is narrower than the note count, a warning-ink caption appears.
- **Candidate list:** radio rows like the candidate rows, showing the fingering code (Nanum Gothic Coding 13px) and meta, with the movement relative to the previous chord on the right. A move of 4 frets or more is warning ink. Choosing one pins that chord (a "pinned" badge on the card) and the rest of the path is found again around it.
- **Capo suggestion:** the three easiest capo positions for the progression, under the selected chord's board. Each row reads capo position, the chords to finger, then open and barre counts; pressing a row replaces the progression text with those chords (undoable), and the row that matches the current text is disabled.

## Do's and Don'ts

### Do:
- **Do** use the core tokens with their names and values as they are.
- **Do** make new colors only with `color-mix(in srgb, …)` from existing tokens, and define them in the `:root` block.
- **Do** use coral (`accent` / `accent-soft` / `accent-text`) for chords and selection states, and `accent-text` for text.
- **Do** pair every warning color with a wavy underline or a badge border, so meaning is never carried by color alone.
- **Do** set control height through `--ctl-h`, and on mobile keep 44px targets and 16px input text.
- **Do** mark empty states and drop areas with a `border-strong` dashed outline on the subtle surface.
- **Do** check WCAG AA contrast for any new text color combination.

### Don't:
- **Don't** add a drop shadow to a panel or card. Use shadow borders only.
- **Don't** set the sheet in a proportional font or a fixed-width font whose Hangul width does not fit, and don't wrap it.
- **Don't** introduce a serif or a separate display font. Headings are SUIT too.
- **Don't** dress up meta text with capitals or wide tracking.
