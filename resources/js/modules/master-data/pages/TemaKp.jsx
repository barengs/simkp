import React, { useMemo, useState } from 'react';
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
import { Lightbulb, Plus, Pencil, Trash2, X, Search } from 'lucide-react';

const TemaKp = () => {
    const { data: temaList, isLoading } = useGetKpThemesQuery();
    const [createTema] = useCreateKpThemeMutation();
    const [updateTema] = useUpdateKpThemeMutation();
    const [deleteTema] = useDeleteKpThemeMutation();

    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

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

    const handleBulkDelete = async () => {
        if (!selectedRows.length) return;
        try {
            await Promise.all(
                selectedRows.map(row => deleteTema(row.id).unwrap())
            );
            handleApiSuccess(
                `${selectedRows.length} tema KP berhasil dihapus`
            );
            setSelectedRows([]);
        } catch (err) {
            handleApiError(err, 'Gagal menghapus tema KP');
        }
    };

    const filteredData = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();
        if (!keyword) return temaList || [];

        return (temaList || []).filter(item => {
            const title = String(item.title || '').toLowerCase();
            const description = String(item.description || '').toLowerCase();
            return title.includes(keyword) || description.includes(keyword);
        });
    }, [temaList, searchTerm]);

    const columns = [
        {
            name: 'Nama Tema',
            selector: row => row.title || '-',
            sortable: true,
            width: '250px',
        },
        {
            name: 'Deskripsi',
            selector: row => row.description || '-',
            sortable: true,
            wrap: true,
        },
        {
            name: 'Status',
            width: '120px',
            cell: (row) => <Badge status={row.is_active ? 'aktif' : 'tidak_aktif'}>{row.is_active ? 'Aktif' : 'Nonaktif'}</Badge>,
            ignoreRowClick: true,
        },
        {
            name: 'Aksi',
            width: '190px',
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
                <PageHeader title="Tema Kerja Praktek" description="Kelola tema-tema yang tersedia untuk pendaftaran KP" icon={Lightbulb} />
                <Skeleton className="h-[500px]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Tema Kerja Praktek"
                description="Kelola tema-tema yang tersedia untuk pendaftaran KP"
                icon={Lightbulb}
                actions={
                    <Button onClick={openCreate} icon={Plus}>
                        Tambah Tema
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
                            {selectedRows.length} tema dipilih
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
                            Hapus {selectedRows.length} Tema
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
                            Daftar Tema KP
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">
                            {searchTerm
                                ? `${filteredData.length} hasil ditemukan`
                                : `${filteredData.length} tema terdaftar`
                            }
                        </p>
                    </div>

                    <div className="w-full sm:w-80">
                        <Input
                            type="text"
                            placeholder="Cari nama atau deskripsi tema..."
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
                        highlightOnHover
                        selectableRows
                        onSelectedRowsChange={({ selectedRows }) => setSelectedRows(selectedRows)}
                    />
                </div>
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

            <ConfirmDialog
                isOpen={showBulkDeleteConfirm}
                onClose={() => setShowBulkDeleteConfirm(false)}
                onConfirm={handleBulkDelete}
                title="Hapus Tema KP"
                message={`Yakin ingin menghapus ${selectedRows.length} tema KP yang dipilih?`}
            />
        </div>
    );
};

export default TemaKp;
