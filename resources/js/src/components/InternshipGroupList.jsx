import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { Search, User, ExternalLink, Book, FileText, CheckSquare, BarChart3 } from 'lucide-react';
import { tableCustomStyles, makeNumberColumn } from "./tableStyles";
import Skeleton from './Skeleton';
import { fetchInternshipGroups } from '../store/slice/internshipSlice';

/**
 * Internship Group List - Feature component for displaying KP groups
 * Used by: Admin, Dosen, Koordinator, Mahasiswa (depending on permission)
 */
const InternshipGroupList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { data: internships, loading } = useSelector((state) => state.internships || { data: [], loading: false });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');

    useEffect(() => {
        dispatch(fetchInternshipGroups());
    }, [dispatch]);

    const filteredData = useMemo(() => {
        return (internships || []).filter(item => {
            const term = searchTerm.toLowerCase();

            const matchLeader = item.leader?.name?.toLowerCase()?.includes(term);
            const matchCompany = item.company?.name?.toLowerCase()?.includes(term);
            const matchTheme = item.theme?.name?.toLowerCase()?.includes(term);

            return matchLeader || matchCompany || matchTheme;
        });
    }, [internships, searchTerm]);

    const columns = [
        makeNumberColumn(1, 999),
        {
            name: 'Ketua Kelompok',
            selector: (row) => row.leader?.name || '-',
            sortable: true,
            width: '300px'
        },
        {
            name: 'Nim',
            selector: (row) => row.leader?.nim || '-',
            width: '220px'
        },
        {
            name: 'Mitra KP',
            selector: (row) => row.company?.name || '-',
            sortable: true,
            width: '350px'
        },
        {
            name: 'Dosen Pembimbing',
            selector: (row) => row.supervisor?.name || '-',
            sortable: true,
            width: '370px'
        },
        {
            name: 'Status',
            selector: (row) => {
                const statusMap = {
                    ongoing: { label: 'Berjalan', color: 'blue' },
                    finished: { label: 'Selesai', color: 'green' },
                    grading: { label: 'Penilaian', color: 'orange' },
                    submitted: { label: 'Diajukan', color: 'purple' },
                    approved: { label: 'Disetujui', color: 'green' },
                    rejected: { label: 'Ditolak', color: 'red' }
                };
                const status = statusMap[row.status] || { label: row.status, color: 'gray' };
                return <span className={`px-2 py-0.5 text-xs font-medium rounded-full bg-${status.color}-100 text-${status.color}-800`}>{status.label}</span>;
            },
            sortable: true,
            width: '150px'
        },
        {
            name: 'Aksi',
            selector: 'id',
            sortable: false,
            width: '120px',
            cell: row => (
                <button
                    onClick={() => navigate(`/internship-groups/${row.internship?.id}`)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all border border-gray-200 hover:border-indigo-200 text-xs font-bold"
                    title="Lihat Detail"
                >
                    <ExternalLink size={14} />
                    <span>Detail</span>
                </button>
            )
        }
    ];

    const statusOptions = [
        { value: 'all', label: 'Semua Status' },
        { value: 'ongoing', label: 'Berjalan' },
        { value: 'finished', label: 'Selesai' },
        { value: 'grading', label: 'Penilaian' }
    ];

    if (loading) return <Skeleton className="w-full h-96" />;

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200 pb-5">
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">Daftar Kelompok KP</h2>
                <p className="text-sm text-gray-500 mt-1">Telusuri dan kelola semua kelompok kerja praktek.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Cari kelompok, mahasiswa, atau mitra..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                    {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <DataTable
                        columns={columns}
                        data={filteredData}
                        pagination
                        highlightOnHover
                        responsive
                        progressPending={loading}
                        progressComponent={<Skeleton />}
                        noDataComponent={
                            <div className="p-10 text-center text-gray-500 font-medium">
                                Tidak ada data yang cocok.
                            </div>
                        }
                        customStyles={tableCustomStyles}
                    />
                </div>
            </div>
        </div>
    );
};

export default InternshipGroupList;
