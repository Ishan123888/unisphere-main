"use client";

import "../portfolio.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "../../../lib/api";
import Toast from "../../../components/Toast";
import { useToast } from "../../../hooks/useToast";

export default function AdminLoginPage() {
  const router = useRouter();
  const { toasts, removeToast, toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }
    setError("");
    try {
      setLoading(true);
      const response = await adminLogin({ username, password });

      localStorage.setItem("adminId", response.id);
      localStorage.setItem("adminUsername", response.username);
      localStorage.setItem("adminFullName", response.fullName);
      localStorage.setItem("adminEmail", response.email || "");
      localStorage.setItem("adminPhoneNumber", response.phoneNumber || "");
      localStorage.setItem("adminProfilePictureUrl", response.profilePictureUrl || "");
      localStorage.setItem("adminDepartment", response.department || "");
      localStorage.setItem("adminDesignation", response.designation || "");
      localStorage.setItem("adminBio", response.bio || "");
      localStorage.setItem("isAdminLoggedIn", "true");

      toast.success("Success", "Login successful!");
      setTimeout(() => router.push("/admin-desk"), 800);
    } catch (err) {
      setError(err.message || "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portfolio-root" style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Card */}
      <div style={{
        width: "100%",
        maxWidth: 420,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 24,
        overflow: "hidden",
        boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
        backdropFilter: "blur(20px)",
      }}>

        {/* Top banner */}
        <div style={{
          background: "linear-gradient(135deg, #667eea, #764ba2)",
          padding: "36px 40px 28px",
          textAlign: "center",
          position: "relative",
        }}>
          {/* Logo */}
          <div style={{
            width: 64, height: 64,
            background: "rgba(255,255,255,0.15)",
            borderRadius: 18,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
            border: "2px solid rgba(255,255,255,0.25)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: "white" }}>U</span>
          </div>
          <h1 style={{ margin: 0, color: "white", fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px" }}>
            UniSphere
          </h1>
          <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 500 }}>
            Portfolio Admin Panel
          </p>
        </div>

        {/* Form body */}
        <div style={{ padding: "32px 40px 36px" }}>
          <p style={{ margin: "0 0 24px", color: "rgba(255,255,255,0.5)", fontSize: 13, textAlign: "center" }}>
            Sign in with your admin credentials
          </p>

          {/* Error */}
          {error && (
            <div style={{
              marginBottom: 20,
              padding: "12px 16px",
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 12,
              color: "#fca5a5",
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Username */}
            <div>
              <label style={{
                display: "block", marginBottom: 8,
                color: "rgba(255,255,255,0.5)", fontSize: 11,
                fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px",
              }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(""); }}
                placeholder="admin_username"
                disabled={loading}
                autoComplete="username"
                style={{
                  width: "100%", padding: "14px 16px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1.5px solid rgba(255,255,255,0.1)",
                  borderRadius: 12, color: "white", fontSize: 14,
                  fontWeight: 600, outline: "none", boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = "rgba(102,126,234,0.8)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{
                display: "block", marginBottom: 8,
                color: "rgba(255,255,255,0.5)", fontSize: 11,
                fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px",
              }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  disabled={loading}
                  autoComplete="current-password"
                  style={{
                    width: "100%", padding: "14px 48px 14px 16px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1.5px solid rgba(255,255,255,0.1)",
                    borderRadius: 12, color: "white", fontSize: 14,
                    fontWeight: 600, outline: "none", boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => e.target.style.borderColor = "rgba(102,126,234,0.8)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(x => !x)}
                  style={{
                    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "rgba(255,255,255,0.4)", fontSize: 16, padding: 4,
                  }}
                >
                  {showPw ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 4,
                padding: "15px",
                background: loading
                  ? "rgba(102,126,234,0.4)"
                  : "linear-gradient(135deg, #667eea, #764ba2)",
                color: "white", border: "none", borderRadius: 14,
                fontSize: 15, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 8px 24px rgba(102,126,234,0.4)",
                transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: 18, height: 18,
                    border: "2.5px solid rgba(255,255,255,0.3)",
                    borderTopColor: "white",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                    display: "inline-block",
                  }} />
                  Signing in...
                </>
              ) : "Sign In to Admin Panel"}
            </button>
          </form>

          {/* Footer */}
          <div style={{ marginTop: 24, textAlign: "center" }}>
            <a href="/login" style={{
              color: "rgba(255,255,255,0.35)", fontSize: 13,
              textDecoration: "none", fontWeight: 600,
              transition: "color 0.2s",
            }}
              onMouseEnter={e => e.target.style.color = "rgba(255,255,255,0.7)"}
              onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.35)"}
            >
              ← Back to main login
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.2) !important; }
      `}</style>
    </div>
  );
}
