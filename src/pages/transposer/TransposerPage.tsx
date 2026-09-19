import { POLICIES, keyName } from '../../engine/transpose';
import { Chevron, Icon } from '../../components/Icon';
import { KeyField, KeyWheel } from '../../components/KeyWheel';
import { useI18n } from '../../i18n/I18nProvider';
import { MOBILE_QUERY, scrollIntoViewById, useMediaQuery } from '../../lib/dom';
import { ReviewSection } from './ReviewSection';
import { useTransposer, type SheetSpan } from './useTransposer';

type T = ReturnType<typeof useTransposer>;

function Lines({ lines }: { lines: SheetSpan[][] }) {
  return lines.map((segs, i) => (
    <span key={i} className="ln">
      {segs.map((x, j) => <span key={j} id={x.id || undefined} className={x.cls}>{x.text}</span>)}
    </span>
  ));
}

function OrigKey({ t }: { t: T }) {
  const { t: msg } = useI18n();
  const { s, r, actions } = t;
  return (
    <KeyField id="orig" labelId="orig-label" value={t.origTrigger} open={s.wheel === 'orig'} onToggle={() => actions.openWheel('orig')}>
      <KeyWheel id="orig" title={msg('transposer.orig.label')}
        selected={t.selectedOrig} guess={s.orig === 'auto' ? r.estimate : null}
        center={{
          label: msg('transposer.orig.auto'), sub: r.estimate ? keyName(r.estimate) : msg('transposer.orig.wheelHint'),
          selected: s.orig === 'auto', isRadio: true, onPick: () => actions.pickOrig('auto'),
        }}
        onPick={actions.pickOrig} onClose={actions.closeWheel} />
    </KeyField>
  );
}

function TargetKey({ t, up }: { t: T; up?: boolean }) {
  const { t: msg } = useI18n();
  const { s, r, actions } = t;
  return (
    <KeyField id="target" labelId="target-label" value={t.targetName} open={s.wheel === 'target'} disabled={!r.target}
      onToggle={() => actions.openWheel('target')}>
      <KeyWheel id="target" title={msg('transposer.target.label')} up={up}
        selected={r.target} origin={r.orig} lockMinor={r.orig ? r.orig.minor : null}
        center={{
          label: msg('transposer.target.backToOrig'),
          selected: s.shift === 0, isRadio: false, onPick: () => actions.setShift(0),
        }}
        onPick={actions.pickTarget} onClose={actions.closeWheel} />
    </KeyField>
  );
}

function ShiftField({ t }: { t: T }) {
  const { t: msg } = useI18n();
  const { s, actions } = t;
  return (
    <div className="field field--shift">
      <label htmlFor="shift" className="field-label">{msg('transposer.shift.label')}</label>
      <div className="shift-row">
        <button type="button" className="btn btn-secondary btn-icon" aria-label={msg('transposer.shift.down')} onClick={() => actions.bump(-1)} disabled={s.shift <= -11}>
          <Icon name="minus" size={20} />
        </button>
        <input id="shift" className="stepper-input" type="text" inputMode="numeric" autoComplete="off" role="spinbutton"
          aria-valuemin={-11} aria-valuemax={11} aria-valuenow={s.shift} aria-valuetext={t.shiftCaption} aria-describedby="shift-cap"
          value={t.shiftText}
          onChange={(e) => actions.onShiftInput(e.target.value)}
          onBlur={() => actions.patch({ shiftDraft: null })}
          onKeyDown={(e) => {
            const move = ({ ArrowUp: () => actions.bump(1), ArrowDown: () => actions.bump(-1), Home: () => actions.setShift(-11), End: () => actions.setShift(11) } as Record<string, () => void>)[e.key];
            if (move) { e.preventDefault(); move(); }
          }} />
        <button type="button" className="btn btn-secondary btn-icon" aria-label={msg('transposer.shift.up')} onClick={() => actions.bump(1)} disabled={s.shift >= 11}>
          <Icon name="plus" size={20} />
        </button>
        <button type="button" className="btn btn-ghost" style={{ height: 'var(--ctl-h)' }} onClick={() => actions.setShift(0)}>{msg('transposer.shift.reset')}</button>
      </div>
      {t.shiftCaption && <span id="shift-cap" className={'field-caption num' + (s.clamped ? ' is-warning' : '')}>{t.shiftCaption}</span>}
    </div>
  );
}

function PolicyField({ t }: { t: T }) {
  const { t: msg } = useI18n();
  return (
    <fieldset className="field field--fill">
      <legend>{msg('transposer.policy.label')}</legend>
      <div className="toggle-group">
        {POLICIES.map((p) => {
          const on = t.s.policy === p.id;
          return (
            <label key={p.id} className={'toggle' + (on ? ' is-on' : '')}>
              <input className="sr-only" type="radio" name="policy" checked={on} onChange={() => t.actions.patch({ policy: p.id })} />
              <span className="toggle-label">{p.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function CopyButton({ t }: { t: T }) {
  const { t: msg } = useI18n();
  const done = t.s.copy === 'ok';
  return (
    <button type="button" className="btn btn-primary" style={{ minWidth: 116 }} onClick={t.actions.copy} disabled={t.empty}>
      <Icon name={done ? 'check' : 'copy'} />
      <span aria-live="polite">{done ? msg('common.copied') : msg('transposer.copy')}</span>
    </button>
  );
}

function UndoAndNotice({ t, mobile }: { t: T; mobile: boolean }) {
  const { t: msg } = useI18n();
  const { s, actions } = t;
  return (
    <>
      {s.undo && (
        <span className="undo-bar" role="status">
          <span>{s.undo.message}</span>
          <button type="button" className="btn-link" onClick={actions.undo}>{t.undoLabel}</button>
          <button type="button" className="btn btn-ghost btn-icon" style={mobile ? undefined : { width: 32, height: 32 }} aria-label={msg('common.dismiss')}
            onClick={() => actions.patch({ undo: null })}>
            <Icon name="close" />
          </button>
        </span>
      )}
      {s.notice && <span role="status" className="notice"><Icon name="info" size={16} /><span>{s.notice}</span></span>}
    </>
  );
}

function Legend() {
  const { t: msg } = useI18n();
  return (
  <span aria-hidden="true" className="legend">
    <span className="legend-item"><span className="legend-dot legend-dot--chord" />{msg('transposer.legend.chord')}</span>
    <span className="legend-item"><span className="legend-dot legend-dot--grammar" />{msg('review.grammar.title')}</span>
    <span className="legend-item"><span className="legend-dot legend-dot--music" />{msg('review.music.title')}</span>
  </span>
  );
}

export function TransposerPage() {
  const { t: msg } = useI18n();
  const mobile = useMediaQuery(MOBILE_QUERY);
  const t = useTransposer(mobile);
  const { s, r, empty, actions } = t;
  const noChords = !empty && r.chordCount === 0;

  return (
    <>
      <section aria-label={msg('transposer.settings')} className="band">
        {mobile ? (
          <>
            <div className="field">
              <span id="orig-label" className="field-label">{msg('transposer.orig.label')}</span>
              <OrigKey t={t} />
              {t.origCaption && <span className={'field-caption num' + (t.lowConfidence ? ' is-warning' : '')}>{t.origCaption}</span>}
            </div>
            <ShiftField t={t} />
            <details className="settings">
              <summary>
                <strong>{msg('transposer.policy.label')}</strong>
                <span>{t.policyLabel}</span>
                <Chevron className="chev-s" />
              </summary>
              <div className="settings-body"><PolicyField t={t} /></div>
            </details>
          </>
        ) : (
          <>
            <div className="key-pair">
              <div className="field">
                <span id="orig-label" className="field-label">{msg('transposer.orig.label')}</span>
                <OrigKey t={t} />
                {t.origCaption && <span className={'field-caption num' + (t.lowConfidence ? ' is-warning' : '')}>{t.origCaption}</span>}
              </div>
              <div className="key-arrow" aria-hidden="true"><Icon name="arrowRight" /></div>
              <div className="field">
                <span id="target-label" className="field-label">{msg('transposer.target.label')}</span>
                <TargetKey t={t} />
                {t.targetCaption && <span className="field-caption">{t.targetCaption}</span>}
              </div>
            </div>
            <ShiftField t={t} />
            <PolicyField t={t} />
          </>
        )}
      </section>

      <main className="work">
        {mobile && (
          <div className="view-switch">
            <div className="toggle-group" role="tablist" aria-label={msg('transposer.view.label')}>
              {([['src', msg('transposer.src.title')], ['out', msg('transposer.out.title')]] as const).map(([v, label]) => (
                <button key={v} type="button" role="tab" id={`view-${v}`} aria-selected={s.view === v} aria-controls={`pane-${v}`}
                  className={'toggle sm' + (s.view === v ? ' is-on' : '')} onClick={() => actions.setView(v)}>
                  <span className="toggle-label">{label}</span>
                  <span className="toggle-hint">{v === 'src' ? msg('transposer.chordCount', { count: r.chordCount }) : t.targetName}</span>
                </button>
              ))}
            </div>
            <UndoAndNotice t={t} mobile />
          </div>
        )}
        <section className="pane" id="pane-src" hidden={mobile && s.view !== 'src'}
          role={mobile ? 'tabpanel' : undefined} aria-labelledby={mobile ? 'view-src' : undefined}>
          <div className="pane-head">
            <label htmlFor="src" className="heading pane-title">{msg('transposer.src.title')}</label>
            <button type="button" className="btn btn-ghost" style={{ marginLeft: 'auto' }} onClick={actions.clear} disabled={empty}>
              <Icon name="close" /><span>{msg('common.clear')}</span>
            </button>
          </div>
          <div className="pane-body">
            <div className="editor sheet">
              <div className="mirror" aria-hidden="true">
                <Lines lines={t.srcLines} />
                <span className="ln"><span className="tk"> </span></span>
              </div>
              <textarea id="src" wrap="off" spellCheck={false} autoComplete="off" aria-describedby={mobile ? undefined : 'keys'}
                placeholder={msg('transposer.src.placeholder')}
                value={s.text} onChange={(e) => actions.setText(e.target.value)} />
            </div>
          </div>
          <div className="pane-foot">
            {!mobile && <UndoAndNotice t={t} mobile={false} />}
            {mobile ? (
              <span className="foot-row">
                <button type="button" className="btn-link" onClick={() => { actions.setView('out'); scrollIntoViewById('pane-out', 'start'); }}>{msg('transposer.viewResult')}</button>
                <Legend />
              </span>
            ) : (
              <>
                <span id="keys" className="sr-only">{msg('transposer.shortcut.sr')}</span>
                <span aria-hidden="true" className="kbd-hint"><kbd>⌥</kbd><kbd>−</kbd><kbd>+</kbd> {msg('transposer.shortcut.hint')}</span>
                <Legend />
              </>
            )}
          </div>
        </section>

        <section className="pane" id="pane-out" aria-labelledby="out-title" hidden={mobile && s.view !== 'out'}>
          <div className="pane-head">
            <h2 id="out-title" className="heading pane-title">{msg('transposer.out.title')}</h2>
            <span className="sr-only" role="status" aria-live="polite">{t.liveSummary}</span>
            {!mobile && (
              <div className="pane-actions">
                <button type="button" className="btn btn-secondary" onClick={actions.reuse} disabled={empty}>
                  <Icon name="reuse" /><span>{msg('transposer.reuse')}</span>
                </button>
                <CopyButton t={t} />
              </div>
            )}
          </div>
          <div className="pane-body">
            {empty ? (
              <div className="empty-state">
                <h3 className="heading">{msg('transposer.empty.title')}</h3>
                <p>{mobile
                  ? msg('transposer.empty.bodyMobile')
                  : msg('transposer.empty.body')}</p>
              </div>
            ) : (
              <div id="out-sheet" tabIndex={-1} role="document" aria-label={msg('transposer.out.sheet')} className="sheet out out-body out-sheet">
                <Lines lines={t.outLines} />
              </div>
            )}
          </div>
          <div className="pane-foot pane-foot--result">
            {noChords && <span role="status" className="foot-status is-warning">{msg('transposer.noChords')}</span>}
            {!mobile && s.copy === 'fail' && (
              <span role="alert" className="foot-status is-danger">
                {msg('transposer.copyFail.desktop')}
                <button type="button" className="btn-link" onClick={actions.selectResult}>{msg('transposer.reselect')}</button>
              </span>
            )}
            {mobile && (
              <button type="button" className="btn btn-secondary" onClick={actions.reuse} disabled={empty}>
                <Icon name="reuse" /><span>{msg('transposer.reuse')}</span>
              </button>
            )}
          </div>
        </section>
      </main>

      <ReviewSection show={!empty && r.chordCount > 0} total={t.warnTotal}
        grammar={t.grammar} music={t.music} grammarCount={t.grammarCount} musicCount={t.musicCount}
        grammarInfo={t.grammarInfo} musicInfo={t.musicInfo} actions={actions.review} />

      {mobile && (
        <div className="bottom-bar">
          {s.copy === 'fail' && (
            <span role="alert">
              <span>{msg('transposer.copyFail.mobile')}</span>
              <button type="button" className="btn btn-secondary btn-sm" onClick={actions.selectResult}>{msg('transposer.selectAll')}</button>
            </span>
          )}
          <div className="row">
            <span className="target">
              <span id="target-label" className="target-label">{msg('transposer.target.label')}{t.targetCaption && ` · ${t.targetCaption}`}</span>
              <TargetKey t={t} up />
            </span>
            <CopyButton t={t} />
          </div>
        </div>
      )}
    </>
  );
}
