import React, { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    useGetReportQuery,
    useCreateReportMutation,
    useUpdateReportMutation,
} from '../api/kpApi';
import { handleApiError, handleApiSuccess } from '../../shared/api/errorHandler';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Input from '../../../components/ui/Input';
import Textarea from '../../../components/ui/Textarea';
import { FileText, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';

const STATUS_CONFIG = {
    pending: { label: 'Menunggu Review', color: 'yellow' },
    approved: { label: 'Disetujui', color: 'green' },
    rejected: { label: 'Perlu Revisi', color: 'red' },
};

const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return <Badge status={config.color}>{config.label}</Badge>;
};

const Laporan = () => {
    const authUser = useSelector(s => s.auth.user);
    const [form, setForm] = useState({ title: '', description: '', file: null });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [isRegistered, setIsRegistered] = useState(null);

    const [createReport, { isLoading: isCreating }] = useCreateReportMutation();
    const [updateReport, { isLoading: isUpdating }] = useUpdateReportMutation();

    const approvedStatuses = ['approved', 'grading', 'finished'];

    const activeKpGroupId = useMemo(() => {
        const members = authUser?.student?.kp_group_members || [];
        const member = members.find(
            m => m.member_status === 'active' && approvedStatuses.includes(m.group_status)
        );
        return member?.kp_group_id || null;
    }, [authUser]);

    const activeKpGroupIdWithSupervisor = useMemo(() => {
        const members = authUser?.student?.kp_group_members || [];
        const member = members.find(
            m => m.member_status === 'active' && approvedStatuses.includes(m.group_status) && m.group_supervisor !== null
        );
        return member?.kp_group_id || null;
    }, [authUser]);

    const { data: reportsRaw, isLoading, refetch } = useGetReportQuery(activeKpGroupId || undefined);

    const reports = useMemo(() =>
        Array.isArray(reportsRaw) ? reportsRaw
        : Array.isArray(reportsRaw?.data) ? reportsRaw.data : [],
    [reportsRaw]);

    const currentReport = reports[0];

    useEffect(() => {
        if (currentReport?.status === 'rejected' && !form.title && !form.description && !form.file) {
            setForm({
                title: currentReport.title || '',
                description: currentReport.description || '',
                file: null,
            });
        }
    }, [currentReport]);

    useEffect(() => {
        if (!authUser?.student) {
            setIsRegistered(false);
            return;
        }

        const members = authUser.student.kp_group_members || [];
        const approvedStatuses = ['approved', 'grading', 'finished'];
        const hasActiveApproved = members.some(
            m => m.member_status === 'active' && approvedStatuses.includes(m.group_status)
        );

        if (hasActiveApproved) {
            setIsRegistered('approved');
        } else if (members.length > 0) {
            setIsRegistered('pending');
        } else {
            setIsRegistered(false);
        }
    }, [authUser]);

    const resetForm = () => {
        setForm({ title: '', description: '', file: null });
        setErrors({});
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setForm(prev => ({ ...prev, file }));
            if (errors.file) setErrors(prev => ({ ...prev, file: '' }));
        }
    };

    const handleSubmit = async () => {
        if (!activeKpGroupId) return;
        setSubmitting(true);
        setErrors({});

        try {
            const formData = new FormData();
            formData.append('kp_group_id', String(activeKpGroupId));
            formData.append('title', form.title);
            formData.append('description', form.description);

            if (currentReport) {
                formData.append('status', 'pending');
                if (form.file) {
                    formData.append('file', form.file);
                }
                await updateReport({ id: currentReport.id, body: formData }).unwrap();
                handleApiSuccess('Laporan berhasil diperbarui');
            } else {
                formData.append('status', 'pending');
                if (form.file) {
                    formData.append('file', form.file);
                }
                await createReport(formData).unwrap();
                handleApiSuccess('Laporan berhasil diajukan');
            }

            resetForm();
            await refetch();
        } catch (err) {
            if (err?.data?.errors) {
                setErrors(err.data.errors);
            }
            handleApiError(err, currentReport ? 'Gagal memperbarui laporan' : 'Gagal mengajukan laporan');
        } finally {
            setSubmitting(false);
        }
    };

    const openReuploadForm = () => {
        if (!currentReport) return;
        setForm({
            title: currentReport.title || '',
            description: currentReport.description || '',
            file: null,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderDetail = () => {
        if (!currentReport) return null;

        return (
            <Card>
                <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Detail Laporan</h3>
                        {getStatusBadge(currentReport.status)}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Judul</p>
                            <p className="text-sm font-medium text-gray-900">{currentReport.title || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Deskripsi</p>
                            <p className="text-sm text-gray-900 whitespace-pre-wrap">{currentReport.description || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Dokumen</p>
                            {currentReport.file_url ? (
                                <a
                                    href={currentReport.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-emerald-600 hover:text-emerald-800"
                                >
                                    Lihat Dokumen
                                </a>
                            ) : (
                                <p className="text-sm text-gray-500">Belum ada dokumen</p>
                            )}
                        </div>
                    </div>

                    {currentReport.status === 'rejected' && (
                        <div className="mt-6 flex justify-end">
                            <Button onClick={openReuploadForm}>
                                Upload Ulang
                            </Button>
                        </div>
                    )}
                </div>
            </Card>
        );
    };

    const renderForm = () => {
        const isEdit = !!currentReport;
        const title = isEdit ? 'Upload Ulang Laporan' : 'Ajukan Laporan KP';
        const description = isEdit
            ? 'Laporan Anda perlu revisi. Silakan perbaiki dan upload ulang dokumen.'
            : 'Ajukan laporan Kerja Praktek Anda dengan mengisi form di bawah ini.';

        return (
            <Card>
                <div className="p-8">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{description}</p>
                    </div>

                    {currentReport?.rejection_note && currentReport.status === 'rejected' && (
                        <div className="mb-4 rounded-lg p-3 text-sm flex gap-2 bg-red-50 border border-red-200 text-red-800">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-semibold mb-0.5">Catatan Revisi dari Dosen:</p>
                                <p>{currentReport.rejection_note}</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <Input
                            label="Judul Laporan"
                            value={form.title}
                            onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Masukkan judul laporan"
                            required
                            error={errors.title}
                        />
                        <Textarea
                            label="Deskripsi"
                            value={form.description}
                            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Jelaskan deskripsi laporan..."
                            rows={4}
                            error={errors.description}
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Dokumen Laporan <span className="text-red-500">*</span>
                            </label>
                            <label className="flex flex-col items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                                <div className="text-center">
                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    {form.file ? (
                                        <div>
                                            <p className="text-sm text-emerald-600 font-medium">{form.file.name}</p>
                                            <p className="text-xs text-gray-500">{(form.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                    ) : currentReport?.file_url ? (
                                        <>
                                            <p className="text-sm text-gray-600">Klik untuk ganti dokumen</p>
                                            <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX (Max 10 MB)</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-sm text-gray-600">Klik untuk unggah atau seret berkas</p>
                                            <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX (Max 10 MB)</p>
                                        </>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleFileChange}
                                />
                            </label>
                            {errors.file && <p className="text-xs text-red-600 mt-1">{errors.file}</p>}
                        </div>

                        <div className="flex justify-end">
                            <Button
                                onClick={handleSubmit}
                                loading={submitting}
                                disabled={!form.title || !form.description || (!currentReport && !form.file)}
                            >
                                {isEdit ? 'Upload Ulang' : 'Ajukan Laporan'}
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        );
    };

    const renderContent = () => {
        if (isRegistered === false) {
            return (
                <Card>
                    <div className="p-12 text-center">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Anda belum terdaftar di KP
                        </h3>
                        <p className="text-sm text-gray-500 max-w-md mx-auto">
                            Silakan daftarkan kelompok KP terlebih dahulu melalui menu Pendaftaran Kelompok sebelum dapat mengajukan laporan.
                        </p>
                    </div>
                </Card>
            );
        }

        if (isRegistered === 'pending') {
            return (
                <Card>
                    <div className="p-12 text-center">
                        <FileText className="w-16 h-16 text-yellow-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Pendaftaran KP Anda belum disetujui
                        </h3>
                        <p className="text-sm text-gray-500 max-w-md mx-auto">
                            Laporan hanya dapat diajukan setelah pendaftaran kelompok KP Anda disetujui oleh koordinator. Silakan tunggu verifikasi.
                        </p>
                    </div>
                </Card>
            );
        }

        if (!activeKpGroupId) {
            return (
                <Card>
                    <div className="p-12 text-center">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Kelompok KP belum lengkap
                        </h3>
                        <p className="text-sm text-gray-500 max-w-md mx-auto">
                            Silakan lengkapi data kelompok KP terlebih dahulu.
                        </p>
                    </div>
                </Card>
            );
        }

        if (currentReport?.status === 'approved') {
            return renderDetail();
        }

        if (!currentReport) {
            return renderForm();
        }

        if (currentReport.status === 'pending') {
            return renderDetail();
        }

        if (currentReport.status === 'rejected') {
            return renderForm();
        }

        return renderDetail();
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Laporan KP"
                description="Ajukan dan kelola laporan Kerja Praktek Anda"
                icon={FileText}
            />

            {renderContent()}
        </div>
    );
};

export default Laporan;
