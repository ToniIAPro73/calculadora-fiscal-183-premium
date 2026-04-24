import { neon } from '@neondatabase/serverless';
import type { NeonQueryFunction } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
let schemaReadyPromise: Promise<any> | null = null;
let sqlInstance: NeonQueryFunction<false, false> | null = null;

interface DraftReport {
  reportKey: string;
  source: string;
  productType: string;
  name: string;
  taxId: string;
  documentType: string;
  totalDays: number;
  statusLabel: string;
  ranges: Array<{ start: Date; end: Date }>;
  createdAt?: Date;
  stripeSessionId?: string;
  paymentStatus?: 'pending' | 'paid' | 'completed' | 'expired' | 'failed';
  customerEmail?: string;
}

function getSql(): NeonQueryFunction<false, false> {
  if (!sqlInstance) {
    if (!databaseUrl) {
      throw new Error('DATABASE_URL not configured');
    }
    sqlInstance = neon(databaseUrl);
  }
  return sqlInstance;
}

async function ensureSchema() {
  if (!schemaReadyPromise) {
    const sql = getSql();
    schemaReadyPromise = Promise.resolve().then(async () => {
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
        );

        CREATE INDEX IF NOT EXISTS idx_stripe_session_id ON premium_reports(stripe_session_id);
        CREATE INDEX IF NOT EXISTS idx_payment_status ON premium_reports(payment_status);
        CREATE INDEX IF NOT EXISTS idx_created_at ON premium_reports(created_at);
      `);
    });
  }

  await schemaReadyPromise;
}

function mapRowToReport(row: any): DraftReport | null {
  if (!row) return null;

  return {
    reportKey: row.report_key,
    stripeSessionId: row.stripe_session_id,
    source: row.source,
    productType: row.product_type,
    name: row.name,
    taxId: row.tax_id,
    documentType: row.document_type,
    totalDays: row.total_days,
    statusLabel: row.status_label,
    ranges: Array.isArray(row.ranges_json) ? row.ranges_json : [],
    paymentStatus: row.payment_status,
    customerEmail: row.customer_email,
    createdAt: row.created_at ? new Date(row.created_at) : undefined,
  };
}

export async function createDraftReport(data: Omit<DraftReport, 'createdAt'>): Promise<DraftReport> {
  await ensureSchema();
  const sql = getSql();

  const result = await sql(
    `INSERT INTO premium_reports (
      report_key, source, product_type, name, tax_id, document_type,
      total_days, status_label, ranges_json, payment_status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`,
    [
      data.reportKey,
      data.source,
      data.productType,
      data.name,
      data.taxId,
      data.documentType,
      data.totalDays,
      data.statusLabel || null,
      JSON.stringify(data.ranges || []),
      'pending',
    ]
  );

  return mapRowToReport(result[0]) as DraftReport;
}

export async function getReportByReportKey(reportKey: string | null | undefined): Promise<DraftReport | null> {
  if (!reportKey) return null;

  await ensureSchema();
  const sql = getSql();

  const result = await sql('SELECT * FROM premium_reports WHERE report_key = $1', [reportKey]);

  return result.length > 0 ? mapRowToReport(result[0]) : null;
}

export async function getReportByStripeSessionId(sessionId: string): Promise<DraftReport | null> {
  await ensureSchema();
  const sql = getSql();

  const result = await sql(
    'SELECT * FROM premium_reports WHERE stripe_session_id = $1',
    [sessionId]
  );

  return result.length > 0 ? mapRowToReport(result[0]) : null;
}

export async function attachStripeSession(data: {
  reportKey: string;
  stripeSessionId: string;
  clientReferenceId: string;
}): Promise<void> {
  await ensureSchema();
  const sql = getSql();

  await sql(
    `UPDATE premium_reports
     SET stripe_session_id = $1, client_reference_id = $2, updated_at = NOW()
     WHERE report_key = $3`,
    [data.stripeSessionId, data.clientReferenceId, data.reportKey]
  );
}

export async function updateReportPaymentStatus(data: {
  reportKey?: string | null;
  stripeSessionId?: string;
  stripePaymentIntentId?: string | null;
  paymentStatus: 'paid' | 'completed' | 'expired' | 'failed';
  customerEmail?: string | null;
}): Promise<DraftReport | null> {
  await ensureSchema();
  const sql = getSql();

  let reportKey = data.reportKey;

  // If reportKey not provided, try to find it by stripeSessionId
  if (!reportKey && data.stripeSessionId) {
    const report = await getReportByStripeSessionId(data.stripeSessionId);
    if (report) {
      reportKey = report.reportKey;
    }
  }

  if (!reportKey) return null;

  const result = await sql(
    `UPDATE premium_reports
     SET payment_status = $1,
         customer_email = COALESCE($2, customer_email),
         stripe_payment_intent_id = COALESCE($3, stripe_payment_intent_id),
         paid_at = CASE WHEN $1 = 'paid' THEN NOW() ELSE paid_at END,
         updated_at = NOW()
     WHERE report_key = $4
     RETURNING *`,
    [data.paymentStatus, data.customerEmail || null, data.stripePaymentIntentId || null, reportKey]
  );

  return result.length > 0 ? mapRowToReport(result[0]) : null;
}

export async function cleanupExpiredReports(maxAgeHours = 24): Promise<number> {
  await ensureSchema();
  const sql = getSql();

  const result = await sql(
    `DELETE FROM premium_reports
     WHERE payment_status = 'pending'
     AND created_at < NOW() - INTERVAL '${maxAgeHours} hours'`
  );

  return (result as any).count || 0;
}
