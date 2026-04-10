import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchReports, approveReport, rejectReport } from '../../store/slice/reportSlice';
import DataTable from 'react-data-table-component';
import { Search, FileText, CheckCircle, XCircle, Clock, FileCheck, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import Skeleton from '../../components/Skeleton';
import Modal from '../../components/Modal';

const Report = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { data: reports, loading } = useSelector((state) => state.reports || { data: [], loading: false });

    const [searchTerm, setSearchTerm] = useState('');
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null, reportId: null });
    const [rejectFeedback, setRejectFeedback] = useState('');

    useEffect(() => {
        dispatch(fetchReports());
    }, [dispatch]);

    const groupedData = useMemo(() => {
        if (!Array.isArray(reports)) return [];

        const groups = {};
        reports.forEach(report => {
            const id = report.internship?.id;
            if (!id) return;
            if (!groups[id]) {
                groups[id] = {
                    internship: report.internship,
                    reports: [],
                };
            }
            groups[id].reports.push(report);
        });

        return Object.values(groups).map(g => ({
            ...g,
            latest: g.reports[0],
        }));
    }, [reports]);

    const handleConfirmAction = async () => {
        const { type, reportId } = confirmModal;
        if (type === 'approve') {
            const action = await dispatch(approveReport(reportId));
            if (approveReport.fulfilled.match(action)) {
                toast.success("Draft laporan disetujui");
            } else {
                toast.error(action.payload || "Gagal menyetujui laporan");
            }
        } else {
            if (!rejectFeedback.trim() || rejectFeedback.trim().length < 5) {
                toast.error('Alasan penolakan minimal 5 karakter');
                return;
            }
            const action = await dispatch(rejectReport({ id: reportId, feedback: rejectFeedback }));
            if (rejectReport.fulfilled.match(action)) {
                toast.success("Draft laporan ditolak");
            } else {
                toast.error(action.payload || "Gagal menolak laporan");
            }
        }
        setConfirmModal({ isOpen: false, type: null, reportId: null });
        setRejectFeedback('');
    };

    const handleApprove = (id) => {
        setConfirmModal({ isOpen: true, type: 'approve', reportId: id });
    };

    const handleReject = (id) => {
        setRejectFeedback('');
        setConfirmModal({ isOpen: true, type: 'reject', reportId: id });
    };

    const filteredData = groupedData.filter(
        (item) =>
            item.latest?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.internship?.leader?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.internship?.company?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            name: 'Update Terakhir',
            selector: (row) => row.latest?.updated_at,
            sortable: true,
            width: '180px'
        },
        {
            name: 'Mahasiswa (Ketua)',
            selector: (row) => row.internship?.leader?.name || '-',
            sortable: true,
        },
        {
            name: 'Mitra KP',
            selector: (row) => row.internship?.company?.name || row.internship?.company_name_manual || '-',
            sortable: true,
        },
        {
            name: 'Status Terbaru',
            width: '160px',
            cell: row => {
                const latest = row.latest;
                if (latest.status === 'approved') return <div className="flex items-center text-green-600 font-bold text-[10px] uppercase"><CheckCircle size={12} className="mr-1" /> Disetujui</div>;
                if (latest.status === 'rejected') return <div className="flex items-center text-red-600 font-bold text-[10px] uppercase"><XCircle size={12} className="mr-1" /> Ditolak</div>;
                return <div className="flex items-center text-amber-600 font-bold text-[10px] uppercase"><Clock size={12} className="mr-1" /> Pending</div>;
            }
        },
        {
            name: 'Aksi Validasi',
            cell: row => {
                const latest = row.latest;
                const internshipId = row.internship?.id;

                // Status APPROVED — Tampilkan tombol Input Nilai
                if (latest?.status === 'approved') {
                    return (
                        <button
                            onClick={() => navigate('/dosen/evaluations', { state: { openInternshipId: internshipId } })}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-all text-xs font-bold"
                            title="Beri Penilaian Kelompok"
                        >
                            <FileCheck size={14} />
                            <span>Input Nilai</span>
                        </button>
                    );
                }

                // Status PENDING — Tampilkan Setujui + Tolak (aktif)
                if (latest?.status === 'pending') {
                    return (
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => handleApprove(latest.id)}
                                className="p-1.5 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-lg transition-all border border-green-200"
                                title="Setujui"
                            >
                                <CheckCircle size={16} />
                            </button>
                            <button
                                onClick={() => handleReject(latest.id)}
                                className="p-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all border border-red-200"
                                title="Tolak"
                            >
                                <XCircle size={16} />
                            </button>
                        </div>
                    );
                }

                // Status REJECTED — Tampilkan tombol disabled + tampilkan feedback
                if (latest?.status === 'rejected') {
                    return (
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center space-x-2">
                                <button
                                    disabled
                                    className="p-1.5 bg-gray-50 text-gray-300 rounded-lg border border-gray-200 cursor-not-allowed"
                                    title="Menunggu re-upload mahasiswa"
                                >
                                    <CheckCircle size={16} />
                                </button>
                                <button
                                    disabled
                                    className="p-1.5 bg-gray-50 text-gray-300 rounded-lg border border-gray-200 cursor-not-allowed"
                                    title="Menunggu re-upload mahasiswa"
                                >
                                    <XCircle size={16} />
                                </button>
                            </div>
                            {/* {latest?.feedback && (
                                <div className="flex items-center gap-1 text-[10px] text-red-500 font-semibold max-w-[140px]">
                                    <AlertTriangle size={10} className="shrink-0" />
                                    <span className="line-clamp-1" title={latest.feedback}>{latest.feedback}</span>
                                </div>
                            )} */}
                        </div>
                    );
                }

                return null;
            },
            width: '200px'
        }
    ];

    return (
        <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-gray-50 pb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Evaluasi Laporan Bimbingan</h2>
                        <p className="text-sm text-gray-500 mt-1">Daftar kelompok yang telah mengunggah laporan. Validasi draft sebelum mahasiswa upload laporan final.</p>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Cari mahasiswa atau mitra..."
                                className="pl-10 pr-4 py-2 w-72 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <DataTable
                        columns={columns}
                        data={filteredData}
                        pagination
                        highlightOnHover
                        responsive
                        progressPending={loading}
                        progressComponent={<Skeleton className="h-96" />}
                        noDataComponent={<div className="p-8 text-gray-500 text-center italic bg-gray-50/50">Tidak ada pengajuan laporan baru dari kelompok bimbingan Anda.</div>}
                    />
                </div>
            </div>

            {/* Confirm Modal */}
            <Modal
                isOpen={confirmModal.isOpen}
                onClose={() => {
                    setConfirmModal({ isOpen: false, type: null, reportId: null });
                    setRejectFeedback('');
                }}
                title={confirmModal.type === 'approve' ? 'Konfirmasi Persetujuan' : 'Konfirmasi Penolakan'}
                size="sm"
            >
                <div className="py-2">
                    <div className={`p-4 rounded-xl border mb-4 flex items-start gap-4 ${
                        confirmModal.type === 'approve' ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'
                    }`}>
                        {confirmModal.type === 'approve' ? <CheckCircle className="shrink-0 mt-0.5" size={20} /> : <XCircle className="shrink-0 mt-0.5" size={20} />}
                        <div className="text-sm">
                            <p className="font-bold mb-1">
                                {confirmModal.type === 'approve' ? 'Setujui Laporan?' : 'Tolak / Revisi Laporan?'}
                            </p>
                            <p className="leading-relaxed opacity-80">
                                {confirmModal.type === 'approve'
                                    ? 'Mahasiswa akan dapat melanjutkan ke tahap upload laporan FINAL.'
                                    : 'Mahasiswa akan diminta untuk merevisi dan upload ulang laporan mereka.'}
                            </p>
                        </div>
                    </div>

                    {/* Textarea Feedback (hanya saat reject) */}
                    {confirmModal.type === 'reject' && (
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Alasan Penolakan <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={rejectFeedback}
                                onChange={(e) => setRejectFeedback(e.target.value)}
                                rows={3}
                                placeholder="Tuliskan alasan penolakan dan saran revisi untuk mahasiswa..."
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent resize-none"
                            />
                            <p className="text-xs text-gray-400 mt-1">{rejectFeedback.length} / 1000 karakter (minimal 5)</p>
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => {
                                setConfirmModal({ isOpen: false, type: null, reportId: null });
                                setRejectFeedback('');
                            }}
                            className="px-6 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-200 transition-all"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleConfirmAction}
                            disabled={confirmModal.type === 'reject' && rejectFeedback.trim().length < 5}
                            className={`px-8 py-2 text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                                confirmModal.type === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                            }`}
                        >
                            {confirmModal.type === 'approve' ? 'Ya, Setujui' : 'Ya, Tolak'}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default Report;
