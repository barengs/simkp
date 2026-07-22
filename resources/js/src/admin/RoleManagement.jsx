import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users, ShieldAlert, Key, Plus, Edit2, Trash2,
    Search, Check, CheckSquare, Square, Shield,
    Loader2, AlertCircle, RefreshCw
} from "lucide-react";
import api from "../api";
import { toast } from "react-toastify";

const permissionDisplayMap = {
    "manage periods": "Periode",
    "manage themes": "Tema",
    "manage master data": "Master Data",
    "manage internships": "Kelompok KP",
    "view internships": "Daftar Kelompok / Bimbingan",
    "view logbook monitoring": "Monitoring Logbook",
    "view kp reports": "Laporan KP",
    "view evaluation recap": "Rekap Penilaian",
    "validate logbook": "Validasi Logbook",
    "validate report": "Validasi Laporan",
    "score internships": "Penilaian Kelompok",
    "manage ta": "Manajemen TA",
    "manage settings": "Pengaturan Sistem",
    "manage roles": "Manajemen Peran",
    "student registration": "Pendaftaran KP",
    "student logbook": "Logbook KP",
    "student report": "Laporan KP",
    "student evaluation": "Penilaian KP",
    "student ta": "Pendaftaran TA & Bimbingan TA",
    "manage profile": "Pengaturan Profil",
};

const getPermissionDisplayName = (name) => {
    return permissionDisplayMap[name] || name.replace(/_/g, " ");
};

const RoleManagement = () => {
    const [activeTab, setActiveTab] = useState("roles"); // roles | users
    const [roles, setRoles] = useState([]);
    const [allPermissions, setAllPermissions] = useState([]);
    const [users, setUsers] = useState([]);
    const [loadingRoles, setLoadingRoles] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingPerms, setLoadingPerms] = useState(true);
    const [error, setError] = useState(null);

    // Pagination for users
    const [searchUser, setSearchUser] = useState("");
    const [userPage, setUserPage] = useState(1);
    const [userLastPage, setUserLastPage] = useState(1);

    // Add/Edit Role Modal State
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [modalMode, setModalMode] = useState("create"); // create | edit
    const [selectedRole, setSelectedRole] = useState(null);
    const [roleName, setRoleName] = useState("");
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [submittingRole, setSubmittingRole] = useState(false);

    // Edit User Roles Modal State
    const [showUserModal, setShowUserModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userRoles, setUserRoles] = useState([]);
    const [submittingUser, setSubmittingUser] = useState(false);

    // Fetch Roles
    const fetchRoles = useCallback(async () => {
        setLoadingRoles(true);
        setError(null);
        try {
            const res = await api.get("/admin/roles");
            setRoles(res.data?.data || []);
        } catch (err) {
            setError("Gagal memuat daftar peran.");
        } finally {
            setLoadingRoles(false);
        }
    }, []);

    // Fetch Permissions
    const fetchPermissions = useCallback(async () => {
        setLoadingPerms(true);
        try {
            const res = await api.get("/admin/permissions");
            setAllPermissions(res.data?.data || []);
        } catch (err) {
            console.error("Gagal memuat hak akses", err);
        } finally {
            setLoadingPerms(false);
        }
    }, []);

    // Fetch Users
    const fetchUsers = useCallback(async (page = 1, search = "") => {
        setLoadingUsers(true);
        try {
            const res = await api.get(`/admin/users-list?page=${page}&search=${search}`);
            setUsers(res.data?.data?.data || []);
            setUserPage(res.data?.data?.current_page || 1);
            setUserLastPage(res.data?.data?.last_page || 1);
        } catch (err) {
            toast.error("Gagal memuat data pengguna.");
        } finally {
            setLoadingUsers(false);
        }
    }, []);

    useEffect(() => {
        fetchRoles();
        fetchPermissions();
    }, [fetchRoles, fetchPermissions]);

    useEffect(() => {
        if (activeTab === "users") {
            fetchUsers(1, searchUser);
        }
    }, [activeTab, searchUser, fetchUsers]);

    // Handle Open Create/Edit Role
    const openRoleModal = (mode, role = null) => {
        setModalMode(mode);
        setSelectedRole(role);
        if (mode === "edit" && role) {
            setRoleName(role.name);
            setSelectedPermissions(role.permissions.map(p => p.name));
        } else {
            setRoleName("");
            setSelectedPermissions([]);
        }
        setShowRoleModal(true);
    };

    // Toggle Permission Selection
    const togglePermission = (permName) => {
        setSelectedPermissions(prev =>
            prev.includes(permName)
                ? prev.filter(p => p !== permName)
                : [...prev, permName]
        );
    };

    // Submit Role Create / Edit
    const handleRoleSubmit = async () => {
        if (!roleName.trim()) {
            toast.warn("Nama peran wajib diisi.");
            return;
        }
        setSubmittingRole(true);
        try {
            if (modalMode === "create") {
                await api.post("/admin/roles", {
                    name: roleName,
                    permissions: selectedPermissions
                });
                toast.success("Peran berhasil dibuat!");
            } else {
                await api.put(`/admin/roles/${selectedRole.id}`, {
                    name: roleName,
                    permissions: selectedPermissions
                });
                toast.success("Peran berhasil diperbarui!");
            }
            setShowRoleModal(false);
            fetchRoles();
        } catch (err) {
            toast.error(err.response?.data?.message || "Terjadi kesalahan.");
        } finally {
            setSubmittingRole(false);
        }
    };

    // Handle Delete Role
    const handleDeleteRole = async (roleId, name) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus peran "${name}"? Tindakan ini dapat mempengaruhi hak akses pengguna.`)) {
            return;
        }
        try {
            await api.delete(`/admin/roles/${roleId}`);
            toast.success("Peran berhasil dihapus.");
            fetchRoles();
        } catch (err) {
            toast.error(err.response?.data?.message || "Gagal menghapus peran.");
        }
    };

    // Open Edit User Roles Modal
    const openUserModal = (user) => {
        setSelectedUser(user);
        setUserRoles(user.role_names || []);
        setShowUserModal(true);
    };

    // Toggle User Role Selection
    const toggleUserRole = (roleName) => {
        setUserRoles(prev =>
            prev.includes(roleName)
                ? prev.filter(r => r !== roleName)
                : [...prev, roleName]
        );
    };

    // Submit User Roles Assign
    const handleUserSubmit = async () => {
        if (userRoles.length === 0) {
            toast.warn("Minimal pilih satu peran untuk pengguna.");
            return;
        }
        setSubmittingUser(true);
        try {
            await api.post(`/admin/users-list/${selectedUser.id}/roles`, {
                roles: userRoles
            });
            toast.success("Peran pengguna berhasil diperbarui.");
            setShowUserModal(false);
            fetchUsers(userPage, searchUser);
        } catch (err) {
            toast.error(err.response?.data?.message || "Gagal memperbarui peran.");
        } finally {
            setSubmittingUser(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="border-b border-gray-200 pb-5">
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
                    Manajemen Peran & Akses (RBAC)
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    Atur hak kases dinamis (Spatie Permission) dan tentukan wilayah operasional masing-masing peran pengguna.
                </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 gap-6">
                <button
                    onClick={() => setActiveTab("roles")}
                    className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${activeTab === "roles"
                        ? "border-indigo-600 text-indigo-600"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                        }`}
                >
                    <Shield size={16} /> Daftar Peran & Hak Akses
                </button>
                <button
                    onClick={() => setActiveTab("users")}
                    className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${activeTab === "users"
                        ? "border-indigo-600 text-indigo-600"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                        }`}
                >
                    <Users size={16} /> Akses Pengguna
                </button>
            </div>

            {/* TAB ROLES SCREEN */}
            {activeTab === "roles" && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-800">Daftar Peran yang Tersedia</h3>
                        <button
                            onClick={() => openRoleModal("create")}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition font-semibold"
                        >
                            <Plus size={18} /> Tambah Peran Baru
                        </button>
                    </div>

                    {loadingRoles ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="animate-spin text-indigo-600" size={32} />
                            <p className="text-gray-500 text-sm">Memuat data peran...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-100 rounded-xl shadow-sm gap-3">
                            <AlertCircle className="text-red-500" size={32} />
                            <p className="text-red-500 text-sm font-medium">{error}</p>
                            <button onClick={fetchRoles} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold transition hover:bg-indigo-700">
                                <RefreshCw size={14} /> Coba Lagi
                            </button>
                        </div>
                    ) : roles.length === 0 ? (
                        <div className="text-center py-20 text-gray-500 italic bg-white border border-gray-100 rounded-xl shadow-sm">
                            Tidak ditemukan peran dalam sistem.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {roles.map((role) => (
                                <motion.div
                                    key={role.id}
                                    layout
                                    className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                    <Shield size={16} />
                                                </div>
                                                <h4 className="font-bold text-gray-800 uppercase tracking-wide">{role.name}</h4>
                                            </div>
                                            <span className="text-[10px] bg-gray-100 text-gray-500 font-bold uppercase py-0.5 px-2 rounded">
                                                {role.guard_name}
                                            </span>
                                        </div>
                                        <div className="space-y-1 mb-6">
                                            <p className="text-xs font-semibold text-gray-400">Hak Akses Terkait:</p>
                                            {role.permissions && role.permissions.length > 0 ? (
                                                <div className="flex flex-wrap gap-1.5 pt-1">
                                                    {role.permissions.map((p) => (
                                                        <span key={p.id} className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full px-2 py-0.5 font-medium">
                                                            {getPermissionDisplayName(p.name)}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-gray-400 italic">Belum ada hak akses yang diberikan</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 border-t border-gray-50 pt-4">
                                        <button
                                            onClick={() => openRoleModal("edit", role)}
                                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                            title="Edit Peran"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            className="p-2 text-red-650 hover:bg-red-50 rounded-lg transition"
                                            onClick={() => handleDeleteRole(role.id, role.name)}
                                            title="Hapus Peran"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB USERS ACCESIBILITY SCREEN */}
            {activeTab === "users" && (
                <div className="space-y-6">
                    {/* Filter and search bar */}
                    <div className="flex justify-between items-center gap-3">
                        <div className="relative flex-1 max-w-md">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-450" />
                            <input
                                value={searchUser}
                                onChange={e => {
                                    setSearchUser(e.target.value);
                                    setUserPage(1);
                                }}
                                placeholder="Cari nama atau email user..."
                                className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-xl pl-9 pr-4 py-2.5 outline-none shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                        {loadingUsers ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 className="animate-spin text-indigo-600" size={32} />
                                <p className="text-gray-550 text-sm">Memuat data pengguna...</p>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-20 text-gray-500 italic">
                                Tidak ditemukan data pengguna.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-700">
                                    <thead>
                                        <tr className="border-b border-gray-200 bg-gray-55/30">
                                            <th className="px-5 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Nama Lengkap</th>
                                            <th className="px-5 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Email</th>
                                            <th className="px-5 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Legacy Role</th>
                                            <th className="px-5 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Spatie Roles</th>
                                            <th className="px-5 py-3.5 text-right text-[11px] font-bold text-gray-500 uppercase tracking-widest">Ubah Peran</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {users.map((u) => (
                                            <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-5 py-4 font-semibold text-gray-900">{u.name}</td>
                                                <td className="px-5 py-4 text-gray-550">{u.email}</td>
                                                <td className="px-5 py-4">
                                                    <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                                                        {u.role || "none"}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {u.role_names && u.role_names.length > 0 ? (
                                                            u.role_names.map((rn) => (
                                                                <span key={rn} className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-755 border border-indigo-200 uppercase">
                                                                    {rn}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-gray-400 italic text-xs">Belum set peran</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <button
                                                        onClick={() => openUserModal(u)}
                                                        className="p-2 text-indigo-650 hover:bg-indigo-50 rounded-lg transition inline-flex items-center gap-1.5"
                                                        title="Ganti Peran Pengguna"
                                                    >
                                                        <Key size={14} /> <span className="text-xs font-bold">Ubah</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {userLastPage > 1 && (
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                disabled={userPage === 1}
                                onClick={() => fetchUsers(userPage - 1, searchUser)}
                                className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-600 disabled:opacity-50 transition"
                            >
                                Sebelumnya
                            </button>
                            <span className="text-xs text-gray-500 font-bold self-center">
                                Halaman {userPage} dari {userLastPage}
                            </span>
                            <button
                                disabled={userPage === userLastPage}
                                onClick={() => fetchUsers(userPage + 1, searchUser)}
                                className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-600 disabled:opacity-50 transition"
                            >
                                Selanjutnya
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* MODAL: ADD / EDIT ROLE */}
            <AnimatePresence>
                {showRoleModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowRoleModal(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
                        />
                        {/* Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh] z-10"
                        >
                            <div className="px-6 py-4 border-b border-gray-150 flex items-center justify-between">
                                <h3 className="font-bold text-gray-800 text-lg">
                                    {modalMode === "create" ? "Buat Peran Baru" : `Edit Peran: ${selectedRole?.name}`}
                                </h3>
                                <button onClick={() => setShowRoleModal(false)} className="text-gray-400 hover:text-gray-600 transition">✕</button>
                            </div>

                            <div className="p-6 overflow-y-auto space-y-5 flex-1">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nama Peran *</label>
                                    <input
                                        value={roleName}
                                        onChange={(e) => setRoleName(e.target.value)}
                                        placeholder="Contoh: koordinator_ta, dosen_pembimbing..."
                                        disabled={modalMode === "edit"}
                                        className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:bg-gray-50 disabled:text-gray-400"
                                    />
                                    {modalMode === "edit" && <p className="text-[10px] text-gray-400 mt-1">Nama peran yang sudah ada tidak dapat diubah agar data relasional tetap valid.</p>}
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-xs font-bold text-gray-500 uppercase">Tentukan Hak Akses (Permissions) *</label>
                                    {loadingPerms ? (
                                        <div className="flex items-center gap-2 py-4 justify-center">
                                            <Loader2 size={16} className="animate-spin text-indigo-600" />
                                            <span className="text-gray-400 text-xs">Memuat hak akses...</span>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-150">
                                            {allPermissions.map((perm) => {
                                                const isSelected = selectedPermissions.includes(perm.name);
                                                return (
                                                    <button
                                                        key={perm.id}
                                                        type="button"
                                                        onClick={() => togglePermission(perm.name)}
                                                        className="flex items-center text-left gap-3 px-3 py-2 rounded-lg transition bg-white border border-gray-200 hover:bg-indigo-50/50 hover:border-indigo-300 active:scale-[0.99]"
                                                    >
                                                        {isSelected ? (
                                                            <CheckSquare size={18} className="text-indigo-600 shrink-0" />
                                                        ) : (
                                                            <Square size={18} className="text-gray-300 shrink-0" />
                                                        )}
                                                        <div>
                                                            <p className="text-xs font-semibold text-gray-800 uppercase tracking-wider">{getPermissionDisplayName(perm.name)}</p>
                                                            <p className="text-[10px] text-gray-400 leading-snug">Hak akses untuk guard: {perm.guard_name}</p>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="px-6 py-4 border-t border-gray-150 bg-gray-50/50 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowRoleModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors font-semibold"
                                >
                                    Batalkan
                                </button>
                                <button
                                    onClick={handleRoleSubmit}
                                    disabled={submittingRole}
                                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition font-semibold disabled:opacity-50"
                                >
                                    {submittingRole ? <Loader2 size={15} className="animate-spin" /> : <Check size={16} />}
                                    Simpan Perubahan
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL: EDIT USER ROLE ASSIGNMENTS */}
            <AnimatePresence>
                {showUserModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowUserModal(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
                        />
                        {/* Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden flex flex-col z-10"
                        >
                            <div className="px-6 py-4 border-b border-gray-150 flex items-center justify-between">
                                <h3 className="font-bold text-gray-800 text-lg">Kelola Peran: {selectedUser?.name}</h3>
                                <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-gray-600 transition">✕</button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex gap-3 text-indigo-700 text-xs">
                                    <ShieldAlert size={18} className="shrink-0" />
                                    <div>
                                        <p className="font-bold leading-normal">Status Sinkronisasi Peran</p>
                                        <p className="leading-snug mt-0.5">Memilih beberapa peran diperbolehkan. Peran pertama akan digunakan sebagai fallback di menu navigasi lama.</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase">Pilih Peran untuk Pengguna</label>
                                    <div className="space-y-1.5 max-h-56 overflow-y-auto">
                                        {roles.map((role) => {
                                            const isSelected = userRoles.includes(role.name);
                                            return (
                                                <button
                                                    key={role.id}
                                                    type="button"
                                                    onClick={() => toggleUserRole(role.name)}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition text-left active:scale-[0.99] ${isSelected
                                                        ? "bg-indigo-50 border-indigo-500 text-indigo-700 font-semibold"
                                                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                                                        }`}
                                                >
                                                    {isSelected ? (
                                                        <CheckSquare size={16} className="text-indigo-650" />
                                                    ) : (
                                                        <Square size={16} className="text-gray-300" />
                                                    )}
                                                    <span className="uppercase text-sm tracking-wide">{role.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 border-t border-gray-150 bg-gray-50/50 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowUserModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors font-semibold"
                                >
                                    Batalkan
                                </button>
                                <button
                                    onClick={handleUserSubmit}
                                    disabled={submittingUser}
                                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition font-semibold disabled:opacity-50"
                                >
                                    {submittingUser ? <Loader2 size={15} className="animate-spin" /> : <Check size={16} />}
                                    Simpan Peran
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RoleManagement;
