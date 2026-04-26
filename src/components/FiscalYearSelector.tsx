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
  const { language } = useLanguage();
  const availableYears = getAvailableYears(5);
  const currentYear = getCurrentYear();

  return (
    <div className="flex flex-col gap-3 rounded-[28px] border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--surface-subtle)_92%,transparent)] px-4 py-4 md:flex-row md:items-center">
      <label className="field-label whitespace-nowrap">
        {language === 'es' ? 'Ejercicio Fiscal' : 'Fiscal Year'}
      </label>
      <Select value={selectedYear.toString()} onValueChange={(value) => onYearChange(parseInt(value, 10))}>
        <SelectTrigger className="field-input h-12 w-full min-w-0 rounded-full text-sm font-medium md:w-[15rem]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
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
