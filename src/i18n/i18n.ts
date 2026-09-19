// Message lookup that works anywhere, React or not (engines, constants, hooks). Imports carry .ts so node can run the checks.
import { enMessages } from './messages.en.ts';
import { koMessages, type TranslationKey } from './messages.ko.ts';

export type { TranslationKey };
export const supportedLocales = ['ko', 'en'] as const;
export type Locale = (typeof supportedLocales)[number];
export type Values = Record<string, string | number>;

export const LOCALE_STORAGE_KEY = 'altered.prefs.v1';
export const languageTags: Record<Locale, string> = { ko: 'ko-KR', en: 'en-US' };
/** native names, never translated */
export const localeOptions: ReadonlyArray<{ value: Locale; label: string }> = [{ value: 'ko', label: '한국어' }, { value: 'en', label: 'English' }];

const catalogs: Record<Locale, Record<TranslationKey, string>> = { ko: koMessages, en: enMessages };
let activeLocale: Locale = 'ko';

export function setActiveLocale(locale: Locale) {
  activeLocale = locale;
}

export function readLocale(storage: Pick<Storage, 'getItem'>): Locale {
  try {
    const v: { lang?: unknown } = JSON.parse(storage.getItem(LOCALE_STORAGE_KEY) ?? storage.getItem('calypso.prefs.v1') ?? '{}');
    return supportedLocales.find((l) => l === v.lang) ?? 'ko';
  } catch {
    return 'ko';
  }
}

export function hasMessage(key: string): key is TranslationKey {
  return key in koMessages;
}

/** `{name}` placeholders are filled from values; a key missing in the locale falls back to Korean */
export function translateFor(locale: Locale, key: TranslationKey, values?: Values): string {
  const template = catalogs[locale][key] ?? koMessages[key];
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (hole, name: string) => (values[name] === undefined ? hole : String(values[name])));
}

export function translate(key: TranslationKey, values?: Values): string {
  return translateFor(activeLocale, key, values);
}
