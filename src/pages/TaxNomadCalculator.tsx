import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/i18nContext';
import { useSearchParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import Header from '@/components/Header';
import DateRangeSelector from '@/components/DateRangeSelector';
import RangeList from '@/components/RangeList';
import ProgressBar from '@/components/ProgressBar';
import SummaryCard from '@/components/SummaryCard';
import DataAuthoritySection from '@/components/DataAuthoritySection';
import UserDetailsModal from '@/components/UserDetailsModal';
import PaymentModal from '@/components/PaymentModal';
import OnboardingTutorial from '@/components/OnboardingTutorial';
import FiscalYearSelector from '@/components/FiscalYearSelector';
import { getCurrentYear } from '@/lib/fiscalYear';
import { DateRange, mergeDateRanges, calculateUniqueDays, validateDateRanges } from '@/lib/dateRangeMerger';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, ShieldCheck, Download, Sparkles, Building2, BriefcaseBusiness } from 'lucide-react';
import logo from '@/assets/logo.webp';
import { buildExampleReportPayload } from '@/lib/reportMetadata';
import { generateTaxReport } from '@/lib/generatePdf';

const TaxNomadCalculator: React.FC = () => {
  const { t, language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedRanges, setSelectedRanges] = useState<DateRange[]>([]);
  const [fiscalYear, setFiscalYear] = useState<number>(getCurrentYear());
  const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userData, setUserData] = useState({ name: '', documentType: 'passport', taxId: '', email: '' });

  const { merged, annotatedRanges } = mergeDateRanges(selectedRanges);
  const totalDays = calculateUniqueDays(merged);

  useEffect(() => {
    // Clean up URL search params
    if (searchParams.toString()) {
      setSearchParams({}, { replace: true });
    }
  }, []);

  useEffect(() => {
    // Domain validation: enforce no future dates even if client-side is bypassed
    if (selectedRanges.length > 0) {
      const validation = validateDateRanges(selectedRanges);
      if (!validation.valid) {
        toast.error(validation.error || t('toast.futureDate'));
        // Clear invalid ranges to protect report integrity
        setSelectedRanges([]);
      }
    }
  }, [selectedRanges, t]);
  
  const handleAddRange = (range: DateRange) => {
    setSelectedRanges(prev => [...prev, range]);
    toast.success(t('toast.rangeAdded'));
  };

  const handleRemoveRange = (index: number) => {
    setSelectedRanges(prev => prev.filter((_, i) => i !== index));
    toast.success(t('toast.rangeRemoved'));
  };

  const handleViewExample = async () => {
    const example = buildExampleReportPayload(fiscalYear);
    try {
      const doc = await generateTaxReport({
        ...example,
        exampleMode: true,
        fiscalYear,
        language
      });
      const blobUrl = doc.output('bloburl');
      window.open(blobUrl, '_blank');
    } catch (error) {
      toast.error(t('toast.errorPreview') || 'Failed to generate preview');
    }
  };

  const handleConfirmUserDetails = () => {
    setIsUserDetailsModalOpen(false);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async () => {
    setIsPaymentModalOpen(false);
    toast.success(t('toast.paymentSuccess') || 'Payment successful! Your report is being prepared...');
  };

  const handleFiscalYearChange = (newYear: number) => {
    setFiscalYear(newYear);
    setSelectedRanges([]);
    setUserData({ name: '', documentType: 'passport', taxId: '', email: '' });
    setIsUserDetailsModalOpen(false);
    setIsPaymentModalOpen(false);
    toast.success(t('toast.fiscalYearChanged') || `Fiscal year changed to ${newYear}. Data has been reset.`);
  };


  return (
    <div className="min-h-screen premium-gradient flex flex-col font-sans text-foreground">
      <Header />
      <OnboardingTutorial />
      
      <main className="anclora-ultra-main">
        <section className="anclora-hero-shell">
          <div className="anclora-hero-grid">
            <div className="space-y-6">
              <div className="anclora-hero-copy">
                <div className="anclora-pill">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Adopted Into Anclora Ultra Premium</span>
                </div>
                <h1 className="anclora-hero-title">
                  {t('calculator.heroTitlePrefix')} <span>{t('calculator.heroTitleSuffix')}</span>
                </h1>
                <p className="anclora-hero-summary">
                  {t('calculator.heroSubtitle')}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <article className="anclora-metric-tile">
                  <Building2 className="h-5 w-5 text-[var(--accent)]" />
                  <div>
                    <p className="anclora-metric-label">Positioning</p>
                    <p className="anclora-metric-value">Institutional advisory shell</p>
                  </div>
                </article>
                <article className="anclora-metric-tile">
                  <ShieldCheck className="h-5 w-5 text-[var(--accent)]" />
                  <div>
                    <p className="anclora-metric-label">Evidence Layer</p>
                    <p className="anclora-metric-value">Audit-ready compliance narrative</p>
                  </div>
                </article>
                <article className="anclora-metric-tile">
                  <BriefcaseBusiness className="h-5 w-5 text-[var(--accent)]" />
                  <div>
                    <p className="anclora-metric-label">Stress-Test Goal</p>
                    <p className="anclora-metric-value">Validate UI/UX absorption capacity</p>
                  </div>
                </article>
              </div>
            </div>

            <div className="anclora-hero-aside">
              <div className="anclora-pill anclora-pill--subtle">
                <span>Fiscal Year Context</span>
              </div>
              <FiscalYearSelector selectedYear={fiscalYear} onYearChange={handleFiscalYearChange} />
              <p className="text-sm leading-7 text-[var(--text-secondary)]">
                This adopted surface reframes a standalone calculator into an ultra premium advisory experience without changing its underlying fiscal workflow.
              </p>
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-16 lg:grid-cols-12 lg:px-6">

          {/* Left Column: Input & Management */}
          <div className="lg:col-span-8 space-y-12">
            <div className="ac-surface-panel ac-surface-panel--strong">
              <div className="ac-surface-panel__header">
                <p className="ac-surface-panel__eyebrow">Adoption shell</p>
                <h2 className="ac-surface-panel__title">Private residency control workflow</h2>
              </div>
              <div className="ac-surface-panel__body">
                <p>
                  The original utility remains intact, but its surface is now evaluated against Anclora&apos;s ultra premium grammar: composure, advisory tone, evidentiary trust and institutional finish.
                </p>
                <div className="anclora-metric-grid">
                  <div className="anclora-support-card">
                    <span className="anclora-support-label">Profile target</span>
                    <strong>Ultra premium app</strong>
                  </div>
                  <div className="anclora-support-card">
                    <span className="anclora-support-label">Surface role</span>
                    <strong>Concierge-style compliance tool</strong>
                  </div>
                  <div className="anclora-support-card">
                    <span className="anclora-support-label">Adoption mode</span>
                    <strong>Foreign repo transformation</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <DateRangeSelector onAddRange={handleAddRange} />
              
              <RangeList ranges={annotatedRanges} onRemoveRange={handleRemoveRange} />
            </div>

            <section className="space-y-8 pt-8">
              <div className="flex items-center gap-4">
                <div className="h-[1px] flex-1 bg-[var(--border-subtle)]"></div>
                <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-eyebrow)]">
                  <ShieldCheck className="w-3 h-3 text-primary" />
                  {t('calculator.standards')}
                </h3>
                <div className="h-[1px] flex-1 bg-[var(--border-subtle)]"></div>
              </div>

              <DataAuthoritySection />
            </section>
          </div>

          {/* Right Column: Results & CTA */}
          <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit space-y-8">
            <SummaryCard totalDays={totalDays} />

            <div className="relative group">
              <div className="absolute -inset-2 rounded-[42px] bg-[radial-gradient(circle_at_top,color-mix(in_srgb,var(--domain-glow)_30%,transparent),transparent_60%)] blur-2xl opacity-70"></div>
              <Card className="anclora-cta-card relative overflow-hidden">
                <div className="p-8 space-y-12">
                  <ProgressBar totalDays={totalDays} />
                  
                  <div className="space-y-4">
                    <Button
                      disabled={totalDays === 0}
                      onClick={() => setIsUserDetailsModalOpen(true)}
                      className="w-full min-h-[5rem] rounded-[26px] text-sm gap-3 shadow-2xl active:scale-95"
                    >
                      <FileDown className="w-5 h-5" />
                      {t('calculator.generateReport')}
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      onClick={handleViewExample}
                      className="w-full min-h-[3.75rem] rounded-[22px] text-xs font-medium opacity-75 transition-all gap-2 hover:opacity-100"
                    >
                      <Download className="w-3 h-3" />
                      {t('actions.viewExample')}
                    </Button>
                  </div>

                  <div className="flex flex-col items-center gap-3 pt-4">
                    <div className="flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[color-mix(in_srgb,var(--surface-panel)_88%,transparent)] px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
                      <ShieldCheck className="w-3 h-3" />
                      {t('calculator.verificationComplete')}
                    </div>
                    <p className="px-4 text-center text-[10px] font-light leading-relaxed text-[var(--text-muted)]">
                      {t('calculator.complianceNote') || 'Official reporting standards for Spanish Agencia Tributaria & EU Compliance.'}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

          </div>
          
        </div>
      </main>

      <footer className="anclora-legal-footer">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-10 px-4 md:flex-row md:px-6">
           <div className="flex items-center gap-4">
              <img src={logo} alt="Anclora Advisory" className="h-16 w-16 rounded-full border border-[var(--border-default)]" />
              <span className="text-xs font-light uppercase tracking-widest text-[var(--text-secondary)]">{t('footer.copyright') || '© 2026 TaxNomad. All rights reserved.'}</span>
           </div>
           <div className="flex gap-10 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)]">
              <Link to="/privacy" className="cursor-pointer transition-colors hover:text-[var(--accent)] hover:opacity-100">{t('footer.privacy')}</Link>
              <Link to="/terms" className="cursor-pointer transition-colors hover:text-[var(--accent)] hover:opacity-100">{t('footer.terms')}</Link>
              <a href="mailto:hola@regla183.com" className="cursor-pointer transition-colors hover:text-[var(--accent)] hover:opacity-100">{t('footer.contact') || 'Contact'}</a>
           </div>
        </div>
      </footer>


      <UserDetailsModal
        isOpen={isUserDetailsModalOpen}
        onClose={() => setIsUserDetailsModalOpen(false)}
        onConfirm={handleConfirmUserDetails}
        userData={userData}
        setUserData={setUserData}
        isLoading={isProcessing}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        userData={userData}
        totalDays={totalDays}
        onPaymentSuccess={handlePaymentSuccess}
        isLoading={isProcessing}
      />
    </div>
  );
};

export default TaxNomadCalculator;
