import React, { useState, useEffect, useMemo } from 'react';
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
    AlertCircle,
    CheckCircle2,
    Search,
    Settings,
    Upload,
    Image as ImageIcon,
    Globe,
    Monitor,
    Save,
    FileCheck2,
    Info,
    Check,
} from 'lucide-react';

const Pengaturan = () => {
    const [activeTab, setActiveTab] = useState('umum');

    const { data: settings, isLoading: settingsLoading } = useGetSettingsQuery();
    const { data: documentTypesRaw, isLoading: docsLoading } = useGetDocumentTypesQuery();

    const [updateSettings, { isLoading: settingsSubmitting }] = useUpdateSettingsMutation();
    const [createDocumentType] = useCreateDocumentTypeMutation();
    const [updateDocumentType] = useUpdateDocumentTypeMutation();
    const [deleteDocumentType] = useDeleteDocumentTypeMutation();

    // -------------------------------------------------------------------------
    // Document Types State
    // -------------------------------------------------------------------------
    const [showDocForm, setShowDocForm] = useState(false);
    const [editingDoc, setEditingDoc] = useState(null);
    const [docFormData, setDocFormData] = useState({
        name: '',
        code: '',
        description: '',
        is_required: false,
    });
    const [docErrors, setDocErrors] = useState({});
    const [docSubmitting, setDocSubmitting] = useState(false);
    const [docSearch, setDocSearch] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    // -------------------------------------------------------------------------
    // Settings State
    // -------------------------------------------------------------------------
    const [formData, setFormData] = useState({
        app_name: 'SIM-KPTA',
        logo_path: null,
        favicon_path: null,
    });

    const [settingsErrors, setSettingsErrors] = useState({});

    // -------------------------------------------------------------------------
    // Data Processing
    // -------------------------------------------------------------------------
    const documentTypes = useMemo(
        () =>
            Array.isArray(documentTypesRaw)
                ? documentTypesRaw
                : Array.isArray(documentTypesRaw?.data)
                    ? documentTypesRaw.data
                    : [],
        [documentTypesRaw]
    );

    const filteredDocs = useMemo(
        () =>
            documentTypes.filter((dt) => {
                const keyword = docSearch.toLowerCase();

                return (
                    !keyword ||
                    dt.name?.toLowerCase().includes(keyword)
                );
            }),
        [documentTypes, docSearch]
    );

    // -------------------------------------------------------------------------
    // Load Settings
    // -------------------------------------------------------------------------
    useEffect(() => {
        if (settings) {
            setFormData({
                app_name: settings.app_name || 'SIM-KPTA',
                logo_path: settings.logo_path || null,
                favicon_path: settings.favicon_path || null,
            });
        }
    }, [settings]);

    // -------------------------------------------------------------------------
    // Document Type Handlers
    // -------------------------------------------------------------------------
    const handleDocChange = (e) => {
        const { name, value, type, checked } = e.target;

        setDocFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        if (docErrors[name]) {
            setDocErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
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

    const openCreateDoc = () => {
        setEditingDoc(null);
        setDocFormData({
            name: '',
            code: '',
            description: '',
            is_required: false,
        });
        setDocErrors({});
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
        setEditingDoc(null);
        setDocFormData({
            name: '',
            code: '',
            description: '',
            is_required: false,
        });
        setDocErrors({});
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
        } catch (err) {
            handleApiError(
                err,
                editingDoc
                    ? 'Gagal memperbarui tipe dokumen'
                    : 'Gagal menambahkan tipe dokumen'
            );
        } finally {
            setDocSubmitting(false);
        }
    };

    const handleDocDelete = async (id) => {
        setDocSubmitting(true);

        try {
            await deleteDocumentType(id).unwrap();

            handleApiSuccess('Tipe dokumen berhasil dihapus');
            setShowDeleteConfirm(null);
        } catch (err) {
            handleApiError(err, 'Gagal menghapus tipe dokumen');
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
                !item.is_required
                    ? 'Dokumen ditandai sebagai wajib'
                    : 'Dokumen ditandai sebagai opsional'
            );
        } catch (err) {
            handleApiError(err, 'Gagal mengubah status dokumen');
        }
    };

    // -------------------------------------------------------------------------
    // Settings Handlers
    // -------------------------------------------------------------------------
    const handleSettingsChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (settingsErrors[name]) {
            setSettingsErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
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
            setSettingsErrors((prev) => ({
                ...prev,
                [field]: '',
            }));
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
        } catch (err) {
            handleApiError(err, 'Gagal menyimpan pengaturan');
        }
    };

    // -------------------------------------------------------------------------
    // Image Preview
    // -------------------------------------------------------------------------
    const getImageUrl = (value) => {
        if (!value) return null;

        if (value instanceof File) {
            return URL.createObjectURL(value);
        }

        if (value.startsWith('http')) {
            return value;
        }

        return `${window.location.origin}${value}`;
    };

    const ImageUploadCard = ({
        title,
        description,
        icon: Icon,
        field,
        accept,
        currentValue,
        error,
    }) => {
        const previewUrl = getImageUrl(currentValue);
        const isFile = currentValue instanceof File;

        return (
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-emerald-600" />
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                            {title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {description}
                        </p>
                    </div>
                </div>

                <div className="p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-5 items-center">
                        <label className="relative flex flex-col items-center justify-center min-h-[150px] px-5 py-6 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer bg-gray-50/50 hover:bg-emerald-50/30 hover:border-emerald-300 transition-all">
                            <Upload className="w-7 h-7 text-gray-400 mb-3" />

                            <p className="text-sm font-medium text-gray-700">
                                Klik untuk memilih file
                            </p>

                            <p className="text-xs text-gray-400 mt-1">
                                PNG, JPG, SVG
                            </p>

                            <input
                                type="file"
                                className="hidden"
                                accept={accept}
                                onChange={(e) => handleFileChange(e, field)}
                            />
                        </label>

                        <div className="flex flex-col items-center justify-center min-w-[130px]">
                            {previewUrl ? (
                                <>
                                    <div className="w-24 h-24 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                                        <img
                                            src={previewUrl}
                                            alt={title}
                                            className="max-w-full max-h-full object-contain p-2"
                                        />
                                    </div>

                                    <p className="text-xs text-gray-400 mt-2">
                                        {isFile ? 'File baru' : 'File saat ini'}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="w-24 h-24 rounded-xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
                                        <ImageIcon className="w-7 h-7 text-gray-300" />
                                    </div>

                                    <p className="text-xs text-gray-400 mt-2">
                                        Belum ada gambar
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    {isFile && (
                        <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-100">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />

                            <div className="min-w-0">
                                <p className="text-xs font-medium text-emerald-800 truncate">
                                    {currentValue.name}
                                </p>
                                <p className="text-[11px] text-emerald-600">
                                    {(currentValue.size / 1024).toFixed(1)} KB
                                </p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <p className="text-xs text-red-600 mt-2">
                            {error}
                        </p>
                    )}
                </div>
            </div>
        );
    };

    // -------------------------------------------------------------------------
    // Document Table Columns
    // -------------------------------------------------------------------------
    const docColumns = [
        {
            name: 'Dokumen',
            selector: (r) => r.name,
            sortable: true,
            wrap: true,
            minWidth: '220px',
            cell: (r) => (
                <div className="flex items-center gap-3 py-2">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-emerald-600" />
                    </div>

                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                            {r.name}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            name: 'Deskripsi',
            selector: (r) => r.description || '-',
            sortable: false,
            wrap: true,
            minWidth: '240px',
            cell: (r) =>
                r.description ? (
                    <span className="text-sm text-gray-600">
                        {r.description}
                    </span>
                ) : (
                    <span className="text-sm text-gray-400 italic">
                        Tidak ada deskripsi
                    </span>
                ),
        },
        {
            name: 'Status',
            selector: (r) => r.is_required,
            width: '150px',
            center: true,
            cell: (r) =>
                r.is_required ? (
                    <Badge status="emerald">
                        Wajib
                    </Badge>
                ) : (
                    <Badge status="gray">
                        Opsional
                    </Badge>
                ),
        },
        {
            name: 'Aksi',
            width: '170px',
            center: true,
            cell: (r) => (
                <div className="flex items-center justify-center gap-1">
                    <Button
                        size="sm"
                        variant="secondary"
                        icon={Edit2}
                        onClick={() => openEditDoc(r)}
                    />

                    <Button
                        size="sm"
                        variant="danger"
                        icon={Trash2}
                        onClick={() => setShowDeleteConfirm(r.id)}
                    />
                </div>
            ),
        },
    ];

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------
    return (
        <div className="space-y-6">
            <PageHeader
                title="Pengaturan"
                description="Kelola konfigurasi aplikasi dan kebutuhan dokumen Kerja Praktek."
                icon={Settings}
                actions={
                    activeTab === 'dokumen' && (
                        <Button
                            icon={Plus}
                            onClick={openCreateDoc}
                        >
                            Tambah Tipe Dokumen
                        </Button>
                    )
                }
            />

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-1.5 inline-flex gap-1">
                <button
                    onClick={() => setActiveTab('umum')}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'umum'
                            ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    <Settings className="w-4 h-4" />
                    Pengaturan Umum
                </button>

                <button
                    onClick={() => setActiveTab('dokumen')}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'dokumen'
                            ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    <FileCheck2 className="w-4 h-4" />
                    Dokumen KP
                    <span className="px-1.5 py-0.5 rounded-full bg-gray-100 text-[10px] text-gray-500">
                        {documentTypes.length}
                    </span>
                </button>
            </div>

            {/* ================================================================= */}
            {/* TAB UMUM                                                         */}
            {/* ================================================================= */}
            {activeTab === 'umum' && (
                <div className="space-y-5">
                    {settingsLoading ? (
                        <div className="space-y-5">
                            <Skeleton className="h-32 rounded-xl" />
                            <Skeleton className="h-64 rounded-xl" />
                            <Skeleton className="h-64 rounded-xl" />
                        </div>
                    ) : (
                        <>
                            {/* Application Identity */}
                            <Card>
                                <div className="p-6">
                                    <div className="flex items-start gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                            <Globe className="w-5 h-5 text-blue-600" />
                                        </div>

                                        <div>
                                            <h2 className="text-base font-semibold text-gray-900">
                                                Identitas Aplikasi
                                            </h2>
                                            <p className="text-sm text-gray-500 mt-0.5">
                                                Tentukan informasi dasar yang digunakan oleh sistem.
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

                                        <div className="mt-2 flex items-start gap-2">
                                            <Info className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />

                                            <p className="text-xs text-gray-400">
                                                Nama aplikasi akan digunakan pada sidebar,
                                                halaman login, dan judul halaman.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Logo */}
                            <ImageUploadCard
                                title="Logo Sidebar"
                                description="Logo utama yang ditampilkan pada sidebar aplikasi."
                                icon={ImageIcon}
                                field="logo_path"
                                accept="image/png,image/jpeg,image/svg+xml"
                                currentValue={formData.logo_path}
                                error={settingsErrors.logo_path}
                            />

                            {/* Favicon */}
                            <ImageUploadCard
                                title="Favicon"
                                description="Icon kecil yang ditampilkan pada tab browser."
                                icon={Monitor}
                                field="favicon_path"
                                accept="image/png,image/x-icon,image/svg+xml"
                                currentValue={formData.favicon_path}
                                error={settingsErrors.favicon_path}
                            />

                            {/* Save */}
                            <div className="flex justify-end">
                                <Button
                                    onClick={handleSettingsSubmit}
                                    loading={settingsSubmitting}
                                    icon={Save}
                                >
                                    Simpan Pengaturan
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ================================================================= */}
            {/* TAB DOKUMEN                                                      */}
            {/* ================================================================= */}
            {activeTab === 'dokumen' && (
                <div className="space-y-5">
                    {/* Information */}
                    <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-blue-600" />
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-blue-900">
                                Tipe Dokumen Kerja Praktek
                            </h3>

                            <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                                Atur jenis dokumen yang harus atau dapat diupload
                                mahasiswa selama proses Kerja Praktek.
                            </p>
                        </div>
                    </div>

                    {/* Search */}
                    <Card>
                        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex-1 max-w-md">
                                <Input
                                    placeholder="Cari nama atau kode dokumen..."
                                    value={docSearch}
                                    onChange={(e) => setDocSearch(e.target.value)}
                                    icon={Search}
                                />
                            </div>

                            <Button
                                icon={Plus}
                                onClick={openCreateDoc}
                            >
                                Tambah Tipe Dokumen
                            </Button>
                        </div>
                    </Card>

                    {/* Table */}
                    <Card
                        title="Daftar Tipe Dokumen"
                        subtitle={`${filteredDocs.length} dari ${documentTypes.length} tipe dokumen`}
                    >
                        {docsLoading ? (
                            <Skeleton className="h-64" />
                        ) : filteredDocs.length === 0 ? (
                            <div className="py-14 flex flex-col items-center justify-center text-center">
                                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                    {docSearch ? (
                                        <Search className="w-6 h-6 text-gray-400" />
                                    ) : (
                                        <FileText className="w-6 h-6 text-gray-400" />
                                    )}
                                </div>

                                <h3 className="text-sm font-semibold text-gray-700">
                                    {docSearch
                                        ? 'Dokumen tidak ditemukan'
                                        : 'Belum ada tipe dokumen'}
                                </h3>

                                <p className="text-xs text-gray-400 mt-1">
                                    {docSearch
                                        ? 'Coba gunakan kata kunci pencarian yang berbeda.'
                                        : 'Tambahkan tipe dokumen pertama untuk memulai.'}
                                </p>

                                {!docSearch && (
                                    <Button
                                        size="sm"
                                        icon={Plus}
                                        className="mt-4"
                                        onClick={openCreateDoc}
                                    >
                                        Tambah Tipe Dokumen
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

            {/* ================================================================= */}
            {/* DOCUMENT FORM MODAL                                               */}
            {/* ================================================================= */}
            <Modal
                isOpen={showDocForm}
                onClose={closeDocForm}
                title={editingDoc ? 'Edit Tipe Dokumen' : 'Tambah Tipe Dokumen'}
                size="md"
            >
                <div className="space-y-5">
                    <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3 flex items-start gap-2">
                        <FileText className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />

                        <p className="text-xs text-emerald-800 leading-relaxed">
                            {editingDoc
                                ? 'Perbarui informasi tipe dokumen sesuai kebutuhan sistem.'
                                : 'Tambahkan tipe dokumen yang akan digunakan dalam proses Kerja Praktek.'}
                        </p>
                    </div>

                    <Input
                        label="Nama Tipe Dokumen"
                        required
                        value={docFormData.name}
                        onChange={handleDocChange}
                        name="name"
                        placeholder="Contoh: Surat Proposal"
                        error={docErrors.name}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            Deskripsi
                        </label>

                        <textarea
                            value={docFormData.description}
                            onChange={handleDocChange}
                            name="description"
                            placeholder="Penjelasan singkat mengenai dokumen..."
                            rows={4}
                            className={`w-full px-3 py-2.5 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                                docErrors.description
                                    ? 'border-red-400'
                                    : 'border-gray-300'
                            }`}
                        />

                        <div className="flex justify-between mt-1">
                            {docErrors.description ? (
                                <p className="text-xs text-red-500">
                                    {docErrors.description}
                                </p>
                            ) : (
                                <span />
                            )}

                            <span className="text-[11px] text-gray-400">
                                {docFormData.description.length}/500
                            </span>
                        </div>
                    </div>

                    <label className="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50/70 cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-gray-800">
                                    Dokumen Wajib
                                </p>

                                <p className="text-xs text-gray-500 mt-0.5">
                                    Mahasiswa wajib mengupload dokumen ini.
                                </p>
                            </div>
                        </div>

                        <input
                            type="checkbox"
                            name="is_required"
                            checked={docFormData.is_required}
                            onChange={handleDocChange}
                            className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                    </label>
                </div>

                <div className="flex justify-end gap-2 pt-5 mt-5 border-t border-gray-100">
                    <Button
                        variant="secondary"
                        onClick={closeDocForm}
                    >
                        Batal
                    </Button>

                    <Button
                        variant="primary"
                        loading={docSubmitting}
                        icon={editingDoc ? Check : Plus}
                        onClick={handleDocSubmit}
                    >
                        {editingDoc ? 'Perbarui Dokumen' : 'Tambah Dokumen'}
                    </Button>
                </div>
            </Modal>

            {/* ================================================================= */}
            {/* DELETE CONFIRMATION                                               */}
            {/* ================================================================= */}
            <ConfirmDialog
                isOpen={!!showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(null)}
                onConfirm={() => handleDocDelete(showDeleteConfirm)}
                title="Hapus Tipe Dokumen"
                message="Tipe dokumen yang dihapus tidak dapat dikembalikan. Pastikan dokumen ini tidak sedang digunakan oleh data lain."
            />
        </div>
    );
};

export default Pengaturan;