import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from '@/components/ui/sonner';
import TaxNomadCalculator from './pages/TaxNomadCalculator';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentTest from './pages/PaymentTest';
import { ThemeProvider } from './contexts/ThemeContext';
import { I18nProvider } from './contexts/i18nContext';

export default function App() {
  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    const taxonomyClasses = [
      'tier-ultra-premium',
      'domain-real-estate',
      'archetype-app',
      'role-consumer',
      'cluster-core',
      'product-anclora-adoption-lab',
    ];

    body.classList.add('anclora-adoption-body', ...taxonomyClasses);
    root.classList.add('anclora-adoption-root');

    return () => {
      body.classList.remove('anclora-adoption-body', ...taxonomyClasses);
      root.classList.remove('anclora-adoption-root');
    };
  }, []);

  return (
    <HelmetProvider>
      <ThemeProvider>
        <I18nProvider>
          <div className="anclora-adoption-app">
            <Router>
              <Routes>
                <Route path="/" element={<TaxNomadCalculator />} />
                <Route path="/calculator" element={<TaxNomadCalculator />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/payment-test" element={<PaymentTest />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="*" element={<TaxNomadCalculator />} />
              </Routes>
            </Router>
          </div>
          <Toaster position="top-center" richColors />
        </I18nProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
