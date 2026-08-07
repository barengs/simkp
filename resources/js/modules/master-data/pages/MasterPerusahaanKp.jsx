import React, {useState} from 'react';
import { useGetPerusahaanKpQuery, useCreatePerusahaanKpMutation, useUpdatePerusahaanKpMutation, useDeletePerusahaanKpMutation } from '../api/masterDataApi';
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
import { Building2, Plus, Search, Pencil, Trash2 } from 'lucide-react';

const MasterPerusahaanKp = () => {
    const { data: perusahaanList, isLoading } = useGetPerusahaanKpQuery();
    const [createPerusahaan] = useCreatePerusahaanKpMutation();
    const [updatePerusahaan] = useUpdatePerusahaanKpMutation();
    const [deletePerusahaan] = useDeletePerusahaanKpMutation();

    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [form, setForm] = useState({ nama_perusahaan: '', alamat: '', no_telp: '', email: '', nama_pic: '' });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        if (errors[name]) setErrors({ ...errors, [name]: '' });
    };

    const openCreate = () => {
        setEditing(null);
        setForm({ nama_perusahaan: '', alamat: '', no_telp: '', email: '', nama_pic: '' });
        setErrors({});
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditing(item);
        setForm({
            nama_perusahaan: item.nama_perusahaan || '',
            alamat: item.alamat || '',
            no_telp: item.no_telp || '',
            email: item.email || '',
            nama_pic: item.nama_pic || '',
        });
        setErrors({});
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (editing) {
                await updatePerusahaan({ id: editing.id, ...form }).unwrap();
                handleApiSuccess('Data perusahaan berhasil diperbarui');
            } else {
                await createPerusahaan(form).unwrap();
                handleApiSuccess('Data perusahaan berhasil ditambahkan');
            }
            setShowModal(false);
        } catch (err) {
            handleApiError(err, 'Gagal menyimpan data perusahaan');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        try {
            await deletePerusahaan(deleting.id).unwrap();
            handleApiSuccess('Data perusahaan berhasil dihapus');
            setDeleting(null);
        } catch (err) {
            handleApiError(err, 'Gagal menghapus data perusahaan');
        }
    };

    const filteredData = (perusahaanList || []).filter(
        (item) =>
            !searchTerm ||
            [item.nama_perusahaan, item.alamat, item.nama_pic].some((field) =>
                String(field || '').toLowerCase().includes(searchTerm.toLowerCase())
            )
    );

    const columns = [
        { name: 'Nama Perusahaan', selector: (row) => row.nama_perusahaan || '-', sortable: true, wrap: true },
        { name: 'Alamat', selector: (row) => row.alamat || '-', wrap: true },
        { name: 'Telepon', selector: (row) => row.no_telp || '-', wrap: true },
        { name: 'Email', selector: (row) => row.email || '-', wrap: true },
        { name: 'Contact Person', selector: (row) => row.nama_pic || '-', wrap: true },
        {
            name: 'Aksi',
            cell: (row) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => openEdit(row)}
                        className="p-1.5 rounded-md text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        title="Edit"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setDeleting(row)}
                        className="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Hapus"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
            ignoreRowClick: true,
        },
    ];

    return (
        <>
            <PageHeader
                title="Perusahaan KP"
                description="Kelola data perusahaan tempat kerja praktek"
                icon={Building2}
                actions={
                    <Button onClick={openCreate} icon={Plus}>
                        Tambah Perusahaan
                    </Button>
                }
            />

            <Card
                title="Daftar Perusahaan"
                subtitle={`${filteredData.length} data ditemukan`}
                actions={
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari perusahaan..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-3 py-2 w-64 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                }
            >
                {isLoading ? (
                    <Skeleton rows={5} />
                ) : (
                    <DataTableWrapper columns={columns} data={filteredData} pagination />
                )}
            </Card>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editing ? 'Edit Perusahaan' : 'Tambah Perusahaan Baru'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Nama Perusahaan"
                        required
                        name="nama_perusahaan"
                        value={form.nama_perusahaan}
                        onChange={handleInputChange}
                        placeholder="PT. Contoh Teknologi"
                        error={errors.nama_perusahaan}
                    />
                    <Input
                        label="Alamat"
                        name="alamat"
                        value={form.alamat}
                        onChange={handleInputChange}
                        placeholder="Jl. Contoh No. 1"
                        error={errors.alamat}
                    />
                    <Input
                        label="No. Telepon"
                        name="no_telp"
                        value={form.no_telp}
                        onChange={handleInputChange}
                        placeholder="021-1234567"
                        error={errors.no_telp}
                    />
                    <Input
                        label="Email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleInputChange}
                        placeholder="contact@perusahaan.com"
                        error={errors.email}
                    />
                    <Input
                        label="Contact Person"
                        name="nama_pic"
                        value={form.nama_pic}
                        onChange={handleInputChange}
                        placeholder="Nama PIC"
                        error={errors.nama_pic}
                    />
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                            Batal
                        </Button>
                        <Button type="submit" loading={submitting}>
                            {editing ? 'Perbarui' : 'Simpan'}
                        </Button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={!!deleting}
                onClose={() => setDeleting(null)}
                onConfirm={handleDelete}
                title="Hapus Perusahaan"
                message={`Yakin ingin menghapus data perusahaan "${deleting?.nama_perusahaan}"? Tindakan ini tidak dapat dibatalkan.`}
            />
        </>
    );
};

export default MasterPerusahaanKp;
