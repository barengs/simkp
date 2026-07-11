import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle, XCircle, UserCheck, Clock, Filter,
    BookOpen, ChevronDown, Search, AlertCircle,
    FileText, X, Check, Loader2, GraduationCap
} from "lucide-react";
import api from "../api";

/* ─── Status badge helper ─── */
const StatusBadge = ({ status }) => {
    const map = {
        pengajuan: { label: "Menunggu Review",  bg: "bg-amber-100 text-amber-700 border-amber-200" },
        bimbingan: { label: "Aktif Bimbingan",  bg: "bg-green-100 text-green-700 border-green-200" },
        ditolak:   { label: "Ditolak",           bg: "bg-red-100 text-red-700 border-red-200" },
        selesai:   { label: "Selesai",           bg: "bg-blue-100 text-blue-700 border-blue-200" },
        batal:     { label: "Dibatalkan",        bg: "bg-gray-100 text-gray-600 border-gray-200" },
    };
    const cfg = map[status] || { label: status, bg: "bg-gray-100 text-gray-600 border-gray-200" };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.bg}`}>
            {cfg.label}
        </span>
    );
};

/* ─── Modal: Approve ─── */
const ApproveModal = ({ ta, lecturers, onClose, onSuccess }) => {
    const [judulDisetujui, setJudulDisetujui] = useState(ta.judul_diajukan || "");
    const [p1, setP1] = useState("");
    const [p2, setP2] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async () => {
        if (!judulDisetujui.trim()) { setError("Judul yang disetujui wajib diisi."); return; }
        if (!p1) { setError("Dosen Pembimbing 1 wajib dipilih."); return; }
        setError(null);
        setLoading(true);
        try {
            await api.post(`/koordinator/ta/${ta.id}/approve`, { judul_disetujui: judulDisetujui });
            await api.post(`/koordinator/ta/${ta.id}/assign-pembimbing`, {
                pembimbing_1_id: p1,
                pembimbing_2_id: p2 || null,
            });
            onSuccess("Pengajuan TA berhasil disetujui dan dosen pembimbing telah ditetapkan!");
            onClose();
        } catch (err) {
            setError(err?.response?.data?.message || "Terjadi kesalahan.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                className="bg-[#0a1f14] border border-emerald-800/50 rounded-2xl w-full max-w-lg shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-800/40">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                            <CheckCircle className="text-emerald-400" size={20} />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-sm">Setujui Pengajuan TA</h3>
                            <p className="text-emerald-400/70 text-xs">{ta.user?.name || "—"}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">
                    {error && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Judul asal */}
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Judul yang Diajukan Mahasiswa</label>
                        <p className="text-white/70 text-sm bg-white/5 border border-white/10 rounded-lg p-3 leading-relaxed">
                            {ta.judul_diajukan}
                        </p>
                    </div>

                    {/* Judul yang disetujui (editable) */}
                    <div>
                        <label className="block text-xs text-emerald-400 font-semibold mb-1">
                            Judul Final yang Disetujui <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            rows={3}
                            value={judulDisetujui}
                            onChange={e => setJudulDisetujui(e.target.value)}
                            placeholder="Edit atau konfirmasi judul TA mahasiswa..."
                            className="w-full bg-white/5 border border-emerald-700/50 text-white text-sm rounded-lg p-3 outline-none focus:border-emerald-500 resize-none transition-colors"
                        />
                    </div>

                    {/* Dosen Pembimbing 1 */}
                    <div>
                        <label className="block text-xs text-emerald-400 font-semibold mb-1">
                            Dosen Pembimbing 1 <span className="text-red-400">*</span>
                        </label>
                        <select
                            value={p1}
                            onChange={e => setP1(e.target.value)}
                            className="w-full bg-[#071a0f] border border-emerald-700/50 text-white text-sm rounded-lg p-2.5 outline-none focus:border-emerald-500 transition-colors"
                        >
                            <option value="">— Pilih Dosen —</option>
                            {lecturers.map(l => (
                                <option key={l.id} value={l.id}>{l.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Dosen Pembimbing 2 */}
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Dosen Pembimbing 2 (opsional)</label>
                        <select
                            value={p2}
                            onChange={e => setP2(e.target.value)}
                            className="w-full bg-[#071a0f] border border-emerald-800/40 text-white/80 text-sm rounded-lg p-2.5 outline-none focus:border-emerald-600 transition-colors"
                        >
                            <option value="">— Tidak Ada / Pilih Dosen —</option>
                            {lecturers.filter(l => String(l.id) !== String(p1)).map(l => (
                                <option key={l.id} value={l.id}>{l.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-emerald-800/40">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                        Setujui & Tetapkan
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

/* ─── Modal: Reject ─── */
const RejectModal = ({ ta, onClose, onSuccess }) => {
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async () => {
        if (!note.trim()) { setError("Catatan penolakan wajib diisi."); return; }
        setError(null);
        setLoading(true);
        try {
            await api.post(`/koordinator/ta/${ta.id}/reject`, { rejection_note: note });
            onSuccess("Pengajuan TA berhasil ditolak.");
            onClose();
        } catch (err) {
            setError(err?.response?.data?.message || "Terjadi kesalahan.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                className="bg-[#0a1f14] border border-red-800/50 rounded-2xl w-full max-w-md shadow-2xl"
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-red-800/40">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center">
                            <XCircle className="text-red-400" size={20} />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-sm">Tolak Pengajuan TA</h3>
                            <p className="text-red-400/70 text-xs">{ta.user?.name || "—"}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={18} /></button>
                </div>

                <div className="px-6 py-5 space-y-4">
                    {error && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />{error}
                        </div>
                    )}
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Judul Diajukan</label>
                        <p className="text-white/60 text-sm bg-white/5 border border-white/10 rounded-lg p-3 leading-relaxed">{ta.judul_diajukan}</p>
                    </div>
                    <div>
                        <label className="block text-xs text-red-400 font-semibold mb-1">Alasan Penolakan <span className="text-red-400">*</span></label>
                        <textarea
                            rows={4}
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder="Tuliskan alasan penolakan yang jelas agar mahasiswa dapat memperbaiki pengajuannya..."
                            className="w-full bg-white/5 border border-red-700/50 text-white text-sm rounded-lg p-3 outline-none focus:border-red-500 resize-none transition-colors"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 px-6 py-4 border-t border-red-800/40">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">Batal</button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />}
                        Tolak Pengajuan
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

/* ─── Modal: Assign Pembimbing (utk TA yg sudah bimbingan tapi belum ada pembimbing) ─── */
const AssignModal = ({ ta, lecturers, onClose, onSuccess }) => {
    const [p1, setP1] = useState(ta.pembimbing_1_id ? String(ta.pembimbing_1_id) : "");
    const [p2, setP2] = useState(ta.pembimbing_2_id ? String(ta.pembimbing_2_id) : "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async () => {
        if (!p1) { setError("Dosen Pembimbing 1 wajib dipilih."); return; }
        setError(null);
        setLoading(true);
        try {
            await api.post(`/koordinator/ta/${ta.id}/assign-pembimbing`, {
                pembimbing_1_id: p1,
                pembimbing_2_id: p2 || null,
            });
            onSuccess("Dosen pembimbing berhasil diperbarui.");
            onClose();
        } catch (err) {
            setError(err?.response?.data?.message || "Terjadi kesalahan.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                className="bg-[#0a1f14] border border-blue-800/50 rounded-2xl w-full max-w-md shadow-2xl"
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-blue-800/40">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center">
                            <UserCheck className="text-blue-400" size={20} />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-sm">Ganti / Tetapkan Pembimbing</h3>
                            <p className="text-blue-400/70 text-xs">{ta.user?.name || "—"}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={18} /></button>
                </div>
                <div className="px-6 py-5 space-y-4">
                    {error && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />{error}
                        </div>
                    )}
                    <div>
                        <label className="block text-xs text-blue-400 font-semibold mb-1">Pembimbing 1 <span className="text-red-400">*</span></label>
                        <select value={p1} onChange={e => setP1(e.target.value)} className="w-full bg-[#071a0f] border border-blue-700/50 text-white text-sm rounded-lg p-2.5 outline-none focus:border-blue-500 transition-colors">
                            <option value="">— Pilih Dosen —</option>
                            {lecturers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Pembimbing 2 (opsional)</label>
                        <select value={p2} onChange={e => setP2(e.target.value)} className="w-full bg-[#071a0f] border border-blue-800/40 text-white/80 text-sm rounded-lg p-2.5 outline-none transition-colors">
                            <option value="">— Tidak Ada —</option>
                            {lecturers.filter(l => String(l.id) !== String(p1)).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-blue-800/40">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">Batal</button>
                    <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-60">
                        {loading ? <Loader2 size={15} className="animate-spin" /> : <UserCheck size={15} />}
                        Simpan
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

/* ═══════════════════════════════════════════════
   HALAMAN UTAMA: Koordinator Manajemen TA
═══════════════════════════════════════════════ */
const KoordinatorTA = () => {
    const [submissions, setSubmissions] = useState([]);
    const [lecturers, setLecturers]     = useState([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState(null);
    const [filterStatus, setFilterStatus] = useState("");
    const [search, setSearch]           = useState("");
    const [successMsg, setSuccessMsg]   = useState(null);

    // Modals
    const [approveTarget, setApproveTarget] = useState(null);
    const [rejectTarget, setRejectTarget]   = useState(null);
    const [assignTarget, setAssignTarget]   = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [taRes, lecRes] = await Promise.all([
                api.get(`/koordinator/ta${filterStatus ? `?status=${filterStatus}` : ""}`),
                api.get("/lecturers"),
            ]);
            setSubmissions(taRes.data?.data || []);
            setLecturers(lecRes.data?.data || lecRes.data || []);
        } catch (err) {
            setError("Gagal memuat data. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    }, [filterStatus]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSuccess = (msg) => {
        setSuccessMsg(msg);
        fetchData();
        setTimeout(() => setSuccessMsg(null), 4000);
    };

    /* Filter & search */
    const filtered = submissions.filter(ta => {
        const q = search.toLowerCase();
        return (
            (ta.user?.name || "").toLowerCase().includes(q) ||
            (ta.judul_diajukan || "").toLowerCase().includes(q) ||
            (ta.judul_disetujui || "").toLowerCase().includes(q)
        );
    });

    /* Stats */
    const stats = {
        pengajuan: submissions.filter(s => s.status === "pengajuan").length,
        bimbingan: submissions.filter(s => s.status === "bimbingan").length,
        ditolak:   submissions.filter(s => s.status === "ditolak").length,
        total:     submissions.length,
    };

    const statusOptions = [
        { value: "", label: "Semua Status" },
        { value: "pengajuan", label: "Menunggu Review" },
        { value: "bimbingan", label: "Aktif Bimbingan" },
        { value: "ditolak", label: "Ditolak" },
        { value: "selesai", label: "Selesai" },
    ];

    return (
        <>
            <div className="space-y-6">
                <div className="border-b border-gray-200 pb-5">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Manajemen Pengajuan TA
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Review, setujui, dan plot dosen pembimbing Tugas Akhir mahasiswa
                    </p>
                </div>

                <AnimatePresence>
                    {successMsg && (
                        <motion.div
                            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                            className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm"
                        >
                            <CheckCircle size={18} className="shrink-0" />
                            {successMsg}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Total Pengajuan", value: stats.total, icon: FileText, color: "text-indigo-600", bg: "bg-indigo-100" },
                        { label: "Menunggu Review", value: stats.pengajuan, icon: Clock, color: "text-amber-600", bg: "bg-amber-100" },
                        { label: "Aktif Bimbingan", value: stats.bimbingan, icon: BookOpen, color: "text-blue-600", bg: "bg-blue-100" },
                        { label: "Ditolak", value: stats.ditolak, icon: XCircle, color: "text-red-600", bg: "bg-red-100" },
                    ].map((s, i) => (
                        <div
                            key={i}
                            className="bg-white shadow rounded-lg p-4 flex items-center gap-3"
                        >
                            <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
                                <s.icon className={s.color} size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                                <p className="text-xs text-gray-500">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Cari nama mahasiswa atau judul TA..."
                            className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div className="relative sm:w-56">
                        <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                            className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer bg-white"
                        >
                            {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-lg"><div className="px-4 py-5 sm:p-6">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-4">
                                <Loader2 className="animate-spin text-indigo-600" size={32} />
                                <p className="text-gray-500 text-sm">Memuat data pengajuan...</p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-3">
                                <AlertCircle className="text-red-500" size={32} />
                                <p className="text-red-600 text-sm">{error}</p>
                                <button onClick={fetchData} className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm transition-colors">Coba Lagi</button>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-3">
                                <GraduationCap className="text-gray-300" size={48} />
                                <p className="text-gray-500 text-sm">Tidak ada data pengajuan TA{search ? ` untuk "${search}"` : ""}</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mahasiswa</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul TA</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pembimbing</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filtered.map((ta, idx) => (
                                            <tr key={ta.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-4 text-gray-500 text-xs">{idx + 1}</td>
                                                <td className="px-4 py-4">
                                                    <p className="font-medium text-gray-900">{ta.user?.name || "—"}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{ta.user?.email || "—"}</p>
                                                </td>
                                                <td className="px-4 py-4 max-w-xs">
                                                    <p className="text-gray-900 leading-snug line-clamp-2">{ta.judul_diajukan}</p>
                                                    {ta.judul_disetujui && ta.judul_disetujui !== ta.judul_diajukan && (
                                                        <p className="text-green-600 text-xs mt-1 line-clamp-1">✓ {ta.judul_disetujui}</p>
                                                    )}
                                                    {ta.rejection_note && (
                                                        <p className="text-red-600 text-xs mt-1 line-clamp-2">✗ {ta.rejection_note}</p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4">
                                                    {ta.pembimbing1 ? (
                                                        <div className="space-y-0.5">
                                                            <p className="text-gray-900 text-xs font-medium">{ta.pembimbing1.name}</p>
                                                            {ta.pembimbing2 && <p className="text-gray-500 text-xs">{ta.pembimbing2.name}</p>}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs italic">Belum ditetapkan</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <StatusBadge status={ta.status} />
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {ta.status === "pengajuan" && (
                                                            <>
                                                                <button
                                                                    onClick={() => setApproveTarget(ta)}
                                                                    title="Setujui"
                                                                    className="text-green-600 hover:text-green-800"
                                                                >
                                                                    <CheckCircle size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => setRejectTarget(ta)}
                                                                    title="Tolak"
                                                                    className="text-red-600 hover:text-red-800"
                                                                >
                                                                    <XCircle size={18} />
                                                                </button>
                                                            </>
                                                        )}
                                                        {ta.status === "bimbingan" && (
                                                            <button
                                                                onClick={() => setAssignTarget(ta)}
                                                                title="Ganti / Tetapkan Pembimbing"
                                                                className="text-indigo-600 hover:text-indigo-800"
                                                            >
                                                                <UserCheck size={18} />
                                                            </button>
                                                        )}
                                                        {(ta.status === "ditolak" || ta.status === "selesai" || ta.status === "batal") && (
                                                            <span className="text-gray-400 text-xs">—</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {approveTarget && (
                    <ApproveModal
                        ta={approveTarget}
                        lecturers={lecturers}
                        onClose={() => setApproveTarget(null)}
                        onSuccess={handleSuccess}
                    />
                )}
                {rejectTarget && (
                    <RejectModal
                        ta={rejectTarget}
                        onClose={() => setRejectTarget(null)}
                        onSuccess={handleSuccess}
                    />
                )}
                {assignTarget && (
                    <AssignModal
                        ta={assignTarget}
                        lecturers={lecturers}
                        onClose={() => setAssignTarget(null)}
                        onSuccess={handleSuccess}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default KoordinatorTA;
