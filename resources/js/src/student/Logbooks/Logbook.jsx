import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLogbooks, deleteLogbook } from '../../store/slice/logbookSlice';
import { fetchMyInternship } from '../../store/slice/internshipSlice';
import DataTable from 'react-data-table-component';
import { PlusCircle, Search, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import Skeleton from '../../components/Skeleton';
import Modal from '../../components/Modal';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import AddLogbook from './AddLogbook';
import EditLogbook from './EditLogbook';
import ShowLogbook from './ShowLogbook';

const Logbook = () => {
    const dispatch = useDispatch();
    const { data: logbooks, loading } = useSelector((state) => state.logbooks || state.logbook || { data: [], loading: false });
    const { data: internships } = useSelector((state) => state.internships || { data: [] });

    const [searchTerm, setSearchTerm] = useState('');
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, data: null });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, data: null });

    useEffect(() => {
        dispatch(fetchLogbooks());
        // We also need internships to check if student is part of any active internship to allow add
        dispatch(fetchMyInternship());
    }, [dispatch]);

    const handleCloseModal = () => {
        setModalConfig({ isOpen: false, type: null, data: null });
    };

    const handleDelete = async () => {
        if (!deleteModal.data) return;
        
        const action = await dispatch(deleteLogbook(deleteModal.data.id));
        if (deleteLogbook.fulfilled.match(action)) {
            toast.success("Logbook berhasil dihapus");
        } else {
            toast.error(action.payload || "Gagal menghapus logbook");
        }
        setDeleteModal({ isOpen: false, data: null });
    };

    const filteredData = Array.isArray(logbooks) ? logbooks.filter(
        (item) => item.activity?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    // Ensure student has internship
    const hasActiveInternship = Array.isArray(internships) ? internships.length > 0 : !!internships?.id;

    const columns = [
        {
            name: 'Tanggal',
            selector: (row) => row.date,
            sortable: true,
            width: '150px'
        },
        {
            name: 'Aktivitas',
            selector: (row) => row.activity,
            sortable: true,
            wrap: true,
            cell: row => <div className="py-2 line-clamp-2">{row.activity}</div>
        },
        {
            name: 'Status',
            selector: (row) => row.status,
            sortable: true,
            width: '150px',
            cell: row => (
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    row.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                    {row.status === 'approved' ? 'Disetujui' : 'Menunggu'}
                </span>
            )
        },
        {
            name: 'Aksi',
            cell: (row) => (
                <div className="flex space-x-2">
                    <button
                        title="Lihat Detail"
                        onClick={() => setModalConfig({ isOpen: true, type: 'view', data: row })}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                        <Eye size={18} />
                    </button>
                    {row.status !== 'approved' && (
                        <>
                            <button
                                title="Edit Logbook"
                                onClick={() => setModalConfig({ isOpen: true, type: 'edit', data: row })}
                                className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                            >
                                <Edit size={18} />
                            </button>
                            <button
                                title="Hapus Logbook"
                                onClick={() => setDeleteModal({ isOpen: true, data: row })}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                                <Trash2 size={18} />
                            </button>
                        </>
                    )}
                </div>
            ),
            width: '150px'
        }
    ];

    if (loading && filteredData.length === 0) {
        return <Skeleton className="w-full h-96" />;
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Catatan Logbook Mingguan</h2>
                    <p className="text-sm text-gray-500">Laporkan aktivitas kerja praktik Anda secara rutin.</p>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-3">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari aktivitas..."
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
                            setModalConfig({ isOpen: true, type: 'add', data: null });
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                        <PlusCircle size={18} />
                        <span>Tambah</span>
                    </button>
                </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <DataTable
                    columns={columns}
                    data={filteredData}
                    pagination
                    highlightOnHover
                    responsive
                    noDataComponent={<div className="p-6 text-gray-500">Belum ada logbook yang ditambahkan.</div>}
                />
            </div>

            {/* Modals */}
            <Modal
                isOpen={modalConfig.isOpen}
                onClose={handleCloseModal}
                title={
                    modalConfig.type === 'add' ? 'Tambah Logbook Baru' :
                    modalConfig.type === 'edit' ? 'Edit Logbook' : 'Detail Logbook'
                }
            >
                {modalConfig.type === 'add' && <AddLogbook onClose={handleCloseModal} />}
                {modalConfig.type === 'edit' && <EditLogbook logbook={modalConfig.data} onClose={handleCloseModal} />}
                {modalConfig.type === 'view' && <ShowLogbook logbook={modalConfig.data} onClose={handleCloseModal} />}
            </Modal>

            {/* Confirm Delete */}
            <ConfirmDeleteModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, data: null })}
                onConfirm={handleDelete}
                title="Hapus Logbook"
                message="Apakah Anda yakin ingin menghapus catatan logbook ini? Tindakan ini tidak dapat dibatalkan."
            />
        </div>
    );
};

export default Logbook;
