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
    <header className="sticky top-0 z-50 w-full border-b border-border/10 glass">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity cursor-pointer">
          <img
            src={logo}
            alt="TaxNomad"
            className="w-20 h-20 rounded-lg"
          />
          <h1 className="text-2xl font-light tracking-widest font-serif">
            TAX<span className="font-bold text-primary">NOMAD</span>
          </h1>
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-8 text-[10px] uppercase tracking-[0.2em] font-bold opacity-70">
            <button
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
              className="hover:opacity-100 transition-opacity flex items-center gap-2"
            >
              <Globe className="w-3.5 h-3.5" />
              {language === 'es' ? 'English' : 'Español'}
            </button>
            <div className="h-4 w-[1px] bg-border/20"></div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="opacity-60 hover:opacity-100 hover:bg-accent rounded-full transition-all"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
