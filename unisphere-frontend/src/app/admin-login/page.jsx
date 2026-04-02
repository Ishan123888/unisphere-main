"use client";

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
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Validation", "Please enter username and password");
      return;
    }

    try {
      setLoading(true);
      const response = await adminLogin({ username, password });
      
      localStorage.setItem("adminId", response.id);
      localStorage.setItem("adminUsername", response.username);
      localStorage.setItem("adminFullName", response.fullName);
      localStorage.setItem("adminEmail", response.email || "");
      localStorage.setItem("adminPhoneNumber", response.phoneNumber || "");
      localStorage.setItem("adminProfilePictureUrl", response.profilePictureUrl || "");
      localStorage.setItem("isAdminLoggedIn", "true");

      toast.success("Success", "Login successful!");
      setTimeout(() => router.push("/admin-desk"), 1000);
    } catch (error) {
      toast.error("Login Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Toast toasts={toasts} removeToast={removeToast} />
      
      <div className="login-card">
        <h1>Admin Login</h1>
        <p className="subtitle">UniSphere Portfolio Admin Panel</p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter admin username"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              disabled={loading}
            />
          </div>

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="login-footer">
          <p>Not an admin? <a href="/">Go back home</a></p>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }
        .login-card {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          width: 100%;
          max-width: 400px;
        }
        .login-card h1 { margin: 0 0 10px 0; color: #333; font-size: 28px; }
        .subtitle { color: #666; margin: 0 0 30px 0; font-size: 14px; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 8px; color: #333; font-weight: 500; }
        .form-group input {
          width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px;
          font-size: 14px; box-sizing: border-box; transition: border-color 0.3s;
        }
        .form-group input:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102,126,234,0.1); }
        .form-group input:disabled { background-color: #f5f5f5; cursor: not-allowed; }
        .primary-btn {
          width: 100%; padding: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white; border: none; border-radius: 6px; font-size: 16px;
          font-weight: 600; cursor: pointer; transition: transform 0.2s;
        }
        .primary-btn:hover:not(:disabled) { transform: translateY(-2px); }
        .primary-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .login-footer { margin-top: 20px; text-align: center; color: #666; font-size: 14px; }
        .login-footer a { color: #667eea; text-decoration: none; font-weight: 600; }
        .login-footer a:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
