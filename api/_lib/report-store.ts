import { neon } from '@neondatabase/serverless';

interface DraftReportPayload {
  reportKey: string;
  source: string;
  productType: string;
  name: string;
  taxId: string;
  documentType: string;
  totalDays: number;
  statusLabel: string;
  ranges: Array<{ start: Date; end: Date }>;
}

interface StripeSessionPayload {
  reportKey: string;
  stripeSessionId: string;
  clientReferenceId: string;
}

function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return neon(databaseUrl);
}

export async function createDraftReport(payload: DraftReportPayload): Promise<void> {
  try {
    const sql = getDb();
    await sql(
      `INSERT INTO reports (report_key, source, product_type, name, tax_id, document_type, total_days, status_label, ranges)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (report_key) DO NOTHING`,
      [
        payload.reportKey,
        payload.source,
        payload.productType,
        payload.name,
        payload.taxId,
        payload.documentType,
        payload.totalDays,
        payload.statusLabel,
        JSON.stringify(payload.ranges),
      ]
    );
    console.log('Draft report created:', payload.reportKey);
  } catch (error) {
    console.error('Error creating draft report:', error);
    throw error;
  }
}

export async function attachStripeSession(payload: StripeSessionPayload): Promise<void> {
  try {
    const sql = getDb();
    await sql(
      `UPDATE reports SET stripe_session_id = $1, client_reference_id = $2 WHERE report_key = $3`,
      [payload.stripeSessionId, payload.clientReferenceId, payload.reportKey]
    );
    console.log('Stripe session attached:', payload.reportKey);
  } catch (error) {
    console.error('Error attaching Stripe session:', error);
    throw error;
  }
}

export async function getReportByStripeSessionId(sessionId: string): Promise<any> {
  try {
    const sql = getDb();
    const results = await sql(
      `SELECT * FROM reports WHERE stripe_session_id = $1`,
      [sessionId]
    );
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Error getting report by Stripe session ID:', error);
    return null;
  }
}

export async function getReportByReportKey(reportKey: string | null): Promise<any> {
  if (!reportKey) {
    return null;
  }
  try {
    const sql = getDb();
    const results = await sql(
      `SELECT * FROM reports WHERE report_key = $1`,
      [reportKey]
    );
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Error getting report by report key:', error);
    return null;
  }
}

export async function updateReportPaymentStatus(data: {
  reportKey?: string | null;
  stripeSessionId?: string;
  stripePaymentIntentId?: string | null;
  paymentStatus: 'paid' | 'completed' | 'expired' | 'failed';
  customerEmail?: string | null;
}): Promise<any> {
  try {
    const sql = getDb();
    let whereClause = '';
    let queryParams: any[] = [];

    if (data.reportKey) {
      whereClause = 'report_key = $4';
      queryParams = [data.paymentStatus, data.stripePaymentIntentId, data.customerEmail, data.reportKey];
    } else if (data.stripeSessionId) {
      whereClause = 'stripe_session_id = $4';
      queryParams = [data.paymentStatus, data.stripePaymentIntentId, data.customerEmail, data.stripeSessionId];
    } else {
      console.warn('No reportKey or stripeSessionId provided for status update');
      return;
    }

    await sql(
      `UPDATE reports
       SET payment_status = $1, stripe_payment_intent_id = $2, customer_email = $3, updated_at = CURRENT_TIMESTAMP
       WHERE ${whereClause}`,
      queryParams
    );
    console.log('Report payment status updated:', data);
  } catch (error) {
    console.error('Error updating report payment status:', error);
    throw error;
  }
}
