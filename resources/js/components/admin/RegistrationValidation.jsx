import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Skeleton } from "../ui/Skeleton";
import { CheckCircle, XCircle, Eye, Search, Clock, FileText } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { fetchInternships, validateInternship } from "../store/slices/internshipSlice";

const RegistrationValidation = () => {
    const dispatch = useDispatch();
    const { internshipsByStatus, loading, forceRefetch } = useSelector((state) => state.internships);
    const registrations = internshipsByStatus.submitted?.data || [];

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRegistration, setSelectedRegistration] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showActionModal, setShowActionModal] = useState(false);
    const [action, setAction] = useState("");
    const [notes, setNotes] = useState("");
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        dispatch(fetchInternships({ status: 'submitted', search: searchTerm }));
    }, [dispatch, searchTerm]);

    const handleAction = (registration, actionType) => {
        setSelectedRegistration(registration);
        setAction(actionType);
        setShowActionModal(true);
    };

    const confirmAction = async () => {
        if (!selectedRegistration || !action) return;

        setProcessing(true);
        const status = action === "approve" ? "approved" : "rejected";
        try {
            await dispatch(validateInternship({
                id: selectedRegistration.id,
                status: status,
                notes: notes
            })).unwrap();

            toast.success(`Pendaftaran berhasil ${action === 'approve' ? 'disetujui' : 'ditolak'}`);
            setShowActionModal(false);
            setNotes("");
            // Re-fetch data after action
            dispatch(fetchInternships({ status: 'submitted', search: searchTerm }));
        } catch (error) {
            toast.error(error || "Gagal memperbarui status");
            console.error(error);
        } finally {
            setProcessing(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "approved":
            case "ongoing":
                return "bg-green-100 text-green-800";
            case "rejected":
                return "bg-red-100 text-red-800";
            case "submitted":
                return "bg-yellow-100 text-yellow-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case "submitted":
                return "Menunggu Validasi";
            case "approved":
                return "Disetujui";
            case "rejected":
                return "Ditolak";
            case "ongoing":
                return "Sedang Berjalan";
            default:
                return status;
        }
    };

    const filteredRegistrations = registrations.filter((reg) =>
        [reg.leader?.user?.name, reg.leader?.user?.nim, reg.company?.name].some((field) =>
            field?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const TableRowSkeleton = () => (
        <>
            {[...Array(1)].map((_, i) => (
                <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                        <td key={j} className="px-6 py-4">
                            <Skeleton className="h-4 w-full" />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );

    return (
        <>
            <div className="space-y-6">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    Daftar Pendaftaran KP
                                </h3>
                                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                    Daftar pendaftaran kerja praktek yang menunggu validasi
                                </p>
                            </div>
                            <div className="w-1/3">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Cari mahasiswa..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="px-4 py-5 sm:p-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Mahasiswa
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Perusahaan
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Tema
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Periode
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Tanggal
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loading ? (
                                        <TableRowSkeleton />
                                    ) : filteredRegistrations.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-8 text-center text-sm text-gray-500">
                                                Tidak ada pendaftaran yang perlu divalidasi.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRegistrations.map((registration) => (
                                            <tr key={registration.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-bold text-gray-900">
                                                        {registration.leader?.user?.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 font-medium">
                                                        {registration.leader?.nim}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                                                    {registration.company?.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium leading-tight">
                                                    <div className="max-w-xs truncate">{registration.theme?.name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                                                    TA {registration.period?.academic_year} ({registration.period?.semester})
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 py-0.5 inline-flex text-[10px] leading-5 font-bold rounded-full uppercase ${getStatusColor(
                                                            registration.status
                                                        )}`}
                                                    >
                                                        {getStatusLabel(registration.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                                                    {new Date(registration.created_at).toLocaleDateString('id-ID')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-3">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedRegistration(registration);
                                                                setShowDetailModal(true);
                                                            }}
                                                            className="text-indigo-600 hover:text-indigo-900 transition-colors"
                                                            title="Detail"
                                                        >
                                                            <Eye className="w-5 h-5" />
                                                        </button>
                                                        {registration.status === "submitted" && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleAction(registration, "approve")}
                                                                    className="text-green-600 hover:text-green-900 transition-colors"
                                                                    title="Setujui"
                                                                >
                                                                    <CheckCircle className="w-5 h-5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleAction(registration, "reject")}
                                                                    className="text-red-600 hover:text-red-900 transition-colors"
                                                                    title="Tolak"
                                                                >
                                                                    <XCircle className="w-5 h-5" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Registration Detail Modal */}
            {showDetailModal && selectedRegistration && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full flex items-center justify-center p-4">
                    <div className="relative mx-auto border w-full max-w-4xl shadow-2xl rounded-2xl bg-white overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900">
                                Detail Pendaftaran
                            </h3>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="text-gray-400 hover:text-gray-500 p-2 rounded-full hover:bg-white transition-all"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 max-h-[80vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                                        Informasi Mahasiswa
                                    </h4>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase block">Nama</span>
                                            <span className="text-sm font-bold text-gray-900">{selectedRegistration.leader?.user?.name}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase block">NIM</span>
                                            <span className="text-sm font-medium text-gray-700">{selectedRegistration.leader?.nim}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase block">Status</span>
                                            <span
                                                className={`mt-1 px-2 py-0.5 inline-flex text-[10px] font-bold rounded-full uppercase ${getStatusColor(
                                                    selectedRegistration.status
                                                )}`}
                                            >
                                                {getStatusLabel(selectedRegistration.status)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                                        Detail Kerja Praktek
                                    </h4>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase block">Perusahaan</span>
                                            <span className="text-sm font-bold text-indigo-600">{selectedRegistration.company?.name}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase block">Tema</span>
                                            <span className="text-sm font-medium text-gray-700">{selectedRegistration.theme?.name}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase block">Periode</span>
                                            <span className="text-sm font-medium text-gray-700">TA {selectedRegistration.period?.academic_year} ({selectedRegistration.period?.semester})</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase block">Tanggal Pendaftaran</span>
                                            <span className="text-sm font-medium text-gray-700">{new Date(selectedRegistration.created_at).toLocaleDateString('id-ID')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                                    Dokumen yang Diunggah
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[
                                        { label: 'Proposal', url: selectedRegistration.proposal_url },
                                        { label: 'KRS', url: selectedRegistration.krs_url },
                                        { label: 'KTM/KTP', url: selectedRegistration.ktp_url },
                                        { label: 'Rekomendasi', url: selectedRegistration.surat_rekomendasi_url }
                                    ].map((doc, i) => doc.url && (
                                        <a
                                            key={i}
                                            href={doc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-all group"
                                        >
                                            <div className="bg-indigo-100 p-2 rounded-lg group-hover:bg-indigo-500 transition-colors">
                                                <FileText className="w-4 h-4 text-indigo-600 group-hover:text-white" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-700">{doc.label}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {selectedRegistration.notes && (
                                <div className="mb-8">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                        Catatan
                                    </h4>
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-sm text-gray-600 italic">
                                            "{selectedRegistration.notes}"
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
                                {selectedRegistration.status === "submitted" && (
                                    <>
                                        <button
                                            onClick={() => {
                                                handleAction(selectedRegistration, "approve");
                                                setShowDetailModal(false);
                                            }}
                                            className="px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 shadow-lg shadow-green-100 transition-all flex items-center gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Setujui
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleAction(selectedRegistration, "reject");
                                                setShowDetailModal(false);
                                            }}
                                            className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 shadow-lg shadow-red-100 transition-all flex items-center gap-2"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Tolak
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Confirmation Modal */}
            {showActionModal && (
                <div className="fixed inset-0 z-60 bg-black/30 backdrop-blur-sm overflow-y-auto h-full w-full flex items-center justify-center p-4">
                    <div className="relative mx-auto p-6 border w-full max-w-md shadow-2xl rounded-2xl bg-white animate-in fade-in slide-in-from-bottom-4 duration-200">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                {action === "approve"
                                    ? "Setujui Pendaftaran"
                                    : "Tolak Pendaftaran"}
                            </h3>
                            <p className="text-sm text-gray-500">
                                Apakah Anda yakin ingin{" "}
                                {action === "approve"
                                    ? "menyetujui"
                                    : "menolak"}{" "}
                                pendaftaran KP untuk:
                            </p>
                            <p className="text-sm font-bold text-gray-900 mt-1">
                                {selectedRegistration?.leader?.user?.name} ({selectedRegistration?.leader?.nim})
                            </p>
                        </div>


                        <div className="flex justify-end space-x-3 mt-8">
                            <button
                                onClick={() => {
                                    setShowActionModal(false);
                                    setNotes("");
                                }}
                                className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmAction}
                                disabled={processing}
                                className={`px-6 py-2.5 text-white rounded-xl text-sm font-bold transition-all shadow-lg flex items-center gap-2 ${action === "approve"
                                    ? "bg-green-600 hover:bg-green-700 shadow-green-100"
                                    : "bg-red-600 hover:bg-red-700 shadow-red-100"
                                    } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {processing ? (
                                    <Clock className="w-4 h-4 animate-spin" />
                                ) : (
                                    action === "approve" ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />
                                )}
                                {action === "approve" ? "Setujui" : "Tolak"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default RegistrationValidation;
