"use client";

import { useEffect } from "react";

const ICON_MAP = {
  danger: { emoji: "🗑️", cls: "modal-icon-danger" },
  success: { emoji: "✅", cls: "modal-icon-success" },
  warning: { emoji: "⚠️", cls: "modal-icon-warning" },
  info: { emoji: "ℹ️", cls: "modal-icon-info" },
  purple: { emoji: "🚫", cls: "modal-icon-purple" },
  approve: { emoji: "✅", cls: "modal-icon-success" },
  reject: { emoji: "❌", cls: "modal-icon-danger" },
};

/**
 * Reusable confirmation/alert modal.
 * Props:
 *  open, type, title, message, confirmLabel, cancelLabel,
 *  onConfirm, onCancel, children (for extra body content), size
 */
export default function Modal({
  open,
  type = "info",
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  children,
  size,
  loading = false,
}) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onCancel?.(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  const icon = ICON_MAP[type] || ICON_MAP.info;

  const confirmBtnClass =
    type === "danger" || type === "reject" ? "btn btn-danger" :
    type === "approve" || type === "success" ? "btn btn-success" :
    type === "purple" ? "btn btn-purple" :
    "btn btn-primary";

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onCancel?.(); }}>
      <div className={`modal${size === "lg" ? " modal-lg" : ""}`} role="dialog" aria-modal="true">
        <div className="modal-header">
          <div className={`modal-icon ${icon.cls}`}>{icon.emoji}</div>
          <div>
            <div className="modal-title">{title}</div>
            {message && <div className="modal-message">{message}</div>}
          </div>
        </div>

        {children && <div className="modal-body">{children}</div>}

        <div className="modal-footer">
          {onCancel && (
            <button className="btn btn-ghost" onClick={onCancel} disabled={loading}>
              {cancelLabel}
            </button>
          )}
          {onConfirm && (
            <button className={confirmBtnClass} onClick={onConfirm} disabled={loading}>
              {loading ? (
                <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Processing...</>
              ) : confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
