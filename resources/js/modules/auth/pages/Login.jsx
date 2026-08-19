import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, GraduationCap, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { setCredentials as setAuthCredentials } from '../../../store/slices/authSlice';
import { setSettings } from '../../../store/slices/settingsSlice';
import { useGetPublicSettingsQuery } from '../../../modules/pengaturan/api/pengaturanApi';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authLoading = useSelector((s) => s.auth.loading);

  const initCsrf = async () => {
    await axios.get('/sanctum/csrf-cookie', {
      withCredentials: true,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    setServerError(null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!credentials.email) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!credentials.password) {
      newErrors.password = 'Password wajib diisi';
    } else if (credentials.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
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

      const { data } = await axios.post(
        '/api/login',
        credentials,
        {
          withCredentials: true,
          headers: {
            Accept: 'application/json',
          },
        }
      );

      dispatch(
        setAuthCredentials({
          user: data.user,
          roles: data.roles,
          permissions: data.permissions,
        })
      );

      const settingsRes = await axios.get(
        '/api/pengaturan/public',
        {
          withCredentials: true,
        }
      );

      dispatch(setSettings(settingsRes.data));

      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors({
          email:
            err.response.data.errors?.email?.[0] ||
            'Login gagal.',
        });
      } else if (err.response?.status === 419) {
        setServerError(
          'Sesi kadaluarsa. Silakan refresh halaman dan coba lagi.'
        );
      } else if (err.response?.status === 500) {
        setServerError(
          'Terjadi kesalahan pada server. Hubungi administrator.'
        );
      } else {
        setServerError(
          'Tidak dapat terhubung ke server.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const isSubmitting = loading || authLoading;
  const { data: settings } = useGetPublicSettingsQuery();
  const logoPath = settings?.logo_path || null;
  const logoUrl = logoPath
    ? (logoPath.startsWith('http') ? logoPath : `${window.location.origin}${logoPath}`)
    : null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">

          <div className="px-6 py-8 sm:px-8">

            {/* Logo */}
            <div className="flex justify-center mb-1">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="h-16 w-auto object-contain shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <GraduationCap className="w-7 h-7 text-emerald-600" />
                </div>
              )}

            </div>

            {/* Title */}
            <div className="text-center mb-7 ">
              <h1 className="text-xl font-bold text-gray-900">
                SIM-KPTA
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Sistem Informasi Manajemen KP & TA
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Email
                </label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={credentials.email}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    autoComplete="email"
                    placeholder="Masukkan email"
                    className={`w-full h-10 pl-9 pr-3 text-sm border rounded-lg outline-none transition ${errors.email
                      ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                      : 'border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
                      } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                  />
                </div>

                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Password
                </label>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={credentials.password}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    autoComplete="current-password"
                    placeholder="Masukkan password"
                    className={`w-full h-10 pl-9 pr-10 text-sm border rounded-lg outline-none transition ${errors.password
                      ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                      : 'border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
                      } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                    disabled={isSubmitting}
                    className="absolute right-0 top-0 h-10 w-10 flex items-center justify-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Server Error */}
              {serverError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />

                  <p className="text-xs text-red-700 leading-relaxed">
                    {serverError}
                  </p>
                </div>
              )}

              {/* Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-10 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Memproses...' : 'Masuk'}
              </button>
            </form>

            {/* Register */}
            <div className="mt-6 pt-5 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                Belum punya akun?{' '}
                <Link
                  to="/register"
                  className="font-medium text-emerald-600 hover:text-emerald-700"
                >
                  Daftar sebagai mahasiswa
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-5 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} SIM-KPTA
        </p>
      </div>
    </div>
  );
};

export default Login;