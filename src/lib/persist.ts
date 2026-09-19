import { useEffect } from 'react';

/**
 * Read a saved value. Storage can be missing, blocked or hold junk from an older build,
 * so every read is validated and falls back to null.
 */
export function loadSaved<T>(key: string, isValid: (v: unknown) => v is T): T | null {
  try {
    // keys were 'calypso.*' before the rename: the first read picks the old value up, the next save writes the new key
    const raw = window.localStorage.getItem(key) ?? window.localStorage.getItem(key.replace(/^altered\./, 'calypso.'));
    if (!raw) return null;
    const v: unknown = JSON.parse(raw);
    return isValid(v) ? v : null;
  } catch {
    return null;
  }
}

/** Save `value` whenever it changes. Writes are immediate so closing the tab never drops the last edit. */
export function useSaved(key: string, value: unknown): void {
  const json = JSON.stringify(value);
  useEffect(() => {
    try {
      window.localStorage.setItem(key, json);
    } catch {
      // storage full or blocked: the session keeps working, it just will not be restored
    }
  }, [key, json]);
}

export const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
export const isInt = (v: unknown, min: number, max: number): v is number => Number.isInteger(v) && (v as number) >= min && (v as number) <= max;
export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
