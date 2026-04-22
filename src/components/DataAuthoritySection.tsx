import React from 'react';
import { useLanguage } from '@/contexts/i18nContext';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, ExternalLink } from 'lucide-react';

const DataAuthoritySection: React.FC = () => {
  const { t } = useLanguage();

  const authorities = [
    {
      name: 'Spanish Tax Authority',
      url: 'https://sede.agenciatributaria.gob.es/',
      abbr: 'Agencia Tributaria',
    },
    {
      name: 'EU Regulations',
      url: 'https://eur-lex.europa.eu/',
      abbr: 'EUR-Lex',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-primary" />
        <h3 className="text-2xl font-serif font-light">
          {t('authority.title') || '183-Day Rule Authority'}
        </h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="glass border-none rounded-3xl">
          <CardContent className="p-8 space-y-4">
            <h4 className="font-serif text-lg text-primary">{t('authority.whatIsTitle') || 'What is the 183-Day Rule?'}</h4>
            <p className="text-sm opacity-60 leading-relaxed font-light">
              {t('authority.whatIsDesc') ||
                'An individual is considered a tax resident if they spend more than 183 days in Spain during a calendar year.'}
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-none rounded-3xl">
          <CardContent className="p-8 space-y-4">
            <h4 className="font-serif text-lg text-primary">{t('authority.whatCountsTitle') || 'What Counts?'}</h4>
            <ul className="text-sm opacity-60 space-y-2 font-light">
              <li>✓ {t('authority.whatCountsList1') || 'Any part of a day spent in Spain'}</li>
              <li>✓ {t('authority.whatCountsList2') || 'Personal property residing there'}</li>
              <li>✓ {t('authority.whatCountsList3') || 'Family members living there'}</li>
              <li>✓ {t('authority.whatCountsList4') || 'Economic interests in the country'}</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="glass border-none rounded-3xl">
        <CardContent className="p-8 space-y-6">
          <h4 className="font-serif text-lg text-primary">
            {t('authority.sourcesTitle') || 'Official Sources'}
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            {authorities.map((auth, idx) => (
              <a
                key={idx}
                href={auth.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-2xl bg-accent/10 hover:bg-accent/20 transition-colors flex items-center justify-between group"
              >
                <div>
                  <p className="text-xs opacity-60 font-light">{auth.abbr}</p>
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">{auth.name}</p>
                </div>
                <ExternalLink className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>
          <p className="text-xs opacity-40 italic">
            {t('authority.disclaimer') ||
              'This calculator is for informational purposes only. Consult with a tax professional for your specific situation.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataAuthoritySection;
