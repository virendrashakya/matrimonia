import axios from 'axios';

// In production, VITE_API_URL should be set to your Railway backend URL
const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            // Don't redirect if on public pages
            const isPublic = window.location.pathname.startsWith('/public') ||
                window.location.pathname === '/' ||
                window.location.pathname.startsWith('/login') ||
                window.location.pathname.startsWith('/register');

            if (!isPublic) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
