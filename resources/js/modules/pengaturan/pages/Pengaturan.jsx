import React, { useEffect, useMemo, useState } from 'react';
import {
    useGetDocumentTypesQuery,
    useCreateDocumentTypeMutation,
    useUpdateDocumentTypeMutation,
    useDeleteDocumentTypeMutation,
    useGetSettingsQuery,
    useUpdateSettingsMutation,
} from '../api/pengaturanApi';
import { handleApiError, handleApiSuccess } from '../../shared/api/errorHandler';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import DataTableWrapper from '../../../components/ui/DataTableWrapper';
import Skeleton from '../../../components/ui/Skeleton';
import Modal from '../../../components/ui/Modal';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import {
    FileText,
    Plus,
    Edit2,
    Trash2,
    Search,
    Settings,
    Upload,
    Image as ImageIcon,
    Globe,
    Monitor,
    Save,
    CheckCircle2,
} from 'lucide-react';

const Pengaturan = () => {
    const [activeTab, setActiveTab] = useState('umum');

    const { data: settings, isLoading: settingsLoading } = useGetSettingsQuery();
    const { data: documentTypesRaw, isLoading: docsLoading } = useGetDocumentTypesQuery();

    const [updateSettings, { isLoading: settingsSubmitting }] = useUpdateSettingsMutation();
    const [createDocumentType] = useCreateDocumentTypeMutation();
    const [updateDocumentType] = useUpdateDocumentTypeMutation();
    const [deleteDocumentType] = useDeleteDocumentTypeMutation();

    const [showDocForm, setShowDocForm] = useState(false);
    const [editingDoc, setEditingDoc] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [docSubmitting, setDocSubmitting] = useState(false);
    const [docSearch, setDocSearch] = useState('');
    const [docErrors, setDocErrors] = useState({});

    const [docFormData, setDocFormData] = useState({
        name: '',
        description: '',
        is_required: false,
    });

    const [formData, setFormData] = useState({
        app_name: 'SIM-KPTA',
        logo_path: null,
        favicon_path: null,
    });

    const [settingsErrors, setSettingsErrors] = useState({});

    const documentTypes = useMemo(() => {
        if (Array.isArray(documentTypesRaw)) return documentTypesRaw;
        return Array.isArray(documentTypesRaw?.data) ? documentTypesRaw.data : [];
    }, [documentTypesRaw]);

    const filteredDocs = useMemo(() => {
        const keyword = docSearch.trim().toLowerCase();

        if (!keyword) return documentTypes;

        return documentTypes.filter((item) =>
            item.name?.toLowerCase().includes(keyword)
        );
    }, [documentTypes, docSearch]);

    useEffect(() => {
        if (!settings) return;

        setFormData({
            app_name: settings.app_name || 'SIM-KPTA',
            logo_path: settings.logo_path || null,
            favicon_path: settings.favicon_path || null,
        });
    }, [settings]);

    const handleDocChange = (e) => {
        const { name, value, type, checked } = e.target;

        setDocFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        if (docErrors[name]) {
            setDocErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const resetDocForm = () => {
        setDocFormData({
            name: '',
            description: '',
            is_required: false,
        });
        setDocErrors({});
        setEditingDoc(null);
    };

    const openCreateDoc = () => {
        resetDocForm();
        setShowDocForm(true);
    };

    const openEditDoc = (item) => {
        setEditingDoc(item);
        setDocFormData({
            name: item.name || '',
            description: item.description || '',
            is_required: Boolean(item.is_required),
        });
        setDocErrors({});
        setShowDocForm(true);
    };

    const closeDocForm = () => {
        setShowDocForm(false);
        resetDocForm();
    };

    const validateDocForm = () => {
        const errors = {};

        if (!docFormData.name.trim()) {
            errors.name = 'Nama tipe dokumen wajib diisi';
        }

        if (docFormData.description.length > 500) {
            errors.description = 'Deskripsi maksimal 500 karakter';
        }

        return errors;
    };

    const handleDocSubmit = async () => {
        const errors = validateDocForm();

        if (Object.keys(errors).length) {
            setDocErrors(errors);
            return;
        }

        setDocSubmitting(true);

        try {
            if (editingDoc) {
                await updateDocumentType({
                    id: editingDoc.id,
                    ...docFormData,
                }).unwrap();

                handleApiSuccess('Tipe dokumen berhasil diperbarui');
            } else {
                await createDocumentType(docFormData).unwrap();

                handleApiSuccess('Tipe dokumen berhasil ditambahkan');
            }

            closeDocForm();
        } catch (error) {
            handleApiError(
                error,
                editingDoc
                    ? 'Gagal memperbarui tipe dokumen'
                    : 'Gagal menambahkan tipe dokumen'
            );
        } finally {
            setDocSubmitting(false);
        }
    };

    const handleDocDelete = async () => {
        if (!showDeleteConfirm) return;

        setDocSubmitting(true);

        try {
            await deleteDocumentType(showDeleteConfirm).unwrap();

            handleApiSuccess('Tipe dokumen berhasil dihapus');
            setShowDeleteConfirm(null);
        } catch (error) {
            handleApiError(error, 'Gagal menghapus tipe dokumen');
        } finally {
            setDocSubmitting(false);
        }
    };

    const handleDocToggleRequired = async (item) => {
        try {
            await updateDocumentType({
                id: item.id,
                name: item.name,
                description: item.description || '',
                is_required: !item.is_required,
            }).unwrap();

            handleApiSuccess(
                item.is_required
                    ? 'Dokumen ditandai sebagai opsional'
                    : 'Dokumen ditandai sebagai wajib'
            );
        } catch (error) {
            handleApiError(error, 'Gagal mengubah status dokumen');
        }
    };

    const handleSettingsChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (settingsErrors[name]) {
            setSettingsErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileChange = (e, field) => {
        const file = e.target.files?.[0];

        if (!file) return;

        setFormData((prev) => ({
            ...prev,
            [field]: file,
        }));

        if (settingsErrors[field]) {
            setSettingsErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const handleSettingsSubmit = async () => {
        setSettingsErrors({});

        const data = new FormData();
        data.append('app_name', formData.app_name);

        if (formData.logo_path instanceof File) {
            data.append('logo_path', formData.logo_path);
        }

        if (formData.favicon_path instanceof File) {
            data.append('favicon_path', formData.favicon_path);
        }

        try {
            await updateSettings(data).unwrap();
            handleApiSuccess('Pengaturan berhasil disimpan');
        } catch (error) {
            handleApiError(error, 'Gagal menyimpan pengaturan');
        }
    };

    const getImageUrl = (value) => {
        if (!value) return null;

        if (value instanceof File) {
            return URL.createObjectURL(value);
        }

        return value.startsWith('http')
            ? value
            : `${window.location.origin}${value}`;
    };

    const ImageUpload = ({ title, icon: Icon, field, accept }) => {
        const value = formData[field];
        const preview = getImageUrl(value);
        const isFile = value instanceof File;

        return (
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <Icon className="w-4 h-4 text-gray-500" />
                    <div>
                        <p className="text-sm font-medium text-gray-900">{title}</p>
                        <p className="text-xs text-gray-400">
                            {isFile ? value.name : 'Upload gambar baru'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {preview ? (
                            <img
                                src={preview}
                                alt={title}
                                className="max-w-full max-h-full object-contain p-2"
                            />
                        ) : (
                            <ImageIcon className="w-6 h-6 text-gray-300" />
                        )}
                    </div>

                    <label className="flex-1 h-20 border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-colors">
                        <Upload className="w-5 h-5 text-gray-400 mb-1" />
                        <span className="text-xs font-medium text-gray-600">
                            Pilih gambar
                        </span>
                        <span className="text-[11px] text-gray-400">
                            PNG, JPG, SVG
                        </span>

                        <input
                            type="file"
                            className="hidden"
                            accept={accept}
                            onChange={(e) => handleFileChange(e, field)}
                        />
                    </label>
                </div>

                {settingsErrors[field] && (
                    <p className="text-xs text-red-600 mt-2">
                        {settingsErrors[field]}
                    </p>
                )}
            </div>
        );
    };

    const docColumns = [
        {
            name: 'Dokumen',
            selector: (row) => row.name,
            sortable: true,
            minWidth: '220px',
            cell: (row) => (
                <div className="flex items-center gap-3 py-2">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                        {row.name}
                    </span>
                </div>
            ),
        },
        {
            name: 'Deskripsi',
            selector: (row) => row.description || '-',
            wrap: true,
            minWidth: '280px',
            cell: (row) => (
                <span className="text-sm text-gray-500">
                    {row.description || '-'}
                </span>
            ),
        },
        {
            name: 'Status',
            selector: (row) => row.is_required,
            width: '150px',
            center: true,
            cell: (row) => (
                <button
                    type="button"
                    onClick={() => handleDocToggleRequired(row)}
                    className="focus:outline-none"
                >
                    {row.is_required ? (
                        <Badge status="emerald">Wajib</Badge>
                    ) : (
                        <Badge status="gray">Opsional</Badge>
                    )}
                </button>
            ),
        },
        {
            name: 'Aksi',
            width: '130px',
            center: true,
            cell: (row) => (
                <div className="flex items-center justify-center gap-1">
                    <Button
                        size="sm"
                        variant="secondary"
                        icon={Edit2}
                        onClick={() => openEditDoc(row)}
                    />
                    <Button
                        size="sm"
                        variant="danger"
                        icon={Trash2}
                        onClick={() => setShowDeleteConfirm(row.id)}
                    />
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-5">
            <PageHeader
                title="Pengaturan"
                description="Kelola konfigurasi aplikasi dan dokumen Kerja Praktek."
                icon={Settings}
            />

            <div className="flex items-center gap-1 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('umum')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'umum'
                            ? 'border-emerald-600 text-emerald-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Settings className="w-4 h-4" />
                    Umum
                </button>

                <button
                    onClick={() => setActiveTab('dokumen')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'dokumen'
                            ? 'border-emerald-600 text-emerald-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <FileText className="w-4 h-4" />
                    Dokumen KP
                    <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                        {documentTypes.length}
                    </span>
                </button>
            </div>

            {activeTab === 'umum' && (
                <Card>
                    {settingsLoading ? (
                        <div className="p-6 space-y-5">
                            <Skeleton className="h-10 w-full max-w-xl" />
                            <Skeleton className="h-28 w-full" />
                            <Skeleton className="h-28 w-full" />
                        </div>
                    ) : (
                        <div className="p-6 space-y-7">
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                                        <Globe className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900">
                                            Identitas Aplikasi
                                        </h3>
                                        <p className="text-xs text-gray-400">
                                            Informasi dasar aplikasi.
                                        </p>
                                    </div>
                                </div>

                                <div className="max-w-xl">
                                    <Input
                                        label="Nama Aplikasi"
                                        name="app_name"
                                        value={formData.app_name}
                                        onChange={handleSettingsChange}
                                        placeholder="SIM-KPTA"
                                        error={settingsErrors.app_name}
                                    />
                                </div>
                            </section>

                            <div className="border-t border-gray-100" />

                            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <ImageUpload
                                    title="Logo Sidebar"
                                    icon={ImageIcon}
                                    field="logo_path"
                                    accept="image/png,image/jpeg,image/svg+xml"
                                />

                                <ImageUpload
                                    title="Favicon"
                                    icon={Monitor}
                                    field="favicon_path"
                                    accept="image/png,image/x-icon,image/svg+xml"
                                />
                            </section>

                            <div className="flex justify-end pt-2">
                                <Button
                                    icon={Save}
                                    loading={settingsSubmitting}
                                    onClick={handleSettingsSubmit}
                                >
                                    Simpan
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            )}

            {activeTab === 'dokumen' && (
                <div className="space-y-5">
                    <Card>
                        <div className="p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                            <div className="w-full sm:max-w-sm">
                                <Input
                                    placeholder="Cari tipe dokumen..."
                                    value={docSearch}
                                    onChange={(e) => setDocSearch(e.target.value)}
                                    icon={Search}
                                />
                            </div>

                            <Button icon={Plus} onClick={openCreateDoc}>
                                Tambah Dokumen
                            </Button>
                        </div>
                    </Card>

                    <Card
                        title="Tipe Dokumen"
                        subtitle={`${filteredDocs.length} dokumen`}
                    >
                        {docsLoading ? (
                            <Skeleton className="h-64" />
                        ) : filteredDocs.length === 0 ? (
                            <div className="py-14 text-center">
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                                    {docSearch ? (
                                        <Search className="w-5 h-5 text-gray-400" />
                                    ) : (
                                        <FileText className="w-5 h-5 text-gray-400" />
                                    )}
                                </div>

                                <p className="text-sm font-medium text-gray-700">
                                    {docSearch
                                        ? 'Dokumen tidak ditemukan'
                                        : 'Belum ada tipe dokumen'}
                                </p>

                                <p className="text-xs text-gray-400 mt-1">
                                    {docSearch
                                        ? 'Coba gunakan kata kunci lain.'
                                        : 'Tambahkan tipe dokumen untuk memulai.'}
                                </p>

                                {!docSearch && (
                                    <Button
                                        size="sm"
                                        icon={Plus}
                                        className="mt-4"
                                        onClick={openCreateDoc}
                                    >
                                        Tambah Dokumen
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <DataTableWrapper
                                columns={docColumns}
                                data={filteredDocs}
                                pagination
                                highlightOnHover
                            />
                        )}
                    </Card>
                </div>
            )}

            <Modal
                isOpen={showDocForm}
                onClose={closeDocForm}
                title={editingDoc ? 'Edit Tipe Dokumen' : 'Tambah Tipe Dokumen'}
                size="md"
            >
                <div className="space-y-4">
                    <Input
                        label="Nama Tipe Dokumen"
                        required
                        name="name"
                        value={docFormData.name}
                        onChange={handleDocChange}
                        placeholder="Contoh: Surat Proposal"
                        error={docErrors.name}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            Deskripsi
                        </label>

                        <textarea
                            name="description"
                            value={docFormData.description}
                            onChange={handleDocChange}
                            rows={3}
                            maxLength={500}
                            placeholder="Deskripsi singkat dokumen..."
                            className={`w-full px-3 py-2.5 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                                docErrors.description
                                    ? 'border-red-400'
                                    : 'border-gray-300'
                            }`}
                        />

                        <div className="flex justify-between mt-1">
                            <span className="text-xs text-red-500">
                                {docErrors.description}
                            </span>
                            <span className="text-[11px] text-gray-400">
                                {docFormData.description.length}/500
                            </span>
                        </div>
                    </div>

                    <label className="flex items-center justify-between p-3.5 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-800">
                                    Dokumen Wajib
                                </p>
                                <p className="text-xs text-gray-400">
                                    Mahasiswa wajib mengupload dokumen ini.
                                </p>
                            </div>
                        </div>

                        <input
                            type="checkbox"
                            name="is_required"
                            checked={docFormData.is_required}
                            onChange={handleDocChange}
                            className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                    </label>
                </div>

                <div className="flex justify-end gap-2 pt-4 mt-5 border-t border-gray-100">
                    <Button variant="secondary" onClick={closeDocForm}>
                        Batal
                    </Button>

                    <Button
                        icon={editingDoc ? CheckCircle2 : Plus}
                        loading={docSubmitting}
                        onClick={handleDocSubmit}
                    >
                        {editingDoc ? 'Simpan Perubahan' : 'Tambah Dokumen'}
                    </Button>
                </div>
            </Modal>

            <ConfirmDialog
                isOpen={!!showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(null)}
                onConfirm={handleDocDelete}
                title="Hapus Tipe Dokumen?"
                message="Data yang dihapus tidak dapat dikembalikan. Pastikan tipe dokumen ini tidak sedang digunakan."
                loading={docSubmitting}
            />
        </div>
    );
};

export default Pengaturan;