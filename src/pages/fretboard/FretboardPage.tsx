import { TUNINGS } from '../../engine/fretboard';
import { Chevron, Icon } from '../../components/Icon';
import { useI18n } from '../../i18n/I18nProvider';
import { MOBILE_QUERY, useMediaQuery } from '../../lib/dom';
import { useFretboard } from './useFretboard';

type F = ReturnType<typeof useFretboard>;
type Str = F['strings'][number];
type Cell = Str['cells'][number];

function Dot({ c }: { c: Cell }) {
  return (
    <span className="dot" aria-hidden="true">
      <span className="dot-note">{c.note}</span>
      <span className="dot-iv">{c.iv}</span>
    </span>
  );
}

function CellButton({ c, ghost }: { c: Cell; ghost: boolean }) {
  return (
    <button type="button" id={c.id} className={c.cls} tabIndex={c.tab} aria-pressed={c.on} aria-label={c.aria}
      onClick={c.click} onKeyDown={c.keys}>
      {c.on ? <Dot c={c} /> : ghost && <span className="ghost" aria-hidden="true">{c.note}</span>}
    </button>
  );
}

function StringNote({ t, editable }: { t: Str['tune']; editable: boolean }) {
  const { t: msg } = useI18n();
  const cls = 'stepper-value string-note' + (t.changed ? ' is-changed' : '');
  if (!editable) {
    return <span className={cls} aria-label={`${t.name} ${t.valueText}`}>{t.note}<span className="oct">{t.oct}</span></span>;
  }
  return (
    <span className={cls} role="spinbutton" tabIndex={0}
      aria-label={msg('fretboard.tune.aria', { string: t.name })} aria-valuemin={24} aria-valuemax={76} aria-valuenow={t.midi} aria-valuetext={t.valueText}
      onKeyDown={t.keys}>
      {t.note}<span className="oct">{t.oct}</span>
    </span>
  );
}

function TuneButton({ t, dir }: { t: Str['tune']; dir: 'inc' | 'dec' }) {
  const { t: msg } = useI18n();
  const inc = dir === 'inc';
  return (
    <button type="button" className="stepper-btn" aria-label={msg(inc ? 'fretboard.tune.up' : 'fretboard.tune.down', { string: t.name })}
      onClick={inc ? t.inc : t.dec} disabled={inc ? t.midi >= 76 : t.midi <= 24}>
      <Icon name={inc ? 'chevUp' : 'chevDown'} size={12} />
    </button>
  );
}

function MuteButton({ str }: { str: Str }) {
  return (
    <button type="button" className={'mute' + (str.muted ? ' is-muted' : '')} aria-pressed={str.muted} aria-label={str.muteAria}
      onClick={str.toggleMute}>
      {str.muteLabel}
    </button>
  );
}

function HorizontalBoard({ f }: { f: F }) {
  const { t: msg } = useI18n();
  const { s } = f;
  return (
    <div className={'board hboard' + (s.lefty ? ' is-lefty' : '') + (s.capo ? ' has-capo' : '') + (s.tuningMode ? ' is-tuning' : '')} role="group"
      aria-label={msg('fretboard.board.aria')}>
      <div className="hrow hrow--head" aria-hidden="true">
        <span className="string-head string-head--board" />
        <span className="fret-head fret-head--open">{s.capo ? msg('common.capo', { n: s.capo }) : msg('common.open')}</span>
        {f.fretMarks.slice(1).map((m) => <span key={m.n} className="fret-head">{m.n}</span>)}
      </div>
      {f.strings.map((str) => (
        <div key={str.key} className="hrow">
          <span className="string-head string-head--board">
            <span className="note-tune">
              {s.tuningMode && <TuneButton t={str.tune} dir="inc" />}
              <StringNote t={str.tune} editable={s.tuningMode} />
              {s.tuningMode && <TuneButton t={str.tune} dir="dec" />}
            </span>
            <MuteButton str={str} />
          </span>
          <CellButton c={str.open} ghost />
          {str.cells.map((c) => <CellButton key={c.id} c={c} ghost />)}
        </div>
      ))}
      <div className="hrow hrow--inlay" aria-hidden="true">
        <span className="inlay-spacer" />
        {f.fretMarks.slice(1).map((m) => (
          <span key={m.n} className="inlay">{m.dot && <i />}{m.double && <><i /><i /></>}</span>
        ))}
      </div>
    </div>
  );
}

function VerticalBoard({ f }: { f: F }) {
  const { t: msg } = useI18n();
  const { s } = f;
  return (
    <div className={'board vboard' + (s.lefty ? ' is-lefty' : '') + (s.capo ? ' has-capo' : '')} role="group"
      aria-label={msg('fretboard.board.ariaTouch')}>
      <div className="vhead">
        <span className="vnum">{s.capo ? msg('common.capo', { n: s.capo }) : ''}</span>
        {f.strings.map((str) => (
          <span key={str.key} className="vhead-cell">
            <MuteButton str={str} />
            <span className="note-tune">
              {s.tuningMode && <TuneButton t={str.tune} dir="inc" />}
              <StringNote t={str.tune} editable={s.tuningMode} />
              {s.tuningMode && <TuneButton t={str.tune} dir="dec" />}
            </span>
          </span>
        ))}
      </div>
      {f.fretMarks.map((m) => (
        <div key={m.n} className={'vrow' + (m.n === 0 ? ' vrow-open' : '')}>
          <span className="vnum" aria-hidden="true">
            {m.n || ''}
            {m.dot && <i />}
            {m.double && <span style={{ display: 'flex', gap: 3 }}><i /><i /></span>}
          </span>
          {m.cells.map((c) => <CellButton key={c.id} c={c} ghost={false} />)}
        </div>
      ))}
    </div>
  );
}

function Settings({ f, mobile }: { f: F; mobile: boolean }) {
  const { t: msg } = useI18n();
  const fields = <SettingsFields f={f} />;
  if (!mobile) return <section aria-label={msg('fretboard.settings')} className="band">{fields}</section>;
  const preset = TUNINGS.find((t) => t.id === f.presetId);
  return (
    <section aria-label={msg('fretboard.settings')} className="band settings-grid">
      <details className="settings">
        <summary>
          <strong>{msg('fretboard.settings')}</strong>
          <span>{[preset ? preset.name : msg('fretboard.tuning.custom'), f.s.capo ? msg('common.capo', { n: f.s.capo }) : msg('common.capoNone')].join(' · ')}</span>
          <Chevron className="chev-s" />
        </summary>
        <div className="settings-body settings-stack">{fields}</div>
      </details>
    </section>
  );
}

function SettingsFields({ f }: { f: F }) {
  const { t: msg } = useI18n();
  const { s, actions } = f;
  return (
    <>
      <div className="field field--tuning">
        <label htmlFor="tuning" className="field-label">{msg('fretboard.tuning.label')}</label>
        <span className="select-wrap">
          <select id="tuning" className="select" style={{ width: '100%' }}
            value={f.presetId} onChange={(e) => actions.setTuningPreset(e.target.value)}>
            <option value="custom" disabled>{msg('fretboard.tuning.custom')}</option>
            {TUNINGS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          <Chevron />
        </span>
      </div>
      <div className="field field--capo">
        <span id="capo-label" className="field-label">{msg('fretboard.capo.label')}</span>
        <div className="stepper">
          <button type="button" className="stepper-btn" aria-label={msg('fretboard.capo.down')} onClick={() => actions.setCapo(s.capo - 1)} disabled={s.capo <= 0}>
            <Icon name="minus" size={14} />
          </button>
          <span className="stepper-value capo-value" role="spinbutton" tabIndex={0} aria-labelledby="capo-label"
            aria-valuemin={0} aria-valuemax={11} aria-valuenow={s.capo} aria-valuetext={f.capoText} onKeyDown={actions.capoKeys}>
            {f.capoText}
          </span>
          <button type="button" className="stepper-btn" aria-label={msg('fretboard.capo.up')} onClick={() => actions.setCapo(s.capo + 1)} disabled={s.capo >= 11}>
            <Icon name="plus" size={14} />
          </button>
        </div>
      </div>
      {/* 지판 방향은 당분간 숨김 (삭제 아님) */}
      {false && <fieldset className="field field--fill">
        <legend>{msg('fretboard.hand.label')}</legend>
        <div className="toggle-group">
          {([false, true] as const).map((lefty) => (
            <label key={String(lefty)} className={'toggle sm' + (s.lefty === lefty ? ' is-on' : '')}>
              <input className="sr-only" type="radio" name="hand" checked={s.lefty === lefty} onChange={() => actions.patch({ lefty })} />
              <span className="toggle-label">{lefty ? msg('fretboard.hand.left') : msg('fretboard.hand.right')}</span>
            </label>
          ))}
        </div>
      </fieldset>}
    </>
  );
}

/** ‹ 폼 2 / 13 ›: other fingerings of the shown chord; on mobile it lives in the bottom bar, next to the board */
function FormNav({ f, className = '' }: { f: F; className?: string }) {
  const { t: msg } = useI18n();
  if (f.forms.count < 2) return null;
  return (
    <div className={'form-nav ' + className}>
      <button type="button" className="btn btn-secondary btn-icon" aria-label={msg('fretboard.form.prev')} onClick={() => f.actions.cycleForm(-1)}><Icon name="chevLeft" /></button>
      <span className="form-nav-text num" role="status">{f.forms.at ? msg('fretboard.form.at', { at: f.forms.at, count: f.forms.count }) : msg('fretboard.form.count', { count: f.forms.count })}</span>
      <button type="button" className="btn btn-secondary btn-icon" aria-label={msg('fretboard.form.next')} onClick={() => f.actions.cycleForm(1)}><Icon name="chevRight" /></button>
    </div>
  );
}

function Analysis({ f }: { f: F }) {
  const { t: msg } = useI18n();
  const { cand, actions } = f;
  if (!cand) {
    const one = f.an.played.length > 0;
    return (
      <div className="analysis-empty">
        <h2 id="chord-title" className="heading pane-title">{one ? msg('fretboard.empty.one') : msg('fretboard.empty.none')}</h2>
        <p>{one ? msg('fretboard.empty.oneBody') : msg('fretboard.empty.noneBody')}</p>
      </div>
    );
  }
  return (
    <>
      <div className="chord-head">
        <h2 id="chord-title" className="chord-symbol">{cand.symbol}</h2>
        <div className="chord-meta">
          {cand.slash && <span className="badge">{msg('fretboard.badge.slash')}</span>}
          {cand.rootless && <span className="badge badge--accent">{msg('fretboard.tag.rootless')}</span>}
          <span className={'conf num' + (f.confLow ? ' is-warning' : '')}>{msg('fretboard.confidence', { percent: cand.confidence })}</span>
          {f.warns.length > 0 && (
            <button type="button" className="btn-link" style={{ height: 28 }} onClick={actions.jumpWarns}>{msg('fretboard.warnsLink', { count: f.warns.length })}</button>
          )}
        </div>
        {f.tie && f.rival && <span className="chord-note is-warning">{msg('fretboard.similar', { symbol: f.rival.symbol, percent: f.rival.confidence })}</span>}
        {f.shapeName && <span className="chord-note">{f.shapeName}</span>}
        <FormNav f={f} className="form-nav--inline" />
      </div>

      <div className="an-block">
        <h3 className="an-h3">{msg('fretboard.tones')}</h3>
        <div className="tones">
          {f.tones.map((t) => (
            <span key={t.pc} className={'tone' + (t.root ? ' is-root' : '') + (t.bass ? ' is-bass' : '')}>
              {t.note}<span className="tone-iv">{t.iv}</span>{t.bass && <span className="tone-iv">{msg('fretboard.bass')}</span>}
            </span>
          ))}
        </div>
        <dl className="facts">
          <dt>{msg('fretboard.missing')}</dt><dd>{f.missing}</dd>
          <dt>{msg('fretboard.extra')}</dt><dd>{f.extra}</dd>
        </dl>
      </div>

      <div className="an-block an-block--tight">
        <h3 id="warn-head" tabIndex={-1} className="an-h3">{msg('fretboard.warns')} <span className="badge">{f.warns.length}</span></h3>
        {f.warns.length === 0 && <p className="an-note">{msg('fretboard.warns.ok')}</p>}
        {f.warns.map((w) => (
          <div key={w.key} className={`fw fw-${w.kind}`}>
            <span className="fw-cat">{w.cat}</span>
            <span className="fw-title">{w.title}</span>
            <span className="fw-detail">{w.detail}</span>
          </div>
        ))}
      </div>

      {f.candidates.length > 1 && (
        <fieldset className="field">
          <legend className="cand-legend">{msg('fretboard.candidates')}</legend>
          <div className="cand-list">
            {f.candidates.map((k) => (
              <label key={k.key} className={'cand' + (k.on ? ' is-on' : '')}>
                <input className="sr-only" type="radio" name="cand" checked={k.on} onChange={() => actions.pickCandidate(k.key)} />
                <span className="cand-radio" aria-hidden="true" />
                <span className="cand-name">
                  <span className="cand-symbol">{k.symbol}</span>
                  {k.tags && <span className="cand-tags">{k.tags}</span>}
                </span>
                <span className="cand-conf">{k.conf}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
    </>
  );
}

function Progression({ f, mobile }: { f: F; mobile: boolean }) {
  const { t: msg } = useI18n();
  const { s, actions } = f;
  const has = s.progression.length > 0;
  const copyButton = (
    <button type="button" className="btn btn-secondary" onClick={actions.copy} disabled={!has}>
      <Icon name={s.copy === 'ok' ? 'check' : 'copy'} />
      <span aria-live="polite">{s.copy === 'ok' ? msg('common.copied') : msg('fretboard.prog.copy')}</span>
    </button>
  );
  const list = (
    <ol className="prog">
      {s.progression.map((p, i) => (
        <li key={p.id} className="prog-item">
          <button type="button" className="prog-load" aria-label={msg('fretboard.prog.loadAria', { symbol: p.symbol })} onClick={() => actions.loadProg(p)}>
            <span className="prog-symbol"><span className="prog-num">{i + 1}</span>{p.symbol}</span>
            <span className="prog-code code-font">{p.code}{p.capo ? ` ${msg('common.capo', { n: p.capo })}` : ''}</span>
          </button>
          <button type="button" className="prog-remove" aria-label={msg('fretboard.prog.removeAria', { symbol: p.symbol })} onClick={() => actions.removeProg(p)}>
            <Icon name="close" />
          </button>
        </li>
      ))}
    </ol>
  );
  return (
    <section className="prog-section" aria-labelledby="prog-title">
      <div className="prog-head">
        <h2 id="prog-title" className="heading review-title">{msg('fretboard.prog.title')}</h2>
        <span className="badge">{s.progression.length}</span>
        {!mobile && has && <span id="prog-text" className="code-font prog-text">{f.progText}</span>}
        {mobile ? copyButton : (
          <div className="prog-actions">
            {s.copy === 'fail' && <span role="alert">{msg('fretboard.prog.copyFail.desktop')}</span>}
            {copyButton}
          </div>
        )}
      </div>
      {mobile && s.copy === 'fail' && <span role="alert">{msg('fretboard.prog.copyFail.mobile')}</span>}
      {mobile && has && <span id="prog-text" className="code-font prog-text">{f.progText}</span>}
      {has ? list : (
        <p className="empty-note">
          {mobile
            ? msg('fretboard.prog.emptyMobile')
            : msg('fretboard.prog.empty')}
        </p>
      )}
    </section>
  );
}

function Legend() {
  const { t: msg } = useI18n();
  return (
  <span aria-hidden="true" className="legend">
    <span className="legend-item"><span className="legend-dot" style={{ background: 'var(--color-accent)' }} />{msg('fretboard.legend.root')}</span>
    <span className="legend-item">
      <span className="legend-dot" style={{ background: 'var(--color-accent-soft)', boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-accent) 36%, transparent)' }} />{msg('fretboard.tones')}
    </span>
  </span>
  );
}

export function FretboardPage() {
  const { t: msg } = useI18n();
  const mobile = useMediaQuery(MOBILE_QUERY);
  const f = useFretboard(mobile);
  const { s, cand, actions } = f;

  const status = s.message && (
    <span className="undo-bar" role="status">
      <span>{s.message}</span>
      {s.past.length > 0 && !s.undone && (
        <button type="button" className="btn-link" onClick={actions.undo}>{msg('common.undo')}</button>
      )}
      <button type="button" className="btn btn-ghost btn-icon" style={mobile ? undefined : { width: 32, height: 32 }} aria-label={msg('common.dismiss')}
        onClick={() => actions.patch({ message: '' })}>
        <Icon name="close" />
      </button>
    </span>
  );
  const history = (
    <span className="history">
      <button type="button" className="btn btn-ghost btn-icon" aria-label={msg('common.undo')} title={msg('fretboard.undo.title')} onClick={actions.undo} disabled={!s.past.length}>
        <Icon name="undo" />
      </button>
      <button type="button" className="btn btn-ghost btn-icon" aria-label={msg('common.redo')} title={msg('fretboard.redo.title')} onClick={actions.redo} disabled={!s.future.length}>
        <Icon name="redo" />
      </button>
    </span>
  );

  return (
    <>
      <Settings f={f} mobile={mobile} />
      <main className="fb-work">
        <section className="pane" aria-labelledby="board-title">
          <div className="pane-head">
            <h2 id="board-title" className="heading pane-title">{msg('fretboard.board.title')}</h2>
            <span className="code-font code-chip">{f.code}</span>
            <span className="pane-actions">
              {history}
              <button type="button" className={'btn btn-ghost tune-toggle' + (s.tuningMode ? ' is-on' : '')} aria-pressed={s.tuningMode}
                onClick={actions.toggleTuningMode}>
                <Icon name="tune" /><span>{msg('fretboard.tuningMode')}</span>
              </button>
              <button type="button" className="btn btn-ghost" onClick={actions.clearAll} disabled={f.an.played.length === 0}>
                <Icon name="close" /><span>{mobile ? msg('common.clear') : msg('fretboard.clearAll')}</span>
              </button>
            </span>
          </div>
          {mobile ? (
            <div className="vboard-wrap"><VerticalBoard f={f} /></div>
          ) : (
            <div className="fb-board-wrap"><HorizontalBoard f={f} /></div>
          )}
          <div className="pane-foot">
            {status}
            {mobile ? (
              <span className="foot-row"><Legend /></span>
            ) : (
              <>
                <span className="sr-only">{msg('fretboard.board.sr')}</span>
                <span aria-hidden="true" className="kbd-hint">
                  <kbd>←</kbd><kbd>→</kbd><kbd>↑</kbd><kbd>↓</kbd> {msg('fretboard.kbd.move')} <kbd>Space</kbd> {msg('fretboard.kbd.press')} <kbd>X</kbd> {msg('fretboard.kbd.mute')}
                </span>
                <Legend />
              </>
            )}
          </div>
        </section>

        <section className="pane" aria-labelledby="chord-title">
          <div className="analysis">
            <span className="sr-only" role="status" aria-live="polite">{f.liveSummary}</span>
            <Analysis f={f} />
          </div>
          {/* 진행에 추가는 진행 섹션과 함께 숨김 */}
          {false && !mobile && (
            <div className="analysis-foot">
              <button type="button" className="btn btn-primary" onClick={actions.addToProgression} disabled={!cand}>
                <Icon name="plus" size={20} /><span>{msg('fretboard.prog.add')}</span>
              </button>
            </div>
          )}
        </section>
      </main>

      {/* 진행 섹션은 당분간 숨김 (삭제 아님) */}
      {false && <Progression f={f} mobile={mobile} />}

      {mobile && (
        <div className="bottom-bar bottom-bar--fret">
          <span className="now">
            <strong>{cand ? cand.symbol : '—'}</strong>
            {cand && (
              <span className="num">
                <span className={f.confLow ? 'is-warning' : undefined}>{msg('fretboard.confidence', { percent: cand.confidence })}</span>
                {' · '}{f.tones.map((t) => t.note + (t.iv ? ` ${t.iv}` : '')).join(', ')}
              </span>
            )}
          </span>
          <FormNav f={f} />
          {false && (
            <button type="button" className="btn btn-primary" onClick={actions.addToProgression} disabled={!cand}>
              <Icon name="plus" size={20} /><span>{msg('fretboard.prog.add')}</span>
            </button>
          )}
        </div>
      )}
    </>
  );
}
