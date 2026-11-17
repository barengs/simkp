import React, { useMemo, useState, useEffect } from 'react';
import {
    useGetAcademicPeriodsQuery,
    useCreateAcademicPeriodMutation,
    useUpdateAcademicPeriodMutation,
    useDeleteAcademicPeriodMutation,
} from '../api/masterDataApi';
import { handleApiError, handleApiSuccess } from '../../shared/api/errorHandler';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import DataTableWrapper from '../../../components/ui/DataTableWrapper';
import Badge from '../../../components/ui/Badge';
import Skeleton from '../../../components/ui/Skeleton';
import { CalendarDays, Plus, Pencil, Trash2, Search, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const PeriodeAkademik = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [sortBy, setSortBy] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');

    const { data: academicPeriodList, isLoading } = useGetAcademicPeriodsQuery({
        page,
        per_page: perPage,
        sort_by: sortBy,
        sort_direction: sortDirection,
        search: debouncedSearch,
    });

    const [createAcademicPeriod] = useCreateAcademicPeriodMutation();
    const [updateAcademicPeriod] = useUpdateAcademicPeriodMutation();
    const [deleteAcademicPeriod] = useDeleteAcademicPeriodMutation();

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

    const [form, setForm] = useState({
        name: '',
        start_date: '',
        end_date: '',
        registration_start_date: '',
        registration_end_date: '',
        grading_start_date: '',
        grading_end_date: '',
        total_members: '',
        is_active: false,
    });

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
        if (errors[name]) setErrors({ ...errors, [name]: '' });
    };

    const openCreate = () => {
        setEditing(null);
        setForm({
            name: '',
            start_date: '',
            end_date: '',
            registration_start_date: '',
            registration_end_date: '',
            grading_start_date: '',
            grading_end_date: '',
            total_members: '',
            is_active: false,
        });
        setErrors({});
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditing(item);
        setForm({
            name: item.name || '',
            start_date: item.start_date ? String(item.start_date).substring(0, 10) : '',
            end_date: item.end_date ? String(item.end_date).substring(0, 10) : '',
            registration_start_date: item.registration_start_date ? String(item.registration_start_date).substring(0, 10) : '',
            registration_end_date: item.registration_end_date ? String(item.registration_end_date).substring(0, 10) : '',
            grading_start_date: item.grading_start_date ? String(item.grading_start_date).substring(0, 10) : '',
            grading_end_date: item.grading_end_date ? String(item.grading_end_date).substring(0, 10) : '',
            total_members: item.total_members ?? '',
            is_active: !!item.is_active,
        });
        setErrors({});
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                name: form.name,
                start_date: form.start_date || null,
                end_date: form.end_date || null,
                registration_start_date: form.registration_start_date || null,
                registration_end_date: form.registration_end_date || null,
                grading_start_date: form.grading_start_date || null,
                grading_end_date: form.grading_end_date || null,
                total_members: form.total_members ? Number(form.total_members) : null,
                is_active: form.is_active,
            };

            if (editing) {
                await updateAcademicPeriod({ id: editing.id, ...payload }).unwrap();
                handleApiSuccess('Periode akademik berhasil diperbarui');
            } else {
                await createAcademicPeriod(payload).unwrap();
                handleApiSuccess('Periode akademik berhasil ditambahkan');
            }
            setShowModal(false);
        } catch (err) {
            handleApiError(err, 'Gagal menyimpan periode akademik');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteAcademicPeriod(deleting.id).unwrap();
            handleApiSuccess('Periode akademik berhasil dihapus');
            setDeleting(null);
        } catch (err) {
            handleApiError(err, 'Gagal menghapus periode akademik');
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedRows.length) return;
        try {
            await Promise.all(
                selectedRows.map((row) => deleteAcademicPeriod(row.id).unwrap())
            );
            handleApiSuccess(`${selectedRows.length} periode akademik berhasil dihapus`);
            setSelectedRows([]);
        } catch (err) {
            handleApiError(err, 'Gagal menghapus periode akademik');
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '-';
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const filteredData = useMemo(() => {
        return academicPeriodList?.data || [];
    }, [academicPeriodList]);

    const columns = [
        {
            name: 'Nama Periode',
            selector: (row) => row.name || '-',
            sortable: true,
            sortField: 'name',
            minWidth: '180px',
            cell: (row) => (
                <div>
                    <p className="font-semibold text-sm text-gray-900">{row.name}</p>
                    <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                        {formatDate(row.start_date)} – {formatDate(row.end_date)}
                    </p>
                </div>
            ),
        },
        {
            name: 'Jadwal Pendaftaran',
            sortable: true,
            sortField: 'registration_start_date',
            minWidth: '220px',
            cell: (row) => {
                if (!row.registration_start_date || !row.registration_end_date) {
                    return <span className="text-xs text-gray-400 italic">Belum diatur</span>;
                }

                const today = new Date().toISOString().slice(0, 10);
                const start = String(row.registration_start_date).slice(0, 10);
                const end = String(row.registration_end_date).slice(0, 10);
                const isOpen = row.is_active && today >= start && today <= end;
                const isUpcoming = today < start;

                return (
                    <div>
                        <p className="text-xs font-medium text-gray-800">
                            {formatDate(row.registration_start_date)} – {formatDate(row.registration_end_date)}
                        </p>
                        <div className="mt-1">
                            {isOpen ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>Pendaftaran Dibuka</span>
                                </span>
                            ) : isUpcoming ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded bg-amber-50 text-amber-700 border border-amber-200">
                                    <Clock className="w-3 h-3 text-amber-600" />
                                    <span>Akan Datang</span>
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded bg-gray-100 text-gray-500 border border-gray-200">
                                    <span>Ditutup</span>
                                </span>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            name: 'Jadwal Penilaian',
            sortable: true,
            sortField: 'grading_start_date',
            minWidth: '220px',
            cell: (row) => {
                if (!row.grading_start_date || !row.grading_end_date) {
                    return <span className="text-xs text-gray-400 italic">Belum diatur</span>;
                }

                const today = new Date().toISOString().slice(0, 10);
                const start = String(row.grading_start_date).slice(0, 10);
                const end = String(row.grading_end_date).slice(0, 10);
                const isOpen = row.is_active && today >= start && today <= end;
                const isUpcoming = today < start;

                return (
                    <div>
                        <p className="text-xs font-medium text-gray-800">
                            {formatDate(row.grading_start_date)} – {formatDate(row.grading_end_date)}
                        </p>
                        <div className="mt-1">
                            {isOpen ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                                    <span>Masa Penilaian</span>
                                </span>
                            ) : isUpcoming ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded bg-amber-50 text-amber-700 border border-amber-200">
                                    <Clock className="w-3 h-3 text-amber-600" />
                                    <span>Belum Mulai</span>
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded bg-gray-100 text-gray-500 border border-gray-200">
                                    <span>Selesai</span>
                                </span>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            name: 'Kuota Tim',
            selector: (row) => row.total_members ?? '-',
            sortable: true,
            sortField: 'total_members',
            width: '120px',
            cell: (row) => (
                <span className="text-xs font-medium text-gray-700">
                    {row.total_members ? `${row.total_members} Orang` : '-'}
                </span>
            ),
        },
        {
            name: 'Status',
            width: '130px',
            cell: (row) => (
                <Badge status={row.is_active ? 'aktif' : 'tidak_aktif'}>
                    {row.is_active ? 'Aktif' : 'Nonaktif'}
                </Badge>
            ),
            sortable: true,
            sortField: 'is_active',
        },
        {
            name: 'Aksi',
            width: '160px',
            cell: (row) => (
                <div className="flex items-center justify-center gap-1.5">
                    <Button
                        size="sm"
                        variant="warning"
                        icon={Pencil}
                        onClick={() => openEdit(row)}
                    >
                        Edit
                    </Button>
                    <Button
                        size="sm"
                        variant="danger"
                        icon={Trash2}
                        onClick={() => setDeleting(row)}
                    >
                        Hapus
                    </Button>
                </div>
            ),
            ignoreRowClick: true,
        },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Periode Akademik"
                description="Kelola periode kalender akademik, batas waktu jadwal pendaftaran, dan jadwal penilaian KP/TA"
                icon={CalendarDays}
                actions={
                    <Button onClick={openCreate} icon={Plus}>
                        Tambah Periode
                    </Button>
                }
            />

            {/* Bulk Action Bar */}
            {selectedRows.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <span className="text-sm font-medium text-emerald-900">
                        {selectedRows.length} periode akademik dipilih
                    </span>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setSelectedRows([])}
                        >
                            Batal Pilih
                        </Button>
                        <Button
                            variant="danger"
                            icon={Trash2}
                            size="sm"
                            onClick={() => setShowBulkDeleteConfirm(true)}
                        >
                            Hapus {selectedRows.length} Periode
                        </Button>
                    </div>
                </div>
            )}

            <Card>
                <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">
                            Daftar Periode Akademik
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">
                            {searchTerm
                                ? `${academicPeriodList?.meta?.total || 0} hasil ditemukan`
                                : `${academicPeriodList?.meta?.total || 0} periode terdaftar`}
                        </p>
                    </div>

                    <div className="w-full sm:w-80">
                        <Input
                            type="text"
                            placeholder="Cari nama periode..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            icon={Search}
                        />
                    </div>
                </div>

                <div className="overflow-hidden">
                    <DataTableWrapper
                        columns={columns}
                        data={filteredData}
                        pagination
                        paginationServer
                        paginationTotalRows={academicPeriodList?.meta?.total || 0}
                        paginationDefaultPage={page}
                        onChangeRowsPerPage={(currentRowsPerPage) => {
                            setPerPage(currentRowsPerPage);
                            setPage(1);
                        }}
                        onChangePage={(page) => setPage(page)}
                        sortServer
                        onSort={(column, sortDirection) => {
                            if (column.sortField) {
                                setSortBy(column.sortField);
                                setSortDirection(sortDirection);
                            }
                        }}
                        highlightOnHover
                        selectableRows
                        onSelectedRowsChange={({ selectedRows }) => setSelectedRows(selectedRows)}
                    />
                </div>
            </Card>

            {/* Modal Tambah / Edit */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editing ? 'Edit Periode Akademik' : 'Tambah Periode Baru'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Nama Periode Akademik"
                        required
                        name="name"
                        value={form.name}
                        onChange={handleInputChange}
                        placeholder="Contoh: Ganjil 2026/2027"
                        error={errors.name}
                    />

                    {/* Rentang Kalender Perkuliahan */}
                    <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-lg space-y-2.5">
                        <span className="text-xs font-bold text-gray-700 block">
                            Rentang Kalender Perkuliahan Semester
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Input
                                label="Tanggal Mulai Semester"
                                required
                                type="date"
                                name="start_date"
                                value={form.start_date}
                                onChange={handleInputChange}
                                error={errors.start_date}
                            />
                            <Input
                                label="Tanggal Selesai Semester"
                                required
                                type="date"
                                name="end_date"
                                value={form.end_date}
                                onChange={handleInputChange}
                                error={errors.end_date}
                            />
                        </div>
                    </div>

                    {/* Jadwal Pendaftaran */}
                    <div className="p-3.5 bg-emerald-50/40 border border-emerald-200 rounded-lg space-y-2.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                            <CalendarDays className="w-4 h-4 text-emerald-600" />
                            <span>Jadwal Pendaftaran Kerja Praktik & TA (Opsional)</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Input
                                label="Pendaftaran Dibuka"
                                type="date"
                                name="registration_start_date"
                                value={form.registration_start_date}
                                onChange={handleInputChange}
                                error={errors.registration_start_date}
                            />
                            <Input
                                label="Batas Akhir Pendaftaran"
                                type="date"
                                name="registration_end_date"
                                value={form.registration_end_date}
                                onChange={handleInputChange}
                                error={errors.registration_end_date}
                            />
                        </div>
                    </div>

                    {/* Jadwal Penilaian */}
                    <div className="p-3.5 bg-indigo-50/40 border border-indigo-200 rounded-lg space-y-2.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                            <CalendarDays className="w-4 h-4 text-indigo-600" />
                            <span>Jadwal Input Nilai & Sidang (Opsional)</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Input
                                label="Penilaian Dibuka"
                                type="date"
                                name="grading_start_date"
                                value={form.grading_start_date}
                                onChange={handleInputChange}
                                error={errors.grading_start_date}
                            />
                            <Input
                                label="Batas Akhir Penilaian"
                                type="date"
                                name="grading_end_date"
                                value={form.grading_end_date}
                                onChange={handleInputChange}
                                error={errors.grading_end_date}
                            />
                        </div>
                    </div>

                    <Input
                        label="Total Anggota per Kelompok KP"
                        type="number"
                        min="1"
                        name="total_members"
                        value={form.total_members}
                        onChange={handleInputChange}
                        placeholder="Contoh: 3"
                        error={errors.total_members}
                    />

                    <div className="flex items-center gap-2 pt-1">
                        <input
                            type="checkbox"
                            id="is_active"
                            name="is_active"
                            checked={form.is_active}
                            onChange={handleInputChange}
                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <label htmlFor="is_active" className="text-sm text-gray-700 cursor-pointer">
                            Set sebagai periode aktif saat ini
                        </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                        <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                            Batal
                        </Button>
                        <Button type="submit" loading={submitting} icon={editing ? CheckCircle2 : Plus}>
                            {editing ? 'Perbarui Periode' : 'Simpan Periode'}
                        </Button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={!!deleting}
                onClose={() => setDeleting(null)}
                onConfirm={handleDelete}
                title="Hapus Periode Akademik"
                message={`Apakah Anda yakin ingin menghapus periode "${deleting?.name}"?`}
            />

            <ConfirmDialog
                isOpen={showBulkDeleteConfirm}
                onClose={() => setShowBulkDeleteConfirm(false)}
                onConfirm={handleBulkDelete}
                title="Hapus Periode Akademik"
                message={`Yakin ingin menghapus ${selectedRows.length} periode akademik yang dipilih?`}
            />
        </div>
    );
};

export default PeriodeAkademik;
