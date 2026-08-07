import React, { useState } from 'react';
import { useGetMahasiswaQuery, useCreateMahasiswaMutation, useUpdateMahasiswaMutation, useDeleteMahasiswaMutation, useGetProgramStudiQuery } from '../api/masterDataApi';
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
import { GraduationCap, Plus, Search, Pencil, Trash2 } from 'lucide-react';

const MasterMahasiswa = () => {
    const { data: mahasiswaList, isLoading } = useGetMahasiswaQuery();
    const { data: prodiList } = useGetProgramStudiQuery();
    const [createMahasiswa] = useCreateMahasiswaMutation();
    const [updateMahasiswa] = useUpdateMahasiswaMutation();
    const [deleteMahasiswa] = useDeleteMahasiswaMutation();

    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [form, setForm] = useState({ nim: '', nama: '', email: '', no_hp: '', program_studi_id: '' });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        if (errors[name]) setErrors({ ...errors, [name]: '' });
    };

    const openCreate = () => {
        setEditing(null);
        setForm({ nim: '', nama: '', email: '', no_hp: '', program_studi_id: '' });
        setErrors({});
        setShowModal(true);
    };

    const openEdit = (mhs) => {
        setEditing(mhs);
        setForm({
            nim: mhs.nim || '',
            nama: mhs.nama || mhs.name || '',
            email: mhs.email || '',
            no_hp: mhs.no_hp || '',
            program_studi_id: mhs.program_studi_id || mhs.prodi_id || '',
        });
        setErrors({});
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (editing) {
                await updateMahasiswa({ id: editing.id, ...form }).unwrap();
                handleApiSuccess('Data mahasiswa berhasil diperbarui');
            } else {
                await createMahasiswa({ ...form, name: form.nama }).unwrap();
                handleApiSuccess('Data mahasiswa berhasil ditambahkan');
            }
            setShowModal(false);
        } catch (err) {
            handleApiError(err, 'Gagal menyimpan data mahasiswa');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteMahasiswa(deleting.id).unwrap();
            handleApiSuccess('Data mahasiswa berhasil dihapus');
            setDeleting(null);
        } catch (err) {
            handleApiError(err, 'Gagal menghapus data mahasiswa');
        }
    };

    const filteredData = (mahasiswaList || []).filter(
        (item) =>
            !searchTerm ||
            ['nim', 'nama', 'email', 'no_hp'].some((field) =>
                String(item[field] || '').toLowerCase().includes(searchTerm.toLowerCase())
            )
    );

    const columns = [
        { name: 'NIM', selector: (row) => row.nim || '-', sortable: true, wrap: true },
        { name: 'Nama', selector: (row) => row.nama || '-', sortable: true, wrap: true },
        { name: 'Email', selector: (row) => row.email || '-', sortable: true, wrap: true },
        { name: 'Telepon', selector: (row) => row.no_hp || '-', wrap: true },
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
                title="Data Mahasiswa"
                description="Kelola data mahasiswa peserta KP & TA"
                icon={GraduationCap}
                actions={
                    <Button onClick={openCreate} icon={Plus}>
                        Tambah Mahasiswa
                    </Button>
                }
            />

            <Card
                title="Daftar Mahasiswa"
                subtitle={`${filteredData.length} data ditemukan`}
                actions={
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari mahasiswa..."
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
                title={editing ? 'Edit Mahasiswa' : 'Tambah Mahasiswa Baru'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="NIM"
                        required
                        name="nim"
                        value={form.nim}
                        onChange={handleInputChange}
                        placeholder="e.g. 20230801001"
                        error={errors.nim}
                    />
                    <Input
                        label="Nama Lengkap"
                        required
                        name="nama"
                        value={form.nama}
                        onChange={handleInputChange}
                        placeholder="Nama Lengkap Mahasiswa"
                        error={errors.nama}
                    />
                    <Input
                        label="Email"
                        required
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleInputChange}
                        placeholder="email@university.ac.id"
                        error={errors.email}
                    />
                    <Select
                        label="Program Studi"
                        required
                        name="program_studi_id"
                        value={form.program_studi_id}
                        onChange={handleInputChange}
                        options={(prodiList || []).map((p) => ({ value: p.id, label: p.nama_prodi || p.nama }))}
                        placeholder="Pilih Program Studi"
                        error={errors.program_studi_id}
                    />
                    <Input
                        label="No. HP"
                        name="no_hp"
                        value={form.no_hp}
                        onChange={handleInputChange}
                        placeholder="081234567890"
                        error={errors.no_hp}
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
                title="Hapus Mahasiswa"
                message={`Yakin ingin menghapus data mahasiswa "${deleting?.nama}"?`}
            />
        </>
    );
};

export default MasterMahasiswa;
