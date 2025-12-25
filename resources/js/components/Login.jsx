import React, { useState } from "react";

const Login = ({ onLogin }) => {
    const [credentials, setCredentials] = useState({
        email: "",
        password: "",
        role: "admin",
    });

    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCredentials({
            ...credentials,
            [name]: value,
        });
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: "",
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!credentials.email) {
            newErrors.email = "Email wajib diisi";
        } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
            newErrors.email = "Email tidak valid";
        }
        if (!credentials.password) {
            newErrors.password = "Password wajib diisi";
        } else if (credentials.password.length < 6) {
            newErrors.password = "Password minimal 6 karakter";
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

        // Simulate login process
        console.log("Login attempt with:", credentials);
        // In a real app, you would send this to your backend

        // Create user object based on credentials
        const userData = {
            name: credentials.email.split("@")[0], // Use email prefix as name
            role: credentials.role,
            email: credentials.email,
        };

        // Call the onLogin function passed from parent
        if (onLogin) {
            onLogin(userData);
        } else {
            alert(`Login berhasil sebagai ${credentials.role}!`);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                        <svg
                            className="h-10 w-10 text-indigo-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                        </svg>
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        SIMKP Login
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Sistem Informasi Kerja Praktek
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={credentials.email}
                                onChange={handleInputChange}
                                className={`mt-1 block w-full px-3 py-2 border ${
                                    errors.email
                                        ? "border-red-300"
                                        : "border-gray-300"
                                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                                placeholder="email@university.ac.id"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={credentials.password}
                                onChange={handleInputChange}
                                className={`mt-1 block w-full px-3 py-2 border ${
                                    errors.password
                                        ? "border-red-300"
                                        : "border-gray-300"
                                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                                placeholder="••••••••"
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="role"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Peran
                            </label>
                            <select
                                id="role"
                                name="role"
                                value={credentials.role}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="admin">Administrator</option>
                                <option value="student">Mahasiswa</option>
                                <option value="dosen">Dosen Pembimbing</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label
                                htmlFor="remember-me"
                                className="ml-2 block text-sm text-gray-900"
                            >
                                Ingat saya
                            </label>
                        </div>

                        <div className="text-sm">
                            <a
                                href="#"
                                className="font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                Lupa password?
                            </a>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Masuk
                        </button>
                    </div>
                </form>

                <div className="text-center text-sm text-gray-600">
                    <p>
                        Belum punya akun?{" "}
                        <a
                            href="#"
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                            Daftar
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
