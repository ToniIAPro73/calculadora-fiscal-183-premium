export const APP_ORIGIN = 'https://www.regla183.com';
export const LANGUAGES = ['es', 'en'] as const;

export type AppLanguage = (typeof LANGUAGES)[number];

export function getLanguageFromPath(pathname = ''): AppLanguage | undefined {
  const firstSegment = pathname.split('/').filter(Boolean)[0];
  return LANGUAGES.includes(firstSegment as AppLanguage) ? (firstSegment as AppLanguage) : undefined;
}

export function normalizeLanguage(language?: string): AppLanguage {
  return LANGUAGES.includes(language as AppLanguage) ? (language as AppLanguage) : 'es';
}

export function getCanonicalUrl(language: string = 'es', route = '/') {
  const safeLanguage = normalizeLanguage(language);
  const normalizedRoute = route === '/' ? '/' : `/${route.replace(/^\/+|\/+$/g, '')}/`;
  return `${APP_ORIGIN}/${safeLanguage}${normalizedRoute === '/' ? '/' : normalizedRoute}`;
}

export function getDefaultUrl() {
  return `${APP_ORIGIN}/es/`;
}

export function getLocalizedPath(language: string = 'es', route = '/') {
  const safeLanguage = normalizeLanguage(language);
  const normalizedRoute = route === '/' ? '' : `/${route.replace(/^\/+|\/+$/g, '')}`;
  return `/${safeLanguage}${normalizedRoute}`;
}

export function swapLanguageInPath(pathname: string, nextLanguage: AppLanguage) {
  const currentLanguage = getLanguageFromPath(pathname);

  if (currentLanguage) {
    return pathname.replace(`/${currentLanguage}`, `/${nextLanguage}`) || `/${nextLanguage}`;
  }

  if (pathname === '/' || pathname === '') {
    return `/${nextLanguage}`;
  }

  return `/${nextLanguage}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
}
