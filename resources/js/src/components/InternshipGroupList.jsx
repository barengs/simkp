import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DataTable from 'react-data-table-component';
import { fetchInternshipGroups } from '../store/slice/internshipSlice';
import Skeleton from '../components/Skeleton';
import { Users, Building2, MapPin, Notebook, GraduationCap } from 'lucide-react';

const InternshipListContent = ({ title, subtitle }) => {
    const dispatch = useDispatch();
    const { groups, loading } = useSelector((state) => state.internships || { groups: [], loading: false });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(fetchInternshipGroups());
    }, [dispatch]);

    const filteredGroups = useMemo(() => {
        return groups.filter((group) => 
            group.leader?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            group.company?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            group.theme?.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
            name: 'Instansi / Perusahaan',
            sortable: true,
            selector: (row) => row.company?.name,
            cell: (row) => (
                <div className="py-2">
                    <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-indigo-500" />
                        <span className="text-sm font-medium">{row.company?.name}</span>
                    </div>
                    <div className="flex items-start gap-1 text-xs text-gray-500 mt-1 pl-6">
                        <MapPin size={12} className="mt-0.5" />
                        <span className="line-clamp-1">{row.company?.address}</span>
                    </div>
                </div>
            )
        },
        {
            name: 'Tema & Pembimbing',
            sortable: true,
            cell: (row) => (
                <div className="py-2">
                    <div className="flex items-center gap-2">
                        <Notebook size={16} className="text-amber-500" />
                        <span className="text-sm line-clamp-1">{row.theme?.name}</span>
                    </div>
                    {row.supervisor ? (
                        <div className="flex items-center gap-2 text-xs text-gray-600 mt-1 pl-6">
                            <GraduationCap size={14} className="text-blue-500" />
                            <span>{row.supervisor?.name}</span>
                        </div>
                    ) : (
                        <div className="text-xs text-gray-400 italic mt-1 pl-6">Belum ada pembimbing</div>
                    )}
                </div>
            )
        },
        {
            name: 'Status',
            sortable: true,
            selector: (row) => row.status,
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
        }
    ];

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200 pb-5">
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                    {title}
                </h2>
                {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
            </div>

            <div className="flex justify-between items-center">
                <div className="w-full max-w-sm relative">
                    <input
                        type="text"
                        placeholder="Cari kelompok, perusahaan, atau tema..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    />
                    <Users className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </div>
                <div className="text-sm text-gray-500">
                    Total: <span className="font-bold text-gray-900">{filteredGroups.length}</span> Kelompok
                </div>
            </div>

            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
                <DataTable
                    columns={columns}
                    data={filteredGroups}
                    pagination
                    highlightOnHover
                    responsive
                    progressPending={loading}
                    progressComponent={<Skeleton className="h-96" />}
                    noDataComponent={
                        <div className="py-12 text-center text-gray-400 italic">
                            Tidak ada data kelompok ditemukan.
                        </div>
                    }
                    customStyles={{
                        header: { style: { display: 'none' } },
                        headRow: {
                            style: {
                                backgroundColor: '#f9fafb',
                                borderBottomWidth: '1px',
                                borderBottomColor: '#f3f4f6',
                            }
                        },
                        headCells: {
                            style: {
                                color: '#4b5563',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                            }
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default InternshipListContent;
