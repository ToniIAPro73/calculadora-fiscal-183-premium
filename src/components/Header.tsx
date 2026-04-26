import React from 'react';
import { useLanguage } from '@/contexts/i18nContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Globe, Sun, Moon } from 'lucide-react';
import logo from '@/assets/logo.webp';
import { useTheme } from '@/contexts/ThemeContext';

const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full px-4 pt-4 md:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between ac-topbar">
        <Link to="/" className="ac-topbar__brand hover:opacity-90 transition-opacity cursor-pointer">
          <img
            src={logo}
            alt="Anclora Advisory"
            className="h-16 w-16 rounded-full border border-[var(--border-default)] object-cover shadow-lg"
          />
          <div className="ac-topbar__titles">
            <p className="ac-topbar__eyebrow">Anclora Adoption Lab</p>
            <h1 className="ac-topbar__title anclora-brand-title">Residency Intelligence 183</h1>
          </div>
        </Link>

        <div className="ac-topbar__actions">
          <div className="ac-topbar__meta hidden md:flex">
            <span>Ultra Premium Stress Test</span>
            <div className="ac-topbar__divider"></div>
            <button
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
              className="hover:opacity-100 transition-opacity flex items-center gap-2"
            >
              <Globe className="w-3.5 h-3.5" />
              {language === 'es' ? 'English' : 'Español'}
            </button>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="opacity-80 hover:opacity-100 transition-all"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
