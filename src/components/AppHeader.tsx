import { Flag } from './Flag';
import { Chevron } from './Icon';
import { useI18n } from '../i18n/I18nProvider';
import { localeOptions, type Locale } from '../i18n/i18n';

const TABS = [
  { href: '#/transpose', label: 'app.nav.transposer', route: '/transpose' },
  { href: '#/fretboard', label: 'app.nav.fretboard', route: '/fretboard' },
  { href: '#/forms', label: 'app.nav.forms', route: '/forms' },
] as const;

function Logo() {
  return (
    <svg width="26" height="26" viewBox="0 0 30 30" aria-hidden="true">
      <rect width="30" height="30" rx="5" style={{ fill: 'var(--color-accent)' }} />
      <path d="M8 10.5h14M8 15h14M8 19.5h14" strokeWidth="1.4" strokeLinecap="round"
        style={{ stroke: 'var(--color-accent-foreground)', opacity: 0.45 }} />
      <circle cx="17" cy="15" r="2.8" style={{ fill: 'var(--color-accent-foreground)' }} />
    </svg>
  );
}

export function AppHeader({ route }: { route: string }) {
  const { t, locale, setLocale } = useI18n();
  return (
    <header className="app-header">
      <div className="brand">
        <Logo />
        <span className="heading brand-name">Altered</span>
      </div>
      <nav aria-label={t('app.nav.label')} className="app-nav">
        {TABS.map((tab) => (
          <a key={tab.href} href={tab.href} className={'tab' + (route === tab.route ? ' is-active' : '')}
            aria-current={route === tab.route ? 'page' : undefined}>{t(tab.label)}</a>
        ))}
      </nav>
      <div className="app-prefs">
        <span className="select-wrap select-wrap--flag">
          <Flag locale={locale} className="flag" />
          <select className="select" aria-label={t('app.locale.label')} value={locale} onChange={(e) => setLocale(e.target.value as Locale)}>
            {localeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <Chevron />
        </span>
      </div>
    </header>
  );
}
