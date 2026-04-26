import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/i18nContext';
import { getCookieConsent, setCookieConsent, COOKIE_CONSENT_UPDATED_EVENT } from '@/lib/cookieConsent';
import { getLocalizedPath } from '@/lib/seo';

const CookieBanner: React.FC = () => {
  const { language, t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const syncConsentState = () => {
      setVisible(!getCookieConsent());
    };

    syncConsentState();
    window.addEventListener(COOKIE_CONSENT_UPDATED_EVENT, syncConsentState);

    return () => {
      window.removeEventListener(COOKIE_CONSENT_UPDATED_EVENT, syncConsentState);
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] px-4 pb-4 sm:px-6 lg:px-8">
      <div className="pointer-events-auto mx-auto max-w-[1280px]">
        <div className="overflow-hidden rounded-[1.35rem] border border-[var(--app-border)] bg-[rgba(15,12,22,0.96)] shadow-[0_24px_60px_-32px_rgba(0,0,0,0.7)] backdrop-blur-xl">
          <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="space-y-3">
              <span className="inline-flex items-center rounded-full border border-[var(--app-border-strong)] bg-[rgba(205,127,50,0.08)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--app-text-accent,#CD7F32)]">
                <ShieldCheck className="mr-2 h-3.5 w-3.5" />
                {t('cookies.bannerEyebrow')}
              </span>
              <div className="max-w-3xl space-y-2">
                <p className="text-sm font-semibold leading-6 text-[var(--app-text-primary)] sm:text-[15px]">
                  {t('cookies.bannerTitle')}
                </p>
                <p className="text-sm leading-6 text-[var(--app-text-secondary,rgba(240,237,232,0.7))]">
                  {t('cookies.bannerBody')}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <Button
                type="button"
                variant="ghost"
                className="h-11 min-w-[132px] rounded-full border border-[var(--app-border)] bg-transparent px-5 text-[var(--app-text-primary)] hover:bg-white/5"
                onClick={() => setCookieConsent('rejected')}
              >
                {t('cookies.reject')}
              </Button>
              <Button
                type="button"
                className="h-11 min-w-[132px] rounded-full px-5"
                onClick={() => setCookieConsent('accepted')}
              >
                {t('cookies.accept')}
              </Button>
              <Link
                to={getLocalizedPath(language, '/cookies')}
                className="inline-flex items-center justify-center gap-2 text-sm font-medium text-[var(--app-text-secondary,rgba(240,237,232,0.7))] transition-colors hover:text-[var(--app-text-primary)]"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {t('cookies.policy')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
