import React from 'react';
import { useLanguage } from '@/contexts/i18nContext';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/10 bg-background/50 backdrop-blur-sm mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">TaxNomad</h3>
            <p className="text-sm opacity-60">
              {t('footer.tagline') || 'Premium tax calculator for digital nomads'}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4 opacity-80">{t('footer.links') || 'Links'}</h4>
            <ul className="space-y-2 text-sm opacity-60">
              <li><a href="/calculator" className="hover:opacity-100 transition">{t('footer.calculator') || 'Calculator'}</a></li>
              <li><a href="/privacy" className="hover:opacity-100 transition">{t('footer.privacy') || 'Privacy'}</a></li>
              <li><a href="/terms" className="hover:opacity-100 transition">{t('footer.terms') || 'Terms'}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4 opacity-80">{t('footer.contact') || 'Contact'}</h4>
            <p className="text-sm opacity-60">{t('footer.email') || 'support@taxnomad.app'}</p>
          </div>
        </div>
        <div className="border-t border-border/10 pt-8 flex flex-col sm:flex-row items-center justify-between">
          <p className="text-xs opacity-40">
            © {currentYear} TaxNomad. {t('footer.rights') || 'All rights reserved.'}
          </p>
          <div className="flex items-center gap-2 text-xs opacity-40 mt-4 sm:mt-0">
            <span>{t('footer.madeWith') || 'Made with'}</span>
            <Heart className="w-3 h-3 text-red-500" />
            <span>{t('footer.for') || 'for nomads'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
