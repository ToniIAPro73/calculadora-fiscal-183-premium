import React from 'react';
import { useLanguage } from '@/contexts/i18nContext';
import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import logo from '@/assets/logo.webp';
import { useTheme } from '@/contexts/ThemeContext';

const Header: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  return (
    <header className="app-header">
      <div className="app-header__inner">
        {/* Brand */}
        <Link to="/" className="app-header__brand">
          <img
            src={logo}
            alt="Evaluación Fiscal 183"
            className="h-11 w-11 rounded-full border border-white/10 object-cover shadow-lg"
          />
          <div className="app-header__titles">
            <p className="app-header__eyebrow">
              {language === 'es' ? 'ECOSISTEMA ANCLORA' : 'ANCLORA ECOSYSTEM'}
            </p>
            <h1 className="app-header__name">
              {language === 'es' ? 'Evaluación Fiscal 183' : 'Fiscal Assessment 183'}
            </h1>
          </div>
        </Link>

        {/* Controls */}
        <div className="app-header__controls">
          <span className="app-header__tagline hidden xl:block">
            {language === 'es' ? 'Herramienta de residencia fiscal' : 'Fiscal residency tool'}
          </span>

          {/* Language toggle */}
          <button
            type="button"
            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
            className="app-ctrl-pill"
          >
            <span className="app-ctrl-pill__flag">
              {language === 'es' ? '🇬🇧' : '🇪🇸'}
            </span>
            <span className="app-ctrl-pill__label">
              {language === 'es' ? 'English' : 'Español'}
            </span>
          </button>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="app-ctrl-icon"
            aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {theme === 'dark'
              ? <Sun className="h-4 w-4" />
              : <Moon className="h-4 w-4" />
            }
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
