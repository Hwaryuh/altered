import { Fragment, createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  LOCALE_STORAGE_KEY, languageTags, readLocale, setActiveLocale, translateFor,
  type Locale, type TranslationKey, type Values,
} from './i18n';

interface I18n {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, values?: Values) => string;
}

const make = (locale: Locale, setLocale: (l: Locale) => void): I18n => ({
  locale, setLocale, t: (key, values) => translateFor(locale, key, values),
});

const Ctx = createContext<I18n>(make('ko', () => {}));

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => readLocale(window.localStorage));
  // set while rendering so translate() in engines and constants agrees with this render
  setActiveLocale(locale);
  const value = useMemo(() => make(locale, setLocale), [locale]);
  useEffect(() => {
    document.documentElement.lang = languageTags[locale];
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, JSON.stringify({ lang: locale }));
    } catch {
      // blocked storage: the choice lasts for this session only
    }
  }, [locale]);
  // a locale change remounts the tree, so text computed outside React (engine results) is rebuilt too
  return <Ctx.Provider value={value}><Fragment key={locale}>{children}</Fragment></Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
