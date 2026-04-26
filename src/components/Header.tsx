import React from 'react';
import { useLanguage } from '@/contexts/i18nContext';
import { Link } from 'react-router-dom';
import { Sun, Moon, Languages } from 'lucide-react';
import logo from '@/assets/logo.webp';
import { useTheme } from '@/contexts/ThemeContext';

const Header: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  return (
    <header className="anclora-sticky-header sticky top-0 z-50 w-full px-4 py-4 md:px-6">
      <div className="anclora-header-shell mx-auto flex w-full max-w-[88rem] items-center justify-between ac-topbar">
        <Link to="/" className="ac-topbar__brand min-w-0 hover:opacity-90 transition-opacity cursor-pointer">
          <img
            src={logo}
            alt="183 Residency Intelligence"
            className="h-14 w-14 rounded-full border border-[var(--border-default)] object-cover shadow-lg md:h-16 md:w-16"
          />
          <div className="ac-topbar__titles min-w-0">
            <p className="ac-topbar__eyebrow">Residency Intelligence Suite</p>
            <h1 className="ac-topbar__title anclora-brand-title">Residency Intelligence 183</h1>
          </div>
        </Link>

        <div className="ac-topbar__actions shrink-0">
          <div className="ac-topbar__meta hidden xl:flex">
            <span>Private residency calculator</span>
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
