import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { tableCustomStyles, makeNumberColumn } from "./tableStyles";
import { fetchInternshipGroups } from '../store/slice/internshipSlice';
import {
    fetchSubmittedInternships,
    approveInternship,
    rejectInternship,
    assignSupervisor,
} from '../store/slice/adminInternshipSlice';
import Skeleton from '../components/Skeleton';
import { Users, Building2, MapPin, Notebook, GraduationCap, CheckCircle, XCircle, UserPlus, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import ReviewFilesModal from '../admin/Internships/Validation/ReviewFilesModal';
import RejectModal from '../admin/Internships/Validation/RejectModal';
import ConfirmApproveModal from '../admin/Internships/Validation/ConfirmApproveModal';
import PlottingModal from '../admin/Internships/Plotting/PlottingModal';

const InternshipListContent = ({ title, subtitle }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { groups, loading } = useSelector((state) => state.internships || { groups: [], loading: false });
    const { actionLoading } = useSelector((state) => state.adminInternships || { actionLoading: false });

    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [selectedInternship, setSelectedInternship] = useState(null);
    const [isReviewModalOpen, setReviewModalOpen] = useState(false);
    const [isRejectModalOpen, setRejectModalOpen] = useState(false);
    const [isApproveModalOpen, setApproveModalOpen] = useState(false);
    const [isPlottingModalOpen, setPlottingModalOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchInternshipGroups());
    }, [dispatch]);

    const filteredGroups = useMemo(() => {
        return groups.filter((group) =>
            group.leader?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            group.company?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            group.theme?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [groups, searchTerm]);

    const handleValidasiClick = (row) => {
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
            dispatch(fetchInternshipGroups()); // refresh list
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
            dispatch(fetchInternshipGroups()); // refresh list
        } catch (error) {
            toast.error(error || 'Gagal menolak pendaftaran');
        }
    };

    const handlePlottingClick = (row) => {
        setSelectedInternship(row);
        setPlottingModalOpen(true);
    };

    const submitPlotting = async (supervisorId) => {
        if (!selectedInternship) return;
        try {
            await dispatch(assignSupervisor({ id: selectedInternship.id, supervisor_id: supervisorId })).unwrap();
            toast.success('Dosen pembimbing berhasil diplot');
            setPlottingModalOpen(false);
            setSelectedInternship(null);
            dispatch(fetchInternshipGroups()); // refresh list
        } catch (error) {
            toast.error(error || 'Gagal menunjuk dosen pembimbing');
        }
    };

    const role = user?.role?.toLowerCase();
    const isAdmin = role === 'admin';

    const renderActionColumn = (row) => {
        const status = row.status;
        const hasSupervisor = !!row.supervisor;

        // Case A: Pending (submitted) — Tombol Validasi
        if (status === 'submitted') {
            return isAdmin ? (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => handleValidasiClick(row)}
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
            ) : (
                <span className="text-xs text-gray-400 italic">Menunggu Admin</span>
            );
        }

        // Case B: Approved, belum ada dosen — Tombol Plotting
        if (status === 'approved' && !hasSupervisor) {
            return isAdmin ? (
                <button
                    onClick={() => handlePlottingClick(row)}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all shadow-sm disabled:opacity-50"
                >
                    <UserPlus size={16} />
                    <span>Plotting Dosen</span>
                </button>
            ) : (
                <span className="text-xs text-gray-400 italic">Menunggu Plotting</span>
            );
        }

        // Case C: Ongoing / Finished / Rejected (atau approved dengan dosen) — Tombol Detail
        const detailPath = `/${role}/internship-groups/${row.id}`;
        return (
            <button
                onClick={() => navigate(detailPath)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all border border-indigo-200"
            >
                <Eye size={16} />
                <span>Detail</span>
            </button>
        );
    };

    const columns = [
        makeNumberColumn(1, 10),
        {
            name: 'Kelompok / Ketua',
            sortable: true,
            selector: (row) => row.leader?.name,
            cell: (row) => (
                <div className="py-3">
                    <div className="flex items-center gap-2">
                        <Users size={16} className="text-gray-400" />
                        <span className="font-bold text-gray-900">{row.leader?.name}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 pl-6">
                        {row.leader?.nim} • {row.students?.length} Anggota
                    </div>
                </div>
            )
        },
        {
            name: 'Instansi / Perusahaan',
            sortable: true,
            selector: (row) => row.company?.name,
            cell: (row) => (
                <div className="py-2">
                    <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-indigo-500" />
                        <span className="text-sm font-medium">{row.company?.name || row.company_name_manual}</span>
                    </div>
                    <div className="flex items-start gap-1 text-xs text-gray-500 mt-1 pl-6">
                        <MapPin size={12} className="mt-0.5" />
                        <span className="line-clamp-1">{row.company?.address}</span>
                    </div>
                </div>
            )
        },
        {
            name: 'Tema & Pembimbing',
            sortable: true,
            cell: (row) => (
                <div className="py-2">
                    <div className="flex items-center gap-2">
                        <Notebook size={16} className="text-amber-500" />
                        <span className="text-sm line-clamp-1">{row.theme?.name}</span>
                    </div>
                    {row.supervisor ? (
                        <div className="flex items-center gap-2 text-xs text-gray-600 mt-1 pl-6">
                            <GraduationCap size={14} className="text-blue-500" />
                            <span>{row.supervisor?.name}</span>
                        </div>
                    ) : (
                        <div className="text-xs text-gray-400 italic mt-1 pl-6">Belum ada pembimbing</div>
                    )}
                </div>
            )
        },
        {
            name: 'Status',
            sortable: true,
            selector: (row) => row.status,
            width: '130px',
            cell: (row) => {
                const statusStyles = {
                    submitted: 'bg-blue-100 text-blue-700',
                    approved: 'bg-indigo-100 text-indigo-700',
                    ongoing: 'bg-green-100 text-green-700',
                    grading: 'bg-amber-100 text-amber-700',
                    finished: 'bg-gray-100 text-gray-700',
                    rejected: 'bg-red-100 text-red-700',
                };
                return (
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusStyles[row.status] || 'bg-gray-100 text-gray-600'}`}>
                        {row.status}
                    </span>
                );
            }
        },
        {
            name: 'Aksi',
            cell: (row) => renderActionColumn(row),
            width: '180px',
        }
    ];

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200 pb-5">
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                    {title}
                </h2>
                {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
            </div>

            <div className="flex justify-between items-center">
                <div className="w-1/3">
                    <input
                        type="text"
                        placeholder="Cari kelompok, perusahaan, atau tema..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div className="text-sm text-gray-500">
                    Total: <span className="font-bold text-gray-900">{filteredGroups.length}</span> Kelompok
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <DataTable
                        columns={columns}
                        data={filteredGroups}
                        pagination
                        highlightOnHover
                        responsive
                        progressPending={loading}
                        progressComponent={<Skeleton className="h-96" />}
                        noDataComponent={
                            <div className="p-10 text-center text-gray-500 font-medium">
                                Tidak ada data kelompok ditemukan.
                            </div>
                        }
                        customStyles={tableCustomStyles}
                    />
                </div>
            </div>

            {/* Validation Modals */}
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

            {/* Plotting Modal */}
            {isPlottingModalOpen && (
                <PlottingModal
                    isOpen={isPlottingModalOpen}
                    onClose={() => { setPlottingModalOpen(false); setSelectedInternship(null); }}
                    onSubmit={submitPlotting}
                    isSubmitting={actionLoading}
                    internship={selectedInternship}
                />
            )}
        </div>
    );
};

export default InternshipListContent;
