import React,{ useState } from 'react';
import { useSelector } from 'react-redux';
import DataTable from 'react-data-table-component';
import { CheckSquare, Search } from 'lucide-react';
import { tableCustomStyles, makeNumberColumn } from './tableStyles';
import Skeleton from './Skeleton';

const EvaluationMonitoring = () => {
    const { data: evaluations, loading } = useSelector((state) => state.evaluations || { data: [], loading: false });
    const [searchTerm, setSearchTerm] = useState('');

    const filteredData = evaluations.filter(item =>
        item.leader?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.company?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        makeNumberColumn(1, 999),
        { name: 'Ketua', selector: (row) => row.leader?.name || '-', sortable: true, width: '300px' },
        { name: 'Mitra', selector: (row) => row.company?.name || '-', sortable: true, width: '300px' },
        { name: 'Dosen Pembimbing', selector: (row) => row.supervisor?.name || '-', sortable: true, width: '370px' },
        { name: 'Nilai Akhir', selector: (row) => row.evaluation?.final_grade || '-', sortable: true, width: '250px',
            cell: row => row.evaluation ? <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">{row.evaluation.final_grade}</span> : <span className="text-gray-400">Belum</span>
        }
    ];

    if (loading) return <Skeleton className="w-full h-96" />;

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200 pb-5">
                <h2 className="text-2xl font-bold leading-7 text-gray-900">Rekapitulasi Penilaian</h2>
                <p className="text-sm text-gray-500 mt-1">Monitor hasil penilaian mahasiswa.</p>
            </div>
            <div className="w-1/3 mb-4">
                <input type="text" placeholder="Cari kelompok..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <DataTable columns={columns} data={filteredData} pagination highlightOnHover responsive progressPending={loading} progressComponent={<Skeleton />} customStyles={tableCustomStyles} />
                </div>
            </div>
        </div>
    );
};

export default EvaluationMonitoring;
