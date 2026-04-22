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
import { DateRange, mergeDateRanges, calculateUniqueDays } from '@/lib/dateRangeMerger';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, ShieldCheck, Download, ExternalLink } from 'lucide-react';
import { buildExampleReportPayload } from '@/lib/reportMetadata';
import { generateTaxReport } from '@/lib/generatePdf';

const TaxNomadCalculator: React.FC = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedRanges, setSelectedRanges] = useState<DateRange[]>([]);
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

  const handleConfirmUserDetails = () => {
    setIsUserDetailsModalOpen(false);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async () => {
    setIsPaymentModalOpen(false);
    toast.success(t('toast.paymentSuccess') || 'Payment successful! Your report is being prepared...');
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

              <DataAuthoritySection />
            </section>
          </div>

          {/* Right Column: Results & CTA */}
          <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit space-y-8">
            <SummaryCard totalDays={totalDays} />

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-[42px] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
              <Card className="relative rounded-[40px] border-white/5 glass overflow-hidden shadow-none">
                <div className="p-8 space-y-12">
                  <ProgressBar totalDays={totalDays} />
                  
                  <div className="space-y-4">
                    <Button
                      disabled={totalDays === 0}
                      onClick={() => setIsUserDetailsModalOpen(true)}
                      className="w-full h-20 rounded-3xl text-sm tracking-[0.2em] font-bold gap-3 shadow-2xl bg-primary hover:bg-primary/80 transition-all active:scale-95"
                    >
                      <FileDown className="w-5 h-5" />
                      {t('calculator.generateReport')}
                    </Button>
                    
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
              <Link to="/privacy" className="hover:text-primary transition-colors cursor-pointer">{t('footer.privacy')}</Link>
              <Link to="/terms" className="hover:text-primary transition-colors cursor-pointer">{t('footer.terms')}</Link>
              <a href="mailto:support@taxnomad.app" className="hover:text-primary transition-colors cursor-pointer">Contact</a>
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
