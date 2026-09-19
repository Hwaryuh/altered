import { useSyncExternalStore } from 'react';

/** Focus an element after React has committed the current update. */
export function focusById(id: string): void {
  setTimeout(() => document.getElementById(id)?.focus(), 0);
}

export function scrollIntoViewById(id: string, block: ScrollLogicalPosition = 'nearest'): void {
  document.getElementById(id)?.scrollIntoView({ block, inline: 'nearest', behavior: 'smooth' });
}

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
  );
}

export const MOBILE_QUERY = '(max-width: 719px)';

export function useHashRoute(): string {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener('hashchange', onChange);
      return () => window.removeEventListener('hashchange', onChange);
    },
    () => window.location.hash.replace(/^#/, '') || '/',
  );
}
