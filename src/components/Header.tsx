import React from 'react';
import { useLanguage } from '@/contexts/i18nContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import logo from '@/assets/logo.webp';
import { useTheme } from '@/contexts/ThemeContext';
import { getLanguageFromPath, swapLanguageInPath } from '@/lib/seo';

const Header: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLanguageToggle = () => {
    const nextLanguage = language === 'es' ? 'en' : 'es';
    setLanguage(nextLanguage);

    const routeLanguage = getLanguageFromPath(location.pathname);
    if (routeLanguage) {
      navigate(`${swapLanguageInPath(location.pathname, nextLanguage)}${location.search}${location.hash}`);
    }
  };

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link to={`/${language}`} className="app-header__brand">
          <img
            src={logo}
            alt="TaxNomad"
            className="h-11 w-11 rounded-full border border-white/10 object-cover shadow-lg"
          />
          <div className="app-header__titles">
            <h1 className="app-header__name">
              TaxNomad
            </h1>
          </div>
        </Link>

        <div className="app-header__controls">
          <button
            type="button"
            onClick={handleLanguageToggle}
            className="app-ctrl-pill"
          >
            <span className="app-ctrl-pill__flag">
              {language === 'es' ? '🇬🇧' : '🇪🇸'}
            </span>
            <span className="app-ctrl-pill__label">
              {language === 'es' ? 'English' : 'Español'}
            </span>
          </button>

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
