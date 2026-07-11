import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchInternshipGroups } from '../../store/slice/internshipSlice';
import DataTable from 'react-data-table-component';
import { tableCustomStyles, makeNumberColumn } from "../../components/tableStyles";
import { Search, ChevronRight, Building2, Users, BookOpen, CheckCircle, Clock } from 'lucide-react';
import Skeleton from '../../components/Skeleton';

const Logbook = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { groups, loading } = useSelector((state) => state.internships || { groups: [], loading: false });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(fetchInternshipGroups());
    }, [dispatch]);

    const filteredGroups = useMemo(() => {
        if (!Array.isArray(groups)) return [];
        return groups.filter((group) =>
            group.leader?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            group.company?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            group.company_name_manual?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [groups, searchTerm]);

    const columns = [
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
            name: 'Mitra KP',
            sortable: true,
            cell: (row) => (
                <div className="flex items-center gap-2 py-2">
                    <Building2 size={16} className="text-indigo-400 shrink-0" />
                    <span className="text-sm">{row.company?.name || row.company_name_manual || '-'}</span>
                </div>
            )
        },
        {
            name: 'Dosen Pembimbing',
            sortable: true,
            selector: (row) => row.supervisor?.name || '-',
            cell: (row) => (
                <span className="text-sm text-gray-700">{row.supervisor?.name || <span className="text-gray-400 italic text-xs">Belum diplot</span>}</span>
            )
        },
        {
            name: 'Status KP',
            sortable: true,
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
            width: '140px',
            cell: (row) => (
                <button
                    onClick={() => navigate(`/admin/internship-groups/${row.id}`, { state: { defaultTab: 'logbook' } })}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all border border-indigo-200"
                >
                    <BookOpen size={14} />
                    <span>Lihat Logbook</span>
                    <ChevronRight size={14} />
                </button>
            )
        }
    ];

    if (loading && filteredGroups.length === 0) {
        return <Skeleton className="w-full h-96" />;
    }

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200 pb-5">
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">Monitoring Logbook Bimbingan</h2>
                <p className="text-sm text-gray-500 mt-1">Pilih kelompok untuk melihat dan memvalidasi logbook harian mereka.</p>
            </div>

            <div className="flex justify-between items-center">
                <div className="w-1/3">
                    <input
                        type="text"
                        placeholder="Cari kelompok atau mitra..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
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
                        onRowClicked={(row) => navigate(`/admin/internship-groups/${row.id}`, { state: { defaultTab: 'logbook' } })}
                        noDataComponent={<div className="p-10 text-center text-gray-500 font-medium">Belum ada kelompok KP yang tersedia.</div>}
                        customStyles={tableCustomStyles}
                    />
                </div>
            </div>
        </div>
    );
};

export default Logbook;
