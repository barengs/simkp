import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    useGetSettingsQuery,
    useUpdateSettingsMutation,
} from '../api/pengaturanApi';
import { handleApiError, handleApiSuccess } from '../../shared/api/errorHandler';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Settings, Upload, Image as ImageIcon, Globe, Monitor } from 'lucide-react';

const PengaturanUmum = () => {
    const authUser = useSelector(s => s.auth.user);
    const { data: settings, isLoading } = useGetSettingsQuery();
    const [updateSettings, { isLoading: isSubmitting }] = useUpdateSettingsMutation();

    const [formData, setFormData] = useState({
        app_name: 'SIM-KPTA',
        logo_path: null,
        favicon_path: null,
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (settings) {
            setFormData({
                app_name: settings.app_name || 'SIM-KPTA',
                logo_path: settings.logo_path || null,
                favicon_path: settings.favicon_path || null,
            });
        }
    }, [settings]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleFileChange = (e, field) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, [field]: file }));
            if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleSubmit = async () => {
        setErrors({});
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
        const fullUrl = url.startsWith('http') ? url : `${window.location.origin}/storage${url}`;
        return (
            <div className="mt-3 flex items-center gap-3">
                <img src={fullUrl} alt={name} className="w-16 h-16 object-contain border border-gray-200 rounded-lg p-1 bg-gray-50" />
                <span className="text-xs text-gray-500">Gambar saat ini</span>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Pengaturan Umum"
                description="Atur tampilan aplikasi seperti nama, logo, dan favicon"
                icon={Settings}
            />

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
                            onChange={handleChange}
                            placeholder="SIM-KPTA"
                            error={errors.app_name}
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
                        {errors.logo_path && <p className="text-xs text-red-600 mt-1">{errors.logo_path}</p>}
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
                        {errors.favicon_path && <p className="text-xs text-red-600 mt-1">{errors.favicon_path}</p>}
                    </div>

                    <div className="flex justify-end">
                        <Button
                            onClick={handleSubmit}
                            loading={isSubmitting}
                            icon={Settings}
                        >
                            Simpan Pengaturan
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default PengaturanUmum;
