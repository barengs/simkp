import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    useUpdateProfileMutation,
} from '../api/pengaturanApi';
import { handleApiError, handleApiSuccess } from '../../shared/api/errorHandler';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { User, Upload, Camera, Mail, Shield, Phone, Key } from 'lucide-react';

const Profile = () => {
    const authUser = useSelector(s => s.auth.user);
    const [updateProfile, { isLoading: isSubmitting }] = useUpdateProfileMutation();

    const isStudent = authUser?.roles?.includes('mahasiswa');
    const isLecturer = authUser?.roles?.includes('dosen');
    const isAdmin = authUser?.roles?.includes('admin');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone_number: '',
        profile_picture: null,
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });
    const [errors, setErrors] = useState({});
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        if (authUser) {
            setFormData({
                name: authUser.name || '',
                email: authUser.email || '',
                phone_number: authUser.phone_number || '',
                profile_picture: null,
                current_password: '',
                new_password: '',
                new_password_confirmation: '',
            });
            if (authUser.profile_picture_url) {
                setPreviewUrl(authUser.profile_picture_url.startsWith('http') ? authUser.profile_picture_url : `${window.location.origin}${authUser.profile_picture_url}`);
            }
        }
    }, [authUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, profile_picture: file }));
            setPreviewUrl(URL.createObjectURL(file));
            if (errors.profile_picture) setErrors(prev => ({ ...prev, profile_picture: '' }));
        }
    };

    const handleSubmit = async () => {
        setErrors({});
        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        data.append('phone_number', formData.phone_number);
        if (formData.profile_picture) {
            data.append('profile_picture', formData.profile_picture);
        }
        if (formData.current_password) {
            data.append('current_password', formData.current_password);
            data.append('new_password', formData.new_password);
            data.append('new_password_confirmation', formData.new_password_confirmation);
        }

        try {
            const result = await updateProfile(data).unwrap();
            handleApiSuccess('Profil berhasil diperbarui');
            if (result.user?.profile_picture_url) {
                setPreviewUrl(result.user.profile_picture_url.startsWith('http') ? result.user.profile_picture_url : `${window.location.origin}${result.user.profile_picture_url}`);
            }
            setFormData(prev => ({
                ...prev,
                current_password: '',
                new_password: '',
                new_password_confirmation: '',
            }));
        } catch (err) {
            handleApiError(err, 'Gagal memperbarui profil');
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Profile Saya"
                description="Kelola informasi akun dan foto profil Anda"
                icon={User}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                    <div className="p-6 text-center">
                        <div className="relative inline-block mb-4">
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="Profile"
                                    className="w-32 h-32 rounded-full object-cover border-4 border-emerald-100 shadow-lg"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-emerald-100 flex items-center justify-center border-4 border-emerald-200">
                                    <User className="w-16 h-16 text-emerald-600" />
                                </div>
                            )}
                            <label className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-emerald-700 transition-colors shadow-md">
                                <Camera className="w-4 h-4 text-white" />
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{authUser?.name}</h3>
                        <p className="text-sm text-gray-500">{authUser?.email}</p>
                        <div className="mt-3 flex flex-wrap justify-center gap-2">
                            {authUser?.roles?.map(role => (
                                <span key={role} className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                                    <Shield className="w-3 h-3" />
                                    {role}
                                </span>
                            ))}
                        </div>
                    </div>
                </Card>

                <Card className="lg:col-span-2">
                    <div className="p-6 space-y-6">
                        <div>
                            <h3 className="text-base font-semibold text-gray-900 mb-4">Informasi Akun</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        <User className="w-4 h-4 inline mr-2" />
                                        Nama Lengkap
                                    </label>
                                    <Input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Masukkan nama lengkap"
                                        error={errors.name}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        <Mail className="w-4 h-4 inline mr-2" />
                                        Email
                                    </label>
                                    <Input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="email@example.com"
                                        error={errors.email}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        <Phone className="w-4 h-4 inline mr-2" />
                                        Nomor Telepon
                                    </label>
                                    <Input
                                        name="phone_number"
                                        value={formData.phone_number}
                                        onChange={handleChange}
                                        placeholder="0812-xxxx-xxxx"
                                        error={errors.phone_number}
                                    />
                                </div>

                                {isStudent && authUser?.student?.nim && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">
                                            NIM
                                        </label>
                                        <Input
                                            value={authUser.student.nim}
                                            disabled
                                            className="bg-gray-100"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        <Camera className="w-4 h-4 inline mr-2" />
                                        Foto Profil
                                    </label>
                                    <label className="flex flex-col items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                                        <div className="text-center">
                                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-600">Klik untuk ganti foto profil</p>
                                            <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG (Max 2 MB)</p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                    {previewUrl && (
                                        <div className="mt-3 flex items-center gap-3">
                                            <img src={previewUrl} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                                            <span className="text-xs text-gray-500">Preview</span>
                                        </div>
                                    )}
                                    {errors.profile_picture && <p className="text-xs text-red-600 mt-1">{errors.profile_picture}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-base font-semibold text-gray-900 mb-4">Ubah Password</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        <Key className="w-4 h-4 inline mr-2" />
                                        Password Saat Ini
                                    </label>
                                    <Input
                                        name="current_password"
                                        type="password"
                                        value={formData.current_password}
                                        onChange={handleChange}
                                        placeholder="Masukkan password saat ini"
                                        error={errors.current_password}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Password Baru
                                    </label>
                                    <Input
                                        name="new_password"
                                        type="password"
                                        value={formData.new_password}
                                        onChange={handleChange}
                                        placeholder="Masukkan password baru"
                                        error={errors.new_password}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Konfirmasi Password Baru
                                    </label>
                                    <Input
                                        name="new_password_confirmation"
                                        type="password"
                                        value={formData.new_password_confirmation}
                                        onChange={handleChange}
                                        placeholder="Ulangi password baru"
                                        error={errors.new_password_confirmation}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                onClick={handleSubmit}
                                loading={isSubmitting}
                                icon={User}
                            >
                                Simpan Perubahan
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Profile;
