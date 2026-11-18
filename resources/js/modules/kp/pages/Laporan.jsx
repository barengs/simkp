import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    useGetReportQuery,
    useCreateReportMutation,
    useUpdateReportMutation,
    useGetKpGroupByIdQuery,
} from '../api/kpApi';
import { handleApiError, handleApiSuccess } from '../../shared/api/errorHandler';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Input from '../../../components/ui/Input';
import Textarea from '../../../components/ui/Textarea';
import Skeleton from '../../../components/ui/Skeleton';
import {
    FileText,
    Upload,
    AlertCircle,
    CheckCircle2,
    Clock,
    Building2,
    GraduationCap,
    UsersRound,
    BookOpen,
    ExternalLink,
    Trash2,
    X,
    FileCheck,
    Info,
    Sparkles,
    UserPlus,
    ArrowRight,
    FileUp,
    Check,
} from 'lucide-react';

/* =============================================================================
 * STATUS CONFIGURATION
 * ============================================================================= */
const STATUS_CONFIG = {
    pending: {
        label: 'Menunggu Review',
        badgeColor: 'yellow',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-800',
        icon: Clock,
    },
    approved: {
        label: 'Disetujui',
        badgeColor: 'green',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-800',
        icon: CheckCircle2,
    },
    rejected: {
        label: 'Perlu Revisi',
        badgeColor: 'red',
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        text: 'text-rose-800',
        icon: AlertCircle,
    },
};

const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const formatFileSize = (bytes) => {
    if (!bytes || isNaN(bytes)) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

/* =============================================================================
 * MAIN COMPONENT: LAPORAN KP
 * ============================================================================= */
const Laporan = () => {
    const navigate = useNavigate();
    const authUser = useSelector((s) => s.auth.user);
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({ title: '', description: '', file: null });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isRegistered, setIsRegistered] = useState(null);

    const [createReport, { isLoading: isCreating }] = useCreateReportMutation();
    const [updateReport, { isLoading: isUpdating }] = useUpdateReportMutation();

    const approvedStatuses = ['approved', 'ongoing', 'grading', 'finished'];

    // Identify student active group
    const activeKpGroupId = useMemo(() => {
        const members = authUser?.student?.kp_group_members || [];
        const member = members.find(
            (m) => m.member_status === 'active' && approvedStatuses.includes(m.group_status)
        );
        return member?.kp_group_id || null;
    }, [authUser]);

    // Check supervisor
    const supervisorMember = useMemo(() => {
        const members = authUser?.student?.kp_group_members || [];
        const member = members.find(
            (m) => m.member_status === 'active' && approvedStatuses.includes(m.group_status)
        );
        return member?.group_supervisor || null;
    }, [authUser]);

    // Fetch reports
    const {
        data: reportsRaw,
        isLoading: reportsLoading,
        refetch,
    } = useGetReportQuery(activeKpGroupId || undefined, {
        skip: !activeKpGroupId,
    });

    // Fetch full group information for rich context
    const { data: groupRaw, isLoading: groupLoading } = useGetKpGroupByIdQuery(activeKpGroupId, {
        skip: !activeKpGroupId,
    });

    const group = useMemo(() => {
        if (!groupRaw) return null;
        return groupRaw.data || groupRaw;
    }, [groupRaw]);

    const reports = useMemo(() => {
        if (!reportsRaw) return [];
        return Array.isArray(reportsRaw) ? reportsRaw : Array.isArray(reportsRaw.data) ? reportsRaw.data : [];
    }, [reportsRaw]);

    const currentReport = reports[0] || null;

    // Check registration status
    useEffect(() => {
        if (!authUser?.student) {
            setIsRegistered(false);
            return;
        }

        const members = authUser.student.kp_group_members || [];
        const hasActiveApproved = members.some(
            (m) => m.member_status === 'active' && approvedStatuses.includes(m.group_status)
        );

        if (hasActiveApproved) {
            setIsRegistered('approved');
        } else if (members.length > 0) {
            setIsRegistered('pending');
        } else {
            setIsRegistered(false);
        }
    }, [authUser]);

    // Auto switch to edit mode when report needs revision
    useEffect(() => {
        if (currentReport?.status === 'rejected') {
            setIsEditMode(true);
            setForm({
                title: currentReport.title || '',
                description: currentReport.description || '',
                file: null,
            });
        }
    }, [currentReport]);

    const validateAndSetFile = (file) => {
        const allowedExtensions = ['pdf', 'doc', 'docx'];
        const extension = file.name.split('.').pop().toLowerCase();

        if (!allowedExtensions.includes(extension)) {
            setErrors((prev) => ({
                ...prev,
                file: 'Format berkas tidak valid. Harap pilih dokumen berekstensi .pdf, .doc, atau .docx.',
            }));
            return;
        }

        const maxSizeBytes = 10 * 1024 * 1024; // 10 MB
        if (file.size > maxSizeBytes) {
            setErrors((prev) => ({
                ...prev,
                file: 'Ukuran berkas melebihi batas maksimal 10 MB.',
            }));
            return;
        }

        setForm((prev) => ({ ...prev, file }));
        setErrors((prev) => ({ ...prev, file: '' }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            validateAndSetFile(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            validateAndSetFile(file);
        }
    };

    const removeFile = () => {
        setForm((prev) => ({ ...prev, file: null }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const openEditMode = () => {
        if (!currentReport) return;
        setIsEditMode(true);
        setForm({
            title: currentReport.title || '',
            description: currentReport.description || '',
            file: null,
        });
        window.scrollTo({ top: 120, behavior: 'smooth' });
    };

    const cancelEditMode = () => {
        setIsEditMode(false);
        setForm({ title: '', description: '', file: null });
        setErrors({});
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!activeKpGroupId) return;

        // Validation
        const newErrors = {};
        if (!form.title.trim()) {
            newErrors.title = 'Judul laporan wajib diisi.';
        }
        if (!currentReport && !form.file) {
            newErrors.file = 'Berkas dokumen laporan wajib diunggah.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setSubmitting(true);
        setErrors({});

        try {
            const formData = new FormData();
            formData.append('kp_group_id', String(activeKpGroupId));
            formData.append('title', form.title.trim());
            if (form.description.trim()) {
                formData.append('description', form.description.trim());
            }

            if (currentReport) {
                formData.append('status', 'pending');
                if (form.file) {
                    formData.append('file', form.file);
                }
                await updateReport({ id: currentReport.id, body: formData }).unwrap();
                handleApiSuccess('Laporan KP berhasil diperbarui dan diajukan ulang.');
            } else {
                formData.append('status', 'pending');
                if (form.file) {
                    formData.append('file', form.file);
                }
                await createReport(formData).unwrap();
                handleApiSuccess('Laporan KP berhasil diajukan.');
            }

            setIsEditMode(false);
            setForm({ title: '', description: '', file: null });
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

    /* =============================================================================
     * RENDER: EMPTY STATES
     * ============================================================================= */
    if (isRegistered === false) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Laporan KP"
                    description="Ajukan dan kelola dokumen laporan Kerja Praktek Anda"
                    icon={FileText}
                />
                <Card className="p-10 text-center max-w-2xl mx-auto">
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto mb-4">
                        <UserPlus className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                        Anda Belum Terdaftar dalam Kelompok KP
                    </h3>
                    <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto leading-relaxed">
                        Pengajuan laporan Kerja Praktek hanya dapat dilakukan setelah Anda membentuk kelompok dan mendaftarkan mitra magang.
                    </p>
                    <Button
                        variant="primary"
                        icon={UserPlus}
                        onClick={() => navigate('/kp/kelompok')}
                    >
                        Daftar Kelompok KP Sekarang
                    </Button>
                </Card>
            </div>
        );
    }

    if (isRegistered === 'pending') {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Laporan KP"
                    description="Ajukan dan kelola dokumen laporan Kerja Praktek Anda"
                    icon={FileText}
                />
                <Card className="p-10 text-center max-w-2xl mx-auto">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto mb-4">
                        <Clock className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                        Pendaftaran Kelompok Menunggu Persetujuan
                    </h3>
                    <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto leading-relaxed">
                        Pendaftaran kelompok KP Anda sedang dalam proses verifikasi oleh koordinator. Laporan baru dapat diajukan setelah pendaftaran disetujui secara resmi.
                    </p>
                    <Button
                        variant="secondary"
                        icon={ArrowRight}
                        onClick={() => navigate('/kp/kelompok')}
                    >
                        Periksa Status Pendaftaran
                    </Button>
                </Card>
            </div>
        );
    }

    if (reportsLoading || groupLoading) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Laporan KP"
                    description="Memuat data laporan..."
                    icon={FileText}
                />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Skeleton className="h-96 rounded-xl" />
                    </div>
                    <div>
                        <Skeleton className="h-96 rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    /* =============================================================================
     * MAIN VIEW: 2-COLUMN LAYOUT
     * ============================================================================= */
    const supervisorName =
        supervisorMember?.name ||
        group?.members?.find((m) => m.supervisor)?.supervisor?.user?.name ||
        group?.members?.find((m) => m.supervisor)?.supervisor?.name ||
        'Belum ditetapkan';

    const statusObj = currentReport ? STATUS_CONFIG[currentReport.status] || STATUS_CONFIG.pending : null;
    const StatusIcon = statusObj?.icon || Clock;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Laporan KP"
                description="Ajukan, perbaiki, dan pantau status pengesahan laporan akhir Kerja Praktek"
                icon={FileText}
            />

            {/* TOP ALERT NOTIFICATION BANNER */}
            {currentReport && (
                <div
                    className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all ${statusObj.bg} ${statusObj.border} ${statusObj.text}`}
                >
                    <StatusIcon className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h4 className="text-sm font-bold">
                                Status Laporan: {statusObj.label}
                            </h4>
                            <span className="text-xs opacity-80">
                                Terakhir diperbarui: {formatDateTime(currentReport.updated_at || currentReport.created_at)}
                            </span>
                        </div>
                        <p className="text-xs mt-1 leading-relaxed">
                            {currentReport.status === 'approved' &&
                                'Selamat! Laporan Kerja Praktek Anda telah disetujui oleh Dosen Pembimbing. Kelompok Anda kini berhak mengikuti evaluasi penilaian akhir.'}
                            {currentReport.status === 'pending' &&
                                'Dokumen laporan Anda sedang dalam proses penelaahan oleh Dosen Pembimbing. Mohon pantau halaman ini secara berkala.'}
                            {currentReport.status === 'rejected' &&
                                'Terdapat catatan revisi dari Dosen Pembimbing. Silakan periksa catatan di bawah, perbaiki dokumen Anda, dan unggah kembali perbaikannya.'}
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* =============================================================
                 * LEFT COLUMN: FORM OR REPORT DETAIL
                 * ============================================================= */}
                <div className="lg:col-span-2 space-y-6">
                    {/* VIEW REPORT DETAIL (If submitted and NOT in edit mode) */}
                    {currentReport && !isEditMode ? (
                        <Card className="overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50">
                                <div>
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block">
                                        Dokumen Final
                                    </span>
                                    <h3 className="text-lg font-bold text-gray-900 mt-0.5">
                                        Laporan Kerja Praktek
                                    </h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge status={statusObj.badgeColor}>
                                        {statusObj.label}
                                    </Badge>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Title Box */}
                                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                                        Judul Laporan
                                    </span>
                                    <h4 className="text-base font-bold text-gray-900 leading-snug">
                                        {currentReport.title}
                                    </h4>
                                </div>

                                {/* Description */}
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">
                                        Ringkasan / Abstrak
                                    </span>
                                    <div className="p-4 rounded-xl border border-gray-200/70 bg-white text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {currentReport.description || 'Tidak ada deskripsi tambahan.'}
                                    </div>
                                </div>

                                {/* Rejection Note (If any) */}
                                {currentReport.rejection_note && (
                                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-rose-700">
                                            <AlertCircle className="w-4 h-4" />
                                            <span>Catatan Revisi dari Pembimbing</span>
                                        </div>
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap pt-1">
                                            {currentReport.rejection_note}
                                        </p>
                                    </div>
                                )}

                                {/* Uploaded File Card */}
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wide text-gray-400 block mb-2">
                                        Berkas Dokumen
                                    </span>
                                    {currentReport.file_url ? (
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-gray-200 bg-white hover:border-emerald-300 transition-colors shadow-xs">
                                            <div className="flex items-center gap-3.5 min-w-0">
                                                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-gray-900 truncate">
                                                        Berkas Laporan Akhir KP
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                                                        <span>PDF / Dokumen Resmi</span>
                                                        <span>•</span>
                                                        <span className="text-emerald-600 font-medium">Tersimpan di Sistem</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <a
                                                href={currentReport.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors shrink-0 border border-emerald-200/80"
                                            >
                                                <span>Buka Dokumen</span>
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-xl border border-dashed border-gray-300 text-center text-xs text-gray-400">
                                            Berkas fisik belum terunggah
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                                    <span className="text-xs text-gray-400">
                                        Diajukan pada: {formatDateTime(currentReport.created_at)}
                                    </span>

                                    <div className="flex items-center gap-2">
                                        {currentReport.status === 'rejected' && (
                                            <Button
                                                variant="primary"
                                                icon={Upload}
                                                onClick={openEditMode}
                                            >
                                                Upload Dokumen Revisi
                                            </Button>
                                        )}

                                        {currentReport.status === 'pending' && (
                                            <Button
                                                variant="secondary"
                                                icon={FileUp}
                                                onClick={openEditMode}
                                            >
                                                Perbarui Berkas / Laporan
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        /* UPLOAD / EDIT FORM */
                        <Card className="overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <div>
                                    <h3 className="text-base font-bold text-gray-900">
                                        {currentReport ? 'Upload Ulang / Perbarui Laporan' : 'Unggah Laporan Kerja Praktek'}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Pastikan data dan dokumen yang Anda lampirkan sudah sesuai dengan format resmi prodi.
                                    </p>
                                </div>
                                {currentReport && currentReport.status !== 'rejected' && (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={cancelEditMode}
                                    >
                                        Batal Edit
                                    </Button>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                {/* Catatan Dosen jika sedang revisi */}
                                {currentReport?.status === 'rejected' && currentReport.rejection_note && (
                                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
                                        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-rose-700 mb-1">
                                            <AlertCircle className="w-4 h-4" />
                                            <span>Catatan Perbaikan dari Dosen Pembimbing:</span>
                                        </div>
                                        <p className="leading-relaxed whitespace-pre-wrap">
                                            {currentReport.rejection_note}
                                        </p>
                                    </div>
                                )}

                                {/* Judul Input */}
                                <div>
                                    <Input
                                        label="Judul Laporan KP"
                                        value={form.title}
                                        onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                                        placeholder="Contoh: Rancang Bangun Sistem Informasi Logistik pada PT Telkom"
                                        required
                                        error={errors.title}
                                    />
                                    <p className="text-[11px] text-gray-400 mt-1">
                                        Tuliskan judul laporan secara lengkap dan sesuai dengan tema KP Anda.
                                    </p>
                                </div>

                                {/* Deskripsi / Abstrak */}
                                <div>
                                    <Textarea
                                        label="Ringkasan / Abstrak Laporan"
                                        value={form.description}
                                        onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                                        placeholder="Jelaskan secara ringkas latar belakang, sistem atau modul yang dikembangkan, serta hasil dari kegiatan KP..."
                                        rows={4}
                                        error={errors.description}
                                    />
                                    <p className="text-[11px] text-gray-400 mt-1">
                                        Opsional, namun sangat disarankan untuk memudahkan dosen pembimbing memahami isi laporan.
                                    </p>
                                </div>

                                {/* Drag & Drop File Upload Area */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Berkas Dokumen Laporan <span className="text-red-500">*</span>
                                    </label>

                                    {!form.file ? (
                                        <div
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`
                                                relative w-full p-8 border-2 border-dashed rounded-xl cursor-pointer
                                                flex flex-col items-center justify-center text-center
                                                transition-all duration-200
                                                ${
                                                    isDragging
                                                        ? 'border-emerald-500 bg-emerald-50/60 ring-4 ring-emerald-500/10'
                                                        : errors.file
                                                        ? 'border-red-300 bg-red-50/30 hover:border-red-400'
                                                        : 'border-gray-300 hover:border-emerald-400 bg-gray-50/50 hover:bg-emerald-50/20'
                                                }
                                            `}
                                        >
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                className="hidden"
                                                accept=".pdf,.doc,.docx"
                                                onChange={handleFileChange}
                                            />

                                            <div className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow-xs flex items-center justify-center text-emerald-600 mb-3">
                                                <Upload className="w-6 h-6" />
                                            </div>

                                            <p className="text-sm font-bold text-gray-800">
                                                Tarik & lepaskan file laporan ke sini, atau{' '}
                                                <span className="text-emerald-600 underline">Pilih File</span>
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Format didukung: <strong>PDF</strong>, DOC, DOCX (Maksimal 10 MB)
                                            </p>

                                            {currentReport?.file_url && (
                                                <p className="text-xs text-amber-700 mt-3 bg-amber-50 border border-amber-200 px-3 py-1 rounded-md">
                                                    Dokumen sebelumnya sudah tersimpan. Jika tidak ingin mengubah file, biarkan kosong.
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        /* Selected File Card */
                                        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between gap-3 shadow-xs">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold text-xs uppercase">
                                                    {form.file.name.split('.').pop() || 'DOC'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-gray-900 truncate">
                                                        {form.file.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        Ukuran: {formatFileSize(form.file.size)}
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={removeFile}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors shrink-0"
                                                title="Hapus file"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}

                                    {errors.file && (
                                        <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            <span>{errors.file}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Form Actions */}
                                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                                    {currentReport && currentReport.status !== 'rejected' && (
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={cancelEditMode}
                                        >
                                            Batal
                                        </Button>
                                    )}
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        icon={Upload}
                                        loading={submitting || isCreating || isUpdating}
                                        disabled={!form.title.trim() || (!currentReport && !form.file)}
                                    >
                                        {currentReport ? 'Simpan & Upload Laporan' : 'Ajukan Laporan Sekarang'}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    )}
                </div>

                {/* =============================================================
                 * RIGHT COLUMN: CONTEXTUAL SIDEBAR & GUIDELINES
                 * ============================================================= */}
                <div className="space-y-6">
                    {/* CARD 1: INFORMASI KELOMPOK KP */}
                    <Card className="p-5">
                        <div className="flex items-center gap-2 pb-3.5 border-b border-gray-100">
                            <Building2 className="w-4 h-4 text-emerald-600" />
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800">
                                Informasi Kelompok KP
                            </h4>
                        </div>

                        <div className="mt-4 space-y-3.5 text-xs">
                            <div>
                                <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">
                                    Mitra / Perusahaan
                                </span>
                                <p className="font-bold text-gray-900 text-sm">
                                    {group?.kp_company?.name || 'Mitra KP'}
                                </p>
                                {group?.kp_company?.address && (
                                    <p className="text-gray-500 mt-0.5 leading-relaxed">
                                        {group.kp_company.address}
                                    </p>
                                )}
                            </div>

                            <div>
                                <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">
                                    Tema Kajian
                                </span>
                                <p className="font-semibold text-gray-800">
                                    {group?.kp_theme?.title || 'Umum'}
                                </p>
                            </div>

                            <div>
                                <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">
                                    Dosen Pembimbing
                                </span>
                                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50 border border-gray-200/80">
                                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                        <GraduationCap className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-gray-900 truncate">
                                            {supervisorName}
                                        </p>
                                        <p className="text-[10px] text-gray-400">Pembimbing Akademik</p>
                                    </div>
                                </div>
                            </div>

                            {group?.members && group.members.length > 0 && (
                                <div>
                                    <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider mb-1">
                                        Anggota ({group.members.length})
                                    </span>
                                    <div className="space-y-1">
                                        {group.members.map((m) => (
                                            <div
                                                key={m.id || m.student_id}
                                                className="flex items-center justify-between p-1.5 rounded bg-gray-50 text-[11px]"
                                            >
                                                <span className="font-medium text-gray-800 truncate mr-2">
                                                    {m.student?.user?.name || m.student?.name || 'Mahasiswa'}
                                                </span>
                                                <span
                                                    className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold ${
                                                        m.role === 'ketua'
                                                            ? 'bg-amber-100 text-amber-800'
                                                            : 'bg-gray-200 text-gray-600'
                                                    }`}
                                                >
                                                    {m.role}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* CARD 2: ALUR TAHAPAN PENGESAHAN */}
                    <Card className="p-5">
                        <div className="flex items-center gap-2 pb-3.5 border-b border-gray-100">
                            <Clock className="w-4 h-4 text-emerald-600" />
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800">
                                Alur Tahapan Laporan
                            </h4>
                        </div>

                        <div className="mt-4 relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 text-xs">
                            <div className="relative">
                                <div
                                    className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                        currentReport
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-emerald-500 text-white ring-2 ring-emerald-200 animate-pulse'
                                    }`}
                                >
                                    {currentReport ? <Check className="w-3 h-3" /> : '1'}
                                </div>
                                <p className="font-bold text-gray-800">1. Unggah Laporan</p>
                                <p className="text-gray-500 text-[11px] mt-0.5">
                                    Mahasiswa mengunggah berkas laporan akhir KP.
                                </p>
                            </div>

                            <div className="relative">
                                <div
                                    className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                        currentReport?.status === 'approved'
                                            ? 'bg-emerald-600 text-white'
                                            : currentReport?.status === 'pending'
                                            ? 'bg-amber-500 text-white ring-2 ring-amber-200 animate-pulse'
                                            : 'bg-gray-100 text-gray-400 border border-gray-300'
                                    }`}
                                >
                                    {currentReport?.status === 'approved' ? <Check className="w-3 h-3" /> : '2'}
                                </div>
                                <p className="font-bold text-gray-800">2. Review Pembimbing</p>
                                <p className="text-gray-500 text-[11px] mt-0.5">
                                    Dosen memeriksa dan memberikan catatan/persetujuan.
                                </p>
                            </div>

                            <div className="relative">
                                <div
                                    className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                        currentReport?.status === 'approved'
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-gray-100 text-gray-400 border border-gray-300'
                                    }`}
                                >
                                    3
                                </div>
                                <p className="font-bold text-gray-800">3. Penilaian Akhir</p>
                                <p className="text-gray-500 text-[11px] mt-0.5">
                                    Setelah disetujui, kelompok masuk ke tahap penilaian KP.
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* CARD 3: PETUNJUK & SYARAT BERKAS */}
                    <Card className="p-5 bg-gradient-to-br from-emerald-50/50 to-white border-emerald-100">
                        <div className="flex items-center gap-2 pb-3 border-b border-emerald-100">
                            <Info className="w-4 h-4 text-emerald-600" />
                            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                                Panduan Berkas Laporan
                            </h4>
                        </div>

                        <ul className="mt-3.5 space-y-2 text-xs text-slate-600 leading-relaxed list-disc list-inside">
                            <li>
                                Format berkas yang didukung adalah <strong>PDF</strong>, DOC, atau DOCX.
                            </li>
                            <li>
                                Ukuran berkas maksimal adalah <strong>10 MB</strong>.
                            </li>
                            <li>
                                Pastikan halaman pengesahan telah ditandatangani oleh pembimbing lapangan di instansi mitra.
                            </li>
                            <li>
                                Logbook harian wajib diisi lengkap sebelum mengajukan laporan final.
                            </li>
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Laporan;
