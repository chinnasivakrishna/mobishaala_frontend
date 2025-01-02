// src/services/api.js
import axios from 'axios';

const API_URL = 'https://mobishaala-backend.onrender.com/api';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    credentials: 'include',
  },
  withCredentials: true // Important: needed for cookies to be sent
});

// Auth service
export const authService = {
  login: (email, password) => {
    return axiosInstance.post('/auth/login', { email, password });
  },

  logout: () => {
    return axiosInstance.post('/auth/logout');
  },

  register: (userData) => {
    return axiosInstance.post('/auth/register', userData);
  },
};

// Room service
export const roomService = {
  createRoom: (roomData) => {
    return axiosInstance.post('/rooms', roomData);
  },

  getRooms: () => {
    return axiosInstance.get('/rooms');
  },

  getRoom: (roomId) => {
    return axiosInstance.get(`/rooms/${roomId}`);
  },

  getToken: (roomId) => {
    return axiosInstance.post(`/rooms/${roomId}/token`);
  },

  startRecording: (roomId) => {
    return axiosInstance.post(`/rooms/${roomId}/recording/start`);
  },

  stopRecording: (roomId) => {
    return axiosInstance.post(`/rooms/${roomId}/recording/stop`);
  },

  saveRecording: (roomId, formData) => {
    return axiosInstance.post(`/rooms/${roomId}/recording/save`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Export the axios instance as default
export default axiosInstance;