import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useUpdateProfileMutation } from '../api/pengaturanApi';
import { handleApiError, handleApiSuccess } from '../../shared/api/errorHandler';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import {
    User, Upload, Camera, Mail, Shield, Phone, KeyRound, LockKeyhole,
    GraduationCap, Save, CheckCircle2, Info
} from 'lucide-react';

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
        if (!authUser) return;

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
            setPreviewUrl(
                authUser.profile_picture_url.startsWith('http')
                    ? authUser.profile_picture_url
                    : `${window.location.origin}${authUser.profile_picture_url}`
            );
        }
    }, [authUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFormData(prev => ({ ...prev, profile_picture: file }));
        setPreviewUrl(URL.createObjectURL(file));

        if (errors.profile_picture) {
            setErrors(prev => ({ ...prev, profile_picture: '' }));
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
                setPreviewUrl(
                    result.user.profile_picture_url.startsWith('http')
                        ? result.user.profile_picture_url
                        : `${window.location.origin}${result.user.profile_picture_url}`
                );
            }

            setFormData(prev => ({
                ...prev,
                profile_picture: null,
                current_password: '',
                new_password: '',
                new_password_confirmation: '',
            }));
        } catch (err) {
            handleApiError(err, 'Gagal memperbarui profil');
        }
    };

    const getRoleLabel = (role) => {
        const labels = {
            admin: 'Administrator',
            mahasiswa: 'Mahasiswa',
            dosen: 'Dosen',
        };
        return labels[role] || role;
    };

    const getRoleIcon = () => {
        if (isStudent) return GraduationCap;
        if (isLecturer) return Shield;
        return Shield;
    };

    const RoleIcon = getRoleIcon();

    return (
        <div className="space-y-6">
            <PageHeader
                title="Profil Saya"
                description="Kelola informasi pribadi, akun, dan keamanan profil Anda."
                icon={User}
            />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* PROFILE SUMMARY */}
                <div className="xl:col-span-1 space-y-6">
                    <Card>
                        <div className="relative overflow-hidden">
                            <div className="h-28 bg-gradient-to-r from-emerald-600 to-emerald-500" />

                            <div className="px-6 pb-6">
                                <div className="flex justify-center -mt-14">
                                    <div className="relative">
                                        {previewUrl ? (
                                            <img
                                                src={previewUrl}
                                                alt="Profile"
                                                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg bg-white"
                                            />
                                        ) : (
                                            <div className="w-28 h-28 rounded-full bg-emerald-50 border-4 border-white shadow-lg flex items-center justify-center">
                                                <User className="w-12 h-12 text-emerald-600" />
                                            </div>
                                        )}

                                        <label
                                            className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center cursor-pointer shadow-md hover:bg-emerald-700 transition-colors border-2 border-white"
                                            title="Ganti foto profil"
                                        >
                                            <Camera className="w-4 h-4" />
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/png,image/jpeg,image/jpg"
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div className="text-center mt-4">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {authUser?.name || 'Pengguna'}
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {authUser?.email || '-'}
                                    </p>

                                    <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                                        {authUser?.roles?.map(role => {
                                            const Icon = role === 'mahasiswa' ? GraduationCap : Shield;

                                            return (
                                                <span
                                                    key={role}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold"
                                                >
                                                    <Icon className="w-3.5 h-3.5" />
                                                    {getRoleLabel(role)}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="mt-6 pt-5 border-t border-gray-100 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
                                            <Mail className="w-4 h-4 text-gray-500" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-gray-400">Email</p>
                                            <p className="text-sm font-medium text-gray-700 truncate">
                                                {authUser?.email || '-'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
                                            <Phone className="w-4 h-4 text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Nomor Telepon</p>
                                            <p className="text-sm font-medium text-gray-700">
                                                {authUser?.phone_number || 'Belum diatur'}
                                            </p>
                                        </div>
                                    </div>

                                    {isStudent && authUser?.student?.nim && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
                                                <GraduationCap className="w-4 h-4 text-gray-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400">NIM</p>
                                                <p className="text-sm font-medium text-gray-700">
                                                    {authUser.student.nim}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* PHOTO INFO */}
                    <Card>
                        <div className="p-5">
                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <Info className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">
                                        Foto Profil
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                        Gunakan foto dengan format JPG, JPEG, atau PNG.
                                        Ukuran maksimal 2 MB agar profil tetap optimal.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* MAIN FORM */}
                <div className="xl:col-span-2 space-y-6">
                    {/* ACCOUNT INFORMATION */}
                    <Card>
                        <div className="p-6">
                            <div className="flex items-start justify-between gap-4 mb-6">
                                <div>
                                    <h3 className="text-base font-bold text-gray-900">
                                        Informasi Akun
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Perbarui informasi dasar yang digunakan pada akun Anda.
                                    </p>
                                </div>

                                <div className="hidden sm:flex w-10 h-10 rounded-lg bg-emerald-50 items-center justify-center">
                                    <User className="w-5 h-5 text-emerald-600" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Input
                                    label="Nama Lengkap"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Masukkan nama lengkap"
                                    error={errors.name}
                                />

                                <Input
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="email@example.com"
                                    error={errors.email}
                                />

                                <Input
                                    label="Nomor Telepon"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    placeholder="0812xxxxxxxx"
                                    error={errors.phone_number}
                                />

                                {isStudent && authUser?.student?.nim && (
                                    <Input
                                        label="NIM"
                                        value={authUser.student.nim}
                                        disabled
                                        className="bg-gray-50"
                                    />
                                )}

                                {isLecturer && authUser?.lecturer?.nidn && (
                                    <Input
                                        label="NIDN"
                                        value={authUser.lecturer.nidn}
                                        disabled
                                        className="bg-gray-50"
                                    />
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* SECURITY */}
                    <Card>
                        <div className="p-6">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                                    <LockKeyhole className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-gray-900">
                                        Keamanan Akun
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Ubah password akun untuk menjaga keamanan akses Anda.
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 rounded-lg bg-amber-50 border border-amber-100 mb-5">
                                <div className="flex gap-3">
                                    <KeyRound className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                                    <p className="text-xs text-amber-700 leading-relaxed">
                                        Kosongkan seluruh bagian password jika Anda tidak ingin
                                        mengubah password akun.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <Input
                                    label="Password Saat Ini"
                                    name="current_password"
                                    type="password"
                                    value={formData.current_password}
                                    onChange={handleChange}
                                    placeholder="Masukkan password saat ini"
                                    error={errors.current_password}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Input
                                        label="Password Baru"
                                        name="new_password"
                                        type="password"
                                        value={formData.new_password}
                                        onChange={handleChange}
                                        placeholder="Masukkan password baru"
                                        error={errors.new_password}
                                    />

                                    <Input
                                        label="Konfirmasi Password Baru"
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
                    </Card>

                    {/* SAVE */}
                    <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
                        <p className="text-xs text-gray-400 mr-auto">
                            Pastikan informasi yang Anda masukkan sudah benar.
                        </p>

                        <Button
                            onClick={handleSubmit}
                            loading={isSubmitting}
                            icon={Save}
                        >
                            Simpan Perubahan
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;