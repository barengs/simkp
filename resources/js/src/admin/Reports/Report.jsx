import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReports } from '../../store/slice/reportSlice';
import DataTable from 'react-data-table-component';
import { Search, FileText } from 'lucide-react';
import Skeleton from '../../components/Skeleton';

const Report = () => {
    const dispatch = useDispatch();
    const { data: reports, loading } = useSelector((state) => state.reports || { data: [], loading: false });

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(fetchReports());
    }, [dispatch]);

    const filteredData = Array.isArray(reports) ? reports.filter(
        (item) => 
            item.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.internship?.leader?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.internship?.company?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    const columns = [
        {
            name: 'Waktu Unggah',
            selector: (row) => row.created_at,
            sortable: true,
            width: '160px'
        },
        {
            name: 'Mahasiswa (Ketua)',
            selector: (row) => row.internship?.leader?.name || '-',
            sortable: true,
            minWidth: '200px'
        },
        {
            name: 'Mitra KP',
            selector: (row) => row.internship?.company?.name || row.internship?.company_name_manual || '-',
            sortable: true,
            minWidth: '200px'
        },
        {
            name: 'Dosen Pembimbing',
            selector: (row) => row.internship?.supervisor?.user?.name || '-',
            sortable: true,
            minWidth: '200px'
        },
        {
            name: 'Jenis',
            selector: (row) => row.type,
            sortable: true,
            width: '130px',
            cell: row => (
                <span className={`px-2 py-1 text-xs font-bold rounded-lg uppercase tracking-wider ${
                    row.type === 'final' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'
                }`}>
                    {row.type}
                </span>
            )
        },
        {
            name: 'Dokumen',
            cell: row => (
                row.file_url ? (
                    <a 
                        href={`/storage/${row.file_url}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors font-medium text-sm group"
                    >
                        <FileText size={16} className="text-indigo-500 group-hover:text-white" /> 
                        <span>Buka PDF/Docx</span>
                    </a>
                ) : <span className="text-gray-400 text-xs italic">Belum Tersedia</span>
            ),
            width: '180px'
        }
    ];

    if (loading && filteredData.length === 0) {
        return <Skeleton className="w-full h-96" />;
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-gray-50 pb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Monitoring Draft & Laporan Akhir</h2>
                    <p className="text-sm text-gray-500 mt-1">Lacak pengumpulan laporan Kerja Praktik format PDF/Docx per mahasiswa.</p>
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
                    noDataComponent={<div className="p-8 text-gray-500 text-center italic bg-gray-50/50">Belum ada riwayat laporan terekam dari seluruh mahasiswa.</div>}
                />
            </div>
        </div>
    );
};

export default Report;
