import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/i18nContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'sonner';
import Header from '@/components/Header';
import DateRangeSelector from '@/components/DateRangeSelector';
import RangeList from '@/components/RangeList';
import ProgressBar from '@/components/ProgressBar';
import UserDetailsModal from '@/components/UserDetailsModal';
import OnboardingTutorial from '@/components/OnboardingTutorial';
import PaymentStatusModal from '@/components/PaymentStatusModal';
import { DateRange, mergeDateRanges, calculateUniqueDays } from '@/lib/dateRangeMerger';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, ShieldCheck, Download, ExternalLink } from 'lucide-react';
import { buildExampleReportPayload } from '@/lib/reportMetadata';
import { generateTaxReport } from '@/lib/generatePdf';

const stripePromise = loadStripe((import.meta as any).env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const TaxNomadCalculator: React.FC = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [selectedRanges, setSelectedRanges] = useState<DateRange[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userData, setUserData] = useState({ name: '', documentType: 'passport', taxId: '', email: '' });
  
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'error' | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);

  const { merged, annotatedRanges } = mergeDateRanges(selectedRanges);
  const totalDays = calculateUniqueDays(merged);

  useEffect(() => {
    const status = searchParams.get('status');
    const sessionId = searchParams.get('session_id');

    if (status === 'success' && sessionId) {
      setPaymentStatus('success');
      setIsStatusModalOpen(true);
      setHasPaid(true);
      // Clean up URL
      setSearchParams({}, { replace: true });
    } else if (status === 'cancel') {
      setPaymentStatus('error');
      setIsStatusModalOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);
  
  const handleAddRange = (range: DateRange) => {
    setSelectedRanges(prev => [...prev, range]);
    toast.success(t('toast.rangeAdded'));
  };

  const handleRemoveRange = (index: number) => {
    setSelectedRanges(prev => prev.filter((_, i) => i !== index));
    toast.success(t('toast.rangeRemoved'));
  };

  const handleViewExample = async () => {
    const example = buildExampleReportPayload();
    try {
      const doc = await generateTaxReport({
        ...example,
        exampleMode: true
      });
      const blobUrl = doc.output('bloburl');
      window.open(blobUrl, '_blank');
    } catch (error) {
      toast.error(t('toast.errorPreview') || 'Failed to generate preview');
    }
  };

  const handleInitiatePayment = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...userData,
          totalDays,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create payment session');
      }
    } catch (error: any) {
      toast.error(error.message);
      setIsProcessing(false);
    }
  };

  const handleDownloadPremiumPDF = async () => {
    try {
      const doc = await generateTaxReport({
        name: userData.name || 'Premium User',
        taxId: userData.taxId || 'N/A',
        documentType: userData.documentType,
        totalDays,
        ranges: selectedRanges,
      });
      doc.save(`TaxNomad_Report_2026_Premium.pdf`);
      toast.success(t('toast.successReport') || 'Report generated successfully!');
    } catch (error) {
      toast.error(t('toast.errorReport') || 'Failed to generate report');
    }
  };

  const handleBackToDashboard = () => {
    setIsStatusModalOpen(false);
    setPaymentStatus(null);
  };

  return (
    <div className="min-h-screen premium-gradient flex flex-col font-sans text-foreground">
      <Header />
      <OnboardingTutorial />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:py-16">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Left Column: Input & Management */}
          <div className="lg:col-span-8 space-y-12">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-light tracking-tighter leading-none font-serif">
                {t('calculator.heroTitlePrefix')} <span className="neon-accent italic">{t('calculator.heroTitleSuffix')}</span>
              </h1>
              <p className="text-xl opacity-60 font-light max-w-2xl leading-relaxed">
                {t('calculator.heroSubtitle')}
              </p>
            </div>

            <div className="space-y-8">
              <DateRangeSelector onAddRange={handleAddRange} />
              
              <RangeList ranges={annotatedRanges} onRemoveRange={handleRemoveRange} />
            </div>

            <section className="space-y-8 pt-8">
              <div className="flex items-center gap-4">
                <div className="h-[1px] flex-1 bg-border/20"></div>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3 text-primary" />
                  {t('calculator.standards')}
                </h3>
                <div className="h-[1px] flex-1 bg-border/20"></div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="glass border-none rounded-3xl">
                  <CardContent className="p-8 space-y-4">
                    <h4 className="font-serif text-lg neon-accent">{t('calculator.whatCountsTitle')}</h4>
                    <p className="text-xs opacity-50 leading-relaxed font-light">
                      {t('calculator.whatCountsDesc')}
                    </p>
                    <a href="https://sede.agenciatributaria.gob.es/" target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase font-bold tracking-widest stripe-accent flex items-center gap-1 hover:text-foreground transition-colors">
                      {t('calculator.seeOfficialSource')} <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </CardContent>
                </Card>
                <Card className="glass border-none rounded-3xl">
                  <CardContent className="p-8 space-y-4">
                    <h4 className="font-serif text-lg stripe-accent">{t('calculator.rule183Title')}</h4>
                    <p className="text-xs opacity-50 leading-relaxed font-light">
                      {t('calculator.rule183Desc')}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>

          {/* Right Column: Results & CTA */}
          <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit space-y-8">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-[42px] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
              <Card className="relative rounded-[40px] border-white/5 glass overflow-hidden shadow-none">
                <div className="p-8 space-y-12">
                  <ProgressBar totalDays={totalDays} />
                  
                  <div className="space-y-4">
                    {hasPaid ? (
                      <Button 
                        onClick={handleDownloadPremiumPDF}
                        className="w-full h-20 rounded-3xl text-sm tracking-[0.2em] font-bold gap-3 shadow-2xl bg-emerald-500 hover:bg-emerald-400 text-black transition-all active:scale-95"
                      >
                        <Download className="w-5 h-5" />
                        DOWNLOAD PREMIUM PDF
                      </Button>
                    ) : (
                      <Button 
                        disabled={totalDays === 0} 
                        onClick={() => setIsModalOpen(true)}
                        className="w-full h-20 rounded-3xl text-sm tracking-[0.2em] font-bold gap-3 shadow-2xl bg-primary hover:bg-primary/80 transition-all active:scale-95"
                      >
                        <FileDown className="w-5 h-5" />
                        {t('calculator.generateReport')} (9,99€)
                      </Button>
                    )}
                    
                    <Button 
                      variant="ghost" 
                      onClick={handleViewExample}
                      className="w-full h-14 rounded-2xl font-medium opacity-40 hover:opacity-100 hover:bg-accent transition-all gap-2 text-xs uppercase tracking-widest"
                    >
                      <Download className="w-3 h-3" />
                      {t('actions.viewExample')}
                    </Button>
                  </div>

                  <div className="flex flex-col items-center gap-3 pt-4">
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent border border-border text-primary text-[9px] font-bold uppercase tracking-[0.2em]">
                      <ShieldCheck className="w-3 h-3" />
                      {t('calculator.verificationComplete')}
                    </div>
                    <p className="text-[10px] opacity-30 font-light text-center px-4 leading-relaxed">
                      Official reporting standards for Spanish Agencia Tributaria & EU Compliance.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="px-8 space-y-6">
               <h4 className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-20 text-center">{t('calculator.poweredBy')}</h4>
               <div className="flex justify-center items-center gap-8 opacity-20 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-4 dark:invert" />
                  <div className="h-3 w-[1px] bg-border" />
                  <span className="font-bold text-[10px] tracking-widest">NEON DB</span>
               </div>
            </div>
          </div>
          
        </div>
      </main>

      <footer className="border-t border-border py-16 mt-20 opacity-30">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-10">
           <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded bg-accent flex items-center justify-center border border-border">
                <FileDown className="w-4 h-4" />
              </div>
              <span className="font-light text-xs tracking-widest uppercase">© 2026 TaxNomad Digital Utility</span>
           </div>
           <div className="flex gap-10 text-[10px] font-bold uppercase tracking-[0.2em]">
              <a href="#" className="hover:text-primary transition-colors">{t('footer.privacy')}</a>
              <a href="#" className="hover:text-primary transition-colors">{t('footer.terms')}</a>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
           </div>
        </div>
      </footer>


      <UserDetailsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={handleInitiatePayment}
        userData={userData}
        setUserData={setUserData}
        isLoading={isProcessing}
      />

      <PaymentStatusModal 
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        status={paymentStatus}
        onDownload={handleDownloadPremiumPDF}
        onBackToDashboard={handleBackToDashboard}
      />
    </div>
  );
};

export default TaxNomadCalculator;
