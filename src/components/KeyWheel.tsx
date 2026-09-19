import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { MAJOR_NAMES, MINOR_NAMES, keyName, mod12, type Key } from '../engine/transpose';
import { Chevron } from './Icon';
import { useI18n } from '../i18n/I18nProvider';
import { focusById } from '../lib/dom';

// Circle of fifths, clockwise from C at 12 o'clock.
const FIFTHS = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5];
type Ring = 'maj' | 'min';
const RINGS: Record<Ring, [number, number]> = { maj: [0.685, 1], min: [0.4, 0.675] };

const point = (r: number, a: number) =>
  `${(50 + 50 * r * Math.sin(a)).toFixed(2)}% ${(50 - 50 * r * Math.cos(a)).toFixed(2)}%`;

// clip-path polygons in percent, so the wheel scales with --wheel
const GEOM = Object.fromEntries(
  (Object.keys(RINGS) as Ring[]).map((ring) => {
    const [r0, r1] = RINGS[ring];
    const mid = (r0 + r1) / 2;
    return [ring, FIFTHS.map((_, i) => {
      const a0 = ((i * 30 - 15 + 0.8) * Math.PI) / 180;
      const a1 = ((i * 30 + 15 - 0.8) * Math.PI) / 180;
      const arc = (r: number) => Array.from({ length: 9 }, (_, k) => point(r, a0 + ((a1 - a0) * k) / 8));
      const am = (i * 30 * Math.PI) / 180;
      return {
        clipPath: `polygon(${[...arc(r1), ...arc(r0).reverse()].join(', ')})`,
        left: `${(50 + 50 * mid * Math.sin(am)).toFixed(2)}%`,
        top: `${(50 - 50 * mid * Math.cos(am)).toFixed(2)}%`,
      };
    })];
  }),
) as Record<Ring, { clipPath: string; left: string; top: string }[]>;

/** Diatonic neighbours on the wheel: IV, V and ii, iii, vi around the relative major. */
function family(k: Key): Record<Ring, number[]> {
  const c = FIFTHS.indexOf(k.minor ? mod12(k.tonic + 3) : k.tonic);
  const near = [mod12(c - 1), c, mod12(c + 1)];
  const sides = [mod12(c - 1), mod12(c + 1)];
  return k.minor ? { maj: near, min: sides } : { maj: sides, min: near };
}

const sameKey = (a: Key | null, tonic: number, minor: boolean) => !!a && a.tonic === tonic && a.minor === minor;

export interface KeyWheelProps {
  id: 'orig' | 'target';
  title: string;
  up?: boolean;
  selected: Key | null;
  /** auto-detected key, shown when nothing is selected */
  guess?: Key | null;
  /** marks the original key with a small caption */
  origin?: Key | null;
  /** restrict picking to one ring (true = minor only) */
  lockMinor?: boolean | null;
  center: { label: string; sub?: string; selected: boolean; isRadio: boolean; onPick: () => void };
  onPick: (key: Key) => void;
  onClose: (refocus: boolean) => void;
}

export function KeyWheel({ id, title, up, selected, guess = null, origin = null, lockMinor = null, center, onPick, onClose }: KeyWheelProps) {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.querySelector<HTMLElement>('[tabindex="0"]')?.focus();
  }, []);

  const fam = selected ?? guess;
  const famIdx = fam ? family(fam) : null;

  const nav = (e: KeyboardEvent, ring: Ring, i: number) => {
    const step = ({ ArrowRight: 1, ArrowLeft: -1 } as Record<string, number>)[e.key];
    const toRing = ({ ArrowUp: 'maj', ArrowDown: 'min' } as Record<string, Ring>)[e.key];
    if (step === undefined && !toRing) return;
    e.preventDefault();
    if (toRing === 'min' && ring === 'min') return focusById(`${id}-center`);
    const r2 = toRing ?? ring;
    if (lockMinor !== null && (r2 === 'min') !== lockMinor) return;
    focusById(`${id}-${r2}-${mod12(i + (step ?? 0))}`);
  };

  const segments: ReactNode[] = [];
  for (const ring of ['maj', 'min'] as Ring[]) {
    const minor = ring === 'min';
    FIFTHS.forEach((majPc, i) => {
      const tonic = minor ? mod12(majPc + 9) : majPc;
      const on = sameKey(selected, tonic, minor);
      const isGuess = !selected && sameKey(guess, tonic, minor);
      const isOrigin = sameKey(origin, tonic, minor);
      const inFam = !on && !isGuess && !!famIdx?.[ring].includes(i);
      const g = GEOM[ring][i];
      const key = { tonic, minor };
      segments.push(
        <button key={ring + i} type="button" id={`${id}-${ring}-${i}`} role="radio" aria-checked={on}
          className={`seg seg-${ring}${on ? ' is-selected' : isGuess ? ' is-guess' : inFam ? ' is-family' : ''}`}
          style={{ clipPath: g.clipPath }}
          aria-label={keyName(key) + (isGuess ? `, ${t('keywheel.guess')}` : '') + (isOrigin ? `, ${t('transposer.orig.label')}` : '')}
          tabIndex={on ? 0 : -1}
          disabled={lockMinor !== null && lockMinor !== minor}
          onClick={() => { onPick(key); onClose(true); }}
          onKeyDown={(e) => nav(e, ring, i)}>
          <span className="seg-label" style={{ left: g.left, top: g.top }}>
            {minor ? MINOR_NAMES[tonic] + 'm' : MAJOR_NAMES[tonic]}
            {isOrigin && !on && <small>{t('keywheel.origin')}</small>}
          </span>
        </button>,
      );
    });
  }

  const centerKeys = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    focusById(`${id}-${lockMinor === false ? 'maj' : 'min'}-0`);
  };

  return (
    <>
      <button type="button" className="wheel-scrim" tabIndex={-1} aria-hidden="true" onClick={() => onClose(false)} />
      <div ref={ref} className={'wheel-pop' + (up ? ' wheel-pop--up' : '')} role="dialog" aria-label={t('keywheel.pick', { title })}
        onKeyDown={(e) => {
          if (e.key !== 'Escape') return;
          e.preventDefault();
          e.stopPropagation();
          onClose(true);
        }}>
        <div className="wheel-head"><strong>{title}</strong></div>
        <div className="wheel" role="radiogroup" aria-label={t('keywheel.circle', { title })}>
          <span className="wheel-ring" aria-hidden="true" />
          {segments}
          <button type="button" id={`${id}-center`} className={'wheel-center' + (center.selected ? ' is-selected' : '')}
            role={center.isRadio ? 'radio' : undefined}
            aria-checked={center.isRadio ? center.selected : undefined}
            aria-pressed={center.isRadio ? undefined : center.selected}
            tabIndex={center.isRadio && selected ? -1 : 0}
            onClick={() => { center.onPick(); onClose(true); }}
            onKeyDown={centerKeys}>
            <strong>{center.label}</strong>{center.sub && <span>{center.sub}</span>}
          </button>
        </div>
      </div>
    </>
  );
}

/** Select-looking trigger that opens a KeyWheel below (or above) itself. */
export function KeyField({ id, labelId, value, open, disabled, onToggle, children }: {
  id: 'orig' | 'target';
  labelId: string;
  value: string;
  open: boolean;
  disabled?: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="select-wrap key-field">
      <button type="button" id={`${id}-trigger`} className="select key-trigger" style={{ width: '100%' }}
        aria-haspopup="dialog" aria-expanded={open} aria-labelledby={`${labelId} ${id}-trigger`}
        disabled={disabled} onClick={onToggle}>
        {value}
      </button>
      <Chevron />
      {open && children}
    </div>
  );
}
