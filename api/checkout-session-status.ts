import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { getReportByStripeSessionId, getReportByReportKey } from './_lib/report-store.js';

interface SessionStatusResponse {
  id: string;
  mode: string;
  status: string;
  payment_status: string;
  customer_details: { email: string | null; name: string | null } | null;
  metadata: Record<string, string>;
  report_payload: {
    name: string | null;
    taxId: string | null;
    documentType: string;
    totalDays: number;
    statusLabel: string | null;
    ranges: Array<{ start: Date; end: Date }>;
  };
  client_reference_id: string | null;
  report_key: string | null;
  verified: boolean;
}

function getStripeClient(): Stripe {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }
  return new Stripe(stripeKey);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const sessionId = req.query.session_id as string | undefined;

  if (!sessionId || typeof sessionId !== 'string' || sessionId.trim().length === 0) {
    return res.status(400).json({
      error: 'session_id is required and must be a non-empty string',
      timestamp: new Date().toISOString(),
    });
  }

  try {
    let stripe;
    try {
      stripe = getStripeClient();
    } catch (stripeInitError) {
      console.error('Failed to initialize Stripe client:', stripeInitError);
      return res.status(500).json({
        error: 'Stripe is not configured',
        timestamp: new Date().toISOString(),
      });
    }

    let session;
    try {
      session = (await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['payment_intent'],
      })) as Stripe.Checkout.Session & {
        payment_intent?: Stripe.PaymentIntent;
      };

      console.log('Session retrieved from Stripe:', {
        sessionId: session.id,
        status: session.status,
        paymentStatus: session.payment_status,
        reportKeyFromMetadata: session.metadata?.report_key,
      });
    } catch (stripeError) {
      const err = stripeError as any;
      console.error('Stripe session retrieval failed:', {
        sessionId,
        error: err.message,
        code: err.code,
      });
      return res.status(404).json({
        error: 'Session not found or invalid',
        timestamp: new Date().toISOString(),
      });
    }

    let report;
    try {
      report =
        (await getReportByStripeSessionId(session.id)) ||
        (await getReportByReportKey((session.metadata?.report_key as string) || null));

      console.log('Report lookup result:', {
        sessionId: session.id,
        reportFound: !!report,
        reportKey: report?.reportKey ?? 'not-found',
      });
    } catch (dbError) {
      console.error('Database lookup error:', {
        error: dbError,
        sessionId,
      });
    }

    const isVerifiedPayment =
      session.mode === 'payment' &&
      session.payment_status === 'paid' &&
      session.status === 'complete';

    const response: SessionStatusResponse = {
      id: session.id,
      mode: session.mode,
      status: session.status,
      payment_status: session.payment_status,
      customer_details: session.customer_details
        ? {
            email: session.customer_details.email ?? null,
            name: session.customer_details.name ?? null,
          }
        : null,
      metadata: (session.metadata as Record<string, string>) ?? {},
      report_payload: {
        name: report?.name ?? null,
        taxId: report?.taxId ?? null,
        documentType: report?.documentType ?? 'passport',
        totalDays: Number(report?.totalDays ?? 0),
        statusLabel: report?.statusLabel ?? null,
        ranges: report?.ranges ?? [],
      },
      client_reference_id: session.client_reference_id ?? null,
      report_key: report?.reportKey ?? (session.metadata?.report_key as string) ?? null,
      verified: isVerifiedPayment,
    };

    console.log('Session status response:', {
      sessionId: session.id,
      verified: isVerifiedPayment,
      status: session.status,
      paymentStatus: session.payment_status,
    });

    return res.status(200).json(response);
  } catch (error) {
    const err = error as Error;
    console.error('Checkout session status error:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
    return res.status(500).json({
      error: 'Unable to verify checkout session',
      timestamp: new Date().toISOString(),
    });
  }
}
