import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import {
    useGetKpGroupsQuery,
    useGetLogbookQuery,
    useGetReportQuery,
    useGetKpGradeQuery,
    useGetSupervisedGroupsQuery,
} from '../../../modules/kp/api/kpApi';

import {
    useGetStudentsQuery,
    useGetLecturersQuery,
} from '../../../modules/master-data/api/masterDataApi';

import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Skeleton from '../../../components/ui/Skeleton';
import Statistik from '../../../components/ui/Statistik';
import DataTableWrapper from '../../../components/ui/DataTableWrapper';
import Select from '../../../components/ui/Select';
import StepperTimeline from '../../../components/ui/StepperTimeline';
import CapacityGauge from '../../../components/ui/CapacityGauge';

import {
    Users,
    UserCheck,
    ClipboardList,
    BookOpen,
    FileText,
    GraduationCap,
    Award,
    Clock,
    TrendingUp,
    Building2,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    UserPlus,
    FileCheck,
    ChevronRight,
    Sparkles,
} from 'lucide-react';

import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts';

/* =========================================================
 * KONFIGURASI PERIODE
 * ========================================================= */

const PERIOD_OPTIONS = [
    { value: 'today', label: 'Hari Ini' },
    { value: '7days', label: '7 Hari' },
    { value: '30days', label: '30 Hari' },
    { value: 'year', label: 'Tahun Ini' },
];

/* =========================================================
 * HELPER
 * ========================================================= */

const getDateRange = (period) => {
    const now = new Date();
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    switch (period) {
        case 'today':
            break;
        case '7days':
            start.setDate(now.getDate() - 7);
            break;
        case '30days':
            start.setDate(now.getDate() - 30);
            break;
        case 'year':
            start.setFullYear(now.getFullYear(), 0, 1);
            break;
        default:
            break;
    }

    return { start, end: now };
};

const filterByDate = (items, period, dateField = 'created_at') => {
    const { start, end } = getDateRange(period);
    return items.filter((item) => {
        if (!item?.[dateField]) return false;
        const itemDate = new Date(item[dateField]);
        return itemDate >= start && itemDate <= end;
    });
};

const normalizeData = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    return [];
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

const getStatusBadge = (status) => {
    const config = {
        submitted: { label: 'Menunggu', color: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
        approved: { label: 'Disetujui', color: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
        rejected: { label: 'Ditolak', color: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200' },
        pending: { label: 'Menunggu', color: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
        ongoing: { label: 'Berjalan', color: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' },
        grading: { label: 'Dinilai', color: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200' },
        finished: { label: 'Selesai', color: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200' },
    };
    const c = config[status] || { label: status || '-', color: 'bg-slate-100 text-slate-700' };
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${c.color}`}>{c.label}</span>;
};

/* =========================================================
 * TREND PENDAFTARAN
 * ========================================================= */

const getTrendData = (items, period) => {
    const filtered = filterByDate(items, period, 'created_at');
    const groups = {};

    filtered.forEach((item) => {
        const date = new Date(item.created_at);
        let label;

        switch (period) {
            case 'today':
                label = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                break;
            case '7days':
            case '30days':
                label = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                break;
            case 'year':
                label = date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
                break;
            default:
                label = date.toLocaleDateString('id-ID');
        }

        if (!groups[label]) {
            groups[label] = { name: label, total: 0 };
        }
        groups[label].total += 1;
    });

    return Object.values(groups).sort((a, b) => new Date(a.name) - new Date(b.name));
};

/* =========================================================
 * AKTIVITAS TERBARU
 * ========================================================= */

const RecentActivity = ({ items }) => {
    const columns = [
        {
            name: 'Nama',
            selector: (row) => row.name,
            sortable: true,
            wrap: true,
        },
        {
            name: 'Tipe',
            selector: (row) => row.type,
            sortable: true,
            width: '110px',
        },
        {
            name: 'Status',
            selector: (row) => row.status,
            sortable: true,
            width: '130px',
            center: true,
            cell: (row) => getStatusBadge(row.status),
        },
        {
            name: 'Tanggal',
            selector: (row) => row.date,
            sortable: true,
            width: '140px',
            cell: (row) => formatDateTime(row.date),
        },
    ];

    if (!items || items.length === 0) {
        return (
            <Card>
                <div className="px-5 py-4 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-800">Aktivitas Terkini</h3>
                </div>
                <div className="p-8 text-center text-xs text-slate-400">
                    Belum ada aktivitas baru pada rentang waktu ini.
                </div>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">Aktivitas Terkini</h3>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Audit Log</span>
            </div>
            <DataTableWrapper
                columns={columns}
                data={items.slice(0, 8)}
                pagination={false}
                responsive
            />
        </Card>
    );
};

/* =========================================================
 * DASHBOARD UTAMA
 * ========================================================= */

const Dashboard = () => {
    const { user, roles = [] } = useSelector((state) => state.auth);
    const [period, setPeriod] = useState('30days');

    const isAdmin = roles.includes('admin');
    const isKoordinator = roles.includes('koordinator');
    const isDosen = roles.includes('dosen');
    const isMahasiswa = roles.includes('mahasiswa');

    /* QUERY */
    const { data: kpGroupsRaw, isLoading: kpGroupsLoading } = useGetKpGroupsQuery();
    const { data: logbooksRaw } = useGetLogbookQuery();
    const { data: reportsRaw } = useGetReportQuery();
    const { data: gradesRaw } = useGetKpGradeQuery(undefined, { skip: !isDosen });
    const { data: supervisedGroupsRaw } = useGetSupervisedGroupsQuery(undefined, { skip: !isDosen });

    const { data: studentsRaw, isLoading: studentsLoading } = useGetStudentsQuery(undefined, { skip: !isAdmin && !isKoordinator });
    const { data: lecturersRaw, isLoading: lecturersLoading } = useGetLecturersQuery(undefined, { skip: !isAdmin });

    /* NORMALIZE */
    const kpGroups = useMemo(() => normalizeData(kpGroupsRaw), [kpGroupsRaw]);
    const logbooks = useMemo(() => normalizeData(logbooksRaw), [logbooksRaw]);
    const reports = useMemo(() => normalizeData(reportsRaw), [reportsRaw]);
    const grades = useMemo(() => normalizeData(gradesRaw), [gradesRaw]);
    const supervisedGroups = useMemo(() => normalizeData(supervisedGroupsRaw), [supervisedGroupsRaw]);
    const students = useMemo(() => normalizeData(studentsRaw), [studentsRaw]);
    const lecturers = useMemo(() => normalizeData(lecturersRaw), [lecturersRaw]);

    /* FILTER */
    const filteredKpGroups = useMemo(() => filterByDate(kpGroups, period, 'created_at'), [kpGroups, period]);
    const filteredLogbooks = useMemo(() => filterByDate(logbooks, period, 'created_at'), [logbooks, period]);
    const filteredReports = useMemo(() => filterByDate(reports, period, 'created_at'), [reports, period]);

    /* CHART DATA */
    const trendData = useMemo(() => getTrendData(kpGroups, period), [kpGroups, period]);

    /* KELOMPOK SAYA (MAHASISWA) */
    const myGroup = useMemo(() => {
        if (!isMahasiswa) return null;
        return (
            kpGroups.find((g) => g.members?.some((m) => m.student_id === user?.student_id && m.role === 'ketua')) ||
            kpGroups.find((g) => g.members?.some((m) => m.student_id === user?.student_id)) ||
            null
        );
    }, [isMahasiswa, kpGroups, user]);

    const myLogbooks = useMemo(() => {
        if (!myGroup) return [];
        return logbooks.filter((l) => l.kp_group_id === myGroup.id);
    }, [myGroup, logbooks]);

    const myReports = useMemo(() => {
        if (!myGroup) return [];
        return reports.filter((r) => r.kp_group_id === myGroup.id);
    }, [myGroup, reports]);

    const supervisorInfo = useMemo(() => {
        if (!myGroup) return null;
        const supervisorMember = myGroup.members?.find((m) => m.supervisor || m.supervisor_lecturer_id);
        return supervisorMember?.supervisor || null;
    }, [myGroup]);

    /* LINIMASA STATUS UNTUK MAHASISWA */
    const mahasiswaTimelineSteps = useMemo(() => {
        if (!isMahasiswa) return [];

        const hasGroup = !!myGroup;
        const isSubmitted = myGroup?.status === 'submitted';
        const isApproved = myGroup?.status === 'approved' || myGroup?.status === 'ongoing' || myGroup?.status === 'finished';
        const isRejected = myGroup?.status === 'rejected';
        const isRevision = myGroup?.status === 'revision';
        const hasSupervisor = !!supervisorInfo;
        const hasLogbooks = myLogbooks.length > 0;
        const hasReport = myReports.length > 0;

        return [
            {
                id: 'step-1',
                title: '1. Pendaftaran',
                subtitle: hasGroup ? (myGroup.kp_company?.name || 'Kelompok terdaftar') : 'Belum mendaftar',
                status: hasGroup ? 'completed' : 'current',
                actionLink: !hasGroup ? '/kp/kelompok' : null,
                actionText: 'Daftar Sekarang',
            },
            {
                id: 'step-2',
                title: '2. Verifikasi Berkas',
                subtitle: !hasGroup
                    ? 'Menunggu pendaftaran'
                    : isApproved
                    ? 'Berkas disetujui'
                    : isRevision
                    ? 'Perlu perbaikan berkas'
                    : isRejected
                    ? 'Pendaftaran ditolak'
                    : 'Menunggu review Koordinator',
                status: isApproved
                    ? 'completed'
                    : isRevision
                    ? 'warning'
                    : isSubmitted
                    ? 'current'
                    : 'pending',
                actionLink: isRevision ? '/kp/kelompok' : null,
                actionText: 'Lihat Catatan',
            },
            {
                id: 'step-3',
                title: '3. Plotting Dosen',
                subtitle: hasSupervisor
                    ? supervisorInfo.name
                    : isApproved
                    ? 'Menunggu penugasan'
                    : 'Tahap berikutnya',
                status: hasSupervisor
                    ? 'completed'
                    : isApproved
                    ? 'current'
                    : 'pending',
            },
            {
                id: 'step-4',
                title: '4. Logbook & Magang',
                subtitle: hasSupervisor
                    ? `${myLogbooks.length} aktivitas dicatat`
                    : 'Belum dimulai',
                status: hasSupervisor
                    ? hasLogbooks
                        ? 'current'
                        : 'current'
                    : 'pending',
                actionLink: hasSupervisor ? '/kp/logbook' : null,
                actionText: 'Buka Logbook',
            },
            {
                id: 'step-5',
                title: '5. Laporan & Nilai',
                subtitle: hasReport ? 'Laporan diunggah' : 'Menunggu laporan akhir',
                status: hasReport ? 'completed' : 'pending',
                actionLink: hasSupervisor ? '/kp/laporan' : null,
                actionText: 'Unggah Laporan',
            },
        ];
    }, [isMahasiswa, myGroup, supervisorInfo, myLogbooks, myReports]);

    /* STATISTIK */
    const stats = useMemo(() => {
        if (isAdmin) {
            return [
                { title: 'Total Mahasiswa KP', value: students.length, icon: Users, iconClassName: 'text-blue-600', borderClassName: 'bg-blue-500' },
                { title: 'Total Dosen Terdaftar', value: lecturers.length, icon: UserCheck, iconClassName: 'text-emerald-600', borderClassName: 'bg-emerald-500' },
                { title: 'Total Kelompok KP', value: filteredKpGroups.length, icon: ClipboardList, iconClassName: 'text-purple-600', borderClassName: 'bg-purple-500' },
            ];
        }

        if (isKoordinator) {
            const submittedGroups = filteredKpGroups.filter((g) => g.status === 'submitted').length;
            const approvedGroups = filteredKpGroups.filter((g) => g.status === 'approved').length;
            return [
                { title: 'Pendaftaran Baru', value: filteredKpGroups.length, icon: ClipboardList, iconClassName: 'text-blue-600', borderClassName: 'bg-blue-500' },
                { title: 'Menunggu Verifikasi', value: submittedGroups, icon: Clock, iconClassName: 'text-amber-600', borderClassName: 'bg-amber-500' },
                { title: 'Kelompok Disetujui', value: approvedGroups, icon: UserCheck, iconClassName: 'text-emerald-600', borderClassName: 'bg-emerald-500' },
            ];
        }

        if (isDosen) {
            const totalStudents = supervisedGroups.reduce((sum, g) => sum + (g.members?.length || 0), 0);
            const pendingLogbooks = filteredLogbooks.filter((l) => supervisedGroups.some((g) => g.id === l.kp_group_id) && l.status === 'pending').length;
            const pendingReports = filteredReports.filter((r) => supervisedGroups.some((g) => g.id === r.kp_group_id) && r.status === 'pending').length;
            return [
                { title: 'Kelompok Bimbingan', value: supervisedGroups.length, icon: Users, iconClassName: 'text-blue-600', borderClassName: 'bg-blue-500' },
                { title: 'Mahasiswa Dibimbing', value: totalStudents, icon: GraduationCap, iconClassName: 'text-emerald-600', borderClassName: 'bg-emerald-500' },
                { title: 'Perlu Divalidasi', value: pendingLogbooks + pendingReports, icon: Clock, iconClassName: 'text-amber-600', borderClassName: 'bg-amber-500' },
            ];
        }

        if (isMahasiswa) {
            return [
                {
                    title: 'Status Kelompok KP',
                    value: myGroup ? (myGroup.status === 'approved' ? 'Disetujui' : myGroup.status === 'submitted' ? 'Diverifikasi' : myGroup.status) : 'Belum Ada',
                    icon: Users,
                    iconClassName: 'text-blue-600',
                    borderClassName: 'bg-blue-500',
                },
                { title: 'Logbook Disetorkan', value: myLogbooks.length, icon: BookOpen, iconClassName: 'text-emerald-600', borderClassName: 'bg-emerald-500' },
                { title: 'Laporan Akhir KP', value: myReports.length > 0 ? 'Sudah Submit' : 'Belum Submit', icon: FileText, iconClassName: 'text-purple-600', borderClassName: 'bg-purple-500' },
            ];
        }

        return [];
    }, [isAdmin, isKoordinator, isDosen, isMahasiswa, kpGroups, supervisedGroups, filteredKpGroups, filteredLogbooks, filteredReports, students, lecturers, myGroup, myLogbooks, myReports]);

    /* RECENT ACTIVITIES */
    const recentActivities = useMemo(() => {
        const activities = [];

        const filteredGroups = filterByDate(kpGroups, period, 'created_at');
        const filteredLogb = filterByDate(logbooks, period, 'created_at');
        const filteredReps = filterByDate(reports, period, 'created_at');

        filteredGroups.forEach((group) => {
            const ketua = group.members?.find((m) => m.role === 'ketua');
            const name = ketua?.student?.user?.name || 'Kelompok KP';

            if (group.status === 'submitted') {
                activities.push({ name, status: 'Menunggu', type: 'Pendaftaran', date: group.created_at });
            } else if (group.status === 'approved') {
                activities.push({ name, status: 'Disetujui', type: 'Pendaftaran', date: group.updated_at });
            } else if (group.status === 'rejected') {
                activities.push({ name, status: 'Ditolak', type: 'Pendaftaran', date: group.updated_at });
            }
        });

        filteredLogb.forEach((logbook) => {
            const student = logbook.student?.user?.name || 'Mahasiswa';
            activities.push({
                name: student,
                status: logbook.status === 'approved' ? 'Disetujui' : 'Menunggu',
                type: 'Logbook',
                date: logbook.created_at,
            });
        });

        filteredReps.forEach((report) => {
            const group = report.kp_group;
            const ketua = group?.members?.find((m) => m.role === 'ketua');
            const name = ketua?.student?.user?.name || 'Laporan KP';

            let status = 'Menunggu';
            if (report.status === 'approved') status = 'Disetujui';
            else if (report.status === 'rejected') status = 'Ditolak';

            activities.push({ name, status, type: 'Laporan', date: report.created_at });
        });

        return activities.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
    }, [kpGroups, logbooks, reports, period]);

    /* LOADING */
    const isLoading = kpGroupsLoading || (isAdmin && (studentsLoading || lecturersLoading));

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Dashboard" description="Ringkasan sistem" icon={TrendingUp} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-28 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    const periodLabel = PERIOD_OPTIONS.find((p) => p.value === period)?.label || '30 Hari';

    return (
        <div className="space-y-6">
            {/* Header */}
            <PageHeader
                title="Dashboard Utama"
                description={
                    isAdmin
                        ? 'Pengawasan operasional akademik, master data, dan akun pengguna.'
                        : isKoordinator
                        ? 'Monitoring verifikasi pendaftaran dan penugasan dosen pembimbing.'
                        : isDosen
                        ? 'Pantau progres bimbingan, logbook, dan laporan mahasiswa Anda.'
                        : 'Pantau status pendaftaran, logbook harian, dan berkas kerja praktek Anda.'
                }
                icon={TrendingUp}
            />

            {/* Mahasiswa Lifecycle Stepper Tracker */}
            {isMahasiswa && (
                <StepperTimeline steps={mahasiswaTimelineSteps} />
            )}

            {/* STATISTIK CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.map((stat, index) => (
                    <Statistik key={index} {...stat} />
                ))}
            </div>

            {/* SECTION UTAMA BERDASARKAN PERAN */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* MAHASISWA: DETAIL KELOMPOK & TEMPAT KP */}
                {isMahasiswa && (
                    <div className="xl:col-span-2 space-y-6">
                        {!myGroup ? (
                            <Card className="overflow-hidden bg-gradient-to-br from-emerald-900 to-slate-900 text-white border-0 shadow-lg p-6 sm:p-8">
                                <div className="max-w-xl">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full ring-1 ring-emerald-400/30 mb-4">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        <span>Pendaftaran KP Dibuka</span>
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                                        Mulai Perjalanan Kerja Praktek Anda
                                    </h3>
                                    <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                                        Anda belum terdaftar dalam kelompok kerja praktek manapun. Daftarkan kelompok bersama rekan Anda atau ajukan mandiri untuk memulai magang.
                                    </p>
                                    <div className="mt-6 flex flex-wrap gap-3">
                                        <Link
                                            to="/kp/kelompok"
                                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md"
                                        >
                                            <UserPlus className="w-4 h-4" />
                                            <span>Daftar Kelompok KP Sekarang</span>
                                        </Link>
                                    </div>
                                </div>
                            </Card>
                        ) : (
                            <Card className="p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-3">
                                    <div>
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block">
                                            Informasi Kelompok KP
                                        </span>
                                        <h3 className="text-lg font-bold text-slate-800 mt-0.5">
                                            {myGroup.kp_company?.name || 'Tempat KP Belum Ditentukan'}
                                        </h3>
                                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                            <Building2 className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                                            <span>{myGroup.kp_company?.address || 'Alamat perusahaan belum ada'}</span>
                                        </p>
                                    </div>
                                    <div className="shrink-0">{getStatusBadge(myGroup.status)}</div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-slate-100">
                                    <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
                                        <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
                                            Dosen Pembimbing
                                        </span>
                                        <p className="text-sm font-bold text-slate-800 mt-1">
                                            {supervisorInfo?.name || 'Menunggu Penugasan Koordinator'}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {supervisorInfo ? 'Dosen Pembimbing KP' : 'Plotting akan dilakukan segera'}
                                        </p>
                                    </div>

                                    <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
                                        <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
                                            Tema Kajian KP
                                        </span>
                                        <p className="text-sm font-bold text-slate-800 mt-1 truncate">
                                            {myGroup.kp_theme?.title || 'Umum'}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                            {myGroup.kp_theme?.description || 'Tema penelitian magang'}
                                        </p>
                                    </div>
                                </div>

                                {/* Anggota Kelompok */}
                                <div className="pt-4">
                                    <span className="text-xs font-bold text-slate-700 block mb-2.5">
                                        Anggota Kelompok ({myGroup.members?.length || 0} Mahasiswa)
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {myGroup.members?.map((m) => (
                                            <div
                                                key={m.id || m.student_id}
                                                className="flex items-center justify-between p-2.5 bg-white border border-slate-200/70 rounded-xl"
                                            >
                                                <div className="min-w-0 pr-2">
                                                    <p className="text-xs font-bold text-slate-800 truncate">
                                                        {m.student?.name || 'Mahasiswa'}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 font-mono">
                                                        {m.student?.nim || '-'}
                                                    </p>
                                                </div>
                                                <span
                                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                                        m.role === 'ketua'
                                                            ? 'bg-amber-100 text-amber-800'
                                                            : 'bg-slate-100 text-slate-600'
                                                    }`}
                                                >
                                                    {m.role}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Quick Links */}
                                <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                                    <Link
                                        to="/kp/logbook"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                                    >
                                        <BookOpen className="w-3.5 h-3.5" />
                                        <span>Isi Logbook ({myLogbooks.length})</span>
                                    </Link>
                                    <Link
                                        to="/kp/laporan"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                                    >
                                        <FileText className="w-3.5 h-3.5" />
                                        <span>Laporan Akhir</span>
                                    </Link>
                                    <Link
                                        to="/kp/nilai-saya"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                                    >
                                        <Award className="w-3.5 h-3.5" />
                                        <span>Transkrip Nilai</span>
                                    </Link>
                                </div>
                            </Card>
                        )}
                    </div>
                )}

                {/* DOSEN, KOORDINATOR & ADMIN: GRAFIK & WORKLOAD GAUGE */}
                {(isAdmin || isKoordinator || isDosen) && (
                    <div className="xl:col-span-2 space-y-6">
                        {/* Workload Gauge for Dosen */}
                        {isDosen && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <CapacityGauge
                                    title="Kapasitas Bimbingan Kerja Praktek"
                                    current={supervisedGroups.length}
                                    max={10}
                                    unit="Kelompok"
                                    colorScheme="emerald"
                                />
                                <CapacityGauge
                                    title="Kapasitas Bimbingan Tugas Akhir"
                                    current={3}
                                    max={8}
                                    unit="Mahasiswa"
                                    colorScheme="indigo"
                                />
                            </div>
                        )}

                        {/* Chart Card */}
                        <Card className="overflow-hidden">
                            <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-slate-800">Statistik Tren Pendaftaran KP</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Distribusi aktivitas pendaftaran kelompok dalam periode {periodLabel.toLowerCase()}.
                                    </p>
                                </div>
                                <Select
                                    options={PERIOD_OPTIONS}
                                    value={period}
                                    onChange={(e) => setPeriod(e.target.value)}
                                    className="w-36 shrink-0"
                                />
                            </div>

                            <div className="p-4 sm:p-6">
                                <div className="w-full overflow-hidden">
                                    <ResponsiveContainer width="100%" height={290}>
                                        <LineChart data={trendData} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                                            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                                            <Tooltip
                                                contentStyle={{
                                                    borderRadius: '12px',
                                                    border: '1px solid #e2e8f0',
                                                    boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                                                    fontSize: '12px',
                                                }}
                                            />
                                            <Legend wrapperStyle={{ paddingTop: '15px', fontSize: '11px' }} />

                                            <Line
                                                type="monotone"
                                                dataKey="total"
                                                name="Total Pengajuan"
                                                stroke="#059669"
                                                strokeWidth={2.5}
                                                dot={{ r: 3, fill: '#059669' }}
                                                activeDot={{ r: 5 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* AKTIVITAS TERBARU (KOLOM KANAN) */}
                <div className="space-y-6">
                    <RecentActivity items={recentActivities} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
