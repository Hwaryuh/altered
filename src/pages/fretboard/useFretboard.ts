import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import {
  TUNE_MAX, TUNE_MIN, TUNINGS, analyzeShape, describeCandidate, noteName, pitchName, presetIdOf, shapeCode, stringName,
  type Frets,
} from '../../engine/fretboard';
import { mod12 } from '../../engine/transpose';
import { voicings } from '../../engine/voicing';
import { KNOWN } from '../../lib/known';
import { useI18n } from '../../i18n/I18nProvider';
import { useClipboard } from '../../lib/clipboard';
import { focusById, scrollIntoViewById } from '../../lib/dom';
import { clamp, isInt, isRecord, loadSaved, useSaved } from '../../lib/persist';

interface Shape {
  frets: Frets;
  tuning: number[];
  capo: number;
}

interface ProgItem extends Shape {
  id: string;
  symbol: string;
  code: string;
}

/** everything undo/redo restores */
interface Work extends Shape {
  progression: ProgItem[];
}

interface Saved extends Work {
  lefty: boolean;
  seq: number;
}

interface State extends Saved {
  pick: number;
  focus: { s: number; f: number };
  past: Work[];
  future: Work[];
  /** status line for actions that remove work */
  message: string;
  /** the message reports an undo or redo */
  undone: boolean;
  copy: '' | 'ok' | 'fail';
  tuningMode: boolean;
}

const HISTORY = 50;
const SAVE_KEY = 'altered.fretboard.v1';
const isFrets = (v: unknown): v is Frets => Array.isArray(v) && v.length === 6 && v.every((f) => f === null || isInt(f, 0, 24));
const isTuning = (v: unknown): v is number[] => Array.isArray(v) && v.length === 6 && v.every((m) => isInt(m, TUNE_MIN, TUNE_MAX));
const isShape = (v: unknown): v is Shape => isRecord(v) && isFrets(v.frets) && isTuning(v.tuning) && isInt(v.capo, 0, 11);
const isSaved = (v: unknown): v is Saved =>
  isShape(v) && isRecord(v) && typeof v.lefty === 'boolean' && isInt(v.seq, 1, 1e9) && Array.isArray(v.progression)
  && v.progression.every((p) => isShape(p) && isRecord(p) && typeof p.id === 'string' && typeof p.symbol === 'string' && typeof p.code === 'string');
const workOf = (s: Work): Work => ({ frets: s.frets, tuning: s.tuning, capo: s.capo, progression: s.progression });

const INLAYS = [3, 5, 7, 9, 15, 17, 19, 21];
const WARN_CAT = { play: 'fretboard.cat.play', music: 'fretboard.cat.music', shape: 'fretboard.cat.shape' } as const;

/** Arrow/Page/Home/End handling shared by the capo and string-tuning spinbuttons. */
export function stepKeys(e: KeyboardEvent, value: number, min: number, max: number, set: (v: number) => void, big: number) {
  let d = ({ ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: big, PageDown: -big } as Record<string, number>)[e.key];
  if (e.key === 'Home') d = min - value;
  else if (e.key === 'End') d = max - value;
  if (d === undefined) return;
  e.preventDefault();
  const v = clamp(value + d, min, max);
  if (v !== value) set(v);
}

export function useFretboard(vertical: boolean) {
  const { t } = useI18n();
  const fretCount = vertical ? 12 : 15;
  const [s, setS] = useState<State>(() => {
    const saved = loadSaved(SAVE_KEY, isSaved);
    return {
      ...(saved ?? { frets: [null, 3, 2, 0, 1, 0], tuning: TUNINGS[0].midi.slice(), capo: 0, lefty: false, progression: [], seq: 1 }),
      pick: 0, focus: { s: 1, f: 3 }, past: [], future: [], copy: '', tuningMode: false,
      message: '', undone: false,
    };
  });
  useSaved(SAVE_KEY, { frets: s.frets, tuning: s.tuning, capo: s.capo, lefty: s.lefty, progression: s.progression, seq: s.seq });

  // every edit of the board, tuning, capo or progression is one undo step
  const change = (patch: Partial<State>, message = '') =>
    setS((prev) => ({
      ...prev,
      past: [...prev.past, workOf(prev)].slice(-HISTORY),
      future: [],
      message, undone: false, pick: 0, copy: '',
      ...patch,
    }));
  const patch = (p: Partial<State>) => setS((prev) => ({ ...prev, ...p }));
  const step = (dir: 'undo' | 'redo') => setS((prev) => {
    const from = dir === 'undo' ? prev.past : prev.future;
    if (!from.length) return prev;
    const target = from[from.length - 1];
    const rest = from.slice(0, -1);
    const here = workOf(prev);
    return {
      ...prev, ...target, pick: 0, copy: '',
      past: dir === 'undo' ? rest : [...prev.past, here],
      future: dir === 'undo' ? [...prev.future, here] : rest,
      message: dir === 'undo' ? t('common.undone') : t('common.redone'), undone: dir === 'undo',
    };
  });

  // ⌘Z / ⇧⌘Z (Ctrl on other systems)
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'z') return;
      if (e.target instanceof Element && e.target.closest('input, textarea, select')) return;
      e.preventDefault();
      step(e.shiftKey ? 'redo' : 'undo');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const an = analyzeShape(s.frets, s.tuning, s.capo);
  const pick = Math.min(s.pick, Math.max(0, an.candidates.length - 1));
  const cand = an.candidates[pick] ?? null;
  const desc = cand ? describeCandidate(an, cand) : { labels: {} as Record<number, string>, missing: [], extra: [], warns: an.play.warns };
  const rootPc = cand ? cand.rootPc : null;
  const code = shapeCode(s.frets);

  // other ways to finger the shown chord with as many strings, for the ‹ › form buttons
  const strCount = s.frets.filter((f) => f !== null).length;
  const forms = useMemo(() => {
    if (!cand || strCount < 3) return [];
    const sounding = s.tuning.map((m) => m + s.capo);
    const known = s.capo === 0 && s.tuning.join() === TUNINGS[0].midi.join() ? KNOWN : [];
    return voicings(cand.symbol, { notes: strCount as 3 | 4 | 5 | 6, tuning: sounding, known })
      .filter((v) => v.frets.every((f) => f === null || f <= fretCount));
  }, [cand?.symbol, strCount, s.tuning, s.capo, fretCount]);
  const formAt = forms.findIndex((v) => v.code === code);

  // horizontal board lists strings top→bottom (high e first), vertical board left→right
  const order = vertical && !s.lefty ? [0, 1, 2, 3, 4, 5] : [5, 4, 3, 2, 1, 0];
  const frets = Array.from({ length: fretCount }, (_, i) => i + 1);

  const arrows: Record<string, [number, number]> = vertical
    ? { ArrowLeft: [s.lefty ? 1 : -1, 0], ArrowRight: [s.lefty ? -1 : 1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }
    : { ArrowUp: [1, 0], ArrowDown: [-1, 0], ArrowLeft: [0, s.lefty ? 1 : -1], ArrowRight: [0, s.lefty ? -1 : 1] };

  const moveFocus = (ds: number, df: number) => {
    const next = { s: clamp(s.focus.s + ds, 0, 5), f: clamp(s.focus.f + df, 0, fretCount) };
    patch({ focus: next });
    focusById(`cell-${next.s}-${next.f}`);
  };

  const setFret = (str: number, f: number) => {
    const fr = s.frets.slice();
    // tapping a pressed fret lets the string ring open; tapping a pressed open string mutes it
    fr[str] = fr[str] === f ? (f === 0 ? null : 0) : f;
    change({ frets: fr, focus: { s: str, f } });
  };

  const setString = (str: number, value: number | null) => {
    const fr = s.frets.slice();
    fr[str] = value;
    change({ frets: fr });
  };

  const focusFret = Math.min(s.focus.f, fretCount);
  const cell = (str: number, f: number) => {
    const pc = mod12(s.tuning[str] + s.capo + f);
    const on = s.frets[str] === f;
    const iv = on ? desc.labels[pc] ?? '' : '';
    return {
      id: `cell-${str}-${f}`,
      note: noteName(pc),
      iv,
      on,
      tab: s.focus.s === str && focusFret === f ? 0 : -1,
      aria: t(on ? 'fretboard.cell.pressed' : 'fretboard.cell.plain', { string: stringName(str), pos: f === 0 ? t('common.open') : t('common.fret', { n: f }), note: noteName(pc), iv }),
      cls: `cell g${str}${f === 0 ? ' cell-open' : ''}${on ? (pc === rootPc ? ' is-root' : ' is-on') : ''}${s.frets[str] === null ? ' is-muted-string' : ''}`,
      click: () => setFret(str, f),
      keys: (e: KeyboardEvent) => {
        const mv = arrows[e.key];
        if (mv) { e.preventDefault(); moveFocus(mv[0], mv[1]); }
        else if (['x', 'X', 'Delete', 'Backspace'].includes(e.key)) { e.preventDefault(); setString(str, null); }
        else if (e.key === 'Home') { e.preventDefault(); moveFocus(0, -fretCount); }
      },
    };
  };
  type Cell = ReturnType<typeof cell>;

  const tune = (str: number) => {
    const midi = s.tuning[str];
    const p = pitchName(midi);
    const set = (v: number) => {
      const t = s.tuning.slice();
      t[str] = clamp(v, TUNE_MIN, TUNE_MAX);
      change({ tuning: t });
    };
    return {
      midi, note: p.note, oct: p.oct, valueText: p.note + p.oct,
      changed: midi !== TUNINGS[0].midi[str],
      name: stringName(str),
      dec: () => set(midi - 1),
      inc: () => set(midi + 1),
      keys: (e: KeyboardEvent) => stepKeys(e, midi, TUNE_MIN, TUNE_MAX, set, 12),
    };
  };

  const strings = order.map((str) => {
    const fret = s.frets[str];
    return {
      key: str,
      tune: tune(str),
      muted: fret === null,
      muteLabel: fret === null ? 'X' : fret === 0 ? 'O' : String(fret),
      muteAria: fret === null ? t('fretboard.mute.aria', { string: stringName(str) }) : t('fretboard.mute.ariaNow', { string: stringName(str), pos: fret === 0 ? t('common.openString') : t('common.fret', { n: fret }) }),
      toggleMute: () => setString(str, fret === null ? 0 : null),
      open: cell(str, 0),
      cells: frets.map((f) => cell(str, f)),
    };
  });
  const fretMarks = [0, ...frets].map((f) => ({
    n: f,
    dot: f > 0 && INLAYS.includes(f + s.capo),
    double: f > 0 && (f + s.capo) % 12 === 0,
    // vertical board: one row per fret, cells in string order
    cells: order.map((str) => cell(str, f)) as Cell[],
  }));

  const warns = desc.warns.map((w, i) => ({ key: i, title: w.title, detail: w.detail, cat: t(WARN_CAT[w.cat] ?? 'fretboard.cat.music'), kind: w.cat || 'music' }));
  const rival = an.candidates[pick === 0 ? 1 : 0];
  const tie = !!cand && !!rival && Math.abs(cand.confidence - rival.confidence) < 10;
  const bare = s.capo && cand ? analyzeShape(s.frets, s.tuning, 0).candidates[0] : null;
  const progText = s.progression.map((p) => p.symbol).join(' - ');

  const pickFor = (p: ProgItem) => {
    const i = analyzeShape(p.frets, p.tuning, p.capo).candidates.findIndex((c) => c.symbol === p.symbol);
    return Math.max(0, i);
  };

  const copyTo = useClipboard((copy) => patch({ copy }));
  const copy = () => copyTo(progText, () => {
    const el = document.getElementById('prog-text');
    if (el) window.getSelection()?.selectAllChildren(el);
  });

  return {
    s, an, cand, code, fretCount, forms: { count: forms.length, at: formAt + 1 }, strings, fretMarks, warns, tie, rival, progText,
    presetId: presetIdOf(s.tuning),
    capoText: s.capo ? t('common.fret', { n: s.capo }) : t('common.none'),
    shapeName: bare ? t('fretboard.shapeName', { capo: s.capo, symbol: bare.symbol }) : '',
    confLow: !!cand && cand.confidence < 50,
    tones: an.pcs.map((pc) => ({ pc, note: noteName(pc), iv: desc.labels[pc] ?? '', root: pc === rootPc, bass: pc === an.bassPc })),
    missing: desc.missing.length ? desc.missing.join(', ') : t('common.none'),
    extra: desc.extra.length ? desc.extra.join(', ') : t('common.none'),
    candidates: an.candidates.map((c, i) => {
      const n = describeCandidate(an, c).warns.length;
      const tags = [c.slash && t('fretboard.tag.slash'), c.rootless && t('fretboard.tag.rootless'), n && t('fretboard.tag.issues', { count: n })].filter(Boolean).join(' · ');
      return { key: i, symbol: c.symbol, conf: `${c.confidence}%`, tags, on: i === pick };
    }),
    liveSummary: cand
      ? t('fretboard.live.base', { symbol: cand.symbol, percent: cand.confidence, tail: warns.length ? t('fretboard.live.warns', { list: warns.map((w) => w.title).join(', ') }) : t('fretboard.live.clean') })
      : t('fretboard.live.none'),
    actions: {
      patch,
      pickCandidate: (i: number) => patch({ pick: i }),
      cycleForm: (dir: 1 | -1) => {
        if (!forms.length || !cand) return;
        const i = formAt < 0 ? (dir > 0 ? 0 : forms.length - 1) : (formAt + dir + forms.length) % forms.length;
        const frets = forms[i].frets;
        change({ frets }, '');
        // the new fingering can rank its chord names differently: stay on the one being browsed
        patch({ pick: Math.max(0, analyzeShape(frets, s.tuning, s.capo).candidates.findIndex((c) => c.symbol === cand.symbol)) });
      },
      setTuningPreset: (id: string) => {
        const t = TUNINGS.find((x) => x.id === id);
        if (t) change({ tuning: t.midi.slice() });
      },
      setCapo: (v: number) => change({ capo: clamp(v, 0, 11) }),
      capoKeys: (e: KeyboardEvent) => stepKeys(e, s.capo, 0, 11, (v) => change({ capo: v }), 3),
      clearAll: () => change({ frets: [null, null, null, null, null, null] }, t('fretboard.notice.cleared')),
      undo: () => step('undo'),
      redo: () => step('redo'),
      toggleTuningMode: () => patch({ tuningMode: !s.tuningMode }),
      jumpWarns: () => { scrollIntoViewById('warn-head'); focusById('warn-head'); },
      addToProgression: () => {
        if (!cand) return;
        const item: ProgItem = { id: `p${s.seq}`, symbol: cand.symbol, code, frets: s.frets, tuning: s.tuning, capo: s.capo };
        change({ progression: [...s.progression, item], seq: s.seq + 1 }, t('fretboard.notice.added', { symbol: cand.symbol, no: s.progression.length + 1 }));
      },
      loadProg: (p: ProgItem) => {
        change({ frets: p.frets, tuning: p.tuning, capo: p.capo }, t('fretboard.notice.loaded', { symbol: p.symbol }));
        patch({ pick: pickFor(p) });
      },
      removeProg: (p: ProgItem) => change({ progression: s.progression.filter((x) => x.id !== p.id) }, t('fretboard.notice.removed', { symbol: p.symbol })),
      copy,
    },
  };
}
