"use client";

import "../portfolio.css";
import Navbar from "../../../components/Navbar";
import AdminDashboard from "../../../components/AdminDashboard";
import Toast from "../../../components/Toast";
import { useToast } from "../../../hooks/useToast";

export default function AdminPage() {
  const { toasts, removeToast, toast } = useToast();

  return (
    <div className="portfolio-root">
      <Navbar />
      <main className="page">
        <div className="section-header" style={{ marginBottom: 28 }}>
          <div>
            <div className="section-title">Admin Dashboard</div>
            <div className="section-subtitle">Review and manage student achievement submissions</div>
          </div>
        </div>
        <AdminDashboard toast={toast} />
      </main>
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
