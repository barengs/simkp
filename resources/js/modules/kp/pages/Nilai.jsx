import React, { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    useGetSupervisedGroupsQuery,
    useGetKpGradeQuery,
    useCreateGroupGradeMutation,
} from '../api/kpApi';
import { handleApiError, handleApiSuccess } from '../../shared/api/errorHandler';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Skeleton from '../../../components/ui/Skeleton';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Textarea from '../../../components/ui/Textarea';
import DataTableWrapper from '../../../components/ui/DataTableWrapper';
import Statistik from '../../../components/ui/Statistik';
import {
    Award,
    CheckCircle2,
    Users,
    Clock,
    Search,
    Building2,
    FileText,
    Download,
    Sparkles,
    Filter,
    RotateCcw,
    X,
    Check,
    AlertCircle,
    GraduationCap,
    Calendar,
} from 'lucide-react';

// Predikat dan warna huruf mutu
const GRADE_CONFIG = {
    A: { label: 'Sangat Memuaskan', color: 'emerald', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    B: { label: 'Memuaskan', color: 'blue', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
    C: { label: 'Cukup', color: 'amber', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
    D: { label: 'Kurang', color: 'orange', bg: 'bg-orange-50 text-orange-700 border-orange-200' },
    E: { label: 'Tidak Lulus', color: 'rose', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
};

const Nilai = () => {
    const authUser = useSelector(s => s.auth.user);
    const [search, setSearch] = useState('');
    const [filterTab, setFilterTab] = useState('all'); // 'all' | 'pending' | 'graded'
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [showGradeModal, setShowGradeModal] = useState(false);
    const [gradeForm, setGradeForm] = useState({
        score_field: '',
        score_report: '',
        score_seminar: '',
        notes: '',
    });
    const [gradeErrors, setGradeErrors] = useState({});

    // RTK Query hooks dengan auto-refetch
    const {
        data: groupsRaw,
        isLoading: isLoadingGroups,
        refetch: refetchGroups,
    } = useGetSupervisedGroupsQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });

    const {
        data: gradesRaw,
        refetch: refetchGrades,
    } = useGetKpGradeQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });

    const [createGroupGrade, { isLoading: isCreatingGrade }] = useCreateGroupGradeMutation();

    useEffect(() => {
        refetchGroups();
        refetchGrades();
    }, [refetchGroups, refetchGrades]);

    // Data kelompok dan nilai
    const groups = useMemo(() => {
        if (Array.isArray(groupsRaw)) return groupsRaw;
        if (Array.isArray(groupsRaw?.data)) return groupsRaw.data;
        return [];
    }, [groupsRaw]);

    const grades = useMemo(() => {
        if (Array.isArray(gradesRaw)) return gradesRaw;
        if (Array.isArray(gradesRaw?.data)) return gradesRaw.data;
        return [];
    }, [gradesRaw]);

    // Helper untuk mengambil seluruh nilai anggota dari suatu kelompok
    const getGroupGrades = (groupId) => {
        return grades.filter(g => {
            const member = g.kp_group_member;
            return member?.kp_group?.id === groupId || member?.kp_group_id === groupId;
        });
    };

    // Helper informasi grading kelompok
    const getGroupGradingInfo = (groupId) => {
        const groupGrades = getGroupGrades(groupId);
        const validGrades = groupGrades.filter(g => g.final_grade);
        const isGraded = validGrades.length > 0;
        const firstGrade = validGrades[0] || groupGrades[0];

        let avgScore = null;
        if (firstGrade) {
            const scores = [firstGrade.score_field, firstGrade.score_report, firstGrade.score_seminar]
                .filter(v => v !== null && v !== undefined && v !== '');
            if (scores.length > 0) {
                avgScore = (scores.reduce((a, b) => Number(a) + Number(b), 0) / scores.length).toFixed(2);
            }
        }

        const finalGrade = firstGrade?.final_grade || null;

        return {
            isGraded,
            finalGrade,
            gradeConfig: finalGrade ? GRADE_CONFIG[finalGrade] : null,
            scoreField: firstGrade?.score_field ?? null,
            scoreReport: firstGrade?.score_report ?? null,
            scoreSeminar: firstGrade?.score_seminar ?? null,
            notes: firstGrade?.notes ?? '',
            avgScore,
        };
    };

    // Kalkulasi stats ringkasan
    const { gradedCount, pendingCount } = useMemo(() => {
        let graded = 0;
        let pending = 0;
        groups.forEach(g => {
            const info = getGroupGradingInfo(g.id);
            if (info.isGraded) {
                graded++;
            } else {
                pending++;
            }
        });
        return { gradedCount: graded, pendingCount: pending };
    }, [groups, grades]);

    // Filter kelompok berdasarkan Tab & Pencarian
    const filteredGroups = useMemo(() => {
        return groups.filter(group => {
            const info = getGroupGradingInfo(group.id);

            // Filter status tab
            if (filterTab === 'pending' && info.isGraded) return false;
            if (filterTab === 'graded' && !info.isGraded) return false;

            // Search query
            if (!search.trim()) return true;
            const q = search.toLowerCase();
            const matchCompany = group.kp_company?.name?.toLowerCase().includes(q);
            const matchGroup = `kelompok #${group.id}`.toLowerCase().includes(q) || String(group.id).includes(q);
            const matchMember = group.members?.some(m =>
                m.student?.name?.toLowerCase().includes(q) ||
                m.student?.nim?.toLowerCase().includes(q)
            );

            return matchCompany || matchGroup || matchMember;
        });
    }, [groups, grades, filterTab, search]);

    // Buka Modal Penilaian & Pre-fill nilai jika sudah ada
    const openGradeModal = (group) => {
        setSelectedGroup(group);
        const info = getGroupGradingInfo(group.id);
        setGradeForm({
            score_field: info.scoreField !== null && info.scoreField !== undefined ? String(info.scoreField) : '',
            score_report: info.scoreReport !== null && info.scoreReport !== undefined ? String(info.scoreReport) : '',
            score_seminar: info.scoreSeminar !== null && info.scoreSeminar !== undefined ? String(info.scoreSeminar) : '',
            notes: info.notes || '',
        });
        setGradeErrors({});
        setShowGradeModal(true);
    };

    // Live Kalkulasi di dalam Modal
    const liveCalculation = useMemo(() => {
        const scores = [
            gradeForm.score_field !== '' ? Number(gradeForm.score_field) : null,
            gradeForm.score_report !== '' ? Number(gradeForm.score_report) : null,
            gradeForm.score_seminar !== '' ? Number(gradeForm.score_seminar) : null,
        ].filter(v => v !== null && !isNaN(v));

        if (scores.length === 0) {
            return { avg: null, letter: null, config: null, count: 0 };
        }

        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        let letter = 'E';
        if (avg >= 80) letter = 'A';
        else if (avg >= 70) letter = 'B';
        else if (avg >= 60) letter = 'C';
        else if (avg >= 50) letter = 'D';

        return {
            avg: avg.toFixed(2),
            letter,
            config: GRADE_CONFIG[letter],
            count: scores.length,
        };
    }, [gradeForm.score_field, gradeForm.score_report, gradeForm.score_seminar]);

    // Submit Nilai Kelompok
    const submitGroupGrade = async () => {
        if (!selectedGroup) return;
        setGradeErrors({});

        const field = gradeForm.score_field !== '' ? Number(gradeForm.score_field) : null;
        const report = gradeForm.score_report !== '' ? Number(gradeForm.score_report) : null;
        const seminar = gradeForm.score_seminar !== '' ? Number(gradeForm.score_seminar) : null;

        // Validasi client-side
        const errors = {};
        if (field !== null && (field < 0 || field > 100)) {
            errors.score_field = ['Nilai harus di antara 0 dan 100'];
        }
        if (report !== null && (report < 0 || report > 100)) {
            errors.score_report = ['Nilai harus di antara 0 dan 100'];
        }
        if (seminar !== null && (seminar < 0 || seminar > 100)) {
            errors.score_seminar = ['Nilai harus di antara 0 dan 100'];
        }

        if (Object.keys(errors).length > 0) {
            setGradeErrors(errors);
            return;
        }

        try {
            await createGroupGrade({
                kp_group_id: selectedGroup.id,
                score_field: field,
                score_report: report,
                score_seminar: seminar,
                notes: gradeForm.notes?.trim() || null,
            }).unwrap();

            handleApiSuccess('Nilai berhasil disimpan untuk seluruh anggota kelompok');
            setShowGradeModal(false);
            setSelectedGroup(null);
            refetchGrades();
            refetchGroups();
        } catch (err) {
            if (err?.data?.errors) {
                setGradeErrors(err.data.errors);
            }
            handleApiError(err, 'Gagal menyimpan nilai');
        }
    };

    // Kolom Tabel yang Rapi & Informatif
    const columns = [
        {
            name: 'No',
            selector: (r, i) => i + 1,
            width: '60px',
            center: true,
            cell: (r, i) => <span className="text-xs text-gray-500 font-medium">{i + 1}</span>,
        },
        {
            name: 'Kelompok & Mitra',
            sortable: true,
            wrap: true,
            minWidth: '240px',
            selector: r => r.kp_company?.name || '',
            cell: r => (
                <div className="py-2">
                    <div className="flex items-center gap-1.5 font-semibold text-gray-900 text-sm">
                        <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{r.kp_company?.name || 'Mitra Tidak Ditentukan'}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span className="font-mono font-medium text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-sm border border-emerald-100">
                            Kelompok #{r.id}
                        </span>
                        <span>•</span>
                        <span>{r.academic_period?.name || '-'}</span>
                    </div>
                </div>
            ),
        },
        {
            name: 'Mahasiswa / Anggota',
            wrap: true,
            minWidth: '220px',
            cell: r => {
                const ketua = r.members?.find(m => m.role === 'ketua') || r.members?.[0];
                const otherCount = Math.max(0, (r.members?.length || 0) - 1);
                return (
                    <div className="py-2">
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                            <span className="truncate">{ketua?.student?.name || '-'}</span>
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-sm border border-emerald-200 shrink-0">
                                Ketua
                            </span>
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">
                            NIM: {ketua?.student?.nim || '-'}
                            {otherCount > 0 && (
                                <span className="ml-1.5 font-sans text-gray-400">
                                    (+{otherCount} anggota)
                                </span>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            name: 'Naskah Laporan',
            width: '140px',
            center: true,
            cell: r => {
                const reportFile = r.reports?.[0]?.file_url;
                return reportFile ? (
                    <a
                        href={reportFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors"
                        title={r.reports?.[0]?.title || 'Unduh Naskah Laporan'}
                    >
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Lihat File</span>
                    </a>
                ) : (
                    <span className="text-xs text-gray-400">Disetujui</span>
                );
            },
        },
        {
            name: 'Status & Nilai Akhir',
            width: '210px',
            sortable: true,
            selector: r => getGroupGradingInfo(r.id).avgScore || 0,
            cell: r => {
                const info = getGroupGradingInfo(r.id);
                if (info.isGraded) {
                    return (
                        <div className="flex items-center gap-2.5 py-1">
                            <div className={`w-9 h-9 rounded-md flex items-center justify-center font-black text-sm border shadow-2xs shrink-0 ${info.gradeConfig?.bg || 'bg-gray-100 text-gray-700'}`}>
                                {info.finalGrade}
                            </div>
                            <div className="text-left leading-tight">
                                <div className="text-xs font-bold text-gray-900">
                                    Skor: {info.avgScore}
                                </div>
                                <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                                    L:{info.scoreField ?? '-'} • R:{info.scoreReport ?? '-'} • S:{info.scoreSeminar ?? '-'}
                                </div>
                            </div>
                        </div>
                    );
                }
                return (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Belum Dinilai
                    </span>
                );
            },
        },
        {
            name: 'Aksi',
            width: '130px',
            center: true,
            cell: r => {
                const info = getGroupGradingInfo(r.id);
                return (
                    <Button
                        size="sm"
                        variant={info.isGraded ? 'secondary' : 'primary'}
                        icon={Award}
                        onClick={(e) => {
                            e.stopPropagation();
                            openGradeModal(r);
                        }}
                    >
                        {info.isGraded ? 'Ubah Nilai' : 'Input Nilai'}
                    </Button>
                );
            },
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <PageHeader
                title="Nilai Kerja Praktek"
                description="Input dan kelola nilai akhir untuk kelompok mahasiswa Kerja Praktek yang telah menyelesaikan laporan."
                icon={Award}
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Statistik
                    title="Total Siap Dinilai"
                    value={groups.length}
                    icon={Users}
                    iconClassName="text-blue-600 bg-blue-50"
                    borderClassName="bg-blue-500"
                    description="Semua kelompok dengan laporan disetujui"
                />

                <Statistik
                    title="Perlu Dinilai"
                    value={pendingCount}
                    icon={Clock}
                    iconClassName="text-amber-600 bg-amber-50"
                    borderClassName="bg-amber-500"
                    description={
                        pendingCount > 0
                            ? `${pendingCount} kelompok menunggu nilai`
                            : 'Semua kelompok telah dinilai'
                    }
                />

                <Statistik
                    title="Selesai Dinilai"
                    value={gradedCount}
                    icon={CheckCircle2}
                    iconClassName="text-emerald-600 bg-emerald-50"
                    borderClassName="bg-emerald-500"
                    description="Nilai akhir lengkap & berstatus selesai"
                />
            </div>

            {/* Main Table Card */}
            <Card>
                {/* Search & Filter Toolbar */}
                <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Status Segmented Tabs */}
                    <div className="inline-flex p-1 bg-gray-100/90 rounded-md shrink-0 self-start md:self-auto border border-gray-200/60">
                        <button
                            type="button"
                            onClick={() => setFilterTab('all')}
                            className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-all ${
                                filterTab === 'all'
                                    ? 'bg-white text-gray-900 shadow-2xs'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Semua ({groups.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterTab('pending')}
                            className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                filterTab === 'pending'
                                    ? 'bg-white text-amber-800 shadow-2xs'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <span>Perlu Dinilai</span>
                            {pendingCount > 0 && (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded-sm">
                                    {pendingCount}
                                </span>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterTab('graded')}
                            className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                filterTab === 'graded'
                                    ? 'bg-white text-emerald-800 shadow-2xs'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <span>Selesai Dinilai</span>
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded-sm">
                                {gradedCount}
                            </span>
                        </button>
                    </div>

                    {/* Search Field */}
                    <div className="w-full md:w-80 relative">
                        <Input
                            placeholder="Cari kelompok, mitra, mahasiswa, NIM..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            icon={Search}
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                title="Hapus pencarian"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Table Content */}
                <div className="overflow-hidden">
                    {isLoadingGroups ? (
                        <div className="p-6 space-y-3">
                            <Skeleton className="h-12 w-full rounded-md" />
                            <Skeleton className="h-16 w-full rounded-md" />
                            <Skeleton className="h-16 w-full rounded-md" />
                        </div>
                    ) : filteredGroups.length === 0 ? (
                        <div className="text-center py-14 px-4 max-w-md mx-auto">
                            {search ? (
                                <>
                                    <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center mx-auto mb-3 text-gray-400">
                                        <Search className="w-6 h-6" />
                                    </div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                                        Tidak Ada Hasil Pencarian
                                    </h4>
                                    <p className="text-xs text-gray-500 mb-4">
                                        Tidak ditemukan kelompok yang cocok dengan kata kunci "{search}".
                                    </p>
                                    <Button size="sm" variant="secondary" onClick={() => setSearch('')}>
                                        Reset Pencarian
                                    </Button>
                                </>
                            ) : filterTab === 'pending' ? (
                                <>
                                    <div className="w-12 h-12 bg-emerald-50 rounded-md flex items-center justify-center mx-auto mb-3 text-emerald-600 border border-emerald-100">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                                        Semua Kelompok Sudah Dinilai
                                    </h4>
                                    <p className="text-xs text-gray-500">
                                        Tidak ada kelompok yang tertunda. Seluruh kelompok bimbingan Anda telah selesai dinilai.
                                    </p>
                                </>
                            ) : filterTab === 'graded' ? (
                                <>
                                    <div className="w-12 h-12 bg-amber-50 rounded-md flex items-center justify-center mx-auto mb-3 text-amber-600 border border-amber-100">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                                        Belum Ada Kelompok yang Dinilai
                                    </h4>
                                    <p className="text-xs text-gray-500">
                                        Pilih tab "Perlu Dinilai" untuk menginput nilai kelompok yang telah menyelesaikan laporan.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="w-12 h-12 bg-blue-50 rounded-md flex items-center justify-center mx-auto mb-3 text-blue-600 border border-blue-100">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                                        Belum Ada Kelompok yang Siap Dinilai
                                    </h4>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        Kelompok akan muncul di sini secara otomatis setelah Laporan Akhir KP diunggah oleh mahasiswa dan telah disetujui (Approved) oleh Dosen Pembimbing.
                                    </p>
                                </>
                            )}
                        </div>
                    ) : (
                        <DataTableWrapper
                            columns={columns}
                            data={filteredGroups}
                            pagination
                        />
                    )}
                </div>
            </Card>

            {/* Modal Input/Ubah Nilai Kelompok */}
            {showGradeModal && selectedGroup && (
                <Modal
                    isOpen={showGradeModal}
                    onClose={() => {
                        setShowGradeModal(false);
                        setSelectedGroup(null);
                    }}
                    title="Form Penilaian Kerja Praktek"
                    size="lg"
                >
                    <div className="space-y-5">
                        {/* Header Info Kelompok & Mitra */}
                        <div className="bg-slate-50 border border-slate-200/80 rounded-md p-4 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 border-b border-slate-200/60">
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span className="font-bold text-gray-900 text-sm">
                                        {selectedGroup.kp_company?.name || 'Mitra KP'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-sm border border-emerald-200">
                                        Kelompok #{selectedGroup.id}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {selectedGroup.academic_period?.name || '-'}
                                    </span>
                                </div>
                            </div>

                            {/* Daftar Anggota */}
                            <div>
                                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                                    Mahasiswa yang Dinilai ({selectedGroup.members?.length || 0})
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    {selectedGroup.members?.map(m => (
                                        <div
                                            key={m.id}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs text-slate-700 shadow-2xs"
                                        >
                                            {m.role === 'ketua' && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Ketua Kelompok" />
                                            )}
                                            <span className="font-medium">{m.student?.name || '-'}</span>
                                            <span className="text-slate-400 font-mono text-[11px]">({m.student?.nim || '-'})</span>
                                            {m.role === 'ketua' && (
                                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded-sm border border-emerald-200">
                                                    Ketua
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Link Naskah Laporan */}
                            {selectedGroup.reports?.[0]?.file_url && (
                                <div className="flex items-center justify-between bg-blue-50/70 border border-blue-100 rounded-md px-3 py-2 text-xs text-blue-900">
                                    <div className="flex items-center gap-2 truncate">
                                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                                        <span className="truncate font-medium">
                                            {selectedGroup.reports[0].title || 'Naskah Laporan KP'}
                                        </span>
                                    </div>
                                    <a
                                        href={selectedGroup.reports[0].file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 font-semibold underline shrink-0 ml-2"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Buka Naskah
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* 3 Komponen Nilai */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Komponen Penilaian (Skala 0 – 100)
                                </label>
                                <span className="text-[11px] text-gray-500">
                                    Rata-rata dihitung otomatis
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                {/* Nilai Lapangan */}
                                <div className="bg-white border border-gray-200 rounded-md p-3.5 hover:border-gray-300 transition-colors">
                                    <div className="flex items-center gap-1.5 mb-1 text-gray-700">
                                        <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                                        <span className="text-xs font-bold">1. Nilai Lapangan</span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 mb-2.5">
                                        Evaluasi dari mitra instansi
                                    </p>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        value={gradeForm.score_field}
                                        onChange={(e) => setGradeForm(prev => ({ ...prev, score_field: e.target.value }))}
                                        placeholder="0 - 100"
                                        error={gradeErrors.score_field?.[0]}
                                        className="font-mono text-base font-semibold rounded-md"
                                    />
                                </div>

                                {/* Nilai Laporan */}
                                <div className="bg-white border border-gray-200 rounded-md p-3.5 hover:border-gray-300 transition-colors">
                                    <div className="flex items-center gap-1.5 mb-1 text-gray-700">
                                        <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span className="text-xs font-bold">2. Nilai Laporan</span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 mb-2.5">
                                        Format & naskah laporan
                                    </p>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        value={gradeForm.score_report}
                                        onChange={(e) => setGradeForm(prev => ({ ...prev, score_report: e.target.value }))}
                                        placeholder="0 - 100"
                                        error={gradeErrors.score_report?.[0]}
                                        className="font-mono text-base font-semibold rounded-md"
                                    />
                                </div>

                                {/* Nilai Seminar */}
                                <div className="bg-white border border-gray-200 rounded-md p-3.5 hover:border-gray-300 transition-colors">
                                    <div className="flex items-center gap-1.5 mb-1 text-gray-700">
                                        <Award className="w-4 h-4 text-purple-600 shrink-0" />
                                        <span className="text-xs font-bold">3. Nilai Seminar</span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 mb-2.5">
                                        Presentasi & penguasaan
                                    </p>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        value={gradeForm.score_seminar}
                                        onChange={(e) => setGradeForm(prev => ({ ...prev, score_seminar: e.target.value }))}
                                        placeholder="0 - 100"
                                        error={gradeErrors.score_seminar?.[0]}
                                        className="font-mono text-base font-semibold rounded-md"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Live Kalkulasi Card */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-md p-4 shadow-sm border border-slate-700">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                                        Hasil Kalkulasi Nilai Akhir
                                    </span>
                                    {liveCalculation.letter ? (
                                        <div className="mt-1">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-3xl font-black text-white tracking-tight">
                                                    {liveCalculation.avg}
                                                </span>
                                                <span className="text-xs text-slate-400 font-medium">/ 100</span>
                                            </div>
                                            <div className="text-xs text-emerald-400 font-medium mt-0.5 flex items-center gap-1.5">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                <span>{liveCalculation.config?.label} • Rata-rata dari {liveCalculation.count} nilai</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-400 mt-1">
                                            Masukkan angka komponen nilai di atas untuk melihat nilai akhir & huruf mutu secara otomatis.
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col items-center justify-center shrink-0">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">Huruf Mutu</span>
                                    <div className={`w-14 h-14 rounded-md flex items-center justify-center font-black text-2xl shadow-inner ${
                                        liveCalculation.letter === 'A' ? 'bg-emerald-500 text-white shadow-emerald-700/50' :
                                        liveCalculation.letter === 'B' ? 'bg-blue-500 text-white shadow-blue-700/50' :
                                        liveCalculation.letter === 'C' ? 'bg-amber-500 text-white shadow-amber-700/50' :
                                        liveCalculation.letter ? 'bg-rose-500 text-white shadow-rose-700/50' :
                                        'bg-slate-700 text-slate-500 border border-slate-600'
                                    }`}>
                                        {liveCalculation.letter || '-'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Catatan Dosen */}
                        <Textarea
                            label="Catatan & Evaluasi Pembimbing (Opsional)"
                            value={gradeForm.notes}
                            onChange={(e) => setGradeForm(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Tuliskan catatan evaluasi, masukan, atau rekomendasi untuk mahasiswa..."
                            rows={3}
                            error={gradeErrors.notes?.[0]}
                        />
                    </div>

                    {/* Modal Footer */}
                    <div className="flex items-center justify-end gap-3 pt-5 border-t border-gray-100 mt-5">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setShowGradeModal(false);
                                setSelectedGroup(null);
                            }}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="primary"
                            icon={Check}
                            onClick={submitGroupGrade}
                            loading={isCreatingGrade}
                        >
                            Simpan Nilai
                        </Button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Nilai;
