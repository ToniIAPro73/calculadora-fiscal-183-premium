import React from 'react';
import { useLanguage } from '@/contexts/i18nContext';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const { t, language } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/20 bg-background/80 backdrop-blur-md mt-24">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand — Anclora Premium */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/anclora-group.png"
                alt="Anclora"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <p className="font-display text-base font-semibold" style={{ fontFamily: 'var(--font-display, DM Sans, sans-serif)' }}>
                  {language === 'es' ? 'Evaluación Fiscal 183' : 'Fiscal Assessment 183'}
                </p>
                <p className="text-xs opacity-60 font-light">Anclora Ecosystem</p>
              </div>
            </div>
            <p className="text-sm opacity-75 font-light leading-relaxed">
              {t('footer.tagline') || (language === 'es'
                ? 'Herramienta de evaluación de residencia fiscal para 2026.'
                : 'Fiscal residency assessment tool for 2026.')}
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest opacity-80">
              {t('footer.product') || (language === 'es' ? 'Herramienta' : 'Tool')}
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="opacity-75 cursor-pointer hover:opacity-100 transition-opacity hover:text-primary font-light">
                  {language === 'es' ? 'Calculadora' : 'Calculator'}
                </Link>
              </li>
              <li>
                <a href="https://sede.agenciatributaria.gob.es/" target="_blank" rel="noopener noreferrer" className="opacity-75 cursor-pointer hover:opacity-100 transition-opacity hover:text-primary font-light">
                  {t('footer.authority') || 'Agencia Tributaria'}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest opacity-80">
              {t('footer.legal') || 'Legal'}
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/privacy" className="opacity-75 cursor-pointer hover:opacity-100 transition-opacity hover:text-primary font-light">
                  {t('footer.privacy') || 'Privacidad'}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="opacity-75 cursor-pointer hover:opacity-100 transition-opacity hover:text-primary font-light">
                  {t('footer.terms') || 'Términos'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest opacity-80">
              {t('footer.support') || (language === 'es' ? 'Contacto' : 'Support')}
            </h4>
            <div className="space-y-3 text-sm font-light">
              <div>
                <p className="text-xs opacity-60 mb-1">{t('footer.contactEmail') || 'Email'}</p>
                <a href="mailto:hola@regla183.com" className="opacity-75 hover:opacity-100 transition-opacity hover:text-primary">
                  hola@regla183.com
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="h-[1px] bg-border/10 my-8"></div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs opacity-60 font-light">
            © {currentYear} Anclora. {language === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}
          </p>
          <p className="text-xs opacity-60 font-light text-center md:text-right">
            {t('footer.disclaimer') || (language === 'es'
              ? 'Herramienta informativa. Consulta un profesional fiscal para tu situación específica.'
              : 'For informational purposes only. Consult a tax professional for your specific situation.')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
