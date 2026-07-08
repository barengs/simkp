import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
    FileText,
    BookOpen,
    CheckCircle,
    AlertCircle,
    Info,
    User,
    Building,
    Calendar,
    GraduationCap,
    Clock,
    XCircle,
    ArrowRight,
    Plus,
    Trash2,
    ListChecks,
    MessageSquare
} from "lucide-react";
import {
    fetchEligibilityTA,
    registerTA,
    fetchMyTA,
    fetchBimbinganTA,
    fetchSidangTA,
    resetTARegistrationStatus
} from "../store/slice/tugasAkhirSlice";

// Visual timeline stages
const TA_STAGES = [
    { key: "diajukan", label: "Diajukan", icon: FileText },
    { key: "diterima", label: "Diterima", icon: CheckCircle },
    { key: "bimbingan", label: "Bimbingan", icon: BookOpen },
    { key: "ujian", label: "Ujian", icon: GraduationCap },
    { key: "lulus", label: "Lulus", icon: CheckCircle },
];

// Map current status -> active stage index
const getActiveStageIndex = (myTA, bimbinganList, sidangData) => {
    const status = myTA?.status;
    if (status === "lulus") return 4;
    if (status === "disetujui") {
        const hasSidang = sidangData?.schedules && sidangData.schedules.length > 0;
        if (hasSidang) return 3;
        return 2; // bimbingan active
    }
    // pengajuan, revisi_judul, ditolak -> diajukan stage
    return 0;
};

const TATimeline = ({ activeIndex, rejected }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <ListChecks size={14} className="text-emerald-600" /> Tracking Status Tugas Akhir
            </h3>
            <div className="relative flex items-center justify-between">
                {/* connector line */}
                <div className="absolute left-0 right-0 top-5 h-1 bg-gray-200 rounded-full"></div>
                <div
                    className="absolute left-0 top-5 h-1 bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${activeIndex / (TA_STAGES.length - 1) * 100}%` }}
                ></div>

                {TA_STAGES.map((stage, idx) => {
                    const StageIcon = stage.icon;
                    const isDone = idx < activeIndex;
                    const isActive = idx === activeIndex;
                    const isRejectedNode = rejected && idx === 0;
                    return (
                        <div key={stage.key} className="relative z-10 flex flex-col items-center flex-1">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isRejectedNode
                                        ? "bg-red-500 border-red-500 text-white"
                                        : isDone
                                            ? "bg-emerald-500 border-emerald-500 text-white"
                                            : isActive
                                                ? "bg-emerald-100 border-emerald-500 text-emerald-600 animate-pulse"
                                                : "bg-white border-gray-300 text-gray-400"
                                    }`}
                            >
                                <StageIcon size={18} />
                            </div>
                            <span
                                className={`mt-2 text-[11px] font-bold text-center ${isActive || isDone ? "text-gray-900" : "text-gray-400"
                                    }`}
                            >
                                {stage.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const TARegistration = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const {
        eligibility,
        myTA,
        bimbinganList,
        sidangData,
        loading,
        eligibilityLoading,
        registerLoading,
        error,
        registrationSuccess
    } = useSelector((state) => state.tugasAkhir);

    const [formData, setFormData] = useState({
        alternatives: [
            { judul: "", latar_belakang: "", referensi_jurnal: "" }
        ],
    });

    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        Promise.all([
            dispatch(fetchMyTA()),
            dispatch(fetchEligibilityTA()),
            dispatch(fetchBimbinganTA()),
            dispatch(fetchSidangTA()),
        ]).finally(() => setIsChecking(false));
    }, [dispatch]);

    useEffect(() => {
        if (registrationSuccess) {
            toast.success("Pendaftaran Tugas Akhir berhasil diajukan!");
            dispatch(resetTARegistrationStatus());
            dispatch(fetchMyTA());
        }
        if (error) {
            toast.error(error);
            dispatch(resetTARegistrationStatus());
        }
    }, [registrationSuccess, error, dispatch]);

    const handleAlternatifChange = (index, field, value) => {
        setFormData((prev) => {
            const newAlternatives = [...prev.alternatives];
            newAlternatives[index] = { ...newAlternatives[index], [field]: value };
            return { ...prev, alternatives: newAlternatives };
        });
    };

    const handleAddAlternatif = () => {
        setFormData((prev) => ({
            ...prev,
            alternatives: [...prev.alternatives, { judul: "", latar_belakang: "", referensi_jurnal: "" }],
        }));
    };

    const handleRemoveAlternatif = (index) => {
        if (formData.alternatives.length <= 1) {
            toast.error("Minimal harus ada satu alternatif judul.");
            return;
        }
        setFormData((prev) => {
            const newAlternatives = [...prev.alternatives];
            newAlternatives.splice(index, 1);
            return { ...prev, alternatives: newAlternatives };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const firstAlt = formData.alternatives[0];
        if (!firstAlt.judul.trim()) {
            toast.error("Judul alternatif pertama wajib diisi.");
            return;
        }
        if (firstAlt.judul.length < 10) {
            toast.error("Judul Tugas Akhir minimal 10 karakter.");
            return;
        }
        if (!firstAlt.latar_belakang.trim()) {
            toast.error("Latar belakang singkat wajib diisi.");
            return;
        }

        // Build payload - keep single-title fields for backend compatibility + send alternatives
        const payload = {
            judul_diajukan: firstAlt.judul,
            latar_belakang_singkat: firstAlt.latar_belakang,
            referensi_jurnal: firstAlt.referensi_jurnal,
            alternatives: formData.alternatives,
        };

        dispatch(registerTA(payload));
    };

    const renderStatusBadge = (status) => {
        const styles = {
            pengajuan: "bg-blue-100 text-blue-800 border-blue-200",
            disetujui: "bg-green-100 text-green-800 border-green-200",
            ditolak: "bg-red-100 text-red-800 border-red-200",
            lulus: "bg-emerald-100 text-emerald-800 border-emerald-200",
            revisi_judul: "bg-amber-100 text-amber-800 border-amber-200",
        };
        const labels = {
            pengajuan: "Menunggu Persetujuan",
            disetujui: "Judul Disetujui",
            ditolak: "Ditolak",
            lulus: "Selesai / Lulus TA",
            revisi_judul: "Revisi Judul",
        };
        return (
            <span className={`px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-wider border shadow-sm whitespace-nowrap ${styles[status] || "bg-gray-100 text-gray-800 border-gray-200"}`}>
                {labels[status] || status}
            </span>
        );
    };

    if (isChecking || loading || eligibilityLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-screen">
                <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-medium font-inter">Memeriksa Status & Kelayakan Tugas Akhir...</p>
            </div>
        );
    }

    // 1) Student has an active TA registration
    if (myTA) {
        const activeIndex = getActiveStageIndex(myTA, bimbinganList, sidangData);
        return (
            <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="mb-8 text-center sm:text-left">
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                        <GraduationCap className="text-emerald-600" size={32} />
                        Status Tugas Akhir Anda
                    </h2>
                    <p className="mt-2 text-gray-500 text-sm">Informasi pengajuan dan bimbingan Tugas Akhir (TA) Anda.</p>
                </div>

                {myTA.status === 'ditolak' && (
                    <div className="mb-8 p-5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-4 shadow-sm">
                        <XCircle className="text-red-500 shrink-0 mt-0.5" size={24} />
                        <div>
                            <h4 className="text-lg font-bold text-red-900">Pengajuan Tugas Akhir Ditolak</h4>
                            <p className="text-sm text-red-700 mt-2">
                                Catatan Dosen/Admin: <strong className="bg-red-100 px-2 py-0.5 rounded">{myTA.rejection_note || "Tidak ada catatan."}</strong>
                            </p>
                            <p className="text-sm text-red-700 mt-3 font-medium">
                                Anda dapat mendaftar ulang Tugas Akhir dengan mengajukan judul yang baru di bawah ini.
                            </p>
                        </div>
                    </div>
                )}

                {/* Visual Timeline */}
                <TATimeline activeIndex={activeIndex} rejected={myTA.status === 'ditolak'} />

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                    <div className="p-6 sm:p-8 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded">Tugas Akhir</span>
                            <h3 className="text-lg font-bold text-gray-900 mt-1">Detail Pendaftaran</h3>
                        </div>
                        {renderStatusBadge(myTA.status)}
                    </div>

                    <div className="p-6 sm:p-8 space-y-6">
                        <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Judul yang Diajukan</span>
                            <p className="text-gray-800 font-bold text-base leading-snug">{myTA.judul_diajukan}</p>
                        </div>

                        {/* Multi-alternative titles */}
                        {myTA.alternatives && myTA.alternatives.length > 0 && (
                            <div className="space-y-3">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Daftar Alternatif Judul</span>
                                {myTA.alternatives.map((alt, i) => (
                                    <div key={i} className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                                        <p className="text-gray-800 font-semibold text-sm">{i + 1}. {alt.judul}</p>
                                        {alt.latar_belakang && (
                                            <p className="text-gray-600 text-xs mt-1 whitespace-pre-line">{alt.latar_belakang}</p>
                                        )}
                                        {alt.referensi_jurnal && (
                                            <p className="text-gray-500 text-xs mt-1 italic">Ref: {alt.referensi_jurnal}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {myTA.judul_disetujui && (
                            <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block mb-1">Judul yang Disetujui</span>
                                <p className="text-emerald-950 font-bold text-base leading-snug">{myTA.judul_disetujui}</p>
                            </div>
                        )}

                        <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Latar Belakang Singkat</span>
                            <p className="text-gray-600 text-sm font-medium leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-xl border border-gray-100">
                                {myTA.latar_belakang_singkat}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                            <div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">Dosen Pembimbing</span>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">1</div>
                                        <div className="min-w-0">
                                            <p className="text-gray-900 font-semibold text-sm truncate">{myTA.pembimbing_1?.name || "Belum ditentukan"}</p>
                                            <p className="text-[10px] text-gray-500 font-bold tracking-tight">Pembimbing Utama</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0">2</div>
                                        <div className="min-w-0">
                                            <p className="text-gray-900 font-semibold text-sm truncate">{myTA.pembimbing_2?.name || "Belum ditentukan"}</p>
                                            <p className="text-[10px] text-gray-500 font-bold tracking-tight">Pembimbing Pendamping</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">Referensi Kerja Praktek</span>
                                {myTA.internship ? (
                                    <div className="bg-emerald-50/20 border border-emerald-900/10 p-4 rounded-xl space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Building size={16} className="text-emerald-600 shrink-0" />
                                            <span className="text-xs font-bold text-gray-800 truncate">{myTA.internship.company?.name || "Mitra Kerja Praktek"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <BookOpen size={16} className="text-emerald-600 shrink-0" />
                                            <span className="text-xs text-gray-600 truncate">Tema: {myTA.internship.theme?.name || "-"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} className="text-emerald-600 shrink-0" />
                                            <span className="text-xs text-gray-600">
                                                Periode: {myTA.internship.period ? `${myTA.internship.period.semester} ${myTA.internship.period.academic_year}` : "-"}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">Data KP tidak tersemat.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 2) Not eligible
    if (eligibility && !eligibility.eligible) {
        return (
            <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="mb-8 text-center sm:text-left">
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                        <GraduationCap className="text-emerald-600" size={32} />
                        Pendaftaran Tugas Akhir
                    </h2>
                    <p className="mt-2 text-gray-500 text-sm">Pengajuan proposal Tugas Akhir mahasiswa tingkat akhir.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-6 sm:p-10 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-6 border-4 border-red-50">
                        <AlertCircle size={32} />
                    </div>
                    <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">Persyaratan Belum Terpenuhi</h3>
                    <p className="mt-3 text-gray-500 max-w-lg text-sm font-medium leading-relaxed">
                        {eligibility.reason || "Anda harus menyelesaikan Kerja Praktek (KP) terlebih dahulu sebelum dapat mendaftar Tugas Akhir."}
                    </p>
                </div>
            </div>
        );
    }

    // 3) Eligible & no active TA -> Multi-alternative proposal form
    return (
        <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center sm:text-left">
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                    <GraduationCap className="text-emerald-600" size={32} />
                    Pendaftaran Tugas Akhir
                </h2>
                <p className="mt-2 text-gray-500 text-sm">Ajukan usulan judul Tugas Akhir (bisa lebih dari 1 alternatif) beserta latar belakang dan referensi jurnal.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 sm:p-10 space-y-6">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-1">
                                <FileText className="text-emerald-600" size={20} />
                                Formulir Pengajuan Judul
                            </h3>
                            <p className="text-xs text-gray-400">Anda dapat mengajukan lebih dari satu alternatif judul.</p>
                        </div>

                        {formData.alternatives.map((alt, index) => (
                            <div key={index} className="p-5 border border-gray-200 rounded-2xl space-y-4 bg-gray-50/30">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-bold text-emerald-700 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">{index + 1}</span>
                                        Alternatif Judul {index + 1}
                                    </h4>
                                    {formData.alternatives.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveAlternatif(index)}
                                            className="text-gray-400 hover:text-red-600 transition-colors"
                                            title="Hapus alternatif"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Judul Tugas Akhir</label>
                                    <input
                                        type="text"
                                        value={alt.judul}
                                        onChange={(e) => handleAlternatifChange(index, "judul", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm font-medium text-gray-800 placeholder-gray-400"
                                        placeholder={`Masukkan judul alternatif ${index + 1}...`}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Latar Belakang Singkat</label>
                                    <textarea
                                        value={alt.latar_belakang}
                                        onChange={(e) => handleAlternatifChange(index, "latar_belakang", e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm font-medium text-gray-800 placeholder-gray-400"
                                        placeholder="Deskripsikan latar belakang masalah..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Referensi Jurnal</label>
                                    <textarea
                                        value={alt.referensi_jurnal}
                                        onChange={(e) => handleAlternatifChange(index, "referensi_jurnal", e.target.value)}
                                        rows={2}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm font-medium text-gray-800 placeholder-gray-400"
                                        placeholder="Pisahkan dengan koma (contoh: Author A, 2020; Author B, 2021)..."
                                    />
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={handleAddAlternatif}
                            className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-emerald-300 text-emerald-600 rounded-xl font-semibold text-sm hover:bg-emerald-50 transition-all w-full justify-center"
                        >
                            <Plus size={16} /> Tambah Alternatif Judul
                        </button>
                    </div>

                    <div className="px-6 sm:px-10 py-6 bg-gray-50 flex justify-end items-center border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={registerLoading}
                            className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {registerLoading && (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            )}
                            <span>{registerLoading ? "Mengajukan..." : "Kirim Pengajuan"}</span>
                            {!registerLoading && <ArrowRight size={16} />}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TARegistration;
