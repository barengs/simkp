import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchInternshipGroups } from '../../store/slice/internshipSlice';
import DataTable from 'react-data-table-component';
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Monitoring Logbook Bimbingan</h2>
                    <p className="text-sm text-gray-500">Pilih kelompok untuk melihat dan memvalidasi logbook harian mereka.</p>
                </div>
                <div className="mt-4 md:mt-0 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Cari kelompok atau mitra..."
                        className="pl-10 pr-4 py-2 w-72 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <DataTable
                    columns={columns}
                    data={filteredGroups}
                    pagination
                    highlightOnHover
                    pointerOnHover
                    responsive
                    onRowClicked={(row) => navigate(`/admin/internship-groups/${row.id}`, { state: { defaultTab: 'logbook' } })}
                    noDataComponent={<div className="p-6 text-gray-500 text-center">Belum ada kelompok KP yang tersedia.</div>}
                />
            </div>
        </div>
    );
};

export default Logbook;
