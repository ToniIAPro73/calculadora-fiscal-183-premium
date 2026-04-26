import React from 'react';
import { useLanguage } from '@/contexts/i18nContext';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, ExternalLink } from 'lucide-react';

const DataAuthoritySection: React.FC = () => {
  const { t, language } = useLanguage();

  const authorities = [
    {
      name: language === 'es' ? 'Agencia Tributaria (España)' : 'Spanish Tax Authority (AEAT)',
      url: 'https://sede.agenciatributaria.gob.es/',
      abbr: 'Agencia Tributaria',
    },
    {
      name: language === 'es' ? 'EUR-Lex — Reglamentos UE' : 'EUR-Lex — EU Regulations',
      url: 'https://eur-lex.europa.eu/',
      abbr: 'EUR-Lex',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[var(--app-text-accent,#CD7F32)] flex items-center gap-2">
          <ShieldCheck className="w-3 h-3" />
          {t('authority.eyebrow')}
        </p>
        <h3 className="text-2xl font-display font-semibold text-[var(--app-text-primary,#f0ede8)]">
          {t('authority.title')}
        </h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="ac-surface-panel--subtle">
          <CardContent className="p-8 space-y-4">
            <h4 className="font-display text-base font-semibold text-[var(--app-text-primary,#f0ede8)]">
              {t('authority.whatIsTitle')}
            </h4>
            <p className="text-sm font-light leading-relaxed text-[var(--app-text-secondary,rgba(240,237,232,0.65))]">
              {t('authority.whatIsDesc')}
            </p>
          </CardContent>
        </Card>

        <Card className="ac-surface-panel--subtle">
          <CardContent className="p-8 space-y-4">
            <h4 className="font-display text-base font-semibold text-[var(--app-text-primary,#f0ede8)]">
              {t('authority.whatCountsTitle')}
            </h4>
            <ul className="space-y-2 text-sm font-light text-[var(--app-text-secondary,rgba(240,237,232,0.65))]">
              <li>✓ {t('authority.whatCountsList1')}</li>
              <li>✓ {t('authority.whatCountsList2')}</li>
              <li>✓ {t('authority.whatCountsList3')}</li>
              <li>✓ {t('authority.whatCountsList4')}</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-8 space-y-6">
          <h4 className="font-display text-base font-semibold text-[var(--app-text-primary,#f0ede8)]">
            {t('authority.sourcesTitle')}
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            {authorities.map((auth, idx) => (
              <a
                key={idx}
                href={auth.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-2xl border border-[var(--app-border,rgba(255,255,255,0.08))] bg-[rgba(255,255,255,0.03)] p-4 transition-all hover:border-[var(--app-border-strong,rgba(205,127,50,0.22))] hover:bg-[rgba(205,127,50,0.05)]"
              >
                <div>
                  <p className="text-xs font-semibold text-[var(--app-text-muted,rgba(240,237,232,0.38))] mb-0.5">
                    {auth.abbr}
                  </p>
                  <p className="text-sm font-medium text-[var(--app-text-primary,#f0ede8)] transition-colors group-hover:text-[var(--app-text-accent,#CD7F32)]">
                    {auth.name}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-[var(--app-text-muted,rgba(240,237,232,0.38))] group-hover:text-[var(--app-text-accent,#CD7F32)] transition-colors shrink-0 ml-2" />
              </a>
            ))}
          </div>
          <p className="text-xs italic text-[var(--app-text-muted,rgba(240,237,232,0.38))] leading-relaxed">
            {t('authority.disclaimerDesc')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataAuthoritySection;
