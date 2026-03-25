import axios from 'axios';

const API_URL = 'http://localhost:8081/api/bookings';

export const bookingService = {
    // සියලුම බුකින් ලබා ගැනීම
    getAllBookings: async () => {
        const response = await axios.get(API_URL);
        return response.data;
    },

    // බුකින් එකක ස්ටේටස් එක වෙනස් කිරීම
    updateBookingStatus: async (id: number, status: string) => {
        const response = await axios.put(`${API_URL}/${id}/status`, null, {
            params: { status }
        });
        return response.data;
    }
};