import { create } from 'zustand';

// ── Types ─────────────────────────────────────────────────────────
export interface Booking {
  id: number;
  bookingRef: string;
  tutorId: number;
  tutorName: string;
  studentUsername: string;
  studentName: string;
  subject: string;
  scheduledSlot: string;       // ISO: "2026-04-10T10:00:00"
  durationHours: number;
  totalPrice: number;
  sessionType: 'ONLINE' | 'PHYSICAL' | 'BOTH';
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  meetingLink?: string;
}

export interface BookingDraft {
  tutorId: number;
  tutorName: string;
  subject: string;
  avatar: string;
  slot: string;
  hourlyRate: number;
}

interface BookingStore {
  // ── State ──────────────────────────────────────────────────────
  bookings:     Booking[];
  draft:        BookingDraft | null;
  loading:      boolean;
  error:        string;

  // ── Draft (booking form এ pass කිරීමට) ────────────────────────
  setDraft:     (draft: BookingDraft | null) => void;

  // ── Setters ────────────────────────────────────────────────────
  setBookings:  (bookings: Booking[]) => void;
  setLoading:   (loading: boolean) => void;
  setError:     (error: string) => void;

  // ── Actions ────────────────────────────────────────────────────
  addBooking:      (booking: Booking) => void;
  updateBooking:   (id: number, changes: Partial<Booking>) => void;
  removeBooking:   (id: number) => void;
  clearBookings:   () => void;
}

// ── Store ─────────────────────────────────────────────────────────
export const useBookingStore = create<BookingStore>((set) => ({
  bookings: [],
  draft:    null,
  loading:  false,
  error:    '',

  setDraft:    (draft) => set({ draft }),
  setBookings: (bookings) => set({ bookings }),
  setLoading:  (loading) => set({ loading }),
  setError:    (error) => set({ error }),

  addBooking: (booking) =>
    set((state) => ({ bookings: [booking, ...state.bookings] })),

  updateBooking: (id, changes) =>
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id ? { ...b, ...changes } : b
      ),
    })),

  removeBooking: (id) =>
    set((state) => ({
      bookings: state.bookings.filter((b) => b.id !== id),
    })),

  clearBookings: () => set({ bookings: [] }),
}));