"use client";

import "../../src/app/portfolio.css";
import { useState, useMemo } from "react";
import { deleteAchievement } from "../../lib/api";
import Modal from "../Modal";
import AchievementForm from "./AchievementForm";
import VerificationCertificateOverlay from "./VerificationCertificateOverlay";

const BASE = "http://localhost:8084";

const FILTERS = [
  { key: "ALL",      label: "All"      },
  { key: "PENDING",  label: "Pending"  },
  { key: "APPROVED", label: "Approved" },
  { key: "REJECTED", label: "Rejected" },
];

function StatusBadge({ status }) {
  const map = {
    APPROVED: { cls: "status-approved", label: "Approved" },
    REJECTED: { cls: "status-rejected", label: "Rejected" },
    PENDING:  { cls: "status-pending",  label: "Pending"  },
  };
  const { cls, label } = map[status] || map.PENDING;
  return <span className={`status-badge ${cls}`}>{label}</span>;
}

export default function AchievementList({ achievements, studentId, onRefresh, toast }) {
  const [filter, setFilter]           = useState("ALL");
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, title: "" });
  const [editAchievement, setEditAchievement] = useState(null);
  const [deleting, setDeleting]       = useState(false);
  const [certOverlay, setCertOverlay] = useState({ open: false, achievementId: null });

  // sort newest first, then filter
  const displayed = useMemo(() => {
    const sorted = [...(achievements || [])].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
    return filter === "ALL" ? sorted : sorted.filter((a) => a.status === filter);
  }, [achievements, filter]);

  // counts for tab badges
  const counts = useMemo(() => {
    const c = { ALL: 0, PENDING: 0, APPROVED: 0, REJECTED: 0 };
    (achievements || []).forEach((a) => {
      c.ALL++;
      if (c[a.status] !== undefined) c[a.status]++;
    });
    return c;
  }, [achievements]);

  const openEdit = (item) => {
    if (item.status === "APPROVED") {
      toast?.warning("Cannot Edit", "Approved achievements cannot be edited.");
      return;
    }
    setEditAchievement(item);
  };

  const closeEdit = () => setEditAchievement(null);

  const openDelete = (item) => {
    if (item.status === "APPROVED") {
      toast?.warning("Cannot Delete", "Approved achievements cannot be deleted.");
      return;
    }
    setDeleteModal({ open: true, id: item.id, title: item.title });
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await deleteAchievement(deleteModal.id);
      toast?.success("Deleted", "Achievement has been removed.");
      setDeleteModal({ open: false, id: null, title: "" });
      onRefresh();
    } catch (err) {
      toast?.error("Delete Failed", err.message || "Could not delete achievement.");
    } finally {
      setDeleting(false);
    }
  };

  if (!achievements || achievements.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon" aria-hidden="true">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3>No achievements yet</h3>
        <p>Submit your first achievement using the form above.</p>
      </div>
    );
  }

  return (
    <>
      {/* Filter tabs */}
      <div className="achievement-filters">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            className={`filter-tab${filter === key ? " active" : ""}`}
            onClick={() => setFilter(key)}
          >
            {label}
            {counts[key] > 0 && (
              <span className={`filter-count${filter === key ? " active" : ""}`}>
                {counts[key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <div className="empty-state" style={{ padding: "32px 16px" }}>
          <h3 style={{ fontSize: 14 }}>No {filter.toLowerCase()} achievements</h3>
          <p style={{ fontSize: 12 }}>Nothing to show for this filter.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {displayed.map((item) => (
            <div key={item.id} className="achievement-card">
              <div className="achievement-card-header">
                <div>
                  <div className="achievement-card-title">{item.title}</div>
                  <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 2 }}>
                    Submitted {item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                  </div>
                </div>
                <StatusBadge status={item.status} />
              </div>

              <div className="achievement-meta">
                <div className="meta-item"><strong>Category:</strong>&nbsp;{item.category}</div>
                <div className="meta-item"><strong>Institution:</strong>&nbsp;{item.institution}</div>
                <div className="meta-item"><strong>Level:</strong>&nbsp;{item.level}</div>
                <div className="meta-item"><strong>Date:</strong>&nbsp;{item.achievementDate}</div>
              </div>

              <div className="achievement-description">{item.description}</div>

              {item.adminComment && (
                <div className="admin-comment-box">
                  <strong>Admin Comment:</strong> {item.adminComment}
                </div>
              )}

              {item.certificateUrl && (
                <a className="cert-link" href={`${BASE}${item.certificateUrl}`} target="_blank" rel="noreferrer">
                  View Certificate
                </a>
              )}

              <div className="btn-row" style={{ marginTop: 12 }}>
                {item.status === "APPROVED" && (
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => setCertOverlay({ open: true, achievementId: item.id })}
                    title="Get verification certificate"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4 }}>
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Get Certificate
                  </button>
                )}
                <button
                  className="btn btn-info btn-sm"
                  onClick={() => openEdit(item)}
                  disabled={item.status === "APPROVED"}
                  title={item.status === "APPROVED" ? "Approved achievements cannot be edited" : "Edit"}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => openDelete(item)}
                  disabled={item.status === "APPROVED"}
                  title={item.status === "APPROVED" ? "Approved achievements cannot be deleted" : "Delete"}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editAchievement && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeEdit(); }}>
          <div className="modal modal-xl" role="dialog" aria-modal="true" aria-label="Edit Achievement">
            <div className="edit-modal-header">
              <div>
                <div className="modal-title">Edit Achievement</div>
                <div className="modal-message">Update the details below and save your changes.</div>
              </div>
              <button className="modal-close-btn" onClick={closeEdit} aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <AchievementForm
                studentId={studentId}
                selectedAchievement={editAchievement}
                clearSelection={closeEdit}
                onSuccess={() => { closeEdit(); onRefresh(); }}
                toast={toast}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <Modal
        open={deleteModal.open}
        type="danger"
        title="Delete Achievement"
        message={`Are you sure you want to delete "${deleteModal.title}"? This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        cancelLabel="Keep It"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ open: false, id: null, title: "" })}
        loading={deleting}
      />

      {/* Verification Certificate Overlay */}
      {certOverlay.open && (
        <VerificationCertificateOverlay
          achievementId={certOverlay.achievementId}
          onClose={() => setCertOverlay({ open: false, achievementId: null })}
          toast={toast}
        />
      )}
    </>
  );
}