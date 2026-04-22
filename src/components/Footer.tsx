import React from 'react';
import { useLanguage } from '@/contexts/i18nContext';
import { Link } from 'react-router-dom';
import { FileDown } from 'lucide-react';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/10 bg-background/50 backdrop-blur-sm mt-24">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-accent flex items-center justify-center border border-border">
                <FileDown className="w-4 h-4" />
              </div>
              <div>
                <p className="font-serif text-lg">TaxNomad</p>
                <p className="text-xs opacity-50 font-light">Premium Tax Calculator</p>
              </div>
            </div>
            <p className="text-sm opacity-60 font-light leading-relaxed">
              {t('footer.tagline') || 'Master your fiscal residency with our premium audit-ready calculator for 2026'}
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-widest opacity-80">{t('footer.product') || 'Product'}</h4>
            <ul className="space-y-3 text-sm opacity-60">
              <li>
                <Link to="/" className="hover:opacity-100 transition-opacity hover:text-primary font-light">
                  {t('footer.calculator') || 'Calculator'}
                </Link>
              </li>
              <li>
                <a href="https://sede.agenciatributaria.gob.es/" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity hover:text-primary font-light">
                  {t('footer.authority') || 'Tax Authority'}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-widest opacity-80">{t('footer.legal') || 'Legal'}</h4>
            <ul className="space-y-3 text-sm opacity-60">
              <li>
                <Link to="/privacy" className="hover:opacity-100 transition-opacity hover:text-primary font-light">
                  {t('footer.privacy') || 'Privacy Policy'}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:opacity-100 transition-opacity hover:text-primary font-light">
                  {t('footer.terms') || 'Terms of Service'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-widest opacity-80">{t('footer.support') || 'Support'}</h4>
            <div className="space-y-3 text-sm opacity-60">
              <div className="font-light">
                <p className="text-xs opacity-50 mb-1">{t('footer.contactEmail') || 'Email'}</p>
                <a href="mailto:support@taxnomad.app" className="hover:opacity-100 transition-opacity hover:text-primary">
                  support@taxnomad.app
                </a>
              </div>
              <div className="font-light">
                <p className="text-xs opacity-50 mb-1">{t('footer.website') || 'Website'}</p>
                <a href="https://taxnomad.app" className="hover:opacity-100 transition-opacity hover:text-primary">
                  taxnomad.app
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-border/10 my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs opacity-40 font-light">
            © {currentYear} TaxNomad. {t('footer.rights') || 'All rights reserved. Premium tax calculator for digital nomads.'}
          </p>
          <p className="text-xs opacity-40 font-light text-center md:text-right">
            {t('footer.disclaimer') || 'This calculator is for informational purposes only. Consult a tax professional for your specific situation.'}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
