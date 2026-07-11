import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchReports } from '../../store/slice/reportSlice';
import DataTable from 'react-data-table-component';
import { tableCustomStyles, makeNumberColumn } from "../../components/tableStyles";
import { Search, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';
import Skeleton from '../../components/Skeleton';

const Report = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { data: reports, loading } = useSelector((state) => state.reports || { data: [], loading: false });

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(fetchReports());
    }, [dispatch]);

    const groupedData = useMemo(() => {
        if (!Array.isArray(reports)) return [];

        const groups = {};
        reports.forEach(report => {
            const id = report.internship?.id;
            if (!id) return;
            if (!groups[id]) {
                groups[id] = {
                    internship: report.internship,
                    reports: [],
                };
            }
            groups[id].reports.push(report);
        });

        return Object.values(groups).map(g => ({
            ...g,
            latest: g.reports[0],
        }));
    }, [reports]);

    const filteredData = groupedData.filter(
        (item) =>
            item.latest?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.internship?.leader?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.internship?.company?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        makeNumberColumn(1, 10),
        {
            name: 'Update Terakhir',
            selector: (row) => row.latest?.updated_at,
            sortable: true,
            width: '180px'
        },
        {
            name: 'Mahasiswa (Ketua)',
            selector: (row) => row.internship?.leader?.name || '-',
            sortable: true,
        },
        {
            name: 'Mitra KP',
            selector: (row) => row.internship?.company?.name || row.internship?.company_name_manual || '-',
            sortable: true,
        },
        {
            name: 'Dosen Pembimbing',
            selector: (row) => row.internship?.supervisor?.name || '-',
            sortable: true,
        },
        {
            name: 'Status Terbaru',
            width: '150px',
            cell: row => {
                const latest = row.latest;
                if (latest.status === 'approved') return <div className="flex items-center text-green-600 font-bold text-[10px] uppercase"><CheckCircle size={12} className="mr-1" /> Disetujui</div>;
                if (latest.status === 'rejected') return <div className="flex items-center text-red-600 font-bold text-[10px] uppercase"><XCircle size={12} className="mr-1" /> Ditolak</div>;
                return <div className="flex items-center text-amber-600 font-bold text-[10px] uppercase"><Clock size={12} className="mr-1" /> Pending</div>;
            }
        },
        {
            name: 'Aksi',
            cell: row => (
                <button
                    onClick={() => navigate(`/admin/internship-groups/${row.internship?.id}`, { state: { defaultTab: 'laporan' } })}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all border border-gray-200 hover:border-indigo-200 text-xs font-bold"
                    title="Lihat Detail & Riwayat Laporan"
                >
                    <ExternalLink size={14} />
                    <span>Detail</span>
                </button>
            ),
            width: '120px'
        }
    ];

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200 pb-5">
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">Monitoring Laporan Akhir</h2>
                <p className="text-sm text-gray-500 mt-1">Pantau seluruh pengumpulan laporan dari mahasiswa. Klik Detail untuk melihat riwayat lengkap laporan tiap kelompok.</p>
            </div>

            <div className="flex justify-between items-center">
                <div className="w-1/3">
                    <input
                        type="text"
                        placeholder="Cari mahasiswa atau mitra..."
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
                        data={filteredData}
                        pagination
                        highlightOnHover
                        responsive
                        progressPending={loading}
                        progressComponent={<Skeleton />}
                        noDataComponent={
                            <div className="p-10 text-center text-gray-500 font-medium">
                                Belum ada aktivitas laporan dari kelompok mahasiswa.
                            </div>
                        }
                        customStyles={tableCustomStyles}
                    />
                </div>
            </div>
        </div>
    );
};

export default Report;
