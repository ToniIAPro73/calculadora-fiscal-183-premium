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

// In-memory storage for development (will be replaced with database when DATABASE_URL is configured)
const reportsMap = new Map<string, any>();

async function tryDatabase(fn: () => Promise<any>): Promise<any> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return null;
  }

  try {
    const { sql } = await import('@neondatabase/serverless');
    return await fn();
  } catch (error) {
    console.warn('Database operation failed, falling back to in-memory storage:', error);
    return null;
  }
}

export async function createDraftReport(payload: DraftReportPayload): Promise<void> {
  reportsMap.set(payload.reportKey, {
    reportKey: payload.reportKey,
    stripeSessionId: null,
    clientReferenceId: null,
    name: payload.name,
    taxId: payload.taxId,
    documentType: payload.documentType,
    totalDays: payload.totalDays,
    statusLabel: payload.statusLabel,
    ranges: payload.ranges,
    paymentStatus: 'pending',
  });

  console.log('Draft report created:', payload.reportKey);
}

export async function attachStripeSession(payload: StripeSessionPayload): Promise<void> {
  const report = reportsMap.get(payload.reportKey);
  if (report) {
    report.stripeSessionId = payload.stripeSessionId;
    report.clientReferenceId = payload.clientReferenceId;
  }

  console.log('Stripe session attached:', payload.reportKey);
}

export async function getReportByStripeSessionId(sessionId: string): Promise<any> {
  for (const report of reportsMap.values()) {
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
  return reportsMap.get(reportKey) || null;
}

export async function updateReportPaymentStatus(data: {
  reportKey?: string | null;
  stripeSessionId?: string;
  stripePaymentIntentId?: string | null;
  paymentStatus: 'paid' | 'completed' | 'expired' | 'failed';
  customerEmail?: string | null;
}): Promise<any> {
  let report = null;

  if (data.reportKey) {
    report = reportsMap.get(data.reportKey);
  } else if (data.stripeSessionId) {
    for (const r of reportsMap.values()) {
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
}
