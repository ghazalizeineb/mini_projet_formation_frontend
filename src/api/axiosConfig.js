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
        // ⚠️ IMPORTANT : NE PAS rediriger si on est sur la page de login
        const isLoginPage = window.location.pathname === '/login';
        const isRegisterPage = window.location.pathname === '/register';
        
        if (error.response?.status === 401 && !isLoginPage && !isRegisterPage) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;