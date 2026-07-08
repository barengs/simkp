import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
    User, Lock, Camera, Check, Loader2,
    Upload, AlertCircle, Phone, Mail, Shield, IdCard
} from "lucide-react";
import api from "../api";
import { toast } from "react-toastify";
import { fetchCurrentUser, refreshCurrentUser } from "../store/slice/authSlice";

const ProfileSettings = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const [activeTab, setActiveTab] = useState("info"); // info | avatar | password

    // Info Form
    const [name, setName] = useState(user?.name || "");
    const [phone, setPhone] = useState(user?.phone || "");
    const [nim, setNim] = useState(user?.student?.nim || user?.lecturer?.nip || "");
    const [submittingInfo, setSubmittingInfo] = useState(false);

    // Password Form
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");
    const [submittingPassword, setSubmittingPassword] = useState(false);

    // Avatar Upload
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [submittingAvatar, setSubmittingAvatar] = useState(false);

    // Handle Info Submit
    const handleInfoSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.warn("Nama lengkap wajib diisi.");
            return;
        }
        setSubmittingInfo(true);
        try {
            const payload = { name, phone };
            if (user?.role === 'mahasiswa') {
                payload.nim = nim;
            } else if (user?.role === 'dosen') {
                payload.nip = nim;
            }
            const res = await api.put("/profile", payload);
            if (res.data?.success) {
                toast.success("✅ Biodata berhasil diperbarui!");
            } else {
                toast.error("❌ Gagal memperbarui biodata: " + (res.data?.message || "Unknown error"));
            }
            dispatch(refreshCurrentUser()); // Refresh Redux state
        } catch (err) {
            toast.error(err.response?.data?.message || "Gagal memperbarui profil.");
        } finally {
            setSubmittingInfo(false);
        }
    };

    // Handle Password Change
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (!currentPassword || !newPassword || !newPasswordConfirmation) {
            toast.warn("Semua input password wajib diisi.");
            return;
        }
        if (newPassword !== newPasswordConfirmation) {
            toast.warn("Konfirmasi password baru tidak cocok.");
            return;
        }
        setSubmittingPassword(true);
        try {
            await api.post("/profile/password", {
                current_password: currentPassword,
                new_password: newPassword,
                new_password_confirmation: newPasswordConfirmation
            });
            toast.success("Password Anda berhasil diubah!");
            setCurrentPassword("");
            setNewPassword("");
            setNewPasswordConfirmation("");
        } catch (err) {
            toast.error(err.response?.data?.message || "Gagal mengubah password.");
        } finally {
            setSubmittingPassword(false);
        }
    };

    // Handle Avatar File Change
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.warn("Ukuran file maksimal adalah 2MB.");
                return;
            }
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    // Handle Avatar Submit
    const handleAvatarSubmit = async (e) => {
        e.preventDefault();
        if (!avatarFile) {
            toast.warn("Pilih file foto terlebih dahulu.");
            return;
        }
        setSubmittingAvatar(true);
        const formData = new FormData();
        formData.append("avatar", avatarFile);

        try {
            await api.post("/profile/avatar", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            toast.success("✅ Foto profil berhasil diunggah!", { autoClose: 3000 });
            setAvatarFile(null);
            setAvatarPreview(null);
            dispatch(refreshCurrentUser()); // Update header & sidebar avatar
        } catch (err) {
            toast.error(err.response?.data?.message || "Gagal mengunggah foto.");
        } finally {
            setSubmittingAvatar(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="border-b border-gray-200 pb-5">
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
                    Pengaturan Profil Saya
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    Kelola detail informasi personal, nomor kontak, foto profil, dan kata sandi akun Anda.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Tabs Sidebar */}
                <div className="md:col-span-1 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 border-b md:border-b-0 border-gray-200">
                    <button
                        onClick={() => setActiveTab("info")}
                        className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === "info"
                            ? "bg-indigo-50 text-indigo-700"
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                            }`}
                    >
                        <User size={16} /> Biodata & Kontak
                    </button>
                    <button
                        onClick={() => setActiveTab("avatar")}
                        className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === "avatar"
                            ? "bg-indigo-50 text-indigo-700"
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                            }`}
                    >
                        <Camera size={16} /> Foto Profil
                    </button>
                    <button
                        onClick={() => setActiveTab("password")}
                        className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === "password"
                            ? "bg-indigo-50 text-indigo-700"
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                            }`}
                    >
                        <Lock size={16} /> Ubah Password
                    </button>
                </div>

                {/* Tab content wrapper */}
                <div className="md:col-span-3 bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                    {/* BIODATA TAB */}
                    {activeTab === "info" && (
                        <form onSubmit={handleInfoSubmit} className="space-y-6">
                            <div>
                                <h3 className="text-base font-bold text-gray-850 mb-1">Informasi Personal</h3>
                                <p className="text-xs text-gray-500">Perbarui informasi kontak utama Anda untuk komunikasi KP/TA.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase">Nama Lengkap</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            required
                                            className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase">Email Sistem (Read-Only)</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                        <input
                                            type="email"
                                            value={user?.email || ""}
                                            disabled
                                            className="w-full bg-gray-55/40 border border-gray-200 text-gray-400 text-sm rounded-xl pl-9 pr-4 py-2.5 cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase">Nomor Kontak (WhatsApp / Handphone)</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={e => setPhone(e.target.value)}
                                            placeholder="Contoh: 08123456789"
                                            className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        />
                                    </div>
                                </div>

                                {user?.role && ['mahasiswa', 'dosen'].includes(user.role) && (
                                    <div className="space-y-1">
                                        <label className="block text-xs font-bold text-gray-500 uppercase">
                                            {user.role === 'mahasiswa' ? 'NIM (Nomor Induk Mahasiswa)' : 'NIP (Nomor Induk Pegawai)'}
                                        </label>
                                        <div className="relative">
                                            <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input
                                                value={nim}
                                                onChange={e => setNim(e.target.value)}
                                                placeholder={user.role === 'mahasiswa' ? 'Masukkan NIM' : 'Masukkan NIDN'}
                                                className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase">Peran / Otoritas Utama</label>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                        <span className="w-full block bg-gray-55/40 border border-gray-200 text-gray-400 text-sm rounded-xl pl-9 pr-4 py-2.5 capitalize font-semibold">
                                            {user?.role}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={submittingInfo}
                                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition font-semibold disabled:opacity-50"
                                >
                                    {submittingInfo ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                    Simpan Biodata
                                </button>
                            </div>
                        </form>
                    )}

                    {/* FOTO PROFIL TAB */}
                    {activeTab === "avatar" && (
                        <form onSubmit={handleAvatarSubmit} className="space-y-6">
                            <div>
                                <h3 className="text-base font-bold text-gray-850 mb-1">Foto Profil Akun</h3>
                                <p className="text-xs text-gray-500">Unggah foto profil dalam resolusi tinggi untuk mempermudah identifikasi akademik.</p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-6 py-4">
                                <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center shrink-0">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : user?.avatar_url ? (
                                        <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-indigo-600 text-3xl font-bold uppercase">
                                            {(user?.name || "U").charAt(0)}
                                        </span>
                                    )}
                                </div>

                                <div className="flex-1 space-y-3 w-full">
                                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50 text-center hover:bg-gray-100/50 transition cursor-pointer relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        <div className="flex flex-col items-center justify-center gap-1.5 text-gray-500 text-xs">
                                            <Upload className="text-indigo-650" size={24} />
                                            <p className="font-semibold text-gray-700">Pilih file foto atau seret ke sini</p>
                                            <p className="text-[10px] text-gray-400">JPG, JPEG, PNG, GIF maks. 2MB</p>
                                        </div>
                                    </div>
                                    {avatarFile && (
                                        <div className="flex items-center gap-2 text-xs bg-indigo-50 border border-indigo-100 rounded-lg p-2.5 text-indigo-750 font-medium">
                                            <AlertCircle size={14} className="shrink-0" />
                                            <span>Foto terpilih: {avatarFile.name} ({(avatarFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4 flex gap-2 justify-end">
                                {avatarPreview && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAvatarFile(null);
                                            setAvatarPreview(null);
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition-colors font-semibold"
                                    >
                                        Batalkan
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={submittingAvatar || !avatarFile}
                                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition font-semibold disabled:opacity-50"
                                >
                                    {submittingAvatar ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                    Unggah Foto Baru
                                </button>
                            </div>
                        </form>
                    )}

                    {/* UBAH PASSWORD TAB */}
                    {activeTab === "password" && (
                        <form onSubmit={handlePasswordSubmit} className="space-y-6">
                            <div>
                                <h3 className="text-base font-bold text-gray-850 mb-1">Keamanan & Password</h3>
                                <p className="text-xs text-gray-500">Ubah kata sandi secara berkala untuk menjaga keamaman akun akademik Anda.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase">Password Saat Ini</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={e => setCurrentPassword(e.target.value)}
                                            required
                                            placeholder="Masukkan password Anda sekarang"
                                            className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase">Password Baru</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            required
                                            placeholder="Gunakan minimal 8 karakter"
                                            className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase">Ulangi Password Baru</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="password"
                                            value={newPasswordConfirmation}
                                            onChange={e => setNewPasswordConfirmation(e.target.value)}
                                            required
                                            placeholder="Konfirmasi password baru"
                                            className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={submittingPassword}
                                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition font-semibold disabled:opacity-50"
                                >
                                    {submittingPassword ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                    Simpan Password Baru
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;
