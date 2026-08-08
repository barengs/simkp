import React, { useState } from 'react';
import { useGetKpCompaniesQuery, useCreateKpCompanyMutation, useUpdateKpCompanyMutation, useDeleteKpCompanyMutation } from '../api/masterDataApi';
import { handleApiError, handleApiSuccess } from '../../shared/api/errorHandler';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Textarea from '../../../components/ui/Textarea';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import DataTableWrapper from '../../../components/ui/DataTableWrapper';
import Skeleton from '../../../components/ui/Skeleton';
import { Briefcase, Plus, Search, Pencil, Trash2 } from 'lucide-react';

const MasterMitra = () => {
    const { data: companyList, isLoading } = useGetKpCompaniesQuery();
    const [createCompany] = useCreateKpCompanyMutation();
    const [updateCompany] = useUpdateKpCompanyMutation();
    const [deleteCompany] = useDeleteKpCompanyMutation();

    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [form, setForm] = useState({
        name: '',
        address: '',
        contact_person: '',
        phone_number: '',
        email: '',
        website: '',
        description: '',
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
        setForm({ name: '', address: '', contact_person: '', phone_number: '', email: '', website: '', description: '' });
        setErrors({});
        setShowModal(true);
    };

    const openEdit = (company) => {
        setEditing(company);
        setForm({
            name: company.name || '',
            address: company.address || '',
            contact_person: company.contact_person || '',
            phone_number: company.phone_number || '',
            email: company.email || '',
            website: company.website || '',
            description: company.description || '',
        });
        setErrors({});
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editing) {
                await updateCompany({ id: editing.id, ...form }).unwrap();
                handleApiSuccess('Data mitra berhasil diperbarui');
            } else {
                await createCompany(form).unwrap();
                handleApiSuccess('Data mitra berhasil ditambahkan');
            }
            setShowModal(false);
        } catch (err) {
            handleApiError(err, 'Gagal menyimpan data mitra');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteCompany(deleting.id).unwrap();
            handleApiSuccess('Data mitra berhasil dihapus');
            setDeleting(null);
        } catch (err) {
            handleApiError(err, 'Gagal menghapus data mitra');
        }
    };

    const columns = [
        { name: 'Nama', selector: (row) => row.name || '-', sortable: true },
        { name: 'Contact Person', selector: (row) => row.contact_person || '-', sortable: true },
        { name: 'No. HP', selector: (row) => row.phone_number || '-', sortable: true },
        { name: 'Email', selector: (row) => row.email || '-', sortable: true },
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

    const filteredData = (companyList || []).filter(
        (item) => !searchTerm || ['name', 'email', 'phone_number'].some((field) => String(item[field] || '').toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <PageHeader
                title="Manajemen Mitra"
                description="Kelola perusahaan mitra untuk program kerja praktikum"
                icon={Briefcase}
                actions={<Button onClick={openCreate} icon={Plus}>Tambah Mitra</Button>}
            />

            <Card title="Daftar Mitra KP" subtitle={`${filteredData.length} mitra terdaftar`}>
                <div className="mb-4 max-w-sm">
                    <Input
                        type="text"
                        placeholder="Cari nama, email, atau telepon..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <DataTableWrapper columns={columns} data={filteredData} pagination />
            </Card>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Mitra' : 'Tambah Mitra Baru'} bigger>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Nama Perusahaan"
                            required
                            name="name"
                            value={form.name}
                            onChange={handleInputChange}
                            placeholder="PT Mitra KP..."
                            error={errors.name}
                        />
                        <Input
                            label="Contact Person"
                            name="contact_person"
                            value={form.contact_person}
                            onChange={handleInputChange}
                        />
                        <Input
                            label="No. HP"
                            name="phone_number"
                            value={form.phone_number}
                            onChange={handleInputChange}
                            placeholder="021-xxxxxxxx"
                        />
                        <Input
                            label="Email"
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleInputChange}
                            placeholder="contact@mitra.com"
                        />
                        <Input
                            label="Website"
                            name="website"
                            value={form.website}
                            onChange={handleInputChange}
                            placeholder="https://..."
                        />
                        <Textarea
                            label="Deskripsi"
                            name="description"
                            value={form.description}
                            onChange={handleInputChange}
                            placeholder="Deskripsi singkat perusahaan..."
                            rows={2}
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Batal</Button>
                        <Button type="submit" loading={submitting} color="primary" icon={Plus}>{editing ? 'Perbarui' : 'Simpan'}</Button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={!!deleting}
                onClose={() => setDeleting(null)}
                onConfirm={handleDelete}
                title="Hapus Mitra"
                message={`Yakin ingin menghapus mitra "${deleting?.name}"?`}
            />
        </div>
    );
};

export default MasterMitra;
