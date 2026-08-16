import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
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
import {
    FileText, Plus, Edit2, Trash2, X, AlertCircle, CheckCircle2, Search,
    Settings, Upload, Image as ImageIcon, Globe, Monitor
} from 'lucide-react';

const Pengaturan = () => {
    const [activeTab, setActiveTab] = useState('umum');
    const { data: settings, isLoading: settingsLoading } = useGetSettingsQuery();
    const { data: documentTypesRaw, isLoading: docsLoading } = useGetDocumentTypesQuery();

    const [updateSettings, { isLoading: settingsSubmitting }] = useUpdateSettingsMutation();
    const [createDocumentType] = useCreateDocumentTypeMutation();
    const [updateDocumentType] = useUpdateDocumentTypeMutation();
    const [deleteDocumentType] = useDeleteDocumentTypeMutation();

    // Document Types State
    const [showDocForm, setShowDocForm] = useState(false);
    const [editingDoc, setEditingDoc] = useState(null);
    const [docFormData, setDocFormData] = useState({ name: '', code: '', description: '', is_required: false });
    const [docErrors, setDocErrors] = useState({});
    const [docSubmitting, setDocSubmitting] = useState(false);
    const [docSearch, setDocSearch] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    // Settings State
    const [formData, setFormData] = useState({
        app_name: 'SIM-KPTA',
        logo_path: null,
        favicon_path: null,
    });
    const [settingsErrors, setSettingsErrors] = useState({});

    const documentTypes = useMemo(() =>
        Array.isArray(documentTypesRaw) ? documentTypesRaw
        : Array.isArray(documentTypesRaw?.data) ? documentTypesRaw.data : [],
    [documentTypesRaw]);

    const filteredDocs = useMemo(() =>
        (documentTypes || []).filter(dt =>
            !docSearch || dt.name?.toLowerCase().includes(docSearch.toLowerCase()) ||
            dt.code?.toLowerCase().includes(docSearch.toLowerCase())
        ),
        [documentTypes, docSearch]);

    useEffect(() => {
        if (settings) {
            setFormData({
                app_name: settings.app_name || 'SIM-KPTA',
                logo_path: settings.logo_path || null,
                favicon_path: settings.favicon_path || null,
            });
        }
    }, [settings]);

    // Document Types Handlers
    const handleDocChange = (e) => {
        const { name, value, type, checked } = e.target;
        setDocFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        if (docErrors[name]) setDocErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateDocForm = () => {
        const e = {};
        if (!docFormData.name.trim()) e.name = 'Nama tipe dokumen wajib diisi';
        if (!docFormData.code.trim()) e.code = 'Kode tipe dokumen wajib diisi';
        if (docFormData.code.includes(' ')) e.code = 'Kode tidak boleh mengandung spasi';
        if (docFormData.description.length > 500) e.description = 'Deskripsi maksimal 500 karakter';
        return e;
    };

    const openCreateDoc = () => {
        setEditingDoc(null);
        setDocFormData({ name: '', code: '', description: '', is_required: false });
        setDocErrors({});
        setShowDocForm(true);
    };

    const openEditDoc = (item) => {
        setEditingDoc(item);
        setDocFormData({
            name: item.name,
            code: item.code,
            description: item.description || '',
            is_required: item.is_required || false,
        });
        setDocErrors({});
        setShowDocForm(true);
    };

    const closeDocForm = () => {
        setShowDocForm(false);
        setEditingDoc(null);
        setDocFormData({ name: '', code: '', description: '', is_required: false });
        setDocErrors({});
    };

    const handleDocSubmit = async () => {
        const e = validateDocForm();
        if (Object.keys(e).length) { setDocErrors(e); return; }

        setDocSubmitting(true);
        try {
            if (editingDoc) {
                await updateDocumentType({ id: editingDoc.id, ...docFormData }).unwrap();
                handleApiSuccess('Tipe dokumen berhasil diperbarui');
            } else {
                await createDocumentType(docFormData).unwrap();
                handleApiSuccess('Tipe dokumen berhasil ditambahkan');
            }
            closeDocForm();
        } catch (err) {
            handleApiError(err, editingDoc ? 'Gagal memperbarui tipe dokumen' : 'Gagal menambahkan tipe dokumen');
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

    const handleDocToggleRequired = (item) => {
        openEditDoc({ ...item, is_required: !item.is_required });
    };

    // Settings Handlers
    const handleSettingsChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (settingsErrors[name]) setSettingsErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleFileChange = (e, field) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, [field]: file }));
            if (settingsErrors[field]) setSettingsErrors(prev => ({ ...prev, [field]: '' }));
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

    const renderImagePreview = (url, name) => {
        if (!url) return null;
        const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
        return (
            <div className="mt-3 flex items-center gap-3">
                <img src={fullUrl} alt={name} className="w-16 h-16 object-contain border border-gray-200 rounded-lg p-1 bg-gray-50" />
                <span className="text-xs text-gray-500">Gambar saat ini</span>
            </div>
        );
    };

    const docColumns = [
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
                <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                    <input
                        type="checkbox"
                        checked={r.is_required}
                        onChange={() => handleDocToggleRequired(r)}
                        className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
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
                        onClick={() => openEditDoc(r)}
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
                title="Pengaturan"
                description="Atur tampilan aplikasi dan tipe dokumen KP"
                icon={Settings}
            />

            <div className="flex gap-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('umum')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === 'umum'
                            ? 'border-b-2 border-emerald-600 text-emerald-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Umum
                </button>
                <button
                    onClick={() => setActiveTab('dokumen')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === 'dokumen'
                            ? 'border-b-2 border-emerald-600 text-emerald-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Dokumen KP
                </button>
            </div>

            {activeTab === 'umum' && (
                <Card>
                    <div className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                <Globe className="w-4 h-4 inline mr-2" />
                                Nama Aplikasi
                            </label>
                            <Input
                                name="app_name"
                                value={formData.app_name}
                                onChange={handleSettingsChange}
                                placeholder="SIM-KPTA"
                                error={settingsErrors.app_name}
                            />
                            <p className="text-xs text-gray-500 mt-1">Nama ini akan ditampilkan di sidebar dan judul halaman.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                <ImageIcon className="w-4 h-4 inline mr-2" />
                                Logo Sidebar
                            </label>
                            <label className="flex flex-col items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                                <div className="text-center">
                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">Klik untuk upload logo</p>
                                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, SVG (Max 2 MB)</p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'logo_path')}
                                />
                            </label>
                            {renderImagePreview(formData.logo_path instanceof File ? URL.createObjectURL(formData.logo_path) : formData.logo_path, 'Logo')}
                            {settingsErrors.logo_path && <p className="text-xs text-red-600 mt-1">{settingsErrors.logo_path}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                <Monitor className="w-4 h-4 inline mr-2" />
                                Favicon
                            </label>
                            <label className="flex flex-col items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                                <div className="text-center">
                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">Klik untuk upload favicon</p>
                                    <p className="text-xs text-gray-500 mt-1">ICO, PNG (Max 1 MB)</p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'favicon_path')}
                                />
                            </label>
                            {renderImagePreview(formData.favicon_path instanceof File ? URL.createObjectURL(formData.favicon_path) : formData.favicon_path, 'Favicon')}
                            {settingsErrors.favicon_path && <p className="text-xs text-red-600 mt-1">{settingsErrors.favicon_path}</p>}
                        </div>

                        <div className="flex justify-end">
                            <Button
                                onClick={handleSettingsSubmit}
                                loading={settingsSubmitting}
                                icon={Settings}
                            >
                                Simpan Pengaturan
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {activeTab === 'dokumen' && (
                <>
                    <Card>
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                            <Input
                                placeholder="Cari nama atau kode tipe dokumen..."
                                value={docSearch}
                                onChange={e => setDocSearch(e.target.value)}
                                icon={Search}
                                className="max-w-md"
                            />
                            <Button icon={Plus} onClick={openCreateDoc}>
                                Tambah Tipe Dokumen
                            </Button>
                        </div>
                    </Card>

                    <Card
                        title="Daftar Tipe Dokumen"
                        subtitle={`${filteredDocs.length} tipe dokumen`}
                    >
                        {docsLoading
                            ? <Skeleton className="h-48" />
                            : filteredDocs.length === 0
                                ? (
                                    <div className="text-center py-8 text-sm text-gray-400">
                                        <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                                        {docSearch ? 'Tidak ada hasil pencarian' : 'Belum ada tipe dokumen'}
                                    </div>
                                )
                                : <DataTableWrapper columns={docColumns} data={filteredDocs} pagination />
                        }
                    </Card>

                    {showDocForm && (
                        <div className="fixed inset-0 z-50 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4">
                                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
                                    onClick={closeDocForm} />
                                <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl">
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                                        <h3 className="text-base font-semibold text-gray-900">
                                            {editingDoc ? 'Edit Tipe Dokumen' : 'Tambah Tipe Dokumen'}
                                        </h3>
                                        <button onClick={closeDocForm}
                                            className="text-gray-400 hover:text-gray-600">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="px-6 py-4 space-y-4 max-h-[65vh] overflow-y-auto">
                                        <Input
                                            label="Nama Tipe Dokumen"
                                            required
                                            value={docFormData.name}
                                            onChange={handleDocChange}
                                            name="name"
                                            placeholder="Contoh: Surat Proposal"
                                            error={docErrors.name}
                                        />
                                        <Input
                                            label="Kode"
                                            required
                                            value={docFormData.code}
                                            onChange={handleDocChange}
                                            name="code"
                                            placeholder="Contoh: PROPOSAL"
                                            error={docErrors.code}
                                            helperText="Tanpa spasi, gunakan underscore jika perlu"
                                        />
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                                Deskripsi
                                            </label>
                                            <textarea
                                                value={docFormData.description}
                                                onChange={handleDocChange}
                                                name="description"
                                                placeholder="Penjelasan singkat tentang dokumen ini"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                rows={3}
                                            />
                                            {docErrors.description && (
                                                <p className="text-xs text-red-500 mt-1">{docErrors.description}</p>
                                            )}
                                        </div>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="is_required"
                                                checked={docFormData.is_required}
                                                onChange={handleDocChange}
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
                                        <Button variant="secondary" onClick={closeDocForm}>
                                            Batal
                                        </Button>
                                        <Button
                                            variant="primary"
                                            loading={docSubmitting}
                                            icon={CheckCircle2}
                                            onClick={handleDocSubmit}
                                        >
                                            {editingDoc ? 'Perbarui' : 'Tambahkan'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

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
                                            loading={docSubmitting}
                                            onClick={() => handleDocDelete(showDeleteConfirm)}
                                        >
                                            Hapus
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Pengaturan;
