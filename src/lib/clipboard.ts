import { useEffect, useRef } from 'react';

/**
 * Clipboard copy with a self-clearing status. `set` gets 'ok' (auto-clears after 2.4s)
 * or 'fail' (stays, and runs `onFail` — e.g. select the text so a manual copy is one keystroke away).
 */
export function useClipboard(set: (v: '' | 'ok' | 'fail') => void) {
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (text: string, onFail?: () => void) => {
    const done = (v: 'ok' | 'fail') => {
      set(v);
      clearTimeout(timer.current);
      if (v === 'ok') timer.current = window.setTimeout(() => set(''), 2400);
      else onFail?.();
    };
    navigator.clipboard?.writeText(text).then(() => done('ok'), () => done('fail')) ?? done('fail');
  };
}
