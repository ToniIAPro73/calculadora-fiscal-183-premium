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

export async function createDraftReport(payload: DraftReportPayload): Promise<void> {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.warn('DATABASE_URL not configured, skipping database write');
      return;
    }

    const db = sql(databaseUrl);
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

    console.log('Draft report created in database:', payload.reportKey);
  } catch (error) {
    console.error('Error creating draft report:', error);
  }
}

export async function attachStripeSession(payload: StripeSessionPayload): Promise<void> {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.warn('DATABASE_URL not configured, skipping database write');
      return;
    }

    const db = sql(databaseUrl);
    await db`
      UPDATE reports
      SET stripe_session_id = ${payload.stripeSessionId},
          client_reference_id = ${payload.clientReferenceId},
          updated_at = NOW()
      WHERE report_key = ${payload.reportKey}
    `;

    console.log('Stripe session attached in database:', payload.reportKey);
  } catch (error) {
    console.error('Error attaching Stripe session:', error);
  }
}

export async function getReportByStripeSessionId(sessionId: string): Promise<any> {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return null;
    }

    const db = sql(databaseUrl);
    const result = await db`
      SELECT * FROM reports
      WHERE stripe_session_id = ${sessionId}
      LIMIT 1
    `;

    if (!result || result.length === 0) {
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

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return null;
    }

    const db = sql(databaseUrl);
    const result = await db`
      SELECT * FROM reports
      WHERE report_key = ${reportKey}
      LIMIT 1
    `;

    if (!result || result.length === 0) {
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
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.warn('DATABASE_URL not configured, skipping database write');
      return;
    }

    const db = sql(databaseUrl);

    if (data.reportKey) {
      await db`
        UPDATE reports
        SET payment_status = ${data.paymentStatus},
            stripe_payment_intent_id = ${data.stripePaymentIntentId || null},
            customer_email = ${data.customerEmail || null},
            updated_at = NOW()
        WHERE report_key = ${data.reportKey}
      `;
    } else if (data.stripeSessionId) {
      await db`
        UPDATE reports
        SET payment_status = ${data.paymentStatus},
            stripe_payment_intent_id = ${data.stripePaymentIntentId || null},
            customer_email = ${data.customerEmail || null},
            updated_at = NOW()
        WHERE stripe_session_id = ${data.stripeSessionId}
      `;
    }

    console.log('Report payment status updated in database:', data);
  } catch (error) {
    console.error('Error updating report payment status:', error);
  }
}
