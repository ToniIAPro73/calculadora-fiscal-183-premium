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

function validateEmail(email: string | undefined): boolean {
  if (!email) return true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateTotalDays(days: number | undefined): boolean {
  if (days === undefined || days === null) return false;
  const numDays = Number(days);
  return !isNaN(numDays) && numDays > 0 && numDays <= 365;
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

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'name is required and must be a non-empty string' });
    }

    if (!taxId || typeof taxId !== 'string' || taxId.trim().length === 0) {
      return res.status(400).json({ error: 'taxId is required and must be a non-empty string' });
    }

    // Validate totalDays
    if (!validateTotalDays(totalDays)) {
      return res.status(400).json({ error: 'totalDays is required and must be between 1 and 365' });
    }

    // Validate email if provided
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate ranges if provided
    if (ranges && !Array.isArray(ranges)) {
      return res.status(400).json({ error: 'ranges must be an array' });
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
      try {
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
        console.log('Draft report created successfully:', reportKey);
      } catch (dbError) {
        console.error('Error creating draft report:', dbError);
        throw dbError;
      }

      // Create Stripe checkout session
      let session;
      try {
        session = await stripe.checkout.sessions.create({
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
        console.log('Stripe session created successfully:', {
          sessionId: session.id,
          reportKey,
          clientReferenceId,
        });
      } catch (stripeError) {
        const err = stripeError as any;
        console.error('Stripe session creation failed:', {
          error: err.message,
          code: err.code,
          type: err.type,
          reportKey,
        });
        throw new Error(`Stripe error: ${err.message || 'Failed to create checkout session'}`);
      }

      // Attach Stripe session to report
      try {
        await attachStripeSession({
          reportKey,
          stripeSessionId: session.id,
          clientReferenceId,
        });
        console.log('Stripe session attached to report:', {
          reportKey,
          sessionId: session.id,
        });
      } catch (attachError) {
        console.error('Failed to attach Stripe session to report:', {
          error: attachError,
          reportKey,
          sessionId: session.id,
        });
        throw new Error('Failed to save session data. Please try again.');
      }

      return res.status(200).json({
        url: session.url,
        mode: 'stripe',
        sessionId: session.id,
        reportKey,
      });
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
    console.error('Checkout session error:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
    return res.status(500).json({
      error: err.message || 'Failed to create checkout session',
      timestamp: new Date().toISOString(),
    });
  }
}
