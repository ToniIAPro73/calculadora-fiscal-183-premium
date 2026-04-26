import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from '@/components/ui/sonner';
import TaxNomadCalculator from './pages/TaxNomadCalculator';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import LegalNotice from './pages/LegalNotice';
import CookiePolicy from './pages/CookiePolicy';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentTest from './pages/PaymentTest';
import CookieBanner from './components/CookieBanner';
import { ThemeProvider } from './contexts/ThemeContext';
import { I18nProvider } from './contexts/i18nContext';
import { getLanguageFromPath } from './lib/seo';

function AppShell() {
  const location = useLocation();
  const initialLanguage = getLanguageFromPath(location.pathname) || 'es';

  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    const taxonomyClasses = [
      'tier-premium',
      'domain-fiscal',
      'archetype-utility',
      'role-consumer',
      'cluster-activation',
      'product-calculadora-fiscal-183',
    ];

    body.classList.add('anclora-adoption-body', ...taxonomyClasses);
    root.classList.add('anclora-adoption-root', ...taxonomyClasses);

    return () => {
      body.classList.remove('anclora-adoption-body', ...taxonomyClasses);
      root.classList.remove('anclora-adoption-root', ...taxonomyClasses);
    };
  }, []);

  return (
    <I18nProvider initialLanguage={initialLanguage}>
      <div className="anclora-adoption-app">
        <Routes>
          <Route path="/" element={<Navigate to="/es" replace />} />
          <Route path="/calculator" element={<Navigate to="/es/calculator" replace />} />
          <Route path="/privacy" element={<Navigate to="/es/privacy" replace />} />
          <Route path="/terms" element={<Navigate to="/es/terms" replace />} />
          <Route path="/legal" element={<Navigate to="/es/legal" replace />} />
          <Route path="/cookies" element={<Navigate to="/es/cookies" replace />} />

          <Route path="/es" element={<TaxNomadCalculator />} />
          <Route path="/en" element={<TaxNomadCalculator />} />
          <Route path="/es/calculator" element={<TaxNomadCalculator />} />
          <Route path="/en/calculator" element={<TaxNomadCalculator />} />
          <Route path="/es/privacy" element={<PrivacyPolicy />} />
          <Route path="/en/privacy" element={<PrivacyPolicy />} />
          <Route path="/es/terms" element={<TermsOfService />} />
          <Route path="/en/terms" element={<TermsOfService />} />
          <Route path="/es/legal" element={<LegalNotice />} />
          <Route path="/en/legal" element={<LegalNotice />} />
          <Route path="/es/cookies" element={<CookiePolicy />} />
          <Route path="/en/cookies" element={<CookiePolicy />} />

          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-test" element={<PaymentTest />} />
          <Route path="*" element={<Navigate to="/es" replace />} />
        </Routes>
      </div>
      <CookieBanner />
      <Toaster position="top-center" richColors />
    </I18nProvider>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <Router>
          <AppShell />
        </Router>
      </ThemeProvider>
    </HelmetProvider>
  );
}
