"use client";

import "../src/app/portfolio.css";
import { useEffect, useState } from "react";
import { approveAchievement, getPendingAchievements, rejectAchievement, suspendStudent } from "../lib/api";
import Modal from "./Modal";

const BASE = "http://localhost:8084";

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function CertificateViewer({ url, onClose }) {
  const fullUrl = `${BASE}${url}`;
  const isPdf = url?.toLowerCase().endsWith(".pdf");
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="modal-overlay cert-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="cert-viewer" role="dialog" aria-modal="true">
        <div className="cert-viewer-header">
          <span className="cert-viewer-title">Certificate / Evidence</span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <a href={fullUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">Open in new tab</a>
            <button className="modal-close-btn" onClick={onClose} aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
        <div className="cert-viewer-body">
          {isPdf ? <iframe src={fullUrl} title="Certificate" className="cert-iframe" /> : <img src={fullUrl} alt="Certificate evidence" className="cert-image" />}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard({ toast }) {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState({});
  const [commentErrors, setCommentErrors] = useState({});
  const [certUrl, setCertUrl] = useState(null);
  const [actionModal, setActionModal] = useState({ open: false, type: null, id: null, studentId: null, title: "" });
  const [processing, setProcessing] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getPendingAchievements();
      setAchievements(data || []);
    } catch { toast?.error("Load Failed", "Could not fetch pending achievements."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const setComment = (id, val) => {
    setComments((p) => ({ ...p, [id]: val }));
    if (commentErrors[id]) setCommentErrors((p) => ({ ...p, [id]: undefined }));
  };

  const requireComment = (id) => {
    if (!comments[id]?.trim()) {
      setCommentErrors((p) => ({ ...p, [id]: "A comment is required before taking action." }));
      return false;
    }
    return true;
  };

  const openAction = (type, item) => {
    if (type !== "suspend" && !requireComment(item.id)) return;
    setActionModal({ open: true, type, id: item.id, studentId: item.student?.id, title: item.title });
  };

  const closeModal = () => setActionModal({ open: false, type: null, id: null, studentId: null, title: "" });

  const confirmAction = async () => {
    const { type, id, studentId } = actionModal;
    try {
      setProcessing(true);
      if (type === "approve") { await approveAchievement(id, comments[id]); toast?.success("Approved", "Achievement approved successfully."); }
      else if (type === "reject") { await rejectAchievement(id, comments[id]); toast?.success("Rejected", "Achievement has been rejected."); }
      else if (type === "suspend") { await suspendStudent(studentId); toast?.success("Suspended", "Student account suspended."); }
      closeModal(); load();
    } catch (err) { toast?.error("Action Failed", err.message || "Something went wrong."); }
    finally { setProcessing(false); }
  };

  if (loading) return <div className="loading-spinner"><span className="spinner" />Loading achievements...</div>;

  if (achievements.length === 0) return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      </div>
      <h3>All caught up</h3>
      <p>There are no pending achievements to review.</p>
    </div>
  );

  const MODAL_CONFIG = {
    approve: { type: "approve", title: "Approve Achievement", message: `Approve "${actionModal.title}"? This may trigger badge assignment.`, confirmLabel: "Approve" },
    reject:  { type: "reject",  title: "Reject Achievement",  message: `Reject "${actionModal.title}"? The student will be notified.`,        confirmLabel: "Reject"  },
    suspend: { type: "purple",  title: "Suspend Student",     message: "Suspend this student? They lose access until reinstated.",             confirmLabel: "Suspend" },
  };
  const mc = MODAL_CONFIG[actionModal.type] || {};

  return (
    <>
      <div className="admin-grid">
        {achievements.map((item) => {
          const student = item.student || {};
          return (
            <div key={item.id} className="admin-achievement-card">
              <div className="admin-card-top">
                <div className="admin-card-title-row">
                  <div>
                    <div className="admin-achievement-title">{item.title}</div>
                    <div className="admin-achievement-sub">Submitted {item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}</div>
                  </div>
                  <span className="status-badge status-pending">Pending Review</span>
                </div>
                <div className="student-info">
                  <div className="student-avatar">{getInitials(student.fullName)}</div>
                  <div>
                    <div className="student-name">{student.fullName || "Unknown Student"}</div>
                    <div className="student-email">{student.email || "—"}</div>
                  </div>
                </div>
              </div>

              <div className="admin-card-body">
                <div className="detail-grid">
                  <div className="detail-item"><span className="detail-label">Category</span><span className="detail-value">{item.category}</span></div>
                  <div className="detail-item"><span className="detail-label">Level</span><span className="detail-value">{item.level}</span></div>
                  <div className="detail-item"><span className="detail-label">Institution</span><span className="detail-value">{item.institution}</span></div>
                  <div className="detail-item"><span className="detail-label">Achievement Date</span><span className="detail-value">{item.achievementDate}</span></div>
                </div>
                <div className="achievement-description">{item.description}</div>
                {item.certificateUrl ? (
                  <button className="cert-view-btn" onClick={() => setCertUrl(item.certificateUrl)} type="button">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    View Evidence
                  </button>
                ) : (
                  <div className="no-cert-label">No certificate uploaded</div>
                )}
                <div className="form-group" style={{ marginTop: 16 }}>
                  <label className="form-label">Admin Comment <span className="required">*</span></label>
                  <textarea className={`comment-input${commentErrors[item.id] ? " error" : ""}`} rows={3} placeholder="Enter approval or rejection reason..." value={comments[item.id] || ""} onChange={(e) => setComment(item.id, e.target.value)} />
                  {commentErrors[item.id] && <span className="form-error">{commentErrors[item.id]}</span>}
                </div>
              </div>

              <div className="admin-card-footer">
                <button className="admin-action-btn admin-action-approve" onClick={() => openAction("approve", item)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                  Approve
                </button>
                <button className="admin-action-btn admin-action-reject" onClick={() => openAction("reject", item)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  Reject
                </button>
                <button className="admin-action-btn admin-action-suspend" onClick={() => openAction("suspend", item)} style={{ marginLeft: "auto" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                  Suspend Student
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {certUrl && <CertificateViewer url={certUrl} onClose={() => setCertUrl(null)} />}

      <Modal open={actionModal.open} type={mc.type} title={mc.title} message={mc.message} confirmLabel={mc.confirmLabel} cancelLabel="Cancel" onConfirm={confirmAction} onCancel={closeModal} loading={processing} />
    </>
  );
}