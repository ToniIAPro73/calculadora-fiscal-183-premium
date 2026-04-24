import { sql } from '@neondatabase/serverless';

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

function getDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL not configured');
  }
  return sql(databaseUrl);
}

export async function createDraftReport(payload: DraftReportPayload): Promise<void> {
  try {
    const db = getDatabase();
    const rangesJson = JSON.stringify(payload.ranges);

    await db`
      INSERT INTO reports (
        report_key, source, product_type, name, tax_id,
        document_type, total_days, status_label, ranges, payment_status
      ) VALUES (
        ${payload.reportKey}, ${payload.source}, ${payload.productType},
        ${payload.name}, ${payload.taxId}, ${payload.documentType},
        ${payload.totalDays}, ${payload.statusLabel}, ${rangesJson}, 'pending'
      )
      ON CONFLICT (report_key) DO UPDATE SET
        updated_at = NOW()
    `;

    console.log('Draft report created:', payload.reportKey);
  } catch (error) {
    console.error('Error creating draft report:', error);
    throw error;
  }
}

export async function attachStripeSession(payload: StripeSessionPayload): Promise<void> {
  try {
    const db = getDatabase();

    await db`
      UPDATE reports
      SET stripe_session_id = ${payload.stripeSessionId},
          client_reference_id = ${payload.clientReferenceId},
          updated_at = NOW()
      WHERE report_key = ${payload.reportKey}
    `;

    console.log('Stripe session attached:', payload.reportKey);
  } catch (error) {
    console.error('Error attaching Stripe session:', error);
    throw error;
  }
}

export async function getReportByStripeSessionId(sessionId: string): Promise<any> {
  try {
    const db = getDatabase();

    const result = await db`
      SELECT * FROM reports
      WHERE stripe_session_id = ${sessionId}
      LIMIT 1
    `;

    if (result.length === 0) {
      return null;
    }

    const row = result[0];
    return {
      reportKey: row.report_key,
      name: row.name,
      taxId: row.tax_id,
      documentType: row.document_type,
      totalDays: row.total_days,
      statusLabel: row.status_label,
      ranges: row.ranges ? JSON.parse(row.ranges) : [],
    };
  } catch (error) {
    console.error('Error getting report by Stripe session ID:', error);
    return null;
  }
}

export async function getReportByReportKey(reportKey: string | null): Promise<any> {
  try {
    if (!reportKey) {
      return null;
    }

    const db = getDatabase();

    const result = await db`
      SELECT * FROM reports
      WHERE report_key = ${reportKey}
      LIMIT 1
    `;

    if (result.length === 0) {
      return null;
    }

    const row = result[0];
    return {
      reportKey: row.report_key,
      name: row.name,
      taxId: row.tax_id,
      documentType: row.document_type,
      totalDays: row.total_days,
      statusLabel: row.status_label,
      ranges: row.ranges ? JSON.parse(row.ranges) : [],
    };
  } catch (error) {
    console.error('Error getting report by key:', error);
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
    const db = getDatabase();

    let whereClause = '';
    if (data.reportKey) {
      whereClause = `report_key = ${sql(data.reportKey)}`;
    } else if (data.stripeSessionId) {
      whereClause = `stripe_session_id = ${sql(data.stripeSessionId)}`;
    } else {
      throw new Error('reportKey or stripeSessionId required');
    }

    await db`
      UPDATE reports
      SET payment_status = ${data.paymentStatus},
          stripe_payment_intent_id = ${data.stripePaymentIntentId || null},
          customer_email = ${data.customerEmail || null},
          updated_at = NOW()
      WHERE ${whereClause}
    `;

    console.log('Report payment status updated:', data);
  } catch (error) {
    console.error('Error updating report payment status:', error);
    throw error;
  }
}
