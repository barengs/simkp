import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReports } from '../store/slice/reportSlice';
import DataTable from 'react-data-table-component';
import { Search, FileText, ExternalLink } from 'lucide-react';
import { tableCustomStyles, makeNumberColumn } from './tableStyles';
import Skeleton from './Skeleton';

const ReportMonitoring = () => {
    const dispatch = useDispatch();
    const { data: reports, loading } = useSelector((state) => state.reports || { data: [], loading: false });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(fetchReports());
    }, [dispatch]);

    const filteredData = reports.filter(item =>
        item.internship?.leader?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.internship?.company?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        makeNumberColumn(1, 999),
        { name: 'Ketua', selector: (row) => row.internship?.leader?.name || '-', sortable: true, width: '300px' },
        { name: 'Mitra', selector: (row) => row.internship?.company?.name || '-', sortable: true, width: '300px' },
        { name: 'Judul', selector: (row) => row.title || '-', sortable: true, width: '300px' },
        { name: 'Status', selector: (row) => row.status || '-', sortable: true, width: '150px',
            cell: row => {
                const colorMap = { approved: 'green', pending: 'amber', rejected: 'red' };
                return <span className={`px-2 py-0.5 text-xs font-medium rounded-full bg-${colorMap[row.status] || 'gray'}-100 text-${colorMap[row.status] || 'gray'}-800`}>{row.status}</span>;
            }
        },
        { name: 'Aksi', cell: row => (
            <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all border border-gray-200 hover:border-indigo-200 text-xs font-bold">
                <ExternalLink size={14} /> <span>Detail</span>
            </button>
        ), width: '120px' }
    ];

    if (loading) return <Skeleton className="w-full h-96" />;

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200 pb-5">
                <h2 className="text-2xl font-bold leading-7 text-gray-900">Monitoring Laporan</h2>
                <p className="text-sm text-gray-500 mt-1">Pantau seluruh laporan mahasiswa.</p>
            </div>
            <div className="w-1/3 mb-4">
                <input type="text" placeholder="Cari mahasiswa atau mitra..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <DataTable columns={columns} data={filteredData} pagination highlightOnHover responsive progressPending={loading} progressComponent={<Skeleton />} customStyles={tableCustomStyles} />
                </div>
            </div>
        </div>
    );
};

export default ReportMonitoring;
