import type { Frets } from './fretboard';

/** sounding strings: 3–4 on adjacent strings; 5–6 keep the root in the bass */
export type NoteMode = 3 | 4 | 5 | 6;

export interface ParsedChord {
  root: number;
  bass: number | null;
  quality: string;
  /** semitones above the root */
  intervals: number[];
}

export interface KnownShape {
  symbol: string;
  frets: Frets;
  /** cost taken off when the shape is used; 3 when omitted */
  bonus?: number;
}

export interface Voicing {
  frets: Frets;
  code: string;
  /** lower is easier */
  cost: number;
  /** lowest fretted fret, 1 when all open */
  pos: number;
  /** from the owner's shape table (possibly moved) */
  known: boolean;
  fingers: number;
  /** frets past the region, 0 when inside */
  out: number;
  /** sounding strings outside the preferred string range */
  off: number;
  barre: { fret: number; from: number; to: number } | null;
}

export interface VoicingOptions {
  notes?: NoteMode;
  tuning?: number[];
  known?: KnownShape[];
  /** preferred fret region [lo, hi]; soft, voicings outside only cost more */
  region?: [number, number] | null;
  /** string range [a, b], 1 = high e; kept whenever any voicing fits it */
  strings?: [number, number] | null;
}

export interface PathStep {
  symbol: string;
  /** up to 16, easiest first */
  options: Voicing[];
  /** null when the chord is unknown or has no playable voicing */
  choice: Voicing | null;
}

export const QUALITIES: Record<string, number[]>;
export function parseChord(symbol: string): ParsedChord | null;
export function parseShapes(text: string, bonus?: number): KnownShape[];
/** the chord d semitones up with its suffix kept, null when unreadable */
export function shiftChord(symbol: string, d: number): string | null;
export function voicings(symbol: string, opts?: VoicingOptions): Voicing[];
/** pins[i]: a voicing code that fixes step i */
export function voicePath(symbols: string[], opts?: VoicingOptions, pins?: Array<string | null | undefined>): PathStep[];

export interface CapoRank {
  capo: number;
  /** chord names to finger at this capo, in progression order */
  shapes: string[];
  choices: Array<Voicing | null>;
  /** lower is easier */
  score: number;
  /** chords fingered with open strings in the first three frets */
  open: number;
  barre: number;
}
/** capo 0..max (default 7), easiest first; opts.known and opts.tuning apply, region and strings do not */
export function capoRanks(symbols: string[], opts?: VoicingOptions, max?: number): CapoRank[];
