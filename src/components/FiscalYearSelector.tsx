import React from 'react';
import { useLanguage } from '@/contexts/i18nContext';
import { getCurrentYear, getAvailableYears, formatFiscalYear } from '@/lib/fiscalYear';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FiscalYearSelectorProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
}

const FiscalYearSelector: React.FC<FiscalYearSelectorProps> = ({ selectedYear, onYearChange }) => {
  const { t, language } = useLanguage();
  const availableYears = getAvailableYears(5);
  const currentYear = getCurrentYear();

  return (
    <div className="flex items-center gap-3">
      <label className="text-[10px] uppercase tracking-[0.2em] opacity-70 font-bold whitespace-nowrap">
        {language === 'es' ? 'Ejercicio Fiscal' : 'Fiscal Year'}
      </label>
      <Select value={selectedYear.toString()} onValueChange={(value) => onYearChange(parseInt(value, 10))}>
        <SelectTrigger className="w-32 h-10 rounded-lg bg-accent border border-border text-sm font-light">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="glass border-border/50">
          {availableYears.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {formatFiscalYear(year, language)}
              {year === currentYear && ` (${language === 'es' ? 'actual' : 'current'})`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default FiscalYearSelector;
