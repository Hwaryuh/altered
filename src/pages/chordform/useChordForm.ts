import { useMemo, useState, type KeyboardEvent } from 'react';
import { TUNINGS, noteName } from '../../engine/fretboard';
import { parseKeyId, transpose, type Policy } from '../../engine/transpose';
import { capoRanks, parseChord, voicePath, type Voicing } from '../../engine/voicing';
import { useI18n } from '../../i18n/I18nProvider';
import { translate } from '../../i18n/i18n';
import { KNOWN } from '../../lib/known';
import { useClipboard } from '../../lib/clipboard';
import { clamp, isInt, isRecord, loadSaved, useSaved } from '../../lib/persist';
import { stepKeys } from '../fretboard/useFretboard';

interface Pin {
  symbol: string;
  code: string;
}

interface Saved {
  text: string;
  /** sounding strings, 3–6 */
  notes: number;
  lo: number;
  hi: number;
  /** ignore lo/hi */
  free: boolean;
  /** string range, 1 = high e */
  sLo: number;
  sHi: number;
  /** ignore sLo/sHi */
  sFree: boolean;
  tuning: string;
  pins: Array<Pin | null>;
}

interface State extends Saved {
  sel: number;
  copy: '' | 'ok' | 'fail';
  notice: string;
  /** text before the last import, for one-step undo */
  before: string | null;
}

const SAVE_KEY = 'altered.chordform.v1';
const MAX_FRET = 15;
const DEFAULTS: Saved = { text: 'F G E7 Am', notes: 4, lo: 5, hi: 9, free: false, sLo: 1, sHi: 6, sFree: true, tuning: 'std', pins: [] };
const isPin = (v: unknown): v is Pin | null => v === null || (isRecord(v) && typeof v.symbol === 'string' && typeof v.code === 'string');
const isSaved = (v: unknown): v is Saved =>
  isRecord(v) && typeof v.text === 'string' && isInt(v.notes, 3, 6) && isInt(v.lo, 0, MAX_FRET) && isInt(v.hi, 0, MAX_FRET)
  && v.lo <= v.hi && typeof v.free === 'boolean' && typeof v.tuning === 'string' && Array.isArray(v.pins) && v.pins.every(isPin)
  // string range came later: older saves without it get the defaults
  && (v.sLo === undefined || (isInt(v.sLo, 1, 6) && isInt(v.sHi, 1, 6) && v.sLo <= v.sHi && typeof v.sFree === 'boolean'));

/** "F - G | E7, Am" → ['F', 'G', 'E7', 'Am']; a lone dash is a separator, not a chord */
export const splitProgression = (text: string) => text.split(/[\s|,]+/).filter((t) => t && !/^[-–—]+$/.test(t));

/** chords of the transposer's current result, read from its saved sheet */
function transposerChords(): string[] | null {
  try {
    const v: unknown = JSON.parse(window.localStorage.getItem('altered.transposer.v1') ?? window.localStorage.getItem('calypso.transposer.v1') ?? 'null');
    if (!isRecord(v) || typeof v.text !== 'string' || !isInt(v.shift, -11, 11) || typeof v.orig !== 'string' || typeof v.policy !== 'string') return null;
    const r = transpose(v.text, { shift: v.shift, policy: v.policy as Policy, origKey: parseKeyId(v.orig) });
    return r.out.flat().filter((seg) => seg.cls.startsWith('tk-chord')).map((seg) => seg.text);
  } catch {
    return null;
  }
}

const moveText = (d: number) => (d === 0 ? translate('chordform.move.none') : translate(d > 0 ? 'chordform.move.up' : 'chordform.move.down', { n: Math.abs(d) }));
const shapeMeta = (v: Voicing) => (v.barre ? translate('common.barre') : '');

export function useChordForm() {
  const { t } = useI18n();
  const [s, setS] = useState<State>(() => {
    const saved = loadSaved(SAVE_KEY, isSaved);
    return { ...DEFAULTS, ...saved, sel: 0, copy: '', notice: '', before: null };
  });
  useSaved(SAVE_KEY, { text: s.text, notes: s.notes, lo: s.lo, hi: s.hi, free: s.free, sLo: s.sLo, sHi: s.sHi, sFree: s.sFree, tuning: s.tuning, pins: s.pins });
  const patch = (p: Partial<State>) => setS((prev) => ({ ...prev, ...p }));

  const tuning = (TUNINGS.find((t) => t.id === s.tuning) ?? TUNINGS[0]).midi;
  const symbols = useMemo(() => splitProgression(s.text), [s.text]);
  const steps = useMemo(() => {
    // a pin only holds while the same chord sits in that slot
    const pins = symbols.map((sym, i) => (s.pins[i]?.symbol === sym ? s.pins[i]!.code : null));
    return voicePath(symbols, {
      notes: s.notes as 3 | 4 | 5 | 6, tuning, known: s.tuning === 'std' ? KNOWN : [], region: s.free ? null : [s.lo, s.hi],
      strings: s.sFree ? null : [s.sLo, s.sHi],
    }, pins);
  }, [symbols, s.notes, s.lo, s.hi, s.free, s.sLo, s.sHi, s.sFree, s.tuning, s.pins, tuning]);

  // where a capo makes the progression easiest: the chords to finger there, best three
  const capo = useMemo(() => capoRanks(symbols, { tuning, known: s.tuning === 'std' ? KNOWN : [] }).slice(0, 3).map((r) => ({
    key: r.capo, same: r.shapes.join(' ') === symbols.join(' '), label: r.capo ? t('common.capo', { n: r.capo }) : t('common.capoNone'), shapes: r.shapes.join(' '),
    note: [r.open && t('chordform.capo.open', { count: r.open }), r.barre && t('chordform.capo.barre', { count: r.barre })].filter(Boolean).join(' · ') || t('chordform.capo.plain'),
  })), [symbols, s.tuning, tuning, t]);

  const sel = Math.min(s.sel, Math.max(steps.length - 1, 0));
  // hand position of the nearest playable chord before step i
  const prevChoice = (i: number) => {
    for (let j = i - 1; j >= 0; j--) if (steps[j].choice) return steps[j].choice;
    return null;
  };

  const cards = steps.map((st, i) => {
    const v = st.choice;
    const parsed = parseChord(st.symbol);
    const next = steps.slice(i + 1).find((x) => x.choice)?.choice ?? null;
    return {
      key: i, no: i + 1, symbol: st.symbol, v, rootPc: parsed ? parsed.root : -1,
      unknown: !parsed, none: !!parsed && !v,
      pinned: s.pins[i]?.symbol === st.symbol,
      meta: v ? shapeMeta(v) : '',
      move: v && next ? moveText(next.pos - v.pos) : '',
      last: i === steps.length - 1,
      on: i === sel,
    };
  });

  const cur = steps[sel];
  const from = prevChoice(sel);
  const options = (cur?.options ?? []).map((v) => {
    const d = from ? v.pos - from.pos : 0;
    return {
      key: v.code, code: v.code, meta: shapeMeta(v),
      move: from ? moveText(d) : '', far: Math.abs(d) >= 4,
      on: !!cur?.choice && cur.choice.code === v.code,
    };
  });

  const copyText = steps.map((st) => `${st.symbol} ${st.choice ? st.choice.code : '?'}`).join('\n');

  const setRegion = (lo: number, hi: number) => patch({ lo: clamp(lo, 0, MAX_FRET), hi: clamp(hi, 0, MAX_FRET) });
  const setStrings = (a: number, b: number) => patch({ sLo: clamp(a, 1, 6), sHi: clamp(b, 1, 6) });

  const copyTo = useClipboard((copy) => patch({ copy }));
  const copy = () => copyTo(copyText);

  return {
    s, sel, cards, cur, options, tuning, copyText, capo,
    stringNames: tuning.map((m) => noteName(m)),
    count: symbols.length,
    // fewer strings than notes: the range cannot hold a voicing, so it only nudges
    narrow: !s.sFree && s.sHi - s.sLo + 1 < s.notes,
    curPinned: !!cur && s.pins[sel]?.symbol === cur.symbol,
    actions: {
      setText: (text: string) => patch({ text, notice: '', before: null }),
      setNotes: (n: number) => patch({ notes: clamp(n, 3, 6) }),
      notesKeys: (e: KeyboardEvent) => stepKeys(e, s.notes, 3, 6, (v) => patch({ notes: v }), 1),
      // moving one end past the other drags it along, so lo ≤ hi always holds
      setLo: (v: number) => setRegion(v, Math.max(v, s.hi)),
      setHi: (v: number) => setRegion(Math.min(v, s.lo), v),
      loKeys: (e: KeyboardEvent) => stepKeys(e, s.lo, 0, MAX_FRET, (v) => setRegion(v, Math.max(v, s.hi)), 3),
      hiKeys: (e: KeyboardEvent) => stepKeys(e, s.hi, 0, MAX_FRET, (v) => setRegion(Math.min(v, s.lo), v), 3),
      toggleFree: () => patch({ free: !s.free }),
      setSLo: (v: number) => setStrings(v, Math.max(v, s.sHi)),
      setSHi: (v: number) => setStrings(Math.min(v, s.sLo), v),
      sLoKeys: (e: KeyboardEvent) => stepKeys(e, s.sLo, 1, 6, (v) => setStrings(v, Math.max(v, s.sHi)), 1),
      sHiKeys: (e: KeyboardEvent) => stepKeys(e, s.sHi, 1, 6, (v) => setStrings(Math.min(v, s.sLo), v), 1),
      toggleSFree: () => patch({ sFree: !s.sFree }),
      setTuning: (tuning: string) => patch({ tuning }),
      select: (i: number) => patch({ sel: i }),
      step: (d: number) => patch({ sel: clamp(sel + d, 0, steps.length - 1) }),
      pick: (code: string) => {
        if (!cur) return;
        const pins = s.pins.slice();
        while (pins.length <= sel) pins.push(null);
        pins[sel] = { symbol: cur.symbol, code };
        patch({ pins });
      },
      unpin: () => patch({ pins: s.pins.map((p, i) => (i === sel ? null : p)) }),
      importTransposer: () => {
        const chords = transposerChords();
        if (!chords || !chords.length) return patch({ notice: t('chordform.notice.noTransposer') });
        patch({ before: s.text, text: chords.join(' '), pins: [], sel: 0, notice: t('chordform.notice.imported', { count: chords.length }) });
      },
      // finger the progression as the capo shapes; the sound stays, so the notice says so
      applyCapo: (capo: number, shapes: string) => patch({
        before: s.text, text: shapes, pins: [], sel: 0,
        notice: t('chordform.notice.capo', { capo, shapes }),
      }),
      undoImport: () => s.before !== null && patch({ text: s.before, before: null, pins: [], notice: t('chordform.notice.undone') }),
      copy,
    },
  };
}

