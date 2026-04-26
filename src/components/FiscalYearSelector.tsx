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
    <div className="flex items-center gap-3 rounded-full border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--surface-subtle)_82%,transparent)] px-4 py-3">
      <label className="field-label whitespace-nowrap">
        {language === 'es' ? 'Ejercicio Fiscal' : 'Fiscal Year'}
      </label>
      <Select value={selectedYear.toString()} onValueChange={(value) => onYearChange(parseInt(value, 10))}>
        <SelectTrigger className="field-input h-11 w-36 rounded-full text-sm font-light">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="border-[var(--border-default)] bg-[var(--surface-panel)] shadow-2xl">
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
