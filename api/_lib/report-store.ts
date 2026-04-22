// Mock in-memory report storage
// TODO: Replace with actual database integration (PostgreSQL, MongoDB, etc.)

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
  createdAt: Date;
  stripeSessionId?: string;
  paymentStatus?: 'pending' | 'paid' | 'completed' | 'expired' | 'failed';
  customerEmail?: string;
}

const reports = new Map<string, DraftReport>();
const sessionIdMap = new Map<string, string>();

export async function createDraftReport(data: Omit<DraftReport, 'createdAt'>) {
  const report: DraftReport = {
    ...data,
    createdAt: new Date(),
  };
  reports.set(data.reportKey, report);
  return report;
}

export async function getReportByReportKey(reportKey: string | null | undefined): Promise<DraftReport | null> {
  if (!reportKey) return null;
  return reports.get(reportKey) || null;
}

export async function getReportByStripeSessionId(sessionId: string): Promise<DraftReport | null> {
  const reportKey = sessionIdMap.get(sessionId);
  if (!reportKey) return null;
  return reports.get(reportKey) || null;
}

export async function attachStripeSession(data: {
  reportKey: string;
  stripeSessionId: string;
  clientReferenceId: string;
}) {
  const report = reports.get(data.reportKey);
  if (report) {
    report.stripeSessionId = data.stripeSessionId;
    sessionIdMap.set(data.stripeSessionId, data.reportKey);
  }
}

export async function updateReportPaymentStatus(data: {
  reportKey?: string | null;
  stripeSessionId?: string;
  stripePaymentIntentId?: string | null;
  paymentStatus: 'paid' | 'completed' | 'expired' | 'failed';
  customerEmail?: string | null;
}) {
  let reportKey = data.reportKey;

  if (!reportKey && data.stripeSessionId) {
    reportKey = sessionIdMap.get(data.stripeSessionId);
  }

  if (!reportKey) return null;

  const report = reports.get(reportKey);
  if (report) {
    report.paymentStatus = data.paymentStatus;
    if (data.customerEmail) {
      report.customerEmail = data.customerEmail;
    }
  }
  return report;
}

export function clearExpiredReports(maxAgeMs = 24 * 60 * 60 * 1000) {
  const now = Date.now();
  const keysToDelete: string[] = [];

  reports.forEach((report, key) => {
    if (now - report.createdAt.getTime() > maxAgeMs) {
      keysToDelete.push(key);
      if (report.stripeSessionId) {
        sessionIdMap.delete(report.stripeSessionId);
      }
    }
  });

  keysToDelete.forEach(key => reports.delete(key));
}
