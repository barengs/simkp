import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { completeProfile } from "../store/slice/authSlice";
import { useNavigate } from "react-router-dom";

const StudentProfile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, loading, error } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        nim: "",
        major: "",
        batch_year: "",
        phone: "",
    });
    const [errors, setErrors] = useState({});

    // If profile already complete, redirect to dashboard
    useEffect(() => {
        if (user?.is_profile_complete) {
            navigate("/", { replace: true });
        }
    }, [user, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.nim) newErrors.nim = "NIM wajib diisi";
        else if (!/^\d{8,15}$/.test(formData.nim))
            newErrors.nim = "NIM harus berupa angka (8-15 digit)";
        if (!formData.major) newErrors.major = "Program studi wajib diisi";
        if (!formData.batch_year)
            newErrors.batch_year = "Tahun angkatan wajib diisi";
        else if (!/^\d{4}$/.test(formData.batch_year))
            newErrors.batch_year = "Tahun angkatan harus 4 digit";
        if (formData.phone && !/^[0-9+\-\s]{8,15}$/.test(formData.phone))
            newErrors.phone = "Format nomor telepon tidak valid";
        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }
        dispatch(completeProfile(formData));
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 8 }, (_, i) => currentYear - i);

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
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                        </svg>
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Lengkapi Profil
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Halo, <strong>{user?.name}</strong>! Lengkapi data mahasiswa Anda untuk melanjutkan.
                    </p>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600 text-center">{error}</p>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* NIM */}
                        <div>
                            <label htmlFor="nim" className="block text-sm font-medium text-gray-700">
                                NIM (Nomor Induk Mahasiswa)
                            </label>
                            <input
                                id="nim"
                                name="nim"
                                type="text"
                                value={formData.nim}
                                onChange={handleInputChange}
                                className={`mt-1 block w-full px-3 py-2 border ${errors.nim ? "border-red-300" : "border-gray-300"
                                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                                placeholder="Contoh: 20240001"
                            />
                            {errors.nim && (
                                <p className="mt-1 text-sm text-red-600">{errors.nim}</p>
                            )}
                        </div>

                        {/* Program Studi */}
                        <div>
                            <label htmlFor="major" className="block text-sm font-medium text-gray-700">
                                Program Studi
                            </label>
                            <input
                                id="major"
                                name="major"
                                type="text"
                                value={formData.major}
                                onChange={handleInputChange}
                                className={`mt-1 block w-full px-3 py-2 border ${errors.major ? "border-red-300" : "border-gray-300"
                                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                                placeholder="Contoh: Teknik Informatika"
                            />
                            {errors.major && (
                                <p className="mt-1 text-sm text-red-600">{errors.major}</p>
                            )}
                        </div>

                        {/* Tahun Angkatan */}
                        <div>
                            <label htmlFor="batch_year" className="block text-sm font-medium text-gray-700">
                                Tahun Angkatan
                            </label>
                            <select
                                id="batch_year"
                                name="batch_year"
                                value={formData.batch_year}
                                onChange={handleInputChange}
                                className={`mt-1 block w-full px-3 py-2 border ${errors.batch_year ? "border-red-300" : "border-gray-300"
                                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white`}
                            >
                                <option value="">Pilih tahun angkatan</option>
                                {years.map((year) => (
                                    <option key={year} value={String(year)}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                            {errors.batch_year && (
                                <p className="mt-1 text-sm text-red-600">{errors.batch_year}</p>
                            )}
                        </div>

                        {/* No. Telepon */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                No. Telepon{" "}
                                <span className="text-gray-400 font-normal">(opsional)</span>
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="text"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className={`mt-1 block w-full px-3 py-2 border ${errors.phone ? "border-red-300" : "border-gray-300"
                                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                                placeholder="Contoh: 08123456789"
                            />
                            {errors.phone && (
                                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Menyimpan..." : "Simpan & Lanjutkan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentProfile;
