import React from 'react';
import { useLanguage } from '@/contexts/i18nContext';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, ExternalLink } from 'lucide-react';

const DataAuthoritySection: React.FC = () => {
  const { t } = useLanguage();

  const authorities = [
    {
      nameKey: 'authority.spanishTaxAuthority',
      nameFallback: 'Spanish Tax Authority',
      url: 'https://sede.agenciatributaria.gob.es/',
      abbr: 'Agencia Tributaria',
    },
    {
      nameKey: 'authority.euRegulations',
      nameFallback: 'EU Regulations',
      url: 'https://eur-lex.europa.eu/',
      abbr: 'EUR-Lex',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[var(--accent,var(--color-accent-primary))] flex items-center gap-2">
          <ShieldCheck className="w-3 h-3" />
          {t('authority.eyebrow') || 'FUENTES OFICIALES'}
        </p>
        <h3 className="text-2xl font-display font-semibold">
          {t('authority.title') || 'Regla de los 183 Días'}
        </h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="ac-surface-panel--subtle">
          <CardContent className="p-8 space-y-4">
            <h4 className="font-display text-lg text-primary">{t('authority.whatIsTitle') || 'What is the 183-Day Rule?'}</h4>
            <p className="text-sm font-light leading-relaxed text-[var(--text-secondary)]">
              {t('authority.whatIsDesc') ||
                'An individual is considered a tax resident if they spend more than 183 days in Spain during a calendar year.'}
            </p>
          </CardContent>
        </Card>

        <Card className="ac-surface-panel--subtle">
          <CardContent className="p-8 space-y-4">
            <h4 className="font-display text-lg text-primary">{t('authority.whatCountsTitle') || 'What Counts?'}</h4>
            <ul className="space-y-2 text-sm font-light text-[var(--text-secondary)]">
              <li>✓ {t('authority.whatCountsList1') || 'Any part of a day spent in Spain'}</li>
              <li>✓ {t('authority.whatCountsList2') || 'Personal property residing there'}</li>
              <li>✓ {t('authority.whatCountsList3') || 'Family members living there'}</li>
              <li>✓ {t('authority.whatCountsList4') || 'Economic interests in the country'}</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-8 space-y-6">
          <h4 className="font-display text-lg text-primary">
            {t('authority.sourcesTitle') || 'Official Sources'}
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            {authorities.map((auth, idx) => (
              <a
                key={idx}
                href={auth.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-[22px] border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--surface-subtle)_88%,transparent)] p-4 transition-colors hover:border-[var(--border-strong)]"
              >
                <div>
                  <p className="text-xs font-light text-[var(--text-muted)]">{auth.abbr}</p>
                  <p className="text-sm font-medium text-[var(--text-primary)] transition-colors group-hover:text-primary">{t(auth.nameKey) || auth.nameFallback}</p>
                </div>
                <ExternalLink className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>
          <p className="text-xs italic text-[var(--text-muted)]">
            {t('authority.disclaimer') ||
              'This calculator is for informational purposes only. Consult with a tax professional for your specific situation.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataAuthoritySection;
