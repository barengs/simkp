import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import Modal from "../../ui/Modal";
import DeleteConfirm from "../../ui/DeleteConfirm";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "react-toastify";
import { Skeleton } from "../../ui/Skeleton";
import { useSelector, useDispatch } from "react-redux";
import { fetchLecturers, createLecturer, updateLecturer, deleteLecturer } from "../../store/slices/lecturerSlice";

const MasterDosen = () => {
    const dispatch = useDispatch();
    const { lecturers, pagination, loading, initialLoading, forceRefetch } = useSelector((state) => state.lecturers);
    const { total, current_page } = pagination;

    const [searchTerm, setSearchTerm] = useState("");
    const [perPage, setPerPage] = useState(10);
    const [showModal, setShowModal] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    const [formData, setFormData] = useState({
        nip: "",
        name: "",
        email: "",
        phone: "",
        password: "dosen123",
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        if (searchTerm === "") {
            dispatch(fetchLecturers({ page: 1, perPage, search: "" }));
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            dispatch(fetchLecturers({ page: 1, perPage, search: searchTerm }));
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, perPage, dispatch]);

    const handlePageChange = (page) => {
        dispatch(fetchLecturers({ page, perPage, search: searchTerm }));
    };

    const handlePerRowsChange = (newPerPage, page) => {
        setPerPage(newPerPage);
        dispatch(fetchLecturers({ page, perPage: newPerPage, search: searchTerm }));
    };

    const resetForm = () => {
        setFormData({ nip: '', name: '', email: '', phone: '', password: 'dosen123' });
        setIsEditing(false);
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            if (isEditing && editingId) {
                await dispatch(updateLecturer({ id: editingId, formData })).unwrap();
                toast.success('Dosen berhasil diperbarui');
            } else {
                await dispatch(createLecturer(formData)).unwrap();
                toast.success('Dosen berhasil ditambahkan');
            }

            setShowModal(false);
            resetForm();
            // Refresh data after mutation
            dispatch(fetchLecturers({ page: 1, perPage, search: searchTerm }));
        } catch (error) {
            console.error(error);
            toast.error(error || 'Gagal menyimpan data');
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
            password: ''
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
            await dispatch(deleteLecturer(deleteTarget.id)).unwrap();
            toast.success('Dosen berhasil dihapus');
            setShowDeleteConfirm(false);
            setDeleteTarget(null);
            // Refresh data after mutation
            dispatch(fetchLecturers({ page: 1, perPage, search: searchTerm }));
        } catch (error) {
            console.error(error);
            toast.error(error || 'Gagal menghapus data');
        } finally {
            setFormLoading(false);
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
                            progressPending={initialLoading}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Password {isEditing && <span className="text-xs text-gray-400 font-normal">(Kosongkan jika tidak ingin mengubah)</span>}</label>
                            <input
                                type="password"
                                required={!isEditing}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 bg-white/50 border"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder={isEditing ? "••••••••" : ""}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 mt-6">
                        <button
                            type="button"
                            onClick={() => { setShowModal(false); setIsEditing(false); setEditingId(null); }}
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
