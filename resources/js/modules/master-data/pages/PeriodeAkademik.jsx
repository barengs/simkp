import React, {useState} from 'react';
import { useGetPeriodeAkademikQuery, useCreatePeriodeAkademikMutation, useUpdatePeriodeAkademikMutation, useDeletePeriodeAkademikMutation } from '../api/masterDataApi';
import { handleApiError, handleApiSuccess } from '../../shared/api/errorHandler';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import DataTableWrapper from '../../../components/ui/DataTableWrapper';
import Badge from '../../../components/ui/Badge';
import Skeleton from '../../../components/ui/Skeleton';
import { CalendarDays, Plus, Pencil, Trash2 } from 'lucide-react';

const PeriodeAkademik = () => {
    const { data: periodeList, isLoading } = useGetPeriodeAkademikQuery();
    const [createPeriode] = useCreatePeriodeAkademikMutation();
    const [updatePeriode] = useUpdatePeriodeAkademikMutation();
    const [deletePeriode] = useDeletePeriodeAkademikMutation();

    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [form, setForm] = useState({
        nama_periode: '', semester: '', tanggal_mulai: '', tanggal_selesai: '',
        jumlah_anggota_kp: '3', is_active: false,
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
        setForm({ nama_periode: '', semester: '', tanggal_mulai: '', tanggal_selesai: '', jumlah_anggota_kp: '3', is_active: false });
        setErrors({});
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditing(item);
        setForm({
            nama_periode: item.nama_periode || '', semester: item.semester || '',
            tanggal_mulai: item.tanggal_mulai?.substring(0, 10) || '',
            tanggal_selesai: item.tanggal_selesai?.substring(0, 10) || '',
            jumlah_anggota_kp: String(item.jumlah_anggota_kp || 3),
            is_active: !!item.is_active,
        });
        setErrors({});
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = { ...form, jumlah_anggota_kp: parseInt(form.jumlah_anggota_kp) || 3 };
            if (editing) {
                await updatePeriode({ id: editing.id, ...payload }).unwrap();
                handleApiSuccess('Periode akademik berhasil diperbarui');
            } else {
                await createPeriode(payload).unwrap();
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
            await deletePeriode(deleting.id).unwrap();
            handleApiSuccess('Periode akademik berhasil dihapus');
            setDeleting(null);
        } catch (err) {
            handleApiError(err, 'Gagal menghapus periode akademik');
        }
    };

    const columns = [
        { name: 'Nama Periode', selector: (row) => row.nama_periode || '-', sortable: true, wrap: true },
        { name: 'Semester', selector: (row) => row.semester || '-', sortable: true },
        { name: 'Tanggal Mulai', selector: (row) => row.tanggal_mulai || '-', sortable: true },
        { name: 'Tanggal Selesai', selector: (row) => row.tanggal_selesai || '-', sortable: true },
        { name: 'Anggota KP', selector: (row) => row.jumlah_anggota_kp || 3, center: true },
        {
            name: 'Status', center: true,
            cell: (row) => <Badge status={row.is_active ? 'aktif' : 'tidak_aktif'}>{row.is_active ? 'Aktif' : 'Nonaktif'}</Badge>,
            ignoreRowClick: true,
        },
        {
            name: 'Aksi', center: true,
            cell: (row) => (
                <div className="flex items-center gap-1 justify-center">
                    <button onClick={() => openEdit(row)} className="p-1.5 rounded-md text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => setDeleting(row)} className="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                </div>
            ),
            ignoreRowClick: true,
        },
    ];

    return (
        <>
            <PageHeader title="Periode Akademik" description="Kelola periode akademik & jumlah anggota KP" icon={CalendarDays} actions={<Button onClick={openCreate} icon={Plus}>Tambah Periode</Button>} />
            <Card title="Daftar Periode Akademik" subtitle={`${periodeList?.length || 0} periode terdaftar`}>
                {isLoading ? <Skeleton rows={4} /> : <DataTableWrapper columns={columns} data={periodeList || []} pagination />}
            </Card>
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Periode Akademik' : 'Tambah Periode Baru'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Nama Periode" required name="nama_periode" value={form.nama_periode} onChange={handleInputChange} placeholder="2025/2026" error={errors.nama_periode} />
                    <Select label="Semester" required name="semester" value={form.semester} onChange={handleInputChange} options={[{value:'Ganjil',label:'Ganjil'},{value:'Genap',label:'Genap'},{value:'Ganjil-Genap',label:'Ganjil-Genap'}]} placeholder="Pilih Semester" error={errors.semester} />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Tanggal Mulai" required type="date" name="tanggal_mulai" value={form.tanggal_mulai} onChange={handleInputChange} error={errors.tanggal_mulai} />
                        <Input label="Tanggal Selesai" required type="date" name="tanggal_selesai" value={form.tanggal_selesai} onChange={handleInputChange} error={errors.tanggal_selesai} />
                    </div>
                    <Input label="Jumlah Anggota KP Default" type="number" name="jumlah_anggota_kp" value={form.jumlah_anggota_kp} onChange={handleInputChange} error={errors.jumlah_anggota_kp} />
                    <div className="flex items-center gap-2">
                        <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleInputChange} className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                        <label className="text-sm text-gray-700">Set sebagai periode aktif</label>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Batal</Button>
                        <Button type="submit" loading={submitting}>{editing ? 'Perbarui' : 'Simpan'}</Button>
                    </div>
                </form>
            </Modal>
            <ConfirmDialog isOpen={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} title="Hapus Periode Akademik" message={`Yakin ingin menghapus periode "${deleting?.nama_periode}"?`} />
        </>
    );
};

export default PeriodeAkademik;
