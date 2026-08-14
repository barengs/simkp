import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
    useGetDocumentTypesQuery,
    useCreateDocumentTypeMutation,
    useUpdateDocumentTypeMutation,
    useDeleteDocumentTypeMutation,
} from '../api/pengaturanApi';
import { handleApiError, handleApiSuccess } from '../../shared/api/errorHandler';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import DataTableWrapper from '../../../components/ui/DataTableWrapper';
import Skeleton from '../../../components/ui/Skeleton';
import {
    FileText, Plus, Edit2, Trash2, X, AlertCircle, CheckCircle2, Search,
} from 'lucide-react';

const ManajemenDokumenKP = () => {
    const authUser = useSelector(s => s.auth.user);
    const { data: documentTypesRaw, isLoading } = useGetDocumentTypesQuery();
    const [createDocumentType] = useCreateDocumentTypeMutation();
    const [updateDocumentType] = useUpdateDocumentTypeMutation();
    const [deleteDocumentType] = useDeleteDocumentTypeMutation();

    // State
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [formData, setFormData] = useState({ name: '', code: '', description: '', is_required: false });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    // Process data
    const documentTypes = useMemo(() =>
        Array.isArray(documentTypesRaw) ? documentTypesRaw
        : Array.isArray(documentTypesRaw?.data) ? documentTypesRaw.data : [],
    [documentTypesRaw]);

    const filtered = useMemo(() =>
        (documentTypes || []).filter(dt =>
            !search || dt.name?.toLowerCase().includes(search.toLowerCase()) ||
            dt.code?.toLowerCase().includes(search.toLowerCase())
        ),
    [documentTypes, search]);

    // Handlers
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const e = {};
        if (!formData.name.trim()) e.name = 'Nama tipe dokumen wajib diisi';
        if (!formData.code.trim()) e.code = 'Kode tipe dokumen wajib diisi';
        if (formData.code.includes(' ')) e.code = 'Kode tidak boleh mengandung spasi';
        if (formData.description.length > 500) e.description = 'Deskripsi maksimal 500 karakter';
        return e;
    };

    const openCreate = () => {
        setEditing(null);
        setFormData({ name: '', code: '', description: '', is_required: false });
        setErrors({});
        setShowForm(true);
    };

    const openEdit = (item) => {
        setEditing(item);
        setFormData({
            name: item.name,
            code: item.code,
            description: item.description || '',
            is_required: item.is_required || false,
        });
        setErrors({});
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditing(null);
        setFormData({ name: '', code: '', description: '', is_required: false });
        setErrors({});
    };

    const handleSubmit = async () => {
        const e = validateForm();
        if (Object.keys(e).length) { setErrors(e); return; }

        setSubmitting(true);
        try {
            if (editing) {
                await updateDocumentType({ id: editing.id, ...formData }).unwrap();
                handleApiSuccess('Tipe dokumen berhasil diperbarui');
            } else {
                await createDocumentType(formData).unwrap();
                handleApiSuccess('Tipe dokumen berhasil ditambahkan');
            }
            closeForm();
        } catch (err) {
            handleApiError(err, editing ? 'Gagal memperbarui tipe dokumen' : 'Gagal menambahkan tipe dokumen');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        setSubmitting(true);
        try {
            await deleteDocumentType(id).unwrap();
            handleApiSuccess('Tipe dokumen berhasil dihapus');
            setShowDeleteConfirm(null);
        } catch (err) {
            handleApiError(err, 'Gagal menghapus tipe dokumen');
        } finally {
            setSubmitting(false);
        }
    };

    // Table columns
    const columns = [
        {
            name: 'Nama',
            selector: r => r.name,
            sortable: true,
            wrap: true,
        },
        {
            name: 'Kode',
            selector: r => r.code,
            sortable: true,
            width: '120px',
            cell: r => <code className="text-xs bg-gray-100 px-2 py-1 rounded">{r.code}</code>,
        },
        {
            name: 'Deskripsi',
            selector: r => r.description || '-',
            wrap: true,
            cell: r => r.description ? <span className="text-sm text-gray-600">{r.description}</span> : '-',
        },
        {
            name: 'Wajib',
            selector: r => r.is_required,
            width: '290px',
            center: true,
            cell: r => (
                <Badge status={r.is_required ? 'approved' : 'draft'}>
                    {r.is_required ? 'Ya' : 'Tidak'}
                </Badge>
            ),
        },
        {
            name: 'Aksi',
            width: '240px',
            cell: r => (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="secondary"
                        icon={Edit2}
                        onClick={() => openEdit(r)}
                    >
                        Edit
                    </Button>
                    <Button
                        size="sm"
                        variant="danger"
                        icon={Trash2}
                        onClick={() => setShowDeleteConfirm(r.id)}
                    >
                        Hapus
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Manajemen Dokumen KP"
                description="Atur tipe dokumen yang diperlukan untuk pendaftaran KP"
                icon={FileText}
                actions={
                    <Button icon={Plus} onClick={openCreate}>
                        Tambah Tipe Dokumen
                    </Button>
                }
            />

            {/* Search */}
            <Card>
                <div className="p-4 border-b border-gray-200">
                    <Input
                        placeholder="Cari nama atau kode tipe dokumen..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        icon={Search}
                    />
                </div>
            </Card>

            {/* Table */}
            <Card
                title="Daftar Tipe Dokumen"
                subtitle={`${filtered.length} tipe dokumen`}
            >
                {isLoading
                    ? <Skeleton className="h-48" />
                    : filtered.length === 0
                        ? (
                            <div className="text-center py-8 text-sm text-gray-400">
                                <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                                {search ? 'Tidak ada hasil pencarian' : 'Belum ada tipe dokumen'}
                            </div>
                        )
                        : <DataTableWrapper columns={columns} data={filtered} pagination />
                }
            </Card>

            {/* Modal Form */}
            {showForm && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
                            onClick={closeForm} />
                        <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                                <h3 className="text-base font-semibold text-gray-900">
                                    {editing ? 'Edit Tipe Dokumen' : 'Tambah Tipe Dokumen'}
                                </h3>
                                <button onClick={closeForm}
                                    className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="px-6 py-4 space-y-4 max-h-[65vh] overflow-y-auto">
                                <Input
                                    label="Nama Tipe Dokumen"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    name="name"
                                    placeholder="Contoh: Surat Proposal"
                                    error={errors.name}
                                />
                                <Input
                                    label="Kode"
                                    required
                                    value={formData.code}
                                    onChange={handleChange}
                                    name="code"
                                    placeholder="Contoh: PROPOSAL"
                                    error={errors.code}
                                    helperText="Tanpa spasi, gunakan underscore jika perlu"
                                />
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Deskripsi
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={handleChange}
                                        name="description"
                                        placeholder="Penjelasan singkat tentang dokumen ini"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        rows={3}
                                    />
                                    {errors.description && (
                                        <p className="text-xs text-red-500 mt-1">{errors.description}</p>
                                    )}
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="is_required"
                                        checked={formData.is_required}
                                        onChange={handleChange}
                                        className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span className="text-sm font-medium text-gray-900">
                                        Dokumen Wajib
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        (Peserta didik harus mengupload dokumen ini)
                                    </span>
                                </label>
                            </div>
                            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
                                <Button variant="secondary" onClick={closeForm}>
                                    Batal
                                </Button>
                                <Button
                                    variant="primary"
                                    loading={submitting}
                                    icon={CheckCircle2}
                                    onClick={handleSubmit}
                                >
                                    {editing ? 'Perbarui' : 'Tambahkan'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Delete Confirm */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
                            onClick={() => setShowDeleteConfirm(null)} />
                        <div className="relative w-full max-w-sm bg-white rounded-xl shadow-xl">
                            <div className="px-6 py-4 space-y-3">
                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto">
                                    <AlertCircle className="w-6 h-6 text-red-600" />
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 text-center">
                                    Hapus Tipe Dokumen?
                                </h3>
                                <p className="text-sm text-gray-600 text-center">
                                    Tipe dokumen yang dihapus tidak dapat dikembalikan. Pastikan tidak ada dokumen yang menggunakan tipe ini.
                                </p>
                            </div>
                            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
                                <Button variant="secondary" onClick={() => setShowDeleteConfirm(null)}>
                                    Batal
                                </Button>
                                <Button
                                    variant="danger"
                                    loading={submitting}
                                    onClick={() => handleDelete(showDeleteConfirm)}
                                >
                                    Hapus
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManajemenDokumenKP;
