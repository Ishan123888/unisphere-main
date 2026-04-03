"use client";

import "../portfolio.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AchievementForm from "../../../components/achievements/AchievementForm";
import AchievementList from "../../../components/achievements/AchievementList";
import Toast from "../../../components/Toast";
import { useToast } from "../../../hooks/useToast";
import { getAchievementsByStudent, getStudentBadges, getStudents } from "../../../lib/api";

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function PortfolioPage() {
  const router = useRouter();
  const { toasts, removeToast, toast } = useToast();

  const [studentId, setStudentId] = useState(null);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [badges, setBadges] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [studentName, setStudentName] = useState("Student");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const id = parseInt(sessionStorage.getItem("currentStudentId") || "0");
    const name = sessionStorage.getItem("studentName");
    if (!id) {
      router.push("/login");
      return;
    }
    setStudentId(id);
    if (name) setStudentName(name);
    setMounted(true);
    loadStudentData(id);
  }, []);

  const loadStudentData = async (id) => {
    const currentId = id || studentId;
    try {
      setLoading(true);
      const students = await getStudents();
      const student = students.find((s) => s.id === currentId);
      
      if (!student) {
        toast.error("Error", "Student not found");
        return;
      }

      setCurrentStudent(student);
      // Store full name so other pages (e.g. student-sessions) can use it
      sessionStorage.setItem("studentName", student.fullName || "");
      
      const [achievementData, badgeData] = await Promise.all([
        getAchievementsByStudent(currentId),
        getStudentBadges(currentId),
      ]);
      setAchievements(achievementData || []);
      setBadges(badgeData || []);

      // Load quiz results
      try {
        const { getStudentQuizResults } = await import("../../../lib/api");
        const results = await getStudentQuizResults(currentId);
        setQuizResults(Array.isArray(results) ? results.filter(r => r.passed) : []);
      } catch (e) { setQuizResults([]); }
    } catch (error) {
      toast.error("Load Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadCourseCertificate = (result) => {
    const name = currentStudent?.fullName || studentName || "Student";
    const W = 1240, H = 1754;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    ctx.textAlign = "center";

    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, W, H);

    // Navy wave
    ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(0, H * 0.54);
    ctx.bezierCurveTo(W*0.10, H*0.52, W*0.28, H*0.60, W*0.44, H*0.68);
    ctx.bezierCurveTo(W*0.62, H*0.77, W*0.66, H*0.86, W*0.50, H*0.93);
    ctx.bezierCurveTo(W*0.36, H*0.99, W*0.14, H, 0, H);
    ctx.closePath(); ctx.fillStyle = "#1a1f2e"; ctx.fill();

    // Red wave
    ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(0, H*0.62);
    ctx.bezierCurveTo(W*0.12, H*0.60, W*0.32, H*0.68, W*0.50, H*0.76);
    ctx.bezierCurveTo(W*0.68, H*0.85, W*0.72, H*0.92, W*0.58, H*0.97);
    ctx.bezierCurveTo(W*0.42, H*1.02, W*0.18, H, 0, H);
    ctx.closePath(); ctx.fillStyle = "#c0392b"; ctx.fill();

    // Grey wave
    ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(0, H*0.70);
    ctx.bezierCurveTo(W*0.14, H*0.68, W*0.36, H*0.76, W*0.54, H*0.84);
    ctx.bezierCurveTo(W*0.70, H*0.91, W*0.74, H*0.97, W*0.60, H*1.01);
    ctx.bezierCurveTo(W*0.44, H*1.05, W*0.20, H, 0, H);
    ctx.closePath(); ctx.fillStyle = "rgba(200,200,200,0.28)"; ctx.fill();

    ctx.strokeStyle = "#d1d5db"; ctx.lineWidth = 5; ctx.strokeRect(28, 28, W-56, H-56);
    ctx.strokeStyle = "#e9ecef"; ctx.lineWidth = 2; ctx.strokeRect(50, 50, W-100, H*0.50-10);

    // Logo
    const lg = ctx.createLinearGradient(W/2-52, 78, W/2+52, 182);
    lg.addColorStop(0, "#667eea"); lg.addColorStop(1, "#764ba2");
    ctx.beginPath(); ctx.arc(W/2, 130, 52, 0, Math.PI*2); ctx.fillStyle = lg; ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "bold 48px Arial"; ctx.textBaseline = "middle";
    ctx.fillText("U", W/2, 132); ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#9ca3af"; ctx.font = "500 26px Arial"; ctx.fillText("UniSphere", W/2, 228);

    ctx.strokeStyle = "#e5e7eb"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(W*0.28, 252); ctx.lineTo(W*0.72, 252); ctx.stroke();

    ctx.fillStyle = "#1a1f2e"; ctx.font = "bold 100px Georgia"; ctx.fillText("CERTIFICATE", W/2, 390);
    ctx.fillStyle = "#374151"; ctx.font = "italic 68px Georgia"; ctx.fillText("of Excellence", W/2, 478);

    ctx.strokeStyle = "#e5e7eb"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(W*0.18, 510); ctx.lineTo(W*0.82, 510); ctx.stroke();

    ctx.fillStyle = "#6b7280"; ctx.font = "30px Georgia"; ctx.fillText("This certificate is awarded to", W/2, 590);

    ctx.fillStyle = "#c0392b"; ctx.font = "italic bold 76px Georgia"; ctx.fillText(name, W/2, 690);
    const nw = ctx.measureText(name).width;
    ctx.strokeStyle = "#c0392b"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W/2-nw/2, 706); ctx.lineTo(W/2+nw/2, 706); ctx.stroke();

    ctx.fillStyle = "#4b5563"; ctx.font = "28px Georgia";
    ctx.fillText("for successfully completing the assessment for", W/2, 778);
    ctx.fillStyle = "#1a1f2e"; ctx.font = "bold 38px Georgia"; ctx.fillText(result.sessionName, W/2, 836);
    ctx.fillStyle = "#6b7280"; ctx.font = "26px Arial";
    ctx.fillText(`Score: ${result.score} / ${result.totalQuestions}  �  ${result.percentage}%`, W/2, 892);

    ctx.font = "24px Arial"; ctx.fillStyle = "#9ca3af";
    ctx.textAlign = "left"; ctx.fillText("UniSphere Platform", W*0.20, 958);
    ctx.textAlign = "right";
    ctx.fillText(new Date(result.completedAt).toLocaleDateString("en-GB"), W*0.80, 958);
    ctx.textAlign = "center";

    ctx.strokeStyle = "#374151"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(W*0.54, H*0.595); ctx.lineTo(W*0.82, H*0.595); ctx.stroke();
    ctx.strokeStyle = "#374151"; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W*0.60, H*0.590); ctx.bezierCurveTo(W*0.62, H*0.572, W*0.65, H*0.570, W*0.67, H*0.582);
    ctx.bezierCurveTo(W*0.69, H*0.594, W*0.72, H*0.584, W*0.73, H*0.574); ctx.stroke();
    ctx.fillStyle = "#374151"; ctx.font = "24px Arial"; ctx.fillText("UniSphere Director", W*0.68, H*0.595+36);

    // Gold badge
    const bx = W*0.155, by = H*0.875, br = 88;
    ctx.strokeStyle = "#d4a017"; ctx.lineWidth = 3;
    for (let i = 0; i < 16; i++) {
      const a = (i*Math.PI*2)/16;
      ctx.beginPath(); ctx.moveTo(bx+Math.cos(a)*(br+4), by+Math.sin(a)*(br+4));
      ctx.lineTo(bx+Math.cos(a)*(br+18), by+Math.sin(a)*(br+18)); ctx.stroke();
    }
    const gg = ctx.createRadialGradient(bx-20, by-20, 10, bx, by, br);
    gg.addColorStop(0, "#ffe066"); gg.addColorStop(0.45, "#d4a017"); gg.addColorStop(1, "#8a6000");
    ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI*2); ctx.fillStyle = gg; ctx.fill();
    ctx.beginPath(); ctx.arc(bx, by, br*0.78, 0, Math.PI*2); ctx.fillStyle = "#c8900a"; ctx.fill();
    ctx.beginPath(); ctx.arc(bx, by, br*0.70, 0, Math.PI*2); ctx.fillStyle = "#f0c030"; ctx.fill();
    ctx.fillStyle = "#5a3a00"; ctx.font = "bold 22px Arial";
    ctx.fillText("BEST", bx, by-10); ctx.fillText("AWARD", bx, by+16);

    const certId = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2,8).toUpperCase()}`;
    ctx.fillStyle = "rgba(255,255,255,0.50)"; ctx.font = "20px Arial";
    ctx.fillText(`Certificate ID: ${certId}`, W*0.60, H-48);

    const link = document.createElement("a");
    link.download = `UniSphere-Certificate-${result.sessionName.replace(/\s+/g, "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  if (!mounted) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16,
      }}>
        <div style={{
          width: 48, height: 48,
          border: "4px solid rgba(255,255,255,0.3)",
          borderTopColor: "#fff",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }} />
        <p style={{ color: "white", fontWeight: 700, fontSize: 15, fontFamily: "Inter, sans-serif" }}>
          Loading Portfolio...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="portfolio-root portfolio-page">
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Navigation Bar */}
      <nav className="portfolio-navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <h2>UniSphere</h2>
          </div>
          <div className="navbar-menu">
            <button 
              className="navbar-link active"
              onClick={() => router.push("/portfolio")}
            >
              My Portfolio
            </button>
            <button 
              className="navbar-link"
              onClick={() => router.push("/student-sessions")}
            >
              Training Sessions
            </button>
            <button
              className="navbar-link"
              onClick={() => router.push("/tutor-booking/student-dashboard")}
            >
              Dashboard
            </button>
          </div>
          <div className="navbar-user">
            <span className="user-name">{studentName}</span>
            <button 
              className="logout-btn"
              onClick={() => setShowLogoutConfirm(true)}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="page">

        {/* Student Info Header */}
        <div className="student-selector-bar">
          <div className="student-selector-left">
            {currentStudent && (
              <div className="student-selector-avatar">
                {getInitials(currentStudent.fullName)}
              </div>
            )}
            <div>
              <div className="student-selector-name">
                {currentStudent?.fullName || "Loading..."}
              </div>
              <div className="student-selector-meta">
                {currentStudent?.degreeProgram} &middot; {currentStudent?.academicYear}
              </div>
            </div>
          </div>
          <div className="student-selector-right">
            <div className="form-label" style={{ marginBottom: 4 }}>Student ID: {studentId}</div>
          </div>
        </div>

        <div className="grid-2">
          {/* Achievement Form */}
          <div className="card">
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--gray-900)" }}>
                Submit Achievement
              </div>
              <div style={{ fontSize: 13, color: "var(--gray-500)", marginTop: 2 }}>
                Fill in the details and submit for admin review
              </div>
            </div>
            {studentId && (
              <AchievementForm
                studentId={studentId}
                onSuccess={loadStudentData}
                toast={toast}
              />
            )}
          </div>

          {/* Badges */}
          <div className="card">
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--gray-900)" }}>My Badges</div>
              <div style={{ fontSize: 13, color: "var(--gray-500)", marginTop: 2 }}>
                Earned by getting 5 achievements approved
              </div>
            </div>
            {badges.length === 0 ? (
              <div className="empty-state" style={{ padding: "32px 16px" }}>
                <div style={{ marginBottom: 10, color: "var(--gray-300)" }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h3 style={{ fontSize: 14 }}>No badges yet</h3>
                <p style={{ fontSize: 12 }}>Get 5 achievements approved to earn your first badge.</p>
              </div>
            ) : (
              <div style={{ maxHeight: "360px", overflowY: "auto", paddingRight: "4px" }}>
                <div style={{ display: "grid", gap: 12 }}>
                  {badges.map((item, index) => (
                    <div key={index} className="badge-card">
                      <div className="badge-icon-wrap">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                      <div className="badge-info">
                        <h4>{item.badge?.badgeName || "Badge"}</h4>
                        <p>{item.badge?.description || ""}</p>
                        {item.assignedAt && (
                          <div className="badge-date">
                            Awarded {new Date(item.assignedAt).toLocaleDateString("en-GB", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* My Course Achievements � inside the same card, below badges */}
            <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid #f3f4f6" }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--gray-900)" }}>My Course Achievements</div>
                <div style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 2 }}>Sessions you passed � click to download certificate</div>
              </div>
              {quizResults.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px 0", color: "var(--gray-400)" }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 8px", display: "block" }}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <p style={{ fontSize: 12, margin: 0 }}>Pass a session exam to earn a certificate.</p>
                </div>
              ) : (
                <div style={{ maxHeight: "136px", overflowY: "auto", paddingRight: "4px", display: "grid", gap: 10 }}>
                  {quizResults.map((result) => (
                    <div
                      key={result.id}
                      onClick={() => downloadCourseCertificate(result)}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "linear-gradient(135deg, rgba(102,126,234,0.06), rgba(118,75,162,0.06))", border: "1px solid #c4b5fd", borderRadius: 10, cursor: "pointer", transition: "all 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "var(--gray-900)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{result.sessionName}</div>
                        <div style={{ fontSize: 11, color: "#667eea", fontWeight: 600 }}>{result.score}/{result.totalQuestions} � {result.percentage}%</div>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Achievements List */}
        <div className="card" style={{ marginTop: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--gray-900)" }}>My Achievements</div>
            <div style={{ fontSize: 13, color: "var(--gray-500)", marginTop: 2 }}>
              All submissions by {currentStudent?.fullName || "this student"}
            </div>
          </div>
          {loading ? (
            <div className="loading-spinner">
              <span className="spinner" /> Loading...
            </div>
          ) : (
            <AchievementList
              achievements={achievements}
              studentId={studentId}
              onRefresh={loadStudentData}
              toast={toast}
            />
          )}
        </div>

      </main>

      <footer style={{ position: "fixed", bottom: 0, left: 0, right: 0, borderTop: "1px solid #e5e7eb", padding: "16px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", zIndex: 100 }}>
        <p style={{ margin: 0, fontSize: 13, color: "var(--gray-500)" }}>� 2026 UniSphere. All rights reserved.</p>
        <p style={{ margin: 0, fontSize: 13, color: "var(--gray-500)" }}>v1.0.0</p>
      </footer>
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="logout-overlay">
          <div className="logout-modal">
            <h2>Confirm Logout</h2>
            <p>Are you sure you want to logout? You will be redirected to the login page.</p>
            <div className="logout-actions">
              <button 
                className="logout-cancel-btn"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="logout-confirm-btn"
                onClick={() => {
                  sessionStorage.clear();
                  router.push("/");
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .portfolio-page {
          min-height: 100vh;
          background: #f8fafc;
        }

        /* Navigation Bar */
        .portfolio-navbar {
          background: white;
          border-bottom: 1px solid #e5e7eb;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .navbar-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 70px;
        }

        .navbar-brand h2 {
          font-size: 24px;
          font-weight: 800;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .navbar-menu {
          display: flex;
          gap: 32px;
          flex: 1;
          margin-left: 60px;
        }

        .navbar-link {
          background: none;
          border: none;
          font-size: 14px;
          font-weight: 600;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 8px 0;
          border-bottom: 2px solid transparent;
        }

        .navbar-link:hover {
          color: #667eea;
        }

        .navbar-link.active {
          color: #667eea;
          border-bottom-color: #667eea;
        }

        .navbar-user {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .user-name {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }

        .logout-btn {
          padding: 8px 16px;
          background: transparent;
          color: #ef4444;
          border: 1px solid #fecaca;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .logout-btn:hover {
          background: #fef2f2;
          border-color: #ef4444;
        }

        /* Logout Confirmation Modal */
        .logout-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          backdrop-filter: blur(4px);
        }

        .logout-modal {
          background: white;
          border-radius: 16px;
          padding: 40px;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          border: 1px solid #e5e7eb;
          text-align: center;
        }

        .logout-modal h2 {
          font-size: 24px;
          font-weight: 800;
          color: #1f2937;
          margin: 0 0 12px 0;
        }

        .logout-modal p {
          font-size: 14px;
          color: #6b7280;
          margin: 0 0 28px 0;
          line-height: 1.6;
        }

        .logout-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .logout-cancel-btn {
          padding: 12px 24px;
          background: transparent;
          color: #667eea;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          flex: 1;
        }

        .logout-cancel-btn:hover {
          background: #f3f4f6;
          border-color: #667eea;
        }

        .logout-confirm-btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          flex: 1;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
        }

        .logout-confirm-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
        }

        .logout-confirm-btn:active {
          transform: translateY(0);
        }

        @media (max-width: 768px) {
          .navbar-container {
            padding: 0 20px;
          }

          .navbar-menu {
            gap: 16px;
            margin-left: 20px;
          }

          .navbar-link {
            font-size: 12px;
          }

          .logout-modal {
            margin: 20px;
          }
        }
      `}</style>
    </div>
  );
}
