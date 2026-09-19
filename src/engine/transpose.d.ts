export interface Key {
  tonic: number;
  minor: boolean;
}

export interface Estimate extends Key {
  confidence: number;
}

export type Policy = 'sharp' | 'flat' | 'context' | 'preserve';

export interface Segment {
  text: string;
  cls: string;
  tid: string;
}

export interface EngineWarning {
  id: string;
  tokenId: string;
  kind: 'grammar' | 'music';
  level: 'warn' | 'info';
  title: string;
  detail: string;
  fix: string;
  from: string;
  to: string;
  start: number;
  end: number;
  fixTo: string | null;
  action: 'context' | null;
}

export interface TransposeResult {
  src: Segment[][];
  out: Segment[][];
  text: string;
  warnings: EngineWarning[];
  estimate: Estimate | null;
  orig: Key | null;
  target: Key | null;
  chordCount: number;
  respelled: number;
  lineKinds: Array<'chords' | 'chordpro' | 'text'>;
}

export const MAJOR_NAMES: string[];
export const MINOR_NAMES: string[];
export const POLICIES: Array<{ id: Policy; label: string; hint: string }>;

export function mod12(n: number): number;
export function decodeEntities(s: string): { text: string; count: number };
export function keyName(k: Key): string;
export function keyUsesFlats(k: Key): boolean;
export function keyUsesSharps(k: Key): boolean;
export function nearestShift(from: number, to: number): number;
export function parseKeyId(id: string): Key | null;
export function transpose(text: string, opts: { shift: number; policy: Policy; origKey: Key | null }): TransposeResult;
