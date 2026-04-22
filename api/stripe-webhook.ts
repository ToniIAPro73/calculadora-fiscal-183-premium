import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { updateReportPaymentStatus } from './_lib/report-store';

const stripeKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

function getStripeClient(): Stripe {
  if (!stripeKey) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }
  return new Stripe(stripeKey);
}

async function readRawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];

  return new Promise((resolve, reject) => {
    req.on('data', (chunk: Buffer | string) => {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    });

    req.on('end', () => {
      resolve(Buffer.concat(chunks));
    });

    req.on('error', reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!webhookSecret) {
    return res.status(500).json({ error: 'STRIPE_WEBHOOK_SECRET not configured' });
  }

  const signature = req.headers['stripe-signature'] as string | undefined;
  if (!signature) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  try {
    const stripe = getStripeClient();
    const payload = await readRawBody(req);
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await updateReportPaymentStatus({
          reportKey: (session.metadata?.report_key as string) ?? null,
          stripeSessionId: session.id,
          stripePaymentIntentId:
            typeof session.payment_intent === 'string' ? session.payment_intent : null,
          paymentStatus: session.payment_status === 'paid' ? 'paid' : 'completed',
          customerEmail: session.customer_details?.email ?? null,
        });
        console.log('Stripe webhook: checkout.session.completed', {
          id: session.id,
          client_reference_id: session.client_reference_id,
          payment_status: session.payment_status,
          metadata: session.metadata,
        });
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        await updateReportPaymentStatus({
          reportKey: (session.metadata?.report_key as string) ?? null,
          stripeSessionId: session.id,
          paymentStatus: 'expired',
          customerEmail: session.customer_details?.email ?? null,
        });
        console.log('Stripe webhook: checkout.session.expired', {
          id: session.id,
          client_reference_id: session.client_reference_id,
        });
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await updateReportPaymentStatus({
          reportKey: (paymentIntent.metadata?.report_key as string) ?? null,
          stripePaymentIntentId: paymentIntent.id,
          paymentStatus: 'failed',
          customerEmail: paymentIntent.receipt_email ?? null,
        });
        console.log('Stripe webhook: payment_intent.payment_failed', {
          id: paymentIntent.id,
          metadata: paymentIntent.metadata,
        });
        break;
      }

      default:
        console.log('Stripe webhook: unhandled event type', event.type);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    const err = error as Error;
    console.error('Stripe webhook verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }
}
