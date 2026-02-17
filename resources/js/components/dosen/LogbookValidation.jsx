import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLogbooks, validateLogbook } from "../store/slices/logbookSlice";
import { toast } from "react-toastify";
import { Skeleton } from "../ui/Skeleton";
import Modal from "../ui/Modal";
import { CheckCircle, XCircle, Search, FileText, User, Image, Clock } from "lucide-react";

const LogbookValidation = () => {
    const dispatch = useDispatch();
    const { logbooks, loading, submitLoading, error } = useSelector((state) => state.logbooks);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLogbook, setSelectedLogbook] = useState(null);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [actionType, setActionType] = useState(null); // 'approve' | 'reject'
    const [rejectionReason, setRejectionReason] = useState("");

    useEffect(() => {
        dispatch(fetchLogbooks());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const filteredLogbooks = logbooks.filter(logbook =>
        logbook.internship?.leader?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        logbook.activity.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAction = (logbook, type) => {
        setSelectedLogbook(logbook);
        setActionType(type);
        setRejectionReason("");
        setIsActionModalOpen(true);
    };

    const submitAction = async () => {
        if (!selectedLogbook || !actionType) return;

        try {
            await dispatch(validateLogbook({
                id: selectedLogbook.id,
                status: actionType === 'approve' ? 'approved' : 'rejected',
                reason: actionType === 'reject' ? rejectionReason : null
            })).unwrap();

            toast.success(`Logbook berhasil ${actionType === 'approve' ? 'disetujui' : 'ditolak'}`);
            setIsActionModalOpen(false);
        } catch (err) {
            toast.error(err || "Gagal memproses aksi");
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "approved":
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Disetujui</span>;
            case "rejected":
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Ditolak</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Menunggu</span>;
        }
    };

    const TableSkeleton = () => (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Validasi Logbook</h1>
                    <p className="mt-1 text-sm text-gray-500">Validasi aktivitas harian mahasiswa bimbingan</p>
                </div>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Cari mahasiswa atau aktivitas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm"
                    />
                </div>
            </div>

            {loading ? (
                <TableSkeleton />
            ) : filteredLogbooks.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada logbook</h3>
                    <p className="mt-1 text-sm text-gray-500">Belum ada logbook yang perlu divalidasi atau sesuai pencarian.</p>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {filteredLogbooks.map((logbook) => (
                            <li key={logbook.id}>
                                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition duration-150 ease-in-out">
                                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0">
                                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                    <User className="w-5 h-5" />
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-sm font-bold text-gray-900">
                                                        {logbook.internship?.leader?.user?.name}
                                                    </h3>
                                                    <span className="text-xs text-gray-500">
                                                        • {new Date(logbook.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">{logbook.activity}</p>
                                                {logbook.evidence_photo && (
                                                    <a
                                                        href={logbook.evidence_photo}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center text-xs text-indigo-600 hover:text-indigo-800"
                                                    >
                                                        <Image className="w-3 h-3 mr-1" /> Lihat Bukti
                                                    </a>
                                                )}
                                                {logbook.rejection_reason && (
                                                    <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100">
                                                        <strong>Alasan Penolakan:</strong> {logbook.rejection_reason}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2 sm:flex-col sm:items-end">
                                            {getStatusBadge(logbook.status)}

                                            {logbook.status === 'pending' && (
                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        onClick={() => handleAction(logbook, 'approve')}
                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 shadow-sm"
                                                    >
                                                        <CheckCircle className="w-3 h-3 mr-1" /> Terima
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(logbook, 'reject')}
                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 shadow-sm"
                                                    >
                                                        <XCircle className="w-3 h-3 mr-1" /> Tolak
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <Modal
                isOpen={isActionModalOpen}
                onClose={() => setIsActionModalOpen(false)}
                title={actionType === 'approve' ? "Setujui Logbook" : "Tolak Logbook"}
            >
                <div>
                    <p className="text-sm text-gray-500 mb-4">
                        {actionType === 'approve'
                            ? "Apakah Anda yakin ingin menyetujui logbook ini?"
                            : "Silahkan berikan alasan penolakan untuk logbook ini."}
                    </p>

                    {actionType === 'reject' && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Alasan Penolakan</label>
                            <textarea
                                required
                                rows={3}
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                placeholder="Contoh: Aktivitas kurang jelas..."
                            />
                        </div>
                    )}

                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                        <button
                            type="button"
                            disabled={submitLoading || (actionType === 'reject' && !rejectionReason.trim())}
                            onClick={submitAction}
                            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:col-start-2 sm:text-sm disabled:opacity-50 ${actionType === 'approve'
                                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                                    : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                                }`}
                        >
                            {submitLoading ? "Memproses..." : (actionType === 'approve' ? "Setujui" : "Tolak")}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsActionModalOpen(false)}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                        >
                            Batal
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default LogbookValidation;
