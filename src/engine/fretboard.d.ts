/** frets per string, low E (index 0) to high e; null = muted, 0 = open; relative to the capo */
export type Frets = Array<number | null>;

export interface Tuning {
  id: string;
  /** "표준", "Drop D": without the notes */
  name: string;
  /** "표준: E A D G B E" */
  label: string;
  /** MIDI note per string, low to high */
  midi: number[];
}

export interface Candidate {
  symbol: string;
  rootPc: number;
  slash: boolean;
  rootless: boolean;
  intervals: string[];
  score: number;
  confidence: number;
}

export interface Playability {
  warns: FretWarning[];
  fingers: number;
  barre: { fret: number; from: number; to: number } | null;
  span: number;
}

export interface ShapeAnalysis {
  played: Array<{ string: number; fret: number; midi: number; pc: number }>;
  /** distinct pitch classes, lowest first */
  pcs: number[];
  bassPc?: number;
  candidates: Candidate[];
  play: Playability;
  tooFew: boolean;
}

export interface FretWarning {
  cat: 'play' | 'music' | 'shape';
  title: string;
  detail: string;
}

export interface CandidateDetail {
  labels: Record<number, string>;
  missing: string[];
  extra: string[];
  warns: FretWarning[];
}

export const TUNINGS: Tuning[];
/** "6번 줄" for index 0 (low E) up to "1번 줄" */
export function stringName(i: number): string;
export const TUNE_MIN: number;
export const TUNE_MAX: number;

export function noteName(pc: number): string;
export function shapeCode(frets: Frets): string;
export function playability(frets: Frets): Playability;
export function analyzeShape(frets: Frets, tuningMidi: number[], capo: number): ShapeAnalysis;
export function describeCandidate(an: ShapeAnalysis, c: Candidate): CandidateDetail;
export function presetIdOf(midi: number[]): string;
export function pitchName(midi: number): { note: string; oct: string };
