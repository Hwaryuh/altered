import { Icon } from '../../components/Icon';
import { useI18n } from '../../i18n/I18nProvider';
import type { ReviewItem } from './useTransposer';

interface Actions {
  jump: (id: string) => void;
  hover: (id: string | null) => void;
  apply: (id: string) => void;
}

function Row({ w, actions }: { w: ReviewItem; actions: Actions }) {
  const { t: msg } = useI18n();
  const ids = { title: `wt-${w.id}`, tok: `wk-${w.id}`, detail: `wd-${w.id}`, fix: `wf-${w.id}` };
  const changed = !w.summary && w.from !== w.to;
  const pill = w.kind === 'grammar' ? 'pill pill--grammar' : 'pill pill--music';
  return (
    <li>
      <button type="button" className={'warn-row' + (w.active ? ' is-active' : '')} aria-pressed={w.pinned}
        aria-labelledby={`${ids.title} ${ids.tok}`} aria-describedby={`${ids.detail} ${ids.fix}`}
        onClick={() => actions.jump(w.id)}
        onMouseEnter={() => actions.hover(w.id)} onMouseLeave={() => actions.hover(null)}
        onFocus={() => actions.hover(w.id)} onBlur={() => actions.hover(null)}>
        <span id={ids.tok} className="sr-only">{w.summary ? '' : w.from + (changed ? ` → ${w.to}` : `, ${msg('review.kept')}`)}</span>
        <span className="token" aria-hidden="true">
          {w.summary ? <span className={`${pill} pill--summary`}>{msg('review.many')}</span> : <span className={pill}>{w.from}</span>}
          {changed && <><Icon name="tokenArrow" size={14} className="arrow" /><span className="pill pill--to">{w.to}</span></>}
          {!w.summary && !changed && <span className="kept">{msg('review.kept')}</span>}
        </span>
        <span className="warn-text">
          <span className="warn-title">
            <span id={ids.title}>{w.title}</span>
            {w.isInfo && <span className="badge badge--accent">{msg('review.info')}</span>}
          </span>
          <span id={ids.detail} className="warn-detail">{w.detail}</span>
          <span id={ids.fix} className="warn-fix">{msg('review.suggest', { fix: w.fix })}</span>
        </span>
      </button>
      {w.applyLabel && (
        <div className="warn-apply">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => actions.apply(w.id)}>{w.applyLabel}</button>
        </div>
      )}
    </li>
  );
}

function Column({ kind, items, count, info, actions }: {
  kind: 'grammar' | 'music';
  items: ReviewItem[];
  count: number;
  info: string;
  actions: Actions;
}) {
  const { t: msg } = useI18n();
  const grammar = kind === 'grammar';
  return (
    <div className="warn-col">
      <h3 className="warn-col-head">
        <span className={`icon icon--${kind}`}><Icon name={grammar ? 'warnTriangle' : 'warnCircle'} /></span>
        <span>{grammar ? msg('review.grammar.title') : msg('review.music.title')}</span>
        <span className={`badge badge--${grammar ? 'danger' : 'warning'}`}>{count}</span>
        {info && <span className="meta">{info}</span>}
      </h3>
      {items.length ? (
        <ul className="warn-list">{items.map((w) => <Row key={w.id} w={w} actions={actions} />)}</ul>
      ) : (
        <p className="empty-note">{grammar ? msg('review.grammar.ok') : msg('review.music.ok')}</p>
      )}
    </div>
  );
}

export function ReviewSection(props: {
  show: boolean;
  total: number;
  grammar: ReviewItem[];
  music: ReviewItem[];
  grammarCount: number;
  musicCount: number;
  grammarInfo: string;
  musicInfo: string;
  actions: Actions;
}) {
  const { t: msg } = useI18n();
  return (
    <section className="review" aria-labelledby="warn-title">
      <div className="review-head">
        <h2 id="warn-title" tabIndex={-1} className="heading review-title">{msg('review.title')}</h2>
        <span className="badge">{props.total}</span>
      </div>
      {props.show ? (
        <div className="review-grid">
          <Column kind="grammar" items={props.grammar} count={props.grammarCount} info={props.grammarInfo} actions={props.actions} />
          <Column kind="music" items={props.music} count={props.musicCount} info={props.musicInfo} actions={props.actions} />
        </div>
      ) : (
        <p className="empty-note">{msg('review.empty')}</p>
      )}
    </section>
  );
}
