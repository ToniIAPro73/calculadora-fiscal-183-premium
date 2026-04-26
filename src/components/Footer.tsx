import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/i18nContext';
import logo from '@/assets/logo.webp';

const Footer: React.FC = () => {
  const { t, language } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[var(--app-border)] bg-[rgba(15,12,22,0.6)] px-4 py-8 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="TaxNomad"
                className="h-10 w-10 rounded-full border border-[var(--app-border)] object-cover"
              />
              <span className="text-lg font-semibold tracking-[-0.04em] text-[var(--app-text-primary)]">
                Tax<span className="text-[var(--app-text-accent,#CD7F32)]">Nomad</span>
              </span>
            </div>
            <p className="max-w-sm text-sm leading-7 text-[var(--app-text-secondary,rgba(240,237,232,0.7))]">
              {t('footer.tagline') || (language === 'es'
                ? 'Herramienta de evaluación de residencia fiscal para 2026.'
                : 'Fiscal residency assessment tool for 2026.')}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--app-text-muted,rgba(240,237,232,0.5))]">
              {t('footer.legal') || 'Legal'}
            </h4>
            <Link to="/privacy" className="text-sm text-[var(--app-text-secondary,rgba(240,237,232,0.7))] transition-colors duration-200 hover:text-[var(--app-text-primary)]">
              {t('footer.privacy') || 'Privacidad'}
            </Link>
            <Link to="/terms" className="text-sm text-[var(--app-text-secondary,rgba(240,237,232,0.7))] transition-colors duration-200 hover:text-[var(--app-text-primary)]">
              {t('footer.terms') || 'Términos'}
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--app-text-muted,rgba(240,237,232,0.5))]">
              {t('footer.contact') || (language === 'es' ? 'Contacto' : 'Contact')}
            </h4>
            <div className="space-y-3 text-sm text-[var(--app-text-secondary,rgba(240,237,232,0.7))]">
              <div>
                <p className="mb-1 text-xs uppercase tracking-[0.18em] text-[var(--app-text-muted,rgba(240,237,232,0.5))]">
                  {t('footer.contactEmail') || 'Email'}
                </p>
                <a href="mailto:hola@regla183.com" className="transition-colors duration-200 hover:text-[var(--app-text-primary)]">
                  hola@regla183.com
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-[var(--app-border)] pt-8 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--app-text-muted,rgba(240,237,232,0.5))] md:flex-row md:items-center md:justify-between">
          <p>
            {t('footer.copyright') || `© ${currentYear} TaxNomad. ${language === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}`}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 md:justify-end">
            <a href="/llms.txt" className="transition-colors duration-200 hover:text-[var(--app-text-primary)]">LLMS</a>
            <a href="/openapi.json" className="transition-colors duration-200 hover:text-[var(--app-text-primary)]">OpenAPI</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
