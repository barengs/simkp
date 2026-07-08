import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
    FileText,
    BookOpen,
    CheckCircle,
    AlertCircle,
    Info,
    Trash2,
    Plus,
    RefreshCw,
    Loader,
    Loader2,
    FilePlus,
    FileText as FileTextIcon,
    Calendar,
    MapPin,
    Link as LinkIcon,
    FileCheck
} from "lucide-react";

const TATitleProposal = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const {
        myTA,
        loading,
        error,
        titleProposals,
        proposalLoading,
        proposalSuccess
    } = useSelector((state) => state.tugasAkhir);

    // State untuk form proposal judul
    const [formData, setFormData] = useState({
        alternatives: [{
            judul: "",
            latar_belakang: "",
            referensi_jurnal: ""
        }],
        showLatarBelakang: false
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Fetch current TA and existing proposals on mount
        // TODO: Dispatch fetchMyTA if not already loaded
        // TODO: Dispatch fetchTitleProposals when we create the thunk
    }, [dispatch]);

    useEffect(() => {
        if (proposalSuccess) {
            toast.success("Usulan judul berhasil diajukan!");
            // Reset form
            setFormData({
                alternatives: [{
                    judul: "",
                    latar_belakang: "",
                    referensi_jurnal: ""
                }],
                showLatarBelakang: false
            });
            // Refetch proposals
            // dispatch(fetchTitleProposals());
        }
        if (error) {
            toast.error(error);
        }
    }, [proposalSuccess, error, dispatch]);

    const handleInputChange = (index, field, value) => {
        setFormData(prev => {
            const newAlternatives = [...prev.alternatives];
            newAlternatives[index][field] = value;
            return { ...prev, alternatives: newAlternatives };
        });
    };

    const handleAddAlternative = () => {
        setFormData(prev => ({
            ...prev,
            alternatives: [...prev.alternatives, {
                judul: "",
                latar_belakang: "",
                referensi_jurnal: ""
            }]
        }));
    };

    const handleRemoveAlternative = (index) => {
        if (formData.alternatives.length <= 1) {
            toast.error("Minimal harus ada satu alternatif judul.");
            return;
        }
        setFormData(prev => {
            const newAlternatives = [...prev.alternatives];
            newAlternatives.splice(index, 1);
            return { ...prev, alternatives: newAlternatives };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validasi
        const hasEmptyJudul = formData.alternatives.some(alt => !alt.judul.trim());
        if (hasEmptyJudul) {
            toast.error("Judul wajib diisi untuk semua alternatif.");
            return;
        }

        setIsSubmitting(true);
        try {
            // Persiapkan data untuk dikirim ke backend
            const formDataToSend = new FormData();
            formDataToSend.append("alternatives", JSON.stringify(formData.alternatives));

            // TODO: Dispatch submitTitleProposal(formDataToSend) ketika thunk dibuat

            // Placeholder untuk simulasi
            await new Promise(resolve => setTimeout(resolve, 1000));
            // dispatch(submitTitleProposal(formDataToSend));

        } catch (err) {
            toast.error("Gagal mengajukan usulan judul. Silakan coba lagi.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading || isLoading) {
        return (
            <div className="text-center py-12">
                <Loader2 className="h-8 w-8 text-emerald-500 mx-auto mb-4" />
                <p className="text-muted-foreground">Memuat data...</p>
            </div>
        );
    }

    if (!myTA) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
                <p className="text-muted-foreground">
                    Anda belum mendeftarkan Tugas Akhir. Silakan daftarkan terlebih dahulu.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Usulan Judul Tugas Akhir</h2>
                <button
                    onClick={handleAddAlternative}
                    className="btn-sm btn-primary flex items-center gap-2"
                    disabled={isSubmitting}
                >
                    <Plus className="h-4 w-4" /> Tambah Alternatif
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {formData.alternatives.map((alternative, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Alternatif {index + 1}</h3>
                            {formData.alternatives.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => handleRemoveAlternative(index)}
                                    className="text-destructive hover:text-destructive/80"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Judul Tugas Akhir</label>
                            <input
                                type="text"
                                value={alternative.judul}
                                onChange={(e) => handleInputChange(index, "judul", e.target.value)}
                                className="input w-full"
                                placeholder="Masukkan judul tugas akhir..."
                                disabled={isSubmitting}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Latar Belakang Singkat</label>
                            <textarea
                                value={alternative.latar_belakang}
                                onChange={(e) => handleInputChange(index, "latar_belakang", e.target.value)}
                                className="textarea w-full"
                                placeholder="Masukkan latar belakang singkat..."
                                rows={3}
                                disabled={isSubmitting}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Referensi Jurnal</label>
                            <textarea
                                value={alternative.referensi_jurnal}
                                onChange={(e) => handleInputChange(index, "referensi_jurnal", e.target.value)}
                                className="textarea w-full"
                                placeholder="Masukkan referensi jurnal (pisahkan dengan koma)..."
                                rows={2}
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                ))}

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <FilePlus className="h-4 w-4" />
                        )}
                        Ajukan Judul
                    </button>
                </div>
            </form>

            {/* Daftar proposal yang sudah diajukan */}
            {titleProposals && titleProposals.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Riwayat Usulan Judul</h3>
                    <div className="space-y-3">
                        {titleProposals.map((proposal, idx) => (
                            <div key={proposal.id} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium">Alternatif {idx + 1}</h4>
                                    <span className="text-sm px-2 py-1 rounded bg-muted">
                                        {proposal.status || "pending"}
                                    </span>
                                </div>
                                <p className="text-sm">{proposal.judul}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TATitleProposal;
