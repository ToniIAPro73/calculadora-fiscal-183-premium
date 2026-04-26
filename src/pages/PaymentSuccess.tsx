import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/i18nContext';
import { toast } from 'sonner';
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Download,
  AlertCircle,
  Clock,
  Home,
  Loader2,
  FileText,
} from 'lucide-react';
import { generateTaxReport } from '@/lib/generatePdf';

interface SessionData {
  id: string;
  status: string;
  payment_status: string;
  verified: boolean;
  report_payload: {
    name: string;
    taxId: string;
    documentType: string;
    totalDays: number;
    statusLabel: string;
    ranges: Array<{ start: Date; end: Date }>;
  };
}

const PaymentSuccess: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifySession = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/checkout-session-status?session_id=${sessionId}`);

        if (!response.ok) {
          throw new Error('Failed to verify payment session');
        }

        const data = await response.json();
        setSession(data);

        if (data.verified) {
          toast.success(t('toast.paymentSuccess') || 'Payment successful!');
        }
      } catch (err) {
        const error = err as Error;
        setError(error.message);
        toast.error(error.message || 'Failed to verify payment');
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, [sessionId, t]);

  const handleDownloadReport = async () => {
    if (!session) {
      toast.error('Session data not available');
      return;
    }

    if (!session.report_payload.name || !session.report_payload.taxId) {
      console.error('Missing report data:', session.report_payload);
      toast.error('Report data is incomplete. Please refresh the page.');
      return;
    }

    setIsGeneratingPdf(true);
    try {
      const doc = await generateTaxReport({
        name: session.report_payload.name,
        taxId: session.report_payload.taxId,
        documentType: session.report_payload.documentType,
        totalDays: session.report_payload.totalDays,
        ranges: session.report_payload.ranges,
      });

      doc.save(`Informe_Fiscal_183_Anclora.pdf`);
      toast.success(t('toast.successReport') || 'Report downloaded successfully!');
    } catch (err) {
      const error = err as Error;
      console.error('PDF generation error:', error);
      toast.error(error.message || 'Failed to generate report');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Helmet>
          <title>Procesando · Anclora</title>
        </Helmet>
        <div className="min-h-screen bg-background flex flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center px-4">
            <div className="text-center space-y-3">
              <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" />
              <p className="text-base opacity-60">{t('payment.verifying') || 'Verifying payment...'}</p>
            </div>
          </main>
        </div>
      </>
    );
  }

  const isVerified = session?.verified;
  const isPending = !isVerified && session?.status === 'open';

  return (
    <>
      <Helmet>
        <title>{isVerified ? 'Payment Success' : 'Payment Status'} · Anclora</title>
      </Helmet>
      <div className="min-h-screen premium-gradient flex flex-col font-sans text-foreground">
        <Header />

        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 flex items-center">
          {isVerified && (
            <>
              {/* Success State */}
              <div className="text-center space-y-4">
                {/* Success Icon */}
                <div className="flex justify-center">
                  <div className="relative w-32 h-32">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/20 rounded-full blur-2xl"></div>
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-primary/20 border-2 border-primary">
                      <CheckCircle2 className="w-20 h-20 text-primary fill-primary" />
                    </div>
                  </div>
                </div>

                {/* Success Message */}
                <div className="space-y-1">
                  <h1 className="text-3xl font-light tracking-tighter font-display">
                    {t('payment.successTitle') || 'Payment Confirmed'}
                  </h1>
                  <p className="text-sm opacity-60 max-w-lg mx-auto">
                    {t('payment.successMessage') ||
                      'Your premium tax report is ready for download. Your payment has been processed securely.'}
                  </p>
                </div>

                {/* Session Details */}
                <Card className="p-4 rounded-2xl border border-white/5 glass text-sm">
                  <div className="space-y-3">
                    {/* Report Info */}
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">
                        {t('payment.reportDetails') || 'Report Details'}
                      </h2>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center pb-2 border-b border-border/10">
                          <span className="opacity-60">{t('labels.name') || 'Name'}</span>
                          <span className="font-semibold">{session?.report_payload.name}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-border/10">
                          <span className="opacity-60">{t('labels.taxId') || 'Tax ID'}</span>
                          <span className="font-semibold">{session?.report_payload.taxId}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="opacity-60">{t('calculator.totalDays') || 'Total Days'}</span>
                          <span className="font-bold text-primary">
                            {session?.report_payload.totalDays}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Download Button */}
                <div className="flex flex-col sm:flex-row gap-2 justify-center pt-1">
                  <Button
                    onClick={handleDownloadReport}
                    disabled={isGeneratingPdf}
                    className="h-10 rounded-lg px-6 gap-2 text-xs tracking-widest font-bold"
                  >
                    {isGeneratingPdf ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t('payment.generating') || 'Generating...'}
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        {t('actions.downloadReport') || 'Download PDF'}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/')}
                    className="h-10 rounded-lg px-6 gap-2 text-xs opacity-60 hover:opacity-100"
                  >
                    <Home className="w-4 h-4" />
                    {t('actions.backHome') || 'Back Home'}
                  </Button>
                </div>
              </div>
            </>
          )}

          {isPending && (
            <>
              {/* Pending State */}
              <div className="text-center space-y-4 py-8">
                <div className="flex justify-center">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-lg animate-pulse"></div>
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20">
                      <Clock className="w-10 h-10 text-amber-600" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h1 className="text-3xl font-light tracking-tighter font-display">
                    {t('payment.pendingTitle') || 'Payment Pending'}
                  </h1>
                  <p className="text-sm opacity-60 max-w-lg mx-auto">
                    {t('payment.pendingMessage') ||
                      'Your payment is being processed. This page will update automatically.'}
                  </p>
                </div>

                <Button onClick={() => navigate('/')} variant="ghost" className="gap-2 text-xs h-9">
                  <Home className="w-4 h-4" />
                  {t('actions.backHome') || 'Back Home'}
                </Button>
              </div>
            </>
          )}

          {error && (
            <>
              {/* Error State */}
              <div className="text-center space-y-4 py-8">
                <div className="flex justify-center">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-full blur-lg"></div>
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
                      <AlertCircle className="w-10 h-10 text-red-600" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h1 className="text-3xl font-light tracking-tighter font-display">
                    {t('payment.errorTitle') || 'Verification Failed'}
                  </h1>
                  <p className="text-sm opacity-60 max-w-lg mx-auto">{error}</p>
                </div>

                <Button onClick={() => navigate('/')} className="gap-2 text-xs h-9">
                  <Home className="w-4 h-4" />
                  {t('actions.backHome') || 'Back Home'}
                </Button>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
};

export default PaymentSuccess;
