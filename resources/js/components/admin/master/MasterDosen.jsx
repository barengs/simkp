import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import Modal from "../../ui/Modal";
import DeleteConfirm from "../../ui/DeleteConfirm";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import api from "../../../src/api";
import { useToast } from "../../ui/Toast";
import { useLecturers } from "../../context/LecturerContext";
import { Skeleton } from "../../ui/Skeleton";

const MasterDosen = () => {
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Use Context
    const { lecturers, pagination, loading, getLecturers, refreshLecturers } = useLecturers();
    const { total, per_page, current_page } = pagination;

    const [formLoading, setFormLoading] = useState(false);
    const { addToast } = useToast();

    // Local state for params to control context
    const [perPage, setPerPage] = useState(10);
    // Note: currentPage is managed by context via getLecturers, but we need to pass it from DataTable change.

    const [formData, setFormData] = useState({
        nip: "",
        name: "",
        email: "",
        phone: "",
        password: "dosen123",
    });

    // Edit/Delete states
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    // Initial load & Search debounce
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            getLecturers(1, perPage, searchTerm);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, getLecturers, perPage]);

    const handlePageChange = (page) => {
        getLecturers(page, perPage, searchTerm);
    };

    const handlePerRowsChange = (newPerPage, page) => {
        setPerPage(newPerPage);
        getLecturers(page, newPerPage, searchTerm);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            if (isEditing && editingId) {
                await api.put(`/lecturers/${editingId}`, formData);
                addToast('Dosen berhasil diperbarui', 'success');
            } else {
                await api.post('/lecturers', formData);
                addToast('Dosen berhasil ditambahkan', 'success');
            }

            setShowModal(false);
            setIsEditing(false);
            setEditingId(null);
            setFormData({ nip: '', name: '', email: '', phone: '', password: 'password123' });
            refreshLecturers(); // Refresh data using context
        } catch (error) {
            console.error(error);
            addToast(error.response?.data?.message || 'Gagal menyimpan data', 'error');
        } finally {
            setFormLoading(false);
        }
    };

    const openEdit = (row) => {
        setIsEditing(true);
        setEditingId(row.id);
        setFormData({
            nip: row.nip || '',
            name: row.user?.name || '',
            email: row.user?.email || '',
            phone: row.phone || '',
            password: 'password123'
        });
        setShowModal(true);
    };

    const openDelete = (row) => {
        setDeleteTarget(row);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setFormLoading(true);
        try {
            await api.delete(`/lecturers/${deleteTarget.id}`);
            addToast('Dosen berhasil dihapus dari periode ini', 'success');
            setShowDeleteConfirm(false);
            setDeleteTarget(null);
            refreshLecturers();
        } catch (error) {
            console.error(error);
            addToast(error.response?.data?.message || 'Gagal menghapus data', 'error');
        } finally {
            setFormLoading(false);
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
        { name: "NIP", selector: (row) => row.nip || '-', sortable: true },
        { name: "Nama", selector: (row) => row.user?.name || '-', sortable: true },
        { name: "Email", selector: (row) => row.user?.email || '-', sortable: true },
        { name: "Telepon", selector: (row) => row.phone || '-', sortable: true },
        {
            name: "Status",
            selector: (row) => "Aktif",
            sortable: true,
            cell: (row) => (
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Aktif
                </span>
            ),
        },
        {
            name: "Aksi",
            cell: (row) => (
                <div className="flex space-x-2">
                    <button onClick={() => openEdit(row)} className="text-indigo-600 hover:text-indigo-900 p-1" title="Edit">
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => openDelete(row)} className="text-red-600 hover:text-red-900 p-1" title="Hapus">
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
                        Data Dosen
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
                                placeholder="Cari dosen..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => { setIsEditing(false); setEditingId(null); setFormData({ nip: '', name: '', email: '', phone: '', password: 'password123' }); setShowModal(true); }}
                            className="inline-flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Tambah Dosen
                        </button>
                    </div>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <DataTable
                            columns={columns}
                            data={lecturers}
                            progressPending={loading}
                            progressComponent={<TableRowSkeleton />}
                            pagination
                            paginationServer
                            paginationTotalRows={total}
                            onChangeRowsPerPage={handlePerRowsChange}
                            onChangePage={handlePageChange}
                            paginationPerPage={perPage}
                            paginationDefaultPage={current_page} // Ensure persistence usually visual
                            paginationRowsPerPageOptions={[10, 25, 50, 100]}
                            highlightOnHover
                            pointerOnHover
                            responsive
                        />
                    </div>
                </div>
            </div>

            <DeleteConfirm
                isOpen={showDeleteConfirm}
                itemName={deleteTarget?.name}
                onClose={() => { setShowDeleteConfirm(false); setDeleteTarget(null); }}
                onConfirm={confirmDelete}
                loading={formLoading}
            />

            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setIsEditing(false); setEditingId(null); }}
                title={isEditing ? 'Edit Dosen' : 'Tambah Dosen'}
                showFooter={false}
            >
                <form onSubmit={handleSubmit} className="space-y-4 bg-white">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 bg-white/50 border"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">NIP</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 bg-white/50 border"
                            value={formData.nip}
                            onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 bg-white/50 border"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Telepon</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 bg-white/50 border"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end pt-4 space-x-2">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border rounded-lg"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={formLoading}
                            className={`bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:bg-indigo-700 transition-all ${formLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {formLoading ? 'Menyimpan...' : (isEditing ? 'Perbarui Dosen' : 'Simpan Dosen')}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default MasterDosen;
