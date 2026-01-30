import { createContext, useContext, useState, useEffect, Children } from "react";
import api from "../../src/api";
import { useToast } from "../ui/Toast";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('AUTH_TOKEN');
        if (token) {
            try {
                const response = await api.get('/user');
                if (response.status === 200) {
                    setUser(response.data);
                    setIsAuthenticated(true);
                }
            } catch (error) {
                localStorage.removeItem('AUTH_TOKEN');
                localStorage.removeItem('USER_DATA');
            }
        }
        setIsLoading(false);
    };

    const login = async (credentials) => {
        try {
            const response = await api.post('/login', credentials);
            if (response.data.status === "success") {
                const { token, user: userData } = response.data;
                localStorage.setItem('AUTH_TOKEN', token);
                localStorage.setItem('USER_DATA', JSON.stringify(userData));
                setUser(userData);
                setIsAuthenticated(true);
                addToast('Selamat Datang! Anda berhasil masuk.', 'success');
                return userData;
            }
        } catch (error) {
            let message = 'Terjadi kesalahan saat mencoba masuk. Silakan coba lagi.';

            if (error.response?.status === 401) {
                message = 'Email atau Password yang Anda masukkan salah.';
            } else if (error.response?.status === 422) {
                message = 'Silakan periksa kembali data yang Anda masukkan.';
            } else if (!error.response) {
                message = 'Koneksi ke server terputus. Periksa jaringan Anda.';
            }

            addToast(message, 'error');
            throw error;
        }
    };

    const register = async (data) => {
        try {
            const response = await api.post('/register', data);
            if (response.data.status === "success") {
                const { token, user: userData } = response.data;
                localStorage.setItem('AUTH_TOKEN', token);
                localStorage.setItem('USER_DATA', JSON.stringify(userData));
                setUser(userData);
                setIsAuthenticated(true);
                addToast('Pendaftaran berhasil! Akun Anda telah dibuat.', 'success');
                return userData;
            }
        } catch (error) {
            let message = 'Gagal membuat akun. Silakan coba lagi nanti.';

            if (error.response?.status === 422) {
                message = 'Data yang Anda masukkan tidak valid atau sudah terdaftar.';
            }

            addToast(message, 'error');
            throw error;
        }
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Logout error', error);
        } finally {
            localStorage.removeItem('AUTH_TOKEN');
            localStorage.removeItem('USER_DATA');
            setUser(null);
            setIsAuthenticated(false);
            window.location.href = '/login';
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}