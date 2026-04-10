"use client";

import { useEffect, useRef, useState } from "react";
import { getVerificationCertificate } from "../../lib/api";

/* Hidden A4 element rendered off-screen — used only for PDF generation */
function A4Certificate({ certificate, innerRef }) {
  return (
    <div
      ref={innerRef}
      style={{
        position: "fixed",
        left: -9999,
        top: 0,
        width: 794,       // A4 at 96dpi
        minHeight: 1123,
        background: "#fff",
        fontFamily: "'Georgia', 'Times New Roman', serif",
        color: "#1a1a2e",
        padding: "60px 64px",
        boxSizing: "border-box",
      }}
    >
      {/* Outer border */}
      <div style={{ border: "3px solid #4f46e5", padding: "40px 44px", minHeight: 1003, position: "relative", boxSizing: "border-box" }}>
        {/* Corner accents */}
        {[
          { top: 8, left: 8, borderTop: "3px solid #4f46e5", borderLeft: "3px solid #4f46e5" },
          { top: 8, right: 8, borderTop: "3px solid #4f46e5", borderRight: "3px solid #4f46e5" },
          { bottom: 8, left: 8, borderBottom: "3px solid #4f46e5", borderLeft: "3px solid #4f46e5" },
          { bottom: 8, right: 8, borderBottom: "3px solid #4f46e5", borderRight: "3px solid #4f46e5" },
        ].map((s, i) => (
          <div key={i} style={{ position: "absolute", width: 36, height: 36, ...s }} />
        ))}

        {/* Letterhead */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 11, fontFamily: "sans-serif", fontWeight: 700, letterSpacing: 5, color: "#4f46e5", textTransform: "uppercase", marginBottom: 8 }}>
            UniSphere Academic Platform
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 0.5, color: "#1a1a2e", marginBottom: 10 }}>
            Certificate of Achievement Verification
          </div>
          <div style={{ width: 72, height: 3, background: "#4f46e5", margin: "0 auto" }} />
        </div>

        {/* Ref & Date */}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontFamily: "sans-serif", color: "#555", marginBottom: 32, borderBottom: "1px solid #e5e7eb", paddingBottom: 14 }}>
          <span>Ref: <strong style={{ color: "#1a1a2e" }}>{certificate.certificateId}</strong></span>
          <span>Date: <strong style={{ color: "#1a1a2e" }}>{certificate.issuedDate}</strong></span>
        </div>

        {/* Salutation */}
        <p style={{ fontSize: 13, fontFamily: "sans-serif", color: "#333", marginBottom: 18, lineHeight: 1.8 }}>
          To Whom It May Concern,
        </p>

        {/* Body */}
        <p style={{ fontSize: 13, fontFamily: "sans-serif", color: "#333", lineHeight: 1.9, marginBottom: 18 }}>
          This is to formally certify that{" "}
          <strong style={{ color: "#1a1a2e" }}>{certificate.studentName}</strong>{" "}
          has submitted an achievement that has been thoroughly reviewed and officially{" "}
          <strong style={{ color: "#16a34a" }}>APPROVED</strong> by the UniSphere administration team.
        </p>

        <p style={{ fontSize: 13, fontFamily: "sans-serif", color: "#333", lineHeight: 1.9, marginBottom: 22 }}>
          The details of the verified achievement are as follows:
        </p>

        {/* Details table */}
        <div style={{ background: "#f5f3ff", border: "1px solid #c4b5fd", borderRadius: 6, padding: "18px 22px", marginBottom: 26 }}>
          {[
            ["Achievement Title", certificate.achievementTitle],
            ["Category",          certificate.category],
            ["Level",             certificate.level],
            ["Institution",       certificate.institution],
            ["Achievement Date",  certificate.achievementDate],
          ].map(([label, value]) => (
            <div key={label} style={{ display: "flex", gap: 12, marginBottom: 10, fontSize: 12, fontFamily: "sans-serif" }}>
              <span style={{ minWidth: 140, fontWeight: 700, color: "#4f46e5" }}>{label}:</span>
              <span style={{ color: "#1a1a2e" }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Closing paragraph */}
        <p style={{ fontSize: 13, fontFamily: "sans-serif", color: "#333", lineHeight: 1.9, marginBottom: 40 }}>
          This certificate serves as official confirmation that the above achievement is valid and has been
          verified through the UniSphere Achievement Management System. It may be presented as proof of
          accomplishment to any relevant institution or authority.
        </p>

        {/* Signature + Seal */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 12, fontFamily: "sans-serif", color: "#555", marginBottom: 6 }}>Yours sincerely,</div>
            <div style={{ fontSize: 22, fontFamily: "'Georgia', serif", fontStyle: "italic", color: "#4f46e5", marginBottom: 4 }}>
              Dr. A. Perera
            </div>
            <div style={{ fontSize: 12, fontFamily: "sans-serif", fontWeight: 700, color: "#1a1a2e" }}>Head of UniSphere</div>
            <div style={{ fontSize: 11, fontFamily: "sans-serif", color: "#777" }}>UniSphere Academic Platform</div>
          </div>

          <div style={{
            width: 88, height: 88, borderRadius: "50%",
            border: "3px solid #4f46e5",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            color: "#4f46e5", fontSize: 9, fontFamily: "sans-serif",
            fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", lineHeight: 1.5,
          }}>
            <div style={{ fontSize: 20, marginBottom: 2 }}>✦</div>
            <div>Official</div>
            <div>Seal</div>
            <div>UniSphere</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 36, paddingTop: 14, borderTop: "1px solid #e5e7eb", textAlign: "center", fontSize: 10, fontFamily: "sans-serif", color: "#aaa", letterSpacing: 0.4 }}>
          © 2026 UniSphere Academic Platform · v1.0.0 · This document is digitally generated and valid without a physical signature.
        </div>
      </div>
    </div>
  );
}

export default function VerificationCertificateOverlay({ achievementId, onClose, toast }) {
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError]             = useState(null);
  const a4Ref = useRef(null);

  useEffect(() => {
    getVerificationCertificate(achievementId)
      .then(setCertificate)
      .catch((err) => {
        setError(err.message || "Failed to generate certificate");
        toast?.error("Certificate Error", err.message || "Could not generate certificate");
      })
      .finally(() => setLoading(false));
  }, [achievementId]);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const downloadPDF = async () => {
    if (!certificate || !a4Ref.current) return;
    setDownloading(true);
    try {
      const { default: jsPDF }       = await import("jspdf");
      const { default: html2canvas } = await import("html2canvas");

      const canvas = await html2canvas(a4Ref.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: 794,
        windowWidth: 794,
      });

      const pdf    = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW  = pdf.internal.pageSize.getWidth();   // 210mm
      const pageH  = pdf.internal.pageSize.getHeight();  // 297mm
      const imgH   = (canvas.height / canvas.width) * pageW;

      if (imgH <= pageH) {
        // fits on one page — centre vertically
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, (pageH - imgH) / 2, pageW, imgH);
      } else {
        // multi-page fallback
        let y = 0;
        while (y < imgH) {
          if (y > 0) pdf.addPage();
          pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, -y, pageW, imgH);
          y += pageH;
        }
      }

      pdf.save(`${certificate.certificateId}_UniSphere_Verification.pdf`);
      toast?.success("Downloaded", "Certificate PDF saved successfully");
    } catch {
      toast?.error("Download Failed", "Could not generate PDF");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      {/* Hidden A4 element for PDF rendering */}
      {certificate && <A4Certificate certificate={certificate} innerRef={a4Ref} />}

      {/* Overlay modal — clean preview only */}
      <div
        className="modal-overlay"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="modal modal-lg" role="dialog" aria-modal="true" style={{ position: "relative", maxWidth: 560 }}>

          {/* Close — top right */}
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close"
            style={{ position: "absolute", top: 14, right: 14, zIndex: 10 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <div className="modal-body" style={{ padding: "28px 28px 8px" }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "48px 20px" }}>
                <span className="spinner" style={{ width: 32, height: 32, borderWidth: 2 }} />
                <p style={{ marginTop: 16, color: "var(--gray-400)" }}>Generating certificate...</p>
              </div>
            ) : error ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--danger)" }}>
                <p>{error}</p>
              </div>
            ) : certificate ? (
              <div>
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: "var(--primary-light)", color: "var(--primary)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 12px", fontSize: 26,
                  }}>✦</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "var(--gray-900)" }}>Verification Certificate</div>
                  <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 4 }}>
                    Ref: {certificate.certificateId} &nbsp;·&nbsp; Issued: {certificate.issuedDate}
                  </div>
                </div>

                {/* Details */}
                <div style={{ background: "var(--gray-50)", border: "1px solid var(--gray-200)", borderRadius: 10, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    ["Student",      certificate.studentName],
                    ["Achievement",  certificate.achievementTitle],
                    ["Category",     certificate.category],
                    ["Level",        certificate.level],
                    ["Institution",  certificate.institution],
                    ["Date",         certificate.achievementDate],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: "flex", gap: 12, fontSize: 13 }}>
                      <span style={{ minWidth: 100, fontWeight: 600, color: "var(--gray-500)" }}>{label}</span>
                      <span style={{ color: "var(--gray-900)", fontWeight: 500 }}>{value}</span>
                    </div>
                  ))}
                </div>

                {/* Approved badge */}
                <div style={{ marginTop: 16, padding: "10px 14px", background: "var(--success-light)", borderRadius: 8, borderLeft: "4px solid var(--success)", fontSize: 12, color: "#166534" }}>
                  ✓ This achievement has been officially reviewed and approved by UniSphere administrators.
                </div>
              </div>
            ) : null}
          </div>

          <div className="modal-footer" style={{ padding: "16px 28px 24px" }}>
            <button className="btn btn-ghost" onClick={onClose}>Close</button>
            <button
              className="btn btn-primary"
              onClick={downloadPDF}
              disabled={loading || downloading || !certificate}
            >
              {downloading ? (
                <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />&nbsp;Generating PDF...</>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download as PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
