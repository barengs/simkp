import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useStudents } from "../../context/StudentContext";
import { useToast } from "../../ui/Toast";
import Modal from "../../ui/Modal";
import DeleteConfirm from "../../ui/DeleteConfirm";
import { Skeleton } from "../../ui/Skeleton";
import api from "../../../src/api";

const MasterMahasiswa = () => {
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const { students, pagination, loading, getStudents, refreshStudents } = useStudents();
    const { total, current_page } = pagination;
    const { addToast } = useToast();

    const [perPage, setPerPage] = useState(10);
    const [formLoading, setFormLoading] = useState(false);

    const [formData, setFormData] = useState({
        nim: "",
        name: "",
        email: "",
        phone: "",
        major: "",
        batch_year: new Date().getFullYear(),
        password: "password123",
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            getStudents(1, perPage, searchTerm);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, getStudents, perPage]);

    const handlePageChange = (page) => {
        getStudents(page, perPage, searchTerm);
    };

    const handlePerRowsChange = (newPerPage, page) => {
        setPerPage(newPerPage);
        getStudents(page, newPerPage, searchTerm);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            if (isEditing && editingId) {
                await api.put(`/students/${editingId}`, formData);
                addToast('Mahasiswa berhasil diperbarui', 'success');
            } else {
                await api.post('/students', formData);
                addToast('Mahasiswa berhasil ditambahkan ke periode ini', 'success');
            }
            setShowModal(false);
            resetForm();
            refreshStudents();
        } catch (error) {
            console.error(error);
            addToast(error.response?.data?.message || 'Gagal menyimpan data', 'error');
        } finally {
            setFormLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            nim: "",
            name: "",
            email: "",
            phone: "",
            major: "",
            batch_year: new Date().getFullYear(),
            password: "password123",
        });
        setIsEditing(false);
        setEditingId(null);
    };

    const openEdit = (row) => {
        setIsEditing(true);
        setEditingId(row.id);
        setFormData({
            nim: row.nim || '',
            name: row.user?.name || '',
            email: row.user?.email || '',
            phone: row.phone || '',
            major: row.major || '',
            batch_year: row.batch_year || new Date().getFullYear(),
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
            await api.delete(`/students/${deleteTarget.id}`);
            addToast('Mahasiswa berhasil dihapus dari periode ini', 'success');
            setShowDeleteConfirm(false);
            setDeleteTarget(null);
            refreshStudents();
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
        { name: "NIM", selector: (row) => row.nim, sortable: true },
        { name: "Nama", selector: (row) => row.user?.name, sortable: true },
        { name: "Email", selector: (row) => row.user?.email, sortable: true },
        { name: "Major", selector: (row) => row.major, sortable: true },
        {
            name: "Status",
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
                        Data Mahasiswa
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
                                placeholder="Cari mahasiswa..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="inline-flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Tambah Mahasiswa
                    </button>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <DataTable
                            columns={columns}
                            data={students}
                            progressPending={loading}
                            progressComponent={<TableRowSkeleton />}
                            pagination
                            paginationServer
                            paginationTotalRows={total}
                            onChangeRowsPerPage={handlePerRowsChange}
                            onChangePage={handlePageChange}
                            paginationPerPage={perPage}
                            paginationDefaultPage={current_page}
                            highlightOnHover
                            pointerOnHover
                            responsive
                        />
                    </div>
                </div>
            </div>

            <DeleteConfirm
                isOpen={showDeleteConfirm}
                itemName={deleteTarget?.user?.name}
                onClose={() => { setShowDeleteConfirm(false); setDeleteTarget(null); }}
                onConfirm={confirmDelete}
                loading={formLoading}
            />

            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); resetForm(); }}
                title={isEditing ? 'Edit Mahasiswa' : 'Tambah Mahasiswa'}
                showFooter={false}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">NIM</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                                value={formData.nim}
                                onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Telepon</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Program Studi</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                                value={formData.major}
                                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Angkatan</label>
                            <input
                                type="number"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                                value={formData.batch_year}
                                onChange={(e) => setFormData({ ...formData, batch_year: e.target.value })}
                            />
                        </div>
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
                            {formLoading ? 'Menyimpan...' : (isEditing ? 'Perbarui' : 'Simpan')}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default MasterMahasiswa;
