import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/i18nContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface TestScenario {
  name: string;
  description: string;
  cardNumber: string;
  expectedResult: string;
  color: string;
}

const PaymentTest: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [expandedScenario, setExpandedScenario] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: 'Test User',
    taxId: 'TEST12345',
    email: 'test@example.com',
    totalDays: 183,
    statusLabel: 'resident',
    documentType: 'passport',
  });

  const TEST_SCENARIOS: TestScenario[] = useMemo(() => [
    {
      name: t('paymentTest.successScenario') || 'Successful Payment',
      description: t('paymentTest.successDesc') || 'Simulates a successfully completed payment',
      cardNumber: '4242 4242 4242 4242',
      expectedResult: 'Pago confirmado - Puede descargar el reporte',
      color: 'bg-green-500/10 border-green-500/20',
    },
    {
      name: t('paymentTest.declinedScenario') || 'Card Declined',
      description: t('paymentTest.declinedDesc') || 'Simulates a card rejected by the bank',
      cardNumber: '4000 0000 0000 0002',
      expectedResult: 'Error de pago - Mostrar mensaje de error',
      color: 'bg-red-500/10 border-red-500/20',
    },
    {
      name: t('paymentTest.threedsecureScenario') || '3D Secure Required',
      description: t('paymentTest.threedsecureDesc') || 'Requires additional authentication (3D Secure)',
      cardNumber: '4000 0025 0000 3155',
      expectedResult: 'Pago pendiente - Requiere verificación',
      color: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      name: t('paymentTest.expiredScenario') || 'Expiration Required',
      description: t('paymentTest.expiredDesc') || 'Expired card - use past date (e.g., 01/23)',
      cardNumber: '4000 0000 0000 0069',
      expectedResult: 'Error - Tarjeta expirada',
      color: 'bg-red-500/10 border-red-500/20',
    },
    {
      name: t('paymentTest.invalidcvcScenario') || 'Invalid CVC',
      description: t('paymentTest.invalidcvcDesc') || 'Valid card but incorrect CVC',
      cardNumber: '4000 0000 0000 0127',
      expectedResult: 'Error - CVC inválido',
      color: 'bg-red-500/10 border-red-500/20',
    },
  ], [t]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalDays' ? parseInt(value) : value,
    }));
  };

  const testPaymentScenario = async (scenario: TestScenario) => {
    setIsLoading(true);
    const scenarioKey = scenario.cardNumber;

    try {
      console.log('Testing scenario:', scenario.name);
      console.log('Test data:', {
        ...formData,
        scenarioCard: scenario.cardNumber,
      });

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          testScenario: scenario.name,
          testCardNumber: scenario.cardNumber,
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        setTestResults(prev => ({
          ...prev,
          [scenarioKey]: {
            status: 'session_created',
            sessionId: data.sessionId,
            reportKey: data.reportKey,
            timestamp: new Date().toISOString(),
            message: `Sesión creada: ${data.sessionId}`,
          },
        }));

        toast.success(`Sesión creada para: ${scenario.name}`);

        setTimeout(() => {
          window.location.href = data.url;
        }, 1000);
      } else {
        setTestResults(prev => ({
          ...prev,
          [scenarioKey]: {
            status: 'error',
            error: data.error,
            timestamp: new Date().toISOString(),
          },
        }));
        toast.error(`Error: ${data.error}`);
      }
    } catch (error) {
      const err = error as Error;
      console.error('Test error:', err);

      setTestResults(prev => ({
        ...prev,
        [scenarioKey]: {
          status: 'error',
          error: err.message,
          timestamp: new Date().toISOString(),
        },
      }));

      toast.error(`Error en test: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getResultIcon = (status: string) => {
    switch (status) {
      case 'session_created':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Payment Testing · Anclora</title>
      </Helmet>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight">{t('paymentTest.title') || 'Payment Testing'}</h1>
              <p className="text-lg opacity-60">
                {t('paymentTest.subtitle') || 'Test different payment scenarios using Stripe test cards'}
              </p>
            </div>

            {/* Form Section */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">{t('paymentTest.testData') || 'Test Data'}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('paymentTest.name') || 'Name'}</label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Test User"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t('paymentTest.taxId') || 'Tax ID'}</label>
                  <Input
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleInputChange}
                    placeholder="TEST12345"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t('paymentTest.email') || 'Email'}</label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="test@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t('paymentTest.totalDays') || 'Total Days'}</label>
                  <Input
                    name="totalDays"
                    type="number"
                    value={formData.totalDays}
                    onChange={handleInputChange}
                    min="1"
                    max="365"
                  />
                </div>
              </div>
            </Card>

            {/* Test Scenarios */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">{t('paymentTest.testScenarios') || 'Test Scenarios'}</h2>
              <div className="grid gap-4">
                {TEST_SCENARIOS.map(scenario => (
                  <Card key={scenario.cardNumber} className={`p-4 border cursor-pointer ${scenario.color}`}>
                    <div
                      onClick={() =>
                        setExpandedScenario(
                          expandedScenario === scenario.cardNumber ? null : scenario.cardNumber
                        )
                      }
                      className="space-y-3"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{scenario.name}</h3>
                          <p className="text-sm opacity-70">{scenario.description}</p>
                        </div>
                        {testResults[scenario.cardNumber] && getResultIcon(testResults[scenario.cardNumber].status)}
                      </div>

                      {/* Expanded Details */}
                      {expandedScenario === scenario.cardNumber && (
                        <div className="space-y-4 pt-4 border-t border-border/20">
                          {/* Card Number Info */}
                          <div className="space-y-2">
                            <p className="text-sm font-mono">Card: {scenario.cardNumber}</p>
                            <p className="text-xs opacity-60">
                              Use any future date (e.g., 12/26) and CVC (e.g., 123)
                            </p>
                            <p className="text-sm">
                              <strong>{t('paymentTest.expectedResult') || 'Expected Result'}:</strong> {scenario.expectedResult}
                            </p>
                          </div>

                          {/* Test Result */}
                          {testResults[scenario.cardNumber] && (
                            <div className="p-3 rounded-lg bg-muted/30 border border-border/10 space-y-2">
                              <p className="text-sm font-mono">
                                Status: <span className="font-bold">{testResults[scenario.cardNumber].status}</span>
                              </p>
                              {testResults[scenario.cardNumber].sessionId && (
                                <p className="text-xs opacity-70">
                                  Session: {testResults[scenario.cardNumber].sessionId}
                                </p>
                              )}
                              {testResults[scenario.cardNumber].error && (
                                <p className="text-sm text-red-500">{testResults[scenario.cardNumber].error}</p>
                              )}
                              <p className="text-xs opacity-50">
                                {new Date(testResults[scenario.cardNumber].timestamp).toLocaleString()}
                              </p>
                            </div>
                          )}

                          {/* Action Button */}
                          <Button
                            onClick={() => testPaymentScenario(scenario)}
                            disabled={isLoading}
                            className="w-full"
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                {t('payment.processing') || 'Processing...'}
                              </>
                            ) : (
                              t('paymentTest.confirmPayment') || 'Confirm Payment'
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <Card className="p-6 bg-primary/5 border-primary/20">
              <h3 className="font-semibold mb-3">{t('paymentTest.testInstructions') || 'Testing Instructions'}</h3>
              <ul className="space-y-2 text-sm opacity-80">
                {(t('paymentTest.instructions') as string[])?.map((instruction, idx) => (
                  <li key={idx}>{instruction}</li>
                )) || (
                  <>
                    <li>✓ Each card will simulate a different result</li>
                    <li>✓ You will be redirected to Stripe to confirm the test</li>
                    <li>✓ Check Vercel logs for detailed debugging</li>
                    <li>✓ Verify that the success page displays data correctly</li>
                    <li>✓ For declined payment, verify that you return to home</li>
                  </>
                )}
              </ul>
            </Card>

            {/* Back Button */}
            <Button variant="ghost" onClick={() => navigate('/')} className="w-full">
              {t('paymentTest.backHome') || 'Back to Home'}
            </Button>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PaymentTest;
