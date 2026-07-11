import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApprovedInternships, assignSupervisor } from '../../../store/slice/adminInternshipSlice';
import DataTable from 'react-data-table-component';
import { tableCustomStyles, makeNumberColumn } from "../../components/tableStyles";
import { UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import Skeleton from '../../../components/Skeleton';
import PlottingModal from './PlottingModal';

const PlottingIndex = () => {
    const dispatch = useDispatch();
    const { approved, loadingApproved, actionLoading } = useSelector(state => state.adminInternships);

    const [isPlottingModalOpen, setPlottingModalOpen] = useState(false);
    const [selectedInternship, setSelectedInternship] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (approved.length === 0) {
            dispatch(fetchApprovedInternships());
        }
    }, [dispatch, approved.length]);

    const handlePlotClick = (row) => {
        setSelectedInternship(row);
        setPlottingModalOpen(true);
    };

    const submitPlotting = async (supervisorId) => {
        try {
            await dispatch(assignSupervisor({ id: selectedInternship.id, supervisor_id: supervisorId })).unwrap();
            toast.success('Dosen pembimbing berhasil diplot');
            setPlottingModalOpen(false);
            setSelectedInternship(null);
        } catch (error) {
            toast.error(error || 'Gagal menunjuk dosen pembimbing');
        }
    };

    const columns = [
        {
            name: 'Periode',
            selector: row => `${row.period?.semester} ${row.period?.academic_year}`,
            sortable: true,
            width: '150px'
        },
        {
            name: 'Ketua Kelompok',
            cell: row => (
                <div>
                    <div className="font-semibold text-gray-900">{row.leader?.name}</div>
                    <div className="text-xs text-gray-500">{row.leader?.nim}</div>
                </div>
            ),
            sortable: true,
        },
        {
            name: 'Total Anggota',
            selector: row => row.students?.length + " Mahasiswa",
            width: '130px',
            sortable: true,
        },
        {
            name: 'Tema / Mitra',
            cell: row => (
                <div>
                    <div className="font-semibold text-gray-900 truncate max-w-[200px]">{row.theme?.name}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[200px]">{row.company?.name || row.company_name_manual}</div>
                </div>
            ),
            sortable: true,
        },
        {
            name: 'Status',
            cell: () => (
                <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-full text-xs font-bold tracking-wide">
                    APPROVED
                </span>
            ),
            width: '130px',
        },
        {
            name: 'Action',
            cell: row => (
                <button
                    onClick={() => handlePlotClick(row)}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all shadow-sm disabled:opacity-50"
                >
                    <UserPlus size={16} />
                    <span>Plot Dosen</span>
                </button>
            ),
            width: '150px'
        }
    ];

    const filteredData = approved.filter((item) =>
        item.leader?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.leader?.nim?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.theme?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.company?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.company_name_manual?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // if (loadingApproved && approved.length === 0) {
    //     return (
    //         <div className="space-y-4">
    //             <Skeleton className="h-20 w-full rounded-md" />
    //             <Skeleton className="h-64 w-full rounded-md" />
    //         </div>
    //     );
    // }

    return (
        <>
            <div className="space-y-6">
                <div className="border-b border-gray-200 pb-5">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Plotting Dosen Pembimbing
                    </h2>
                </div>

                <div className="flex justify-between items-center">
                    <div className="w-1/3">
                        <input
                            type="text"
                            placeholder="Cari ketua, tema, atau mitra..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div className="flex space-x-3">
                        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-md border border-blue-100 text-blue-700">
                            <AlertCircle size={18} />
                            <span className="text-sm font-semibold">{approved.length} Menunggu Plotting</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-lg"><div className="px-4 py-5 sm:p-6">
                        <DataTable
                            columns={columns}
                            data={filteredData}
                            pagination
                            paginationPerPage={10}
                            paginationRowsPerPageOptions={[10, 25, 50, 100]}
                            highlightOnHover
                            pointerOnHover
                            responsive
                            progressPending={loadingApproved}
                            progressComponent={<Skeleton />}
                            customStyles={tableCustomStyles}
                            noDataComponent={
                                <div className="p-8 text-center text-gray-500">
                                    Tidak ada kelompok yang perlu diplot dosen pembimbing saat ini.
                                </div>
                            }
                        />
                    </div>
                </div>
            </div>

            {isPlottingModalOpen && (
                <PlottingModal
                    isOpen={isPlottingModalOpen}
                    onClose={() => { setPlottingModalOpen(false); setSelectedInternship(null); }}
                    onSubmit={submitPlotting}
                    isSubmitting={actionLoading}
                    internship={selectedInternship}
                />
            )}
        </>
    );
};

export default PlottingIndex;
