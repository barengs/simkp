import axios from "axios";

export const BASE_URL = 'http://localhost:8000';
export const API_URL = `${BASE_URL}/api`;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('AUTH_TOKEN');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('AUTH_TOKEN');
            localStorage.removeItem('USER_DATA');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;