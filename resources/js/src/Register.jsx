import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, clearError } from "./store/slice/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const Register = () => {
    const { publicSettings } = useSelector((state) => state.settings || { publicSettings: {} });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, isAuthenticated, user } = useSelector(
        (state) => state.auth
    );

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });
    const [errors, setErrors] = useState({});

    // Redirect if authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            navigate(user.redirect_url || "/", { replace: true });
        }
    }, [isAuthenticated, user, navigate]);

    // Clear redux error on mount
    useEffect(() => {
        dispatch(clearError());
    }, [dispatch]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: "",
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) {
            newErrors.name = "Nama wajib diisi";
        } else if (formData.name.length < 3) {
            newErrors.name = "Nama minimal 3 karakter";
        }
        if (!formData.email) {
            newErrors.email = "Email wajib diisi";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email tidak valid";
        }
        if (!formData.password) {
            newErrors.password = "Password wajib diisi";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password minimal 6 karakter";
        }
        if (!formData.password_confirmation) {
            newErrors.password_confirmation = "Konfirmasi password wajib diisi";
        } else if (formData.password !== formData.password_confirmation) {
            newErrors.password_confirmation = "Konfirmasi password tidak cocok";
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
        dispatch(registerUser(formData));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                        {publicSettings.app_logo ? (
                            <img src={publicSettings.app_logo} alt="Logo" className="w-full h-full object-contain" />
                        ) : "S"}
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Daftar Akun
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Sistem Informasi Kerja Praktek
                    </p>
                </div>

                {/* Error from Redux */}
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600 text-center">{error}</p>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Nama Lengkap
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`mt-1 block w-full px-3 py-2 border ${errors.name
                                    ? "border-red-300"
                                    : "border-gray-300"
                                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                                placeholder="Nama lengkap Anda"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.name}
                                </p>
                            )}
                        </div>

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
                                value={formData.email}
                                onChange={handleInputChange}
                                className={`mt-1 block w-full px-3 py-2 border ${errors.email
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
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`mt-1 block w-full px-3 py-2 border ${errors.password
                                        ? "border-red-300"
                                        : "border-gray-300"
                                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                                    placeholder="Minimal 6 karakter"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="password_confirmation"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Konfirmasi Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.password_confirmation}
                                    onChange={handleInputChange}
                                    className={`mt-1 block w-full px-3 py-2 border ${errors.password_confirmation
                                        ? "border-red-300"
                                        : "border-gray-300"
                                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                                    placeholder="Ulangi password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                                </button>
                            </div>

                            {errors.password_confirmation && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.password_confirmation}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Memproses..." : "Daftar"}
                        </button>
                    </div>
                </form>

                <div className="text-center text-sm text-gray-600">
                    <p>
                        Sudah punya akun?{" "}
                        <Link
                            to="/login"
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                            Masuk
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
