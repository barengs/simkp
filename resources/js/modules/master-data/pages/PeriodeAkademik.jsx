import React, { useState } from 'react';
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
import { CalendarDays, Plus, Pencil, Trash2 } from 'lucide-react';

const PeriodeAkademik = () => {
    const { data: academicPeriodList, isLoading } = useGetAcademicPeriodsQuery();
    const [createAcademicPeriod] = useCreateAcademicPeriodMutation();
    const [updateAcademicPeriod] = useUpdateAcademicPeriodMutation();
    const [deleteAcademicPeriod] = useDeleteAcademicPeriodMutation();

    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
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
        setForm({ name: '', code: '', start_date: '', end_date: '', total_members: '', is_active: false });
        setErrors({});
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditing(item);
        setForm({
            name: item.name || '',
            code: item.code || '',
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
                code: form.code,
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

    const columns = [
        { name: 'Nama Periode', selector: (row) => row.name || '-', sortable: true, wrap: true },
        { name: 'Kode', selector: (row) => row.code || '-', sortable: true },
        { name: 'Tanggal Mulai', selector: (row) => row.start_date || '-', sortable: true },
        { name: 'Tanggal Selesai', selector: (row) => row.end_date || '-', sortable: true },
        { name: 'Total Anggota', selector: (row) => row.total_members ?? '-', sortable: true, width: '140px', center: true },
        {
            name: 'Status',
            cell: (row) => <Badge status={row.is_active ? 'aktif' : 'tidak_aktif'}>{row.is_active ? 'Aktif' : 'Nonaktif'}</Badge>,
            ignoreRowClick: true,
        },
        {
            name: 'Aksi',
            cell: (row) => (
                <div className="flex items-center gap-1">
                    <Button className='bg-yellow-500 hover:bg-yellow-600' size="sm" onClick={() => openEdit(row)} icon={Pencil}>Edit</Button>
                    <Button className='bg-red-500 hover:bg-red-600' size="sm" onClick={() => setDeleting(row)} icon={Trash2}>Hapus</Button>
                </div>
            ),
            ignoreRowClick: true,
        },
    ];

    if (isLoading) return <Skeleton className="h-96" />;

    const filteredData = (academicPeriodList || []).filter(
        (item) => !searchTerm || ['name', 'code'].some((field) => String(item[field] || '').toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <>
            <PageHeader title="Periode Akademik" description="Kelola periode akademik" icon={CalendarDays} actions={<Button onClick={openCreate} icon={Plus}>Tambah Periode</Button>} />
            <Card title="Daftar Periode Akademik" subtitle={`${filteredData.length} periode terdaftar`}>
                <div className="mb-4 max-w-sm">
                    <Input
                        type="text"
                        placeholder="Cari periode..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <DataTableWrapper columns={columns} data={filteredData} pagination />
            </Card>
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Periode Akademik' : 'Tambah Periode Baru'} bigger>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Nama Periode" required name="name" value={form.name} onChange={handleInputChange} placeholder="Ganjil 2025/2026" error={errors.name} />
                    <Input label="Kode" required name="code" value={form.code} onChange={handleInputChange} placeholder="G25" error={errors.code} />
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
        </>
    );
};

export default PeriodeAkademik;
