import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { 
    GraduationCap, 
    FileText, 
    Code, 
    Share2, 
    BookOpen, 
    CheckCircle, 
    AlertCircle, 
    Clock, 
    Download,
    Upload,
    ArrowRight
} from "lucide-react";
import { 
    fetchRepositoryTA, 
    submitRepositoryTA, 
    resetTARegistrationStatus 
} from "../store/slice/tugasAkhirSlice";

const TAFinal = () => {
    const dispatch = useDispatch();
    const { repositoryData, loading, actionLoading, error, actionSuccess } = useSelector((state) => state.tugasAkhir);

    const [formData, setFormData] = useState({
        abstrak_id: "",
        abstrak_en: "",
        kata_kunci: "",
        is_public: "true"
    });

    const [files, setFiles] = useState({
        file_pdf_full: null,
        file_jurnal: null,
        file_source_code: null
    });

    useEffect(() => {
        dispatch(fetchRepositoryTA());
    }, [dispatch]);

    useEffect(() => {
        if (repositoryData) {
            setFormData({
                abstrak_id: repositoryData.abstrak_id || "",
                abstrak_en: repositoryData.abstrak_en || "",
                kata_kunci: repositoryData.kata_kunci || "",
                is_public: String(repositoryData.is_public ?? true)
            });
        }
    }, [repositoryData]);

    useEffect(() => {
        if (actionSuccess) {
            toast.success("Repository final Tugas Akhir berhasil diperbarui!");
            dispatch(resetTARegistrationStatus());
            dispatch(fetchRepositoryTA());
        }
        if (error) {
            toast.error(error);
            dispatch(resetTARegistrationStatus());
        }
    }, [actionSuccess, error, dispatch]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, fileKey) => {
        setFiles(prev => ({ ...prev, [fileKey]: e.target.files[0] }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.abstrak_id.trim() || !formData.abstrak_en.trim() || !formData.kata_kunci.trim()) {
            toast.error("Abstrak dan kata kunci wajib diisi.");
            return;
        }

        const data = new FormData();
        data.append("abstrak_id", formData.abstrak_id);
        data.append("abstrak_en", formData.abstrak_en);
        data.append("kata_kunci", formData.kata_kunci);
        data.append("is_public", formData.is_public);

        if (files.file_pdf_full) {
            data.append("file_pdf_full", files.file_pdf_full);
        } else if (!repositoryData?.file_pdf_full) {
            toast.error("Buku TA Final (PDF) wajib diunggah untuk pendaftaran pertama.");
            return;
        }

        if (files.file_jurnal) {
            data.append("file_jurnal", files.file_jurnal);
        }

        if (files.file_source_code) {
            data.append("file_source_code", files.file_source_code);
        }

        dispatch(submitRepositoryTA(data));
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-screen">
                <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-medium font-inter">Memuat Data Repository TA...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                    <GraduationCap className="text-emerald-600" size={32} />
                    Finalisasi & Repository TA
                </h2>
                <p className="mt-2 text-gray-500 text-sm">Lengkapi metadata dan unggah dokumen final Tugas Akhir Anda untuk masuk ke repositori kampus.</p>
            </div>

            {repositoryData && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8 flex items-start gap-4">
                    <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={24} />
                    <div>
                        <h3 className="text-base font-bold text-green-950">Berkas Repositori Terdaftar</h3>
                        <p className="text-xs text-green-800 mt-1">Anda sudah pernah melakukan finalisasi. Anda tetap dapat memperbarui abstrak atau berkas final di bawah ini jika diperlukan.</p>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <BookOpen size={20} className="text-emerald-600" />
                            Abstrak & Metadata TA
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">Masukkan abstrak dalam Bahasa Indonesia dan Bahasa Inggris beserta kata kunci.</p>
                    </div>

                    <div className="space-y-4">
                        {/* Abstrak ID */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Abstrak (Bahasa Indonesia)</label>
                            <textarea
                                name="abstrak_id"
                                value={formData.abstrak_id}
                                onChange={handleInputChange}
                                rows={6}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm leading-relaxed"
                                placeholder="Masukkan abstrak dalam Bahasa Indonesia..."
                                required
                            />
                        </div>

                        {/* Abstrak EN */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Abstract (English)</label>
                            <textarea
                                name="abstrak_en"
                                value={formData.abstrak_en}
                                onChange={handleInputChange}
                                rows={6}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm leading-relaxed"
                                placeholder="Enter abstract in English..."
                                required
                            />
                        </div>

                        {/* Kata Kunci */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Kata Kunci (Dipisahkan Koma)</label>
                            <input
                                type="text"
                                name="kata_kunci"
                                value={formData.kata_kunci}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
                                placeholder="Contoh: Algoritma, Machine Learning, Web App"
                                required
                            />
                        </div>

                        {/* Visibilitas Publik */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Akses Repositori</label>
                            <select
                                name="is_public"
                                value={formData.is_public}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm font-semibold text-gray-700"
                            >
                                <option value="true">Publik (Dapat diakses luar jaringan kampus)</option>
                                <option value="false">Internal (Hanya jaringan lokal kampus)</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                            <Share2 size={20} className="text-emerald-600" />
                            Dokumen Final & Berkas Pendukung
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* PDF Buku TA */}
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3 flex flex-col justify-between">
                                <div>
                                    <FileText className="text-emerald-600" size={24} />
                                    <h4 className="text-sm font-bold text-gray-800 mt-2">Buku TA Lengkap</h4>
                                    <p className="text-[10px] text-gray-400">PDF lengkap isi buku TA (wajib).</p>
                                </div>
                                <div className="space-y-2">
                                    {repositoryData?.file_pdf_full && (
                                        <a href={`/storage/${repositoryData.file_pdf_full}`} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-0.5">
                                            Unduh Berkas Lama
                                        </a>
                                    )}
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={(e) => handleFileChange(e, "file_pdf_full")}
                                        className="text-xs w-full"
                                    />
                                </div>
                            </div>

                            {/* PDF Jurnal */}
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3 flex flex-col justify-between">
                                <div>
                                    <BookOpen className="text-emerald-600" size={24} />
                                    <h4 className="text-sm font-bold text-gray-800 mt-2">Jurnal / Paper Publikasi</h4>
                                    <p className="text-[10px] text-gray-400">PDF ringkasan artikel jurnal (opsional).</p>
                                </div>
                                <div className="space-y-2">
                                    {repositoryData?.file_jurnal && (
                                        <a href={`/storage/${repositoryData.file_jurnal}`} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-0.5">
                                            Unduh Berkas Lama
                                        </a>
                                    )}
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={(e) => handleFileChange(e, "file_jurnal")}
                                        className="text-xs w-full"
                                    />
                                </div>
                            </div>

                            {/* Source Code */}
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3 flex flex-col justify-between">
                                <div>
                                    <Code className="text-emerald-600" size={24} />
                                    <h4 className="text-sm font-bold text-gray-800 mt-2">Source Code Program</h4>
                                    <p className="text-[10px] text-gray-400">File program terkompresi .ZIP (opsional).</p>
                                </div>
                                <div className="space-y-2">
                                    {repositoryData?.file_source_code && (
                                        <a href={`/storage/${repositoryData.file_source_code}`} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-0.5">
                                            Unduh Berkas Lama
                                        </a>
                                    )}
                                    <input
                                        type="file"
                                        accept=".zip,.rar,.7z,.tar,.gz"
                                        onChange={(e) => handleFileChange(e, "file_source_code")}
                                        className="text-xs w-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-10 py-6 bg-gray-50 -mx-10 -mb-10 flex justify-end items-center border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={actionLoading}
                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl flex items-center gap-2 transition-all shadow-md shadow-emerald-100"
                        >
                            {actionLoading && (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            )}
                            <span>{actionLoading ? "Menyimpan..." : "Simpan Koleksi"}</span>
                            {!actionLoading && <ArrowRight size={16} />}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TAFinal;
