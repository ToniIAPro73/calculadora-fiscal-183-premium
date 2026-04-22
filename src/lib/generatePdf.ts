import { jsPDF } from 'jspdf';
import { format, differenceInCalendarDays, eachDayOfInterval, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { reportOwner } from './reportMetadata';

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

function statusInfo(totalDays: number) {
  if (totalDays > 183) return { color: C.danger, bg: [254, 226, 226] as [number, number, number], title: 'LÍMITE SUPERADO', badge: 'STATUS: NO SEGURO', desc: 'Residente Fiscal en España' };
  if (totalDays > 150) return { color: C.warning, bg: [254, 243, 199] as [number, number, number], title: 'ATENCIÓN CRÍTICA', badge: 'STATUS: PRECAUCIÓN', desc: 'Próximo al límite de 183 días' };
  return { color: C.success, bg: [220, 252, 231] as [number, number, number], title: 'CUMPLIMIENTO LEGAL', badge: 'STATUS: SEGURO', desc: 'No residente (vía permanencia)' };
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

function drawProgressBar(doc: jsPDF, x: number, y: number, width: number, totalDays: number) {
  const limit = 183;
  const pct = Math.min((totalDays / limit) * 100, 100);
  const status = statusInfo(totalDays);

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
  doc.text('LÍMITE 183', markerX, y - 4, { align: 'center' });
}

function drawDetailedTable(doc: jsPDF, x: number, y: number, width: number, ranges: any[]) {
  const colWidths = [width * 0.3, width * 0.3, width * 0.2, width * 0.2];
  const headers = ['FECHA INICIO', 'FECHA FIN', 'DÍAS BRUTOS', 'AJUSTE SOLAPO'];
  
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
    const startStr = format(range.start, "dd 'de' MMM, yyyy", { locale: es });
    const endStr = format(range.end, "dd 'de' MMM, yyyy", { locale: es });
    
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
      doc.text(`-${overlap} días`, currentX + 6, currentY + 6);
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

function drawFooter(doc: jsPDF, pageWidth: number, pageHeight: number, margin: number, fileOwnerLine: string, refNum: string) {
  doc.setDrawColor(C.slate200[0], C.slate200[1], C.slate200[2]);
  doc.setLineWidth(0.2);
  doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(C.slate400[0], C.slate400[1], C.slate400[2]);
  
  doc.text('Generado por TaxNomad Premium Analytics · Cumplimiento Fiscal Expatriados · rule183.com', margin, pageHeight - 14);
  doc.text(`Software de Auditoría: ${fileOwnerLine}`, margin, pageHeight - 10);
  
  doc.setFont('helvetica', 'bold');
  doc.text(`ID DE INFORME: ${refNum}`, pageWidth - margin, pageHeight - 14, { align: 'right' });
  doc.text(`Página 1 de 1`, pageWidth - margin, pageHeight - 10, { align: 'right' });
}

export async function generateTaxReport({
  name,
  taxId,
  documentType = 'passport',
  totalDays,
  ranges = [],
  exampleMode = false,
}: {
  name: string;
  taxId: string;
  documentType?: string;
  totalDays: number;
  ranges?: any[];
  language?: string;
  exampleMode?: boolean;
}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 20; // Margin
  const CW = W - 2 * M; // Content Width

  const status = statusInfo(totalDays);
  const remaining = Math.max(183 - totalDays, 0);
  const refNum = `TXN-${format(new Date(), 'yyyyMMdd')}-${Math.floor(Math.random() * 90000 + 10000)}`;
  const genDate = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: es });
  const sortedRanges = [...ranges].map(normalizeRange).sort((a, b) => a.start.getTime() - b.start.getTime());
  const identifierLabel = documentType === 'nie' ? 'NIE' : 'PASAPORTE';
  const fileOwnerLine = `${reportOwner.name} (${reportOwner.nif})`;
  
  // Background Shape
  doc.setFillColor(252, 252, 253);
  doc.rect(0, 0, W, H, 'F');

  // Header Bar
  doc.setFillColor(C.dark[0], C.dark[1], C.dark[2]);
  doc.rect(0, 0, W, 40, 'F');

  // App Logo
  doc.setTextColor(C.primary[0], C.primary[1], C.primary[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('TaxNomad', M, 18);
  
  doc.setFontSize(8);
  doc.setTextColor(C.slate400[0], C.slate400[1], C.slate400[2]);
  doc.setFont('helvetica', 'normal');
  doc.text('ANÁLISIS DE RESIDENCIA FISCAL AVANZADO', M, 24);

  // Example Mode Badge
  if (exampleMode) {
    doc.setFillColor(C.warning[0], C.warning[1], C.warning[2]);
    doc.roundedRect(W - M - 40, 12, 40, 7, 2, 2, 'F');
    doc.setTextColor(C.white[0], C.white[1], C.white[2]);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('VERSION DE PRUEBA', W - M - 20, 16.5, { align: 'center' });
  }

  // Ref & Date Header
  doc.setFontSize(8);
  doc.setTextColor(C.slate400[0], C.slate400[1], C.slate400[2]);
  doc.text(`REFERENCIA: ${refNum}`, W - M, 18, { align: 'right' });
  doc.text(`FECHA DE EMISIÓN: ${genDate.toUpperCase()}`, W - M, 24, { align: 'right' });

  let y = 55;

  // Title
  doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('CERTIFICADO DE PRESENCIA', M, y);
  y += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(C.slate600[0], C.slate600[1], C.slate600[2]);
  doc.text('AUDITORÍA TÉCNICA DE DÍAS FÍSICOS - EJERCICIO FISCAL 2026', M, y);
  
  y += 15;

  // Taxpayer Card
  drawSectionHeader(doc, 'IDENTIFICACIÓN DEL CONTRIBUYENTE', M, y);
  y += 6;
  
  doc.setFillColor(C.white[0], C.white[1], C.white[2]);
  doc.setDrawColor(C.slate200[0], C.slate200[1], C.slate200[2]);
  doc.roundedRect(M, y, CW, 25, 2, 2, 'FD');
  
  y += 10;
  doc.setFontSize(8);
  doc.setTextColor(C.slate400[0], C.slate400[1], C.slate400[2]);
  doc.text('TITULAR DEL INFORME', M + 10, y);
  doc.text(`IDENTIFICACIÓN (${identifierLabel})`, M + (CW * 0.6), y);
  
  y += 6;
  doc.setFontSize(11);
  doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(name.toUpperCase(), M + 10, y);
  doc.text(taxId.toUpperCase(), M + (CW * 0.6), y);

  y += 20;

  // Presence MetricsSection
  drawSectionHeader(doc, 'RESUMEN EJECUTIVO DE PERMANENCIA', M, y);
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
  doc.text('DÍAS COMPUTADOS', M + colW / 2, gridY + 26, { align: 'center' });
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
  doc.text('LÍMITE LEGAL', M + colW + 10, gridY + 8);
  doc.text('SALDO DISPONIBLE', M + 2 * colW + 15, gridY + 8);

  doc.setFontSize(16);
  doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('183 DÍAS', M + colW + 10, gridY + 18);
  doc.text(`${remaining} DÍAS`, M + 2 * colW + 15, gridY + 18);
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(C.slate400[0], C.slate400[1], C.slate400[2]);
  doc.text('Regla 183 días IRPF', M + colW + 10, gridY + 24);
  doc.text('Para no residencia', M + 2 * colW + 15, gridY + 24);

  y += 45;

  // Progress Bar Area
  doc.setFontSize(9);
  doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('INDICADOR VISUAL DE EXPOSICIÓN FISCAL', M, y);
  y += 8;
  drawProgressBar(doc, M, y, CW, totalDays);
  
  y += 20;

  // Breakdown Table
  drawSectionHeader(doc, 'DESGLOSE CRONOLÓGICO DE PERIODOS', M, y);
  y += 6;
  
  y = drawDetailedTable(doc, M, y, CW, sortedRanges);
  
  y += 15;

  // Legal Framework
  drawSectionHeader(doc, 'NOTAS LEGALES Y METODOLOGÍA', M, y);
  y += 6;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(C.slate600[0], C.slate600[1], C.slate600[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(status.title, M, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const legalText = `Este informe técnico detalla los periodos de estancia física en territorio español calculados a efectos de residencia fiscal. De acuerdo con el Artículo 9.1.a) de la Ley 35/2006, de 28 de noviembre, del Impuesto sobre la Renta de las Personas Físicas (IRPF), se entenderá que el contribuyente tiene su residencia habitual en territorio español cuando permanezca en el mismo más de 183 días durante el año natural. TaxNomad aplica un criterio de "día natural de presencia", consolidando periodos solapados para garantizar la integridad del cómputo y evitar la duplicidad de días. Este documento sirve como soporte probatorio preliminar, pero no sustituye el asesoramiento fiscal profesional.`;
  const legalLines = doc.splitTextToSize(legalText, CW);
  doc.text(legalLines, M, y);

  drawFooter(doc, W, H, M, fileOwnerLine, refNum);

  return doc;
}
