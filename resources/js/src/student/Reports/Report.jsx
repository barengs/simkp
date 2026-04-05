import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReports, deleteReport } from '../../store/slice/reportSlice';
import { fetchMyInternship } from '../../store/slice/internshipSlice';
import { 
    PlusCircle, 
    Trash2, 
    FileText, 
    CheckCircle, 
    Clock, 
    XCircle, 
    Lock,
    AlertCircle,
    Info,
    FileDown
} from 'lucide-react';
import { toast } from 'react-toastify';
import Skeleton from '../../components/Skeleton';
import Modal from '../../components/Modal';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import AddReport from './AddReport';

const Report = () => {
    const dispatch = useDispatch();
    const { data: reports, loading } = useSelector((state) => state.reports || { data: [], loading: false });
    const { data: internships } = useSelector((state) => state.internships || { data: [] });

    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'draft' });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, data: null });

    useEffect(() => {
        dispatch(fetchReports());
        dispatch(fetchMyInternship());
    }, [dispatch]);

    const handleCloseModal = () => {
        setModalConfig({ ...modalConfig, isOpen: false });
    };

    const handleDelete = async () => {
        if (!deleteModal.data) return;
        
        const action = await dispatch(deleteReport(deleteModal.data.id));
        if (deleteReport.fulfilled.match(action)) {
            toast.success("Laporan berhasil dihapus");
        } else {
            toast.error(action.payload || "Gagal menghapus laporan");
        }
        setDeleteModal({ isOpen: false, data: null });
    };

    // Find latest reports
    const draftReport = Array.isArray(reports) ? reports.find(r => r.type === 'draft') : null;
    const finalReport = Array.isArray(reports) ? reports.find(r => r.type === 'final') : null;

    // Logic: Final is available only if Draft is approved
    const isDraftApproved = draftReport?.status === 'approved';
    const hasActiveInternship = Array.isArray(internships) ? internships.length > 0 : !!internships?.id;

    if (loading && (!reports || reports.length === 0)) {
        return <Skeleton className="w-full h-96" />;
    }

    const StatusBadge = ({ status }) => {
        switch (status) {
            case 'approved':
                return (
                    <div className="flex items-center space-x-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">
                        <CheckCircle size={14} />
                        <span>Disetujui Dosen</span>
                    </div>
                );
            case 'rejected':
                return (
                    <div className="flex items-center space-x-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wider">
                        <XCircle size={14} />
                        <span>Ditolak / Revisi</span>
                    </div>
                );
            default:
                return (
                    <div className="flex items-center space-x-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wider">
                        <Clock size={14} />
                        <span>Menunggu Validasi</span>
                    </div>
                );
        }
    };

    const ReportCard = ({ title, type, report, isLocked = false, description }) => {
        return (
            <div className={`relative bg-white rounded-2xl border transition-all duration-300 ${
                isLocked ? 'border-gray-200 opacity-60 grayscale' : 'border-gray-200 hover:border-indigo-300 shadow-sm hover:shadow-md'
            }`}>
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                            <FileText size={28} />
                        </div>
                        {report && <StatusBadge status={report.status} />}
                        {isLocked && (
                            <div className="flex items-center space-x-1.5 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-bold uppercase tracking-wider">
                                <Lock size={14} />
                                <span>Terkunci</span>
                            </div>
                        )}
                    </div>

                    <h3 className="text-lg font-bold text-gray-800 mb-1">{title}</h3>
                    <p className="text-sm text-gray-500 mb-6 leading-relaxed">{description}</p>

                    {report ? (
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                                            <FileText size={18} className="text-gray-400" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-xs font-semibold text-gray-700 line-clamp-1">Dokumen Terbaru</p>
                                            <p className="text-[10px] text-gray-400">Unggah: {report.created_at}</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-1">
                                        <a 
                                            href={report.file_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="p-2 text-indigo-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                                            title="Unduh File"
                                        >
                                            <FileDown size={18} />
                                        </a>
                                        {report.status !== 'approved' && (
                                            <button
                                                onClick={() => setDeleteModal({ isOpen: true, data: report })}
                                                className="p-2 text-red-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                                                title="Hapus"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {(report.status === 'rejected' || report.status === 'pending') && (
                                <button
                                    onClick={() => setModalConfig({ isOpen: true, type })}
                                    className="w-full flex items-center justify-center space-x-2 py-2.5 border-2 border-dashed border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-600 rounded-xl text-sm font-semibold transition-all"
                                >
                                    <PlusCircle size={18} />
                                    <span>Ganti / Revisi Laporan</span>
                                </button>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => !isLocked && setModalConfig({ isOpen: true, type })}
                            disabled={isLocked}
                            className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 ${
                                isLocked 
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                        >
                            {isLocked ? <Lock size={18} /> : <PlusCircle size={18} />}
                            <span>Unggah {title}</span>
                        </button>
                    )}
                </div>
                
                {isLocked && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/10 backdrop-blur-[1px] rounded-2xl pointer-events-none px-6 text-center">
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start">
                <div className="max-w-2xl">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Manajemen Laporan KP</h1>
                    <p className="mt-2 text-gray-500 text-lg leading-relaxed">
                        Pantau progres laporan kerja praktik Anda. Laporan Final akan terbuka setelah Dosen Pembimbing menyetujui versi Draft.
                    </p>
                </div>
                {!hasActiveInternship && (
                    <div className="mt-4 md:mt-0 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-4 max-w-sm">
                        <AlertCircle className="text-amber-500 shrink-0" size={24} />
                        <div className="text-sm text-amber-800 font-medium leading-relaxed">
                            Peringatan: Anda belum memiliki data KP aktif untuk mengunggah dokumen laporan.
                        </div>
                    </div>
                )}
            </div>

            {/* Info Rule Box */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex items-start space-x-4">
                <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
                    <Info size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-indigo-900 leading-none mb-1">Ketentuan Pengunggahan:</h4>
                    <p className="text-sm text-indigo-700 leading-relaxed">
                        Pastikan Anda berkonsultasi (Bimbingan) secara rutin mengenai <strong>Draft Laporan</strong>. Tombol <strong>Laporan Final</strong> hanya akan aktif setelah Dosen Pembimbing memberikan persetujuan (Status: <span className="font-bold">Disetujui</span>) pada Draft Anda.
                    </p>
                </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ReportCard 
                    title="1. Dokumen Draft"
                    type="draft"
                    report={draftReport}
                    description="Unggah versi draf untuk diperiksa dan dikonsultasikan secara rutin dengan Dosen Pembimbing Anda di lokasi bimbingan."
                />
                
                <ReportCard 
                    title="2. Dokumen Final"
                    type="final"
                    report={finalReport}
                    isLocked={!isDraftApproved}
                    description="Laporan akhir yang sudah dipastikan siap penilaian. Versi ini menjadi syarat utama bagi Dosen untuk menginput nilai."
                />
            </div>

            {/* Modals */}
            <Modal
                isOpen={modalConfig.isOpen}
                onClose={handleCloseModal}
                title={`Unggah ${modalConfig.type === 'final' ? 'Laporan Final' : 'Draft Laporan'}`}
            >
                <AddReport 
                    type={modalConfig.type} 
                    onClose={() => {
                        handleCloseModal();
                        dispatch(fetchReports());
                    }} 
                />
            </Modal>

            {/* Confirm Delete */}
            <ConfirmDeleteModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, data: null })}
                onConfirm={handleDelete}
                title="Hapus Dokumen"
                message={`Apakah Anda yakin ingin menghapus arsip Laporan ${deleteModal.data?.type === 'final' ? 'Final' : 'Draft'} ini?`}
            />
        </div>
    );
};

export default Report;
