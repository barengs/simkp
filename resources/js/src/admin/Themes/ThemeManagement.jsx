import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DataTable from "react-data-table-component";
import { Plus, Edit2, Trash2, Search, Palette, Calendar, CheckCircle, XCircle } from "lucide-react";
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

    if (loading && themes.length === 0) {
        return (
            <div className="p-6">
                <Skeleton count={5} />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Palette className="mr-3 text-indigo-600" />
                        Manajemen Tema
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Kelola tema Kerja Praktek berdasarkan periode aktif.
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition group"
                >
                    <Plus size={18} className="mr-2 group-hover:rotate-90 transition-transform duration-300" />
                    Tambah Tema
                </button>
            </div>

            {/* Content Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Cari tema..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={filteredThemes}
                    pagination
                    highlightOnHover
                    responsive
                    noDataComponent={
                        <div className="p-10 text-center text-gray-500">
                            Tidak ada data tema ditemukan.
                        </div>
                    }
                    customStyles={customStyles}
                />
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
        </div>
    );
};

export default ThemeManagement;
