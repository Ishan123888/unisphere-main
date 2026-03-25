'use client';

/**
 * PDFDocument.tsx
 * ─────────────────────────────────────────────────────────────────
 * Shared PDF generation component for UniSphere Tutor Booking module.
 * Uses window.print() + CSS @media print — zero external dependencies.
 *
 * Usage:
 *   import { downloadInvoicePDF, downloadBookingPDF } from '@/components/shared/PDFDocument';
 *   downloadInvoicePDF(invoiceData);
 *   downloadBookingPDF(bookingData);
 * ─────────────────────────────────────────────────────────────────
 */

/* ── Types ────────────────────────────────────────────────────────── */
export interface InvoiceData {
  id:            string;
  bookingRef:    string;
  date:          string;
  studentName:   string;
  studentId:     string;
  studentEmail:  string;
  tutorName:     string;
  subject:       string;
  slot:          string;
  duration:      string;
  sessionType:   string;
  hourlyRate:    number;
  hours:         number;
  platformFee:   number;
  total:         number;
  paymentMethod: string;
  status:        string;
}

export interface BookingData {
  bookingRef:    string;
  tutorName:     string;
  subject:       string;
  slot:          string;
  date:          string;
  studentName:   string;
  studentId:     string;
  email:         string;
  duration:      string;
  sessionType:   string;
  topic:         string;
  paymentMethod: string;
  total:         number;
  status:        string;
}

/* ── Print styles injected into DOM ──────────────────────────────── */
const PRINT_STYLES = `
  @media print {
    body * { visibility: hidden !important; }
    #unisphere-print-area,
    #unisphere-print-area * { visibility: visible !important; }
    #unisphere-print-area {
      position: fixed !important;
      top: 0 !important; left: 0 !important;
      width: 100% !important; height: auto !important;
      background: white !important;
      padding: 32px !important;
      font-family: 'Segoe UI', Arial, sans-serif !important;
      color: #1e293b !important;
      z-index: 99999 !important;
    }
    @page { margin: 16mm; size: A4; }
  }
`;

/* ── Inject print styles once ────────────────────────────────────── */
const injectPrintStyles = () => {
  if (document.getElementById('unisphere-print-styles')) return;
  const style = document.createElement('style');
  style.id = 'unisphere-print-styles';
  style.innerHTML = PRINT_STYLES;
  document.head.appendChild(style);
};

/* ── Create print area div ───────────────────────────────────────── */
const createPrintArea = (html: string): HTMLDivElement => {
  let el = document.getElementById('unisphere-print-area') as HTMLDivElement;
  if (!el) {
    el = document.createElement('div');
    el.id = 'unisphere-print-area';
    document.body.appendChild(el);
  }
  el.innerHTML = html;
  return el;
};

/* ── Trigger print → save as PDF ─────────────────────────────────── */
const triggerPrint = (el: HTMLDivElement) => {
  injectPrintStyles();
  el.style.display = 'block';
  setTimeout(() => {
    window.print();
    setTimeout(() => { el.style.display = 'none'; }, 500);
  }, 100);
};

/* ════════════════════════════════════════════════════════════════════
   INVOICE PDF
════════════════════════════════════════════════════════════════════ */
export const downloadInvoicePDF = (data: InvoiceData) => {
  const sessionFee = data.hours * data.hourlyRate;

  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;color:#1e293b;max-width:680px;margin:0 auto;">

      <!-- Header -->
      <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px;border-radius:16px;margin-bottom:24px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div>
            <h1 style="color:white;font-size:28px;font-weight:900;margin:0 0 4px;">UniSphere</h1>
            <p style="color:rgba(255,255,255,0.75);font-size:13px;margin:0;">SLIIT Tutor Booking Platform</p>
          </div>
          <div style="text-align:right;">
            <p style="color:rgba(255,255,255,0.65);font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 4px;">INVOICE</p>
            <p style="color:white;font-size:20px;font-weight:900;margin:0 0 8px;">${data.id}</p>
            <span style="background:#4ade80;color:#14532d;font-size:11px;font-weight:900;padding:4px 12px;border-radius:20px;text-transform:uppercase;">${data.status}</span>
          </div>
        </div>
      </div>

      <!-- Billing Info -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px;">
        <div style="background:#f8fafc;padding:20px;border-radius:12px;border:1px solid #e2e8f0;">
          <p style="font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:2px;color:#94a3b8;margin:0 0 10px;">Billed To</p>
          <p style="font-weight:900;font-size:15px;margin:0 0 4px;">${data.studentName}</p>
          <p style="color:#64748b;font-size:13px;margin:0 0 2px;">${data.studentId}</p>
          <p style="color:#64748b;font-size:13px;margin:0;">${data.studentEmail}</p>
        </div>
        <div style="background:#f8fafc;padding:20px;border-radius:12px;border:1px solid #e2e8f0;text-align:right;">
          <p style="font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:2px;color:#94a3b8;margin:0 0 10px;">Invoice Details</p>
          <p style="font-size:13px;font-weight:700;margin:0 0 4px;">Date: ${data.date}</p>
          <p style="font-size:13px;font-weight:700;margin:0 0 4px;">Booking Ref: ${data.bookingRef}</p>
          <p style="font-size:13px;font-weight:700;margin:0;">Payment: ${data.paymentMethod}</p>
        </div>
      </div>

      <!-- Session Details -->
      <div style="background:#f8fafc;padding:20px;border-radius:12px;border:1px solid #e2e8f0;margin-bottom:24px;">
        <p style="font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:2px;color:#94a3b8;margin:0 0 14px;">Session Details</p>
        ${[
          ['Tutor', data.tutorName],
          ['Subject', data.subject],
          ['Scheduled Slot', data.slot],
          ['Duration', data.duration],
          ['Session Type', data.sessionType],
        ].map(([label, value]) => `
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0;">
            <span style="font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">${label}</span>
            <span style="font-size:13px;font-weight:700;">${value}</span>
          </div>
        `).join('')}
      </div>

      <!-- Price Breakdown -->
      <div style="background:#f8fafc;padding:20px;border-radius:12px;border:1px solid #e2e8f0;margin-bottom:24px;">
        <p style="font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:2px;color:#94a3b8;margin:0 0 14px;">Price Breakdown</p>
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0;">
          <span style="font-size:13px;font-weight:700;">Session Fee (${data.hours}hr × Rs. ${data.hourlyRate.toLocaleString()})</span>
          <span style="font-size:13px;font-weight:700;">Rs. ${sessionFee.toLocaleString()}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0;">
          <span style="font-size:13px;color:#94a3b8;font-weight:600;">Platform Fee (5%)</span>
          <span style="font-size:13px;color:#94a3b8;font-weight:600;">Rs. ${data.platformFee.toLocaleString()}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:14px 0 0;">
          <span style="font-size:15px;font-weight:900;">Total Amount</span>
          <span style="font-size:20px;font-weight:900;color:#6366f1;">Rs. ${data.total.toLocaleString()}</span>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align:center;padding:20px;border-top:1px solid #e2e8f0;">
        <p style="color:#94a3b8;font-size:13px;margin:0 0 4px;">Thank you for using UniSphere!</p>
        <p style="color:#cbd5e1;font-size:12px;margin:0;">support@unisphere.lk · SLIIT Faculty of Computing · 2026</p>
      </div>
    </div>
  `;

  const el = createPrintArea(html);
  triggerPrint(el);
};

/* ════════════════════════════════════════════════════════════════════
   BOOKING CONFIRMATION PDF
════════════════════════════════════════════════════════════════════ */
export const downloadBookingPDF = (data: BookingData) => {
  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;color:#1e293b;max-width:680px;margin:0 auto;">

      <!-- Header -->
      <div style="background:linear-gradient(135deg,#10b981,#059669);padding:32px;border-radius:16px;margin-bottom:24px;text-align:center;">
        <div style="width:64px;height:64px;background:rgba(255,255,255,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:32px;">✅</div>
        <h1 style="color:white;font-size:24px;font-weight:900;margin:0 0 6px;">Booking Confirmed!</h1>
        <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:0 0 12px;">Your session has been successfully booked</p>
        <div style="background:rgba(255,255,255,0.2);display:inline-block;padding:8px 20px;border-radius:20px;">
          <span style="color:white;font-weight:900;font-size:15px;">${data.bookingRef}</span>
        </div>
      </div>

      <!-- Details -->
      <div style="background:#f8fafc;padding:24px;border-radius:12px;border:1px solid #e2e8f0;margin-bottom:20px;">
        <p style="font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:2px;color:#94a3b8;margin:0 0 14px;">Booking Details</p>
        ${[
          ['Student', data.studentName],
          ['Student ID', data.studentId],
          ['Email', data.email],
          ['Tutor', data.tutorName],
          ['Subject', data.subject],
          ['Date', data.date],
          ['Slot', data.slot],
          ['Duration', data.duration],
          ['Session Type', data.sessionType],
          ['Topic', data.topic],
          ['Payment Method', data.paymentMethod],
        ].map(([label, value]) => `
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0;">
            <span style="font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;min-width:140px;">${label}</span>
            <span style="font-size:13px;font-weight:700;text-align:right;">${value}</span>
          </div>
        `).join('')}
        <div style="display:flex;justify-content:space-between;padding:14px 0 0;">
          <span style="font-size:15px;font-weight:900;">Total Amount</span>
          <span style="font-size:20px;font-weight:900;color:#6366f1;">Rs. ${data.total.toLocaleString()}</span>
        </div>
      </div>

      <!-- Status -->
      <div style="background:#fefce8;border:1px solid #fde68a;padding:16px 20px;border-radius:12px;margin-bottom:20px;display:flex;align-items:center;gap:12px;">
        <span style="font-size:20px;">⏳</span>
        <div>
          <p style="font-weight:900;color:#854d0e;font-size:13px;margin:0 0 2px;">Awaiting Tutor Approval</p>
          <p style="color:#92400e;font-size:12px;margin:0;">You will be notified within 1 hour once confirmed.</p>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align:center;padding:20px;border-top:1px solid #e2e8f0;">
        <p style="color:#94a3b8;font-size:13px;margin:0 0 4px;">UniSphere SLIIT · Tutor Booking Platform</p>
        <p style="color:#cbd5e1;font-size:12px;margin:0;">support@unisphere.lk · 2026</p>
      </div>
    </div>
  `;

  const el = createPrintArea(html);
  triggerPrint(el);
};

/* ── React wrapper component (optional) ─────────────────────────── */
export default function PDFDocument() {
  return null; // Utility module — use exported functions directly
}