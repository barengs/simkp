import React, { useState } from 'react';

const Login = ({ onLogin }) => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCredentials({ ...credentials, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
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
        } else if (credentials.password.length < 6) {
            newErrors.password = 'Password minimal 6 karakter';
        }
        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        const userData = {
            name: credentials.email.split('@')[0],
            email: credentials.email,
            roles: [],
            permissions: [],
        };

        if (onLogin) {
            onLogin(userData);
        } else {
            alert(`Login berhasil sebagai ${credentials.email}!`);
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
                    <p className="mt-2 text-sm text-gray-600">Sistem Informasi Manajemen Kerja Praktek & Tugas Akhir</p>
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
                                placeholder="email@university.ac.id"
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
                            />
                            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                        >
                            Masuk
                        </button>
                    </div>
                </form>

                <div className="text-center text-sm text-gray-600">
                    <p>
                        Belum punya akun?{' '}
                        <a href="#" className="font-medium text-emerald-600 hover:text-emerald-500">
                            Daftar
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
