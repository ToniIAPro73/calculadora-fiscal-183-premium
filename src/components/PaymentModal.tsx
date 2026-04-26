import React, { useState } from 'react';
import { useLanguage } from '@/contexts/i18nContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: {
    name: string;
    documentType: string;
    taxId: string;
    email: string;
  };
  totalDays: number;
  onPaymentSuccess?: () => void;
  isLoading?: boolean;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  userData,
  totalDays,
  onPaymentSuccess,
  isLoading = false,
}) => {
  const { t, language } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInitiatePayment = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userData.name,
          taxId: userData.taxId,
          documentType: userData.documentType,
          email: userData.email,
          totalDays,
          statusLabel: `${totalDays} days of physical presence in Spain`,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { url, mode } = await response.json();

      if (mode === 'mock_dev') {
        toast.success(t('toast.mockModeEnabled') || 'Mock mode enabled - development only');
        // Simulate success for development
        setTimeout(() => {
          onPaymentSuccess?.();
        }, 1500);
      } else if (url) {
        window.location.href = url;
      }
    } catch (error) {
      const err = error as Error;
      console.error('Payment initiation error:', err);
      toast.error(err.message || 'Failed to initiate payment');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="taxnomad-modal w-[min(92vw,32rem)] max-w-none overflow-hidden p-0">
        <DialogHeader className="px-6 pb-4 pt-6 text-center sm:text-center">
          <p className="ac-modal__meta text-center">Secure checkout</p>
          <DialogTitle>
            {t('payment.title') || 'Complete Your Purchase'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {language === 'es'
              ? 'Entrega segura del informe con pago procesado por Stripe.'
              : 'Secure report delivery with payment processed by Stripe.'}
          </DialogDescription>
        </DialogHeader>

        <div className="taxnomad-modal__body ac-modal__body space-y-5 px-6 pb-4">
          <Card className="ac-surface-panel--subtle p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--text-muted)]">{t('payment.item') || 'Premium Report'}</span>
                <span className="font-semibold text-[var(--text-primary)]">€9.99</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--text-muted)]">{t('payment.days') || 'Total Days'}</span>
                <span className="font-semibold text-[var(--text-primary)]">{totalDays}</span>
              </div>
              <div className="h-[1px] bg-[var(--border-subtle)]"></div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[var(--text-primary)]">{t('payment.total') || 'Total'}</span>
                <span className="text-xl font-bold text-primary">€9.99</span>
              </div>
            </div>
          </Card>

          <Card className="ac-surface-panel--subtle p-4">
            <div className="space-y-2 text-sm">
              <div>
                <p className="mb-1 text-xs uppercase tracking-widest text-[var(--text-muted)]">
                  {t('labels.name') || 'Name'}
                </p>
                <p className="font-medium text-[var(--text-primary)]">{userData.name || 'N/A'}</p>
              </div>
              <div>
                <p className="mb-1 text-xs uppercase tracking-widest text-[var(--text-muted)]">
                  {t('labels.taxId') || 'Tax ID / NIE'}
                </p>
                <p className="font-medium text-[var(--text-primary)]">{userData.taxId || 'N/A'}</p>
              </div>
            </div>
          </Card>

          <div className="flex items-start gap-3 rounded-[20px] border border-[var(--border-default)] bg-[color-mix(in_srgb,var(--surface-panel)_88%,transparent)] p-4">
            <Lock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
              {t('payment.secureNote') ||
                'Payments are securely processed by Stripe. Your card information is never stored on our servers.'}
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-[18px] border border-amber-200/30 bg-amber-50/20 p-3">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
              {t('payment.vatNote') || 'Price includes 21% VAT. EU consumers will receive a VAT invoice.'}
            </p>
          </div>
        </div>

        <div className="flex gap-3 border-t border-[var(--border-subtle)] px-6 pb-6 pt-4">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isProcessing || isLoading}
            className="flex-1 rounded-[22px]"
          >
            {t('actions.cancel') || 'Cancel'}
          </Button>
          <Button
            onClick={handleInitiatePayment}
            disabled={isProcessing || isLoading}
            className="flex-1 gap-2 rounded-[22px]"
          >
            {isProcessing || isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('payment.processing') || 'Processing...'}
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                {t('payment.payNow') || 'Pay €9.99'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
