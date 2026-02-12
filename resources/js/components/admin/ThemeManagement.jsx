import React, { useState, useEffect, useRef } from "react";
import DataTable from "react-data-table-component";
import Modal from "../ui/Modal";
import DeleteConfirm from "../ui/DeleteConfirm";
import { toast } from "react-toastify";
import { Skeleton } from "../ui/Skeleton";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { fetchThemes, createTheme, updateTheme, deleteTheme } from "../store/slices/themeSlice";

const ThemeManagement = () => {
    const dispatch = useDispatch();
    const { themes: data, pagination, loading, forceRefetch } = useSelector((state) => state.themes);
    const { total: totalRows } = pagination;

    const [perPage, setPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        year: new Date().getFullYear().toString(),
        is_active: true,
    });

    const isFirstRun = useRef(true);

    useEffect(() => {
        if (isFirstRun.current || forceRefetch) {
            dispatch(fetchThemes({ page: 1, perPage, search: searchTerm }));
            isFirstRun.current = false;
            return;
        }

        const delaySearch = setTimeout(() => {
            dispatch(fetchThemes({ page: 1, perPage, search: searchTerm }));
        }, 500);
        return () => clearTimeout(delaySearch);
    }, [searchTerm, perPage, dispatch, forceRefetch]);

    const handlePageChange = (page) => {
        dispatch(fetchThemes({ page, perPage, search: searchTerm }));
    };

    const handlePerRowsChange = async (newPerPage, page) => {
        setPerPage(newPerPage);
        dispatch(fetchThemes({ page, perPage: newPerPage, search: searchTerm }));
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setSelectedItem(item);
            setIsEditing(true);
            setFormData({
                name: item.name,
                year: item.year,
                is_active: !!item.is_active,
            });
        } else {
            setSelectedItem(null);
            setIsEditing(false);
            setFormData({
                name: "",
                year: new Date().getFullYear().toString(),
                is_active: true,
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setModalLoading(true);
        try {
            if (isEditing) {
                await dispatch(updateTheme({ id: selectedItem.id, formData })).unwrap();
                toast.success("Tema berhasil diperbarui");
            } else {
                await dispatch(createTheme(formData)).unwrap();
                toast.success("Tema baru berhasil ditambahkan");
            }
            setShowModal(false);
        } catch (error) {
            toast.error(error || "Terjadi kesalahan");
        } finally {
            setModalLoading(false);
        }
    };

    const handleDeleteClick = (item) => {
        setSelectedItem(item);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        setModalLoading(true);
        try {
            await dispatch(deleteTheme(selectedItem.id)).unwrap();
            toast.success("Tema berhasil dihapus");
            setShowDeleteConfirm(false);
            setSelectedItem(null);
        } catch (error) {
            console.error(error);
            toast.error(error || "Gagal menghapus tema");
        } finally {
            setModalLoading(false);
        }
    };

    const TableRowSkeleton = () => (
        <div className="w-full space-y-3 p-4">
            {[...Array(1)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-full" />
                </div>
            ))}
        </div>
    );

    const columns = [
        {
            name: "Nama Tema",
            selector: (row) => row.name,
            sortable: true,
            // center: true,
            wrap: true,
        },
        {
            name: "Tahun",
            selector: (row) => row.year,
            sortable: true,
            center: true,
            width: "120px"
        },
        {
            name: "Status",
            selector: (row) => row.is_active,
            sortable: true,
            center: true,
            width: "150px",
            cell: (row) => (
                <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${row.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                        }`}
                >
                    {row.is_active ? "Aktif" : "Tidak Aktif"}
                </span>
            ),
        },
        {
            name: "Aksi",
            width: "120px",
            center: true,
            cell: (row) => (
                <div className="flex item space-x-2">
                    <button
                        onClick={() => handleOpenModal(row)}
                        className="text-indigo-600 hover:text-indigo-900 p-1"
                        title="Edit"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDeleteClick(row)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Hapus"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <>
            <div className="space-y-6">
                <div className="border-b border-gray-200 pb-5">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Manajemen Tema KP
                    </h2>
                </div>

                <div className="flex justify-between items-center">
                    <div className="w-1/3">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Cari tema..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200 flex items-center shadow-lg"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Tema
                    </button>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-100">
                    <div className="px-4 py-5 sm:p-6">
                        <DataTable
                            columns={columns}
                            data={data}
                            progressPending={loading}
                            progressComponent={<TableRowSkeleton />}
                            pagination
                            paginationServer
                            paginationTotalRows={totalRows}
                            onChangeRowsPerPage={handlePerRowsChange}
                            onChangePage={handlePageChange}
                            paginationPerPage={perPage}
                            paginationRowsPerPageOptions={[10, 25, 50, 100]}
                            highlightOnHover
                            pointerOnHover
                            responsive
                        />
                    </div>
                </div>
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={isEditing ? "Edit Tema KP" : "Tambah Tema KP Baru"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nama Tema
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Contoh: Pengembangan Web Application"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tahun
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.year}
                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Contoh: 2024"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            value={formData.is_active ? "1" : "0"}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.value === "1" })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="1">Aktif</option>
                            <option value="0">Tidak Aktif</option>
                        </select>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition duration-200"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={modalLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition duration-200 disabled:opacity-50 flex items-center"
                        >
                            {modalLoading && (
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            Simpan
                        </button>
                    </div>
                </form>
            </Modal>

            <DeleteConfirm
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleConfirmDelete}
                itemName={selectedItem?.name}
                loading={modalLoading}
            />
        </>
    );
};

export default ThemeManagement;
