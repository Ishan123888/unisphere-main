"use client";

import "../portfolio.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminDashboard from "../../../components/AdminDashboard";
import Toast from "../../../components/Toast";
import { useToast } from "../../../hooks/useToast";

export default function AdminDeskPage() {
  const router = useRouter();
  const { toasts, removeToast, toast } = useToast();
  const [adminName, setAdminName] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminId, setAdminId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState("achievements"); // "achievements", "profile", "add-admin", "add-sessions", "view-sessions", or "review-achievements"
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [editForm, setEditForm] = useState({ 
    fullName: "", 
    username: "", 
    email: "", 
    phoneNumber: "", 
    profilePictureUrl: "",
    department: "",
    designation: "",
    bio: ""
  });
  const [editLoading, setEditLoading] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [addAdminForm, setAddAdminForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    department: "",
    designation: "",
    profilePictureUrl: "",
    phoneVerified: false
  });
  const [addAdminLoading, setAddAdminLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ 
    score: 0, 
    message: "", 
    color: "#ccc",
    requirements: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false
    }
  });
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [phoneForOTP, setPhoneForOTP] = useState("");
  const [otpError, setOtpError] = useState("");
  const [sessionForm, setSessionForm] = useState({
    sessionName: "",
    price: "",
    videos: [],
    silverBadgeThreshold: 5,
    bronzeBadgeThreshold: 10,
    goldBadgeThreshold: 15,
    thumbnail: ""
  });
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionThumbnailPreview, setSessionThumbnailPreview] = useState("");
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [showVideoOverlay, setShowVideoOverlay] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState("");
  const [allAchievements, setAllAchievements] = useState([]);
  const [achievementsLoading, setAchievementsLoading] = useState(false);
  const [achievementFilter, setAchievementFilter] = useState("all"); // "all", "pending", "approved", "rejected"
  const [achievementSearch, setAchievementSearch] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [showVideoUploadModal, setShowVideoUploadModal] = useState(false);
  const [selectedSessionForUpload, setSelectedSessionForUpload] = useState(null);
  const [videoUploadForm, setVideoUploadForm] = useState({
    title: "",
    subtitle: "",
    file: null
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [sessionVideoFiles, setSessionVideoFiles] = useState({});
  const [showQuestionsPanel, setShowQuestionsPanel] = useState(false);
  const [selectedSessionForQuestions, setSelectedSessionForQuestions] = useState(null);
  const [sessionQuestions, setSessionQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(0);
  const [savingTimeLimit, setSavingTimeLimit] = useState(false);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [questionForm, setQuestionForm] = useState({
    questionText: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "A"
  });
  const [questionSaving, setQuestionSaving] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
    if (!isLoggedIn) {
      router.push("/admin-login");
      return;
    }

    const fullName = localStorage.getItem("adminFullName") || "Admin";
    const username = localStorage.getItem("adminUsername") || "admin";
    const id = localStorage.getItem("adminId");
    const email = localStorage.getItem("adminEmail") || "";
    const phoneNumber = localStorage.getItem("adminPhoneNumber") || "";
    const profilePictureUrl = localStorage.getItem("adminProfilePictureUrl") || "";
    const department = localStorage.getItem("adminDepartment") || "";
    const designation = localStorage.getItem("adminDesignation") || "";
    const bio = localStorage.getItem("adminBio") || "";

    setAdminName(fullName);
    setAdminUsername(username);
    setAdminId(id);
    setEditForm({ fullName, username: username, email, phoneNumber, profilePictureUrl, department, designation, bio });
    setProfileImagePreview(profilePictureUrl);
  }, [router]);

  // Scroll to top when activeView changes
  useEffect(() => {
    const mainContent = document.querySelector(".admin-desk-content");
    if (mainContent) {
      mainContent.scrollTop = 0;
    }
    // Also scroll window to top for better UX
    window.scrollTo(0, 0);
  }, [activeView]);

  const handleEditProfile = async () => {
    if (!editForm.fullName.trim() || !editForm.email.trim()) {
      toast.error("Validation", "Name and email are required");
      return;
    }

    try {
      setEditLoading(true);
      
      // Update locally first
      localStorage.setItem("adminFullName", editForm.fullName);
      localStorage.setItem("adminEmail", editForm.email);
      localStorage.setItem("adminPhoneNumber", editForm.phoneNumber);
      localStorage.setItem("adminProfilePictureUrl", editForm.profilePictureUrl);
      localStorage.setItem("adminDepartment", editForm.department);
      localStorage.setItem("adminDesignation", editForm.designation);
      localStorage.setItem("adminBio", editForm.bio);

      setAdminName(editForm.fullName);
      setProfileImagePreview(editForm.profilePictureUrl);

      // Try to update on backend
      try {
        const { updateAdminProfile } = await import("../../../lib/api");
        await updateAdminProfile(adminId, {
          fullName: editForm.fullName,
          email: editForm.email,
          phoneNumber: editForm.phoneNumber,
          profilePictureUrl: editForm.profilePictureUrl,
          department: editForm.department,
          designation: editForm.designation,
          bio: editForm.bio
        });
      } catch (backendError) {
        console.warn("Backend update failed, but local update succeeded:", backendError);
      }

      toast.success("Success", "Profile updated successfully");
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Error", error.message || "Failed to update profile");
    } finally {
      setEditLoading(false);
    }
  };

  const validatePasswordStrength = (password) => {
    let score = 0;
    let requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };

    if (requirements.length) score++;
    if (requirements.uppercase) score++;
    if (requirements.lowercase) score++;
    if (requirements.number) score++;
    if (requirements.special) score++;

    let message = "";
    let color = "";

    if (score === 0) {
      message = "No password";
      color = "#ccc";
    } else if (score <= 2) {
      message = "Weak";
      color = "#ef4444";
    } else if (score <= 3) {
      message = "Fair";
      color = "#f59e0b";
    } else if (score <= 4) {
      message = "Good";
      color = "#3b82f6";
    } else {
      message = "Strong";
      color = "#10b981";
    }

    return { score, message, color, requirements };
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setAddAdminForm({ ...addAdminForm, password: newPassword });
    const strength = validatePasswordStrength(newPassword);
    setPasswordStrength(strength);
  };

  const handleSendOTP = async () => {
    if (!addAdminForm.phoneNumber.trim()) {
      setOtpError("Please enter a phone number");
      return;
    }

    try {
      setOtpLoading(true);
      setOtpError("");
      const { sendOTPViaWhatsApp } = await import("../../../lib/otp");
      
      const result = await sendOTPViaWhatsApp(addAdminForm.phoneNumber);
      
      if (result.success) {
        setPhoneForOTP(addAdminForm.phoneNumber);
        setOtpSent(true);
        setOtpInput("");
        toast.success("Success", "OTP sent to your WhatsApp");
      } else {
        setOtpError(result.error || "Failed to send OTP");
        toast.error("Error", result.error || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      setOtpError(error.message || "Failed to send OTP");
      toast.error("Error", error.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpInput.trim()) {
      setOtpError("Please enter the OTP");
      return;
    }

    try {
      setOtpLoading(true);
      setOtpError("");
      const { verifyOTP } = await import("../../../lib/otp");
      
      const result = await verifyOTP(phoneForOTP, otpInput);
      
      if (result.success) {
        toast.success("Success", "Phone number verified");
        setShowOTPModal(false);
        setOtpSent(false);
        setOtpInput("");
        // Mark phone as verified in form
        setAddAdminForm({ ...addAdminForm, phoneVerified: true });
      } else {
        setOtpError(result.error || "Invalid OTP");
        toast.error("Error", result.error || "Invalid OTP");
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      setOtpError(error.message || "Failed to verify OTP");
      toast.error("Error", error.message || "Failed to verify OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!addAdminForm.username.trim() || !addAdminForm.password.trim() || !addAdminForm.fullName.trim()) {
      toast.error("Validation", "Username, password, and full name are required");
      return;
    }

    const strength = validatePasswordStrength(addAdminForm.password);
    if (strength.score < 3) {
      toast.error("Weak Password", "Password must contain at least 3 of: uppercase, lowercase, numbers, special characters, and be 8+ characters");
      return;
    }

    if (addAdminForm.password !== addAdminForm.confirmPassword) {
      toast.error("Validation", "Passwords do not match");
      return;
    }

    try {
      setAddAdminLoading(true);
      const { addAdmin } = await import("../../../lib/api");
      
      await addAdmin({
        username: addAdminForm.username,
        password: addAdminForm.password,
        fullName: addAdminForm.fullName,
        email: addAdminForm.email,
        phoneNumber: addAdminForm.phoneNumber,
        department: addAdminForm.department,
        designation: addAdminForm.designation,
        profilePictureUrl: addAdminForm.profilePictureUrl
      });

      toast.success("Success", "Admin added successfully");
      setAddAdminForm({
        username: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        email: "",
        phoneNumber: "",
        department: "",
        designation: "",
        profilePictureUrl: ""
      });
      setPasswordStrength({ score: 0, message: "", color: "" });
      setActiveView("achievements");
    } catch (error) {
      console.error("Add admin error:", error);
      toast.error("Error", error.message || "Failed to add admin");
    } finally {
      setAddAdminLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setEditForm({ ...editForm, profilePictureUrl: base64String });
        setProfileImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateSession = async () => {
    if (!sessionForm.sessionName.trim()) {
      toast.error("Validation", "Session name is required");
      return;
    }

    if (!sessionForm.price || sessionForm.price <= 0) {
      toast.error("Validation", "Price must be greater than 0");
      return;
    }

    if (!sessionForm.thumbnail) {
      toast.error("Validation", "Thumbnail image is required");
      return;
    }

    try {
      setSessionLoading(true);
      const { createSession } = await import("../../../lib/api");
      
      await createSession({
        sessionName: sessionForm.sessionName,
        price: parseFloat(sessionForm.price),
        silverBadgeThreshold: sessionForm.silverBadgeThreshold,
        bronzeBadgeThreshold: sessionForm.bronzeBadgeThreshold,
        goldBadgeThreshold: sessionForm.goldBadgeThreshold,
        thumbnail: sessionForm.thumbnail,
        videos: []
      });

      toast.success("Success", "Session created successfully. Now upload videos using 'Add Session Videos'");
      setSessionForm({
        sessionName: "",
        price: "",
        videos: [],
        silverBadgeThreshold: 5,
        bronzeBadgeThreshold: 10,
        goldBadgeThreshold: 15,
        thumbnail: ""
      });
      setSessionThumbnailPreview("");
      setActiveView("achievements");
    } catch (error) {
      console.error("Create session error:", error);
      toast.error("Error", error.message || "Failed to create session");
    } finally {
      setSessionLoading(false);
    }
  };

  const loadSessions = async () => {
    try {
      setSessionsLoading(true);
      const { getAllSessions } = await import("../../../lib/api");
      const data = await getAllSessions();
      const sessionsData = data.data || data;
      setSessions(sessionsData);
      
      // Load video files for each session
      for (const session of sessionsData) {
        await loadSessionVideoFiles(session.id);
      }
    } catch (error) {
      console.error("Load sessions error:", error);
      toast.error("Error", "Failed to load sessions");
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleUpdateSession = async (sessionId, updatedData) => {
    try {
      setSessionsLoading(true);
      const { updateSession } = await import("../../../lib/api");
      
      await updateSession(sessionId, updatedData);
      
      toast.success("Success", "Session updated successfully");
      setEditingSessionId(null);
      await loadSessions();
    } catch (error) {
      console.error("Update session error:", error);
      toast.error("Error", error.message || "Failed to update session");
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleDeleteVideo = async (sessionId, videoId) => {
    if (!confirm("Are you sure you want to delete this video?")) return;
    
    try {
      setSessionsLoading(true);
      const session = sessions.find(s => s.id === sessionId);
      const updatedVideos = session.videos.filter(v => v.id !== videoId);
      
      const updatedData = {
        sessionName: session.sessionName,
        price: session.price,
        silverBadgeThreshold: session.silverBadgeThreshold,
        bronzeBadgeThreshold: session.bronzeBadgeThreshold,
        goldBadgeThreshold: session.goldBadgeThreshold,
        videos: updatedVideos.map(v => ({ title: v.title, youtubeUrl: v.youtubeUrl }))
      };
      
      await handleUpdateSession(sessionId, updatedData);
    } catch (error) {
      console.error("Delete video error:", error);
      toast.error("Error", "Failed to delete video");
      setSessionsLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!confirm("Are you sure you want to delete this session?")) return;
    
    try {
      setSessionsLoading(true);
      const { deleteSession } = await import("../../../lib/api");
      
      await deleteSession(sessionId);
      
      toast.success("Success", "Session deleted successfully");
      await loadSessions();
    } catch (error) {
      console.error("Delete session error:", error);
      toast.error("Error", error.message || "Failed to delete session");
    } finally {
      setSessionsLoading(false);
    }
  };

  const loadAllAchievements = async () => {
    try {
      setAchievementsLoading(true);
      const { getAllAchievements } = await import("../../../lib/api");
      const data = await getAllAchievements();
      setAllAchievements(data.data || data);
    } catch (error) {
      console.error("Load achievements error:", error);
      toast.error("Error", "Failed to load achievements");
    } finally {
      setAchievementsLoading(false);
    }
  };

  const generateReport = () => {
    // Download ALL achievements regardless of filter
    const reportData = allAchievements.map(achievement => ({
      "Student Name": achievement.student?.fullName || "N/A",
      "Achievement Title": achievement.title || "N/A",
      "Category": achievement.category || "N/A",
      "Level": achievement.level || "N/A",
      "Status": achievement.status || "N/A",
      "Reason": achievement.adminComment || "N/A",
      "Date": new Date(achievement.createdAt).toLocaleDateString(),
      "Description": achievement.description || "N/A"
    }));

    const csv = [
      Object.keys(reportData[0] || {}).join(","),
      ...reportData.map(row => Object.values(row).map(val => `"${val}"`).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `achievements-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast.success("Success", "Report downloaded successfully");
    setShowReportModal(false);
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("adminId");
    localStorage.removeItem("adminUsername");
    localStorage.removeItem("adminFullName");
    localStorage.removeItem("isAdminLoggedIn");
    router.push("/");
  };

  const handleVideoUpload = async () => {
    if (!videoUploadForm.title.trim() || !videoUploadForm.subtitle.trim() || !videoUploadForm.file) {
      toast.error("Validation", "Title, subtitle, and file are required");
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const { uploadSessionVideoFile } = await import("../../../lib/api");
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 30;
        });
      }, 500);

      const result = await uploadSessionVideoFile(
        selectedSessionForUpload.id,
        videoUploadForm.title,
        videoUploadForm.subtitle,
        videoUploadForm.file
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      toast.success("Success", "Video uploaded successfully");
      setShowVideoUploadModal(false);
      setVideoUploadForm({ title: "", subtitle: "", file: null });
      setUploadProgress(0);

      // Reload session videos
      await loadSessionVideoFiles(selectedSessionForUpload.id);
    } catch (error) {
      console.error("Video upload error:", error);
      toast.error("Error", error.message || "Failed to upload video");
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const loadSessionVideoFiles = async (sessionId) => {
    try {
      const { getSessionVideoFiles } = await import("../../../lib/api");
      const files = await getSessionVideoFiles(sessionId);
      setSessionVideoFiles(prev => ({
        ...prev,
        [sessionId]: files
      }));
    } catch (error) {
      console.error("Load video files error:", error);
    }
  };

  const handleDeleteVideoFile = async (fileId, sessionId) => {
    if (!confirm("Are you sure you want to delete this video?")) return;

    try {
      const { deleteSessionVideoFile } = await import("../../../lib/api");
      await deleteSessionVideoFile(fileId);
      
      toast.success("Success", "Video deleted successfully");
      await loadSessionVideoFiles(sessionId);
    } catch (error) {
      console.error("Delete video error:", error);
      toast.error("Error", error.message || "Failed to delete video");
    }
  };

  const loadSessionQuestionsAndConfig = async (session) => {
    setSelectedSessionForQuestions(session);
    setQuestionsLoading(true);
    try {
      const { getSessionQuestions, getSessionTimeLimit } = await import("../../../lib/api");
      const [questions, timeLimitData] = await Promise.all([
        getSessionQuestions(session.id),
        getSessionTimeLimit(session.id)
      ]);
      setSessionQuestions(Array.isArray(questions) ? questions : []);
      setTimeLimitMinutes(timeLimitData.timeLimitMinutes || 0);
    } catch (error) {
      console.error("Load questions error:", error);
      toast.error("Error", "Failed to load questions");
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleSaveTimeLimit = async () => {
    if (!selectedSessionForQuestions) return;
    setSavingTimeLimit(true);
    try {
      const { setSessionTimeLimit } = await import("../../../lib/api");
      await setSessionTimeLimit(selectedSessionForQuestions.id, parseInt(timeLimitMinutes) || 0);
      toast.success("Success", "Time limit saved");
    } catch (error) {
      toast.error("Error", error.message || "Failed to save time limit");
    } finally {
      setSavingTimeLimit(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!questionForm.questionText.trim() || !questionForm.optionA.trim() ||
        !questionForm.optionB.trim() || !questionForm.optionC.trim() || !questionForm.optionD.trim()) {
      toast.error("Error", "Please fill in all fields");
      return;
    }
    setQuestionSaving(true);
    try {
      const { addSessionQuestion } = await import("../../../lib/api");
      await addSessionQuestion(selectedSessionForQuestions.id, questionForm);
      toast.success("Success", "Question added");
      setShowAddQuestionModal(false);
      setQuestionForm({ questionText: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "A" });
      await loadSessionQuestionsAndConfig(selectedSessionForQuestions);
    } catch (error) {
      toast.error("Error", error.message || "Failed to add question");
    } finally {
      setQuestionSaving(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!confirm("Delete this question?")) return;
    try {
      const { deleteSessionQuestion } = await import("../../../lib/api");
      await deleteSessionQuestion(questionId);
      toast.success("Success", "Question deleted");
      await loadSessionQuestionsAndConfig(selectedSessionForQuestions);
    } catch (error) {
      toast.error("Error", error.message || "Failed to delete question");
    }
  };

  return (
    <div className={`portfolio-root admin-desk-layout ${!sidebarOpen ? "sidebar-closed" : ""}`}>
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-title">UniSphere</h1>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>

        <div className="sidebar-content">
          {/* User Profile Section */}
          <div className="user-profile-section">
            <div className="user-avatar">
              {profileImagePreview ? (
                <img src={profileImagePreview} alt="Profile" className="user-avatar-img" />
              ) : (
                adminName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
              )}
            </div>
            <div className="user-info">
              <div className="user-name">{adminName}</div>
              <div className="user-role">Administrator</div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <nav className="sidebar-nav">
            <button
              className={`nav-btn ${activeView === "achievements" ? "active" : ""}`}
              onClick={() => setActiveView("achievements")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Achievement Review</span>
            </button>

            <button
              className={`nav-btn ${activeView === "profile" ? "active" : ""}`}
              onClick={() => setActiveView("profile")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Edit Profile</span>
            </button>

            <button
              className={`nav-btn ${activeView === "add-admin" ? "active" : ""}`}
              onClick={() => setActiveView("add-admin")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
              <span>Add Admin</span>
            </button>

            <button
              className={`nav-btn ${activeView === "add-sessions" ? "active" : ""}`}
              onClick={() => setActiveView("add-sessions")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
                <polyline points="17 2 12 7 7 2" />
              </svg>
              <span>Add Sessions</span>
            </button>

            <button
              className={`nav-btn ${activeView === "add-session-videos" ? "active" : ""}`}
              onClick={() => {
                setActiveView("add-session-videos");
                loadSessions();
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 7l-7 5 7 5V7z" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
              <span>Add Session Videos</span>
            </button>

            <button
              className={`nav-btn ${activeView === "add-session-questions" ? "active" : ""}`}
              onClick={() => {
                setActiveView("add-session-questions");
                setSelectedSessionForQuestions(null);
                setSessionQuestions([]);
                loadSessions();
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>Add Session Questions</span>
            </button>

            <button
              className={`nav-btn ${activeView === "view-sessions" ? "active" : ""}`}
              onClick={() => {
                setActiveView("view-sessions");
                loadSessions();
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
                <polyline points="17 2 12 7 7 2" />
              </svg>
              <span>View Sessions</span>
            </button>

            <button
              className={`nav-btn ${activeView === "review-achievements" ? "active" : ""}`}
              onClick={() => {
                setActiveView("review-achievements");
                loadAllAchievements();
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Review Achievements</span>
            </button>
          </nav>

          {/* Logout Button */}
          <button className="sidebar-btn logout-btn" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-desk-main">
        <div className="admin-desk-header">
          <button
            className="mobile-sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <div className="header-content">
            <div>
              <div className="section-title">
                {activeView === "achievements" ? "Achievement Review" : activeView === "profile" ? "Edit Profile" : activeView === "add-admin" ? "Add New Admin" : activeView === "add-sessions" ? "Add Sessions" : activeView === "view-sessions" ? "View Sessions" : activeView === "add-session-videos" ? "Add Session Videos" : activeView === "add-session-questions" ? "Add Session Questions" : "Review Achievements"}
              </div>
              <div className="section-subtitle">
                {activeView === "achievements"
                  ? "Review and manage student achievement submissions"
                  : activeView === "profile"
                  ? "Update your profile information"
                  : activeView === "add-admin"
                  ? "Create a new admin account"
                  : activeView === "add-sessions"
                  ? "Create new training sessions"
                  : activeView === "add-session-videos"
                  ? "Upload video files for training sessions"
                  : activeView === "add-session-questions"
                  ? "Add quiz questions and set time limit for training sessions"
                  : activeView === "view-sessions"
                  ? "View and manage all training sessions"
                  : "View all achievements with detailed status and reasons"}
              </div>
            </div>
            {activeView === "review-achievements" && (
              <button
                className="header-report-btn"
                onClick={() => setShowReportModal(true)}
                disabled={achievementsLoading}
              >
                Generate Report
              </button>
            )}
          </div>
        </div>

        <div className="admin-desk-content">
          {activeView === "achievements" ? (
            <AdminDashboard toast={toast} />
          ) : activeView === "profile" ? (
            <div className="profile-panel">
              <div className="profile-card">
                <h2>Edit Profile</h2>
                <p style={{ color: "#6b7280", fontSize: "14px", margin: "0 0 32px 0" }}>Update your personal and professional information</p>
                
                <div className="profile-content">
                  {/* Left Side - Profile Picture Upload */}
                  <div className="profile-picture-section">
                    <div className="picture-upload-container">
                      <div className="profile-picture-display">
                        {profileImagePreview ? (
                          <img src={profileImagePreview} alt="Profile" className="profile-picture-img" />
                        ) : (
                          <div className="profile-picture-placeholder">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                            <p>No Photo</p>
                          </div>
                        )}
                      </div>
                      
                      <label className="upload-label">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={editLoading}
                          style={{ display: "none" }}
                        />
                      </label>

                      <p className="upload-hint">JPG, PNG or GIF (Max 5MB)</p>
                    </div>
                  </div>

                  {/* Right Side - Form Fields */}
                  <div className="profile-form-section">
                    <form className="profile-form">
                      <div className="form-group">
                        <label htmlFor="fullName">Full Name</label>
                        <input
                          id="fullName"
                          type="text"
                          value={editForm.fullName}
                          onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                          placeholder="Enter your full name"
                          disabled={editLoading}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                          id="email"
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          placeholder="Enter your email"
                          disabled={editLoading}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="phoneNumber">Phone Number</label>
                        <input
                          id="phoneNumber"
                          type="tel"
                          value={editForm.phoneNumber}
                          onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                          placeholder="Enter your phone number"
                          disabled={editLoading}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="designation">Designation</label>
                        <input
                          id="designation"
                          type="text"
                          value={editForm.designation}
                          onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                          placeholder="e.g., Senior Admin, Manager"
                          disabled={editLoading}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="department">Department</label>
                        <input
                          id="department"
                          type="text"
                          value={editForm.department}
                          onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                          placeholder="e.g., Administration, IT"
                          disabled={editLoading}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="bio">Bio</label>
                        <textarea
                          id="bio"
                          value={editForm.bio}
                          onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                          placeholder="Tell us about yourself"
                          disabled={editLoading}
                          rows="3"
                          style={{ fontFamily: "inherit", padding: "12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }}
                        />
                      </div>

                      <button
                        type="button"
                        className="btn-save"
                        onClick={handleEditProfile}
                        disabled={editLoading}
                        style={{ marginTop: "8px" }}
                      >
                        {editLoading ? "Saving..." : "Save Changes"}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          ) : activeView === "add-admin" ? (
            <div className="add-admin-panel">
              <div className="add-admin-card">
                <h2>Create New Administrator</h2>
                <p style={{ color: "#6b7280", fontSize: "14px", margin: "0 0 32px 0" }}>Add a new admin account with profile information and credentials</p>

                <form className="add-admin-form">
                  <div className="add-admin-content">
                    {/* Left Side - Profile Picture Upload */}
                    <div className="admin-picture-section">
                      <div className="picture-upload-container">
                        <div className="admin-picture-display">
                          {addAdminForm.profilePictureUrl ? (
                            <img src={addAdminForm.profilePictureUrl} alt="Admin Profile" className="admin-picture-img" />
                          ) : (
                            <div className="admin-picture-placeholder">
                              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                              </svg>
                              <p>No Photo</p>
                            </div>
                          )}
                        </div>
                        
                        <label className="upload-label">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                          <span>Upload Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setAddAdminForm({ ...addAdminForm, profilePictureUrl: reader.result });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            disabled={addAdminLoading}
                            style={{ display: "none" }}
                          />
                        </label>

                        <p className="upload-hint">JPG, PNG or GIF (Max 5MB)</p>
                      </div>
                    </div>

                    {/* Right Side - Form Fields */}
                    <div className="admin-form-section">
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="username">Username</label>
                          <input
                            id="username"
                            type="text"
                            value={addAdminForm.username}
                            onChange={(e) => setAddAdminForm({ ...addAdminForm, username: e.target.value })}
                            placeholder="Enter username"
                            disabled={addAdminLoading}
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="fullName">Full Name</label>
                          <input
                            id="fullName"
                            type="text"
                            value={addAdminForm.fullName}
                            onChange={(e) => setAddAdminForm({ ...addAdminForm, fullName: e.target.value })}
                            placeholder="Enter full name"
                            disabled={addAdminLoading}
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="password">Password</label>
                          <div className="password-input-wrapper">
                            <input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              value={addAdminForm.password}
                              onChange={handlePasswordChange}
                              placeholder="Enter password"
                              disabled={addAdminLoading}
                            />
                            <button
                              type="button"
                              className="password-toggle"
                              onClick={() => setShowPassword(!showPassword)}
                              disabled={addAdminLoading}
                            >
                              {showPassword ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                              ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                  <line x1="1" y1="1" x2="23" y2="23" />
                                </svg>
                              )}
                            </button>
                          </div>
                          <div className="password-strength">
                            <div className="strength-bar">
                              <div
                                className="strength-fill"
                                style={{
                                  width: `${(passwordStrength.score / 5) * 100}%`,
                                  backgroundColor: passwordStrength.color
                                }}
                              />
                            </div>
                            <span className="strength-text" style={{ color: passwordStrength.color }}>
                              {passwordStrength.message || "Enter password"}
                            </span>
                            <div className="requirements">
                              <div className={`req ${passwordStrength.requirements?.length ? "met" : ""}`}>
                                {passwordStrength.requirements?.length ? "✓" : "○"} 8+ characters
                              </div>
                              <div className={`req ${passwordStrength.requirements?.uppercase ? "met" : ""}`}>
                                {passwordStrength.requirements?.uppercase ? "✓" : "○"} Uppercase
                              </div>
                              <div className={`req ${passwordStrength.requirements?.lowercase ? "met" : ""}`}>
                                {passwordStrength.requirements?.lowercase ? "✓" : "○"} Lowercase
                              </div>
                              <div className={`req ${passwordStrength.requirements?.number ? "met" : ""}`}>
                                {passwordStrength.requirements?.number ? "✓" : "○"} Number
                              </div>
                              <div className={`req ${passwordStrength.requirements?.special ? "met" : ""}`}>
                                {passwordStrength.requirements?.special ? "✓" : "○"} Special char
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="form-group">
                          <label htmlFor="confirmPassword">Confirm Password</label>
                          <div className="password-input-wrapper">
                            <input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              value={addAdminForm.confirmPassword}
                              onChange={(e) => setAddAdminForm({ ...addAdminForm, confirmPassword: e.target.value })}
                              placeholder="Confirm password"
                              disabled={addAdminLoading}
                            />
                            <button
                              type="button"
                              className="password-toggle"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              disabled={addAdminLoading}
                            >
                              {showConfirmPassword ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                              ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                  <line x1="1" y1="1" x2="23" y2="23" />
                                </svg>
                              )}
                            </button>
                          </div>
                          {addAdminForm.confirmPassword && addAdminForm.password !== addAdminForm.confirmPassword && (
                            <span className="password-mismatch">Passwords do not match</span>
                          )}
                          {addAdminForm.confirmPassword && addAdminForm.password === addAdminForm.confirmPassword && (
                            <span className="password-match">Passwords match ✓</span>
                          )}
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="email">Email Address</label>
                          <input
                            id="email"
                            type="email"
                            value={addAdminForm.email}
                            onChange={(e) => setAddAdminForm({ ...addAdminForm, email: e.target.value })}
                            placeholder="Enter email"
                            disabled={addAdminLoading}
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="phoneNumber">Phone Number</label>
                          <div className="phone-input-wrapper">
                            <input
                              id="phoneNumber"
                              type="tel"
                              value={addAdminForm.phoneNumber}
                              onChange={(e) => setAddAdminForm({ ...addAdminForm, phoneNumber: e.target.value })}
                              placeholder="Enter phone number"
                              disabled={addAdminLoading || addAdminForm.phoneVerified}
                            />
                            {!addAdminForm.phoneVerified && (
                              <button
                                type="button"
                                className="verify-btn"
                                onClick={() => {
                                  setShowOTPModal(true);
                                  setOtpSent(false);
                                  setOtpInput("");
                                  setOtpError("");
                                }}
                                disabled={addAdminLoading || !addAdminForm.phoneNumber.trim()}
                              >
                                Verify
                              </button>
                            )}
                            {addAdminForm.phoneVerified && (
                              <div className="verified-badge">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                Verified
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="designation">Designation</label>
                          <input
                            id="designation"
                            type="text"
                            value={addAdminForm.designation}
                            onChange={(e) => setAddAdminForm({ ...addAdminForm, designation: e.target.value })}
                            placeholder="e.g., Senior Admin"
                            disabled={addAdminLoading}
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="department">Department</label>
                          <input
                            id="department"
                            type="text"
                            value={addAdminForm.department}
                            onChange={(e) => setAddAdminForm({ ...addAdminForm, department: e.target.value })}
                            placeholder="e.g., Administration"
                            disabled={addAdminLoading}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn-save"
                        onClick={handleAddAdmin}
                        disabled={
                          addAdminLoading ||
                          !addAdminForm.phoneVerified ||
                          !addAdminForm.username.trim() ||
                          !addAdminForm.fullName.trim() ||
                          !addAdminForm.password.trim() ||
                          !addAdminForm.confirmPassword.trim() ||
                          !addAdminForm.email.trim() ||
                          !addAdminForm.phoneNumber.trim() ||
                          addAdminForm.password !== addAdminForm.confirmPassword ||
                          validatePasswordStrength(addAdminForm.password).score < 3
                        }
                        style={{ marginTop: "8px" }}
                        title={
                          !addAdminForm.phoneVerified
                            ? "Please verify phone number first"
                            : !addAdminForm.username.trim() ||
                              !addAdminForm.fullName.trim() ||
                              !addAdminForm.password.trim() ||
                              !addAdminForm.confirmPassword.trim() ||
                              !addAdminForm.email.trim() ||
                              !addAdminForm.phoneNumber.trim()
                            ? "Please fill all required fields"
                            : addAdminForm.password !== addAdminForm.confirmPassword
                            ? "Passwords do not match"
                            : validatePasswordStrength(addAdminForm.password).score < 3
                            ? "Password is too weak"
                            : ""
                        }
                      >
                        {addAdminLoading ? "Creating..." : "Create Admin"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          ) : activeView === "add-sessions" ? (
            <div className="sessions-panel">
              <div className="sessions-card">
                <h2>Create New Session</h2>
                <p style={{ color: "#6b7280", fontSize: "14px", margin: "0 0 32px 0" }}>Add training sessions with videos and badge thresholds</p>

                <form className="sessions-form">
                  {/* Thumbnail Upload */}
                  <div className="thumbnail-upload-section">
                    <div className="thumbnail-preview">
                      {sessionThumbnailPreview ? (
                        <img src={sessionThumbnailPreview} alt="Session Thumbnail" className="thumbnail-img" />
                      ) : (
                        <div className="thumbnail-placeholder">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                          <p>No Thumbnail</p>
                        </div>
                      )}
                    </div>
                    
                    <label className="thumbnail-upload-label">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <span>Upload Thumbnail</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setSessionForm({ ...sessionForm, thumbnail: reader.result });
                              setSessionThumbnailPreview(reader.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        disabled={sessionLoading}
                        style={{ display: "none" }}
                      />
                    </label>

                    <p className="upload-hint">JPG, PNG or GIF (Max 5MB)</p>
                  </div>

                  {/* Session Basic Info */}
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="sessionName">Session Name</label>
                      <input
                        id="sessionName"
                        type="text"
                        value={sessionForm.sessionName}
                        onChange={(e) => setSessionForm({ ...sessionForm, sessionName: e.target.value })}
                        placeholder="e.g., Advanced JavaScript"
                        disabled={sessionLoading}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="price">Price</label>
                      <input
                        id="price"
                        type="number"
                        value={sessionForm.price}
                        onChange={(e) => setSessionForm({ ...sessionForm, price: e.target.value })}
                        placeholder="e.g., 99.99"
                        disabled={sessionLoading}
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Badge Thresholds */}
                  <div className="badge-thresholds">
                    <h3>Badge Thresholds</h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="silverThreshold">Silver Badge (Videos)</label>
                        <input
                          id="silverThreshold"
                          type="number"
                          value={sessionForm.silverBadgeThreshold}
                          onChange={(e) => setSessionForm({ ...sessionForm, silverBadgeThreshold: parseInt(e.target.value) || 0 })}
                          placeholder="e.g., 5"
                          disabled={sessionLoading}
                          min="1"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="bronzeThreshold">Bronze Badge (Videos)</label>
                        <input
                          id="bronzeThreshold"
                          type="number"
                          value={sessionForm.bronzeBadgeThreshold}
                          onChange={(e) => setSessionForm({ ...sessionForm, bronzeBadgeThreshold: parseInt(e.target.value) || 0 })}
                          placeholder="e.g., 10"
                          disabled={sessionLoading}
                          min="1"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="goldThreshold">Gold Badge (Videos)</label>
                        <input
                          id="goldThreshold"
                          type="number"
                          value={sessionForm.goldBadgeThreshold}
                          onChange={(e) => setSessionForm({ ...sessionForm, goldBadgeThreshold: parseInt(e.target.value) || 0 })}
                          placeholder="e.g., 15"
                          disabled={sessionLoading}
                          min="1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="button"
                    className="btn-save"
                    onClick={handleCreateSession}
                    disabled={
                      sessionLoading ||
                      !sessionForm.sessionName.trim() ||
                      !sessionForm.price ||
                      !sessionForm.thumbnail
                    }
                    style={{ marginTop: "24px" }}
                  >
                    {sessionLoading ? "Creating..." : "Create Session"}
                  </button>
                </form>
              </div>
            </div>
          ) : activeView === "view-sessions" ? (
            <div className="view-sessions-panel">
              {sessionsLoading ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <p>Loading sessions...</p>
                </div>
              ) : sessions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <p style={{ color: "#6b7280" }}>No sessions found. Create one to get started.</p>
                </div>
              ) : (
                <div className="sessions-grid">
                  {sessions.map((session) => (
                    <div key={session.id} className="session-card">
                      <div className="session-header">
                        <div>
                          <h3>{session.sessionName}</h3>
                          <p className="session-price">{session.price}</p>
                        </div>
                        <div className="session-actions">
                          <button
                            className="edit-btn"
                            onClick={() => setEditingSessionId(editingSessionId === session.id ? null : session.id)}
                            disabled={sessionsLoading}
                          >
                            {editingSessionId === session.id ? "Cancel" : "Edit"}
                          </button>
                        </div>
                      </div>

                      {editingSessionId === session.id ? (
                        <div className="session-edit-form">
                          <div className="form-row">
                            <div className="form-group">
                              <label>Session Name</label>
                              <input
                                type="text"
                                defaultValue={session.sessionName}
                                id={`name-${session.id}`}
                                disabled={sessionsLoading}
                              />
                            </div>
                            <div className="form-group">
                              <label>Price</label>
                              <input
                                type="number"
                                defaultValue={session.price}
                                id={`price-${session.id}`}
                                step="0.01"
                                min="0"
                                disabled={sessionsLoading}
                              />
                            </div>
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label>Silver Badge (Videos)</label>
                              <input
                                type="number"
                                defaultValue={session.silverBadgeThreshold}
                                id={`silver-${session.id}`}
                                min="1"
                                disabled={sessionsLoading}
                              />
                            </div>
                            <div className="form-group">
                              <label>Bronze Badge (Videos)</label>
                              <input
                                type="number"
                                defaultValue={session.bronzeBadgeThreshold}
                                id={`bronze-${session.id}`}
                                min="1"
                                disabled={sessionsLoading}
                              />
                            </div>
                            <div className="form-group">
                              <label>Gold Badge (Videos)</label>
                              <input
                                type="number"
                                defaultValue={session.goldBadgeThreshold}
                                id={`gold-${session.id}`}
                                min="1"
                                disabled={sessionsLoading}
                              />
                            </div>
                          </div>

                          <button
                            className="btn-save"
                            onClick={() => {
                              const updatedData = {
                                sessionName: document.getElementById(`name-${session.id}`).value,
                                price: parseFloat(document.getElementById(`price-${session.id}`).value),
                                silverBadgeThreshold: parseInt(document.getElementById(`silver-${session.id}`).value),
                                bronzeBadgeThreshold: parseInt(document.getElementById(`bronze-${session.id}`).value),
                                goldBadgeThreshold: parseInt(document.getElementById(`gold-${session.id}`).value),
                                videos: session.videos.map(v => ({ title: v.title, youtubeUrl: v.youtubeUrl }))
                              };
                              handleUpdateSession(session.id, updatedData);
                            }}
                            disabled={sessionsLoading}
                            style={{ marginTop: "12px" }}
                          >
                            Save Changes
                          </button>
                        </div>
                      ) : (
                      <div className="session-details">
                          <div className="badge-info">
                            <div className="badge-item">🥈 Silver: {session.silverBadgeThreshold} videos</div>
                            <div className="badge-item">🥉 Bronze: {session.bronzeBadgeThreshold} videos</div>
                            <div className="badge-item">🥇 Gold: {session.goldBadgeThreshold} videos</div>
                          </div>

                          <div className="videos-info">
                            <h4>Uploaded Videos ({(sessionVideoFiles[session.id] || []).length})</h4>
                            {(sessionVideoFiles[session.id] || []).length > 0 ? (
                              <div className="videos-list-view">
                                {(sessionVideoFiles[session.id] || []).map((video, index) => (
                                  <div key={video.id} className="video-item-view">
                                    <div className="video-info">
                                      <div className="video-number-badge">{index + 1}</div>
                                      <div>
                                        <p className="video-title">{video.title}</p>
                                        <p className="video-subtitle">{video.subtitle}</p>
                                      </div>
                                    </div>
                                    <div className="video-actions">
                                      <button
                                        className="delete-video-btn"
                                        onClick={() => handleDeleteVideoFile(video.id, session.id)}
                                        disabled={sessionsLoading}
                                        title="Delete video"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="no-videos-message">No videos uploaded. Use "Add Session Videos" to upload.</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeView === "review-achievements" ? (
            <div className="review-achievements-panel">
              <div className="review-header">
                <div className="review-controls">
                  <div className="search-box">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search by student name or achievement title..."
                      value={achievementSearch}
                      onChange={(e) => setAchievementSearch(e.target.value)}
                    />
                  </div>

                  <div className="filter-controls">
                    <select
                      value={achievementFilter}
                      onChange={(e) => setAchievementFilter(e.target.value)}
                      className="filter-select"
                    >
                      <option value="all">All Achievements</option>
                      <option value="PENDING">Pending</option>
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>

              {achievementsLoading ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <p>Loading achievements...</p>
                </div>
              ) : allAchievements.filter(a => {
                const matchesFilter = achievementFilter === "all" || a.status === achievementFilter;
                const matchesSearch = a.title?.toLowerCase().includes(achievementSearch.toLowerCase()) ||
                                     a.student?.fullName?.toLowerCase().includes(achievementSearch.toLowerCase());
                return matchesFilter && matchesSearch;
              }).length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <p style={{ color: "#6b7280" }}>No achievements found.</p>
                </div>
              ) : (
                <>
                  <div className="achievements-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Student Name</th>
                          <th>Achievement Title</th>
                          <th>Status</th>
                          <th>Reason/Comment</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allAchievements.filter(a => {
                          const matchesFilter = achievementFilter === "all" || a.status === achievementFilter;
                          const matchesSearch = a.title?.toLowerCase().includes(achievementSearch.toLowerCase()) ||
                                               a.student?.fullName?.toLowerCase().includes(achievementSearch.toLowerCase());
                          return matchesFilter && matchesSearch;
                        }).map((achievement) => (
                          <tr key={achievement.id} className={`status-${achievement.status?.toLowerCase()}`}>
                            <td>{achievement.student?.fullName || "N/A"}</td>
                            <td>{achievement.title || "N/A"}</td>
                            <td>
                              <span className={`status-badge status-${achievement.status?.toLowerCase()}`}>
                                {achievement.status || "N/A"}
                              </span>
                            </td>
                            <td>{achievement.adminComment || "—"}</td>
                            <td>{new Date(achievement.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          ) : activeView === "add-session-videos" ? (
            <div className="add-session-videos-panel">
              <div className="videos-upload-card">
                <h2>Add Session Videos</h2>
                <p style={{ color: "#6b7280", fontSize: "14px", margin: "0 0 32px 0" }}>Upload video files for training sessions</p>

                {sessions.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px" }}>
                    <p style={{ color: "#6b7280" }}>No sessions available. Create a session first.</p>
                  </div>
                ) : (
                  <div className="sessions-list-for-upload">
                    {sessions.map((session) => (
                      <div key={session.id} className="session-upload-item">
                        <div className="session-info-upload">
                          <h3>{session.sessionName}</h3>
                          <p className="session-price-upload">Rs {session.price}</p>
                        </div>
                        <button
                          className="upload-video-btn"
                          onClick={() => {
                            setSelectedSessionForUpload(session);
                            setShowVideoUploadModal(true);
                            loadSessionVideoFiles(session.id);
                          }}
                        >
                          + Upload Video
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {Object.keys(sessionVideoFiles).length > 0 && (
                  <div className="uploaded-videos-section">
                    <h3>Uploaded Videos</h3>
                    {Object.entries(sessionVideoFiles).map(([sessionId, files]) => (
                      files.length > 0 && (
                        <div key={sessionId} className="session-videos-list">
                          <h4>{sessions.find(s => s.id === parseInt(sessionId))?.sessionName}</h4>
                          <div className="videos-table">
                            <table>
                              <thead>
                                <tr>
                                  <th>Title</th>
                                  <th>Subtitle</th>
                                  <th>File Name</th>
                                  <th>Size</th>
                                  <th>Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {files.map((file) => (
                                  <tr key={file.id}>
                                    <td>{file.title}</td>
                                    <td>{file.subtitle}</td>
                                    <td>{file.fileName}</td>
                                    <td>{(file.fileSize / (1024 * 1024)).toFixed(2)} MB</td>
                                    <td>
                                      <button
                                        className="delete-video-btn"
                                        onClick={() => handleDeleteVideoFile(file.id, parseInt(sessionId))}
                                      >
                                        Delete
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : activeView === "add-session-questions" ? (
            <div className="add-session-videos-panel">
              <div className="videos-upload-card">
                <h2>Add Session Questions</h2>
                <p style={{ color: "#6b7280", fontSize: "14px", margin: "0 0 32px 0" }}>Add quiz questions and set time limit for training sessions</p>

                {!selectedSessionForQuestions ? (
                  sessions.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px" }}>
                      <p style={{ color: "#6b7280" }}>No sessions available. Create a session first.</p>
                    </div>
                  ) : (
                    <div className="sessions-list-for-upload">
                      {sessions.map((session) => (
                        <div key={session.id} className="session-upload-item">
                          <div className="session-info-upload">
                            <h3>{session.sessionName}</h3>
                            <p className="session-price-upload">Rs {session.price}</p>
                          </div>
                          <button
                            className="upload-video-btn"
                            onClick={() => loadSessionQuestionsAndConfig(session)}
                          >
                            Manage Questions
                          </button>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                      <button
                        onClick={() => { setSelectedSessionForQuestions(null); setSessionQuestions([]); }}
                        style={{ background: "none", border: "1px solid #d1d5db", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontSize: "13px" }}
                      >
                        ← Back
                      </button>
                      <h3 style={{ margin: 0 }}>{selectedSessionForQuestions.sessionName}</h3>
                    </div>

                    {/* Time Limit */}
                    <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "16px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                      <label style={{ fontWeight: 600, fontSize: "14px" }}>Quiz Time Limit:</label>
                      <input
                        type="number"
                        min="0"
                        value={timeLimitMinutes}
                        onChange={(e) => setTimeLimitMinutes(e.target.value)}
                        style={{ width: "80px", padding: "6px 10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
                      />
                      <span style={{ fontSize: "14px", color: "#6b7280" }}>minutes</span>
                      <button
                        onClick={handleSaveTimeLimit}
                        disabled={savingTimeLimit}
                        style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", padding: "6px 16px", cursor: "pointer", fontSize: "13px" }}
                      >
                        {savingTimeLimit ? "Saving..." : "Save Time Limit"}
                      </button>
                    </div>

                    {/* Add Question Button */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <span style={{ fontWeight: 600, fontSize: "15px" }}>
                        Questions ({questionsLoading ? "..." : sessionQuestions.length})
                      </span>
                      <button
                        className="upload-video-btn"
                        onClick={() => setShowAddQuestionModal(true)}
                      >
                        + Add Question
                      </button>
                    </div>

                    {/* Questions List */}
                    {questionsLoading ? (
                      <p style={{ color: "#6b7280", textAlign: "center", padding: "20px" }}>Loading...</p>
                    ) : sessionQuestions.length === 0 ? (
                      <p style={{ color: "#6b7280", textAlign: "center", padding: "20px" }}>No questions yet. Add your first question.</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {sessionQuestions.map((q, index) => (
                          <div key={q.id} style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "16px", background: "#fff" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                              <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: 600, margin: "0 0 10px 0", fontSize: "14px" }}>
                                  Q{index + 1}. {q.questionText}
                                </p>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                                  {["A", "B", "C", "D"].map((opt) => (
                                    <span key={opt} style={{
                                      fontSize: "13px", padding: "4px 8px", borderRadius: "4px",
                                      background: q.correctAnswer === opt ? "#dcfce7" : "#f3f4f6",
                                      color: q.correctAnswer === opt ? "#166534" : "#374151",
                                      fontWeight: q.correctAnswer === opt ? 600 : 400
                                    }}>
                                      {opt}. {q[`option${opt}`]} {q.correctAnswer === opt ? "✓" : ""}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteQuestion(q.id)}
                                style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontSize: "12px", whiteSpace: "nowrap" }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <footer className="admin-desk-footer">
          <div className="footer-content">
            <p className="footer-text">© 2026 UniSphere. All rights reserved.</p>
            <p className="footer-text">v1.0.0</p>
          </div>
        </footer>
      </main>

      {/* Add Question Modal */}
      {showAddQuestionModal && (
        <div className="video-upload-overlay">
          <div className="video-upload-modal" style={{ maxWidth: "560px" }}>
            <div className="video-upload-header">
              <h3>Add Question</h3>
              <button className="video-upload-close" onClick={() => setShowAddQuestionModal(false)}>✕</button>
            </div>
            <div className="video-upload-content">
              <div className="form-group">
                <label>Question</label>
                <textarea
                  rows={3}
                  value={questionForm.questionText}
                  onChange={(e) => setQuestionForm({ ...questionForm, questionText: e.target.value })}
                  placeholder="Enter question text"
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", resize: "vertical" }}
                />
              </div>
              {["A", "B", "C", "D"].map((opt) => (
                <div className="form-group" key={opt}>
                  <label>Option {opt}</label>
                  <input
                    type="text"
                    value={questionForm[`option${opt}`]}
                    onChange={(e) => setQuestionForm({ ...questionForm, [`option${opt}`]: e.target.value })}
                    placeholder={`Enter option ${opt}`}
                  />
                </div>
              ))}
              <div className="form-group">
                <label>Correct Answer</label>
                <select
                  value={questionForm.correctAnswer}
                  onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
              <div className="video-upload-actions">
                <button className="btn-cancel" onClick={() => setShowAddQuestionModal(false)} disabled={questionSaving}>Cancel</button>
                <button className="btn-upload" onClick={handleAddQuestion} disabled={questionSaving}>
                  {questionSaving ? "Saving..." : "Add Question"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Upload Modal */}
      {showVideoUploadModal && selectedSessionForUpload && (
        <div className="video-upload-overlay">
          <div className="video-upload-modal">
            <div className="video-upload-header">
              <h3>Upload Video - {selectedSessionForUpload.sessionName}</h3>
              <button
                className="video-upload-close"
                onClick={() => {
                  setShowVideoUploadModal(false);
                  setVideoUploadForm({ title: "", subtitle: "", file: null });
                  setUploadProgress(0);
                }}
              >
                ✕
              </button>
            </div>

            <div className="video-upload-content">
              <div className="form-group">
                <label htmlFor="videoTitle">Video Title</label>
                <input
                  id="videoTitle"
                  type="text"
                  value={videoUploadForm.title}
                  onChange={(e) => setVideoUploadForm({ ...videoUploadForm, title: e.target.value })}
                  placeholder="Enter video title"
                  disabled={isUploading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="videoSubtitle">Video Subtitle</label>
                <input
                  id="videoSubtitle"
                  type="text"
                  value={videoUploadForm.subtitle}
                  onChange={(e) => setVideoUploadForm({ ...videoUploadForm, subtitle: e.target.value })}
                  placeholder="Enter video subtitle"
                  disabled={isUploading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="videoFile">Select Video File</label>
                <div className="file-input-wrapper">
                  <input
                    id="videoFile"
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setVideoUploadForm({ ...videoUploadForm, file });
                      }
                    }}
                    disabled={isUploading}
                    style={{ display: "none" }}
                  />
                  <label htmlFor="videoFile" className="file-input-label">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>{videoUploadForm.file ? videoUploadForm.file.name : "Choose video file"}</span>
                  </label>
                </div>
              </div>

              {isUploading && (
                <div className="upload-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                  <p className="progress-text">{Math.round(uploadProgress)}% Uploading...</p>
                </div>
              )}

              <div className="video-upload-actions">
                <button
                  className="btn-cancel"
                  onClick={() => {
                    setShowVideoUploadModal(false);
                    setVideoUploadForm({ title: "", subtitle: "", file: null });
                    setUploadProgress(0);
                  }}
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  className="btn-upload"
                  onClick={handleVideoUpload}
                  disabled={isUploading || !videoUploadForm.title.trim() || !videoUploadForm.subtitle.trim() || !videoUploadForm.file}
                >
                  {isUploading ? "Uploading..." : "Upload Video"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {showOTPModal && (
        <div className="otp-modal-overlay">
          <div className="otp-modal">
            <div className="otp-modal-header">
              <h3>Verify Phone Number</h3>
              <button
                className="otp-modal-close"
                onClick={() => {
                  setShowOTPModal(false);
                  setOtpSent(false);
                  setOtpInput("");
                  setOtpError("");
                }}
              >
                ✕
              </button>
            </div>

            {!otpSent ? (
              <div className="otp-modal-content">
                <p className="otp-modal-message">
                  We'll send a verification code to your WhatsApp number: <strong>{addAdminForm.phoneNumber}</strong>
                </p>
                <button
                  className="otp-send-btn"
                  onClick={handleSendOTP}
                  disabled={otpLoading || !addAdminForm.phoneNumber.trim()}
                >
                  {otpLoading ? "Sending..." : "Send OTP"}
                </button>
              </div>
            ) : (
              <div className="otp-modal-content">
                <p className="otp-modal-message">
                  Enter the 6-digit code sent to your WhatsApp
                </p>
                <div className="otp-input-group">
                  <input
                    type="text"
                    className="otp-input"
                    value={otpInput}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setOtpInput(value);
                      setOtpError("");
                    }}
                    placeholder="000000"
                    maxLength="6"
                    disabled={otpLoading}
                  />
                </div>
                {otpError && <p className="otp-error">{otpError}</p>}
                <div className="otp-modal-actions">
                  <button
                    className="otp-cancel-btn"
                    onClick={() => {
                      setOtpSent(false);
                      setOtpInput("");
                      setOtpError("");
                    }}
                    disabled={otpLoading}
                  >
                    Back
                  </button>
                  <button
                    className="otp-verify-btn"
                    onClick={handleVerifyOTP}
                    disabled={otpLoading || otpInput.length !== 6}
                  >
                    {otpLoading ? "Verifying..." : "Verify"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <div className="logout-modal-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <h3>Confirm Logout</h3>
            </div>
            <p className="logout-modal-message">Are you sure you want to logout? You'll need to login again to access the admin panel.</p>
            <div className="logout-modal-actions">
              <button
                className="logout-modal-btn cancel-btn"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="logout-modal-btn confirm-btn"
                onClick={confirmLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Overlay Modal */}
      {showVideoOverlay && (
        <div className="video-overlay">
          <div className="video-overlay-content">
            <button
              className="video-overlay-close"
              onClick={() => {
                setShowVideoOverlay(false);
                setSelectedVideoUrl("");
              }}
            >
              ✕
            </button>
            <iframe
              width="100%"
              height="100%"
              src={selectedVideoUrl.replace("watch?v=", "embed/").split("&")[0]}
              title="Video Player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="report-modal-overlay">
          <div className="report-modal">
            <div className="report-modal-header">
              <h3>Generate Report</h3>
              <button
                className="report-modal-close"
                onClick={() => setShowReportModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="report-modal-content">
              <p>Download a CSV report of all achievements (pending, approved, and rejected).</p>
              <div className="report-summary">
                <div className="summary-item">
                  <span className="summary-label">Total Records:</span>
                  <span className="summary-value">{allAchievements.length}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Pending:</span>
                  <span className="summary-value">{allAchievements.filter(a => a.status === "PENDING").length}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Approved:</span>
                  <span className="summary-value">{allAchievements.filter(a => a.status === "APPROVED").length}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Rejected:</span>
                  <span className="summary-value">{allAchievements.filter(a => a.status === "REJECTED").length}</span>
                </div>
              </div>
            </div>
            <div className="report-modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowReportModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-download"
                onClick={generateReport}
              >
                📥 Download Report
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-desk-layout {
          display: flex;
          min-height: 100vh;
          background-color: #f5f7fa;
          --sidebar-width: 280px;
        }

        .admin-desk-layout.sidebar-closed {
          --sidebar-width: 80px;
        }

        /* Sidebar Styles */
        .admin-sidebar {
          width: 280px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 24px 16px;
          transition: all 0.3s ease;
          overflow-y: auto;
          box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          height: 100vh;
        }

        .admin-sidebar.closed {
          width: 80px;
        }

        .sidebar-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 99;
        }

        @media (max-width: 768px) {
          .sidebar-overlay {
            display: block;
          }
        }

        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .sidebar-title {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          white-space: nowrap;
        }

        .admin-sidebar.closed .sidebar-title {
          display: none;
        }

        .sidebar-toggle {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.3s;
        }

        .sidebar-toggle:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .sidebar-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
          flex: 1;
        }

        /* User Profile Section */
        .user-profile-section {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .admin-sidebar.closed .user-profile-section {
          flex-direction: column;
          justify-content: center;
        }

        .user-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
          flex-shrink: 0;
          overflow: hidden;
        }

        .user-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .user-info {
          flex: 1;
        }

        .admin-sidebar.closed .user-info {
          display: none;
        }

        .user-name {
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 2px;
        }

        .user-role {
          font-size: 12px;
          opacity: 0.8;
        }

        /* Navigation */
        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }

        .nav-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s;
        }

        .nav-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .nav-btn.active {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.4);
          font-weight: 600;
        }

        .admin-sidebar.closed .nav-btn {
          justify-content: center;
          padding: 12px;
        }

        .admin-sidebar.closed .nav-btn span {
          display: none;
        }

        /* Sidebar Buttons */
        .sidebar-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s;
          margin-top: auto;
        }

        .sidebar-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .admin-sidebar.closed .sidebar-btn {
          justify-content: center;
          padding: 12px;
        }

        .admin-sidebar.closed .sidebar-btn span {
          display: none;
        }

        .logout-btn {
          background: rgba(255, 0, 0, 0.2);
          border-color: rgba(255, 0, 0, 0.3);
        }

        .logout-btn:hover {
          background: rgba(255, 0, 0, 0.3);
          border-color: rgba(255, 0, 0, 0.4);
        }

        /* Main Content */
        .admin-desk-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          margin-left: var(--sidebar-width, 280px);
          transition: margin-left 0.3s ease;
        }

        .admin-desk-header {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 24px;
          background: white;
          border-bottom: 1px solid #e5e7eb;
        }

        .mobile-sidebar-toggle {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          color: #667eea;
        }

        .section-title {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .section-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin: 4px 0 0 0;
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          gap: 20px;
        }

        .header-report-btn {
          padding: 10px 20px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .header-report-btn:hover:not(:disabled) {
          background: #5568d3;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .header-report-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .admin-desk-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        /* Profile Panel */
        .profile-panel {
          max-width: 1000px;
          margin: 0 auto;
        }

        .profile-card {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #f0f0f0;
        }

        .profile-card h2 {
          margin: 0 0 8px 0;
          color: #1f2937;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .profile-card > div:nth-child(2) {
          color: #6b7280;
          font-size: 14px;
          margin-bottom: 32px;
        }

        .profile-content {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 60px;
          align-items: start;
        }

        /* Left Side - Picture Upload */
        .profile-picture-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }

        .picture-upload-container {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .profile-picture-display {
          width: 240px;
          height: 240px;
          border-radius: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.25);
          border: 3px solid white;
          position: relative;
        }

        .profile-picture-display::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0);
          transition: background 0.3s;
        }

        .profile-picture-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .profile-picture-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: white;
          text-align: center;
        }

        .profile-picture-placeholder svg {
          opacity: 0.9;
        }

        .profile-picture-placeholder p {
          margin: 0;
          font-size: 15px;
          font-weight: 500;
          opacity: 0.95;
        }

        .upload-label {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 28px;
          background: #667eea;
          color: white;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s ease;
          border: none;
          width: 100%;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
        }

        .upload-label:hover {
          background: #5568d3;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
        }

        .upload-label:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .upload-hint {
          font-size: 12px;
          color: #9ca3af;
          margin: 0;
          text-align: center;
          font-weight: 500;
        }

        /* Right Side - Form */
        .profile-form-section {
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }

        .profile-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          display: block;
          margin-bottom: 10px;
          color: #374151;
          font-weight: 600;
          font-size: 14px;
          letter-spacing: 0.3px;
        }

        .form-group input {
          width: 100%;
          padding: 14px 16px;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          box-sizing: border-box;
          transition: all 0.3s ease;
          background: #fafbfc;
        }

        .form-group input::placeholder {
          color: #9ca3af;
        }

        .form-group input:focus {
          outline: none;
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.08);
        }

        .form-group input:disabled {
          background-color: #f3f4f6;
          cursor: not-allowed;
          color: #9ca3af;
        }

        .btn-save {
          padding: 14px 32px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 15px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
          letter-spacing: 0.3px;
        }

        .btn-save:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.35);
        }

        .btn-save:active:not(:disabled) {
          transform: translateY(0);
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Add Admin Panel */
        .add-admin-panel {
          max-width: 1000px;
          margin: 0 auto;
        }

        .add-admin-card {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #f0f0f0;
        }

        .add-admin-card h2 {
          margin: 0 0 8px 0;
          color: #1f2937;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .add-admin-content {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 60px;
          align-items: start;
        }

        /* Admin Picture Section */
        .admin-picture-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }

        .picture-upload-container {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .admin-picture-display {
          width: 240px;
          height: 240px;
          border-radius: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.25);
          border: 3px solid white;
        }

        .admin-picture-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .admin-picture-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: white;
          text-align: center;
        }

        .admin-picture-placeholder p {
          margin: 0;
          font-size: 14px;
          font-weight: 500;
        }

        /* Admin Form Section */
        .admin-form-section {
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }

        .add-admin-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
          width: 100%;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-row .form-group {
          display: flex;
          flex-direction: column;
        }

        /* Password Input Wrapper */
        .password-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .password-input-wrapper input {
          width: 100%;
          padding-right: 40px;
          padding: 14px 40px 14px 16px;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          box-sizing: border-box;
          transition: all 0.3s ease;
          background: #fafbfc;
        }

        .password-input-wrapper input::placeholder {
          color: #9ca3af;
        }

        .password-input-wrapper input:focus {
          outline: none;
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.08);
        }

        .password-input-wrapper input:disabled {
          background-color: #f3f4f6;
          cursor: not-allowed;
          color: #9ca3af;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          cursor: pointer;
          color: #9ca3af;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          transition: color 0.3s ease;
        }

        .password-toggle:hover:not(:disabled) {
          color: #667eea;
        }

        .password-toggle:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Password Strength Indicator */
        .password-strength {
          margin-top: 12px;
          padding: 14px 16px;
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          min-height: 130px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          visibility: visible;
          opacity: 1;
          transition: opacity 0.3s ease;
        }

        .strength-bar {
          width: 100%;
          height: 6px;
          background: #e5e7eb;
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 10px;
        }

        .strength-fill {
          height: 100%;
          transition: width 0.3s ease;
          border-radius: 3px;
        }

        .strength-text {
          font-size: 13px;
          font-weight: 700;
          display: block;
          margin-bottom: 10px;
          min-height: 16px;
          letter-spacing: 0.3px;
        }

        .requirements {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          font-size: 13px;
          min-height: 80px;
        }

        .req {
          color: #9ca3af;
          display: flex;
          align-items: center;
          gap: 6px;
          min-height: 18px;
          font-weight: 500;
        }

        .req.met {
          color: #10b981;
          font-weight: 600;
        }

        /* Password Match/Mismatch */
        .password-mismatch {
          display: block;
          margin-top: 8px;
          font-size: 13px;
          color: #ef4444;
          font-weight: 600;
          min-height: 20px;
          visibility: visible;
          letter-spacing: 0.2px;
        }

        .password-match {
          display: block;
          margin-top: 8px;
          font-size: 13px;
          color: #10b981;
          font-weight: 600;
          min-height: 20px;
          visibility: visible;
          letter-spacing: 0.2px;
        }

        /* Footer */
        .admin-desk-footer {
          position: fixed;
          bottom: 0;
          right: 0;
          left: var(--sidebar-width, 280px);
          background: white;
          border-top: 1px solid #e5e7eb;
          padding: 16px 24px;
          z-index: 100;
          box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
          transition: left 0.3s ease;
        }

        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1400px;
          margin: 0 auto;
          gap: 20px;
        }

        .footer-text {
          margin: 0;
          font-size: 13px;
          color: #6b7280;
          font-weight: 500;
        }

        /* Adjust content padding to account for fixed footer */
        .admin-desk-content {
          padding-bottom: 80px;
        }

        /* Add Session Videos Panel */
        .add-session-videos-panel {
          padding: 24px;
        }

        .videos-upload-card {
          background: white;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          border: 1px solid #e5e7eb;
        }

        .videos-upload-card h2 {
          font-size: 24px;
          font-weight: 800;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .sessions-list-for-upload {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .session-upload-item {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.3s ease;
        }

        .session-upload-item:hover {
          background: #f3f4f6;
          border-color: #667eea;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
        }

        .session-info-upload h3 {
          font-size: 16px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 4px 0;
        }

        .session-price-upload {
          font-size: 14px;
          color: #667eea;
          font-weight: 600;
          margin: 0;
        }

        .upload-video-btn {
          padding: 10px 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
        }

        .upload-video-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .uploaded-videos-section {
          margin-top: 40px;
          padding-top: 40px;
          border-top: 1px solid #e5e7eb;
        }

        .uploaded-videos-section h3 {
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 24px 0;
        }

        .session-videos-list {
          margin-bottom: 32px;
        }

        .session-videos-list h4 {
          font-size: 15px;
          font-weight: 700;
          color: #374151;
          margin: 0 0 12px 0;
        }

        .videos-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }

        .videos-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .videos-table th {
          background: #f9fafb;
          padding: 12px 16px;
          text-align: left;
          font-size: 13px;
          font-weight: 700;
          color: #374151;
          border-bottom: 1px solid #e5e7eb;
        }

        .videos-table td {
          padding: 12px 16px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 14px;
          color: #6b7280;
        }

        .videos-table tr:last-child td {
          border-bottom: none;
        }

        .delete-video-btn {
          padding: 6px 12px;
          background: #fee2e2;
          color: #dc2626;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .delete-video-btn:hover {
          background: #fecaca;
        }

        /* Video Upload Modal */
        .video-upload-overlay {
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
          padding: 20px;
          backdrop-filter: blur(4px);
        }

        .video-upload-modal {
          background: white;
          border-radius: 16px;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          border: 1px solid #e5e7eb;
          max-height: 90vh;
          overflow-y: auto;
        }

        .video-upload-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .video-upload-header h3 {
          font-size: 18px;
          font-weight: 800;
          color: #1f2937;
          margin: 0;
        }

        .video-upload-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #9ca3af;
          transition: all 0.3s ease;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .video-upload-close:hover {
          color: #1f2937;
          background: #f3f4f6;
          border-radius: 6px;
        }

        .video-upload-content {
          padding: 24px;
        }

        .file-input-wrapper {
          position: relative;
        }

        .file-input-label {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #f9fafb;
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 600;
          color: #667eea;
        }

        .file-input-label:hover {
          background: #f3f4f6;
          border-color: #667eea;
        }

        .upload-progress {
          margin: 24px 0;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 12px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 13px;
          color: #6b7280;
          margin: 0;
          text-align: center;
          font-weight: 600;
        }

        .video-upload-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .btn-cancel {
          flex: 1;
          padding: 12px 20px;
          background: transparent;
          color: #667eea;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-cancel:hover:not(:disabled) {
          background: #f3f4f6;
          border-color: #667eea;
        }

        .btn-upload {
          flex: 1;
          padding: 12px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        }

        .btn-upload:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
        }

        .btn-upload:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Phone Input Wrapper */
        .phone-input-wrapper {
          position: relative;
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .phone-input-wrapper input {
          flex: 1;
        }

        .verify-btn {
          padding: 10px 16px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .verify-btn:hover:not(:disabled) {
          background: #5568d3;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
        }

        .verify-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .verified-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: #d1fae5;
          color: #065f46;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
        }

        /* OTP Modal */
        .otp-modal-overlay {
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
          animation: fadeIn 0.2s ease;
        }

        .otp-modal {
          background: white;
          border-radius: 12px;
          padding: 32px;
          max-width: 420px;
          width: 90%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease;
        }

        .otp-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .otp-modal-header h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
        }

        .otp-modal-close {
          background: none;
          border: none;
          font-size: 24px;
          color: #9ca3af;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.3s ease;
        }

        .otp-modal-close:hover {
          color: #374151;
        }

        .otp-modal-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .otp-modal-message {
          margin: 0;
          font-size: 14px;
          color: #6b7280;
          line-height: 1.6;
        }

        .otp-send-btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
        }

        .otp-send-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.35);
        }

        .otp-send-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .otp-input-group {
          display: flex;
          justify-content: center;
          gap: 8px;
        }

        .otp-input {
          width: 100%;
          padding: 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 24px;
          font-weight: 700;
          text-align: center;
          letter-spacing: 8px;
          font-family: "Courier New", monospace;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }

        .otp-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.08);
        }

        .otp-input:disabled {
          background-color: #f3f4f6;
          cursor: not-allowed;
        }

        .otp-error {
          margin: 0;
          font-size: 13px;
          color: #ef4444;
          font-weight: 600;
          text-align: center;
        }

        .otp-modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .otp-cancel-btn,
        .otp-verify-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .otp-cancel-btn {
          background: #e5e7eb;
          color: #374151;
        }

        .otp-cancel-btn:hover:not(:disabled) {
          background: #d1d5db;
        }

        .otp-verify-btn {
          background: #10b981;
          color: white;
        }

        .otp-verify-btn:hover:not(:disabled) {
          background: #059669;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .otp-verify-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Logout Confirmation Modal */
        .logout-modal-overlay {
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
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .logout-modal {
          background: white;
          border-radius: 12px;
          padding: 32px;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .logout-modal-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          color: #f59e0b;
        }

        .logout-modal-header h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
        }

        .logout-modal-message {
          margin: 0 0 24px 0;
          font-size: 14px;
          color: #6b7280;
          line-height: 1.6;
        }

        .logout-modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .logout-modal-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .cancel-btn {
          background: #e5e7eb;
          color: #374151;
        }

        .cancel-btn:hover {
          background: #d1d5db;
        }

        .confirm-btn {
          background: #ef4444;
          color: white;
        }

        .confirm-btn:hover {
          background: #dc2626;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }
        
        /* Sessions Panel */
        .sessions-panel {
          max-width: 1000px;
          margin: 0 auto;
        }

        .sessions-card {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #f0f0f0;
        }

        .sessions-card h2 {
          margin: 0 0 8px 0;
          color: #1f2937;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .sessions-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .thumbnail-upload-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 24px;
          background: #f9fafb;
          border-radius: 12px;
          border: 2px dashed #e5e7eb;
          transition: all 0.3s ease;
        }

        .thumbnail-upload-section:hover {
          border-color: #667eea;
          background: #f3f4f6;
        }

        .thumbnail-preview {
          width: 200px;
          height: 120px;
          border-radius: 8px;
          overflow: hidden;
          background: white;
          border: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .thumbnail-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .thumbnail-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #9ca3af;
        }

        .thumbnail-placeholder p {
          margin: 0;
          font-size: 13px;
          font-weight: 500;
        }

        .thumbnail-upload-label {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: #667eea;
          color: white;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .thumbnail-upload-label:hover {
          background: #5568d3;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .upload-hint {
          font-size: 12px;
          color: #9ca3af;
          margin: 0;
        }

        .badge-thresholds {
          padding: 20px;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .badge-thresholds h3 {
          margin: 0 0 16px 0;
          color: #374151;
          font-size: 16px;
          font-weight: 600;
        }

        .videos-section {
          padding: 20px;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .videos-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .videos-header h3 {
          margin: 0;
          color: #374151;
          font-size: 16px;
          font-weight: 600;
        }

        .add-video-btn {
          padding: 8px 16px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .add-video-btn:hover:not(:disabled) {
          background: #5568d3;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
        }

        .add-video-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .videos-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .video-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: white;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
        }

        .video-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: #667eea;
          color: white;
          border-radius: 50%;
          font-weight: 600;
          font-size: 14px;
          flex-shrink: 0;
        }

        .video-inputs {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }

        .video-inputs input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 13px;
          font-family: inherit;
          box-sizing: border-box;
          transition: all 0.3s ease;
        }

        .video-inputs input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.08);
        }

        .video-inputs input:disabled {
          background-color: #f3f4f6;
          cursor: not-allowed;
        }

        .remove-video-btn {
          padding: 8px 12px;
          background: #fee2e2;
          color: #dc2626;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .remove-video-btn:hover:not(:disabled) {
          background: #fecaca;
        }

        .remove-video-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .no-videos-message {
          text-align: center;
          color: #9ca3af;
          font-size: 14px;
          padding: 20px;
          margin: 0;
        }

        /* View Sessions Panel */
        .view-sessions-panel {
          max-width: 1200px;
          margin: 0 auto;
        }

        .sessions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 24px;
        }

        .session-card {
          background: white;
          border-radius: 12px;
          padding: 0;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #f0f0f0;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          height: 550px;
          overflow: hidden;
        }

        .session-card:hover {
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
          transform: translateY(-2px);
        }

        .session-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .session-header h3 {
          margin: 0 0 8px 0;
          color: white;
          font-size: 18px;
          font-weight: 700;
        }

        .session-price {
          margin: 0;
          color: rgba(255, 255, 255, 0.9);
          font-size: 16px;
          font-weight: 600;
        }

        .session-actions {
          display: flex;
          gap: 12px;
        }

        .edit-btn, .delete-btn {
          padding: 10px 16px;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .edit-btn {
          background: #3b82f6;
          color: white;
          border: 2px solid #3b82f6;
        }

        .edit-btn:hover:not(:disabled) {
          background: #2563eb;
          border-color: #2563eb;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .delete-btn {
          background: #ef4444;
          color: white;
          border: 2px solid #ef4444;
        }

        .delete-btn:hover:not(:disabled) {
          background: #dc2626;
          border-color: #dc2626;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        }

        .edit-btn:disabled, .delete-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .session-edit-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 24px;
          background: #f9fafb;
          flex: 1;
          overflow-y: auto;
          max-height: calc(550px - 80px);
        }

        .session-edit-form .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .session-edit-form label {
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .session-edit-form input {
          padding: 10px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 13px;
          font-family: inherit;
          box-sizing: border-box;
          transition: all 0.3s ease;
        }

        .session-edit-form input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.08);
        }

        .session-details {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 24px;
          flex: 1;
          overflow: hidden;
          max-height: calc(550px - 80px);
        }

        .badge-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 16px;
          background: #f3f4f6;
          border-radius: 8px;
        }

        .badge-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #374151;
          font-weight: 500;
        }

        .videos-info {
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
          overflow: hidden;
        }

        .videos-info h4 {
          margin: 0;
          color: #374151;
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .videos-list-view {
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
          overflow-y: auto;
          padding-right: 8px;
          max-height: 250px;
        }

        .videos-list-view::-webkit-scrollbar {
          width: 6px;
        }

        .videos-list-view::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 3px;
        }

        .videos-list-view::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }

        .videos-list-view::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }

        .video-item-view {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: white;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;
        }

        .video-item-view:hover {
          border-color: #667eea;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
        }

        .video-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }

        .video-number-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: #667eea;
          color: white;
          border-radius: 50%;
          font-weight: 600;
          font-size: 12px;
          flex-shrink: 0;
        }

        .video-title {
          margin: 0;
          color: #1f2937;
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .video-actions {
          display: flex;
          gap: 6px;
          flex-shrink: 0;
        }

        .play-btn {
          padding: 6px 10px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .play-btn:hover {
          background: #5568d3;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        .delete-video-btn {
          padding: 6px 8px;
          background: #fee2e2;
          color: #dc2626;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .delete-video-btn:hover:not(:disabled) {
          background: #fecaca;
          box-shadow: 0 2px 8px rgba(220, 38, 38, 0.2);
        }

        .delete-video-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .no-videos-message {
          text-align: center;
          color: #9ca3af;
          font-size: 13px;
          padding: 20px;
          margin: 0;
        }

        /* Video Overlay */
        .video-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          animation: fadeIn 0.3s ease;
        }

        .video-overlay-content {
          position: relative;
          width: 90%;
          max-width: 900px;
          aspect-ratio: 16 / 9;
          background: black;
          border-radius: 12px;
          overflow: hidden;
        }

        .video-overlay-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          font-size: 24px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          z-index: 2001;
        }

        .video-overlay-close:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .admin-sidebar {
            position: fixed;
            left: 0;
            top: 0;
            height: 100vh;
            z-index: 1000;
            transform: translateX(-100%);
          }

          .admin-sidebar.open {
            transform: translateX(0);
          }

          .sessions-grid {
            grid-template-columns: 1fr;
          }

          .video-overlay-content {
            width: 95%;
            max-width: 100%;
          }

          .session-card {
            max-height: 600px;
          }

          .session-details {
            max-height: 400px;
          }

          .videos-list-view {
            max-height: 250px;
          }

          .admin-desk-main {
            margin-left: 0;
          }

          .mobile-sidebar-toggle {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .admin-desk-header {
            padding: 16px;
          }

          .section-title {
            font-size: 20px;
          }

          .admin-desk-content {
            padding: 16px;
          }

          .profile-card {
            padding: 20px;
          }

          .profile-content {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .profile-picture-display {
            width: 150px;
            height: 150px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .add-admin-card {
            padding: 20px;
          }

          .add-admin-content {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .admin-picture-display {
            width: 150px;
            height: 150px;
          }

          .admin-desk-footer {
            left: 0;
            padding: 12px 16px;
          }

          .footer-content {
            flex-direction: column;
            gap: 8px;
            text-align: center;
          }

          .admin-desk-content {
            padding-bottom: 140px;
          }
        }

        /* Review Achievements Panel */
        .review-achievements-panel {
          max-width: 1400px;
          margin: 0 auto;
        }

        .review-header {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          margin-bottom: 24px;
          border: 1px solid #f0f0f0;
        }

        .review-controls {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .search-box:focus-within {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.08);
        }

        .search-box input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 14px;
          font-family: inherit;
          outline: none;
        }

        .search-box svg {
          color: #9ca3af;
        }

        .filter-controls {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .filter-select {
          padding: 10px 14px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 13px;
          font-family: inherit;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.08);
        }

        .report-btn {
          padding: 10px 16px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .report-btn:hover:not(:disabled) {
          background: #5568d3;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .report-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .report-button-container {
          display: flex;
          justify-content: flex-end;
          margin-top: 24px;
          padding: 0 24px;
        }

        .achievements-table {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #f0f0f0;
        }

        .achievements-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .achievements-table thead {
          background: #f9fafb;
          border-bottom: 2px solid #e5e7eb;
        }

        .achievements-table th {
          padding: 16px;
          text-align: left;
          font-size: 13px;
          font-weight: 700;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .achievements-table td {
          padding: 16px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 13px;
          color: #374151;
        }

        .achievements-table tbody tr:hover {
          background: #f9fafb;
        }

        .achievements-table tbody tr:last-child td {
          border-bottom: none;
        }

        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-badge.status-pending {
          background: #fef3c7;
          color: #92400e;
        }

        .status-badge.status-approved {
          background: #d1fae5;
          color: #065f46;
        }

        .status-badge.status-rejected {
          background: #fee2e2;
          color: #991b1b;
        }

        /* Report Modal */
        .report-modal-overlay {
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
          animation: fadeIn 0.3s ease;
        }

        .report-modal {
          background: white;
          border-radius: 12px;
          padding: 0;
          max-width: 500px;
          width: 90%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease;
        }

        .report-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .report-modal-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
        }

        .report-modal-close {
          background: none;
          border: none;
          font-size: 24px;
          color: #9ca3af;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .report-modal-close:hover {
          color: #1f2937;
        }

        .report-modal-content {
          padding: 24px;
        }

        .report-modal-content p {
          margin: 0 0 20px 0;
          color: #6b7280;
          font-size: 14px;
          line-height: 1.6;
        }

        .report-summary {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 8px;
          margin-bottom: 24px;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
        }

        .summary-label {
          color: #6b7280;
          font-weight: 600;
        }

        .summary-value {
          color: #1f2937;
          font-weight: 700;
        }

        .report-modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          padding: 24px;
          border-top: 1px solid #e5e7eb;
        }

        .btn-cancel {
          padding: 10px 20px;
          background: #e5e7eb;
          color: #374151;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-cancel:hover {
          background: #d1d5db;
        }

        .btn-download {
          padding: 10px 20px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-download:hover {
          background: #5568d3;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

