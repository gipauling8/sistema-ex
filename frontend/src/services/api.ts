import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000', // URL de tu backend en FastAPI
});

// Interceptor para añadir el token de autenticación a las cabeceras
api.interceptors.request.use(config => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default api;
