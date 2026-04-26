export const COOKIE_CONSENT_STORAGE_KEY = 'taxnomad_cookie_consent';
export const COOKIE_CONSENT_MAX_AGE_DAYS = 180;
export const COOKIE_CONSENT_VERSION = '2026-04-27';
export const COOKIE_CONSENT_UPDATED_EVENT = 'taxnomad:cookie-consent-updated';

export type CookieConsentStatus = 'accepted' | 'rejected';

export interface CookieConsentPayload {
  status: CookieConsentStatus;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
  version: string;
}

function getNow() {
  return Date.now();
}

export function getCookieConsent(): CookieConsentPayload | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<CookieConsentPayload>;
    if (!parsed?.status || !parsed?.expiresAt || !parsed?.version) {
      window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
      return null;
    }

    if (parsed.expiresAt <= getNow()) {
      window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
      return null;
    }

    return parsed as CookieConsentPayload;
  } catch {
    window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
    return null;
  }
}

export function setCookieConsent(status: CookieConsentStatus) {
  if (typeof window === 'undefined') {
    return null;
  }

  const existing = getCookieConsent();
  const now = getNow();
  const payload: CookieConsentPayload = {
    status,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    expiresAt: now + COOKIE_CONSENT_MAX_AGE_DAYS * 24 * 60 * 60 * 1000,
    version: COOKIE_CONSENT_VERSION,
  };

  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(payload));
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_UPDATED_EVENT, { detail: payload }));
  return payload;
}

export function clearCookieConsent() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_UPDATED_EVENT, { detail: null }));
}
