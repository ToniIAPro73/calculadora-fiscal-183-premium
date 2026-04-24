import React from 'react';
import { useLanguage } from '@/contexts/i18nContext';

const MinimalFooter: React.FC = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/10 bg-background/50 backdrop-blur-sm mt-24">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-xs opacity-60 font-light text-center">
          © {currentYear} TaxNomad. {t('footer.rights') || 'All rights reserved. Premium tax calculator for digital nomads.'}
        </p>
      </div>
    </footer>
  );
};

export default MinimalFooter;
