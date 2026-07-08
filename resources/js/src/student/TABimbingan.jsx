import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
    Book,
    Plus,
    Calendar,
    User,
    FileText,
    Download,
    Trash2,
    CheckCircle,
    AlertCircle,
    Clock,
    FileUp,
    MessageSquare
} from "lucide-react";
import {
    fetchBimbinganTA,
    createBimbinganTA,
    deleteBimbinganTA,
    fetchMyTA,
    sendBimbinganMessage,
    fetchBimbinganMessages,
    resetTARegistrationStatus
} from "../store/slice/tugasAkhirSlice";

const TABimbingan = () => {
    const dispatch = useDispatch();
    const { myTA, bimbinganList, loading, actionLoading, error, actionSuccess, bimbinganMessages } = useSelector((state) => state.tugasAkhir);

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        tanggal_bimbingan: new Date().toISOString().split('T')[0],
        topik_bahasan: "",
        catatan_mahasiswa: "",
        file_draft: null
    });
    const [messageInput, setMessageInput] = useState("");
    const [activeBimbinganId, setActiveBimbinganId] = useState(null);

    useEffect(() => {
        dispatch(fetchMyTA());
        dispatch(fetchBimbinganTA());
    }, [dispatch]);

    useEffect(() => {
        if (actionSuccess) {
            toast.success("Catatan bimbingan berhasil diajukan!");
            setShowForm(false);
            setFormData({
                tanggal_bimbingan: new Date().toISOString().split('T')[0],
                topik_bahasan: "",
                catatan_mahasiswa: "",
                file_draft: null
            });
            dispatch(resetTARegistrationStatus());
            dispatch(fetchBimbinganTA());
            // Optionally refetch messages if a chat was active
            if (activeBimbinganId) {
                dispatch(fetchBimbinganMessages(activeBimbinganId));
            }
        }
        if (error) {
            toast.error(error);
            dispatch(resetTARegistrationStatus());
        }
    }, [actionSuccess, error, dispatch, activeBimbinganId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, file_draft: e.target.files[0] }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.topik_bahasan.trim()) {
            toast.error("Topik bahasan wajib diisi.");
            return;
        }
        if (formData.topik_bahasan.length < 10) {
            toast.error("Topik bahasan minimal 10 karakter.");
            return;
        }

        const data = new FormData();
        data.append("tanggal_bimbingan", formData.tanggal_bimbingan);
        data.append("topik_bahasan", formData.topik_bahasan);
        data.append("catatan_mahasiswa", formData.catatan_mahasiswa);
        if (formData.file_draft) {
            data.append("file_draft", formData.file_draft);
        }

        // Set supervisor 1 as default dosen
        if (myTA?.pembimbing_1_id) {
            data.append("dosen_id", myTA.pembimbing_1_id);
        }

        dispatch(createBimbinganTA(data));
    };

    const handleSendMessage = (bimbinganId) => {
        if (messageInput.trim() === "") return;
        dispatch(sendBimbinganMessage({ bimbinganId, message: messageInput }));
        setMessageInput("");
    };

    const handleToggleMessage = (bimbinganId) => {
        if (activeBimbinganId === bimbinganId) {
            setActiveBimbinganId(null);
        } else {
            setActiveBimbinganId(bimbinganId);
            dispatch(fetchBimbinganMessages(bimbinganId));
        }
    };

    const handleDelete = (id) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus catatan bimbingan ini?")) {
            dispatch(deleteBimbinganTA(id));
        }
    };

    // Helper for rendering Bimbingan status badge
    const renderStatusBadge = (status) => {
        const styles = {
            pending: "bg-amber-50 text-amber-700 border-amber-200",
            diterima: "bg-emerald-50 text-emerald-700 border-emerald-200",
            revisi: "bg-red-50 text-red-700 border-red-200",
        };

        const labels = {
            pending: "Menunggu Validasi",
            diterima: "Disetujui Dosen",
            revisi: "Perlu Revisi",
        };

        return (
            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider border shadow-sm ${styles[status] || "bg-gray-100 text-gray-800"}`}>
                {labels[status] || status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-screen">
                <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-medium font-inter">Memuat Data Bimbingan...</p>
            </div>
        );
    }

    if (!myTA || myTA.status === 'pengajuan' || myTA.status === 'revisi_judul' || myTA.status === 'ditolak') {
        return (
            <div className="max-w-4xl mx-auto py-6 px-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-6 border-4 border-amber-50">
                        <AlertCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Bimbingan Belum Aktif</h3>
                    <p className="mt-2 text-gray-500 text-sm max-w-md leading-relaxed">
                        Anda baru dapat mengakses bimbingan Tugas Akhir setelah pengajuan judul Anda disetujui oleh Koordinator TA / Kaprodi.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                        <Book className="text-emerald-600" size={32} />
                        Bimbingan Tugas Akhir
                    </h2>
                    <p className="mt-2 text-gray-500 text-sm">Catat kemajuan mingguan Anda dan unggah draft bimbingan Tugas Akhir.</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100"
                    >
                        <Plus size={16} />
                        Catat Bimbingan
                    </button>
                )}
            </div>

            {/* Bimbingan Submission Form */}
            {showForm && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8 animate-fadeIn">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-900">Catat Kemajuan Bimbingan</h3>
                        <button
                            onClick={() => setShowForm(false)}
                            className="text-xs font-semibold text-gray-400 hover:text-gray-600"
                        >
                            Batal
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Tanggal Bimbingan</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        name="tanggal_bimbingan"
                                        value={formData.tanggal_bimbingan}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Dosen Pembimbing</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-500 cursor-not-allowed"
                                    value={myTA.pembimbing_1?.name || "Belum ditentukan"}
                                    disabled
                                    readOnly
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Topik Bahasan</label>
                            <input
                                type="text"
                                name="topik_bahasan"
                                value={formData.topik_bahasan}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                placeholder="Misal: Diskusi Bab III dan perancangan database..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Catatan / Detail Kemajuan</label>
                            <textarea
                                name="catatan_mahasiswa"
                                value={formData.catatan_mahasiswa}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                placeholder="Detailkan pengerjaan yang sudah Anda lakukan..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Unggah Draft Dokumen (PDF/Word)</label>
                            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-emerald-500 transition-colors relative">
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center gap-2 text-gray-400">
                                    <FileUp size={28} className="text-gray-300" />
                                    <span className="text-sm font-semibold text-gray-700">
                                        {formData.file_draft ? formData.file_draft.name : "Pilih file draft bimbingan"}
                                    </span>
                                    <span className="text-[10px] text-gray-400">Maks. 10MB (PDF, DOC, DOCX)</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-3">
                            <button
                                type="submit"
                                disabled={actionLoading}
                                className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-all disabled:opacity-50"
                            >
                                {actionLoading ? "Menyimpan..." : "Kirim Catatan"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Bimbingan List */}
            <div className="space-y-4">
                {bimbinganList && bimbinganList.length > 0 ? (
                    bimbinganList.map((b) => (
                        <div key={b.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:border-emerald-200 transition-all">
                            <div className="p-6">
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            <Calendar size={14} />
                                            <span>{b.tanggal_bimbingan}</span>
                                            <span>•</span>
                                            <User size={14} />
                                            <span>{b.dosen?.name || "Pembimbing"}</span>
                                        </div>
                                        <h4 className="text-base font-bold text-gray-900 mt-2">{b.topik_bahasan}</h4>
                                    </div>
                                    <div className="flex items-center gap-3 self-end sm:self-start">
                                        {renderStatusBadge(b.status)}
                                        <button
                                            onClick={() => handleToggleMessage(b.id)}
                                            className="p-1.5 text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                            title="Diskusi"
                                        >
                                            <MessageSquare size={16} />
                                        </button>
                                        {b.status === 'pending' && (
                                            <button
                                                onClick={() => handleDelete(b.id)}
                                                className="p-1.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title="Hapus Bimbingan"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    {b.catatan_mahasiswa || "Tidak ada detail catatan mahasiswa."}
                                </p>

                                {b.catatan_dosen && (
                                    <div className="mt-4 p-4 bg-emerald-50/30 border border-emerald-100 rounded-xl flex gap-3">
                                        <MessageSquare size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block mb-1">Catatan Pembimbing</span>
                                            <p className="text-emerald-950 text-xs font-semibold leading-relaxed whitespace-pre-line">{b.catatan_dosen}</p>
                                        </div>
                                    </div>
                                )}

                                {b.file_draft && (
                                    <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                                        <div className="flex items-center gap-2 text-gray-600 font-semibold truncate">
                                            <FileText size={16} className="text-gray-400" />
                                            <span className="truncate">Draft Dokumen Pengerjaan</span>
                                        </div>
                                        <a
                                            href={`/storage/${b.file_draft}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-emerald-600 font-bold hover:bg-emerald-50 transition-all shrink-0 shadow-sm"
                                        >
                                            <Download size={12} />
                                            Unduh
                                        </a>
                                    </div>
                                )}

                                {/* Discussion Section */}
                                {activeBimbinganId === b.id && (
                                    <div className="mt-6 border-t border-gray-100 pt-6 space-y-4">
                                        <h5 className="text-sm font-bold text-gray-700">Diskusi Sesi Bimbingan</h5>
                                        <div className="max-h-60 overflow-y-auto pr-2 space-y-3">
                                            {bimbinganMessages[b.id]?.length > 0 ? (
                                                bimbinganMessages[b.id].map((msg) => (
                                                    <div key={msg.id} className={`flex ${msg.is_student ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`p-3 rounded-lg max-w-[70%] ${msg.is_student ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                                                            <p className="text-xs font-semibold">{msg.message}</p>
                                                            <span className={`text-[10px] mt-1 block ${msg.is_student ? 'text-emerald-200' : 'text-gray-500'}`}>
                                                                {msg.user_name} - {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-xs text-gray-500 italic text-center">Belum ada diskusi untuk sesi ini.</p>
                                            )}
                                        </div>

                                        <div className="flex gap-2 mt-4">
                                            <input
                                                type="text"
                                                value={messageInput}
                                                onChange={(e) => setMessageInput(e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        handleSendMessage(b.id);
                                                    }
                                                }}
                                                className="flex-grow px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                placeholder="Tulis pesan..."
                                                disabled={actionLoading}
                                            />
                                            <button
                                                onClick={() => handleSendMessage(b.id)}
                                                className="btn-sm btn-primary flex items-center gap-1"
                                                disabled={actionLoading || messageInput.trim() === ""}
                                            >
                                                Kirim
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl flex flex-col items-center gap-3">
                        <div className="p-4 bg-gray-50 rounded-full text-gray-300">
                            <Book size={32} />
                        </div>
                        <p className="text-gray-400 font-semibold text-sm">Belum ada catatan bimbingan.</p>
                        <p className="text-[10px] text-gray-300 uppercase font-bold tracking-tighter">Silakan catat kemajuan bimbingan pertama Anda menggunakan tombol di atas.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TABimbingan;
