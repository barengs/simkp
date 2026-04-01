import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllSettings, updateSettings } from '../../store/slice/settingSlice';
import { Settings as SettingsIcon, Save, Image as ImageIcon, Layout, ShieldCheck, Globe } from 'lucide-react';
import { toast } from 'react-toastify';
import Skeleton from '../../components/Skeleton';
import Modal from '../../components/Modal';

const Settings = () => {
    const dispatch = useDispatch();
    const { allSettings: settings, loading } = useSelector((state) => state.settings);

    const [activeTab, setActiveTab] = useState('general');
    const [formData, setFormData] = useState({});
    const [previewUrls, setPreviewUrls] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        dispatch(fetchAllSettings());
    }, [dispatch]);

    useEffect(() => {
        if (settings.length > 0) {
            const initialData = {};
            settings.forEach(s => {
                initialData[s.key] = s.value;
            });
            setFormData(initialData);
        }
    }, [settings]);

    const handleInputChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleFileChange = (key, file) => {
        if (file) {
            setFormData(prev => ({ ...prev, [key]: file }));
            setPreviewUrls(prev => ({ ...prev, [key]: URL.createObjectURL(file) }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null) {
                data.append(key, formData[key]);
            }
        });

        const action = await dispatch(updateSettings(data));
        if (updateSettings.fulfilled.match(action)) {
            toast.success("Pengaturan aplikasi berhasil diperbarui");
            dispatch(fetchAllSettings());
        } else {
            toast.error(action.payload || "Gagal memperbarui pengaturan");
        }
        setIsSaving(false);
    };

    const renderField = (setting) => {
        const { key, type, group } = setting;
        if (group !== activeTab) return null;

        return (
            <div key={key} className="mb-6 last:mb-0">
                <label className="block text-sm font-bold text-gray-700 mb-2 capitalize">
                    {key.replace(/_/g, ' ')}
                </label>
                
                {type === 'file' ? (
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                            {(previewUrls[key] || formData[key]) ? (
                                <img src={previewUrls[key] || formData[key]} alt="Preview" className="w-full h-full object-contain" />
                            ) : (
                                <ImageIcon size={24} className="text-gray-300" />
                            )}
                        </div>
                        <div className="flex-1">
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => handleFileChange(key, e.target.files[0])}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all"
                            />
                            <p className="text-[10px] text-gray-400 mt-2">Maksimal 2MB. Format: PNG, JPG, SVG.</p>
                        </div>
                    </div>
                ) : (
                    <input 
                        type="text"
                        value={formData[key] || ''}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        placeholder={`Masukkan ${key.replace(/_/g, ' ')}...`}
                    />
                )}
            </div>
        );
    };

    if (loading && settings.length === 0) return <Skeleton className="h-96" />;

    const tabs = [
        { id: 'general', label: 'Umum', icon: SettingsIcon },
        { id: 'branding', label: 'Branding', icon: Layout },
    ];

    return (
        <div className="max-w-4xl mx-auto">
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
                                    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                                        <SettingsIcon size={48} className="mb-4 opacity-20" />
                                        <p className="text-sm">Belum ada pengaturan untuk kategori ini.</p>
                                    </div>
                                ) : (
                                    settings.map(renderField)
                                )}
                            </div>

                            <div className="mt-10 pt-8 border-t border-gray-50 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-95 disabled:bg-gray-400"
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

export default Settings;
