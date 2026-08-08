import React, { useState } from 'react';
import { useGetLecturersQuery, useCreateLecturerMutation, useUpdateLecturerMutation, useDeleteLecturerMutation } from '../api/masterDataApi';
import { handleApiError, handleApiSuccess } from '../../shared/api/errorHandler';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import DataTableWrapper from '../../../components/ui/DataTableWrapper';
import Skeleton from '../../../components/ui/Skeleton';
import { Users, Plus, Search, Pencil, Trash2 } from 'lucide-react';

const MasterDosen = () => {
    const { data: lecturerList, isLoading } = useGetLecturersQuery();
    const [createLecturer] = useCreateLecturerMutation();
    const [updateLecturer] = useUpdateLecturerMutation();
    const [deleteLecturer] = useDeleteLecturerMutation();

    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [form, setForm] = useState({
        nip: '',
        nidn: '',
        name: '',
        email: '',
        phone_number: '',
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        if (errors[name]) setErrors({ ...errors, [name]: '' });
    };

    const openCreate = () => {
        setEditing(null);
        setForm({
            nip: '',
            nidn: '',
            name: '',
            email: '',
            phone_number: '',
        });
        setErrors({});
        setShowModal(true);
    };

    const openEdit = (lecturer) => {
        setEditing(lecturer);
        setForm({
            nip: lecturer.nip || '',
            nidn: lecturer.nidn || '',
            name: lecturer.user?.name || '',
            email: lecturer.user?.email || '',
            phone_number: lecturer.user?.phone_number || '',
        });
        setErrors({});
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editing) {
                await updateLecturer({
                    id: editing.id,
                    nip: form.nip,
                    nidn: form.nidn || null,
                    name: form.name,
                    email: form.email,
                    phone_number: form.phone_number,
                }).unwrap();
                handleApiSuccess('Data dosen berhasil diperbarui');
            } else {
                await createLecturer({
                    nip: form.nip,
                    nidn: form.nidn || null,
                    name: form.name,
                    email: form.email,
                    phone_number: form.phone_number,
                    // password will use default 'dosen123' on backend
                }).unwrap();
                handleApiSuccess('Data dosen berhasil ditambahkan');
            }
            setShowModal(false);
        } catch (err) {
            handleApiError(err, 'Gagal menyimpan data dosen');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteLecturer(deleting.id).unwrap();
            handleApiSuccess('Data dosen berhasil dihapus');
            setDeleting(null);
        } catch (err) {
            handleApiError(err, 'Gagal menghapus data dosen');
        }
    };

    const columns = [
        { name: 'NIP', selector: (row) => row.nip || '-', sortable: true, wrap: true },
        { name: 'Nama', selector: (row) => row.user?.name || '-', sortable: true, wrap: true },
        { name: 'Email', selector: (row) => row.user?.email || '-', sortable: true, wrap: true },
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

    const filteredData = (lecturerList || []).filter(
        (item) => !searchTerm || [
            'nip', 'user.name', 'user.email'
        ].some(field => String(item[field] || '').toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <PageHeader
                title="Manajemen Dosen"
                description="Kelola data dosen pembimbing & penguji"
                icon={Users}
                actions={<Button onClick={openCreate} icon={Plus}>Tambah Dosen</Button>}
            />

            <Card title="Daftar Dosen" subtitle={`${filteredData.length} data ditemukan`}>
                <div className="mb-4 max-w-sm">
                    <Input
                        type="text"
                        placeholder="Cari NIP, nama, atau email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <DataTableWrapper columns={columns} data={filteredData} pagination />
            </Card>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Dosen' : 'Tambah Dosen Baru'} bigger>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="NIP"
                            required
                            name="nip"
                            value={form.nip}
                            onChange={handleInputChange}
                            placeholder="NIP Dosen"
                            error={errors.nip}
                        />
                        <Input
                            label="Nama Lengkap"
                            required
                            name="name"
                            value={form.name}
                            onChange={handleInputChange}
                            placeholder="Nama Lengkap Dosen"
                            error={errors.name}
                        />
                        <Input
                            label="Email"
                            type="email"
                            required
                            name="email"
                            value={form.email}
                            onChange={handleInputChange}
                            placeholder="dosen@univ.ac.id"
                            error={errors.email}
                        />
                        <Input
                            label="NIDN"
                            name="nidn"
                            value={form.nidn}
                            onChange={handleInputChange}
                            placeholder="Nomor INDNIK (opsional)"
                            error={errors.nidn}
                        />
                        <Input
                            label="No. HP"
                            name="phone_number"
                            value={form.phone_number}
                            onChange={handleInputChange}
                            placeholder="081234567890 (opsional)"
                            error={errors.phone_number}
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Batal</Button>
                        <Button type="submit" loading={submitting} color="primary">{editing ? 'Perbarui' : 'Simpan'}</Button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={!!deleting}
                onClose={() => setDeleting(null)}
                onConfirm={handleDelete}
                title="Hapus Dosen"
                message={`Yakin ingin menghapus data dosen "${deleting?.user?.name}"?`}
            />
        </div>
    );
};

export default MasterDosen;
