import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLogbooks } from '../../store/slice/logbookSlice';
import DataTable from 'react-data-table-component';
import { Search, Eye } from 'lucide-react';
import Skeleton from '../../components/Skeleton';
import Modal from '../../components/Modal';

// Reusing Dosen's ShowLogbook as Admin just needs to view
import ShowLogbook from '../../dosen/Logbooks/ShowLogbook';

const Logbook = () => {
    const dispatch = useDispatch();
    const { data: logbooks, loading } = useSelector((state) => state.logbooks || state.logbook || { data: [], loading: false });

    const [searchTerm, setSearchTerm] = useState('');
    const [modalConfig, setModalConfig] = useState({ isOpen: false, data: null });

    useEffect(() => {
        dispatch(fetchLogbooks());
    }, [dispatch]);

    const filteredData = Array.isArray(logbooks) ? logbooks.filter(
        (item) => 
            item.activity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.internship?.leader?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.internship?.company?.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
            width: '180px'
        },
        {
            name: 'Aktivitas',
            selector: (row) => row.activity,
            wrap: true,
            cell: row => <div className="py-2 line-clamp-2 text-sm">{row.activity}</div>
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
                <button
                    title="Lihat Detail"
                    onClick={() => setModalConfig({ isOpen: true, data: row })}
                    className="p-1 px-3 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded flex items-center space-x-2"
                >
                    <Eye size={16} /> <span>Lihat</span>
                </button>
            ),
            width: '130px'
        }
    ];

    if (loading && filteredData.length === 0) {
        return <Skeleton className="w-full h-96" />;
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Monitoring Logbook Bimbingan</h2>
                    <p className="text-sm text-gray-500">Pantau seluruh laporan logbook mingguan dari program Kerja Praktik.</p>
                </div>
                <div className="mt-4 md:mt-0 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Cari mahasiswa, mitra, aktivitas..."
                        className="pl-10 pr-4 py-2 w-72 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <DataTable
                    columns={columns}
                    data={filteredData}
                    pagination
                    highlightOnHover
                    responsive
                    noDataComponent={<div className="p-6 text-gray-500 text-center">Belum ada data logbook yang tersedia.</div>}
                />
            </div>

            <Modal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ isOpen: false, data: null })}
                title={`Logbook - ${modalConfig.data?.internship?.leader?.name}`}
            >
                <ShowLogbook 
                    logbook={modalConfig.data} 
                    onClose={() => setModalConfig({ isOpen: false, data: null })}
                />
            </Modal>
        </div>
    );
};

export default Logbook;
