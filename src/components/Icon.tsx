const PATHS = {
  minus: <path d="M6 12h12" />,
  plus: <><path d="M12 6v12" /><path d="M6 12h12" /></>,
  close: <><path d="M7 7l10 10" /><path d="M17 7L7 17" /></>,
  arrowRight: <><path d="M4 12h16" /><path d="M14 6l6 6-6 6" /></>,
  tokenArrow: <><path d="M4 12h14" /><path d="M13 7l5 5-5 5" /></>,
  reuse: <><path d="M9 14l-5-5 5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" /></>,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  copy: <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></>,
  warnTriangle: <><path d="M12 4l9 16H3z" /><path d="M12 10v4" /><path d="M12 17h.01" /></>,
  undo: <><path d="M9 14l-5-5 5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" /></>,
  redo: <><path d="M15 14l5-5-5-5" /><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13" /></>,
  tune: <><path d="M5 6h14" /><path d="M5 12h14" /><path d="M5 18h14" /><circle cx="9" cy="6" r="1.6" /><circle cx="15" cy="12" r="1.6" /><circle cx="11" cy="18" r="1.6" /></>,
  chevUp: <path d="M6 15l6-6 6 6" />,
  chevDown: <path d="M6 9l6 6 6-6" />,
  chevLeft: <path d="M15 6l-6 6 6 6" />,
  chevRight: <path d="M9 6l6 6-6 6" />,
  pin: <g transform="rotate(45 12 12)"><path d="M9 4h6l-1 5.5 3 3V15H7v-2.5l3-3z" /><path d="M12 15v5" /></g>,
  warnCircle: <><circle cx="12" cy="12" r="9" /><path d="M12 7v6" /><path d="M12 16.5h.01" /></>,
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 18, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name]}
    </svg>
  );
}

export function Chevron({ className = 'chev' }: { className?: string }) {
  return (
    <svg className={className} width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 1.5l5 5 5-5" />
    </svg>
  );
}
