import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import Modal from "../../ui/Modal";
import DeleteConfirm from "../../ui/DeleteConfirm";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import api from "../../../src/api";
import { useToast } from "../../ui/Toast";

const MasterDosen = () => {
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [dosen, setDosen] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalRows, setTotalRows] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [formLoading, setFormLoading] = useState(false);
    const { addToast } = useToast();

    const [formData, setFormData] = useState({
        nip: "",
        name: "",
        email: "",
        phone: "",
        password: "password123",
    });

    // Edit/Delete states
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const fetchDosen = async (page, size = perPage, search = searchTerm) => {
        setLoading(true);
        try {
            const response = await api.get(`/lecturers?page=${page}&per_page=${size}&search=${search}`);
            setDosen(response.data.data.data);
            setTotalRows(response.data.data.total);
            setCurrentPage(response.data.data.current_page);
        } catch (error) {
            console.error("Error fetching lecturers:", error);
            addToast("Gagal mengambil data dosen", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchDosen(1, perPage, searchTerm);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handlePageChange = (page) => {
        fetchDosen(page);
    };

    const handlePerRowsChange = (newPerPage, page) => {
        setPerPage(newPerPage);
        fetchDosen(page, newPerPage);
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
            fetchDosen(1); // Refresh data
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
            nip: row.lecturer?.nip || '',
            name: row.name || '',
            email: row.email || '',
            phone: row.lecturer?.phone || '',
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
        try {
            await api.delete(`/lecturers/${deleteTarget.id}`);
            addToast('Dosen berhasil dihapus', 'success');
            setShowDeleteConfirm(false);
            setDeleteTarget(null);
            fetchDosen(currentPage);
        } catch (error) {
            console.error(error);
            addToast(error.response?.data?.message || 'Gagal menghapus data', 'error');
        }
    };

    const columns = [
        { name: "NIP", selector: (row) => row.lecturer?.nip || '-', sortable: true },
        { name: "Nama", selector: (row) => row.name, sortable: true },
        { name: "Email", selector: (row) => row.email, sortable: true },
        { name: "Telepon", selector: (row) => row.lecturer?.phone || '-', sortable: true },
        {
            name: "Status",
            selector: (row) => row.email_verified_at ? "Aktif" : "Non-Aktif", // Approximation
            sortable: true,
            cell: (row) => (
                <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${row.deleted_at ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                        }`}
                >
                    {row.deleted_at ? "Non-Aktif" : "Aktif"}
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
                            data={dosen}
                            // progressPending={loading}
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
                            {formLoading ? 'Menyimpan...' : (isEditing ? 'Perbarui Dosen' : 'Simpan Dosen') }
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default MasterDosen;
