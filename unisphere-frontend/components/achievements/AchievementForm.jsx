"use client";

import "../../src/app/portfolio.css";
import { useEffect, useState } from "react";
import { createAchievement, updateAchievement } from "../../lib/api";

const INITIAL = {
  title: "", category: "", description: "",
  institution: "", level: "", achievementDate: "", file: null,
};

const CATEGORIES = ["Academic", "Sports", "Competition", "Leadership", "Volunteer", "Workshop"];
const LEVELS = ["School", "University", "National", "International"];

function validate(form) {
  const e = {};
  if (!form.title.trim()) e.title = "Title is required";
  else if (form.title.trim().length < 3) e.title = "Title must be at least 3 characters";
  if (!form.category) e.category = "Please select a category";
  if (!form.description.trim()) e.description = "Description is required";
  else if (form.description.trim().length < 10) e.description = "Description must be at least 10 characters";
  if (!form.institution.trim()) e.institution = "Institution name is required";
  if (!form.level) e.level = "Please select a level";
  if (!form.achievementDate) e.achievementDate = "Achievement date is required";
  else if (new Date(form.achievementDate) > new Date()) e.achievementDate = "Date cannot be in the future";
  if (form.file) {
    const allowed = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    if (!allowed.includes(form.file.type)) e.file = "Only PDF, PNG, JPG, JPEG files are allowed";
    else if (form.file.size > 5 * 1024 * 1024) e.file = "File size must be less than 5MB";
  }
  return e;
}

function ConfirmSubmitModal({ form, onConfirm, onCancel, submitting }) {
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onCancel]);

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="modal modal-lg" role="dialog" aria-modal="true">
        <div className="confirm-submit-header">
          <div className="confirm-submit-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="modal-title">Submit Achievement</div>
            <div className="modal-message">Please review your details before submitting for admin review.</div>
          </div>
        </div>

        <div className="modal-body">
          <div className="confirm-submit-summary">
            <div className="confirm-row">
              <span className="confirm-label">Title</span>
              <span className="confirm-value">{form.title}</span>
            </div>
            <div className="confirm-row">
              <span className="confirm-label">Category</span>
              <span className="confirm-value">{form.category}</span>
            </div>
            <div className="confirm-row">
              <span className="confirm-label">Institution</span>
              <span className="confirm-value">{form.institution}</span>
            </div>
            <div className="confirm-row">
              <span className="confirm-label">Level</span>
              <span className="confirm-value">{form.level}</span>
            </div>
            <div className="confirm-row">
              <span className="confirm-label">Date</span>
              <span className="confirm-value">{form.achievementDate}</span>
            </div>
            <div className="confirm-row">
              <span className="confirm-label">Certificate</span>
              <span className="confirm-value">{form.file ? form.file.name : "None"}</span>
            </div>
          </div>
          <div className="confirm-submit-note">
            Once submitted, your achievement will be sent to an admin for review. You will be notified of the outcome.
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onCancel} disabled={submitting}>
            Go Back
          </button>
          <button className="btn btn-primary" onClick={onConfirm} disabled={submitting}>
            {submitting ? (
              <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Submitting...</>
            ) : "Confirm & Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AchievementForm({ studentId, selectedAchievement, clearSelection, onSuccess, toast }) {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isEdit = !!selectedAchievement;

  useEffect(() => {
    if (selectedAchievement) {
      setForm({
        title: selectedAchievement.title || "",
        category: selectedAchievement.category || "",
        description: selectedAchievement.description || "",
        institution: selectedAchievement.institution || "",
        level: selectedAchievement.level || "",
        achievementDate: selectedAchievement.achievementDate || "",
        file: null,
      });
      setErrors({});
    } else {
      setForm(INITIAL);
      setErrors({});
    }
  }, [selectedAchievement]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setForm((p) => ({ ...p, file: files[0] || null }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
    if (errors[name]) setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setForm((p) => ({ ...p, file }));
      if (errors.file) setErrors((p) => ({ ...p, file: undefined }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    if (!isEdit) {
      setShowConfirm(true);
      return;
    }
    doSubmit();
  };

  const doSubmit = async () => {
    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append("studentId", studentId);
      fd.append("title", form.title.trim());
      fd.append("category", form.category);
      fd.append("description", form.description.trim());
      fd.append("institution", form.institution.trim());
      fd.append("level", form.level);
      fd.append("achievementDate", form.achievementDate);
      if (form.file) fd.append("file", form.file);

      if (isEdit) {
        await updateAchievement(selectedAchievement.id, fd);
        toast?.success("Achievement Updated", "Your achievement has been updated and is pending review.");
        clearSelection();
      } else {
        await createAchievement(fd);
        toast?.success("Achievement Submitted", "Your achievement has been submitted for admin review.");
        setShowConfirm(false);
      }

      setForm(INITIAL);
      setErrors({});
      onSuccess();
    } catch (err) {
      toast?.error("Submission Failed", err.message || "Something went wrong. Please try again.");
      setShowConfirm(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    clearSelection?.();
    setForm(INITIAL);
    setErrors({});
  };

  return (
    <>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Achievement Title <span className="required">*</span></label>
            <input className={`form-input${errors.title ? " error" : ""}`} type="text" name="title" value={form.title} onChange={handleChange} placeholder="e.g. First Place - Science Olympiad" />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Category <span className="required">*</span></label>
            <select className={`form-select${errors.category ? " error" : ""}`} name="category" value={form.category} onChange={handleChange}>
              <option value="">Select Category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <span className="form-error">{errors.category}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Institution <span className="required">*</span></label>
            <input className={`form-input${errors.institution ? " error" : ""}`} type="text" name="institution" value={form.institution} onChange={handleChange} placeholder="e.g. University of Colombo" />
            {errors.institution && <span className="form-error">{errors.institution}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Level <span className="required">*</span></label>
            <select className={`form-select${errors.level ? " error" : ""}`} name="level" value={form.level} onChange={handleChange}>
              <option value="">Select Level</option>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            {errors.level && <span className="form-error">{errors.level}</span>}
          </div>

          <div className="form-group full-width">
            <label className="form-label">Description <span className="required">*</span></label>
            <textarea className={`form-textarea${errors.description ? " error" : ""}`} name="description" value={form.description} onChange={handleChange} placeholder="Describe your achievement in detail..." rows={4} />
            {errors.description && <span className="form-error">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Achievement Date <span className="required">*</span></label>
            <input className={`form-input${errors.achievementDate ? " error" : ""}`} type="date" name="achievementDate" value={form.achievementDate} onChange={handleChange} max={new Date().toISOString().split("T")[0]} />
            {errors.achievementDate && <span className="form-error">{errors.achievementDate}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Certificate / Evidence{" "}
              {!isEdit && <span style={{ color: "var(--gray-400)", fontWeight: 400 }}>(optional)</span>}
            </label>
            <div
              className={`file-upload-area${dragOver ? " drag-over" : ""}${form.file ? " has-file" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <input type="file" name="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} />
              <div className="file-upload-icon">
                {form.file ? (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                )}
              </div>
              {form.file ? (
                <div className="file-upload-name">{form.file.name}</div>
              ) : (
                <div className="file-upload-text">
                  Drag and drop or click to upload<br />
                  <small>PDF, JPG, PNG — max 5MB</small>
                </div>
              )}
            </div>
            {errors.file && <span className="form-error">{errors.file}</span>}
          </div>

          <div className="full-width btn-row" style={{ marginTop: 4 }}>
            <button className="btn btn-primary btn-lg" type="submit" disabled={submitting}>
              {isEdit ? "Update Achievement" : "Submit Achievement"}
            </button>
            {isEdit && (
              <button type="button" className="btn btn-ghost" onClick={handleCancel}>Cancel</button>
            )}
          </div>
        </div>
      </form>

      {showConfirm && (
        <ConfirmSubmitModal
          form={form}
          onConfirm={doSubmit}
          onCancel={() => setShowConfirm(false)}
          submitting={submitting}
        />
      )}
    </>
  );
}