import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createDraftReport, attachStripeSession } from './_lib/report-store';

interface CreateSessionRequest {
  name: string;
  taxId: string;
  totalDays: number;
  email?: string;
  statusLabel?: string;
  documentType?: string;
  ranges?: Array<{ start: Date; end: Date }>;
}

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, '');
}

function buildClientReferenceId(taxId: string): string {
  const normalizedTaxId = String(taxId || '')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(-24);

  return `taxnomad_${Date.now()}_${normalizedTaxId || 'guest'}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const {
    name,
    taxId,
    email,
    totalDays,
    statusLabel,
    documentType = 'passport',
    ranges = [],
  } = req.body as CreateSessionRequest;

  if (!name || !taxId) {
    return res.status(400).json({ error: 'name and taxId are required' });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID;
  const appUrl = process.env.APP_URL;
  const isProduction = process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';

  // ── REAL STRIPE MODE ──────────────────────────────────────────
  if (stripeKey) {
    try {
      const stripe = new Stripe(stripeKey);
      const baseUrl = normalizeBaseUrl(appUrl || '');

      if (!stripeKey.startsWith('sk_test_') && !stripeKey.startsWith('sk_live_')) {
        return res.status(500).json({ error: 'STRIPE_SECRET_KEY has invalid format' });
      }

      if (!priceId) {
        return res.status(500).json({ error: 'STRIPE_PRICE_ID not configured' });
      }

      if (!baseUrl) {
        return res.status(500).json({ error: 'APP_URL not configured' });
      }

      const reportKey = crypto.randomUUID();
      const clientReferenceId = buildClientReferenceId(taxId);

      // Create draft report
      await createDraftReport({
        reportKey,
        source: 'taxnomad',
        productType: 'premium_report',
        name,
        taxId,
        documentType: String(documentType || 'passport'),
        totalDays: Number(totalDays ?? 0),
        statusLabel: String(statusLabel ?? ''),
        ranges,
      });

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'payment',
        customer_email: email || undefined,
        success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/?cancelled=true`,
        client_reference_id: clientReferenceId,
        metadata: {
          source: 'taxnomad',
          product_type: 'premium_report',
          report_key: reportKey,
        },
        payment_intent_data: {
          metadata: {
            source: 'taxnomad',
            product_type: 'premium_report',
            report_key: reportKey,
          },
        },
      });

      // Attach Stripe session to report
      await attachStripeSession({
        reportKey,
        stripeSessionId: session.id,
        clientReferenceId,
      });

      return res.status(200).json({ url: session.url, mode: 'stripe' });
    } catch (err) {
      const error = err as Error;
      console.error('Stripe error:', error.message);
      return res.status(500).json({ error: error.message });
    }
  }

  // ── MOCK / DEV MODE ──────────────────────────────────────────
  if (isProduction) {
    return res.status(500).json({ error: 'Stripe is not configured for production' });
  }

  return res.status(200).json({
    url: '/payment-mock',
    mode: 'mock_dev',
  });
}
