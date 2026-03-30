import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLogbooks, approveLogbook } from '../../store/slice/logbookSlice';
import DataTable from 'react-data-table-component';
import { Search, Eye, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import Skeleton from '../../components/Skeleton';
import Modal from '../../components/Modal';
import ShowLogbook from './ShowLogbook';

const Logbook = () => {
    const dispatch = useDispatch();
    const { data: logbooks, loading } = useSelector((state) => state.logbooks || state.logbook || { data: [], loading: false });

    const [searchTerm, setSearchTerm] = useState('');
    const [modalConfig, setModalConfig] = useState({ isOpen: false, data: null });

    useEffect(() => {
        dispatch(fetchLogbooks());
    }, [dispatch]);

    const handleApprove = async (id, currentStatus) => {
        // Only trigger update if pending
        if (currentStatus === 'approved') {
            toast.info('Logbook sudah disetujui sebelumnya');
            return;
        }

        const action = await dispatch(approveLogbook({ id, status: 'approved' }));
        if (approveLogbook.fulfilled.match(action)) {
            toast.success("Logbook berhasil disetujui");
        } else {
            toast.error(action.payload || "Gagal menyetujui logbook");
        }
    };

    const filteredData = Array.isArray(logbooks) ? logbooks.filter(
        (item) => 
            item.activity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.internship?.leader?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    const columns = [
        {
            name: 'Tanggal',
            selector: (row) => row.date,
            sortable: true,
            width: '120px'
        },
        {
            name: 'Mahasiswa (Ketua)',
            selector: (row) => row.internship?.leader?.name || '-',
            sortable: true,
            width: '180px'
        },
        {
            name: 'Mitra KP',
            selector: (row) => row.internship?.company?.name || row.internship?.company_name_manual || '-',
            sortable: true,
            width: '150px'
        },
        {
            name: 'Aktivitas',
            selector: (row) => row.activity,
            wrap: true,
            cell: row => <div className="py-2 line-clamp-2">{row.activity}</div>
        },
        {
            name: 'Status',
            selector: (row) => row.status,
            sortable: true,
            width: '130px',
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
                        title="Lihat Detail & Evaluasi"
                        onClick={() => setModalConfig({ isOpen: true, data: row })}
                        className="p-1 px-2 border border-blue-200 text-blue-600 hover:bg-blue-50 rounded flex items-center space-x-1"
                    >
                        <Eye size={16} /> <span>Review</span>
                    </button>
                    {row.status !== 'approved' ? (
                         <button
                            title="Setujui Cepat"
                            onClick={() => handleApprove(row.id, row.status)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                         >
                            <CheckCircle size={18} />
                         </button>
                    ) : (
                        <button
                            disabled
                            className="p-1 text-gray-400"
                        >
                            <CheckCircle size={18} />
                         </button>
                    )}
                </div>
            ),
            width: '180px'
        }
    ];

    if (loading && filteredData.length === 0) {
        return <Skeleton className="w-full h-96" />;
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Review Logbook Mahasiswa Bimbingan</h2>
                    <p className="text-sm text-gray-500">Pantau aktivitas mingguan dan validasi logbook mahasiswa.</p>
                </div>
                <div className="mt-4 md:mt-0">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari aktivitas atau mahasiswa..."
                            className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <DataTable
                    columns={columns}
                    data={filteredData}
                    pagination
                    highlightOnHover
                    responsive
                    noDataComponent={<div className="p-6 text-gray-500">Belum ada logbook yang di-submit oleh mahasiswa bimbingan Anda.</div>}
                />
            </div>

            <Modal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ isOpen: false, data: null })}
                title={`Evaluasi Logbook - ${modalConfig.data?.internship?.leader?.name}`}
            >
                <ShowLogbook 
                    logbook={modalConfig.data} 
                    onClose={() => setModalConfig({ isOpen: false, data: null })}
                    onApprove={() => {
                        handleApprove(modalConfig.data.id, modalConfig.data.status);
                        setModalConfig({ isOpen: false, data: null });
                    }}
                />
            </Modal>
        </div>
    );
};

export default Logbook;
