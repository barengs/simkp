import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReports, deleteReport } from '../../store/slice/reportSlice';
import { fetchMyInternship } from '../../store/slice/internshipSlice';
import DataTable from 'react-data-table-component';
import { PlusCircle, Search, Trash2, Download, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import Skeleton from '../../components/Skeleton';
import Modal from '../../components/Modal';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import AddReport from './AddReport';

const Report = () => {
    const dispatch = useDispatch();
    const { data: reports, loading } = useSelector((state) => state.reports || { data: [], loading: false });
    const { data: internships } = useSelector((state) => state.internships || { data: [] });

    const [searchTerm, setSearchTerm] = useState('');
    const [modalConfig, setModalConfig] = useState({ isOpen: false });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, data: null });

    useEffect(() => {
        dispatch(fetchReports());
        dispatch(fetchMyInternship());
    }, [dispatch]);

    const handleCloseModal = () => {
        setModalConfig({ isOpen: false });
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

    const filteredData = Array.isArray(reports) ? reports.filter(
        (item) => 
            item.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.created_at?.includes(searchTerm)
    ) : [];

    // Ensure student has internship
    const hasActiveInternship = Array.isArray(internships) ? internships.length > 0 : !!internships?.id;

    const columns = [
        {
            name: 'Waktu Unggah',
            selector: (row) => row.created_at,
            sortable: true,
            width: '180px'
        },
        {
            name: 'Jenis Laporan',
            selector: (row) => row.type,
            sortable: true,
            width: '150px',
            cell: row => (
                <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-widest ${
                    row.type === 'final' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                }`}>
                    {row.type}
                </span>
            )
        },
        {
            name: 'File',
            cell: row => (
                row.file_url ? (
                    <a 
                        href={row.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                        <FileText size={16} /> 
                        <span className="text-sm underline">Unduh</span>
                    </a>
                ) : <span className="text-gray-400 text-sm">Tidak ada file</span>
            )
        },
        {
            name: 'Aksi',
            cell: (row) => (
                <div className="flex space-x-2">
                    <button
                        title="Hapus Laporan"
                        onClick={() => setDeleteModal({ isOpen: true, data: row })}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            ),
            width: '100px'
        }
    ];

    if (loading && filteredData.length === 0) {
        return <Skeleton className="w-full h-96" />;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Manajemen Laporan KP</h2>
                    <p className="text-sm text-gray-500">Unggah berkas draf laporan atau laporan akhir kerja praktik Anda.</p>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-3">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari laporan..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => {
                            if (!hasActiveInternship) {
                                toast.warning('Anda belum terdaftar atau belum diterima pada program KP manapun.');
                                return;
                            }
                            setModalConfig({ isOpen: true });
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm"
                    >
                        <PlusCircle size={18} />
                        <span className="font-semibold">Unggah</span>
                    </button>
                </div>
            </div>

            <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                <DataTable
                    columns={columns}
                    data={filteredData}
                    pagination
                    highlightOnHover
                    responsive
                    noDataComponent={<div className="p-8 text-gray-500 bg-gray-50/50 w-full text-center">Belum ada riwayat laporan yang diunggah.</div>}
                />
            </div>

            {/* Modals */}
            <Modal
                isOpen={modalConfig.isOpen}
                onClose={handleCloseModal}
                title="Unggah Laporan KP"
            >
                <AddReport onClose={handleCloseModal} />
            </Modal>

            {/* Confirm Delete */}
            <ConfirmDeleteModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, data: null })}
                onConfirm={handleDelete}
                title="Hapus Dokumen"
                message={`Apakah Anda yakin ingin menghapus arsip Laporan ${deleteModal.data?.type === 'final' ? 'Final' : 'Draft'} yang diunggah pada ${deleteModal.data?.created_at}?`}
            />
        </div>
    );
};

export default Report;
