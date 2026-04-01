import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvaluations } from '../../store/slice/evaluationSlice';
import DataTable from 'react-data-table-component';
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
        {
            name: 'Ketua Kelompok',
            selector: (row) => row.leader?.name || '-',
            sortable: true,
            width: '200px'
        },
        {
            name: 'Nim',
            selector: (row) => row.leader?.nim || '-',
            width: '120px'
        },
        {
            name: 'Mitra KP',
            selector: (row) => row.company?.name || row.company_name_manual || '-',
            sortable: true,
            width: '180px'
        },
        {
            name: 'Dosen Pembimbing',
            selector: (row) => row.supervisor?.name || '-',
            sortable: true,
            width: '180px'
        },
        {
            name: 'Nilai Akhir',
            selector: (row) => row.evaluation?.final_grade || '-',
            sortable: true,
            width: '120px',
            cell: row => (
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    row.evaluation ? 'bg-green-100 text-green-800 font-bold text-sm' : 'bg-gray-100 text-gray-500'
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Rekapitulasi Penilaian Keseluruhan</h2>
                    <p className="text-sm text-gray-500">Memonitor hasil nilai akhir mahasiswa dari masing-masing dosen pembimbing.</p>
                </div>
                <div className="mt-4 md:mt-0">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari kelompok..."
                            className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <DataTable
                    columns={columns}
                    data={filteredData}
                    pagination
                    highlightOnHover
                    responsive
                    noDataComponent={<div className="p-6 text-gray-500">Belum ada data kelompok / penilaian yang tersedia.</div>}
                />
            </div>
            <div className="mt-4 flex items-start gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <p>Halaman ini hanya untuk membaca rekapan nilai (Read-Only). Hanya Dosen Pembimbing yang memiliki wewenang untuk mengisi atau mengedit nilai melalui Dashboard Dosen.</p>
            </div>
        </div>
    );
};

export default Evaluation;
