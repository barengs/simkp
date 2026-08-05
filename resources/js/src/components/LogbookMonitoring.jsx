import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLogbooks } from '../store/slice/logbookSlice';
import DataTable from 'react-data-table-component';
import { Search, Book, CheckSquare, Clock, XCircle } from 'lucide-react';
import { tableCustomStyles, makeNumberColumn } from './tableStyles';
import Skeleton from './Skeleton';

const LogbookMonitoring = () => {
    const dispatch = useDispatch();
    const { data: logbooks, loading } = useSelector((state) => state.logbooks || { data: [], loading: false });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(fetchLogbooks());
    }, [dispatch]);

    const filteredData = logbooks.filter(item =>
        item.internship?.leader?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.internship?.company?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        makeNumberColumn(1, 999),
        {
            name: 'Mahasiswa',
            selector: (row) => row.internship?.leader?.name || '-',
            sortable: true,
            width: '300px'
        },
        {
            name: 'Mitra',
            selector: (row) => row.internship?.company?.name || '-',
            sortable: true,
            width: '300px'
        },
        {
            name: 'Tanggal',
            selector: (row) => row.date || '-',
            sortable: true,
            width: '150px'
        },
        {
            name: 'Status',
            selector: (row) => row.status || '-',
            sortable: true,
            width: '150px',
            cell: row => {
                const status = row.status;
                const colorMap = { approved: 'green', pending: 'amber', rejected: 'red', draft: 'gray' };
                return <span className={`px-2 py-0.5 text-xs font-medium rounded-full bg-${colorMap[status] || 'gray'}-100 text-${colorMap[status] || 'gray'}-800`}>{status}</span>;
            }
        }
    ];

    if (loading) return <Skeleton className="w-full h-96" />;

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200 pb-5">
                <h2 className="text-2xl font-bold leading-7 text-gray-900">Monitoring Logbook</h2>
                <p className="text-sm text-gray-500 mt-1">Pantau seluruh logbook mahasiswa.</p>
            </div>
            <div className="w-1/3 mb-4">
                <input
                    type="text"
                    placeholder="Cari mahasiswa atau mitra..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <DataTable columns={columns} data={filteredData} pagination highlightOnHover responsive progressPending={loading} progressComponent={<Skeleton />} customStyles={tableCustomStyles} />
                </div>
            </div>
        </div>
    );
};

export default LogbookMonitoring;
