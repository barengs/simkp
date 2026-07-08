import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { 
    Calendar, 
    FileText, 
    Upload, 
    Download, 
    CheckCircle, 
    AlertCircle, 
    Clock, 
    MapPin, 
    Link as LinkIcon, 
    FileCheck,
    MessageSquare,
    Send
} from "lucide-react";
import { 
    fetchSidangTA, 
    uploadSidangRequirement, 
    submitSidangRevision, 
    resetTARegistrationStatus 
} from "../store/slice/tugasAkhirSlice";

const TASidang = () => {
    const dispatch = useDispatch();
    const { sidangData, loading, actionLoading, error, actionSuccess } = useSelector((state) => state.tugasAkhir);

    const [uploadingDoc, setUploadingDoc] = useState(null); // name of document being uploaded
    const [selectedNilaiId, setSelectedNilaiId] = useState(null); // ID of examiner score for revision
    const [revisionFile, setRevisionFile] = useState(null);

    useEffect(() => {
        dispatch(fetchSidangTA());
    }, [dispatch]);

    useEffect(() => {
        if (actionSuccess) {
            toast.success("Aksi berhasil diproses!");
            setUploadingDoc(null);
            setSelectedNilaiId(null);
            setRevisionFile(null);
            dispatch(resetTARegistrationStatus());
            dispatch(fetchSidangTA());
        }
        if (error) {
            toast.error(error);
            dispatch(resetTARegistrationStatus());
        }
    }, [actionSuccess, error, dispatch]);

    const handleFileChange = (e, docName) => {
        const file = e.target.files[0];
        if (!file) return;

        const data = new FormData();
        data.append("nama_dokumen", docName);
        data.append("file", file);

        setUploadingDoc(docName);
        dispatch(uploadSidangRequirement(data));
    };

    const handleRevisionSubmit = (e, nilaiId) => {
        e.preventDefault();
        if (!revisionFile) {
            toast.error("Silakan pilih berkas revisi terlebih dahulu.");
            return;
        }

        const data = new FormData();
        data.append("file", revisionFile);

        dispatch(submitSidangRevision({ nilaiUjianId: nilaiId, formData: data }));
    };

    const getDocStatus = (docName) => {
        const doc = sidangData?.requirements?.find(r => r.nama_dokumen === docName);
        return doc ? doc.status_validasi : "not_uploaded";
    };

    const getDocPath = (docName) => {
        const doc = sidangData?.requirements?.find(r => r.nama_dokumen === docName);
        return doc ? doc.file_path : null;
    };

    const renderDocBadge = (status) => {
        const styles = {
            valid: "text-green-600 bg-green-50 border-green-200",
            ditolak: "text-red-600 bg-red-50 border-red-200",
            pending: "text-amber-600 bg-amber-50 border-amber-200",
            not_uploaded: "text-gray-400 bg-gray-50 border-gray-200",
        };

        const labels = {
            valid: "Valid / Disetujui",
            ditolak: "Ditolak",
            pending: "Menunggu Validasi",
            not_uploaded: "Belum Unggah",
        };

        return (
            <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase border rounded-md ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-screen">
                <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-medium font-inter">Memuat Data Sidang & Kelulusan...</p>
            </div>
        );
    }

    if (!sidangData?.tugas_akhir) {
        return (
            <div className="max-w-4xl mx-auto py-6 px-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-6 border-4 border-amber-50">
                        <AlertCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Ujian/Sidang Belum Aktif</h3>
                    <p className="mt-2 text-gray-500 text-sm max-w-md leading-relaxed">
                        Pengajuan Tugas Akhir Anda belum aktif. Pastikan Anda telah terdaftar dan judul pengajuan Anda disetujui.
                    </p>
                </div>
            </div>
        );
    }

    const requiredDocs = [
        "Kartu Rencana Studi (KRS)",
        "Transkrip Nilai Sementara",
        "Sertifikat TOEFL",
        "Draft Naskah Proposal/Tugas Akhir"
    ];

    return (
        <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                    <Calendar className="text-emerald-600" size={32} />
                    Pendaftaran Ujian & Hasil Sidang
                </h2>
                <p className="mt-2 text-gray-500 text-sm">Lengkapi dokumen persyaratan ujian, lihat jadwal sidang Anda, dan unggah revisi pasca ujian.</p>
            </div>

            {/* Document Requirements Upload */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-900">Dokumen Persyaratan Ujian</h3>
                    <p className="text-xs text-gray-400 mt-1">Unggah dokumen prasyarat untuk mendaftar Sidang Proposal, Hasil, atau Sidang Akhir.</p>
                </div>

                <div className="p-6 divide-y divide-gray-100">
                    {requiredDocs.map((docName, index) => {
                        const status = getDocStatus(docName);
                        const path = getDocPath(docName);
                        const isDocUploading = actionLoading && uploadingDoc === docName;

                        return (
                            <div key={index} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="min-w-0">
                                    <h4 className="text-sm font-bold text-gray-800">{docName}</h4>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        {renderDocBadge(status)}
                                        {path && (
                                            <a
                                                href={`/storage/${path}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-0.5"
                                            >
                                                Lihat Berkas
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div className="relative shrink-0">
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png,.zip"
                                        onChange={(e) => handleFileChange(e, docName)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                        disabled={isDocUploading}
                                    />
                                    <button
                                        type="button"
                                        className={`flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-sm ${
                                            isDocUploading ? "opacity-50" : ""
                                        }`}
                                    >
                                        {isDocUploading ? (
                                            <div className="w-3 h-3 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <Upload size={14} />
                                        )}
                                        {status === "not_uploaded" ? "Unggah" : "Unggah Ulang"}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Exam Schedules & Revisions */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Jadwal & Penilaian Ujian</h3>
                
                {sidangData?.schedules && sidangData.schedules.length > 0 ? (
                    sidangData.schedules.map((sched) => (
                        <div key={sched.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <span className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded">
                                        Sidang {sched.jenis_ujian}
                                    </span>
                                    <h4 className="text-base font-bold text-gray-900 mt-2">Jadwal Pelaksanaan</h4>
                                </div>
                                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase border ${
                                    sched.status_ujian === 'selesai' ? 'bg-green-50 text-green-700 border-green-200' :
                                    sched.status_ujian === 'ditunda' ? 'bg-red-50 text-red-700 border-red-200' :
                                    'bg-blue-50 text-blue-700 border-blue-200'
                                }`}>
                                    {sched.status_ujian}
                                </span>
                            </div>

                            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Time & Venue */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2.5 text-sm font-semibold text-gray-700">
                                        <Clock size={16} className="text-gray-400 shrink-0" />
                                        <span>{sched.tanggal_ujian} • {sched.waktu_mulai} - {sched.waktu_selesai}</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-sm font-semibold text-gray-700">
                                        <MapPin size={16} className="text-gray-400 shrink-0" />
                                        <span>Ruangan: {sched.ruangan_id || "Online"}</span>
                                    </div>
                                    {sched.link_online && (
                                        <div className="flex items-center gap-2.5 text-sm">
                                            <LinkIcon size={16} className="text-emerald-500 shrink-0" />
                                            <a href={sched.link_online} target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-bold hover:underline truncate">
                                                Link Ujian Online
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* Examiner Scores & Revision Submissions */}
                                <div className="md:col-span-2 space-y-4">
                                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Penilaian Penguji & Revisi</h5>
                                    
                                    {sched.nilai_ujian && sched.nilai_ujian.length > 0 ? (
                                        <div className="space-y-3">
                                            {sched.nilai_ujian.map((grade) => (
                                                <div key={grade.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-3">
                                                    <div className="flex justify-between items-center gap-4">
                                                        <span className="text-xs font-bold text-gray-700 truncate">{grade.dosen?.name || "Penguji"}</span>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <span className="text-xs font-bold bg-white px-2 py-0.5 border border-gray-200 text-gray-800 rounded">
                                                                Nilai: {grade.nilai_angka}
                                                            </span>
                                                            <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase border rounded-md ${
                                                                grade.status_acc_revisi ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"
                                                            }`}>
                                                                {grade.status_acc_revisi ? "ACC REVISI" : "PENDING REVISI"}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {grade.catatan_revisi && (
                                                        <div className="p-3 bg-white rounded-lg border border-gray-100 text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                                                            <strong>Catatan Penguji:</strong>
                                                            <p className="mt-1">{grade.catatan_revisi}</p>
                                                        </div>
                                                    )}

                                                    {/* Submit Revision Form */}
                                                    {!grade.status_acc_revisi && (
                                                        <div className="pt-2">
                                                            {selectedNilaiId === grade.id ? (
                                                                <form onSubmit={(e) => handleRevisionSubmit(e, grade.id)} className="flex items-center gap-2">
                                                                    <input
                                                                        type="file"
                                                                        onChange={(e) => setRevisionFile(e.target.files[0])}
                                                                        className="flex-1 text-xs border border-gray-200 p-1.5 rounded-lg bg-white outline-none focus:ring-1 focus:ring-emerald-500"
                                                                        required
                                                                    />
                                                                    <button
                                                                        type="submit"
                                                                        disabled={actionLoading}
                                                                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm shrink-0"
                                                                    >
                                                                        {actionLoading ? "..." : <Send size={12} />}
                                                                        Kirim
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setSelectedNilaiId(null)}
                                                                        className="text-xs text-gray-400 px-2"
                                                                    >
                                                                        Batal
                                                                    </button>
                                                                </form>
                                                            ) : (
                                                                <button
                                                                    onClick={() => setSelectedNilaiId(grade.id)}
                                                                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:underline"
                                                                >
                                                                    <Upload size={12} />
                                                                    Kirim/Perbarui Berkas Revisi
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-400 italic">Belum ada penilaian/penguji yang dimasukkan oleh admin.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-white border border-gray-200 rounded-2xl flex flex-col items-center gap-3">
                        <div className="p-4 bg-gray-50 rounded-full text-gray-300">
                            <Calendar size={32} />
                        </div>
                        <p className="text-gray-400 font-semibold text-sm">Belum ada jadwal ujian.</p>
                        <p className="text-[10px] text-gray-300 uppercase font-bold tracking-tighter">Silakan ajukan persyaratan di atas, lalu panitia TA akan memploting jadwal sidang Anda.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TASidang;
