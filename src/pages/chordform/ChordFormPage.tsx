import { TUNINGS, noteName, type Frets } from '../../engine/fretboard';
import { mod12 } from '../../engine/transpose';
import { Chevron, Icon } from '../../components/Icon';
import { useI18n } from '../../i18n/I18nProvider';
import { MOBILE_QUERY, useMediaQuery } from '../../lib/dom';
import type { Voicing } from '../../engine/voicing';
import { useChordForm } from './useChordForm';

type F = ReturnType<typeof useChordForm>;
type Card = F['cards'][number];

const STRINGS = [5, 4, 3, 2, 1, 0]; // high e on top, as in tab

/** Small chord chart read like tab: strings across (e on top), frets left to right. */
function Diagram({ v, rootPc, tuning, names }: { v: Voicing; rootPc: number; tuning: number[]; names: string[] }) {
  const { frets, barre } = v;
  const fretted = frets.filter((f): f is number => f !== null && f > 0);
  const base = Math.max(...fretted, 1) <= 5 ? 1 : v.pos;
  const y = (s: number) => 10 + (5 - s) * 20;
  const x = (f: number) => 30 + (f - base + 0.5) * 34;
  return (
    <span className="cf-dia" aria-hidden="true">
      {STRINGS.map((s) => <i key={'s' + s} className="cf-str" style={{ top: y(s), height: s < 3 ? 1.5 : 1 }} />)}
      {[0, 1, 2, 3, 4, 5].map((k) => <i key={'f' + k} className="cf-fret" style={{ left: 30 + k * 34 }} />)}
      {base === 1 ? <i className="cf-nut" /> : <i className="cf-base num">{base}</i>}
      {STRINGS.map((s) => <i key={'n' + s} className="cf-name" style={{ top: y(s) - 6 }}>{names[s]}</i>)}
      {frets.map((f, s) => (f === 0 ? <i key={'o' + s} className="cf-open" style={{ top: y(s) - 3 }} />
        : f === null ? <i key={'x' + s} className="cf-mute" style={{ top: y(s) - 4 }}><Icon name="close" size={9} /></i> : null))}
      {barre && <i className="cf-barre" style={{ left: x(barre.fret) - 10, top: y(barre.to) - 10, height: y(barre.from) - y(barre.to) + 20 }} />}
      {frets.map((f, s) => (f !== null && f > 0 ? (
        <i key={'d' + s} className={'cf-dot' + (mod12(tuning[s] + f) === rootPc ? ' root' : '')} style={{ left: x(f) - 10, top: y(s) - 10 }}>
          {noteName(tuning[s] + f)}
        </i>
      ) : null))}
    </span>
  );
}

/** The selected voicing on a wider board with note names on the dots. */
function Board({ frets, rootPc, tuning, names }: { frets: Frets; rootPc: number; tuning: number[]; names: string[] }) {
  const fretted = frets.filter((f): f is number => f !== null && f > 0);
  const lo = fretted.length ? Math.min(...fretted) : 1;
  const base = lo <= 2 ? 1 : lo;
  const y = (s: number) => 18 + (5 - s) * 26;
  const x = (f: number) => (f === 0 ? 70 : 88 + (f - base + 0.5) * 96);
  return (
    <div className="cf-board" aria-hidden="true">
      {base === 1 && <i className="cf-board-nut" />}
      {[0, 1, 2, 3, 4, 5].map((k) => <i key={'f' + k} className="cf-board-fret" style={{ left: 88 + k * 96 }} />)}
      {STRINGS.map((s) => <i key={'s' + s} className="cf-board-str" style={{ top: y(s) + 3, height: s < 3 ? 2 : 1 }} />)}
      {STRINGS.map((s) => <i key={'n' + s} className="cf-board-name" style={{ top: y(s) - 5 }}>{names[s]}</i>)}
      {[0, 1, 2, 3, 4].map((k) => <i key={'k' + k} className="cf-board-num num" style={{ left: 88 + (k + 0.5) * 96 - 20 }}>{base + k}</i>)}
      {frets.map((f, s) => (f === null ? null : (
        <i key={'d' + s} className={'cf-board-dot' + (mod12(tuning[s] + f) === rootPc ? ' root' : '')} style={{ left: x(f) - 15, top: y(s) - 12 }}>
          {noteName(tuning[s] + f)}
        </i>
      )))}
    </div>
  );
}

function Stepper({ label, value, min, max, set, keys, disabled }: {
  label: string; value: number; min: number; max: number; set: (v: number) => void; keys: F['actions']['notesKeys']; disabled?: boolean;
}) {
  const { t: msg } = useI18n();
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button type="button" className="stepper-btn" aria-label={msg('chordform.step.down', { label })} onClick={() => set(value - 1)} disabled={disabled || value <= min}>
        <Icon name="minus" size={14} />
      </button>
      <span className="stepper-value cf-stepper-value" role="spinbutton" tabIndex={disabled ? -1 : 0} aria-label={label} aria-disabled={disabled || undefined}
        aria-valuemin={min} aria-valuemax={max} aria-valuenow={value} onKeyDown={disabled ? undefined : keys}>
        {value}
      </span>
      <button type="button" className="stepper-btn" aria-label={msg('chordform.step.up', { label })} onClick={() => set(value + 1)} disabled={disabled || value >= max}>
        <Icon name="plus" size={14} />
      </button>
    </div>
  );
}

function Settings({ f, mobile }: { f: F; mobile: boolean }) {
  const { t: msg } = useI18n();
  const { s, actions } = f;
  const tuning = (
    <div className="field cf-tuning">
      <label htmlFor="cf-tuning" className="field-label">{msg('chordform.tuning')}</label>
      <span className="select-wrap">
        <select id="cf-tuning" className="select" style={{ width: '100%' }} value={s.tuning} onChange={(e) => actions.setTuning(e.target.value)}>
          {TUNINGS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        <Chevron />
      </span>
    </div>
  );
  const conds = (
    <>
      <div className="field">
        <span className="field-label" id="cf-notes-label">{msg('chordform.notes')}</span>
        <Stepper label={msg('chordform.notes')} value={s.notes} min={3} max={6} set={actions.setNotes} keys={actions.notesKeys} />
      </div>
      <div className="field">
        <span className="field-label">{msg('chordform.position')}</span>
        <div className="cf-region">
          <Stepper label={msg('chordform.minFret')} value={s.lo} min={0} max={15} set={actions.setLo} keys={actions.loKeys} disabled={s.free} />
          <span className="cf-dash" aria-hidden="true">–</span>
          <Stepper label={msg('chordform.maxFret')} value={s.hi} min={0} max={15} set={actions.setHi} keys={actions.hiKeys} disabled={s.free} />
          <button type="button" className={'btn btn-ghost cf-free' + (s.free ? ' is-on' : '')} aria-pressed={s.free} onClick={actions.toggleFree}>{msg('chordform.allFrets')}</button>
        </div>
      </div>
      <div className="field">
        <span className="field-label">{msg('chordform.strings')}</span>
        <div className="cf-region">
          <Stepper label={msg('chordform.startString')} value={s.sLo} min={1} max={6} set={actions.setSLo} keys={actions.sLoKeys} disabled={s.sFree} />
          <span className="cf-dash" aria-hidden="true">–</span>
          <Stepper label={msg('chordform.endString')} value={s.sHi} min={1} max={6} set={actions.setSHi} keys={actions.sHiKeys} disabled={s.sFree} />
          <button type="button" className={'btn btn-ghost cf-free' + (s.sFree ? ' is-on' : '')} aria-pressed={s.sFree} onClick={actions.toggleSFree}>{msg('chordform.allStrings')}</button>
        </div>
        {f.narrow && <span className="field-caption is-warning">{msg('chordform.narrow', { strings: s.sHi - s.sLo + 1, notes: s.notes })}</span>}
      </div>
    </>
  );
  return (
    <section className="band cf-band" aria-label={msg('chordform.settings.aria')}>
      <div className="field cf-prog">
        <label htmlFor="cf-text" className="field-label">{msg('chordform.progression')}</label>
        <div className="cf-prog-row">
          <input id="cf-text" className="code-input cf-input" value={s.text} spellCheck={false} autoComplete="off"
            onChange={(e) => actions.setText(e.target.value)} />
        </div>
        {s.notice ? (
          <span className="field-caption cf-notice" role="status">
            {s.notice}
            {s.before !== null && <button type="button" className="btn-link" onClick={actions.undoImport}>{msg('common.undo')}</button>}
          </span>
        ) : <span className="field-caption">{msg('chordform.hint')}</span>}
      </div>
      {mobile ? (
        <details className="cf-more">
          <summary>
            <span className="cf-more-title">{msg('chordform.conditions')}</span>
            <span className="field-caption">{msg('chordform.summary', { notes: s.notes, frets: s.free ? msg('chordform.allFrets') : msg('chordform.range.frets', { lo: s.lo, hi: s.hi }), strings: s.sFree ? msg('chordform.allStrings') : msg('chordform.range.strings', { lo: s.sLo, hi: s.sHi }) })}</span>
            <Chevron />
          </summary>
          <div className="cf-more-body">{conds}</div>
        </details>
      ) : conds}
      {mobile ? (
        <details className="cf-more">
          <summary><span className="cf-more-title">{msg('chordform.tuning')}</span><span className="field-caption">{(TUNINGS.find((t) => t.id === s.tuning) ?? TUNINGS[0]).label}</span><Chevron /></summary>
          {tuning}
        </details>
      ) : tuning}
    </section>
  );
}

function ChordCard({ c, f }: { c: Card; f: F }) {
  const { t: msg } = useI18n();
  return (
    <button type="button" className={'cf-card' + (c.on ? ' is-on' : '')} aria-pressed={c.on}
      aria-label={[msg('chordform.card.aria', { no: c.no, symbol: c.symbol }), c.v?.code, c.pinned && msg('chordform.card.pinned')].filter(Boolean).join(' ')} onClick={() => f.actions.select(c.key)}>
      <span className="cf-card-head">
        <span className="cf-no num">{c.no}</span>
        <span className="cf-sym">{c.symbol}</span>
        {c.pinned && <Icon name="pin" size={20} className="cf-pin" />}
      </span>
      {c.v ? (
        <>
          <Diagram v={c.v} rootPc={c.rootPc} tuning={f.tuning} names={f.stringNames} />
        </>
      ) : (
        <span className="cf-card-empty">{c.unknown ? msg('chordform.card.unknown') : msg('chordform.card.none')}</span>
      )}
    </button>
  );
}

function Path({ f, mobile }: { f: F; mobile: boolean }) {
  const { t: msg } = useI18n();
  return (
    <section className="pane cf-path" aria-labelledby="cf-path-title">
      <div className="cf-head">
        <h2 id="cf-path-title" className="heading pane-title">{msg('chordform.path.title')}</h2>
        <span className="pane-meta" />
      </div>
      <ol className="cf-strip">
        {f.cards.map((c) => (
          <li key={c.key} className="cf-cell">
            <ChordCard c={c} f={f} />
            <span className="cf-conn" aria-hidden={!c.move}>
              {c.move && <><Icon name={mobile ? 'chevDown' : 'arrowRight'} size={16} /><b>{c.move}</b></>}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Capo({ f }: { f: F }) {
  const { t: msg } = useI18n();
  if (!f.capo.length) return null;
  return (
    <section className="pane cf-capo" aria-labelledby="cf-capo-title">
      <div className="cf-head">
        <h2 id="cf-capo-title" className="heading pane-title">{msg('chordform.capo.title')}</h2>
        <span className="pane-meta">{msg('chordform.capo.hint')}</span>
      </div>
      <ol className="cf-capo-list">
        {f.capo.map((c, i) => (
          <li key={c.key}>
            <button type="button" className={'cf-capo-row' + (i === 0 ? ' is-best' : '')} disabled={c.same}
              aria-label={msg(c.same ? 'chordform.capo.aria.same' : 'chordform.capo.aria.apply', { label: c.label, shapes: c.shapes, note: c.note })}
              onClick={() => f.actions.applyCapo(c.key, c.shapes)}>
              <b className="cf-capo-pos">{c.label}</b>
              <span className="code-font cf-capo-shapes">{c.shapes}</span>
              <span className="cf-meta num">{c.note}</span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Detail({ f }: { f: F }) {
  const { t: msg } = useI18n();
  const { cur, sel } = f;
  const card = f.cards[sel];
  const shown = !!cur && !!card?.v;
  return (
    <div className="cf-detail">
      {shown && <>
      <section className="pane cf-big" aria-labelledby="cf-big-title">
        <div className="cf-head">
          <h2 id="cf-big-title" className="heading pane-title cf-accent">{cur!.symbol}</h2>
          <span className="pane-meta num">{card!.meta}</span>
        </div>
        <div className="cf-board-wrap"><Board frets={card!.v!.frets} rootPc={card!.rootPc} tuning={f.tuning} names={f.stringNames} /></div>
      </section>
      <section className="pane cf-alts" aria-labelledby="cf-alts-title">
        <div className="cf-head">
          <h2 id="cf-alts-title" className="heading pane-title">{msg('chordform.alts.title', { symbol: cur!.symbol, count: f.options.length })}</h2>
          {f.curPinned && <button type="button" className="btn-link cf-unpin" onClick={f.actions.unpin}>{msg('chordform.unpin')}</button>}
        </div>
        <div className="cf-alt-list" role="radiogroup" aria-labelledby="cf-alts-title">
          {f.options.map((o) => (
            <label key={o.key} className={'cf-alt' + (o.on ? ' is-on' : '')}>
              <input className="sr-only" type="radio" name="cf-alt" checked={o.on} onChange={() => f.actions.pick(o.code)} />
              {o.on && f.curPinned ? <Icon name="pin" size={20} className="cf-pin" /> : <span className="cf-radio" aria-hidden="true" />}
              <span className="cf-alt-main">
                <span className="code-font cf-code">{o.code}</span>
                <span className="cf-meta num">{o.meta}</span>
              </span>
              <span className={'cf-move num' + (o.far ? ' is-far' : '')}>{o.move}</span>
            </label>
          ))}
        </div>
      </section>
      </>}
      <Capo f={f} />
    </div>
  );
}

export function ChordFormPage() {
  const { t: msg } = useI18n();
  const mobile = useMediaQuery(MOBILE_QUERY);
  const f = useChordForm();
  const { cur } = f;
  return (
    <>
      <Settings f={f} mobile={mobile} />
      <main className="cf-work">
        {f.cards.length ? (
          <>
            <Path f={f} mobile={mobile} />
            <Detail f={f} />
          </>
        ) : (
          <p className="empty-note">{msg('chordform.empty')}</p>
        )}
      </main>
      {mobile && f.cards.length > 0 && (
        <div className="bottom-bar cf-bar">
          <button type="button" className="btn btn-secondary btn-icon" aria-label={msg('chordform.prevChord')} onClick={() => f.actions.step(-1)} disabled={f.sel === 0}>
            <Icon name="chevUp" />
          </button>
          <span className="cf-bar-now">
            <strong className="cf-sym">{cur?.symbol}</strong>
            <span className="cf-meta num">{f.sel + 1} / {f.cards.length}{cur?.choice ? ` · ${cur.choice.code}` : ''}</span>
          </span>
          <button type="button" className="btn btn-secondary btn-icon" aria-label={msg('chordform.nextChord')} onClick={() => f.actions.step(1)} disabled={f.sel >= f.cards.length - 1}>
            <Icon name="chevDown" />
          </button>
        </div>
      )}
    </>
  );
}
