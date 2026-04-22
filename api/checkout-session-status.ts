import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { getReportByStripeSessionId, getReportByReportKey } from './_lib/report-store';

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

  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ error: 'session_id is required' });
  }

  try {
    const stripe = getStripeClient();
    const session = (await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    })) as Stripe.Checkout.Session & {
      payment_intent?: Stripe.PaymentIntent;
    };

    const report =
      (await getReportByStripeSessionId(session.id)) ||
      (await getReportByReportKey((session.metadata?.report_key as string) || null));

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

    return res.status(200).json(response);
  } catch (error) {
    const err = error as Error;
    console.error('Checkout session status error:', err.message);
    return res.status(500).json({ error: 'Unable to verify checkout session' });
  }
}
