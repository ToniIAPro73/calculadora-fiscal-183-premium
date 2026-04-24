import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createDraftReport, attachStripeSession } from './_lib/report-store.js';

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

  try {
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
    const databaseUrl = process.env.DATABASE_URL;
    const isProduction = process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';

    // Build base URL from APP_URL env var, request headers, or Vercel URL
    let appUrl = process.env.APP_URL;

    if (!appUrl && req.headers.host) {
      const protocol = req.headers['x-forwarded-proto'] || 'https';
      appUrl = `${protocol}://${req.headers.host}`;
    }

    // Fallback to Vercel's automatic URL if available
    if (!appUrl && process.env.VERCEL_URL) {
      const protocol = process.env.VERCEL_ENV === 'production' ? 'https' : 'https';
      appUrl = `${protocol}://${process.env.VERCEL_URL}`;
    }

    // ── REAL STRIPE MODE ──────────────────────────────────────────
    if (stripeKey && databaseUrl) {
      const stripe = new Stripe(stripeKey);
      const baseUrl = normalizeBaseUrl(appUrl || '');

      if (!stripeKey.startsWith('sk_test_') && !stripeKey.startsWith('sk_live_')) {
        return res.status(500).json({ error: 'STRIPE_SECRET_KEY has invalid format' });
      }

      if (!priceId) {
        return res.status(500).json({ error: 'STRIPE_PRICE_ID not configured' });
      }

      if (!baseUrl) {
        console.error('URL construction failed:', {
          appUrl,
          'env.APP_URL': process.env.APP_URL,
          'env.VERCEL_URL': process.env.VERCEL_URL,
          'headers.host': req.headers.host,
          'headers.x-forwarded-proto': req.headers['x-forwarded-proto'],
        });
        return res.status(500).json({ error: 'Unable to construct application URL' });
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
    }

    // ── MOCK / DEV MODE ──────────────────────────────────────────
    if (isProduction) {
      return res.status(500).json({ error: 'Stripe is not configured for production' });
    }

    return res.status(200).json({
      url: '/payment-mock',
      mode: 'mock_dev',
    });
  } catch (error) {
    const err = error as Error;
    console.error('Checkout session error:', err.message);
    return res.status(500).json({ error: err.message || 'Failed to create checkout session' });
  }
}
