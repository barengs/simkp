import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Plus, Pencil, Trash2, Search, EyeOff, Eye } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { fetchStudents, createStudent, updateStudent, deleteStudent } from "../../store/slices/studentSlice";
import { toast } from "react-toastify";
import Modal from "../../ui/Modal";
import DeleteConfirm from "../../ui/DeleteConfirm";
import { Skeleton } from "../../ui/Skeleton";

const MasterMahasiswa = () => {
    const dispatch = useDispatch();
    const { students, pagination, loading, initialLoading, forceRefetch } = useSelector((state) => state.students);
    const { total, current_page } = pagination;

    const [showModal, setShowModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [perPage, setPerPage] = useState(10);
    const [formLoading, setFormLoading] = useState(false);

    const [formData, setFormData] = useState({
        nim: "",
        name: "",
        email: "",
        phone: "",
        major: "",
        batch_year: new Date().getFullYear(),
        password: "mahasiswa123",
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        if (searchTerm === "") {
            dispatch(fetchStudents({ page: 1, perPage, search: "" }));
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            dispatch(fetchStudents({ page: 1, perPage, search: searchTerm }));
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, perPage, dispatch]);

    const handlePageChange = (page) => {
        dispatch(fetchStudents({ page, perPage, search: searchTerm }));
    };

    const handlePerRowsChange = (newPerPage, page) => {
        setPerPage(newPerPage);
        dispatch(fetchStudents({ page, perPage: newPerPage, search: searchTerm }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            if (isEditing && editingId) {
                await dispatch(updateStudent({ id: editingId, formData })).unwrap();
                toast.success('Mahasiswa berhasil diperbarui');
            } else {
                await dispatch(createStudent(formData)).unwrap();
                toast.success('Mahasiswa berhasil ditambahkan ke periode ini');
            }
            setShowModal(false);
            resetForm();
            // Refresh data after mutation
            dispatch(fetchStudents({ page: 1, perPage, search: searchTerm }));
        } catch (error) {
            console.error(error);
            toast.error(error || 'Gagal menyimpan data');
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
            password: "mahasiswa123",
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
            password: '',
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
            await dispatch(deleteStudent(deleteTarget.id)).unwrap();
            toast.success('Mahasiswa berhasil dihapus dari periode ini');
            setShowDeleteConfirm(false);
            setDeleteTarget(null);
            // Refresh data after mutation
            dispatch(fetchStudents({ page: 1, perPage, search: searchTerm }));
        } catch (error) {
            console.error(error);
            toast.error(error || 'Gagal menghapus data');
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
        { name: "Phone", selector: (row) => row.phone || '-', sortable: true },
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
                            progressPending={initialLoading}
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password {isEditing && <span className="text-xs text-gray-400 font-normal">(Kosongkan jika tidak ingin mengubah)</span>}</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required={!isEditing}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 pr-10 border"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder={isEditing ? "••••••••" : ""}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? (
                                    <Eye className="h-5 w-5" />
                                ) : (
                                    <EyeOff className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100 mt-6">
                        <button
                            type="button"
                            onClick={() => { setShowModal(false); resetForm(); }}
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
