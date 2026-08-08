import React, { useState } from 'react';
import { useGetKpThemesQuery, useCreateKpThemeMutation, useUpdateKpThemeMutation, useDeleteKpThemeMutation } from '../api/masterDataApi';
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
import { Lightbulb, Plus, Pencil, Trash2 } from 'lucide-react';

const TemaKp = () => {
    const { data: temaList, isLoading } = useGetKpThemesQuery();
    const [createTema] = useCreateKpThemeMutation();
    const [updateTema] = useUpdateKpThemeMutation();
    const [deleteTema] = useDeleteKpThemeMutation();

    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [form, setForm] = useState({ title: '', description: '', is_active: true });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
        if (errors[name]) setErrors({ ...errors, [name]: '' });
    };

    const openCreate = () => {
        setEditing(null);
        setForm({ title: '', description: '', is_active: true });
        setErrors({});
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditing(item);
        setForm({
            title: item.title || '',
            description: item.description || '',
            is_active: item.is_active !== undefined ? item.is_active : true,
        });
        setErrors({});
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                title: form.title,
                description: form.description,
                is_active: form.is_active,
            };
            if (editing) {
                await updateTema({ id: editing.id, ...payload }).unwrap();
                handleApiSuccess('Tema KP berhasil diperbarui');
            } else {
                await createTema(payload).unwrap();
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
        { name: 'Nama Tema', selector: (row) => row.title || '-', sortable: true, wrap: true },
        { name: 'Deskripsi', selector: (row) => row.description || '-', sortable: true, wrap: true },
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

    const filteredData = (temaList || []).filter(
        (item) => !searchTerm || ['title', 'description'].some((f) => String(item[f] || '').toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <PageHeader
                title="Tema Kerja Praktek"
                description="Kelola tema-tema yang tersedia untuk pendaftaran KP"
                icon={Lightbulb}
                actions={<Button onClick={openCreate} icon={Plus}>Tambah Tema</Button>}
            />
            <Card title="Daftar Tema KP" subtitle={`${filteredData.length} tema terdaftar`}>
                <div className="mb-4 max-w-sm">
                    <Input
                        type="text"
                        placeholder="Cari nama atau deskripsi tema..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <DataTableWrapper columns={columns} data={filteredData} pagination />
            </Card>
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Tema KP' : 'Tambah Tema Baru'} bigger>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Nama Tema"
                        required
                        name="title"
                        value={form.title}
                        onChange={handleInputChange}
                        placeholder="Tema KP 2025"
                        error={errors.title}
                    />
                    <Input
                        label="Deskripsi"
                        name="description"
                        value={form.description}
                        onChange={handleInputChange}
                        placeholder="Deskripsi tema"
                        error={errors.description}
                    />
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="is_active"
                            checked={form.is_active}
                            onChange={handleInputChange}
                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <label className="text-sm text-gray-700">Tema aktif</label>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Batal</Button>
                        <Button type="submit" loading={submitting} color="primary" icon={Plus}>{editing ? 'Perbarui' : 'Simpan'}</Button>
                    </div>
                </form>
            </Modal>
            <ConfirmDialog isOpen={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} title="Hapus Tema KP" message={`Yakin ingin menghapus tema "${deleting?.title}"?`} />
        </div>
    );
};

export default TemaKp;
