import React, { useEffect, useState, useMemo } from 'react'; // Tambahkan useMemo
import { useDispatch, useSelector } from 'react-redux';
import { fetchSubmittedInternships, approveInternship, rejectInternship } from '../../../store/slice/adminInternshipSlice';
import DataTable from 'react-data-table-component';
import { CheckCircle, XCircle, Eye, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import Skeleton from '../../../components/Skeleton';
import ReviewFilesModal from './ReviewFilesModal';
import RejectModal from './RejectModal';
import ConfirmApproveModal from './ConfirmApproveModal';

const ValidationIndex = () => {
    const dispatch = useDispatch();
    
    // Pastikan default value array agar tidak error .filter atau .length
    const { 
        submitted = [], 
        loadingSubmitted, 
        actionLoading 
    } = useSelector(state => state.adminInternships || {});

    const [isReviewModalOpen, setReviewModalOpen] = useState(false);
    const [isRejectModalOpen, setRejectModalOpen] = useState(false);
    const [isApproveModalOpen, setApproveModalOpen] = useState(false);
    const [selectedInternship, setSelectedInternship] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Perbaikan useEffect: Fetch data saat komponen mount
    useEffect(() => {
        dispatch(fetchSubmittedInternships());
    }, [dispatch]);

    const handleReviewClick = (row) => {
        setSelectedInternship(row);
        setReviewModalOpen(true);
    };

    const handleApproveClick = (row) => {
        setSelectedInternship(row);
        setApproveModalOpen(true);
    };

    const confirmApprove = async () => {
        if (!selectedInternship) return;
        try {
            await dispatch(approveInternship(selectedInternship.id)).unwrap();
            toast.success('Pendaftaran berhasil disetujui');
            setApproveModalOpen(false);
            setSelectedInternship(null);
        } catch (error) {
            toast.error(error || 'Gagal menyetujui pendaftaran');
        }
    };

    const handleRejectClick = (row) => {
        setSelectedInternship(row);
        setRejectModalOpen(true);
    };

    const submitReject = async (note) => {
        if (!selectedInternship) return;
        try {
            await dispatch(rejectInternship({ id: selectedInternship.id, note })).unwrap();
            toast.success('Pendaftaran berhasil ditolak');
            setRejectModalOpen(false);
            setSelectedInternship(null);
        } catch (error) {
            toast.error(error || 'Gagal menolak pendaftaran');
        }
    };

    // Gunakan useMemo untuk performa filtering yang lebih baik
    const filteredData = useMemo(() => {
        return submitted.filter((item) => {
            const search = searchTerm.toLowerCase();
            return (
                item.leader?.name?.toLowerCase().includes(search) ||
                item.leader?.nim?.toLowerCase().includes(search) ||
                item.company?.name?.toLowerCase().includes(search) ||
                item.company_name_manual?.toLowerCase().includes(search)
            );
        });
    }, [submitted, searchTerm]);

    const columns = useMemo(() => [
        {
            name: 'Periode',
            selector: row => `${row.period?.semester} ${row.period?.academic_year}`,
            sortable: true,
            width: '180px'
        },
        {
            name: 'Ketua Kelompok',
            cell: row => (
                <div className="py-2">
                    <div className="font-semibold text-gray-900">{row.leader?.name || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{row.leader?.nim}</div>
                </div>
            ),
            sortable: true,
        },
        {
            name: 'Total Anggota',
            selector: row => (row.students?.length || 0) + " Mahasiswa",
            width: '140px',
            sortable: true,
        },
        {
            name: 'Mitra/Perusahaan',
            cell: row => (
                <div className="py-2">
                    <div className="font-semibold text-gray-900">{row.company?.name || row.company_name_manual}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[200px]">{row.theme?.name}</div>
                </div>
            ),
            sortable: true,
        },
        {
            name: 'Aksi',
            cell: row => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => handleReviewClick(row)}
                        disabled={actionLoading}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Review Berkas"
                    >
                        <Eye size={18} />
                    </button>
                    <button
                        onClick={() => handleApproveClick(row)}
                        disabled={actionLoading}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Setujui"
                    >
                        <CheckCircle size={18} />
                    </button>
                    <button
                        onClick={() => handleRejectClick(row)}
                        disabled={actionLoading}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Tolak"
                    >
                        <XCircle size={18} />
                    </button>
                </div>
            ),
            width: '150px'
        }
    ], [actionLoading]);

    // if (loadingSubmitted && submitted.length === 0) {
    //     return (
    //         <div className="space-y-4 p-6">
    //             <Skeleton className="h-10 w-1/4 rounded-md" />
    //             <Skeleton className="h-20 w-full rounded-md" />
    //             <Skeleton className="h-64 w-full rounded-md" />
    //         </div>
    //     );
    // }

    return (
        <div className="space-y-6 p-4">
            <div className="border-b border-gray-200 pb-5">
                <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    Validasi Pendaftaran
                </h2>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="w-full md:w-1/3">
                    <input
                        type="text"
                        placeholder="Cari ketua, NIM, atau mitra..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-md border border-amber-100 text-amber-700">
                    <AlertCircle size={18} />
                    <span className="text-sm font-semibold">{submitted.length} Menunggu Validasi</span>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <DataTable
                    columns={columns}
                    data={filteredData}
                    pagination
                    highlightOnHover
                    responsive
                    progressPending={loadingSubmitted}
                    progressComponent={<Skeleton />}
                    noDataComponent={
                        <div className="p-10 text-center text-gray-500">
                            Tidak ada pendaftaran yang perlu divalidasi.
                        </div>
                    }
                />
            </div>

            {/* Modals */}
            {isReviewModalOpen && (
                <ReviewFilesModal
                    isOpen={isReviewModalOpen}
                    onClose={() => { setReviewModalOpen(false); setSelectedInternship(null); }}
                    internship={selectedInternship}
                />
            )}

            {isRejectModalOpen && (
                <RejectModal
                    isOpen={isRejectModalOpen}
                    onClose={() => { setRejectModalOpen(false); setSelectedInternship(null); }}
                    onSubmit={submitReject}
                    isSubmitting={actionLoading}
                />
            )}

            {isApproveModalOpen && (
                <ConfirmApproveModal
                    isOpen={isApproveModalOpen}
                    onClose={() => { setApproveModalOpen(false); setSelectedInternship(null); }}
                    onConfirm={confirmApprove}
                    isLoading={actionLoading}
                    message={`Setujui pendaftaran kelompok ${selectedInternship?.leader?.name}?`}
                />
            )}
        </div>
    );
};

export default ValidationIndex;