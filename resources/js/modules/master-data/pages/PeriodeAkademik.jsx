import React, { useMemo, useState, useEffect } from 'react';
import { useGetAcademicPeriodsQuery, useCreateAcademicPeriodMutation, useUpdateAcademicPeriodMutation, useDeleteAcademicPeriodMutation } from '../api/masterDataApi';
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
import { CalendarDays, Plus, Pencil, Trash2, X, Search } from 'lucide-react';

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
        code: '',
        start_date: '',
        end_date: '',
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
        setForm({ name: '', start_date: '', end_date: '', total_members: '', is_active: false });
        setErrors({});
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditing(item);
        setForm({
            name: item.name || '',
            start_date: item.start_date ? String(item.start_date).substring(0, 10) : '',
            end_date: item.end_date ? String(item.end_date).substring(0, 10) : '',
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
                start_date: form.start_date,
                end_date: form.end_date,
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
                selectedRows.map(row => deleteAcademicPeriod(row.id).unwrap())
            );
            handleApiSuccess(
                `${selectedRows.length} periode akademik berhasil dihapus`
            );
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
        { name: 'Nama Periode', selector: (row) => row.name || '-', sortable: true, sortField: 'name', width: '220px' },
        { name: 'Tanggal Mulai', selector: (row) => formatDate(row.start_date), sortable: true, sortField: 'start_date', width: '200px' },
        { name: 'Tanggal Selesai', selector: (row) => formatDate(row.end_date), sortable: true, sortField: 'end_date', width: '200px' },
        { name: 'Total Anggota', selector: (row) => row.total_members ?? '-', sortable: true, sortField: 'total_members', width: '190px' },
        {
            name: 'Status',
            width: '170px',
            cell: (row) => <Badge status={row.is_active ? 'aktif' : 'tidak_aktif'}>{row.is_active ? 'Aktif' : 'Nonaktif'}</Badge>,
            sortable: true,
            sortField: 'is_active',
            ignoreRowClick: true,
        },
        {
            name: 'Aksi',
            width: '200px',
            cell: (row) => (
                <div className="
                    flex items-center
                    justify-center gap-2
                ">
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

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Periode Akademik" description="Kelola periode akademik" icon={CalendarDays} />
                <Skeleton className="h-[500px]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Periode Akademik"
                description="Kelola periode akademik"
                icon={CalendarDays}
                actions={
                    <Button onClick={openCreate} icon={Plus}>
                        Tambah Periode
                    </Button>
                }
            />

            {selectedRows.length > 0 && (
                <div className="
                    flex flex-col
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                    gap-3
                    px-5
                    py-3
                    bg-emerald-50
                    border
                    border-emerald-200
                    rounded-xl
                ">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-emerald-900">
                            {selectedRows.length} periode dipilih
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            icon={X}
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
                <div className="
                    flex flex-col
                    gap-4
                    border-b border-gray-100
                    p-5
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                ">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">
                            Daftar Periode Akademik
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">
                            {searchTerm
                                ? `${academicPeriodList?.meta?.total || 0} hasil ditemukan`
                                : `${academicPeriodList?.meta?.total || 0} periode terdaftar`
                            }
                        </p>
                    </div>

                    <div className="w-full sm:w-80">
                        <Input
                            type="text"
                            placeholder="Cari periode..."
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

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Periode Akademik' : 'Tambah Periode Baru'} bigger>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Nama Periode" required name="name" value={form.name} onChange={handleInputChange} placeholder="Ganjil 2025/2026" error={errors.name} />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Tanggal Mulai" required type="date" name="start_date" value={form.start_date} onChange={handleInputChange} error={errors.start_date} />
                        <Input label="Tanggal Selesai" required type="date" name="end_date" value={form.end_date} onChange={handleInputChange} error={errors.end_date} />
                    </div>
                    <Input label="Total Anggota per Kelompok" type="number" min="1" name="total_members" value={form.total_members} onChange={handleInputChange} placeholder="Contoh: 4" error={errors.total_members} />
                    <div className="flex items-center gap-2">
                        <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleInputChange} className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                        <label className="text-sm text-gray-700">Set sebagai periode aktif</label>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Batal</Button>
                        <Button type="submit" loading={submitting} color="primary" icon={Plus}>{editing ? 'Perbarui' : 'Simpan'}</Button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog isOpen={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} title="Hapus Periode Akademik" message={`Yakin ingin menghapus periode "${deleting?.name}"?`} />

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
