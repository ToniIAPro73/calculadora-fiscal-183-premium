export const getCurrentYear = (): number => new Date().getFullYear();

export const getAvailableYears = (yearsBack: number = 5): number[] => {
  const current = getCurrentYear();
  const years: number[] = [];
  for (let i = 0; i < yearsBack; i++) {
    years.unshift(current - i);
  }
  return years;
};

export const formatFiscalYear = (year: number, language: string = 'en'): string => {
  if (language === 'es') {
    return `Ejercicio ${year}`;
  }
  return `Fiscal Year ${year}`;
};

export const formatFiscalYearShort = (year: number, language: string = 'en'): string => {
  if (language === 'es') {
    return `Año ${year}`;
  }
  return `${year}`;
};
