import { Request } from "express";

/** Locale prefixes the frontend is served under (see angular.json -> i18n.subPath) */
export const SUPPORTED_LOCALES = ["de", "en"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const LOCALE_COOKIE_PATTERN = /(?:^|;\s*)baula_locale=(de|en)(?:;|$)/;

function isSupportedLocale(value: unknown): value is SupportedLocale {
  return (
    typeof value === "string" &&
    (SUPPORTED_LOCALES as readonly string[]).includes(value)
  );
}

/**
 * Locale for a redirect after the SAML roundtrip.
 *
 * Order: RelayState (body on ACS, query on SLO) -> baula_locale cookie -> undefined.
 * RelayState is only matched against the allow list, never interpolated into a URL.
 * Without a signal the locale stays unknown; the default for prefix-less URLs is Apache's job.
 */
export function resolveLocale(req: Request): SupportedLocale | undefined {
  const relayState = req.body?.RelayState ?? req.query?.RelayState;
  if (isSupportedLocale(relayState)) {
    return relayState;
  }

  const fromCookie = LOCALE_COOKIE_PATTERN.exec(req.headers.cookie ?? "")?.[1];
  return isSupportedLocale(fromCookie) ? fromCookie : undefined;
}

/** Inserts the locale prefix into the path of an absolute frontend URL */
export function localizedUrl(
  base: string | undefined,
  locale: SupportedLocale | undefined
): string | undefined {
  if (!base || !locale) {
    return base;
  }

  try {
    const url = new URL(base);
    if (!/^\/(de|en)(\/|$)/.test(url.pathname)) {
      url.pathname = `/${locale}${url.pathname}`;
    }
    return url.toString();
  } catch {
    // relative config values (e.g. "app/") stay unchanged
    return base;
  }
}

/** Start page of the given locale, derived from a configured frontend URL */
export function localizedHomeUrl(
  base: string | undefined,
  locale: SupportedLocale | undefined
): string | undefined {
  if (!base || !locale) {
    return undefined;
  }

  try {
    return new URL(`/${locale}/`, base).toString();
  } catch {
    return undefined;
  }
}
