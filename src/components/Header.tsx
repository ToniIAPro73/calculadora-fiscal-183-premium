import React from 'react';
import { useLanguage } from '@/contexts/i18nContext';
import { Link } from 'react-router-dom';
import { Sun, Moon, Languages } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const Header: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  return (
    <header className="anclora-sticky-header sticky top-0 z-50 w-full px-4 py-4 md:px-6">
      <div className="anclora-header-shell mx-auto flex w-full max-w-[88rem] items-center justify-between ac-topbar">
        <Link to="/" className="ac-topbar__brand min-w-0 hover:opacity-90 transition-opacity cursor-pointer">
          {/* Medallón Anclora — accesorio de ecosistema (32px) */}
          <img
            src="/anclora-group.png"
            alt="Anclora"
            className="h-8 w-8 rounded-full object-cover"
          />
          <div className="ac-topbar__titles min-w-0">
            <p className="ac-topbar__eyebrow">
              {language === 'es' ? 'Ecosistema Anclora' : 'Anclora Ecosystem'}
            </p>
            <h1 className="ac-topbar__title" style={{ fontFamily: 'var(--font-display, DM Sans, sans-serif)' }}>
              {language === 'es' ? 'Evaluación Fiscal 183' : 'Fiscal Assessment 183'}
            </h1>
          </div>
        </Link>

        <div className="ac-topbar__actions shrink-0">
          <div className="ac-topbar__meta hidden xl:flex">
            <span>{language === 'es' ? 'Herramienta de residencia fiscal' : 'Fiscal residency tool'}</span>
          </div>
          <div className="anclora-header-controls">
            <button
              type="button"
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
              className="anclora-control-chip"
            >
              <Languages className="h-4 w-4" />
              <span>{language === 'es' ? 'English' : 'Español'}</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="anclora-control-chip anclora-control-chip--icon"
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
