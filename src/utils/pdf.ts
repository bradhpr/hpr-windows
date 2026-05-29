import jsPDF from 'jspdf';
import type { Project, WindowEntry } from '../types';
import type { PriceBreakdown, ProjectTotals } from '../types';
import { WINDOW_STYLE_LABELS } from '../components/shared/WindowStyleSVG';
import { formatCurrency } from './calculations';

const HPR_BLUE = [0, 61, 165] as const;
const HPR_GOLD = [255, 209, 0] as const;
const DARK = [51, 51, 51] as const;
const LIGHT_GRAY = [248, 249, 250] as const;
const MID_GRAY = [150, 150, 150] as const;

const GRID_LABELS: Record<string, string> = {
  None: 'No Grids',
  FlatColonial: '5/8" Flat Colonial',
  SculpturedColonial: '5/8" Sculptured',
  SculpturedInch: '1" Sculptured',
};

const THERMA_LABELS: Record<string, string> = {
  None: 'Not Included',
  ArchitecturalBlack: 'Architectural Black',
  ArchitecturalBronze: 'Architectural Bronze',
  ArchitecturalSilver: 'Architectural Silver',
  ClassicGray: 'Classic Gray',
  Espresso: 'Espresso',
  Taupe: 'Taupe',
  RedPepper: 'Red Pepper',
  RoseWood: 'Rose Wood',
  DesertTan: 'Desert Tan',
  Sandstone: 'Sandstone',
  DivineWine: 'Divine Wine',
  ForestGreen: 'Forest Green',
};

function eff<T>(pw: T | undefined, g: T): T {
  return pw !== undefined ? pw : g;
}

export async function generatePDF(project: Project, breakdowns: PriceBreakdown[], totals: ProjectTotals): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
  const W = 612, marginL = 40, marginR = 40, usableW = W - marginL - marginR;

  let page = 1;
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  function addPage() {
    doc.addPage();
    page++;
    addPageHeader();
  }

  function addPageHeader() {
    doc.setFillColor(...HPR_BLUE);
    doc.rect(0, 0, W, 36, 'F');
    doc.setFillColor(...HPR_GOLD);
    doc.rect(0, 36, W, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text('HIGH PERFORMANCE RESTORATION', marginL, 23);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Page ${page}`, W - marginR - 30, 23);
  }

  function hline(y: number, r = 200, g = 200, b = 200) {
    doc.setDrawColor(r, g, b);
    doc.line(marginL, y, W - marginR, y);
  }

  function blueHeader(y: number, title: string): number {
    doc.setFillColor(...HPR_BLUE);
    doc.rect(marginL, y, usableW, 20, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(title.toUpperCase(), marginL + 8, y + 13.5);
    return y + 20;
  }

  // ── PAGE 1: COVER ──
  // Big blue header
  doc.setFillColor(...HPR_BLUE);
  doc.rect(0, 0, W, 180, 'F');
  doc.setFillColor(...HPR_GOLD);
  doc.rect(0, 180, W, 4, 'F');

  // Logo placeholder
  doc.setFillColor(...HPR_GOLD);
  doc.roundedRect(marginL, 20, 60, 60, 6, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...HPR_BLUE);
  doc.text('HPR', marginL + 10, 58);

  // Company name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('HIGH PERFORMANCE RESTORATION', marginL + 72, 42);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 209, 0);
  doc.text('ROOFING + SOLAR + WINDOWS', marginL + 72, 57);

  // Contact
  doc.setTextColor(200, 220, 255);
  doc.setFontSize(8);
  doc.text('9061 3rd St  ·  Frisco, TX 75034', W - marginR - 160, 42, { align: 'right' });
  doc.text('214.396.7772  ·  info@hprtexas.com', W - marginR - 160, 54, { align: 'right' });
  doc.text('hprtexas.com', W - marginR - 160, 66, { align: 'right' });

  // Proposal title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text('WINDOW REPLACEMENT', marginL, 120);
  doc.setFontSize(28);
  doc.text('PROPOSAL', marginL, 152);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 220, 255);
  doc.text(`Date: ${today}`, marginL, 170);

  // Homeowner box
  doc.setFillColor(240, 244, 255);
  doc.roundedRect(W - marginR - 200, 100, 200, 90, 6, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...MID_GRAY);
  doc.text('PREPARED FOR', W - marginR - 190, 116);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...HPR_BLUE);
  doc.text(project.homeowner.name || 'Homeowner', W - marginR - 190, 132);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...DARK);
  const ho = project.homeowner;
  let hy = 148;
  if (ho.address) { doc.text(ho.address, W - marginR - 190, hy); hy += 13; }
  if (ho.city) { doc.text(`${ho.city}, ${ho.state} ${ho.zip}`, W - marginR - 190, hy); hy += 13; }
  if (ho.phone) { doc.text(ho.phone, W - marginR - 190, hy); hy += 13; }
  if (ho.email) { doc.text(ho.email, W - marginR - 190, hy); }

  // ── PAGE 2: SCOPE OF WORK ──
  addPage();
  let y = 55;

  y = blueHeader(y, 'Scope of Work — Window Schedule');
  y += 8;

  // Global specs row
  doc.setFillColor(...LIGHT_GRAY);
  doc.rect(marginL, y, usableW, 18, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...DARK);
  const opts = project.globalOptions;
  const specTxt = `Series: ${opts.series}  ·  Color: ${opts.frameColor}  ·  Glass: ${opts.glassPackage}  ·  Frame: ${opts.frameType === 'Block' ? 'Block/NF' : opts.frameType}  ·  Grids: ${GRID_LABELS[opts.grids] ?? opts.grids}`;
  doc.text(specTxt, marginL + 6, y + 12);
  y += 24;

  // Column headers
  const cols = { n: marginL, style: marginL + 18, loc: marginL + 140, size: marginL + 220, qty: marginL + 275, glass: marginL + 305, price: W - marginR };
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...MID_GRAY);
  doc.text('#', cols.n, y);
  doc.text('STYLE', cols.style, y);
  doc.text('LOCATION', cols.loc, y);
  doc.text('SIZE', cols.size, y);
  doc.text('QTY', cols.qty, y);
  doc.text('GLASS / OPTIONS', cols.glass, y);
  doc.text('PRICE', cols.price, y, { align: 'right' });
  y += 4;
  hline(y, ...HPR_BLUE.map(v => v * 0.6) as [number, number, number]);
  y += 8;

  project.windows.forEach((w, idx) => {
    if (y > 700) { addPage(); y = 55; }
    const bd = breakdowns.find((b) => b.windowId === w.id);
    const grids = eff(w.gridOverride, opts.grids);
    const glass = eff(w.glassOverride, opts.glassPackage);
    const therma = eff(w.thermaCoatOverride, opts.thermaCoat);

    if (idx % 2 === 0) {
      doc.setFillColor(...LIGHT_GRAY);
      doc.rect(marginL, y - 6, usableW, 22, 'F');
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...HPR_BLUE);
    doc.text(String(idx + 1), cols.n + 2, y + 4);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...DARK);
    doc.text(WINDOW_STYLE_LABELS[w.style] || w.style, cols.style, y + 4);
    doc.text(`${w.side}${w.note ? ` · ${w.note}` : ''}`, cols.loc, y + 4);
    doc.text(`${w.width}" × ${w.height}"`, cols.size, y + 4);
    doc.text(String(w.quantity), cols.qty + 4, y + 4, { align: 'center' });

    const optParts = [glass];
    if (grids !== 'None') optParts.push(GRID_LABELS[grids] ?? grids);
    if (w.tempered) optParts.push('Tempered');
    if (w.obscure !== 'None') optParts.push(w.obscure);
    if (therma !== 'None') optParts.push(THERMA_LABELS[therma] ?? therma);
    doc.setFontSize(7.5);
    doc.text(optParts.join(', '), cols.glass, y + 4);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(bd ? formatCurrency(bd.lineTotal) : '—', cols.price, y + 4, { align: 'right' });
    y += 22;
  });

  // Doors
  project.doors.forEach((d, idx) => {
    if (y > 700) { addPage(); y = 55; }
    const bd = breakdowns.find((b) => b.windowId === d.id);
    if ((project.windows.length + idx) % 2 === 0) {
      doc.setFillColor(...LIGHT_GRAY);
      doc.rect(marginL, y - 6, usableW, 22, 'F');
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...HPR_GOLD);
    doc.text(`D${idx + 1}`, cols.n + 1, y + 4);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...DARK);
    doc.text(`${d.doorType} Door – ${d.config}`, cols.style, y + 4);
    doc.text(d.side, cols.loc, y + 4);
    doc.text(`${d.width}" × ${d.height}"`, cols.size, y + 4);
    doc.text(String(d.quantity), cols.qty + 4, y + 4, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.text(bd ? formatCurrency(bd.lineTotal) : '—', cols.price, y + 4, { align: 'right' });
    y += 22;
  });

  // Window sills
  if (project.windowSills.quantity > 0) {
    hline(y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Window Sill Replacement ×${project.windowSills.quantity}`, cols.style, y + 4);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(project.windowSills.quantity * project.windowSills.unitPrice), cols.price, y + 4, { align: 'right' });
    y += 22;
  }

  // Scope text
  y += 6;
  hline(y, ...HPR_BLUE.map(v => Math.floor(v * 0.4)) as [number, number, number]);
  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...HPR_BLUE);
  doc.text('Standard Scope of Work', marginL, y);
  y += 14;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...DARK);
  const scopeLines = [
    '• We will remove the existing windows and inspect the sheathing for rotten or bad wood.',
    '• Windows will be installed using the manufacturer\'s specifications.',
    '• We will perform an in-depth inspection of the property to ensure everything is cleaned properly and all debris is picked up.',
  ];
  scopeLines.forEach((l) => {
    doc.text(l, marginL + 4, y);
    y += 13;
  });

  // ── PAGE 3: PRICING ──
  addPage();
  y = 55;
  y = blueHeader(y, 'Pricing Summary');
  y += 16;

  const totRows: [string, string, boolean][] = [
    ['Subtotal', formatCurrency(totals.subtotal), false],
    ...(totals.discountAmount > 0 ? [[`${project.pricing.discountLabel || 'Discount'}`, `-${formatCurrency(totals.discountAmount)}`, false] as [string, string, boolean]] : []),
    ...(project.windowSills.quantity > 0 ? [['Window Sill Replacement', formatCurrency(totals.windowSillTotal), false] as [string, string, boolean]] : []),
  ];

  totRows.forEach(([label, val]) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...DARK);
    doc.text(label, marginL + 10, y);
    doc.text(val, W - marginR, y, { align: 'right' });
    hline(y + 4);
    y += 18;
  });

  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...HPR_BLUE);
  doc.text('Total Contract Amount', marginL + 10, y);
  doc.text(formatCurrency(totals.totalContractAmount), W - marginR, y, { align: 'right' });
  doc.setFillColor(...HPR_GOLD);
  doc.rect(marginL, y + 6, usableW, 3, 'F');
  y += 28;

  // Deposit box
  doc.setFillColor(240, 244, 255);
  doc.roundedRect(marginL, y, usableW / 2 - 10, 70, 8, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...MID_GRAY);
  doc.text('DEPOSIT DUE', marginL + 12, y + 18);
  doc.setFontSize(20);
  doc.setTextColor(...HPR_BLUE);
  doc.text(formatCurrency(totals.depositAmount), marginL + 12, y + 44);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MID_GRAY);
  doc.text(`(${project.pricing.depositPercent}% of total)`, marginL + 12, y + 58);

  doc.setFillColor(...LIGHT_GRAY);
  doc.roundedRect(marginL + usableW / 2 + 10, y, usableW / 2 - 10, 70, 8, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...MID_GRAY);
  doc.text('BALANCE DUE', marginL + usableW / 2 + 22, y + 18);
  doc.setFontSize(20);
  doc.setTextColor(...DARK);
  doc.text(formatCurrency(totals.totalContractAmount - totals.depositAmount), marginL + usableW / 2 + 22, y + 44);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MID_GRAY);
  doc.text('Upon completion', marginL + usableW / 2 + 22, y + 58);
  y += 86;

  if (project.additionalDetails) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.text('Additional Details:', marginL + 10, y);
    y += 14;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    const detailLines = doc.splitTextToSize(project.additionalDetails, usableW - 20);
    doc.text(detailLines, marginL + 10, y);
    y += detailLines.length * 12 + 10;
  }

  // Payment terms
  y += 10;
  y = blueHeader(y, 'Payment Terms');
  y += 14;
  const pmtLines = [
    '• All payments made out to High Performance Restoration or HPR.',
    '• An option to pay online through ACH transfer or credit card may be requested.',
    '  Credit card payments include a 3% convenience fee.',
    '• Please note progress invoices may be sent as trades are completed.',
    '• Insurance payments due upon receipt.',
  ];
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...DARK);
  pmtLines.forEach((l) => {
    doc.text(l, marginL + 6, y);
    y += 13;
  });

  // Signatures
  y += 20;
  const sigW = usableW / 2 - 20;
  doc.setDrawColor(100, 100, 100);
  doc.line(marginL, y, marginL + sigW, y);
  doc.line(marginL + sigW + 40, y, marginL + sigW * 2 + 40, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...MID_GRAY);
  doc.text('HPR Representative / Date', marginL, y + 12);
  doc.text('Homeowner / Date', marginL + sigW + 40, y + 12);

  // ── PAGE 4: PREPARING FOR PROJECT ──
  addPage();
  y = 55;
  y = blueHeader(y, 'Preparing For Your Project');
  y += 16;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...HPR_BLUE);
  doc.text('Installation: The Next Steps', marginL + 6, y);
  y += 16;

  const checklist = [
    'Clear landscaping around window areas',
    'Remove window coverings (blinds, curtains)',
    'Move furniture away from windows',
    'Notify alarm company of installation date',
    'Secure or relocate pets',
    'Protect flooring near work areas',
    'Clear walls of artwork and decorations',
    'Note: trim/painting may be needed after installation',
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  checklist.forEach((item, i) => {
    doc.setFillColor(i % 2 === 0 ? 248 : 255, i % 2 === 0 ? 249 : 255, i % 2 === 0 ? 250 : 255);
    doc.rect(marginL, y - 8, usableW, 18, 'F');
    doc.setTextColor(...HPR_GOLD);
    doc.setFont('helvetica', 'bold');
    doc.text('✓', marginL + 8, y + 4);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...DARK);
    doc.text(item, marginL + 24, y + 4);
    y += 18;
  });

  y += 20;
  doc.setDrawColor(100, 100, 100);
  doc.line(marginL, y, marginL + sigW, y);
  doc.line(marginL + sigW + 40, y, marginL + sigW * 2 + 40, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...MID_GRAY);
  doc.text('Homeowner Signature', marginL, y + 12);
  doc.text('Date', marginL + sigW + 40, y + 12);

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...MID_GRAY);
    doc.text(`High Performance Restoration  ·  9061 3rd St, Frisco TX 75034  ·  214.396.7772  ·  Page ${p} of ${totalPages}`, W / 2, 780, { align: 'center' });
  }

  const filename = `HPR-Proposal-${project.homeowner.name?.replace(/\s+/g, '-') || 'Client'}-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
