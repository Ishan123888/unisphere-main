"use client";

import "../portfolio.css";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Toast from "../../../components/Toast";
import { useToast } from "../../../hooks/useToast";

export default function StudentSessionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("id");
  const { toasts, removeToast, toast } = useToast();

  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [showVideoOverlay, setShowVideoOverlay] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState("");
  const [viewMode, setViewMode] = useState("list"); // "list" or "detail"
  const [currentStudentId, setCurrentStudentId] = useState(null);
  const [showPaymentOverlay, setShowPaymentOverlay] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paidSessions, setPaidSessions] = useState(new Set());
  const [videoPlayCount, setVideoPlayCount] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState({});
  const [showBadgeNotification, setShowBadgeNotification] = useState(false);
  const [newBadgeInfo, setNewBadgeInfo] = useState(null);
  const [studentName, setStudentName] = useState("Student");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [sessionVideoCounts, setSessionVideoCounts] = useState({});
  const [watchedVideoIds, setWatchedVideoIds] = useState(new Set()); // uploaded video IDs watched to end
  const [currentPlayingVideoId, setCurrentPlayingVideoId] = useState(null);
  const [currentPlayingIsUploaded, setCurrentPlayingIsUploaded] = useState(false);

  // Exam state
  const [examQuestions, setExamQuestions] = useState([]);
  const [examTimeLimit, setExamTimeLimit] = useState(0);
  const [showExamConfirm, setShowExamConfirm] = useState(false);
  const [examMode, setExamMode] = useState(false); // "exam" view
  const [examAnswers, setExamAnswers] = useState({});
  const [examTimeLeft, setExamTimeLeft] = useState(0);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examResult, setExamResult] = useState(null); // { score, total, percent, passed }
  const [examLoading, setExamLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [priorQuizResult, setPriorQuizResult] = useState(null); // already attempted

  useEffect(() => {
    // Get student ID from session storage
    const studentId = sessionStorage.getItem("currentStudentId");
    const name = sessionStorage.getItem("studentName");
    if (studentId) {
      setCurrentStudentId(parseInt(studentId));
    }
    if (name) {
      setStudentName(name);
    }

    loadSessions();
  }, [router]);

  useEffect(() => {
    if (currentStudentId) {
      loadAllPaidSessions();
    }
  }, [currentStudentId]);

  const loadAllPaidSessions = async () => {
    if (!currentStudentId) return;
    try {
      const { getAllPaidSessions } = await import("../../../lib/api");
      const paidSessionIds = await getAllPaidSessions(currentStudentId);
      if (Array.isArray(paidSessionIds)) {
        setPaidSessions(new Set(paidSessionIds));
      }
    } catch (error) {
      console.error("Error loading paid sessions:", error);
    }
  };

  useEffect(() => {
    if (sessionId && sessions.length > 0) {
      const session = sessions.find(s => s.id === parseInt(sessionId));
      if (session) {
        setSelectedSession(session);
        setViewMode("detail");
        checkPaymentStatus(session.id);
        loadBadgeInfo(session.id);
        loadUploadedVideos(session.id);
        if (currentStudentId) checkPriorQuizAttempt(session.id);
      }
    }
  }, [sessionId, sessions]);

  // Scroll to top when viewMode changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [viewMode]);

  const checkPaymentStatus = async (sessionId) => {
    if (!currentStudentId) return;
    try {
      const { checkSessionPayment } = await import("../../../lib/api");
      const isPaid = await checkSessionPayment(currentStudentId, sessionId);
      if (isPaid) {
        setPaidSessions(prev => new Set([...prev, sessionId]));
      }
    } catch (error) {
      console.error("Check payment error:", error);
    }
  };

  const loadSessions = async () => {
    try {
      setSessionsLoading(true);
      const { getAllSessions } = await import("../../../lib/api");
      const data = await getAllSessions();
      // Handle both wrapped and unwrapped responses
      const sessions = Array.isArray(data) ? data : (data.data || []);
      setSessions(sessions);
      
      // Load video counts for all sessions
      loadAllSessionVideoCounts(sessions);
    } catch (error) {
      console.error("Load sessions error:", error);
      toast.error("Error", "Failed to load sessions");
    } finally {
      setSessionsLoading(false);
    }
  };

  const loadAllSessionVideoCounts = async (sessionsList) => {
    try {
      const { getSessionVideoFiles } = await import("../../../lib/api");
      const counts = {};
      
      for (const session of sessionsList) {
        try {
          const videos = await getSessionVideoFiles(session.id);
          counts[session.id] = Array.isArray(videos) ? videos.length : 0;
        } catch (error) {
          counts[session.id] = 0;
        }
      }
      
      setSessionVideoCounts(counts);
    } catch (error) {
      console.error("Error loading video counts:", error);
    }
  };

  const handleSessionClick = (session) => {
    setSelectedSession(session);
    setViewMode("detail");
    setPriorQuizResult(null);
    setWatchedVideoIds(new Set());
    loadUploadedVideos(session.id);
    if (currentStudentId) checkPriorQuizAttempt(session.id);
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedSession(null);
  };

  const handlePlayVideo = (videoUrl, videoId, isUploadedVideo = false) => {
    if (!currentStudentId || !selectedSession) return;

    // For YouTube videos, record play immediately on click
    if (!isUploadedVideo) {
      recordVideoPlayAndCheckBadge(videoId);
    }

    setCurrentPlayingVideoId(videoId);
    setCurrentPlayingIsUploaded(isUploadedVideo);
    setSelectedVideoUrl(videoUrl);
    setShowVideoOverlay(true);
  };

  // Called when an uploaded video finishes playing
  const handleUploadedVideoEnded = async (videoId) => {
    if (watchedVideoIds.has(videoId)) return; // already counted
    // Persist to backend and get badge result
    try {
      const { markVideoWatched } = await import("../../../lib/api");
      const result = await markVideoWatched(videoId, currentStudentId);

      // Update local state
      setWatchedVideoIds(prev => new Set([...prev, videoId]));
      const newCount = (result.watchCount !== undefined) ? Number(result.watchCount) : videoPlayCount + 1;
      setVideoPlayCount(newCount);

      // Check badge from response
      const badge = result.badgeEarned;
      if (badge && badge !== earnedBadges[selectedSession?.id]) {
        const badgeMap = { GOLD: { icon: "🥇", name: "Gold Badge" }, SILVER: { icon: "🥈", name: "Silver Badge" }, BRONZE: { icon: "🥉", name: "Bronze Badge" } };
        setEarnedBadges(prev => ({ ...prev, [selectedSession.id]: badge }));
        setNewBadgeInfo({ badge, icon: badgeMap[badge]?.icon, name: badgeMap[badge]?.name, count: newCount });
        setShowBadgeNotification(true);
        setTimeout(() => setShowBadgeNotification(false), 4000);
      }
    } catch (e) {
      // Still update local state even if backend fails
      setWatchedVideoIds(prev => new Set([...prev, videoId]));
      setVideoPlayCount(prev => prev + 1);
    }
  };

  const recordVideoPlayAndCheckBadge = async (videoId) => {
    try {
      const { recordVideoPlay } = await import("../../../lib/api");
      const result = await recordVideoPlay(currentStudentId, selectedSession.id, videoId);
      
      if (result.data) {
        const { videoPlayCount: newCount, badgeEarned, isNewBadge, badgeIcon, badgeName } = result.data;
        
        // Update play count
        setVideoPlayCount(newCount);
        
        // Show badge notification if new badge earned
        if (isNewBadge && badgeEarned) {
          setNewBadgeInfo({
            badge: badgeEarned,
            icon: badgeIcon,
            name: badgeName,
            count: newCount
          });
          setShowBadgeNotification(true);
          
          // Update earned badges
          setEarnedBadges(prev => ({
            ...prev,
            [selectedSession.id]: badgeEarned
          }));
          
          // Auto-hide notification after 3 seconds
          setTimeout(() => setShowBadgeNotification(false), 3000);
        }
      }
    } catch (error) {
      console.error("Error recording video play:", error);
    }
  };

  const loadBadgeInfo = async (sessionId) => {
    if (!currentStudentId) return;
    try {
      const { getVideoPlayCount, getEarnedBadge, getWatchedVideoIds } = await import("../../../lib/api");

      // Use whichever count is higher: YouTube plays or uploaded video watches
      const [countResult, watchedIds] = await Promise.all([
        getVideoPlayCount(currentStudentId, sessionId),
        getWatchedVideoIds(sessionId, currentStudentId).catch(() => [])
      ]);

      const youtubeCount = countResult.playCount || 0;
      const watchCount = Array.isArray(watchedIds) ? watchedIds.length : 0;
      const totalCount = Math.max(youtubeCount, watchCount);
      setVideoPlayCount(totalCount);

      const badgeResult = await getEarnedBadge(currentStudentId, sessionId);
      if (badgeResult.badge) {
        setEarnedBadges(prev => ({ ...prev, [sessionId]: badgeResult.badge }));
      }
    } catch (error) {
      console.error("Error loading badge info:", error);
    }
  };

  const loadUploadedVideos = async (sessionId) => {
    try {
      const { getSessionVideoFiles, getWatchedVideoIds } = await import("../../../lib/api");
      const [videos, watchedIds] = await Promise.all([
        getSessionVideoFiles(sessionId),
        currentStudentId ? getWatchedVideoIds(sessionId, currentStudentId).catch(() => []) : Promise.resolve([])
      ]);
      setUploadedVideos(Array.isArray(videos) ? videos : []);
      setWatchedVideoIds(new Set(Array.isArray(watchedIds) ? watchedIds : []));
    } catch (error) {
      console.error("Error loading uploaded videos:", error);
      setUploadedVideos([]);
    }
  };

  const checkPriorQuizAttempt = async (sessionId) => {
    if (!currentStudentId) return;
    try {
      const { checkQuizAttempt } = await import("../../../lib/api");
      const data = await checkQuizAttempt(sessionId, currentStudentId);
      if (data.attempted) {
        setPriorQuizResult(data);
      } else {
        setPriorQuizResult(null);
      }
    } catch (error) {
      setPriorQuizResult(null);
    }
  };

  const handlePaymentClick = async () => {
    if (!currentStudentId || !selectedSession) {
      toast.error("Error", "Missing student or session information");
      return;
    }

    try {
      setPaymentLoading(true);
      const { initiateSessionPayment } = await import("../../../lib/api");
      
      const paymentData = {
        studentId: currentStudentId,
        sessionId: selectedSession.id
      };

      const result = await initiateSessionPayment(paymentData);
      
      // Store payment info in localStorage for DirectPay
      localStorage.setItem("dp_payload", result.encodedPayload);
      localStorage.setItem("dp_signature", result.signature);
      localStorage.setItem("dp_orderId", result.orderId);
      localStorage.setItem("studentID", currentStudentId);
      localStorage.setItem("sessionID", selectedSession.id);

      // Load DirectPay script
      const script = document.createElement("script");
      script.src = "https://cdn.directpay.lk/v3/directpayipg.min.js";
      script.onload = () => {
        const dp = new window.DirectPayIpg.Init({
          signature: result.signature,
          dataString: result.encodedPayload,
          stage: "PROD",
          container: "payment_container",
        });
        dp.doInContainerCheckout()
          .then((data) => {
            console.log("Payment Success:", data);
            completePayment(result.orderId, data.transactionId);
          })
          .catch((error) => {
            console.error("Payment Error:", error);
            setPaymentLoading(false);
            setShowPaymentOverlay(false);
            toast.error("Error", "Payment failed. Please try again.");
          });
      };
      script.onerror = () => {
        setPaymentLoading(false);
        toast.error("Error", "Failed to load payment gateway");
      };
      document.body.appendChild(script);
    } catch (error) {
      console.error("Payment initiation error:", error);
      setPaymentLoading(false);
      toast.error("Error", error.message || "Failed to initiate payment");
    }
  };

  const completePayment = async (orderId, transactionId) => {
    try {
      const { completeSessionPayment } = await import("../../../lib/api");
      await completeSessionPayment(orderId, transactionId);
      
      // Payment successful - unlock videos
      setPaidSessions(prev => new Set([...prev, selectedSession.id]));
      setShowPaymentOverlay(false);
      setPaymentLoading(false);
      
      toast.success("Success", "Payment completed! Videos are now unlocked.");
    } catch (error) {
      console.error("Complete payment error:", error);
      // Payment failed - close overlay but don't unlock
      setShowPaymentOverlay(false);
      setPaymentLoading(false);
      toast.error("Error", "Payment verification failed. Please contact support.");
    }
  };

  const extractYoutubeId = (url) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const handleStartExamClick = async () => {
    if (!selectedSession) return;
    // Block if already attempted
    if (priorQuizResult) return;
    setExamLoading(true);
    try {
      const { getSessionQuestions, getSessionTimeLimit } = await import("../../../lib/api");
      const [questions, timeLimitData] = await Promise.all([
        getSessionQuestions(selectedSession.id),
        getSessionTimeLimit(selectedSession.id)
      ]);
      setExamQuestions(Array.isArray(questions) ? questions : []);
      setExamTimeLimit(timeLimitData.timeLimitMinutes || 0);
      setShowExamConfirm(true);
    } catch (error) {
      toast.error("Error", "Failed to load exam");
    } finally {
      setExamLoading(false);
    }
  };

  const handleConfirmStartExam = () => {
    setShowExamConfirm(false);
    setExamAnswers({});
    setExamSubmitted(false);
    setExamResult(null);
    setCurrentQuestionIndex(0);
    setExamTimeLeft(examTimeLimit * 60);
    setExamMode(true);
    window.scrollTo(0, 0);
  };

  const handleExamAnswer = (questionId, answer) => {
    setExamAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitExam = async () => {
    let correct = 0;
    examQuestions.forEach(q => {
      if (examAnswers[q.id] === q.correctAnswer) correct++;
    });
    const total = examQuestions.length;
    const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
    const passed = percent >= 80;
    setExamResult({ score: correct, total, percent, passed });
    setExamSubmitted(true);

    // Save to backend and fetch real student name
    if (currentStudentId && selectedSession) {
      try {
        const { submitQuizResult } = await import("../../../lib/api");
        await submitQuizResult(selectedSession.id, currentStudentId, correct, total);
      } catch (error) {
        // "Quiz already attempted" is fine — result already stored, just continue
        if (!error.message?.includes("already attempted")) {
          console.error("Failed to save quiz result:", error);
        }
      }
      setPriorQuizResult({ attempted: true, score: correct, totalQuestions: total, percentage: percent, passed });
      // Fetch real name separately - don't block if it fails
      try {
        const { getStudentById } = await import("../../../lib/api");
        const studentData = await getStudentById(currentStudentId);
        if (studentData?.fullName) setStudentName(studentData.fullName);
      } catch (e) {
        // keep existing studentName
      }
    }
  };

  // Countdown timer effect
  useEffect(() => {
    if (!examMode || examSubmitted || examTimeLeft <= 0) return;
    if (examTimeLeft === 0 && !examSubmitted) { handleSubmitExam(); return; }
    const timer = setInterval(() => {
      setExamTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); handleSubmitExam(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [examMode, examSubmitted, examTimeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleDownloadCertificate = async () => {
    const certName = studentName;
    // High-res portrait: 2480 x 3508 (A4 @ 300dpi equivalent scaled to 1240x1754)
    const W = 1240, H = 1754;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    ctx.textAlign = "center";

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);

    // ── Navy wave (largest, back) ──
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(0, H * 0.54);
    ctx.bezierCurveTo(W * 0.10, H * 0.52, W * 0.28, H * 0.60, W * 0.44, H * 0.68);
    ctx.bezierCurveTo(W * 0.62, H * 0.77, W * 0.66, H * 0.86, W * 0.50, H * 0.93);
    ctx.bezierCurveTo(W * 0.36, H * 0.99, W * 0.14, H, 0, H);
    ctx.closePath();
    ctx.fillStyle = "#1a1f2e";
    ctx.fill();

    // ── Red wave (middle) ──
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(0, H * 0.62);
    ctx.bezierCurveTo(W * 0.12, H * 0.60, W * 0.32, H * 0.68, W * 0.50, H * 0.76);
    ctx.bezierCurveTo(W * 0.68, H * 0.85, W * 0.72, H * 0.92, W * 0.58, H * 0.97);
    ctx.bezierCurveTo(W * 0.42, H * 1.02, W * 0.18, H, 0, H);
    ctx.closePath();
    ctx.fillStyle = "#c0392b";
    ctx.fill();

    // ── Light grey wave (front) ──
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(0, H * 0.70);
    ctx.bezierCurveTo(W * 0.14, H * 0.68, W * 0.36, H * 0.76, W * 0.54, H * 0.84);
    ctx.bezierCurveTo(W * 0.70, H * 0.91, W * 0.74, H * 0.97, W * 0.60, H * 1.01);
    ctx.bezierCurveTo(W * 0.44, H * 1.05, W * 0.20, H, 0, H);
    ctx.closePath();
    ctx.fillStyle = "rgba(200,200,200,0.28)";
    ctx.fill();

    // ── Outer border ──
    ctx.strokeStyle = "#d1d5db";
    ctx.lineWidth = 5;
    ctx.strokeRect(28, 28, W - 56, H - 56);

    // ── Inner border (white area) ──
    ctx.strokeStyle = "#e9ecef";
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 50, W - 100, H * 0.50 - 10);

    // ── Logo circle ──
    const lx = W / 2, ly = 130, lr = 52;
    const lg = ctx.createLinearGradient(lx - lr, ly - lr, lx + lr, ly + lr);
    lg.addColorStop(0, "#667eea"); lg.addColorStop(1, "#764ba2");
    ctx.beginPath(); ctx.arc(lx, ly, lr, 0, Math.PI * 2);
    ctx.fillStyle = lg; ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 48px Arial";
    ctx.textBaseline = "middle";
    ctx.fillText("U", lx, ly + 2);
    ctx.textBaseline = "alphabetic";

    // ── UniSphere label ──
    ctx.fillStyle = "#9ca3af";
    ctx.font = "500 26px Arial";
    ctx.fillText("UniSphere", W / 2, 228);

    // ── Thin rule ──
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(W * 0.28, 252); ctx.lineTo(W * 0.72, 252); ctx.stroke();

    // ── CERTIFICATE ──
    ctx.fillStyle = "#1a1f2e";
    ctx.font = "bold 100px Georgia";
    ctx.fillText("CERTIFICATE", W / 2, 390);

    // ── of Excellence ──
    ctx.fillStyle = "#374151";
    ctx.font = "italic 68px Georgia";
    ctx.fillText("of Excellence", W / 2, 478);

    // ── Rule ──
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(W * 0.18, 510); ctx.lineTo(W * 0.82, 510); ctx.stroke();

    // ── "This certificate is awarded to" ──
    ctx.fillStyle = "#6b7280";
    ctx.font = "30px Georgia";
    ctx.fillText("This certificate is awarded to", W / 2, 590);

    // ── Recipient name ──
    ctx.fillStyle = "#c0392b";
    ctx.font = "italic bold 76px Georgia";
    ctx.fillText(certName, W / 2, 690);
    const nw = ctx.measureText(certName).width;
    ctx.strokeStyle = "#c0392b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - nw / 2, 706);
    ctx.lineTo(W / 2 + nw / 2, 706);
    ctx.stroke();

    // ── Body text ──
    ctx.fillStyle = "#4b5563";
    ctx.font = "28px Georgia";
    ctx.fillText("for successfully completing the assessment for", W / 2, 778);

    ctx.fillStyle = "#1a1f2e";
    ctx.font = "bold 38px Georgia";
    ctx.fillText(selectedSession?.sessionName || "Training Session", W / 2, 836);

    ctx.fillStyle = "#6b7280";
    ctx.font = "26px Arial";
    ctx.fillText(`Score: ${examResult?.score} / ${examResult?.total}  ·  ${examResult?.percent}%`, W / 2, 892);

    // ── Place & Date ──
    ctx.font = "24px Arial";
    ctx.fillStyle = "#9ca3af";
    ctx.textAlign = "left";
    ctx.fillText("UniSphere Platform", W * 0.20, 958);
    ctx.textAlign = "right";
    ctx.fillText(new Date().toLocaleDateString("en-GB"), W * 0.80, 958);
    ctx.textAlign = "center";

    // ── Signature line ──
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(W * 0.54, H * 0.595); ctx.lineTo(W * 0.82, H * 0.595); ctx.stroke();
    // Squiggle
    ctx.strokeStyle = "#374151"; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W * 0.60, H * 0.590);
    ctx.bezierCurveTo(W * 0.62, H * 0.572, W * 0.65, H * 0.570, W * 0.67, H * 0.582);
    ctx.bezierCurveTo(W * 0.69, H * 0.594, W * 0.72, H * 0.584, W * 0.73, H * 0.574);
    ctx.stroke();
    ctx.fillStyle = "#374151";
    ctx.font = "24px Arial";
    ctx.fillText("UniSphere Director", W * 0.68, H * 0.595 + 36);

    // ── Gold badge ──
    const bx = W * 0.155, by = H * 0.875, br = 88;
    // Starburst
    ctx.strokeStyle = "#d4a017"; ctx.lineWidth = 3;
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI * 2) / 16;
      ctx.beginPath();
      ctx.moveTo(bx + Math.cos(a) * (br + 4), by + Math.sin(a) * (br + 4));
      ctx.lineTo(bx + Math.cos(a) * (br + 18), by + Math.sin(a) * (br + 18));
      ctx.stroke();
    }
    const gg = ctx.createRadialGradient(bx - 20, by - 20, 10, bx, by, br);
    gg.addColorStop(0, "#ffe066"); gg.addColorStop(0.45, "#d4a017"); gg.addColorStop(1, "#8a6000");
    ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.fillStyle = gg; ctx.fill();
    ctx.beginPath(); ctx.arc(bx, by, br * 0.78, 0, Math.PI * 2); ctx.fillStyle = "#c8900a"; ctx.fill();
    ctx.beginPath(); ctx.arc(bx, by, br * 0.70, 0, Math.PI * 2); ctx.fillStyle = "#f0c030"; ctx.fill();
    ctx.fillStyle = "#5a3a00";
    ctx.font = "bold 22px Arial";
    ctx.fillText("BEST", bx, by - 10);
    ctx.fillText("AWARD", bx, by + 16);

    // ── Certificate ID ──
    const certId = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    ctx.fillStyle = "rgba(255,255,255,0.50)";
    ctx.font = "20px Arial";
    ctx.fillText(`Certificate ID: ${certId}`, W * 0.60, H - 48);

    const link = document.createElement("a");
    link.download = `UniSphere-Certificate-${certName.replace(/\s+/g, "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="portfolio-root student-sessions-page">
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Navigation Bar */}
      <nav className="sessions-navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <h2>UniSphere</h2>
          </div>
          <div className="navbar-menu">
            <button 
              className="navbar-link"
              onClick={() => router.push("/portfolio")}
            >
              My Portfolio
            </button>
            <button 
              className="navbar-link active"
              onClick={() => router.push("/student-sessions")}
            >
              Training Sessions
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

      {viewMode === "list" ? (
        <>
          <div className="sessions-header">
            <div className="header-content">
              <h1>Training Sessions</h1>
              <p>Explore our comprehensive training sessions and enhance your skills</p>
              <div className="header-instructions">
                <div className="instruction-item">
                  <svg className="instruction-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                  <span>Pay to unlock sessions</span>
                </div>
                <div className="instruction-item">
                  <svg className="instruction-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                  <span>Watch videos to earn badges</span>
                </div>
                <div className="instruction-item">
                  <svg className="instruction-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                  </svg>
                  <span>Collect badges by reaching thresholds</span>
                </div>
              </div>
            </div>
          </div>

          {sessionsLoading ? (
            <div className="loading-container">
              <p>Loading sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="empty-container">
              <p>No sessions available at the moment.</p>
            </div>
          ) : (
            <div className="sessions-grid">
              {sessions.map((session) => (
                <div key={session.id} className="session-card">
                  {session.thumbnail && (
                    <div className="session-thumbnail">
                      <img src={session.thumbnail} alt={session.sessionName} />
                    </div>
                  )}
                  <div className="session-info">
                    <h3 className="session-name">{session.sessionName}</h3>
                    <div className="session-meta">
                      <span className="session-price">Rs {session.price}</span>
                      <span className="session-videos">{sessionVideoCounts[session.id] || 0} videos</span>
                    </div>
                    <div className="session-badges">
                      <div className="badge-row">
                        <div className="badge-item-inline">
                          <span>🥉 Bronze: {session.bronzeBadgeThreshold}</span>
                        </div>
                        <div className="badge-item-inline">
                          <span>🥈 Silver: {session.silverBadgeThreshold}</span>
                        </div>
                        <div className="badge-item-inline">
                          <span>🥇 Gold: {session.goldBadgeThreshold}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      className="view-btn"
                      onClick={() => handleSessionClick(session)}
                    >
                      View Videos
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="session-detail-header">
            <button className="back-btn" onClick={handleBackToList}>
              ← Back to Sessions
            </button>
            <h1>{selectedSession?.sessionName}</h1>
          </div>

          <div className="session-detail-content">
            <div className="videos-section">
              <div className="videos-header">
                <h2>Videos ({uploadedVideos.length > 0 ? uploadedVideos.length : (selectedSession?.videos?.length || 0)})</h2>
                {!paidSessions.has(selectedSession?.id) && (
                  <button
                    className="pay-btn"
                    onClick={() => setShowPaymentOverlay(true)}
                    disabled={paymentLoading}
                  >
                    🔒 Pay Rs {selectedSession?.price} to Unlock
                  </button>
                )}
              </div>
              {uploadedVideos.length > 0 ? (
                <div className="videos-list">
                  {uploadedVideos.map((video, index) => {
                    const isWatched = watchedVideoIds.has(video.id);
                    const isPaid = paidSessions.has(selectedSession?.id);
                    return (
                      <div key={video.id} className={`video-item ${!isPaid ? 'locked' : ''} ${isWatched ? 'watched' : ''}`}>
                        <div className="video-number" style={{ background: isWatched ? "linear-gradient(135deg,#22c55e,#16a34a)" : undefined }}>
                          {isWatched ? "✓" : index + 1}
                        </div>
                        <div className="video-details">
                          <h4>{video.title}</h4>
                          <p className="video-url">{video.subtitle}</p>
                          {isWatched && <span style={{ fontSize: "11px", color: "#22c55e", fontWeight: 600 }}>Watched</span>}
                        </div>
                        <button
                          className="play-btn"
                          onClick={() => handlePlayVideo(`http://localhost:8084/${video.filePath}`, video.id, true)}
                          disabled={!isPaid || isWatched}
                          style={isWatched ? { background: "#e5e7eb", color: "#9ca3af", cursor: "not-allowed" } : undefined}
                        >
                          {!isPaid ? "🔒 Locked" : isWatched ? "✓ Watched" : "▶ Play"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : selectedSession?.videos && selectedSession.videos.length > 0 ? (
                <div className="videos-list">
                  {selectedSession.videos.map((video, index) => (
                    <div key={video.id || index} className={`video-item ${!paidSessions.has(selectedSession?.id) ? 'locked' : ''}`}>
                      <div className="video-number">{index + 1}</div>
                      <div className="video-details">
                        <h4>{video.title}</h4>
                        <p className="video-url">{video.youtubeUrl}</p>
                      </div>
                      <button
                        className="play-btn"
                        onClick={() => handlePlayVideo(video.youtubeUrl, video.id)}
                        disabled={!paidSessions.has(selectedSession?.id)}
                      >
                        {paidSessions.has(selectedSession?.id) ? "▶ Play" : "🔒 Locked"}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-videos">No videos in this session.</p>
              )}
            </div>

            <div className="session-info-sidebar">
              <div className="info-card">
                <h3>Session Details</h3>
                <div className="info-item">
                  <span className="label">Price:</span>
                  <span className="value">Rs {selectedSession?.price}</span>
                </div>
                <div className="info-item">
                  <span className="label">Total Videos:</span>
                  <span className="value">{uploadedVideos.length > 0 ? uploadedVideos.length : (selectedSession?.videos?.length || 0)}</span>
                </div>
                <div className="info-item">
                  <span className="label">Status:</span>
                  <span className={`value ${paidSessions.has(selectedSession?.id) ? 'paid' : 'unpaid'}`}>
                    {paidSessions.has(selectedSession?.id) ? "✓ Unlocked" : "🔒 Locked"}
                  </span>
                </div>
              </div>

              <div className="info-card">
                <h3>Your Progress</h3>
                <div className="progress-info">
                  <div className="progress-item">
                    <span className="label">Videos Played:</span>
                    <span className="value">{videoPlayCount}</span>
                  </div>
                  {earnedBadges[selectedSession?.id] && (
                    <div className="earned-badge">
                      <span className="badge-earned-icon">
                        {earnedBadges[selectedSession?.id] === 'GOLD' && '🥇'}
                        {earnedBadges[selectedSession?.id] === 'SILVER' && '🥈'}
                        {earnedBadges[selectedSession?.id] === 'BRONZE' && '🥉'}
                      </span>
                      <span className="badge-earned-text">
                        {earnedBadges[selectedSession?.id]} Badge Earned!
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="info-card">
                <h3>Badge Thresholds</h3>
                <div className="badge-info">
                  <div className="badge-item">
                    <span>🥉 Bronze: {selectedSession?.bronzeBadgeThreshold}</span>
                  </div>
                  <div className="badge-item">
                    <span>🥈 Silver: {selectedSession?.silverBadgeThreshold}</span>
                  </div>
                  <div className="badge-item">
                    <span>🥇 Gold: {selectedSession?.goldBadgeThreshold}</span>
                  </div>
                </div>
              </div>

              <div className="info-card">
                <h3>Session Exam</h3>
                {priorQuizResult ? (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ padding: "12px", background: priorQuizResult.passed ? "linear-gradient(135deg, rgba(102,126,234,0.08), rgba(118,75,162,0.08))" : "#fef2f2", border: `1px solid ${priorQuizResult.passed ? "#c4b5fd" : "#fecaca"}`, borderRadius: "10px", marginBottom: "10px" }}>
                      <p style={{ margin: "0 0 2px", fontSize: "24px", fontWeight: 800, background: priorQuizResult.passed ? "linear-gradient(135deg, #667eea, #764ba2)" : "none", WebkitBackgroundClip: priorQuizResult.passed ? "text" : "unset", WebkitTextFillColor: priorQuizResult.passed ? "transparent" : "#dc2626" }}>
                        {priorQuizResult.percentage}%
                      </p>
                      <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
                        {priorQuizResult.score}/{priorQuizResult.totalQuestions} correct
                      </p>
                    </div>
                    <p style={{ fontSize: "12px", color: priorQuizResult.passed ? "#667eea" : "#dc2626", fontWeight: 600, margin: "0 0 8px" }}>
                      {priorQuizResult.passed ? "✓ Passed — Certificate Earned" : "✗ Did not pass"}
                    </p>
                    <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>This is a one-time exam. No retakes allowed.</p>
                  </div>
                ) : (
                  <>
                    {(() => {
                      const isPaid = paidSessions.has(selectedSession?.id);
                      const totalVideos = uploadedVideos.length;
                      const allWatched = totalVideos > 0 && watchedVideoIds.size >= totalVideos;
                      const canTakeExam = isPaid && allWatched;
                      const remaining = totalVideos - watchedVideoIds.size;

                      return (
                        <>
                          <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 12px 0" }}>
                            Test your knowledge and earn a certificate if you score 80% or above.
                          </p>

                          {!isPaid && (
                            <div style={{ padding: "10px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", marginBottom: "10px" }}>
                              <p style={{ margin: 0, fontSize: "12px", color: "#dc2626", fontWeight: 600 }}>Unlock session to take exam</p>
                            </div>
                          )}

                          {isPaid && !allWatched && totalVideos > 0 && (
                            <div style={{ padding: "10px 12px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", marginBottom: "10px" }}>
                              <p style={{ margin: 0, fontSize: "12px", color: "#92400e", fontWeight: 600 }}>
                                Watch all videos first — {remaining} video{remaining !== 1 ? "s" : ""} remaining
                              </p>
                            </div>
                          )}

                          <button
                            className="pay-btn"
                            style={{ width: "100%", background: canTakeExam ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "#e5e7eb", color: canTakeExam ? "#fff" : "#9ca3af", cursor: canTakeExam ? "pointer" : "not-allowed" }}
                            onClick={handleStartExamClick}
                            disabled={examLoading || !canTakeExam}
                          >
                            {examLoading ? "Loading..." : "Take Exam"}
                          </button>
                        </>
                      );
                    })()}
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Exam Confirm Overlay */}
      {showExamConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(17,24,39,0.7)", backdropFilter: "blur(6px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ background: "#fff", borderRadius: "24px", width: "100%", maxWidth: "500px", overflow: "hidden", boxShadow: "0 32px 80px rgba(102,126,234,0.25)" }}>

            {/* Modal Header */}
            <div style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "32px 32px 28px", position: "relative", textAlign: "center" }}>
              <button onClick={() => setShowExamConfirm(false)} style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", color: "#fff", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <h2 style={{ margin: "0 0 6px", color: "#fff", fontSize: "22px", fontWeight: 800 }}>Ready to Start?</h2>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.8)", fontSize: "14px" }}>{selectedSession?.sessionName}</p>
            </div>

            {/* Stats Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "#e5e7eb" }}>
              <div style={{ background: "#f9fafb", padding: "18px", textAlign: "center" }}>
                <p style={{ margin: "0 0 4px", fontSize: "26px", fontWeight: 800, background: "linear-gradient(135deg, #667eea, #764ba2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{examQuestions.length}</p>
                <p style={{ margin: 0, fontSize: "12px", color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Questions</p>
              </div>
              <div style={{ background: "#f9fafb", padding: "18px", textAlign: "center" }}>
                <p style={{ margin: "0 0 4px", fontSize: "26px", fontWeight: 800, background: "linear-gradient(135deg, #667eea, #764ba2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {examTimeLimit > 0 ? `${examTimeLimit}m` : "∞"}
                </p>
                <p style={{ margin: 0, fontSize: "12px", color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Time Limit</p>
              </div>
            </div>

            {/* Instructions */}
            <div style={{ padding: "24px 28px" }}>
              <p style={{ margin: "0 0 14px", fontWeight: 700, fontSize: "13px", color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em" }}>Instructions</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  {
                    svg: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
                    text: "Each question has 4 options — select the best answer"
                  },
                  {
                    svg: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
                    text: "Score 80% or above to earn a certificate"
                  },
                  {
                    svg: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
                    text: examTimeLimit > 0 ? "Exam auto-submits when time runs out" : "No time limit — take your time"
                  },
                  {
                    svg: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
                    text: "You cannot pause once the exam starts"
                  },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "10px 14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e5e7eb" }}>
                    <span style={{ flexShrink: 0, marginTop: "2px" }}>{item.svg}</span>
                    <span style={{ fontSize: "13px", color: "#4b5563", lineHeight: 1.5 }}>{item.text}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "20px" }}>
                {examQuestions.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "12px", background: "#fef2f2", borderRadius: "10px", border: "1px solid #fecaca" }}>
                    <p style={{ margin: 0, color: "#dc2626", fontSize: "14px", fontWeight: 600 }}>No questions available for this session yet.</p>
                  </div>
                ) : (
                  <button onClick={handleConfirmStartExam} style={{ width: "100%", padding: "15px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "#fff", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(102,126,234,0.4)", letterSpacing: "0.02em" }}>
                    Start Exam →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exam Mode View */}
      {examMode && !examSubmitted && (() => {
        const q = examQuestions[currentQuestionIndex];
        const total = examQuestions.length;
        const answered = Object.keys(examAnswers).length;
        const progress = Math.round(((currentQuestionIndex + 1) / total) * 100);
        const isLast = currentQuestionIndex === total - 1;
        const isFirst = currentQuestionIndex === 0;
        const timerDanger = examTimeLimit > 0 && examTimeLeft < 60;
        const timerWarn = examTimeLimit > 0 && examTimeLeft < 180;

        return (
          <div style={{ position: "fixed", inset: 0, background: "#f8fafc", zIndex: 1000, display: "flex", flexDirection: "column" }}>

            {/* Top Bar */}
            <div style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "0 28px", height: "68px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, boxShadow: "0 2px 12px rgba(102,126,234,0.3)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                  </svg>
                </div>
                <div>
                  <p style={{ margin: 0, color: "rgba(255,255,255,0.75)", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase" }}>Assessment</p>
                  <p style={{ margin: 0, color: "#fff", fontWeight: 700, fontSize: "15px" }}>{selectedSession?.sessionName}</p>
                </div>
              </div>

              {/* Timer */}
              {examTimeLimit > 0 && (
                <div style={{
                  display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px",
                  background: timerDanger ? "rgba(239,68,68,0.25)" : timerWarn ? "rgba(251,146,60,0.2)" : "rgba(255,255,255,0.15)",
                  border: `1px solid ${timerDanger ? "rgba(239,68,68,0.6)" : timerWarn ? "rgba(251,146,60,0.5)" : "rgba(255,255,255,0.3)"}`,
                  borderRadius: "10px", backdropFilter: "blur(4px)"
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={timerDanger ? "#fca5a5" : timerWarn ? "#fdba74" : "white"} strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span style={{ fontWeight: 800, fontSize: "19px", fontFamily: "monospace", color: timerDanger ? "#fca5a5" : timerWarn ? "#fdba74" : "#fff", letterSpacing: "0.05em" }}>
                    {formatTime(examTimeLeft)}
                  </span>
                </div>
              )}

              {/* Answered count */}
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, color: "rgba(255,255,255,0.75)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Answered</p>
                <p style={{ margin: 0, color: "#fff", fontWeight: 700, fontSize: "16px" }}>{answered} / {total}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ height: "4px", background: "#e5e7eb", flexShrink: 0 }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #667eea, #764ba2)", transition: "width 0.35s ease" }} />
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "32px 16px" }}>
              <div style={{ width: "100%", maxWidth: "680px", margin: "0 auto" }}>

                {/* Question nav dots */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                  <span style={{ color: "#6b7280", fontSize: "13px", fontWeight: 600 }}>
                    Question {currentQuestionIndex + 1} of {total}
                  </span>
                  <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", justifyContent: "flex-end", maxWidth: "65%" }}>
                    {examQuestions.map((_, i) => {
                      const isCurrent = i === currentQuestionIndex;
                      const isDone = !!examAnswers[examQuestions[i].id];
                      return (
                        <button key={i} onClick={() => setCurrentQuestionIndex(i)} style={{
                          width: "30px", height: "30px", borderRadius: "50%", border: "none", cursor: "pointer",
                          fontSize: "11px", fontWeight: 700, transition: "all 0.15s",
                          background: isCurrent ? "linear-gradient(135deg, #667eea, #764ba2)" : isDone ? "#d1fae5" : "#f3f4f6",
                          color: isCurrent ? "#fff" : isDone ? "#065f46" : "#9ca3af",
                          boxShadow: isCurrent ? "0 2px 8px rgba(102,126,234,0.4)" : "none",
                          outline: isCurrent ? "2px solid #667eea" : "none", outlineOffset: "2px"
                        }}>
                          {isDone && !isCurrent ? "✓" : i + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Question Card */}
                <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "16px", padding: "28px 32px", marginBottom: "16px", boxShadow: "0 4px 16px rgba(102,126,234,0.08)" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                    <span style={{ flexShrink: 0, width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "13px" }}>
                      Q{currentQuestionIndex + 1}
                    </span>
                    <p style={{ color: "#111827", fontSize: "17px", fontWeight: 600, margin: 0, lineHeight: 1.65 }}>
                      {q?.questionText}
                    </p>
                  </div>
                </div>

                {/* Options */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
                  {["A", "B", "C", "D"].map((opt) => {
                    const selected = examAnswers[q?.id] === opt;
                    return (
                      <button key={opt} onClick={() => handleExamAnswer(q.id, opt)} style={{
                        display: "flex", alignItems: "center", gap: "14px", padding: "15px 20px",
                        background: selected ? "linear-gradient(135deg, rgba(102,126,234,0.08), rgba(118,75,162,0.08))" : "#fff",
                        border: `2px solid ${selected ? "#667eea" : "#e5e7eb"}`,
                        borderRadius: "12px", cursor: "pointer", textAlign: "left",
                        boxShadow: selected ? "0 2px 12px rgba(102,126,234,0.15)" : "0 1px 3px rgba(0,0,0,0.04)",
                        transition: "all 0.15s", transform: selected ? "translateX(4px)" : "translateX(0)"
                      }}>
                        <span style={{
                          width: "34px", height: "34px", borderRadius: "50%", flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: selected ? "linear-gradient(135deg, #667eea, #764ba2)" : "#f3f4f6",
                          color: selected ? "#fff" : "#6b7280", fontWeight: 700, fontSize: "13px",
                          transition: "all 0.15s"
                        }}>
                          {opt}
                        </span>
                        <span style={{ color: selected ? "#4338ca" : "#374151", fontSize: "15px", fontWeight: selected ? 600 : 400 }}>
                          {q?.[`option${opt}`]}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Navigation */}
                <div style={{ display: "flex", gap: "12px" }}>
                  <button onClick={() => setCurrentQuestionIndex(i => i - 1)} disabled={isFirst} style={{
                    flex: 1, padding: "13px", background: "#fff",
                    border: "2px solid #e5e7eb", borderRadius: "10px",
                    color: isFirst ? "#d1d5db" : "#667eea",
                    cursor: isFirst ? "not-allowed" : "pointer", fontSize: "14px", fontWeight: 600,
                    transition: "all 0.15s"
                  }}>
                    ← Previous
                  </button>

                  {isLast ? (
                    <button onClick={handleSubmitExam} style={{
                      flex: 2, padding: "13px",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      border: "none", borderRadius: "10px", color: "#fff",
                      cursor: "pointer", fontSize: "15px", fontWeight: 700,
                      boxShadow: "0 4px 14px rgba(102,126,234,0.4)", transition: "all 0.15s"
                    }}>
                      Submit Exam ({answered}/{total} answered)
                    </button>
                  ) : (
                    <button onClick={() => setCurrentQuestionIndex(i => i + 1)} style={{
                      flex: 2, padding: "13px",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      border: "none", borderRadius: "10px", color: "#fff",
                      cursor: "pointer", fontSize: "15px", fontWeight: 700,
                      boxShadow: "0 4px 14px rgba(102,126,234,0.3)"
                    }}>
                      Next →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Exam Result View */}
      {examMode && examSubmitted && examResult && (
        <div style={{ position: "fixed", inset: 0, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", zIndex: 1000, overflowY: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ width: "100%", maxWidth: "520px" }}>

            {/* Logo / Brand */}
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", borderRadius: "50px", padding: "10px 22px", border: "1px solid rgba(255,255,255,0.25)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
                <span style={{ color: "#fff", fontWeight: 800, fontSize: "16px", letterSpacing: "0.05em" }}>UniSphere</span>
              </div>
            </div>

            {/* Main Card */}
            <div style={{ background: "#fff", borderRadius: "24px", overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.25)" }}>

              {/* Card Header */}
              <div style={{ padding: "36px 36px 28px", textAlign: "center", borderBottom: "1px solid #f3f4f6" }}>
                {examResult.passed ? (
                  <>
                    <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 8px 24px rgba(102,126,234,0.4)" }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <h2 style={{ margin: "0 0 6px", fontSize: "24px", fontWeight: 800, background: "linear-gradient(135deg, #667eea, #764ba2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      Congratulations!
                    </h2>
                    <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>You passed and earned a certificate</p>
                  </>
                ) : (
                  <>
                    <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "#fef2f2", border: "2px solid #fecaca", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                    </div>
                    <h2 style={{ margin: "0 0 6px", fontSize: "24px", fontWeight: 800, color: "#111827" }}>Keep Practicing!</h2>
                    <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>You need 80% or above to earn a certificate</p>
                  </>
                )}
              </div>

              {/* Score Section */}
              <div style={{ padding: "28px 36px", borderBottom: "1px solid #f3f4f6" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", textAlign: "center" }}>
                  <div style={{ padding: "16px 8px", background: "#f8fafc", borderRadius: "12px" }}>
                    <p style={{ margin: "0 0 4px", fontSize: "28px", fontWeight: 900, background: "linear-gradient(135deg, #667eea, #764ba2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{examResult.percent}%</p>
                    <p style={{ margin: 0, fontSize: "11px", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Score</p>
                  </div>
                  <div style={{ padding: "16px 8px", background: "#f8fafc", borderRadius: "12px" }}>
                    <p style={{ margin: "0 0 4px", fontSize: "28px", fontWeight: 900, color: "#22c55e" }}>{examResult.score}</p>
                    <p style={{ margin: 0, fontSize: "11px", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Correct</p>
                  </div>
                  <div style={{ padding: "16px 8px", background: "#f8fafc", borderRadius: "12px" }}>
                    <p style={{ margin: "0 0 4px", fontSize: "28px", fontWeight: 900, color: "#374151" }}>{examResult.total}</p>
                    <p style={{ margin: 0, fontSize: "11px", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ marginTop: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>Your score</span>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>Pass mark: 80%</span>
                  </div>
                  <div style={{ height: "8px", background: "#f3f4f6", borderRadius: "99px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${examResult.percent}%`, background: examResult.passed ? "linear-gradient(90deg, #667eea, #764ba2)" : "#ef4444", borderRadius: "99px", transition: "width 0.6s ease" }} />
                  </div>
                  <div style={{ position: "relative", marginTop: "4px" }}>
                    <div style={{ position: "absolute", left: "80%", transform: "translateX(-50%)", fontSize: "10px", color: "#9ca3af" }}>80%</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ padding: "24px 36px" }}>
                {examResult.passed && (
                  <button onClick={handleDownloadCertificate} style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "#fff", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 700, cursor: "pointer", marginBottom: "12px", boxShadow: "0 4px 16px rgba(102,126,234,0.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Download Certificate
                  </button>
                )}
                <button onClick={() => { setExamMode(false); setExamSubmitted(false); setExamResult(null); }} style={{ width: "100%", padding: "13px", background: "#f8fafc", color: "#667eea", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                  Back to Session
                </button>
              </div>
            </div>

            <p style={{ textAlign: "center", color: "rgba(255,255,255,0.6)", fontSize: "12px", marginTop: "16px" }}>
              UniSphere Learning Platform · {new Date().getFullYear()}
            </p>
          </div>
        </div>
      )}

      {/* Payment Overlay Modal */}
      {showPaymentOverlay && (
        <div className="payment-overlay">
          <div className="payment-modal">
            <button
              className="payment-close"
              onClick={() => {
                setShowPaymentOverlay(false);
                setPaymentLoading(false);
              }}
            >
              ✕
            </button>
            <div className="payment-header">
              <h2>Unlock Session</h2>
              <p className="payment-amount">Rs {selectedSession?.price}</p>
            </div>
            <div className="payment-info">
              <p>Complete your payment to unlock all videos in this session.</p>
              <div id="payment_container" style={{ marginTop: "20px" }}></div>
            </div>
            <button
              className="payment-btn"
              onClick={handlePaymentClick}
              disabled={paymentLoading}
            >
              {paymentLoading ? "Processing..." : "Proceed to Payment"}
            </button>
          </div>
        </div>
      )}

      {/* Video Overlay Modal */}
      {showVideoOverlay && (
        <div className="video-overlay">
          <button
            className="video-overlay-close"
            onClick={() => {
              setShowVideoOverlay(false);
              setSelectedVideoUrl("");
            }}
          >
            ✕
          </button>
          <div className="video-overlay-content">
            {selectedVideoUrl.includes('localhost:8084') || selectedVideoUrl.startsWith('/api') ? (
              <video
                width="100%"
                height="100%"
                controls
                autoPlay
                controlsList="nodownload nofullscreen"
                disablePictureInPicture
                style={{ backgroundColor: '#000' }}
                onEnded={() => {
                  if (currentPlayingIsUploaded && currentPlayingVideoId) {
                    handleUploadedVideoEnded(currentPlayingVideoId);
                    setShowVideoOverlay(false);
                    setSelectedVideoUrl("");
                  }
                }}
              >
                <source src={selectedVideoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <iframe
                width="100%"
                height="100%"
                src={selectedVideoUrl.replace("watch?v=", "embed/").split("&")[0]}
                title="Video Player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </div>
      )}

      {/* Badge Notification */}
      {showBadgeNotification && newBadgeInfo && (
        <div className="badge-notification">
          <div className="badge-notification-content">
            <div className="badge-notification-icon">{newBadgeInfo.icon}</div>
            <div className="badge-notification-text">
              <h3>Congratulations!</h3>
              <p>You earned the {newBadgeInfo.name}!</p>
              <p className="badge-count">Videos played: {newBadgeInfo.count}</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="sessions-footer">
        <div className="footer-content">
          <p className="footer-text">© 2026 UniSphere. All rights reserved.</p>
          <p className="footer-text">v1.0.0</p>
        </div>
      </footer>

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
        /* Adjust page padding to account for fixed footer */
        .student-sessions-page {
          min-height: 100vh;
          background: #f8fafc;
          padding: 0;
          padding-bottom: 80px;
        }

        /* Navigation Bar */
        .sessions-navbar {
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

        .sessions-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 50px 40px;
          text-align: center;
          color: white;
          margin-bottom: 40px;
        }

        .header-content h1 {
          font-size: 36px;
          font-weight: 800;
          margin: 0 0 8px 0;
          letter-spacing: -0.5px;
        }

        .header-content p {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.9);
          margin: 0 0 24px 0;
          font-weight: 400;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .header-instructions {
          display: flex;
          justify-content: center;
          gap: 32px;
          flex-wrap: wrap;
          max-width: 900px;
          margin: 0 auto;
        }

        .instruction-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.95);
          background: rgba(255, 255, 255, 0.1);
          padding: 10px 16px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
        }

        .instruction-icon {
          width: 18px;
          height: 18px;
          color: white;
          stroke: white;
          flex-shrink: 0;
        }

        .loading-container,
        .empty-container {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          color: #6b7280;
          font-size: 16px;
          max-width: 1400px;
          margin: 0 auto 40px;
        }

        .sessions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 28px;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px 60px;
        }

        .session-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          border: 1px solid #e5e7eb;
          height: 100%;
        }

        .session-card:hover {
          transform: translateY(-16px);
          box-shadow: 0 20px 40px rgba(102, 126, 234, 0.15);
          border-color: #667eea;
        }

        .session-thumbnail {
          width: 100%;
          height: 240px;
          background: linear-gradient(135deg, #f0f0f0 0%, #e5e5e5 100%);
          overflow: hidden;
          position: relative;
        }

        .session-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .session-card:hover .session-thumbnail img {
          transform: scale(1.08);
        }

        .session-info {
          padding: 28px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .session-name {
          font-size: 20px;
          font-weight: 800;
          color: #1f2937;
          margin: 0 0 14px 0;
          line-height: 1.3;
        }

        .session-meta {
          display: flex;
          gap: 20px;
          margin-bottom: 18px;
          font-size: 14px;
        }

        .session-price {
          color: #667eea;
          font-weight: 800;
          font-size: 16px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .session-videos {
          color: #6b7280;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .session-badges {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 20px;
          font-size: 13px;
        }

        .badge-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .badge-item-inline {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: #f3f4f6;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
          font-weight: 600;
          color: #374151;
          font-size: 12px;
        }

        .badge-icon-small {
          width: 14px;
          height: 14px;
          flex-shrink: 0;
        }

        .badge {
          padding: 10px 14px;
          border-radius: 8px;
          background: #f3f4f6;
          color: #374151;
          font-weight: 600;
          display: inline-block;
          width: fit-content;
          border: 1px solid #e5e7eb;
        }

        .view-btn {
          padding: 14px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: auto;
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.25);
        }

        .view-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.35);
        }

        .view-btn:active {
          transform: translateY(-1px);
        }

        /* Session Detail View */
        .session-detail-header {
          background: white;
          padding: 32px 40px;
          margin-bottom: 32px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .back-btn {
          padding: 10px 16px;
          background: transparent;
          color: #667eea;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .back-btn:hover {
          background: #f3f4f6;
          border-color: #667eea;
        }

        .session-detail-header h1 {
          font-size: 28px;
          font-weight: 800;
          margin: 0;
          color: #1f2937;
          flex: 1;
        }

        .session-detail-content {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 32px;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px 60px;
        }

        .videos-section {
          background: white;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          border: 1px solid #e5e7eb;
        }

        .videos-section h2 {
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 24px 0;
        }

        .videos-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 700px;
          overflow-y: auto;
          padding-right: 8px;
        }

        .videos-list::-webkit-scrollbar {
          width: 8px;
        }

        .videos-list::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 4px;
        }

        .videos-list::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 4px;
        }

        .videos-list::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }

        .video-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          background: #f9fafb;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;
        }

        .video-item:hover {
          background: #f3f4f6;
          border-color: #667eea;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
        }

        .video-number {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
        }

        .video-details {
          flex: 1;
          min-width: 0;
        }

        .video-details h4 {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 4px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .video-url {
          font-size: 12px;
          color: #9ca3af;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .play-btn {
          padding: 8px 14px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
          flex-shrink: 0;
          box-shadow: 0 2px 6px rgba(102, 126, 234, 0.2);
        }

        .play-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .play-btn:active {
          transform: translateY(0);
        }

        .no-videos {
          text-align: center;
          color: #6b7280;
          padding: 60px 20px;
          font-size: 15px;
        }

        .session-info-sidebar {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .info-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          border: 1px solid #e5e7eb;
        }

        .info-card h3 {
          font-size: 15px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 16px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #667eea;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f3f4f6;
          font-size: 14px;
        }

        .info-item:last-child {
          border-bottom: none;
        }

        .info-item .label {
          color: #6b7280;
          font-weight: 500;
        }

        .info-item .value {
          color: #1f2937;
          font-weight: 700;
        }

        .badge-info {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .badge-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: #374151;
          padding: 10px;
          background: #f9fafb;
          border-radius: 8px;
          font-weight: 500;
        }

        .badge-icon {
          font-size: 18px;
        }

        .progress-info {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .progress-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f3f4f6;
          font-size: 14px;
        }

        .progress-item:last-child {
          border-bottom: none;
        }

        .progress-item .label {
          color: #6b7280;
          font-weight: 500;
        }

        .progress-item .value {
          color: #1f2937;
          font-weight: 700;
          font-size: 16px;
        }

        .earned-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          border-radius: 10px;
          margin-top: 8px;
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.2);
        }

        .badge-earned-icon {
          font-size: 28px;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .badge-earned-text {
          color: white;
          font-weight: 700;
          font-size: 14px;
        }

        /* Videos Header with Pay Button */
        .videos-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .videos-header h2 {
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .pay-btn {
          padding: 12px 20px;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
        }

        .pay-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
        }

        .pay-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .pay-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Locked Video Item */
        .video-item.locked {
          opacity: 0.5;
          background: #f3f4f6;
          cursor: not-allowed;
        }

        .video-item.locked .play-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          box-shadow: none;
        }

        .info-item .value.paid {
          color: #10b981;
          font-weight: 700;
        }

        .info-item .value.unpaid {
          color: #ef4444;
          font-weight: 700;
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
          padding: 20px;
          backdrop-filter: blur(4px);
        }

        .video-overlay-content {
          position: relative;
          width: 100%;
          max-width: 1000px;
          aspect-ratio: 16 / 9;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        }

        .video-overlay-close {
          position: fixed;
          top: 24px;
          right: 24px;
          background: white;
          border: none;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          font-size: 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          color: #1f2937;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          z-index: 2001;
        }

        .video-overlay-close:hover {
          background: #f3f4f6;
          transform: scale(1.1);
        }

        /* Payment Overlay */
        .payment-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1999;
          padding: 20px;
          backdrop-filter: blur(4px);
        }

        .payment-modal {
          background: white;
          border-radius: 16px;
          padding: 32px;
          max-width: 450px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          position: relative;
          border: 1px solid #e5e7eb;
          max-height: 90vh;
          overflow-y: auto;
        }

        .payment-close {
          position: absolute;
          top: 12px;
          right: 12px;
          background: none;
          border: none;
          font-size: 28px;
          cursor: pointer;
          color: #9ca3af;
          transition: all 0.3s ease;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }

        .payment-close:hover {
          color: #1f2937;
          background: #f3f4f6;
          border-radius: 6px;
        }

        .payment-header {
          text-align: center;
          margin-bottom: 24px;
          margin-top: 8px;
        }

        .payment-header h2 {
          font-size: 22px;
          font-weight: 800;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .payment-amount {
          font-size: 36px;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
        }

        .payment-info {
          margin-bottom: 24px;
        }

        .payment-info p {
          font-size: 14px;
          color: #6b7280;
          margin: 0 0 16px 0;
          line-height: 1.5;
        }

        .payment-btn {
          width: 100%;
          padding: 12px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        }

        .payment-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
        }

        .payment-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .payment-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Badge Notification */
        .badge-notification {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 3000;
          animation: slideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes slideIn {
          from {
            transform: translateX(420px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .badge-notification-content {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 14px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 18px;
          box-shadow: 0 12px 40px rgba(102, 126, 234, 0.3);
          color: white;
          min-width: 320px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .badge-notification-icon {
          font-size: 52px;
          animation: bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
          flex-shrink: 0;
        }

        @keyframes bounce {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.15);
          }
        }

        .badge-notification-text h3 {
          margin: 0 0 6px 0;
          font-size: 17px;
          font-weight: 800;
          letter-spacing: -0.3px;
        }

        .badge-notification-text p {
          margin: 0 0 4px 0;
          font-size: 14px;
          opacity: 0.95;
          font-weight: 500;
        }

        .badge-notification-text .badge-count {
          font-size: 13px;
          opacity: 0.85;
        }

        @media (max-width: 768px) {
          .sessions-header {
            padding: 40px 20px;
          }

          .sessions-header h1 {
            font-size: 28px;
          }

          .sessions-grid {
            grid-template-columns: 1fr;
            padding: 0 20px 40px;
            gap: 20px;
          }

          .session-detail-header {
            padding: 20px;
            flex-direction: column;
            align-items: flex-start;
          }

          .session-detail-header h1 {
            font-size: 22px;
          }

          .session-detail-content {
            grid-template-columns: 1fr;
            padding: 0 20px 40px;
            gap: 20px;
          }

          .videos-section {
            padding: 20px;
          }

          .videos-list {
            max-height: 400px;
          }

          .video-overlay-content {
            max-width: 100%;
          }

          .video-overlay-close {
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.5);
            color: white;
          }

          .payment-modal {
            padding: 28px;
          }

          .badge-notification {
            top: 12px;
            right: 12px;
            left: 12px;
          }

          .badge-notification-content {
            min-width: auto;
          }
        }

        /* Footer */
        .sessions-footer {
          position: fixed;
          bottom: 0;
          right: 0;
          left: 0;
          background: white;
          border-top: 1px solid #e5e7eb;
          padding: 16px 24px;
          z-index: 100;
          box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
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
      `}</style>
    </div>
  );
}

