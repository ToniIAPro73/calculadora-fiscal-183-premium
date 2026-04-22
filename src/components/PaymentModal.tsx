import React, { useState } from 'react';
import { useLanguage } from '@/contexts/i18nContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  const { t } = useLanguage();
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {t('payment.title') || 'Complete Your Purchase'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Order Summary */}
          <Card className="p-4 bg-muted/50 border border-border/20">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="opacity-60">{t('payment.item') || 'Premium Report'}</span>
                <span className="font-semibold">€9.99</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="opacity-60">{t('payment.days') || 'Total Days'}</span>
                <span className="font-semibold">{totalDays}</span>
              </div>
              <div className="h-[1px] bg-border/20"></div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">{t('payment.total') || 'Total'}</span>
                <span className="text-xl font-bold text-primary">€9.99</span>
              </div>
            </div>
          </Card>

          {/* User Info Display */}
          <Card className="p-4 bg-muted/30 border border-border/20">
            <div className="space-y-2 text-sm">
              <div>
                <p className="opacity-60 text-xs uppercase tracking-widest mb-1">
                  {t('labels.name') || 'Name'}
                </p>
                <p className="font-medium">{userData.name || 'N/A'}</p>
              </div>
              <div>
                <p className="opacity-60 text-xs uppercase tracking-widest mb-1">
                  {t('labels.taxId') || 'Tax ID / NIE'}
                </p>
                <p className="font-medium">{userData.taxId || 'N/A'}</p>
              </div>
            </div>
          </Card>

          {/* Security Info */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
            <Lock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs opacity-70 leading-relaxed">
              {t('payment.secureNote') ||
                'Payments are securely processed by Stripe. Your card information is never stored on our servers.'}
            </p>
          </div>

          {/* VAT Disclaimer */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50/30 border border-amber-200/20">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs opacity-70 leading-relaxed">
              {t('payment.vatNote') || 'Price includes 21% VAT. EU consumers will receive a VAT invoice.'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isProcessing || isLoading}
            className="flex-1"
          >
            {t('actions.cancel') || 'Cancel'}
          </Button>
          <Button
            onClick={handleInitiatePayment}
            disabled={isProcessing || isLoading}
            className="flex-1 gap-2"
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
