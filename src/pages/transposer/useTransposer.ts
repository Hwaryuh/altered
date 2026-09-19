import { useEffect, useMemo, useState } from 'react';
import {
  POLICIES, decodeEntities, keyName, nearestShift, parseKeyId, transpose,
  type EngineWarning, type Key, type Policy,
} from '../../engine/transpose';
import { useI18n } from '../../i18n/I18nProvider';
import { useClipboard } from '../../lib/clipboard';
import { focusById, scrollIntoViewById } from '../../lib/dom';
import { clamp, isInt, isRecord, loadSaved, useSaved } from '../../lib/persist';

interface Sheet {
  text: string;
  /** 'auto' or 'tonic:M|m' */
  orig: string;
  shift: number;
  policy: Policy;
}

interface Undo extends Sheet {
  message: string;
  /** what the button does next; text comes from the catalog */
  kind: 'undo' | 'redo';
}

interface State extends Sheet {
  notice: string;
  copy: '' | 'ok' | 'fail';
  hover: string | null;
  pinned: string | null;
  undo: Undo | null;
  shiftDraft: string | null;
  clamped: boolean;
  wheel: 'orig' | 'target' | null;
  /** mobile shows one pane at a time */
  view: 'src' | 'out';
}

export interface ReviewItem {
  id: string;
  kind: 'grammar' | 'music';
  isInfo: boolean;
  title: string;
  detail: string;
  fix: string;
  from: string;
  to: string;
  summary: boolean;
  active: boolean;
  pinned: boolean;
  applyLabel: string;
}

export interface SheetSpan {
  text: string;
  cls: string;
  id: string;
}

type Row = EngineWarning & { summary?: boolean; tokenIds?: string[] };

const keyId = (k: Key) => `${k.tonic}:${k.minor ? 'm' : 'M'}`;
const sameKey = (a: Key | null, b: Key | null) => !!a && !!b && a.tonic === b.tonic && a.minor === b.minor;
/** relative major/minor pairs share a key signature: Am ↔ C */
const isRelative = (a: Key, b: Key) => a.minor !== b.minor && (a.minor ? a.tonic + 3 : b.tonic + 3) % 12 === (a.minor ? b.tonic : a.tonic);

const SAVE_KEY = 'altered.transposer.v1';
const isSheet = (v: unknown): v is Sheet =>
  isRecord(v) && typeof v.text === 'string' && isInt(v.shift, -11, 11)
  && typeof v.orig === 'string' && (v.orig === 'auto' || /^(\d|1[01]):[Mm]$/.test(v.orig))
  && POLICIES.some((p) => p.id === v.policy);

export function useTransposer(mobile: boolean) {
  const { t } = useI18n();
  const [s, setS] = useState<State>(() => {
    const saved = loadSaved(SAVE_KEY, isSheet);
    const sheet: Sheet = saved ?? { text: t('transposer.sample'), orig: 'auto', shift: -2, policy: 'context' };
    return {
      ...sheet,
      notice: '', copy: '', hover: null, pinned: null, undo: null,
      shiftDraft: null, clamped: false, wheel: null, view: sheet.text.trim() ? 'out' : 'src',
    };
  });
  useSaved(SAVE_KEY, { text: s.text, orig: s.orig, shift: s.shift, policy: s.policy });
  const patch = (p: Partial<State>) => setS((prev) => ({ ...prev, ...p }));

  const r = useMemo(
    () => transpose(s.text, { shift: s.shift, policy: s.policy, origKey: parseKeyId(s.orig) }),
    [s.text, s.shift, s.policy, s.orig],
  );

  // policy conflicts collapse into one summary item
  const rows = useMemo<Row[]>(() => {
    const hits = r.warnings.filter((w) => w.action === 'context');
    const rest: Row[] = r.warnings.filter((w) => w.action !== 'context');
    if (hits.length && r.target) {
      const names = [...new Set(hits.map((w) => w.to))];
      const label = POLICIES.find((p) => p.id === s.policy)!.label;
      rest.unshift({
        ...hits[0], id: 'policy', kind: 'music', level: 'warn', summary: true, action: 'context',
        tokenIds: hits.map((w) => w.tokenId),
        title: t('transposer.policyMismatch.title'),
        detail: t(names.length > 4 ? 'transposer.policyMismatch.detailMore' : 'transposer.policyMismatch.detail', {
          label, key: keyName(r.target), count: hits.length, names: names.slice(0, 4).join(', '),
        }),
        fix: t('transposer.policyMismatch.fix'),
        from: names[0], to: names[0],
      });
    }
    return rest;
  }, [r, s.policy, t]);

  const activeId = s.hover ?? s.pinned;
  const activeRow = rows.find((w) => w.id === activeId);
  const focusToks = new Set(activeRow ? activeRow.tokenIds ?? [activeRow.tokenId] : []);

  // tokens whose only issue is the chosen spelling policy stay unmarked in the source
  const policyOnly = useMemo(() => {
    const m = new Map<string, boolean>();
    for (const w of r.warnings) if (w.action === 'context' && m.get(w.tokenId) !== false) m.set(w.tokenId, true);
    for (const w of r.warnings) if (w.action !== 'context') m.set(w.tokenId, false);
    return m;
  }, [r]);

  const toLines = (lines: typeof r.src, prefix: 's-' | 'o-'): SheetSpan[][] =>
    lines.map((segs) => {
      const blank = !segs.length || segs.every((x) => x.text === '');
      return (blank ? [{ text: ' ', cls: '', tid: '' }] : segs).map((x) => {
        let cls = x.cls;
        if (prefix === 's-' && policyOnly.get(x.tid)) cls = cls.replace(/ tk-warn-\w/, '');
        return { text: x.text, cls: `tk ${cls}${x.tid && focusToks.has(x.tid) ? ' is-focus' : ''}`, id: x.tid ? prefix + x.tid : '' };
      });
    });

  // ---- actions
  const setShift = (n: number) => {
    const v = Math.round(n) || 0;
    const c = clamp(v, -11, 11);
    patch({ shift: c, shiftDraft: null, clamped: c !== v });
  };
  const bump = (d: number) => setS((prev) => {
    const c = clamp(prev.shift + d, -11, 11);
    return { ...prev, shift: c, shiftDraft: null, clamped: c !== prev.shift + d };
  });

  const replaceSheet = (next: Partial<Sheet>, message: string, focusId = 'src') => {
    setS((prev) => ({
      ...prev,
      undo: { text: prev.text, orig: prev.orig, shift: prev.shift, policy: prev.policy, message, kind: 'undo' },
      hover: null, pinned: null, notice: '', copy: '', shiftDraft: null,
      ...(focusId === 'src' ? { view: 'src' as const } : {}),
      ...next,
    }));
    focusById(focusId);
  };

  const undo = () => setS((prev) => {
    const u = prev.undo;
    if (!u) return prev;
    // swap: the state we leave becomes the redo, so nothing typed since is lost
    const back: Undo = {
      text: prev.text, orig: prev.orig, shift: prev.shift, policy: prev.policy,
      message: u.kind === 'undo' ? t('common.undone') : t('common.redone'),
      kind: u.kind === 'undo' ? 'redo' : 'undo',
    };
    focusById('src');
    return { ...prev, text: u.text, orig: u.orig, shift: u.shift, policy: u.policy, undo: back, hover: null, pinned: null, notice: '', view: 'src' };
  });

  const selectResult = () => {
    const el = document.getElementById('out-sheet');
    const sel = window.getSelection();
    if (!el || !sel) return;
    el.focus({ preventScroll: true });
    sel.selectAllChildren(el);
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  };

  const copyTo = useClipboard((copy) => patch({ copy }));
  const copy = () => copyTo(r.text, selectResult); // fallback: select the result for a manual copy

  const pickOrig = (k: Key | 'auto') => {
    if (k === 'auto') {
      if (s.orig !== 'auto') replaceSheet({ orig: 'auto' }, t('transposer.notice.origAuto'), 'orig-trigger');
      return;
    }
    if (sameKey(k, r.orig)) return patch({ orig: keyId(k) });
    // relabelling to the relative key keeps every chord; only the key names move (Eb → Cm)
    if (r.orig && isRelative(k, r.orig)) {
      return replaceSheet({ orig: keyId(k) }, t('transposer.notice.origRelative', { key: keyName(k) }), 'orig-trigger');
    }
    // a different tonic keeps the chosen target tonic, which changes the result: make it undoable
    const shift = r.target ? nearestShift(k.tonic, r.target.tonic) : s.shift;
    replaceSheet({ orig: keyId(k), shift }, t('transposer.notice.origShifted', { key: keyName(k), shift: `${shift > 0 ? '+' : ''}${shift}` }), 'orig-trigger');
  };
  const pickTarget = (k: Key) => { if (r.orig) setShift(nearestShift(r.orig.tonic, k.tonic)); };

  const openWheel = (w: 'orig' | 'target') => patch({ wheel: s.wheel === w ? null : w });
  const closeWheel = (refocus: boolean) => {
    const w = s.wheel;
    patch({ wheel: null });
    if (refocus && w) focusById(`${w}-trigger`);
  };

  // ⌥− / ⌥+ nudge the shift from anywhere
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setS((prev) => (prev.pinned || prev.hover ? { ...prev, pinned: null, hover: null } : prev)); return; }
      if (!e.altKey) return;
      if (e.code === 'Minus' || e.code === 'NumpadSubtract') { e.preventDefault(); bump(-1); }
      else if (e.code === 'Equal' || e.code === 'NumpadAdd') { e.preventDefault(); bump(1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const rowById = new Map(rows.map((w) => [w.id, w]));
  const review = {
    jump: (id: string) => {
      const on = s.pinned !== id;
      patch({ pinned: on ? id : null });
      if (!on) return;
      const w = rowById.get(id)!;
      const first = (w.tokenIds ?? [w.tokenId])[0];
      if (mobile) {
        patch({ view: 'out' });
        setTimeout(() => scrollIntoViewById('o-' + first, 'center'), 0);
      }
      else { scrollIntoViewById('s-' + first); scrollIntoViewById('o-' + first); }
    },
    hover: (id: string | null) => setS((prev) => (id === null && prev.hover === null ? prev : { ...prev, hover: id })),
    apply: (id: string) => {
      const w = rowById.get(id)!;
      if (w.action === 'context') return replaceSheet({ policy: 'context' }, t('transposer.notice.policyAuto'), 'warn-title');
      if (!w.fixTo || s.text.slice(w.start, w.end) !== w.from) return;
      replaceSheet({ text: s.text.slice(0, w.start) + w.fixTo + s.text.slice(w.end) }, t('transposer.notice.fixed', { from: w.from, to: w.fixTo }), 'warn-title');
    },
  };

  const items: ReviewItem[] = rows.map((w) => ({
    id: w.id, kind: w.kind, isInfo: w.level === 'info', title: w.title, detail: w.detail, fix: w.fix,
    from: w.from, to: w.to, summary: !!w.summary, active: w.id === activeId, pinned: s.pinned === w.id,
    applyLabel: w.fixTo ? t('transposer.apply.fix', { to: w.fixTo }) : w.action === 'context' ? t('transposer.apply.auto') : '',
  }));

  // ---- derived text
  const empty = !s.text.trim();
  const respellNote = s.shift === 0 && r.respelled ? t('transposer.respelled', { count: r.respelled }) : '';
  const shiftCaption = respellNote;
  const lowConfidence = s.orig === 'auto' && !!r.estimate && r.estimate.confidence < 50;
  const targetName = r.target ? keyName(r.target) : '—';
  const grammar = items.filter((w) => w.kind === 'grammar');
  const music = items.filter((w) => w.kind === 'music');
  const real = (xs: ReviewItem[]) => xs.filter((x) => !x.isInfo).length;
  const info = (xs: ReviewItem[]) => xs.filter((x) => x.isInfo).length;
  const warnTotal = real(grammar) + real(music);
  const selectedOrig = parseKeyId(s.orig);

  return {
    s, r, empty, targetName, undoLabel: s.undo ? t(s.undo.kind === 'undo' ? 'common.undo' : 'common.redo') : '', warnTotal, grammar, music,
    srcLines: toLines(r.src, 's-'),
    outLines: toLines(r.out, 'o-'),
    grammarCount: real(grammar), musicCount: real(music),
    grammarInfo: info(grammar) ? t('transposer.info', { count: info(grammar) }) : '',
    musicInfo: info(music) ? t('transposer.info', { count: info(music) }) : '',
    lineCount: s.text ? s.text.split('\n').length : 0,
    lyricLines: r.lineKinds.filter((k, i) => k === 'text' && r.src[i].length && r.src[i][0].text.trim()).length,
    origTrigger: s.orig === 'auto' ? (r.estimate ? t('transposer.orig.autoKey', { key: keyName(r.estimate) }) : t('transposer.orig.autoFind')) : keyName(selectedOrig!),
    origCaption: s.orig === 'auto'
      ? r.estimate
        ? lowConfidence ? t('transposer.orig.lowConfidence', { percent: r.estimate.confidence }) : t('transposer.orig.estimated', { percent: r.estimate.confidence })
        : t('transposer.orig.needChords')
      : '',
    lowConfidence,
    selectedOrig,
    targetCaption: r.target ? '' : t('transposer.target.needOrig'),
    shiftText: s.shiftDraft ?? (s.shift > 0 ? `+${s.shift}` : String(s.shift)),
    shiftCaption: s.clamped ? t('transposer.shift.limit') : shiftCaption,
    shiftSigned: s.shift > 0 ? `+${s.shift}` : String(s.shift).replace('-', '−'),
    policyLabel: POLICIES.find((p) => p.id === s.policy)!.label,
    summary: empty ? t('transposer.summary.empty') : !r.chordCount ? t('transposer.summary.noChords')
      : t('transposer.summary.text', { route: r.orig ? `${keyName(r.orig)} → ${targetName}` : targetName, shift: shiftCaption ? ` · ${shiftCaption}` : '', count: r.chordCount }),
    liveSummary: empty ? t('transposer.live.empty') : t('transposer.live.done', { key: targetName, count: r.chordCount, warnings: warnTotal }),
    actions: {
      patch, setShift, bump, undo, copy, selectResult, pickOrig, pickTarget, openWheel, closeWheel, review,
      setText: (value: string) => {
        const d = decodeEntities(value);
        patch({ text: d.text, copy: '', notice: d.count ? t('transposer.notice.entities', { count: d.count }) : '' });
      },
      onShiftInput: (value: string) => {
        const v = value.replace('−', '-');
        if (/^[+-]?\d{1,2}$/.test(v)) setShift(parseInt(v, 10));
        else if (/^[+-]?$/.test(v)) patch({ shiftDraft: v });
      },
      clear: () => replaceSheet({ text: '' }, t('transposer.notice.cleared')),
      setView: (view: 'src' | 'out') => patch({ view }),
      reuse: () => replaceSheet({
        text: r.text, shift: 0,
        orig: s.orig === 'auto' || !r.target ? 'auto' : keyId(r.target),
      }, t('transposer.notice.reused')),
    },
  };
}
