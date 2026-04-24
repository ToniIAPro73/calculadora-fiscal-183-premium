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
}

interface StripeSessionPayload {
  reportKey: string;
  stripeSessionId: string;
  clientReferenceId: string;
}

// In-memory cache to store reports during the session
const reportCache = new Map<string, any>();

export async function createDraftReport(payload: DraftReportPayload): Promise<void> {
  // Store in memory first (always works)
  reportCache.set(payload.reportKey, {
    reportKey: payload.reportKey,
    stripeSessionId: null,
    clientReferenceId: null,
    source: payload.source,
    productType: payload.productType,
    name: payload.name,
    taxId: payload.taxId,
    documentType: payload.documentType,
    totalDays: payload.totalDays,
    statusLabel: payload.statusLabel,
    ranges: payload.ranges,
    paymentStatus: 'pending',
  });

  console.log('Draft report created:', payload.reportKey);

  // Try to store in database if configured
  if (process.env.DATABASE_URL) {
    try {
      const { sql } = await import('@neondatabase/serverless');
      const db = sql(process.env.DATABASE_URL);
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

      console.log('Draft report stored in database:', payload.reportKey);
    } catch (error) {
      console.warn('Could not store report in database:', error);
      // Continue anyway, report is in memory cache
    }
  }
}

export async function attachStripeSession(payload: StripeSessionPayload): Promise<void> {
  // Update memory cache
  const report = reportCache.get(payload.reportKey);
  if (report) {
    report.stripeSessionId = payload.stripeSessionId;
    report.clientReferenceId = payload.clientReferenceId;
  }

  console.log('Stripe session attached:', payload.reportKey);

  // Try to update in database if configured
  if (process.env.DATABASE_URL) {
    try {
      const { sql } = await import('@neondatabase/serverless');
      const db = sql(process.env.DATABASE_URL);

      await db`
        UPDATE reports
        SET stripe_session_id = ${payload.stripeSessionId},
            client_reference_id = ${payload.clientReferenceId},
            updated_at = NOW()
        WHERE report_key = ${payload.reportKey}
      `;

      console.log('Stripe session stored in database:', payload.reportKey);
    } catch (error) {
      console.warn('Could not update Stripe session in database:', error);
    }
  }
}

export async function getReportByStripeSessionId(sessionId: string): Promise<any> {
  // Try database first
  if (process.env.DATABASE_URL) {
    try {
      const { sql } = await import('@neondatabase/serverless');
      const db = sql(process.env.DATABASE_URL);

      const result = await db`
        SELECT * FROM reports
        WHERE stripe_session_id = ${sessionId}
        LIMIT 1
      `;

      if (result && result.length > 0) {
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
      }
    } catch (error) {
      console.warn('Could not retrieve report from database:', error);
    }
  }

  // Fall back to memory cache
  for (const report of reportCache.values()) {
    if (report.stripeSessionId === sessionId) {
      return report;
    }
  }

  return null;
}

export async function getReportByReportKey(reportKey: string | null): Promise<any> {
  if (!reportKey) {
    return null;
  }

  // Try database first
  if (process.env.DATABASE_URL) {
    try {
      const { sql } = await import('@neondatabase/serverless');
      const db = sql(process.env.DATABASE_URL);

      const result = await db`
        SELECT * FROM reports
        WHERE report_key = ${reportKey}
        LIMIT 1
      `;

      if (result && result.length > 0) {
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
      }
    } catch (error) {
      console.warn('Could not retrieve report from database:', error);
    }
  }

  // Fall back to memory cache
  const report = reportCache.get(reportKey);
  if (report) {
    return {
      reportKey: report.reportKey,
      name: report.name,
      taxId: report.taxId,
      documentType: report.documentType,
      totalDays: report.totalDays,
      statusLabel: report.statusLabel,
      ranges: report.ranges,
    };
  }

  return null;
}

export async function updateReportPaymentStatus(data: {
  reportKey?: string | null;
  stripeSessionId?: string;
  stripePaymentIntentId?: string | null;
  paymentStatus: 'paid' | 'completed' | 'expired' | 'failed';
  customerEmail?: string | null;
}): Promise<any> {
  // Update memory cache
  let report = null;

  if (data.reportKey) {
    report = reportCache.get(data.reportKey);
  } else if (data.stripeSessionId) {
    for (const r of reportCache.values()) {
      if (r.stripeSessionId === data.stripeSessionId) {
        report = r;
        break;
      }
    }
  }

  if (report) {
    report.paymentStatus = data.paymentStatus;
    report.stripePaymentIntentId = data.stripePaymentIntentId;
    report.customerEmail = data.customerEmail;
  }

  console.log('Report payment status updated:', data);

  // Try to update in database if configured
  if (process.env.DATABASE_URL) {
    try {
      const { sql } = await import('@neondatabase/serverless');
      const db = sql(process.env.DATABASE_URL);

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

      console.log('Payment status updated in database:', data);
    } catch (error) {
      console.warn('Could not update payment status in database:', error);
    }
  }
}
