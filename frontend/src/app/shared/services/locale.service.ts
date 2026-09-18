import { Injectable } from '@angular/core';

export const SUPPORTED_LOCALES = ['de', 'en'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = 'de';

/** Cookie that Apache evaluates for URLs without a locale prefix */
const LOCALE_COOKIE = 'baula_locale';
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;
const LOCALE_PREFIX_PATTERN = /^\/(de|en)(?=\/|$)/;

/**
 * Active locale and language switching. Every locale is served under its own prefix
 * (`/de/`, `/en/`, see i18n.subPath in angular.json), so a switch is always a full reload.
 * Without such a prefix - `ng serve` for example - every method is a no-op.
 */
@Injectable({
  providedIn: 'root',
})
export class LocaleService {
  /** Prefix the app is served under, read from the <base href>; null if there is none */
  private get servedLocale(): SupportedLocale | null {
    try {
      const path = new URL(document.baseURI).pathname;
      return (LOCALE_PREFIX_PATTERN.exec(path)?.[1] as SupportedLocale) ?? null;
    } catch {
      return null;
    }
  }

  /** Whether the app is served under a locale prefix */
  get hasLocalePrefix(): boolean {
    return this.servedLocale !== null;
  }

  /** Active locale ('de' | 'en') */
  get current(): SupportedLocale {
    return this.servedLocale ?? DEFAULT_LOCALE;
  }

  /** Stores the locale and reloads the current path under the other prefix */
  switchTo(locale: SupportedLocale): void {
    if (!this.hasLocalePrefix || locale === this.current) {
      return;
    }
    this.persist(locale);

    const { pathname, search, hash } = window.location;
    const rest = pathname.replace(LOCALE_PREFIX_PATTERN, '');
    window.location.assign(`/${locale}${rest || '/'}${search}${hash}`);
  }

  /** Updates the cookie without navigating */
  persist(locale: SupportedLocale = this.current): void {
    if (!this.hasLocalePrefix) {
      return;
    }
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie =
      `${LOCALE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR_IN_SECONDS}` +
      `; SameSite=Lax${secure}`;
  }

  /**
   * Inserts the locale prefix into an absolute, locale-free frontend URL from the config.
   * External targets stay unchanged.
   */
  localizeUrl(url: string): string {
    if (!this.hasLocalePrefix) {
      return url;
    }

    try {
      const target = new URL(url, window.location.origin);
      if (target.origin !== window.location.origin) {
        return url;
      }
      if (!LOCALE_PREFIX_PATTERN.test(target.pathname)) {
        target.pathname = `/${this.current}${target.pathname}`;
      }
      return target.toString();
    } catch {
      return url;
    }
  }
}
