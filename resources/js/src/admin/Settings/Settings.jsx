import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllSettings, fetchPublicSettings, updateSettings } from '../../store/slice/settingSlice';
import { Settings as SettingsIcon, Save, Image as ImageIcon, Layout } from 'lucide-react';
import { toast } from 'react-toastify';
import Skeleton from '../../components/Skeleton';

const Settings = () => {
    const dispatch = useDispatch();
    const { allSettings: settings, loading } = useSelector((state) => state.settings);

    const [activeTab, setActiveTab] = useState('general');
    const [formData, setFormData] = useState({});
    const [originalData, setOriginalData] = useState({});
    const [previewUrls, setPreviewUrls] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        dispatch(fetchAllSettings());
    }, [dispatch]);

    useEffect(() => {
        if (settings.length > 0 && !isSaving) {
            const initialData = {};
            settings.forEach(s => {
                initialData[s.key] = s.value;
            });
            setFormData(initialData);
            setOriginalData(initialData);
            setIsDirty(false);
        }
    }, [settings, isSaving]);

    const checkDirty = useCallback((newFormData, newPreviewUrls) => {
        const hasTextChanges = Object.keys(newFormData).some(key => {
            if (newFormData[key] instanceof File) return true;
            return (newFormData[key] ?? '') !== (originalData[key] ?? '');
        });
        const hasFileChanges = Object.keys(newPreviewUrls).length > 0;
        setIsDirty(hasTextChanges || hasFileChanges);
    }, [originalData]);

    const handleInputChange = (key, value) => {
        const updated = { ...formData, [key]: value };
        setFormData(updated);
        checkDirty(updated, previewUrls);
    };

    const handleFileChange = (key, file) => {
        if (!file) return;
        // Revoke any existing blob for this key before creating new one
        if (previewUrls[key]) URL.revokeObjectURL(previewUrls[key]);
        const blobUrl = URL.createObjectURL(file);
        const updatedForm = { ...formData, [key]: file };
        const updatedPreviews = { ...previewUrls, [key]: blobUrl };
        setFormData(updatedForm);
        setPreviewUrls(updatedPreviews);
        checkDirty(updatedForm, updatedPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isDirty || isSaving) return;
        setIsSaving(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== undefined) {
                data.append(key, formData[key]);
            }
        });

        try {
            const action = await dispatch(updateSettings(data));
            if (updateSettings.fulfilled.match(action)) {
                toast.success('Pengaturan aplikasi berhasil diperbarui');
                Object.values(previewUrls).forEach(url => URL.revokeObjectURL(url));
                setPreviewUrls({});
                setIsDirty(false);
                // Re-fetch both admin list AND public settings (for Sidebar logo)
                dispatch(fetchAllSettings());
                dispatch(fetchPublicSettings());
            } else {
                const errorMessage = action.payload?.message || action.payload || 'Gagal memperbarui pengaturan';
                toast.error(errorMessage);
            }
        } catch {
            toast.error('Terjadi kesalahan sistem');
        } finally {
            setIsSaving(false);
        }
    };

    const tabs = [
        { id: 'general', label: 'Umum', icon: SettingsIcon },
        { id: 'branding', label: 'Branding', icon: Layout },
    ];

    if (loading && settings.length === 0) return <Skeleton className="h-96" />;

    return (
        <div className="max-w-auto mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-50">
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                            <SettingsIcon size={24} />
                        </div>
                        Pengaturan Aplikasi
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Kelola konfigurasi dasar dan branding aplikasi secara dinamis.</p>
                </div>

                <div className="flex flex-col md:flex-row">
                    {/* Sidebar Tabs */}
                    <div className="w-full md:w-64 bg-gray-50/50 border-r border-gray-50 p-4 space-y-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-white text-indigo-600 shadow-sm border border-gray-100'
                                        : 'text-gray-500 hover:bg-gray-100'
                                }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-8">
                        <form onSubmit={handleSubmit}>
                            <div className="min-h-[300px]">
                                {settings.filter(s => s.group === activeTab).length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-gray-50/30 rounded-2xl border-2 border-dashed border-gray-100">
                                        <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                                            <SettingsIcon size={32} className="opacity-20" />
                                        </div>
                                        <p className="text-sm font-medium">Belum ada pengaturan untuk kategori ini.</p>
                                        <p className="text-[10px] uppercase tracking-widest font-bold mt-1 opacity-50">Hubungi Developer untuk Menambah Konfigurasi</p>
                                    </div>
                                ) : (
                                    settings
                                        .filter(s => s.group === activeTab)
                                        .map(setting => (
                                            <SettingField
                                                key={setting.key}
                                                setting={setting}
                                                value={formData[setting.key]}
                                                previewUrl={previewUrls[setting.key]}
                                                onInputChange={handleInputChange}
                                                onFileChange={handleFileChange}
                                            />
                                        ))
                                )}
                            </div>

                            <div className="mt-10 pt-8 border-t border-gray-50 flex items-center justify-between">
                                {isDirty ? (
                                    <p className="text-xs text-amber-500 font-semibold flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-pulse" />
                                        Ada perubahan yang belum disimpan
                                    </p>
                                ) : (
                                    <p className="text-xs text-gray-400">Tidak ada perubahan</p>
                                )}
                                <button
                                    type="submit"
                                    disabled={isSaving || !isDirty}
                                    className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${
                                        isDirty && !isSaving
                                            ? 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg active:scale-95 cursor-pointer'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                                    }`}
                                >
                                    <Save size={18} />
                                    {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// SettingField — extracted as a dedicated React component
//
// WHY: The original code used renderField() as a plain function
// called inside .map(). This caused a stale closure: the
// previewUrls object was captured at render time and new blob
// URLs created by handleFileChange were never seen by the JSX.
//
// By making SettingField a proper component receiving `previewUrl`
// as a prop, React guarantees it receives the latest value on
// every render, fixing the "no preview after select" bug.
// ============================================================
const SettingField = ({ setting, value, previewUrl, onInputChange, onFileChange }) => {
    const { key, type } = setting;

    // Prefer blob preview (newly picked file) over stored server URL
    const displaySrc = previewUrl || (typeof value === 'string' && value ? value : null);

    if (type === 'file') {
        return (
            <div className="mb-6 last:mb-0">
                <label className="block text-sm font-bold text-gray-700 mb-2 capitalize">
                    {key.replace(/_/g, ' ')}
                </label>
                <div className="flex items-start gap-6">
                    {/* Preview box */}
                    <div className="flex-shrink-0 w-24 h-24 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden transition-all">
                        {displaySrc ? (
                            <img
                                src={displaySrc}
                                alt={`Preview ${key}`}
                                className="w-full h-full object-contain p-1"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                        ) : (
                            <ImageIcon size={28} className="text-gray-300" />
                        )}
                    </div>

                    {/* File picker */}
                    <div className="flex-1">
                        <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) onFileChange(key, file);
                            }}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-indigo-50 file:text-indigo-700
                                hover:file:bg-indigo-100
                                cursor-pointer transition-all"
                        />
                        <p className="text-[10px] text-gray-400 mt-2">Maksimal 2MB. Format: PNG, JPG, SVG.</p>
                        {previewUrl && (
                            <p className="text-[10px] text-emerald-600 font-semibold mt-1">
                                ✓ Gambar baru dipilih — klik Simpan untuk menerapkan.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (key === 'max_group_members') {
        return (
            <div className="mb-6 last:mb-0">
                <label className="block text-sm font-bold text-gray-700 mb-2 capitalize">
                    {key.replace(/_/g, ' ')}
                </label>
                <input
                    type="number"
                    min="1"
                    max="10"
                    value={value || ''}
                    onChange={(e) => onInputChange(key, e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                    placeholder="Contoh: 3"
                />
            </div>
        );
    }

    return (
        <div className="mb-6 last:mb-0">
            <label className="block text-sm font-bold text-gray-700 mb-2 capitalize">
                {key.replace(/_/g, ' ')}
            </label>
            <input
                type="text"
                value={value || ''}
                onChange={(e) => onInputChange(key, e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder={`Masukkan ${key.replace(/_/g, ' ')}...`}
            />
        </div>
    );
};

export default Settings;
