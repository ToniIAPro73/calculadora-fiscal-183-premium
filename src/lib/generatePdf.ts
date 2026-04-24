import { jsPDF } from 'jspdf';
import { format, differenceInCalendarDays, eachDayOfInterval, isWithinInterval } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { reportOwner } from './reportMetadata';

const pdfLabels = {
  es: {
    statusLimitExceeded: 'LÍMITE SUPERADO',
    statusExceededBadge: 'STATUS: NO SEGURO',
    statusExceededDesc: 'Residente Fiscal en España',
    statusApproaching: 'ATENCIÓN CRÍTICA',
    statusApproachingBadge: 'STATUS: PRECAUCIÓN',
    statusApproachingDesc: 'Próximo al límite de 183 días',
    statusCompliant: 'CUMPLIMIENTO LEGAL',
    statusCompliantBadge: 'STATUS: SEGURO',
    statusCompliantDesc: 'No residente (vía permanencia)',
    limit183: 'LÍMITE 183',
    startDate: 'FECHA INICIO',
    endDate: 'FECHA FIN',
    grossDays: 'DÍAS BRUTOS',
    overlapAdjustment: 'AJUSTE SOLAPO',
    fiscalYear: 'EJERCICIO FISCAL',
    reportReference: 'REFERENCIA INFORME',
    generatedDate: 'FECHA GENERACIÓN',
    certificateTitle: 'CERTIFICADO DE PRESENCIA',
    auditSubtitle: 'AUDITORÍA TÉCNICA DE DÍAS FÍSICOS - EJERCICIO FISCAL',
    taxpayerSection: 'IDENTIFICACIÓN DEL CONTRIBUYENTE',
    reportHolder: 'TITULAR DEL INFORME',
    identification: 'IDENTIFICACIÓN',
    presenceSummary: 'RESUMEN EJECUTIVO DE PERMANENCIA',
    daysComputed: 'DÍAS COMPUTADOS',
    legalLimit: 'LÍMITE LEGAL',
    availableBalance: 'SALDO DISPONIBLE',
    days183Rule: 'Regla 183 días IRPF',
    nonResidenceNote: 'Para no residencia',
    taxExposureIndicator: 'INDICADOR VISUAL DE EXPOSICIÓN FISCAL',
    periodBreakdown: 'DESGLOSE CRONOLÓGICO DE PERIODOS',
    legalNotes: 'NOTAS LEGALES Y METODOLOGÍA',
    legalCompliance: 'CUMPLIMIENTO LEGAL',
    legalText: 'Este informe técnico detalla los periodos de estancia física en territorio español calculados a efectos de residencia fiscal. De acuerdo con el Artículo 9.1.a) de la Ley 35/2006, de 28 de noviembre, del Impuesto sobre la Renta de las Personas Físicas (IRPF), se entenderá que el contribuyente tiene su residencia habitual en territorio español cuando permanezca en el mismo más de 183 días durante el año natural. TaxNomad aplica un criterio de "día natural de presencia", consolidando periodos solapados para garantizar la integridad del cómputo y evitar la duplicidad de días. Este documento sirve como soporte probatorio preliminar, pero no sustituye el asesoramiento fiscal profesional.',
    advancedTaxResidencyAnalysis: 'ANÁLISIS DE RESIDENCIA FISCAL AVANZADO',
    testVersion: 'VERSIÓN DE PRUEBA',
  },
  en: {
    statusLimitExceeded: 'LIMIT EXCEEDED',
    statusExceededBadge: 'STATUS: NOT SAFE',
    statusExceededDesc: 'Tax Resident in Spain',
    statusApproaching: 'CRITICAL ATTENTION',
    statusApproachingBadge: 'STATUS: CAUTION',
    statusApproachingDesc: 'Approaching 183-day limit',
    statusCompliant: 'LEGAL COMPLIANCE',
    statusCompliantBadge: 'STATUS: SAFE',
    statusCompliantDesc: 'Non-resident (via permanence)',
    limit183: '183 LIMIT',
    startDate: 'START DATE',
    endDate: 'END DATE',
    grossDays: 'GROSS DAYS',
    overlapAdjustment: 'OVERLAP ADJ',
    fiscalYear: 'FISCAL YEAR',
    reportReference: 'REFERENCE',
    generatedDate: 'GENERATED DATE',
    certificateTitle: 'PRESENCE CERTIFICATE',
    auditSubtitle: 'TECHNICAL AUDIT OF PHYSICAL DAYS - FISCAL YEAR',
    taxpayerSection: 'TAXPAYER IDENTIFICATION',
    reportHolder: 'REPORT HOLDER',
    identification: 'IDENTIFICATION',
    presenceSummary: 'PRESENCE SUMMARY EXECUTIVE',
    daysComputed: 'DAYS COMPUTED',
    legalLimit: 'LEGAL LIMIT',
    availableBalance: 'AVAILABLE BALANCE',
    days183Rule: '183-day IRPF Rule',
    nonResidenceNote: 'For non-residency',
    taxExposureIndicator: 'TAX EXPOSURE VISUAL INDICATOR',
    periodBreakdown: 'CHRONOLOGICAL BREAKDOWN OF PERIODS',
    legalNotes: 'LEGAL NOTES AND METHODOLOGY',
    legalCompliance: 'LEGAL COMPLIANCE',
    legalText: `This technical report details the periods of physical presence in Spanish territory calculated for tax residency purposes. In accordance with Article 9.1.a) of Law 35/2006, of November 28, on the Personal Income Tax (IRPF), a taxpayer will be considered to have their habitual residence in Spanish territory when they remain there more than 183 days during the calendar year. TaxNomad applies a "natural day of presence" criterion, consolidating overlapping periods to ensure the integrity of the count and avoid duplication of days. This document serves as preliminary evidence support but does not replace professional tax advice.`,
    advancedTaxResidencyAnalysis: 'ADVANCED TAX RESIDENCY ANALYSIS',
    testVersion: 'TEST VERSION',
  },
};

const C = {
  primary: [16, 185, 129] as [number, number, number], // Emerald-500
  secondary: [99, 102, 241] as [number, number, number], // Indigo-500
  dark: [15, 23, 42] as [number, number, number], // Slate-900
  slate600: [71, 85, 105] as [number, number, number],
  slate400: [148, 163, 184] as [number, number, number],
  slate200: [226, 232, 240] as [number, number, number],
  slate50: [248, 250, 252] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  success: [22, 163, 74] as [number, number, number],
  warning: [245, 158, 11] as [number, number, number],
  danger: [220, 38, 38] as [number, number, number],
  accentBg: [240, 253, 244] as [number, number, number], // Very light emerald
};

function statusInfo(totalDays: number, language: string = 'es') {
  const labels = pdfLabels[language as keyof typeof pdfLabels] || pdfLabels.es;
  if (totalDays > 183) return { color: C.danger, bg: [254, 226, 226] as [number, number, number], title: labels.statusLimitExceeded, badge: labels.statusExceededBadge, desc: labels.statusExceededDesc };
  if (totalDays > 150) return { color: C.warning, bg: [254, 243, 199] as [number, number, number], title: labels.statusApproaching, badge: labels.statusApproachingBadge, desc: labels.statusApproachingDesc };
  return { color: C.success, bg: [220, 252, 231] as [number, number, number], title: labels.statusCompliant, badge: labels.statusCompliantBadge, desc: labels.statusCompliantDesc };
}

function normalizeRange(range: any) {
  const start = range.start instanceof Date ? range.start : new Date(range.start);
  const end = range.end instanceof Date ? range.end : new Date(range.end);
  const days = range.days ?? differenceInCalendarDays(end, start) + 1;
  return { start, end, days };
}

function calculateOverlapDays(range: any, ranges: any[], index: number) {
  return eachDayOfInterval({ start: range.start, end: range.end }).reduce((count, day) => {
    const overlaps = ranges.some((otherRange, otherIndex) => {
      if (otherIndex === index) return false;
      return isWithinInterval(day, { start: otherRange.start, end: otherRange.end });
    });

    return overlaps ? count + 1 : count;
  }, 0);
}

function drawSectionHeader(doc: jsPDF, text: string, x: number, y: number) {
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(C.primary[0], C.primary[1], C.primary[2]);
  doc.text(text, x, y);
  doc.setDrawColor(C.primary[0], C.primary[1], C.primary[2]);
  doc.setLineWidth(0.2);
  doc.line(x, y + 1.5, x + 15, y + 1.5);
}

function drawProgressBar(doc: jsPDF, x: number, y: number, width: number, totalDays: number, language: string = 'es') {
  const limit = 183;
  const pct = Math.min((totalDays / limit) * 100, 100);
  const status = statusInfo(totalDays, language);
  const labels = pdfLabels[language as keyof typeof pdfLabels] || pdfLabels.es;

  // Bar Background
  doc.setFillColor(C.slate200[0], C.slate200[1], C.slate200[2]);
  doc.roundedRect(x, y, width, 6, 3, 3, 'F');

  // Fill
  doc.setFillColor(status.color[0], status.color[1], status.color[2]);
  doc.roundedRect(x, y, Math.max((width * pct) / 100, 6), 6, 3, 3, 'F');

  // Marker for 183 days
  doc.setDrawColor(C.dark[0], C.dark[1], C.dark[2]);
  doc.setLineWidth(0.4);
  const markerX = x + width; 
  doc.line(markerX, y - 2, markerX, y + 8);
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
  doc.text(labels.limit183, markerX, y - 4, { align: 'center' });
}

function drawDetailedTable(doc: jsPDF, x: number, y: number, width: number, ranges: any[], language: string = 'es') {
  const labels = pdfLabels[language as keyof typeof pdfLabels] || pdfLabels.es;
  const dateLocale = language === 'en' ? enUS : es;
  const dateFormat = language === 'en' ? 'MMM dd, yyyy' : "dd 'de' MMM, yyyy";
  const colWidths = [width * 0.3, width * 0.3, width * 0.2, width * 0.2];
  const headers = [labels.startDate, labels.endDate, labels.grossDays, labels.overlapAdjustment];

  // Header
  doc.setFillColor(C.dark[0], C.dark[1], C.dark[2]);
  doc.roundedRect(x, y, width, 10, 2, 2, 'F');
  doc.setTextColor(C.white[0], C.white[1], C.white[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');

  let currentX = x;
  headers.forEach((h, i) => {
    doc.text(h, currentX + 6, y + 6.5);
    currentX += colWidths[i];
  });

  let currentY = y + 10;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);

  ranges.forEach((range, i) => {
    const isOdd = i % 2 !== 0;
    if (isOdd) {
      doc.setFillColor(C.slate50[0], C.slate50[1], C.slate50[2]);
      doc.rect(x, currentY, width, 9, 'F');
    }

    // Bottom border for each row
    doc.setDrawColor(C.slate200[0], C.slate200[1], C.slate200[2]);
    doc.setLineWidth(0.1);
    doc.line(x, currentY + 9, x + width, currentY + 9);

    const overlap = calculateOverlapDays(range, ranges, i);
    const startStr = format(range.start, dateFormat, { locale: dateLocale });
    const endStr = format(range.end, dateFormat, { locale: dateLocale });
    const overlapText = language === 'en' ? 'days' : 'días';

    currentX = x;
    doc.setFontSize(8);
    doc.text(startStr, currentX + 6, currentY + 6);
    currentX += colWidths[0];
    doc.text(endStr, currentX + 6, currentY + 6);
    currentX += colWidths[1];
    doc.text(String(range.days), currentX + 6, currentY + 6);
    currentX += colWidths[2];

    if (overlap > 0) {
      doc.setTextColor(C.danger[0], C.danger[1], C.danger[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(`-${overlap} ${overlapText}`, currentX + 6, currentY + 6);
      doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
      doc.setFont('helvetica', 'normal');
    } else {
      doc.setTextColor(C.slate400[0], C.slate400[1], C.slate400[2]);
      doc.text('0', currentX + 6, currentY + 6);
      doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
    }

    currentY += 9;
  });

  return currentY;
}

function drawFooter(doc: jsPDF, pageWidth: number, pageHeight: number, margin: number, fileOwnerLine: string, refNum: string, language: string = 'es', fiscalYear: number = 2026) {
  const labels = pdfLabels[language as keyof typeof pdfLabels] || pdfLabels.es;
  doc.setDrawColor(C.slate200[0], C.slate200[1], C.slate200[2]);
  doc.setLineWidth(0.2);
  doc.line(margin, pageHeight - 31, pageWidth - margin, pageHeight - 31);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(C.slate400[0], C.slate400[1], C.slate400[2]);

  const generatedByText = language === 'en'
    ? 'Generated by TaxNomad Premium Analytics · Tax Compliance for Expatriates · rule183.com'
    : 'Generado por TaxNomad Premium Analytics · Cumplimiento Fiscal Expatriados · rule183.com';

  const auditSoftwareText = language === 'en'
    ? `Audit Software: ${fileOwnerLine}`
    : `Software de Auditoría: ${fileOwnerLine}`;

  doc.text(generatedByText, margin, pageHeight - 28);
  doc.text(auditSoftwareText, margin, pageHeight - 22);

  doc.setFont('helvetica', 'bold');
  const reportIdText = language === 'en' ? 'REPORT ID' : 'ID DE INFORME';
  const pageText = language === 'en' ? 'Page 1 of 1' : 'Página 1 de 1';
  doc.text(`${reportIdText}: ${refNum}`, pageWidth - margin - 10, pageHeight - 28, { align: 'right' });
  doc.text(pageText, pageWidth - margin - 10, pageHeight - 22, { align: 'right' });
}

export async function generateTaxReport({
  name,
  taxId,
  documentType = 'passport',
  totalDays,
  ranges = [],
  exampleMode = false,
  language = 'es',
  fiscalYear = new Date().getFullYear(),
}: {
  name: string;
  taxId: string;
  documentType?: string;
  totalDays: number;
  ranges?: any[];
  language?: string;
  exampleMode?: boolean;
  fiscalYear?: number;
}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 20; // Margin
  const CW = W - 2 * M; // Content Width

  const labels = pdfLabels[language as keyof typeof pdfLabels] || pdfLabels.es;
  const dateLocale = language === 'en' ? enUS : es;
  const status = statusInfo(totalDays, language);
  const remaining = Math.max(183 - totalDays, 0);
  const refNum = `TXN-${format(new Date(), 'yyyyMMdd')}-${Math.floor(Math.random() * 90000 + 10000)}`;
  const genDate = language === 'en'
    ? format(new Date(), "MMMM dd, yyyy", { locale: enUS })
    : format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: es });
  const sortedRanges = [...ranges].map(normalizeRange).sort((a, b) => a.start.getTime() - b.start.getTime());
  const identifierLabel = documentType === 'nie' ? 'NIE' : (language === 'en' ? 'PASSPORT' : 'PASAPORTE');
  const fileOwnerLine = `${reportOwner.name} (${reportOwner.nif})`;
  
  // Background Shape
  doc.setFillColor(252, 252, 253);
  doc.rect(0, 0, W, H, 'F');

  // Header Bar
  doc.setFillColor(C.dark[0], C.dark[1], C.dark[2]);
  doc.rect(0, 0, W, 48, 'F');

  // App Logo & Subtitle (Left Column)
  doc.setTextColor(C.primary[0], C.primary[1], C.primary[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('TaxNomad', M, 18);

  doc.setFontSize(8);
  doc.setTextColor(C.slate400[0], C.slate400[1], C.slate400[2]);
  doc.setFont('helvetica', 'normal');
  doc.text(labels.advancedTaxResidencyAnalysis, M, 24);

  // Example Mode Badge (Top Right)
  if (exampleMode) {
    doc.setFillColor(C.warning[0], C.warning[1], C.warning[2]);
    doc.roundedRect(W - M - 35, 8, 35, 7, 2, 2, 'F');
    doc.setTextColor(C.white[0], C.white[1], C.white[2]);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(labels.testVersion, W - M - 17.5, 12.2, { align: 'center' });
  }

  // Ref & Date Header (Right Column, below badge)
  doc.setFontSize(7.5);
  doc.setTextColor(C.slate400[0], C.slate400[1], C.slate400[2]);
  doc.setFont('helvetica', 'normal');
  const referenceText = language === 'en' ? 'REFERENCE' : 'REFERENCIA';
  const dateText = language === 'en' ? 'ISSUED DATE' : 'FECHA DE EMISIÓN';
  const fiscalYearText = language === 'en' ? 'FISCAL YEAR' : 'EJERCICIO FISCAL';
  doc.text(`${referenceText}: ${refNum}`, W - M, 20, { align: 'right' });
  doc.text(`${dateText}: ${genDate.toUpperCase()}`, W - M, 26, { align: 'right' });
  doc.text(`${fiscalYearText}: ${fiscalYear}`, W - M, 32, { align: 'right' });

  let y = 60;

  // Title
  doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(labels.certificateTitle, M, y);
  y += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(C.slate600[0], C.slate600[1], C.slate600[2]);
  doc.text(`${labels.auditSubtitle} ${fiscalYear}`, M, y);
  
  y += 15;

  // Taxpayer Card
  drawSectionHeader(doc, labels.taxpayerSection, M, y);
  y += 6;

  doc.setFillColor(C.white[0], C.white[1], C.white[2]);
  doc.setDrawColor(C.slate200[0], C.slate200[1], C.slate200[2]);
  doc.roundedRect(M, y, CW, 25, 2, 2, 'FD');

  y += 10;
  doc.setFontSize(8);
  doc.setTextColor(C.slate400[0], C.slate400[1], C.slate400[2]);
  doc.text(labels.reportHolder, M + 10, y);
  doc.text(`${labels.identification} (${identifierLabel})`, M + (CW * 0.6), y);
  
  y += 6;
  doc.setFontSize(11);
  doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(name.toUpperCase(), M + 10, y);
  doc.text(taxId.toUpperCase(), M + (CW * 0.6), y);

  y += 20;

  // Presence MetricsSection
  drawSectionHeader(doc, labels.presenceSummary, M, y);
  y += 6;

  // Main Metrics Grid
  const gridY = y;
  const colW = (CW - 10) / 3;

  // 1. Total Days Box
  doc.setFillColor(status.bg[0], status.bg[1], status.bg[2]);
  doc.setDrawColor(status.color[0], status.color[1], status.color[2]);
  doc.roundedRect(M, gridY, colW, 35, 3, 3, 'FD');

  doc.setTextColor(status.color[0], status.color[1], status.color[2]);
  doc.setFontSize(28);
  doc.text(String(totalDays), M + colW / 2, gridY + 18, { align: 'center' });
  doc.setFontSize(8);
  doc.text(labels.daysComputed, M + colW / 2, gridY + 26, { align: 'center' });
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text(status.badge, M + colW / 2, gridY + 31, { align: 'center' });

  // 2. Limit and Remaining
  doc.setFillColor(C.white[0], C.white[1], C.white[2]);
  doc.setDrawColor(C.slate200[0], C.slate200[1], C.slate200[2]);
  doc.roundedRect(M + colW + 5, gridY, colW, 35, 3, 3, 'FD');
  doc.roundedRect(M + 2 * colW + 10, gridY, colW, 35, 3, 3, 'FD');

  doc.setFontSize(8);
  doc.setTextColor(C.slate400[0], C.slate400[1], C.slate400[2]);
  doc.setFont('helvetica', 'normal');
  doc.text(labels.legalLimit, M + colW + 10, gridY + 8);
  doc.text(labels.availableBalance, M + 2 * colW + 15, gridY + 8);

  doc.setFontSize(16);
  doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
  doc.setFont('helvetica', 'bold');
  const limit183Text = language === 'en' ? '183 DAYS' : '183 DÍAS';
  const remainingText = language === 'en' ? 'DAYS' : 'DÍAS';
  doc.text(limit183Text, M + colW + 10, gridY + 18);
  doc.text(`${remaining} ${remainingText}`, M + 2 * colW + 15, gridY + 18);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(C.slate400[0], C.slate400[1], C.slate400[2]);
  doc.text(labels.days183Rule, M + colW + 10, gridY + 24);
  doc.text(labels.nonResidenceNote, M + 2 * colW + 15, gridY + 24);

  y += 45;

  // Progress Bar Area
  doc.setFontSize(9);
  doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(labels.taxExposureIndicator, M, y);
  y += 8;
  drawProgressBar(doc, M, y, CW, totalDays, language);

  y += 20;

  // Breakdown Table
  drawSectionHeader(doc, labels.periodBreakdown, M, y);
  y += 6;

  y = drawDetailedTable(doc, M, y, CW, sortedRanges, language);

  y += 15;

  // Legal Framework
  drawSectionHeader(doc, labels.legalNotes, M, y);
  y += 6;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(C.slate600[0], C.slate600[1], C.slate600[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(labels.legalCompliance, M, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const legalLines = doc.splitTextToSize(labels.legalText, CW);
  doc.text(legalLines, M, y);

  drawFooter(doc, W, H, M, fileOwnerLine, refNum, language, fiscalYear);

  return doc;
}
