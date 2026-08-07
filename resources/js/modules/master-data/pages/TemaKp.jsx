import React, {useState} from 'react';
import { useGetTemaKpQuery, useCreateTemaKpMutation, useUpdateTemaKpMutation, useDeleteTemaKpMutation } from '../api/masterDataApi';
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
import { Lightbulb, Plus, Pencil, Trash2 } from 'lucide-react';

const TemaKp = () => {
    const { data: temaList, isLoading } = useGetTemaKpQuery();
    const [createTema] = useCreateTemaKpMutation();
    const [updateTema] = useUpdateTemaKpMutation();
    const [deleteTema] = useDeleteTemaKpMutation();

    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [form, setForm] = useState({ nama_tema: '', deskripsi: '', is_active: true });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
        if (errors[name]) setErrors({ ...errors, [name]: '' });
    };

    const openCreate = () => {
        setEditing(null);
        setForm({ nama_tema: '', deskripsi: '', is_active: true });
        setErrors({});
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditing(item);
        setForm({ nama_tema: item.nama_tema || '', deskripsi: item.deskripsi || '', is_active: !!item.is_active });
        setErrors({});
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editing) {
                await updateTema({ id: editing.id, ...form }).unwrap();
                handleApiSuccess('Tema KP berhasil diperbarui');
            } else {
                await createTema(form).unwrap();
                handleApiSuccess('Tema KP berhasil ditambahkan');
            }
            setShowModal(false);
        } catch (err) {
            handleApiError(err, 'Gagal menyimpan tema KP');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteTema(deleting.id).unwrap();
            handleApiSuccess('Tema KP berhasil dihapus');
            setDeleting(null);
        } catch (err) {
            handleApiError(err, 'Gagal menghapus tema KP');
        }
    };

    const columns = [
        { name: 'Nama Tema', selector: (row) => row.nama_tema || '-', sortable: true, wrap: true },
        { name: 'Deskripsi', selector: (row) => row.deskripsi || '-', sortable: true, wrap: true },
        {
            name: 'Status',
            cell: (row) => <Badge status={row.is_active ? 'aktif' : 'tidak_aktif'}>{row.is_active ? 'Aktif' : 'Nonaktif'}</Badge>,
            ignoreRowClick: true,
        },
        {
            name: 'Aksi',
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
            <PageHeader title="Tema Kerja Praktek" description="Kelola tema-tema yang tersedia untuk pendaftaran KP" icon={Lightbulb} actions={<Button onClick={openCreate} icon={Plus}>Tambah Tema</Button>} />
            <Card title="Daftar Tema KP" subtitle={`${temaList?.length || 0} tema terdaftar`}>
                {isLoading ? <Skeleton rows={4} /> : <DataTableWrapper columns={columns} data={temaList || []} pagination />}
            </Card>
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Tema KP' : 'Tambah Tema Baru'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Nama Tema" required name="nama_tema" value={form.nama_tema} onChange={handleInputChange} placeholder="Tema KP 2025" error={errors.nama_tema} />
                    <Input label="Deskripsi" name="deskripsi" value={form.deskripsi} onChange={handleInputChange} placeholder="Deskripsi tema" error={errors.deskripsi} />
                    <div className="flex items-center gap-2">
                        <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleInputChange} className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                        <label className="text-sm text-gray-700">Tema aktif</label>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Batal</Button>
                        <Button type="submit" loading={submitting}>{editing ? 'Perbarui' : 'Simpan'}</Button>
                    </div>
                </form>
            </Modal>
            <ConfirmDialog isOpen={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} title="Hapus Tema KP" message={`Yakin ingin menghapus tema "${deleting?.nama_tema}"?`} />
        </>
    );
};

export default TemaKp;
