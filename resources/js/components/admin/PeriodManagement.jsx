import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { usePeriods } from "../context/PeriodContext";
import { useToast } from "../ui/Toast";
import Modal from "../ui/Modal";
import DeleteConfirm from "../ui/DeleteConfirm";
import { Skeleton } from "../ui/Skeleton";
import { Plus, Pencil, Trash2, Search, Eye } from "lucide-react";
import api from "../../src/api";

const PeriodManagement = () => {
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const { periods, pagination, loading, getPeriods, refreshPeriods } = usePeriods();
    const { total, per_page, current_page } = pagination;

    const [formLoading, setFormLoading] = useState(false);
    const { addToast } = useToast();
    const [perPage, setPerPage] = useState(10);

    const [formData, setFormData] = useState({
        academic_year: '',
        semester: 'ganjil',
        theme_name: '',
        start_date: '',
        end_date: '',
        is_active: false
    });

    // Edit/Delete/View states
    const [isEditing, setIsEditing] = useState(false);
    const [isViewing, setIsViewing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            getPeriods(1, perPage, searchTerm);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, getPeriods, perPage]);

    const handlePageChange = (page) => {
        getPeriods(page, perPage, searchTerm);
    };

    const handlePerRowsChange = (newPerPage, page) => {
        setPerPage(newPerPage);
        getPeriods(page, newPerPage, searchTerm);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            if (isEditing && editingId) {
                await api.put(`/periods/${editingId}`, formData);
                addToast('Data periode berhasil diperbarui', 'success');
            } else {
                await api.post('/periods', formData);
                addToast('Data periode berhasil ditambahkan', 'success');
            }

            setShowModal(false);
            resetForm();
            refreshPeriods();
        } catch (error) {
            console.error(error);
            addToast(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data', 'error');
        } finally {
            setFormLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            academic_year: '',
            semester: 'ganjil',
            theme_name: '',
            start_date: '',
            end_date: '',
            is_active: false
        });
        setIsEditing(false);
        setIsViewing(false);
        setEditingId(null);
    };

    const openCreate = () => {
        resetForm();
        setShowModal(true);
    };

    const openEdit = (row) => {
        setIsEditing(true);
        setIsViewing(false);
        setEditingId(row.id);
        setFormData({
            academic_year: row.academic_year || '',
            semester: row.semester || 'ganjil',
            theme_name: row.theme_name || '',
            start_date: row.start_date || '',
            end_date: row.end_date || '',
            is_active: !!row.is_active
        });
        setShowModal(true);
    };

    const openView = (row) => {
        setIsViewing(true);
        setIsEditing(false);
        setFormData({
            academic_year: row.academic_year || '',
            semester: row.semester || 'ganjil',
            theme_name: row.theme_name || '',
            start_date: row.start_date || '',
            end_date: row.end_date || '',
            is_active: !!row.is_active
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
            await api.delete(`/periods/${deleteTarget.id}`);
            addToast('Data periode berhasil dihapus', 'success');
            setShowDeleteConfirm(false);
            setDeleteTarget(null);
            refreshPeriods();
        } catch (error) {
            console.error(error);
            addToast(error.response?.data?.message || 'Gagal menghapus data', 'error');
        } finally {
            setFormLoading(false);
        }
    };

    const handleActivate = async (row) => {
        if (row.is_active) {
            addToast('Periode sudah aktif', 'info');
            return;
        }

        setFormLoading(true);
        try {
            await api.post(`/periods/${row.id}/activate`);
            addToast('Periode berhasil diaktifkan', 'success');
            refreshPeriods();
        } catch (error) {
            console.error(error);
            addToast(error.response?.data?.message || 'Gagal mengaktifkan periode', 'error');
        } finally {
            setFormLoading(false);
        }
    };

    const columns = [
        {
            name: "Tahun Akademik",
            selector: (row) => row.academic_year,
            sortable: true
        },
        {
            name: "Semester",
            selector: (row) => row.semester,
            sortable: true,
            cell: (row) => (
                <span className="capitalize">{row.semester}</span>
            )
        },
        {
            name: "Tanggal Mulai",
            selector: (row) => row.start_date,
            sortable: true
        },
        {
            name: "Tanggal Selesai",
            selector: (row) => row.end_date,
            sortable: true
        },
        {
            name: "Status",
            selector: (row) => row.is_active,
            sortable: true,
            cell: (row) => (
                <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${row.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                        }`}
                >
                    {row.is_active ? "Aktif" : "Non-Aktif"}
                </span>
            ),
        },
        {
            name: "Aksi",
            $minWidth: "150px",
            cell: (row) => (
                <div className="flex space-x-2">
                    {!row.is_active && (
                        <button
                            onClick={() => handleActivate(row)}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Aktifkan"
                            disabled={formLoading}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </button>
                    )}
                    <button onClick={() => openView(row)} className="text-blue-600 hover:text-blue-900 p-1" title="Lihat">
                        <Eye className="w-4 h-4" />
                    </button>
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
                        Manajemen Periode KP
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
                                placeholder="Cari periode..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>
                    <button
                        onClick={openCreate}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200 flex items-center"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Periode
                    </button>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <DataTable
                            columns={columns}
                            data={periods}
                            progressPending={loading}
                            progressComponent={<Skeleton />}
                            pagination
                            paginationServer
                            paginationTotalRows={total}
                            onChangeRowsPerPage={handlePerRowsChange}
                            onChangePage={handlePageChange}
                            paginationPerPage={perPage}
                            paginationDefaultPage={current_page}
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
                itemName={deleteTarget ? `${deleteTarget.academic_year} (${deleteTarget.semester})` : ""}
                onClose={() => { setShowDeleteConfirm(false); setDeleteTarget(null); }}
                onConfirm={confirmDelete}
                loading={formLoading}
            />

            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); resetForm(); }}
                title={isViewing ? 'Lihat Periode' : (isEditing ? 'Edit Periode' : 'Tambah Periode')}
                showFooter={false}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Tahun Akademik</label>
                            <input
                                type="text"
                                required
                                disabled={isViewing}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border disabled:bg-gray-100"
                                value={formData.academic_year}
                                placeholder="Contoh: 2024/2025"
                                onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Semester</label>
                            <select
                                required
                                disabled={isViewing}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border disabled:bg-gray-100 appearance-none bg-white"
                                value={formData.semester}
                                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                            >
                                <option value="ganjil">Ganjil</option>
                                <option value="genap">Genap</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select
                                required
                                disabled={isViewing}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border disabled:bg-gray-100 appearance-none bg-white"
                                value={formData.is_active ? "1" : "0"}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === "1" })}
                            >
                                <option value="1">Aktif</option>
                                <option value="0">Non-Aktif</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tanggal Mulai</label>
                            <input
                                type="date"
                                required
                                disabled={isViewing}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border disabled:bg-gray-100"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tanggal Selesai</label>
                            <input
                                type="date"
                                required
                                disabled={isViewing}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border disabled:bg-gray-100"
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Nama Tema (Opsional)</label>
                            <input
                                type="text"
                                disabled={isViewing}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border disabled:bg-gray-100"
                                value={formData.theme_name}
                                placeholder="Contoh: Digital Transformation"
                                onChange={(e) => setFormData({ ...formData, theme_name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 space-x-2">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border rounded-lg"
                        >
                            {isViewing ? 'Tutup' : 'Batal'}
                        </button>
                        {!isViewing && (
                            <button
                                type="submit"
                                disabled={formLoading}
                                className={`bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:bg-indigo-700 transition-all ${formLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {formLoading ? 'Menyimpan...' : (isEditing ? 'Perbarui Periode' : 'Simpan Periode')}
                            </button>
                        )}
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default PeriodManagement;

