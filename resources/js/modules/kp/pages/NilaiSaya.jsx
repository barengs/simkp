import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useGetKpGradeQuery } from '../api/kpApi';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Skeleton from '../../../components/ui/Skeleton';
import {
    Award,
    CheckCircle2,
    Clock,
    Building2,
    Users,
    BookOpen,
    Trophy,
    FileText,
    Calendar,
    GraduationCap,
    Printer,
    ArrowRight,
    Sparkles,
    Check,
    MessageSquareQuote,
    Phone,
    Mail,
    FileCheck2,
} from 'lucide-react';

const GRADE_CONFIG = {
    A: {
        label: 'Sangat Memuaskan',
        statusText: 'Lulus dengan Pujian',
        badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        heroBadge: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/25',
        barColor: 'bg-emerald-500',
        textColor: 'text-emerald-700',
    },
    B: {
        label: 'Memuaskan',
        statusText: 'Lulus Memuaskan',
        badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
        heroBadge: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/25',
        barColor: 'bg-blue-600',
        textColor: 'text-blue-700',
    },
    C: {
        label: 'Cukup',
        statusText: 'Lulus Cukup',
        badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
        heroBadge: 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-amber-500/25',
        barColor: 'bg-amber-500',
        textColor: 'text-amber-700',
    },
    D: {
        label: 'Kurang',
        statusText: 'Lulus Bersyarat',
        badgeBg: 'bg-orange-50 text-orange-800 border-orange-200',
        heroBadge: 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-orange-500/25',
        barColor: 'bg-orange-500',
        textColor: 'text-orange-700',
    },
    E: {
        label: 'Tidak Lulus',
        statusText: 'Tidak Lulus',
        badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
        heroBadge: 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-rose-500/25',
        barColor: 'bg-rose-500',
        textColor: 'text-rose-700',
    },
};

const NilaiSaya = () => {
    const navigate = useNavigate();
    const authUser = useSelector(s => s.auth.user);
    const [selectedGradeIndex, setSelectedGradeIndex] = useState(0);

    const { data: gradesRaw, isLoading, refetch } = useGetKpGradeQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });

    const grades = useMemo(() => {
        if (Array.isArray(gradesRaw)) return gradesRaw;
        if (Array.isArray(gradesRaw?.data)) return gradesRaw.data;
        return [];
    }, [gradesRaw]);

    // Ambil data nilai yang sedang aktif dipilih (biasanya indeks 0)
    const currentGrade = grades[selectedGradeIndex] || grades[0] || null;

    // Hitung rata-rata nilai
    const gradeSummary = useMemo(() => {
        if (!currentGrade) return null;

        const scores = [
            currentGrade.score_field !== null && currentGrade.score_field !== undefined ? Number(currentGrade.score_field) : null,
            currentGrade.score_report !== null && currentGrade.score_report !== undefined ? Number(currentGrade.score_report) : null,
            currentGrade.score_seminar !== null && currentGrade.score_seminar !== undefined ? Number(currentGrade.score_seminar) : null,
        ].filter(v => v !== null && !isNaN(v));

        const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : null;
        const letter = currentGrade.final_grade || null;
        const config = letter ? GRADE_CONFIG[letter] : null;

        return {
            avg,
            letter,
            config,
            isFinished: !!letter,
        };
    }, [currentGrade]);

    // Data kelompok dan mitra
    const member = currentGrade?.kp_group_member;
    const group = member?.kp_group;
    const company = group?.kp_company;
    const period = group?.academic_period;
    const theme = group?.kp_theme;
    const supervisor = member?.supervisor || group?.members?.find(m => m.supervisor)?.supervisor;
    const members = group?.members || [];

    // Cek apakah mahasiswa memiliki kelompok aktif jika belum ada grade record
    const studentGroupMember = useMemo(() => {
        const list = authUser?.student?.kp_group_members || [];
        return list.find(m => m.member_status === 'active') || list[0] || null;
    }, [authUser]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header Halaman */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
                <PageHeader
                    title="Nilai Kerja Praktek Saya"
                    description="Ringkasan hasil evaluasi dan nilai resmi Kerja Praktek Anda"
                    icon={Award}
                />
                {gradeSummary?.isFinished && (
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <Button
                            variant="secondary"
                            icon={Printer}
                            size="sm"
                            onClick={handlePrint}
                        >
                            Cetak Bukti Nilai
                        </Button>
                    </div>
                )}
            </div>

            {/* Pilihan Periode jika Mahasiswa memiliki lebih dari 1 riwayat KP */}
            {grades.length > 1 && (
                <div className="flex items-center gap-2 bg-white p-2 rounded-md border border-gray-200 w-fit print:hidden">
                    <span className="text-xs font-semibold text-gray-500 px-2">Riwayat KP:</span>
                    {grades.map((g, idx) => (
                        <button
                            key={g.id}
                            type="button"
                            onClick={() => setSelectedGradeIndex(idx)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                                selectedGradeIndex === idx
                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {g.kp_group_member?.kp_group?.academic_period?.name || `KP #${idx + 1}`}
                        </button>
                    ))}
                </div>
            )}

            {/* Loading State */}
            {isLoading ? (
                <div className="space-y-4">
                    <Card>
                        <div className="p-6 space-y-4">
                            <Skeleton className="h-8 w-1/3 rounded-md" />
                            <Skeleton className="h-24 w-full rounded-md" />
                            <div className="grid grid-cols-3 gap-4 pt-4">
                                <Skeleton className="h-20 rounded-md" />
                                <Skeleton className="h-20 rounded-md" />
                                <Skeleton className="h-20 rounded-md" />
                            </div>
                        </div>
                    </Card>
                </div>
            ) : currentGrade && gradeSummary?.isFinished ? (
                /* =========================================================================
                   TAMPILAN 1: NILAI TELAH RESMI DITERBITKAN
                   ========================================================================= */
                <div className="space-y-6">
                    {/* Hero Card Hasil Nilai Akhir */}
                    <Card className="overflow-hidden border border-gray-200/90 shadow-sm rounded-md">
                        {/* Banner Atas */}
                        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-800 text-white p-6 sm:p-7">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-2.5">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                        <span>Nilai Resmi Telah Diterbitkan</span>
                                    </div>

                                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                                        <Building2 className="w-6 h-6 text-emerald-400 shrink-0" />
                                        <span>{company?.name || 'Instansi Mitra KP'}</span>
                                    </h2>

                                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-300">
                                        <span className="font-mono bg-slate-700/60 px-2 py-0.5 rounded-sm text-slate-200">
                                            Kelompok #{group?.id || '-'}
                                        </span>
                                        <span>•</span>
                                        <span>{period?.name || '-'}</span>
                                        {theme?.title && (
                                            <>
                                                <span>•</span>
                                                <span className="text-slate-300 italic">{theme.title}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Kotak Nilai Besar */}
                                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-md border border-white/15 self-start md:self-auto shrink-0 shadow-inner">
                                    <div className="text-right">
                                        <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider block">
                                            Skor Rata-rata
                                        </span>
                                        <div className="flex items-baseline justify-end gap-1">
                                            <span className="text-3xl font-black text-white">
                                                {gradeSummary.avg || '-'}
                                            </span>
                                            <span className="text-xs text-slate-400">/ 100</span>
                                        </div>
                                        <span className="text-xs font-medium text-emerald-300 block mt-0.5">
                                            {gradeSummary.config?.label}
                                        </span>
                                    </div>

                                    <div className={`w-16 h-16 rounded-md flex items-center justify-center font-black text-3xl shadow-lg border border-white/20 shrink-0 ${gradeSummary.config?.heroBadge}`}>
                                        {gradeSummary.letter}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rincian Tambahan di Bawah Banner */}
                        <div className="bg-slate-50/80 px-6 py-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
                            <div className="flex items-center gap-2">
                                <GraduationCap className="w-4 h-4 text-slate-400" />
                                <span>Dosen Pembimbing:</span>
                                <span className="font-semibold text-slate-800">
                                    {supervisor?.user?.name || supervisor?.name || 'Dosen Pembimbing'}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 font-medium text-emerald-700">
                                <Trophy className="w-4 h-4 text-emerald-600" />
                                <span>Status: {gradeSummary.config?.statusText}</span>
                            </div>
                        </div>
                    </Card>

                    {/* 3 Komponen Nilai Rinci */}
                    <div>
                        <div className="flex items-center justify-between mb-3 px-1">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                                <span>Rincian Komponen Nilai</span>
                            </h3>
                            <span className="text-xs text-gray-500">
                                Formula: (Nilai Lapangan + Laporan + Seminar) ÷ 3
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Komponen 1: Lapangan */}
                            <Card className="p-4.5 border border-gray-200 hover:border-gray-300 transition-all shadow-2xs rounded-md">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="space-y-0.5">
                                        <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-sm border border-blue-200 uppercase tracking-wide">
                                            Komponen 1
                                        </span>
                                        <h4 className="text-base font-bold text-gray-900 pt-1">Nilai Lapangan</h4>
                                        <p className="text-xs text-gray-500">Pembimbing Instansi / Mitra</p>
                                    </div>
                                    <div className="w-9 h-9 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                                        <Building2 className="w-4.5 h-4.5" />
                                    </div>
                                </div>

                                <div className="mt-3.5 pt-3 border-t border-gray-100">
                                    <div className="flex items-baseline justify-between mb-2">
                                        <span className="text-xs text-gray-500 font-medium">Skor Perolehan:</span>
                                        <span className="text-2xl font-black text-gray-900">
                                            {currentGrade.score_field !== null ? Number(currentGrade.score_field).toFixed(1) : '-'}
                                        </span>
                                    </div>
                                    {/* Progress Bar Visual */}
                                    <div className="w-full h-2 bg-gray-100 rounded-sm overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-sm transition-all duration-500"
                                            style={{ width: `${Math.min(100, Math.max(0, Number(currentGrade.score_field || 0)))}%` }}
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-500 mt-2">
                                        Evaluasi etika, kedisiplinan, dan kontribusi kerja di instansi.
                                    </p>
                                </div>
                            </Card>

                            {/* Komponen 2: Laporan */}
                            <Card className="p-4.5 border border-gray-200 hover:border-gray-300 transition-all shadow-2xs rounded-md">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="space-y-0.5">
                                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-200 uppercase tracking-wide">
                                            Komponen 2
                                        </span>
                                        <h4 className="text-base font-bold text-gray-900 pt-1">Nilai Laporan</h4>
                                        <p className="text-xs text-gray-500">Naskah Laporan Akhir KP</p>
                                    </div>
                                    <div className="w-9 h-9 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                                        <FileText className="w-4.5 h-4.5" />
                                    </div>
                                </div>

                                <div className="mt-3.5 pt-3 border-t border-gray-100">
                                    <div className="flex items-baseline justify-between mb-2">
                                        <span className="text-xs text-gray-500 font-medium">Skor Perolehan:</span>
                                        <span className="text-2xl font-black text-gray-900">
                                            {currentGrade.score_report !== null ? Number(currentGrade.score_report).toFixed(1) : '-'}
                                        </span>
                                    </div>
                                    {/* Progress Bar Visual */}
                                    <div className="w-full h-2 bg-gray-100 rounded-sm overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500 rounded-sm transition-all duration-500"
                                            style={{ width: `${Math.min(100, Math.max(0, Number(currentGrade.score_report || 0)))}%` }}
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-500 mt-2">
                                        Evaluasi kualitas tata tulis, kedalaman kajian, dan lampiran.
                                    </p>
                                </div>
                            </Card>

                            {/* Komponen 3: Seminar */}
                            <Card className="p-4.5 border border-gray-200 hover:border-gray-300 transition-all shadow-2xs rounded-md">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="space-y-0.5">
                                        <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-sm border border-purple-200 uppercase tracking-wide">
                                            Komponen 3
                                        </span>
                                        <h4 className="text-base font-bold text-gray-900 pt-1">Nilai Seminar</h4>
                                        <p className="text-xs text-gray-500">Presentasi & Sidang KP</p>
                                    </div>
                                    <div className="w-9 h-9 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                                        <Award className="w-4.5 h-4.5" />
                                    </div>
                                </div>

                                <div className="mt-3.5 pt-3 border-t border-gray-100">
                                    <div className="flex items-baseline justify-between mb-2">
                                        <span className="text-xs text-gray-500 font-medium">Skor Perolehan:</span>
                                        <span className="text-2xl font-black text-gray-900">
                                            {currentGrade.score_seminar !== null ? Number(currentGrade.score_seminar).toFixed(1) : '-'}
                                        </span>
                                    </div>
                                    {/* Progress Bar Visual */}
                                    <div className="w-full h-2 bg-gray-100 rounded-sm overflow-hidden">
                                        <div
                                            className="h-full bg-purple-500 rounded-sm transition-all duration-500"
                                            style={{ width: `${Math.min(100, Math.max(0, Number(currentGrade.score_seminar || 0)))}%` }}
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-500 mt-2">
                                        Evaluasi penguasaan materi, teknik presentasi, dan tanya jawab.
                                    </p>
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Catatan / Feedback Dosen Pembimbing (jika ada) */}
                    {currentGrade.notes && (
                        <Card className="p-5 bg-gradient-to-br from-amber-50/60 to-white border border-amber-200/80 shadow-2xs rounded-md">
                            <div className="flex items-start gap-3.5">
                                <div className="w-9 h-9 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                                    <MessageSquareQuote className="w-4.5 h-4.5" />
                                </div>
                                <div className="space-y-1.5 flex-1">
                                    <h4 className="text-sm font-bold text-amber-950">
                                        Catatan & Masukan Dosen Pembimbing
                                    </h4>
                                    <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed italic">
                                        "{currentGrade.notes}"
                                    </p>
                                    <p className="text-xs text-gray-500 pt-1 font-medium">
                                        — {supervisor?.user?.name || supervisor?.name || 'Dosen Pembimbing KP'}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Informasi Tim Kelompok */}
                    <Card className="p-5 border border-gray-200 rounded-md">
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <Users className="w-4 h-4 text-emerald-600" />
                                <span>Anggota Kelompok Kerja Praktek ({members.length})</span>
                            </h4>
                            <span className="text-xs text-gray-500 font-mono">
                                Kelompok #{group?.id || '-'}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {members.map(m => (
                                <div
                                    key={m.id}
                                    className={`p-3 rounded-md border flex items-center justify-between ${
                                        m.student_id === authUser?.student?.id
                                            ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-500/20'
                                            : 'bg-gray-50/80 border-gray-200'
                                    }`}
                                >
                                    <div className="truncate">
                                        <div className="text-sm font-semibold text-gray-900 truncate">
                                            {m.student?.user?.name || m.student?.name || '-'}
                                        </div>
                                        <div className="text-xs text-gray-500 font-mono">
                                            NIM: {m.student?.nim || '-'}
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm shrink-0 ${
                                        m.role === 'ketua'
                                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                            : 'bg-gray-200 text-gray-700'
                                    }`}>
                                        {m.role === 'ketua' ? 'Ketua' : 'Anggota'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            ) : currentGrade && !gradeSummary?.isFinished ? (
                /* =========================================================================
                   TAMPILAN 2: DALAM PROSES (BELUM DITERBITKAN DOSEN)
                   ========================================================================= */
                <Card className="p-7 text-center max-w-2xl mx-auto border border-gray-200 shadow-sm rounded-md">
                    <div className="w-14 h-14 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
                        <Clock className="w-7 h-7 animate-pulse" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Nilai KP Sedang Dalam Proses
                    </h3>

                    <p className="text-sm text-gray-600 mb-6 leading-relaxed max-w-lg mx-auto">
                        Laporan Akhir Kerja Praktek Anda telah disetujui. Saat ini Dosen Pembimbing sedang melakukan penginputan dan verifikasi komponen nilai akhir.
                    </p>

                    {/* Info Mitra & Dosen */}
                    <div className="bg-slate-50 border border-slate-200 rounded-md p-4 text-left mb-6 space-y-2 text-xs">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                            <span className="text-gray-500">Instansi / Mitra:</span>
                            <span className="font-semibold text-gray-900">{company?.name || '-'}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                            <span className="text-gray-500">Dosen Pembimbing:</span>
                            <span className="font-semibold text-gray-900">
                                {supervisor?.user?.name || supervisor?.name || 'Dosen Pembimbing'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">Status Tahapan:</span>
                            <span className="font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-sm">
                                Menunggu Input Nilai
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-center gap-3">
                        <Button
                            variant="secondary"
                            onClick={() => refetch()}
                        >
                            Perbarui Status
                        </Button>
                        <Button
                            variant="primary"
                            icon={ArrowRight}
                            onClick={() => navigate('/kp/laporan')}
                        >
                            Lihat Laporan KP
                        </Button>
                    </div>
                </Card>
            ) : studentGroupMember ? (
                /* =========================================================================
                   TAMPILAN 3: MAHASISWA MEMILIKI KELOMPOK, TAPI BELUM MASUK TAHAP PENILAIAN
                   ========================================================================= */
                <Card className="p-7 text-center max-w-xl mx-auto border border-gray-200 shadow-sm rounded-md">
                    <div className="w-12 h-12 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-200">
                        <BookOpen className="w-6 h-6" />
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Kerja Praktek Masih Berjalan
                    </h3>

                    <p className="text-xs text-gray-600 leading-relaxed mb-6">
                        Nilai Kerja Praktek akan tersedia di halaman ini setelah Anda menyelesaikan bimbingan logbook dan mengunggah Laporan Akhir yang disetujui oleh Dosen Pembimbing.
                    </p>

                    <div className="flex justify-center gap-3">
                        <Button
                            variant="secondary"
                            onClick={() => navigate('/kp/logbook')}
                        >
                            Buka Logbook
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/kp/laporan')}
                        >
                            Unggah Laporan KP
                        </Button>
                    </div>
                </Card>
            ) : (
                /* =========================================================================
                   TAMPILAN 4: BELUM MENDAFTAR KP
                   ========================================================================= */
                <Card className="p-7 text-center max-w-md mx-auto border border-gray-200 shadow-sm rounded-md">
                    <div className="w-12 h-12 rounded-md bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-4">
                        <Award className="w-6 h-6" />
                    </div>

                    <h3 className="text-base font-bold text-gray-900 mb-2">
                        Belum Terdaftar Kerja Praktek
                    </h3>

                    <p className="text-xs text-gray-500 mb-6">
                        Anda belum memiliki pendaftaran aktif pada program Kerja Praktek.
                    </p>

                    <Button
                        variant="primary"
                        onClick={() => navigate('/kp/pendaftaran-kelompok')}
                    >
                        Daftar Kerja Praktek
                    </Button>
                </Card>
            )}
        </div>
    );
};

export default NilaiSaya;
