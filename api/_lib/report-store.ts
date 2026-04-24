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
  console.log('Draft report created:', payload);
}

export async function attachStripeSession(payload: StripeSessionPayload): Promise<void> {
  console.log('Stripe session attached:', payload);
}

export async function getReportByStripeSessionId(sessionId: string): Promise<any> {
  return null;
}

export async function getReportByReportKey(reportKey: string | null): Promise<any> {
  return null;
}
