import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvaluations } from '../../store/slice/evaluationSlice';
import DataTable from 'react-data-table-component';
import { tableCustomStyles, makeNumberColumn } from "../../components/tableStyles";
import { Search, Info } from 'lucide-react';
import Skeleton from '../../components/Skeleton';

const Evaluation = () => {
    const dispatch = useDispatch();
    const { data: internships, loading } = useSelector((state) => state.evaluations || { data: [], loading: false });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(fetchEvaluations());
    }, [dispatch]);

    const filteredData = Array.isArray(internships) ? internships.filter(
        (item) =>
            item.leader?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.company?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.company_name_manual?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

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
            selector: (row) => row.company?.name || row.company_name_manual || '-',
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
            name: 'Nilai Akhir',
            selector: (row) => row.evaluation?.final_grade || '-',
            sortable: true,
            width: '250px',
            cell: row => (
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${row.evaluation ? 'bg-green-100 text-green-800 font-bold text-sm' : 'bg-gray-100 text-gray-500'
                    }`}>
                    {row.evaluation ? row.evaluation.final_grade : 'Belum Ditilai'}
                </span>
            )
        },
    ];

    if (loading && filteredData.length === 0) {
        return <Skeleton className="w-full h-96" />;
    }

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200 pb-5">
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                    Rekapitulasi Penilaian Keseluruhan
                </h2>
                <p className="text-sm text-gray-500 mt-1">Memonitor hasil nilai akhir mahasiswa dari masing-masing dosen pembimbing.</p>
            </div>

            <div className="flex justify-between items-center">
                <div className="w-1/3">
                    <input
                        type="text"
                        placeholder="Cari kelompok..."
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
                                Belum ada data kelompok / penilaian yang tersedia.
                            </div>
                        }
                        customStyles={tableCustomStyles}
                    />
                </div>
            </div>

            <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <p>Halaman ini hanya untuk membaca rekapan nilai (Read-Only). Hanya Dosen Pembimbing yang memiliki wewenang untuk mengisi atau mengedit nilai melalui Dashboard Dosen.</p>
            </div>
        </div>
    );
};

export default Evaluation;
