import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { setCredentials } from '../../store/slices/authSlice';

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Set CSRF cookie via Sanctum first
    const initCsrf = async () => {
        await axios.get('/sanctum/csrf-cookie', { withCredentials: true });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCredentials({ ...credentials, [name]: value });
        if (errors[name]) setErrors({ ...errors, [name]: '' });
        setServerError(null);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!credentials.email) {
            newErrors.email = 'Email wajib diisi';
        } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
            newErrors.email = 'Email tidak valid';
        }
        if (!credentials.password) {
            newErrors.password = 'Password wajib diisi';
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setLoading(true);
        setServerError(null);

        try {
            await initCsrf();
            const { data } = await axios.post('/api/login', credentials, {
                withCredentials: true,
                headers: { Accept: 'application/json' },
            });

            dispatch(setCredentials({
                user: data.user,
                roles: data.roles,
                permissions: data.permissions,
            }));

            navigate('/dashboard');
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors({ email: err.response.data.errors?.email?.[0] || 'Login gagal' });
            } else if (err.response?.status === 419) {
                setServerError('Sesi kadaluarsa. Refresh halaman dan coba lagi.');
            } else {
                setServerError('Tidak dapat terhubung ke server.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                        <svg className="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">SIM-KPTA Login</h2>
                    <p className="mt-2 text-sm text-gray-600">Sistem Informasi Manajemen KP & TA</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={credentials.email}
                                onChange={handleInputChange}
                                className={`mt-1 block w-full px-3 py-2 border ${
                                    errors.email ? 'border-red-300' : 'border-gray-300'
                                } rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                                placeholder="email@simkpta.test"
                                autoComplete="email"
                                disabled={loading}
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={credentials.password}
                                onChange={handleInputChange}
                                className={`mt-1 block w-full px-3 py-2 border ${
                                    errors.password ? 'border-red-300' : 'border-gray-300'
                                } rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                disabled={loading}
                            />
                            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                        </div>

                        {serverError && (
                            <div className="rounded-md bg-red-50 p-3">
                                <p className="text-sm text-red-700">{serverError}</p>
                            </div>
                        )}
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Memproses...' : 'Masuk'}
                        </button>
                    </div>

                    <div className="bg-emerald-50 rounded-md p-3 text-xs text-emerald-800">
                        <p className="font-medium">Akun demo:</p>
                        <ul className="mt-1 space-y-0.5">
                            <li>admin@simkpta.test / password</li>
                            <li>koordinator@simkpta.test / password</li>
                            <li>dosen@simkpta.test / password</li>
                            <li>mahasiswa@simkpta.test / password</li>
                        </ul>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
