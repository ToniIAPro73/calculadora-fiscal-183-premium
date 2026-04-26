export const reportOwner = {
  name: 'TaxNomad',
  address: 'regla183.com',
  nif: '',
  email: 'hola@regla183.com',
};

export const buildExampleReportPayload = (fiscalYear: number = 2026) => ({
  name: 'Alex Rivera',
  documentType: 'passport',
  taxId: 'X1234567Z',
  totalDays: 54,
  ranges: [
    { start: new Date(`${fiscalYear}-01-05`), end: new Date(`${fiscalYear}-01-20`), days: 16 },
    { start: new Date(`${fiscalYear}-01-18`), end: new Date(`${fiscalYear}-01-28`), days: 11 },
    { start: new Date(`${fiscalYear}-03-02`), end: new Date(`${fiscalYear}-03-18`), days: 17 },
    { start: new Date(`${fiscalYear}-08-11`), end: new Date(`${fiscalYear}-08-23`), days: 13 },
  ],
  exampleMode: true,
});
