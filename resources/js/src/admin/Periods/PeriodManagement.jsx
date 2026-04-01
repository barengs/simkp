import React, { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import DataTable from "react-data-table-component";
import {
    fetchPeriods,
    deletePeriod,
    togglePeriodActive
} from "../../store/slice/periodSlice";
import { toast } from "react-toastify";
import {
    Pencil,
    Trash2,
    CheckCircle,
    Circle,
    CirclePlus
} from "lucide-react";
import Skeleton from "../../components/Skeleton";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";

// Lazy load modals untuk konsistensi dengan StudentList
const AddPeriod = lazy(() => import("./AddPeriod"));
const EditPeriod = lazy(() => import("./EditPeriod"));

const PeriodManagement = () => {
    const dispatch = useDispatch();
    const { data: periods, loading } = useSelector((state) => state.periods);

    const [searchTerm, setSearchTerm] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [periodToDelete, setPeriodToDelete] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (periods.length === 0) {
            dispatch(fetchPeriods());
        }
    }, [dispatch, periods.length]);

    const handleToggleActive = async (period) => {
        if (period.is_active) return;
        try {
            await dispatch(togglePeriodActive(period.id)).unwrap();
            toast.success("Periode berhasil diaktifkan");
        } catch (error) {
            toast.error("Gagal mengaktifkan periode: " + error);
        }
    };

    const handleDelete = (period) => {
        setPeriodToDelete(period);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (periodToDelete) {
            try {
                setIsLoading(true);
                await dispatch(deletePeriod(periodToDelete.id)).unwrap();
                toast.success("Periode berhasil dihapus");
                setShowDeleteModal(false);
                setPeriodToDelete(null);
            } catch (error) {
                toast.error("Gagal menghapus periode: " + error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleEdit = (period) => {
        setSelectedPeriod(period);
        setShowEditModal(true);
    };

    const filteredPeriods = useMemo(() => {
        return periods.filter(
            (p) =>
                p.academic_year.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.theme_name && p.theme_name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [periods, searchTerm]);

    const columns = [
        {
            name: "Tahun Akademik",
            selector: (row) => row.academic_year,
            sortable: true,
            cell: (row) => (
                <div className="flex flex-row gap-2 py-2">
                    <span className="font-medium text-gray-900">{row.academic_year}</span>
                    <span className="text-xs text-gray-500 capitalize">{row.semester}</span>
                </div>
            )
        },
        {
            name: "Tema",
            selector: (row) => row.theme_name,
            sortable: true,
            cell: (row) => <span className="text-sm">{row.theme_name || "-"}</span>
        },
        {
            name: "Dari tanggal",
            selector: (row) => row.start_date,
            sortable: true,
            cell: (row) => (
                <div className="text-xs text-gray-600">
                    <div>{row.start_date}</div>
                </div>
            )
        },
        {
            name: "Sampai tanggal",
            selector: (row) => row.end_date,
            sortable: true,
            cell: (row) => (
                <div className="text-xs text-gray-600">
                    <div>{row.end_date}</div>
                </div>
            )
        },
        {
            name: "Status",
            selector: (row) => row.status,
            sortable: true,
            cell: (row) => {
                const statusConfig = {
                    'active': { class: 'bg-green-100 text-green-700', label: 'Aktif' },
                    'finished': { class: 'bg-blue-100 text-blue-700', label: 'Selesai' },
                    'inactive': { class: 'bg-gray-100 text-gray-500', label: 'Nonaktif' },
                };
                const config = statusConfig[row.status] || statusConfig['inactive'];
                
                return (
                    <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold ${config.class}`}>
                        <span>{config.label}</span>
                    </div>
                );
            }
        },
        {
            name: "Aksi",
            cell: (row) => (
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleEdit(row)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    {!row.is_active && (
                        <button
                            onClick={() => handleDelete(row)}
                            className="text-red-600 hover:text-red-900"
                            title="Hapus"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <>
            <div className="space-y-6">
                {/* Header disamakan dengan StudentList */}
                <div className="border-b border-gray-200 pb-5">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Manajemen Periode
                    </h2>
                </div>

                {/* Toolbar disamakan dengan StudentList */}
                <div className="flex justify-between items-center">
                    <div className="w-1/3">
                        <input
                            type="text"
                            placeholder="Cari periode atau tema..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
                        >
                            <CirclePlus className="w-5 h-5" />
                            Tambah Periode
                        </button>
                    </div>
                </div>

                {/* Table Card disamakan dengan StudentList */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <DataTable
                            columns={columns}
                            data={filteredPeriods}
                            pagination
                            paginationPerPage={10}
                            paginationRowsPerPageOptions={[10, 25, 50, 100]}
                            highlightOnHover
                            pointerOnHover
                            responsive 
                            progressPending={loading}
                            progressComponent={<Skeleton />}
                            noDataComponent={
                                <div className="p-10 text-center text-gray-400 italic">
                                    Belum ada data periode.
                                </div>
                            }
                        />
                    </div>
                </div>
            </div>

            {/* Modals dengan Suspense agar konsisten dengan lazy load */}
            <Suspense fallback={null}>
                <AddPeriod
                    show={showAddModal}
                    onClose={() => setShowAddModal(false)}
                />

                <EditPeriod
                    show={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    period={selectedPeriod}
                />

                <ConfirmDeleteModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={confirmDelete}
                    isLoading={isLoading}
                    message={`Anda akan menghapus periode akademik ${periodToDelete?.academic_year}. Tindakan ini tidak dapat dibatalkan.`}
                />
            </Suspense>
        </>
    );
};

export default PeriodManagement;