import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from '@/components/ui/sonner';
import TaxNomadCalculator from './pages/TaxNomadCalculator';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import PaymentSuccess from './pages/PaymentSuccess';
import { ThemeProvider } from './contexts/ThemeContext';
import { I18nProvider } from './contexts/i18nContext';

export default function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <I18nProvider>
          <Router>
            <Routes>
              <Route path="/" element={<TaxNomadCalculator />} />
              <Route path="/calculator" element={<TaxNomadCalculator />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="*" element={<TaxNomadCalculator />} />
            </Routes>
          </Router>
          <Toaster position="top-center" richColors />
        </I18nProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
