import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DataTable from "react-data-table-component";
import { CirclePlus, Edit2, Trash2, Search, Palette, Calendar, CheckCircle, XCircle } from "lucide-react";
import { fetchThemes, deleteTheme } from "../../store/slice/themeSlice";
import Skeleton from "../../components/Skeleton";
import AddTheme from "./AddTheme";
import EditTheme from "./EditTheme";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import { toast } from "react-toastify";

const ThemeManagement = () => {
    const dispatch = useDispatch();
    const { data: themes, loading } = useSelector((state) => state.themes);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [themeToDelete, setThemeToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (themes.length === 0) {
            dispatch(fetchThemes());
        }
    }, [dispatch, themes.length]);

    const handleDelete = (theme) => {
        setThemeToDelete(theme);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (themeToDelete) {
            try {
                setIsDeleting(true);
                await dispatch(deleteTheme(themeToDelete.id)).unwrap();
                toast.success("Tema berhasil dihapus");
                setShowDeleteModal(false);
            } catch (error) {
                toast.error("Gagal menghapus tema: " + error);
            } finally {
                setIsDeleting(false);
                setThemeToDelete(null);
            }
        }
    };

    const handleEdit = (theme) => {
        setSelectedTheme(theme);
        setShowEditModal(true);
    };

    const filteredThemes = themes.filter((theme) =>
        theme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        theme.year.includes(searchTerm)
    );

    const columns = [
        {
            name: "Nama Tema",
            selector: (row) => row.name,
            sortable: true,
            cell: (row) => (
                <div className="flex flex-col py-2">
                    <span className="font-semibold text-gray-800">{row.name}</span>
                </div>
            ),
            grow: 2,
        },
        {
            name: "Tahun",
            selector: (row) => row.year,
            sortable: true,
            cell: (row) => (
                <div className="flex items-center text-gray-600">
                    <Calendar size={14} className="mr-2" />
                    {row.year}
                </div>
            ),
        },
        {
            name: "Status",
            selector: (row) => row.is_active,
            sortable: true,
            cell: (row) => (
                row.is_active ? (
                    <span className="flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle size={12} className="mr-1" /> Aktif
                    </span>
                ) : (
                    <span className="flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        <XCircle size={12} className="mr-1" /> Tidak Aktif
                    </span>
                )
            ),
        },
        {
            name: "Aksi",
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleEdit(row)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Edit Tema"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => handleDelete(row)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Hapus Tema"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ];

    const customStyles = {
        header: {
            style: {
                minHeight: '56px',
            },
        },
        headRow: {
            style: {
                backgroundColor: '#f9fafb',
                borderTopStyle: 'solid',
                borderTopWidth: '1px',
                borderTopColor: '#e5e7eb',
            },
        },
        headCells: {
            style: {
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#6b7280',
                letterSpacing: '0.05em',
            },
        },
        cells: {
            style: {
                fontSize: '0.875rem',
                color: '#374151',
            },
        },
    };

    return (
        <>
            <div className="space-y-6">
                <div className="border-b border-gray-200 pb-5">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Manajemen Tema
                    </h2>
                </div>

                <div className="flex justify-between items-center">
                    <div className="w-1/3">
                        <input
                            type="text"
                            placeholder="Cari tema..."
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
                            <CirclePlus />
                            Tambah Tema
                        </button>
                    </div>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <DataTable
                            columns={columns}
                            data={filteredThemes}
                            pagination
                            highlightOnHover
                            responsive
                            progressPending={loading}
                            progressComponent={<Skeleton />}
                            noDataComponent={
                                <div className="p-10 text-center text-gray-500">
                                    Tidak ada data tema ditemukan.
                                </div>
                            }
                            customStyles={customStyles}
                        />
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AddTheme show={showAddModal} onClose={() => setShowAddModal(false)} />
            <EditTheme
                show={showEditModal}
                onClose={() => setShowEditModal(false)}
                theme={selectedTheme}
            />

            <ConfirmDeleteModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                message={`Apakah Anda yakin ingin menghapus tema "${themeToDelete?.name}"?`}
            />
        </>
    );
};

export default ThemeManagement;
