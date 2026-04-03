const BASE_URL = "http://localhost:8084/api";

async function handleResponse(response) {
  if (!response.ok) {
    let message = "Request failed";
    try {
      const data = await response.json();
      message = data.message || JSON.stringify(data);
    } catch {
      message = await response.text();
    }
    throw new Error(message);
  }
  return response.json();
}

export async function createAchievement(formData) {
  const response = await fetch(`${BASE_URL}/student/achievements`, {
    method: "POST",
    body: formData
  });
  return handleResponse(response);
}

export async function getAchievementsByStudent(studentId) {
  const response = await fetch(`${BASE_URL}/student/achievements/student/${studentId}`);
  return handleResponse(response);
}

export async function getAchievementById(id) {
  const response = await fetch(`${BASE_URL}/student/achievements/${id}`);
  return handleResponse(response);
}

export async function updateAchievement(id, formData) {
  const response = await fetch(`${BASE_URL}/student/achievements/${id}`, {
    method: "PUT",
    body: formData
  });
  return handleResponse(response);
}

export async function deleteAchievement(id) {
  const response = await fetch(`${BASE_URL}/student/achievements/${id}`, {
    method: "DELETE"
  });
  return handleResponse(response);
}

export async function getPendingAchievements() {
  const response = await fetch(`${BASE_URL}/admin/achievements/pending`);
  return handleResponse(response);
}

export async function getAllAchievements() {
  const response = await fetch(`${BASE_URL}/admin/achievements`);
  return handleResponse(response);
}

export async function approveAchievement(id, adminComment) {
  const response = await fetch(`${BASE_URL}/admin/achievements/${id}/approve`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adminComment })
  });
  return handleResponse(response);
}

export async function rejectAchievement(id, adminComment) {
  const response = await fetch(`${BASE_URL}/admin/achievements/${id}/reject`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adminComment })
  });
  return handleResponse(response);
}

export async function getStudentBadges(studentId) {
  const response = await fetch(`${BASE_URL}/admin/students/${studentId}/badges`);
  return handleResponse(response);
}

export async function suspendStudent(studentId) {
  const response = await fetch(`${BASE_URL}/admin/students/${studentId}/suspend`, {
    method: "PUT"
  });
  return handleResponse(response);
}

export async function getStudents() {
  const response = await fetch(`${BASE_URL}/admin/students`);
  return handleResponse(response);
}

export async function adminLogin(credentials) {
  const response = await fetch(`${BASE_URL}/auth/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials)
  });
  return handleResponse(response);
}

export async function getAdminProfile(adminId) {
  const response = await fetch(`${BASE_URL}/admin/profile/${adminId}`);
  return handleResponse(response);
}

export async function updateAdminProfile(adminId, profileData) {
  const response = await fetch(`${BASE_URL}/admin/profile/${adminId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profileData)
  });
  return handleResponse(response);
}

export async function addAdmin(adminData) {
  const response = await fetch(`${BASE_URL}/admin/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(adminData)
  });
  return handleResponse(response);
}

export async function createSession(sessionData) {
  const response = await fetch(`${BASE_URL}/sessions/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sessionData)
  });
  return handleResponse(response);
}

export async function getAllSessions() {
  const response = await fetch(`${BASE_URL}/sessions`);
  return handleResponse(response);
}

export async function getSession(id) {
  const response = await fetch(`${BASE_URL}/sessions/${id}`);
  return handleResponse(response);
}

export async function updateSession(id, sessionData) {
  const response = await fetch(`${BASE_URL}/sessions/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sessionData)
  });
  return handleResponse(response);
}

export async function deleteSession(id) {
  const response = await fetch(`${BASE_URL}/sessions/${id}`, {
    method: "DELETE"
  });
  return handleResponse(response);
}

export async function initiateSessionPayment(paymentData) {
  const response = await fetch(`${BASE_URL}/payments/initiate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(paymentData)
  });
  return handleResponse(response);
}

export async function completeSessionPayment(orderId, transactionId) {
  const response = await fetch(`${BASE_URL}/payments/complete?orderId=${orderId}&transactionId=${transactionId}`, {
    method: "POST"
  });
  return handleResponse(response);
}

export async function checkSessionPayment(studentId, sessionId) {
  const response = await fetch(`${BASE_URL}/payments/check/${studentId}/${sessionId}`);
  return handleResponse(response);
}

export async function getPaymentStatus(studentId, sessionId) {
  const response = await fetch(`${BASE_URL}/payments/status/${studentId}/${sessionId}`);
  return handleResponse(response);
}

export async function getStudentPayments(studentId) {
  const response = await fetch(`${BASE_URL}/payments/student/${studentId}`);
  return handleResponse(response);
}

export async function getSessionPayments(sessionId) {
  const response = await fetch(`${BASE_URL}/payments/session/${sessionId}`);
  return handleResponse(response);
}

export async function recordVideoPlay(studentId, sessionId, videoId) {
  const response = await fetch(`${BASE_URL}/badges/record-play?studentId=${studentId}&sessionId=${sessionId}&videoId=${videoId}`, {
    method: "POST"
  });
  return handleResponse(response);
}

export async function getVideoPlayCount(studentId, sessionId) {
  const response = await fetch(`${BASE_URL}/badges/play-count/${studentId}/${sessionId}`);
  return handleResponse(response);
}

export async function getEarnedBadge(studentId, sessionId) {
  const response = await fetch(`${BASE_URL}/badges/earned-badge/${studentId}/${sessionId}`);
  return handleResponse(response);
}

export async function getAllPaidSessions(studentId) {
  const response = await fetch(`${BASE_URL}/payments/student/${studentId}/paid-sessions`);
  return handleResponse(response);
}

export async function uploadSessionVideoFile(sessionId, title, subtitle, file) {
  const formData = new FormData();
  formData.append("sessionId", sessionId);
  formData.append("title", title);
  formData.append("subtitle", subtitle);
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/session-video-files/upload`, {
    method: "POST",
    body: formData
  });
  return handleResponse(response);
}

export async function getSessionVideoFiles(sessionId) {
  const response = await fetch(`${BASE_URL}/session-video-files/session/${sessionId}`);
  return handleResponse(response);
}

export async function deleteSessionVideoFile(id) {
  const response = await fetch(`${BASE_URL}/session-video-files/${id}`, {
    method: "DELETE"
  });
  
  if (!response.ok) {
    let message = "Request failed";
    try {
      const data = await response.json();
      message = data.message || JSON.stringify(data);
    } catch {
      message = await response.text();
    }
    throw new Error(message);
  }
  
  // 204 No Content returns empty body, so don't try to parse JSON
  if (response.status === 204) {
    return { success: true };
  }
  
  return response.json();
}

// Session Questions API
export async function addSessionQuestion(sessionId, questionData) {
  const response = await fetch(`${BASE_URL}/session-questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, ...questionData })
  });
  return handleResponse(response);
}

export async function getSessionQuestions(sessionId) {
  const response = await fetch(`${BASE_URL}/session-questions/session/${sessionId}`);
  return handleResponse(response);
}

export async function deleteSessionQuestion(id) {
  const response = await fetch(`${BASE_URL}/session-questions/${id}`, { method: "DELETE" });
  if (response.status === 204) return { success: true };
  return handleResponse(response);
}

export async function setSessionTimeLimit(sessionId, timeLimitMinutes) {
  const response = await fetch(`${BASE_URL}/session-questions/session/${sessionId}/time-limit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timeLimitMinutes })
  });
  return handleResponse(response);
}

export async function getSessionTimeLimit(sessionId) {
  const response = await fetch(`${BASE_URL}/session-questions/session/${sessionId}/time-limit`);
  return handleResponse(response);
}

export async function checkQuizAttempt(sessionId, studentId) {
  const response = await fetch(`${BASE_URL}/session-questions/session/${sessionId}/student/${studentId}/attempt`);
  return handleResponse(response);
}

export async function submitQuizResult(sessionId, studentId, score, totalQuestions) {
  const response = await fetch(`${BASE_URL}/session-questions/session/${sessionId}/student/${studentId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ score, totalQuestions })
  });
  return handleResponse(response);
}

export async function getStudentById(studentId) {
  const response = await fetch(`${BASE_URL}/admin/students/${studentId}`);
  return handleResponse(response);
}

export async function markVideoWatched(videoId, studentId) {
  const response = await fetch(`${BASE_URL}/session-video-files/${videoId}/watch/${studentId}`, {
    method: "POST"
  });
  return handleResponse(response);
}

export async function getWatchedVideoIds(sessionId, studentId) {
  const response = await fetch(`${BASE_URL}/session-video-files/session/${sessionId}/student/${studentId}/watched`);
  return handleResponse(response);
}

export async function getStudentQuizResults(studentId) {
  const response = await fetch(`${BASE_URL}/session-questions/student/${studentId}/results`);
  return handleResponse(response);
}

export async function resolveStudentByEmail(email) {
  const response = await fetch(`${BASE_URL}/auth/student/resolve?email=${encodeURIComponent(email)}`);
  return handleResponse(response);
}
