# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack
TypeScript strict + React + Vite, deployed as a static site on GitHub Pages (PWA planned, see `.refs/chord-transposer-product-spec.md` §3). The transposer and fretboard analysis screens are built in `src/`, each as one responsive page; `design/` keeps the Claude Design canvases as reference.

## Users
One person: the owner, a guitarist who rearranges and plays chord charts. The job is to move a progression or chord-annotated lyric sheet to another key quickly and get playable guitar voicings for it.

## Product Purpose
A personal tool that links chord text ⇄ chord structure ⇄ pitches ⇄ guitar fingering ⇄ MIDI. Success means correct transposition that preserves the original sheet exactly, plus playable voicings and a capo suggestion.

## Positioning
Not a string-replace transposer: it reuses the owner's earlier chord engine and its analysis and fingering data, keeps pitch separate from spelling, and optimizes voicings across the whole progression.

## Capabilities and Constraints
- Local-first: all computation on device, no server, no account, works offline.
- Preserve whitespace, line breaks, bar lines, separators and lyrics; decode HTML entities before parsing.
- Sharp / flat / key-context / preserve-original spelling policies; original key → target key.
- Warnings split into grammar and music; warnings explain and suggest, never declare an error.
- Screens (§9): transposer, fretboard reverse analysis, the chord form screen (`#/forms`; progression → least-movement voicings, 3–6 sounding strings, fret region). All three are built. Capo is not its own screen: the chord form screen ranks capo positions 0–7 for the progression (open shapes first) and applies one on click. Roman/Nashville numerals are dropped until a real use shows up.

## Brand Commitments
- Design system: Altered's own dense workbench system, specified in `DESIGN.md`. Core tokens (neutral gray surfaces, ink, hairlines, warning/danger/success, soft 4/5/6px radii, shadow-border) are fixed; new colors are derived only with `color-mix`.
- One accent: coral `#ed6f63` (`oklch(0.690 0.158 27.4)`) for chords, selection and focus, on a warm dark `#2D2926` background. On-accent text is dark ink (the accent is light). Dark theme only.
- Type: SUIT Variable for all UI text, no serif. Chord sheets use Nanum Gothic Coding so Hangul stays exactly two Latin columns wide.
- Name "Altered" (renamed from the working name "Calypso"; the project folder keeps the old name).

## Evidence on Hand
- Spec: `.refs/chord-transposer-product-spec.md`, including the required regression cases (§12.4).
- Source assets: the reference sources kept under `.refs/`.
- No real song content is licensed for samples; sample lyrics are original placeholders.

## Accessibility & Inclusion
Korean UI. Keyboard-operable controls, 44px touch targets on mobile, WCAG AA text contrast.
