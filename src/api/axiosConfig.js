import axios from 'axios';

// Instance publique — sans token (pour les pages publiques)
export const apiPublic = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
});

// Instance privée — avec token (pour les pages protégées)
const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;