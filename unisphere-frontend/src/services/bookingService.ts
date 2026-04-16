import axios from 'axios';

// ✅ FIX: Port corrected → 8082 (booking-service runs here, not 8081)
// ✅ FIX: Authorization header added for JWT-protected endpoints
const API_BASE = 'http://localhost:8082';

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
});

export const bookingService = {

  // ── Student: සිය bookings ලබා ගැනීම ──────────────────────────
  getStudentBookings: async (username: string) => {
    const res = await axios.get(`${API_BASE}/api/bookings/student/${username}`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // ── Tutor: තමන්ට ආ bookings ලබා ගැනීම ────────────────────────
  getTutorBookings: async (tutorId: number) => {
    const res = await axios.get(`${API_BASE}/api/bookings/tutor/${tutorId}`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // ── Admin: සියලු bookings ────────────────────────────────────
  getAllBookings: async () => {
    const res = await axios.get(`${API_BASE}/api/bookings`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // ── Booking ID එකෙන් ගැනීම ──────────────────────────────────
  getBookingById: async (id: number) => {
    const res = await axios.get(`${API_BASE}/api/bookings/${id}`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // ── නව booking create කිරීම ──────────────────────────────────
  createBooking: async (bookingData: {
    tutorId: number;
    studentUsername: string;
    studentName: string;
    subject: string;
    scheduledSlot: string;   // ISO format: "2026-04-10T10:00:00"
    durationHours: number;
    totalPrice: number;
    sessionType: string;
  }) => {
    const res = await axios.post(`${API_BASE}/api/bookings`, bookingData, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // ── Status වෙනස් කිරීම (Confirm / Complete) ─────────────────
  updateBookingStatus: async (id: number, status: string) => {
    const res = await axios.put(
      `${API_BASE}/api/bookings/${id}/status`,
      null,
      { params: { status }, headers: getAuthHeader() }
    );
    return res.data;
  },

  // ── Cancel booking ───────────────────────────────────────────
  cancelBooking: async (id: number) => {
    const res = await axios.put(`${API_BASE}/api/bookings/${id}/cancel`, null, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // ── Admin stats ──────────────────────────────────────────────
  getStats: async () => {
    const res = await axios.get(`${API_BASE}/api/bookings/stats`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },
};