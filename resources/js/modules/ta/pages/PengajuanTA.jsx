import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useGetPengajuanQuery, useCreatePengajuanMutation } from '../api/taApi';
import { handleApiError, handleApiSuccess } from '../../shared/api/errorHandler';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Skeleton from '../../../components/ui/Skeleton';
import Input from '../../../components/ui/Input';
import Textarea from '../../../components/ui/Textarea';
import { 
    GraduationCap, Clock, CheckCircle2, XCircle, BookOpen, 
    FileText, User, Calendar, MessageSquare, AlertTriangle, ArrowRight, Check
} from 'lucide-react';

// ─── TA Stepper / Progress Steps ─────────────────────────────────────────────
const TA_STEPS = [
    { key: 'pengajuan', label: 'Pengajuan Judul', icon: BookOpen, desc: 'Pemeriksaan judul oleh Koordinator' },
    { key: 'bimbingan', label: 'Bimbingan', icon: FileText, desc: 'Bimbingan bersama Dosen Pembimbing' },
    { key: 'sidang', label: 'Sidang TA', icon: Clock, desc: 'Pendaftaran & pelaksanaan ujian' },
    { key: 'lulus', label: 'Kelulusan', icon: CheckCircle2, desc: 'Selesai & masuk Repository' },
];

const getStepStatus = (currentStatus, stepKey) => {
    const statusMap = {
        'pengajuan': 1,
        'revisi_judul': 1,
        'bimbingan': 2,
        'daftar_sidang': 3,
        'ujian_berlangsung': 3,
        'revisi_sidang': 3,
        'lulus': 4,
    };
    
    const currentIndex = statusMap[currentStatus] || 1;
    const stepMap = {
        'pengajuan': 1,
        'bimbingan': 2,
        'sidang': 3,
        'lulus': 4,
    };
    const stepIndex = stepMap[stepKey];
    
    if (currentIndex > stepIndex) return 'completed';
    if (currentIndex === stepIndex) {
        if (currentStatus === 'revisi_judul') return 'rejected';
        return 'active';
    }
    return 'pending';
};

const TAProgressTracker = ({ status }) => {
    return (
        <div className="flex items-start mb-8 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            {TA_STEPS.map((step, idx) => {
                const stepStatus = getStepStatus(status, step.key);
                const isLast = idx === TA_STEPS.length - 1;
                
                return (
                    <React.Fragment key={step.key}>
                        <div className="flex flex-col items-center shrink-0 w-24 sm:w-32">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                                stepStatus === 'completed' 
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : stepStatus === 'active'
                                    ? 'bg-white border-emerald-600 text-emerald-600 font-semibold ring-4 ring-emerald-50'
                                    : stepStatus === 'rejected'
                                    ? 'bg-red-500 border-red-500 text-white'
                                    : 'bg-white border-gray-200 text-gray-400'
                            }`}>
                                {stepStatus === 'completed' ? (
                                    <Check className="w-5 h-5" />
                                ) : stepStatus === 'rejected' ? (
                                    <XCircle className="w-5 h-5" />
                                ) : (
                                    <step.icon className="w-4 h-4" />
                                )}
                            </div>
                            <p className={`mt-2 text-xs font-semibold text-center leading-tight ${
                                stepStatus === 'completed' 
                                    ? 'text-emerald-600'
                                    : stepStatus === 'active'
                                    ? 'text-emerald-700 font-bold'
                                    : stepStatus === 'rejected'
                                    ? 'text-red-600 font-bold'
                                    : 'text-gray-400'
                            }`}>{step.label}</p>
                            <p className="hidden sm:block text-[10px] text-gray-400 text-center mt-1 leading-normal max-w-[110px]">
                                {step.desc}
                            </p>
                        </div>
                        {!isLast && (
                            <div className={`flex-1 h-0.5 mt-5 transition-all ${
                                stepStatus === 'completed' ? 'bg-emerald-500' : 'bg-gray-200'
                            }`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

// ─── Status Config for badge ──────────────────────────────────────────────────
const STATUS_CONFIG = {
    pengajuan:    { label: 'Menunggu Verifikasi', color: 'yellow' },
    revisi_judul: { label: 'Perlu Revisi Judul',  color: 'red' },
    bimbingan:    { label: 'Bimbingan Aktif',      color: 'emerald' },
    daftar_sidang:    { label: 'Daftar Sidang',     color: 'blue' },
    ujian_berlangsung:{ label: 'Ujian Berlangsung', color: 'purple' },
    revisi_sidang:    { label: 'Revisi Sidang',     color: 'orange' },
    lulus:        { label: 'Lulus',               color: 'green' },
};

const getStatusBadge = (status) => {
    const cfg = STATUS_CONFIG[status] || { label: status, color: 'gray' };
    return <Badge status={cfg.color}>{cfg.label}</Badge>;
};

// ─── Main Component ───────────────────────────────────────────────────────────
const PengajuanTA = () => {
    const [form, setForm] = useState({ title: '', description: '' });
    const [showForm, setShowForm] = useState(false);

    const { data, isLoading } = useGetPengajuanQuery();
    const [createPengajuan, { isLoading: isSaving }] = useCreatePengajuanMutation();

    const pengajuan = data?.data && typeof data.data === 'object' && !Array.isArray(data.data) && data.data.id ? data.data : null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        try {
            await createPengajuan(form).unwrap();
            handleApiSuccess('Pengajuan Tugas Akhir berhasil dikirim.');
            setShowForm(false);
            setForm({ title: '', description: '' });
        } catch (err) {
            handleApiError(err, 'Gagal mengirim pengajuan.');
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton height={40} width={250} />
                <Skeleton height={120} />
                <Skeleton height={200} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Pengajuan Tugas Akhir"
                description="Ajukan judul Tugas Akhir dan pantau progres verifikasi akademik Anda"
                icon={GraduationCap}
            />

            {/* Jika sudah mengajukan, tampilkan tracking alur progres */}
            {pengajuan && <TAProgressTracker status={pengajuan.status} />}

            {/* Tampilan Detail Status Pengajuan */}
            {pengajuan && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="p-6">
                            <div className="flex justify-between items-start gap-4 border-b border-gray-100 pb-4 mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                        Informasi Tugas Akhir
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Diajukan pada tanggal: {pengajuan.created_at ? new Date(pengajuan.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'}
                                    </p>
                                </div>
                                <div className="shrink-0">{getStatusBadge(pengajuan.status)}</div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Judul TA</p>
                                    <p className="text-sm font-semibold text-gray-800 mt-1 bg-gray-50 p-3 rounded-lg border border-gray-200/50">
                                        {pengajuan.title}
                                    </p>
                                </div>

                                {pengajuan.description && (
                                    <div>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Latar Belakang Singkat</p>
                                        <p className="text-sm text-gray-700 mt-1 bg-gray-50 p-3 rounded-lg border border-gray-200/50 whitespace-pre-line leading-relaxed">
                                            {pengajuan.description}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        {/* Status Catatan Penolakan / Revisi */}
                        {pengajuan.status === 'revisi_judul' && (
                            <Card className="p-6 border-red-200 bg-red-50/50">
                                <div className="flex items-center gap-2 text-red-700 mb-3">
                                    <AlertTriangle className="w-5 h-5 shrink-0" />
                                    <h4 className="font-bold text-sm">Perlu Revisi Judul</h4>
                                </div>
                                <p className="text-xs text-red-800 leading-relaxed bg-white border border-red-200 rounded-lg p-3">
                                    {pengajuan.catatan_penolakan || 'Silakan hubungi koordinator untuk informasi lebih lanjut.'}
                                </p>
                                <div className="mt-4">
                                    <Button 
                                        variant="danger" 
                                        className="w-full justify-center"
                                        onClick={() => {
                                            setForm({ title: pengajuan.title, description: pengajuan.description ?? '' });
                                            setShowForm(true);
                                        }}
                                    >
                                        Revisi & Ajukan Ulang
                                    </Button>
                                </div>
                            </Card>
                        )}

                        {/* Catatan / Notes Koordinator (Approved) */}
                        {pengajuan.status !== 'revisi_judul' && pengajuan.notes && (
                            <Card className="p-6">
                                <div className="flex items-center gap-2 text-gray-700 mb-3">
                                    <MessageSquare className="w-4 h-4 shrink-0 text-emerald-600" />
                                    <h4 className="font-bold text-sm">Catatan Verifikator</h4>
                                </div>
                                <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-3 border border-gray-100">
                                    {pengajuan.catatan_penolakan}
                                </p>
                            </Card>
                        )}

                        {/* Dosen Pembimbing Panel */}
                        <Card className="p-6">
                            <h4 className="font-bold text-sm text-gray-900 mb-4 flex items-center gap-2">
                                <User className="w-4 h-4 text-emerald-600" />
                                Dosen Pembimbing
                            </h4>
                            {pengajuan.dosen_pembimbing?.[0]?.dosen ? (
                                <div className="flex items-center gap-3 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                                        {pengajuan.dosen_pembimbing[0].dosen.user?.name ? pengajuan.dosen_pembimbing[0].dosen.user.name[0] : 'D'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">{pengajuan.dosen_pembimbing[0].dosen.user?.name ?? '-'}</p>
                                        <p className="text-[10px] text-gray-500 font-mono">NIP. {pengajuan.dosen_pembimbing[0].dosen.nip ?? '-'}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                    <Clock className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                                    <p className="text-xs text-gray-500">Menunggu penetapan dosen pembimbing oleh Koordinator</p>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            )}

            {/* Form pendaftaran judul baru */}
            {!pengajuan && !showForm && (
                <div className="flex flex-col items-center justify-center bg-white p-12 rounded-xl border border-gray-100 shadow-sm max-w-xl mx-auto">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4 ring-8 ring-emerald-50/50">
                        <GraduationCap className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                        Belum Mengajukan Judul
                    </h3>
                    <p className="text-sm text-gray-500 text-center mb-6 max-w-sm">
                        Anda belum terdaftar dalam modul Tugas Akhir. Silakan ajukan judul proposal Tugas Akhir Anda untuk memulai proses akademik.
                    </p>
                    <Button variant="primary" className="px-6 py-2.5" onClick={() => setShowForm(true)}>
                        Mulai Pengajuan Judul
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            )}

            {showForm && (
                <Card className="max-w-2xl mx-auto p-6">
                    <div className="border-b border-gray-100 pb-4 mb-6">
                        <h3 className="text-lg font-bold text-gray-900">
                            {pengajuan ? 'Ajukan Ulang Judul Tugas Akhir' : 'Formulir Pengajuan Judul TA'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            Tuliskan judul dan penjelasan singkat mengenai latar belakang atau gambaran umum topik penelitian Anda.
                        </p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            id="ta-title"
                            label="Judul Tugas Akhir"
                            value={form.title}
                            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                            required
                            placeholder="Contoh: Rancang Bangun Sistem Informasi Tugas Akhir Berbasis Web..."
                        />
                        <Textarea
                            id="ta-description"
                            label="Latar Belakang Singkat & Deskripsi Masalah"
                            value={form.description}
                            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                            rows={6}
                            placeholder="Deskripsikan latar belakang, tujuan, serta metodologi secara singkat..."
                        />
                        
                        <div className="flex gap-3 justify-end border-t border-gray-100 pt-4 mt-6">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setShowForm(false)}
                                disabled={isSaving}
                            >
                                Batal
                            </Button>
                            <Button type="submit" variant="primary" disabled={isSaving}>
                                {isSaving ? 'Mengirim...' : 'Kirim Pengajuan'}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}
        </div>
    );
};

export default PengajuanTA;
