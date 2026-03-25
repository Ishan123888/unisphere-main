import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8082', // Identity Service URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// හැම Request එකකටම කලින් Token එක එකතු කරන්න
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // ඔයා Token එක save කරපු key එක
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;