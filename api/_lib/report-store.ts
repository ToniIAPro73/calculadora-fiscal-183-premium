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

let sqlInstance: any = null;
let schemaReady = false;

function getSql() {
  if (!sqlInstance) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL not configured');
    }
    sqlInstance = neon(databaseUrl);
  }
  return sqlInstance;
}

async function ensureSchema() {
  if (schemaReady) return;

  const sql = getSql();
  try {
    await sql(`
      CREATE TABLE IF NOT EXISTS premium_reports (
        report_key TEXT PRIMARY KEY,
        stripe_session_id TEXT UNIQUE,
        stripe_payment_intent_id TEXT,
        client_reference_id TEXT,
        source TEXT NOT NULL,
        product_type TEXT NOT NULL,
        name TEXT NOT NULL,
        tax_id TEXT NOT NULL,
        document_type TEXT NOT NULL,
        total_days INTEGER NOT NULL,
        status_label TEXT,
        ranges_json JSONB NOT NULL DEFAULT '[]'::jsonb,
        payment_status TEXT NOT NULL DEFAULT 'pending',
        customer_email TEXT,
        paid_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await sql(`CREATE INDEX IF NOT EXISTS idx_stripe_session_id ON premium_reports(stripe_session_id)`);
    await sql(`CREATE INDEX IF NOT EXISTS idx_payment_status ON premium_reports(payment_status)`);
    await sql(`CREATE INDEX IF NOT EXISTS idx_created_at ON premium_reports(created_at)`);

    schemaReady = true;
  } catch (error) {
    console.error('Error creating schema:', error);
    throw error;
  }
}

export async function createDraftReport(payload: DraftReportPayload): Promise<void> {
  await ensureSchema();
  const sql = getSql();

  try {
    await sql(
      `INSERT INTO premium_reports (
        report_key, source, product_type, name, tax_id, document_type,
        total_days, status_label, ranges_json
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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
  await ensureSchema();
  const sql = getSql();

  try {
    await sql(
      `UPDATE premium_reports SET stripe_session_id = $1, client_reference_id = $2 WHERE report_key = $3`,
      [payload.stripeSessionId, payload.clientReferenceId, payload.reportKey]
    );
    console.log('Stripe session attached:', payload.reportKey);
  } catch (error) {
    console.error('Error attaching Stripe session:', error);
    throw error;
  }
}

export async function getReportByStripeSessionId(sessionId: string): Promise<any> {
  await ensureSchema();
  const sql = getSql();

  try {
    const results = await sql(
      `SELECT * FROM premium_reports WHERE stripe_session_id = $1`,
      [sessionId]
    );
    return results.length > 0 ? mapRow(results[0]) : null;
  } catch (error) {
    console.error('Error getting report by Stripe session ID:', error);
    return null;
  }
}

export async function getReportByReportKey(reportKey: string | null): Promise<any> {
  if (!reportKey) {
    return null;
  }

  await ensureSchema();
  const sql = getSql();

  try {
    const results = await sql(
      `SELECT * FROM premium_reports WHERE report_key = $1`,
      [reportKey]
    );
    return results.length > 0 ? mapRow(results[0]) : null;
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
  await ensureSchema();
  const sql = getSql();

  try {
    let query = '';
    let params: any[] = [];

    if (data.reportKey) {
      query = `UPDATE premium_reports
        SET payment_status = $1, stripe_payment_intent_id = $2, customer_email = $3, updated_at = NOW()
        WHERE report_key = $4`;
      params = [data.paymentStatus, data.stripePaymentIntentId || null, data.customerEmail || null, data.reportKey];
    } else if (data.stripeSessionId) {
      query = `UPDATE premium_reports
        SET payment_status = $1, stripe_payment_intent_id = $2, customer_email = $3, updated_at = NOW()
        WHERE stripe_session_id = $4`;
      params = [data.paymentStatus, data.stripePaymentIntentId || null, data.customerEmail || null, data.stripeSessionId];
    } else {
      console.warn('No reportKey or stripeSessionId provided for status update');
      return;
    }

    await sql(query, params);
    console.log('Report payment status updated:', data);
  } catch (error) {
    console.error('Error updating report payment status:', error);
    throw error;
  }
}

function mapRow(row: any): any {
  if (!row) return null;

  return {
    report_key: row.report_key,
    reportKey: row.report_key,
    stripe_session_id: row.stripe_session_id,
    stripeSessionId: row.stripe_session_id,
    name: row.name,
    taxId: row.tax_id,
    tax_id: row.tax_id,
    documentType: row.document_type,
    document_type: row.document_type,
    totalDays: row.total_days,
    total_days: row.total_days,
    statusLabel: row.status_label,
    status_label: row.status_label,
    ranges: Array.isArray(row.ranges_json) ? row.ranges_json : [],
    ranges_json: row.ranges_json,
    paymentStatus: row.payment_status,
    payment_status: row.payment_status,
    customerEmail: row.customer_email,
    source: row.source,
  };
}
