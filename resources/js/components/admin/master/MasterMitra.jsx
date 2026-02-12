import React, { useState, useEffect, useRef } from "react";
import DataTable from "react-data-table-component";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCompanies, createCompany, updateCompany, deleteCompany } from "../../store/slices/companySlice";
import Modal from "../../ui/Modal";
import DeleteConfirm from "../../ui/DeleteConfirm";
import { toast } from "react-toastify";
import { Skeleton } from "../../ui/Skeleton";

const MasterMitra = () => {
    const dispatch = useDispatch();
    const { companies: data, pagination, loading, forceRefetch } = useSelector((state) => state.companies);
    const { total: totalRows } = pagination;

    const [perPage, setPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        address: "",
        contact_person: "",
        phone: "",
    });

    const isFirstRun = useRef(true);

    useEffect(() => {
        if (isFirstRun.current || forceRefetch) {
            dispatch(fetchCompanies({ page: 1, perPage, search: searchTerm }));
            isFirstRun.current = false;
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            dispatch(fetchCompanies({ page: 1, perPage, search: searchTerm }));
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, perPage, dispatch, forceRefetch]);

    const handlePageChange = (page) => {
        dispatch(fetchCompanies({ page, perPage, search: searchTerm }));
    };

    const handlePerRowsChange = async (newPerPage, page) => {
        setPerPage(newPerPage);
        dispatch(fetchCompanies({ page, perPage: newPerPage, search: searchTerm }));
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setSelectedItem(item);
            setFormData({
                name: item.name,
                address: item.address,
                contact_person: item.contact_person,
                phone: item.phone,
            });
        } else {
            setSelectedItem(null);
            setFormData({
                name: "",
                address: "",
                contact_person: "",
                phone: "",
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setModalLoading(true);
        try {
            if (selectedItem) {
                await dispatch(updateCompany({ id: selectedItem.id, formData })).unwrap();
                toast.success("Data mitra berhasil diperbarui");
            } else {
                await dispatch(createCompany(formData)).unwrap();
                toast.success("Mitra baru berhasil ditambahkan");
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
            await dispatch(deleteCompany(selectedItem.id)).unwrap();
            toast.success("Mitra berhasil dihapus");
            setShowDeleteConfirm(false);
            setSelectedItem(null);
        } catch (error) {
            console.error(error);
            toast.error(error || "Gagal menghapus mitra");
        } finally {
            setModalLoading(false);
        }
    };

    const TableRowSkeleton = () => (
        <div className="w-full space-y-3 p-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-full" />
                </div>
            ))}
        </div>
    );

    const columns = [
        { name: "Nama Mitra", selector: (row) => row.name, sortable: true },
        { name: "Alamat", selector: (row) => row.address, sortable: true },
        { name: "Kontak", selector: (row) => row.contact_person, sortable: true },
        { name: "Telepon", selector: (row) => row.phone, sortable: true },
        {
            name: "Aksi",
            cell: (row) => (
                <div className="flex space-x-2">
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
                        Data Mitra
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
                                placeholder="Cari mitra..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => handleOpenModal()}
                            className="inline-flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Tambah Mitra
                        </button>
                    </div>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
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
                title={selectedItem ? "Edit Mitra" : "Tambah Mitra Baru"}
                showFooter={false}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nama Mitra/Perusahaan
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Nama Perusahaan"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Alamat
                        </label>
                        <textarea
                            required
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Alamat Lengkap"
                            rows="2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Kontak Person
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.contact_person}
                            onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Nama Kontak"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Telepon
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="021-12345678"
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100 mt-6">
                        <button
                            type="button"
                            disabled={modalLoading}
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border rounded-lg"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={modalLoading}
                            className={`bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:bg-indigo-700 transition-all ${modalLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {modalLoading ? "Menyimpan..." : (selectedItem ? "Perbarui" : "Simpan")}
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

export default MasterMitra;
