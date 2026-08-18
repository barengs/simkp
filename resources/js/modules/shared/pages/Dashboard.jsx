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
} from 'lucide-react';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
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
    return items.filter(item => {
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
        submitted: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800' },
        approved: { label: 'Disetujui', color: 'bg-green-100 text-green-800' },
        rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-800' },
        pending: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800' },
        ongoing: { label: 'Berjalan', color: 'bg-blue-100 text-blue-800' },
        grading: { label: 'Dinilai', color: 'bg-purple-100 text-purple-800' },
        finished: { label: 'Selesai', color: 'bg-gray-100 text-gray-800' },
    };
    const c = config[status] || { label: status || '-', color: 'bg-gray-100 text-gray-800' };
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.color}`}>{c.label}</span>;
};


/* =========================================================
 * TREND PENDAFTARAN
 * ========================================================= */

const getTrendData = (items, period) => {
    const filtered = filterByDate(items, period, 'created_at');
    const groups = {};

    filtered.forEach(item => {
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
 * DATA STATUS KELOMPOK
 * ========================================================= */

const getKpGroupStatusData = (kpGroups) => {
    const counts = {};
    kpGroups.forEach(g => {
        const status = g.status || 'unknown';
        counts[status] = (counts[status] || 0) + 1;
    });

    const colorMap = {
        submitted: '#f59e0b',
        approved: '#3b82f6',
        rejected: '#ef4444',
        ongoing: '#8b5cf6',
        grading: '#10b981',
        finished: '#6b7280',
    };

    const labelMap = {
        submitted: 'Menunggu',
        approved: 'Disetujui',
        rejected: 'Ditolak',
        ongoing: 'Berjalan',
        grading: 'Dinilai',
        finished: 'Selesai',
    };

    return Object.entries(counts).map(([status, value]) => ({
        name: labelMap[status] || status,
        value,
        color: colorMap[status] || '#6b7280',
    }));
};


/* =========================================================
 * AKTIVITAS TERBARU
 * ========================================================= */

const RecentActivity = ({ items }) => {
    const columns = [
        {
            name: 'Nama',
            selector: row => row.name,
            sortable: true,
            wrap: true,
        },
        {
            name: 'Tipe',
            selector: row => row.type,
            sortable: true,
            width: '120px',
        },
        {
            name: 'Status',
            selector: row => row.status,
            sortable: true,
            width: '140px',
            center: true,
            cell: row => getStatusBadge(row.status),
        },
        {
            name: 'Tanggal',
            selector: row => row.date,
            sortable: true,
            width: '160px',
            cell: row => formatDateTime(row.date),
        },
    ];

    if (!items || items.length === 0) {
        return (
            <Card>
                <div className="px-6 py-5 border-b border-gray-200">
                    <h3 className="text-base font-semibold text-gray-900">Aktivitas Terbaru</h3>
                </div>
                <div className="p-8 text-center text-sm text-gray-500">
                    Belum ada aktivitas pada periode ini.
                </div>
            </Card>
        );
    }

    return (
        <Card>
            <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-900">Aktivitas Terbaru</h3>
            </div>
            <DataTableWrapper
                columns={columns}
                data={items.slice(0, 10)}
                pagination={false}
                responsive
            />
        </Card>
    );
};


/* =========================================================
 * DASHBOARD
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
    const statusChartData = useMemo(() => getKpGroupStatusData(filteredKpGroups), [filteredKpGroups]);

    /* STATISTIK */
    const stats = useMemo(() => {
        if (isAdmin) {
            return [
                { title: 'Total Mahasiswa KP', value: students.length, icon: Users, iconClassName: 'text-blue-600', borderClassName: 'bg-blue-500' },
                { title: 'Total Dosen', value: lecturers.length, icon: UserCheck, iconClassName: 'text-emerald-600', borderClassName: 'bg-emerald-500' },
                { title: 'Total Pendaftaran KP', value: filteredKpGroups.length, icon: ClipboardList, iconClassName: 'text-purple-600', borderClassName: 'bg-purple-500' },
            ];
        }

        if (isKoordinator) {
            const submittedGroups = filteredKpGroups.filter(g => g.status === 'submitted').length;
            const approvedGroups = filteredKpGroups.filter(g => g.status === 'approved').length;
            return [
                { title: 'Pendaftaran Baru', value: filteredKpGroups.length, icon: ClipboardList, iconClassName: 'text-blue-600', borderClassName: 'bg-blue-500' },
                { title: 'Menunggu Verifikasi', value: submittedGroups, icon: Clock, iconClassName: 'text-yellow-600', borderClassName: 'bg-yellow-500' },
                { title: 'Sudah Disetujui', value: approvedGroups, icon: UserCheck, iconClassName: 'text-emerald-600', borderClassName: 'bg-emerald-500' },
            ];
        }

        if (isDosen) {
            const totalStudents = supervisedGroups.reduce((sum, g) => sum + (g.members?.length || 0), 0);
            const pendingLogbooks = filteredLogbooks.filter(l => supervisedGroups.some(g => g.id === l.kp_group_id) && l.status === 'pending').length;
            const pendingReports = filteredReports.filter(r => supervisedGroups.some(g => g.id === r.kp_group_id) && r.status === 'pending').length;
            return [
                { title: 'Kelompok Bimbingan', value: supervisedGroups.length, icon: Users, iconClassName: 'text-blue-600', borderClassName: 'bg-blue-500' },
                { title: 'Total Mahasiswa', value: totalStudents, icon: GraduationCap, iconClassName: 'text-emerald-600', borderClassName: 'bg-emerald-500' },
                { title: 'Menunggu Verifikasi', value: pendingLogbooks + pendingReports, icon: Clock, iconClassName: 'text-yellow-600', borderClassName: 'bg-yellow-500' },
            ];
        }

        if (isMahasiswa) {
            const myGroup = kpGroups.find(g => g.members?.some(m => m.student_id === user?.student_id && m.role === 'ketua')) ||
                          kpGroups.find(g => g.members?.some(m => m.student_id === user?.student_id));
            const myGroupId = myGroup?.id;
            const myLogbooks = filteredLogbooks.filter(l => l.kp_group_id === myGroupId);
            const myReports = filteredReports.filter(r => r.kp_group_id === myGroupId);
            return [
                { title: 'Status Kelompok', value: myGroup ? myGroup.status : 'Belum', icon: Users, iconClassName: 'text-blue-600', borderClassName: 'bg-blue-500' },
                { title: 'Logbook Baru', value: myLogbooks.length, icon: BookOpen, iconClassName: 'text-purple-600', borderClassName: 'bg-purple-500' },
                { title: 'Laporan Baru', value: myReports.length, icon: FileText, iconClassName: 'text-orange-600', borderClassName: 'bg-orange-500' },
            ];
        }

        return [];
    }, [isAdmin, isKoordinator, isDosen, isMahasiswa, kpGroups, supervisedGroups, filteredKpGroups, filteredLogbooks, filteredReports, students, lecturers, user]);

    /* RECENT ACTIVITIES */
    const recentActivities = useMemo(() => {
        const activities = [];

        const filteredGroups = filterByDate(kpGroups, period, 'created_at');
        const filteredLogbooks = filterByDate(logbooks, period, 'created_at');
        const filteredReports = filterByDate(reports, period, 'created_at');

        filteredGroups.forEach(group => {
            const ketua = group.members?.find(m => m.role === 'ketua');
            const name = ketua?.student?.user?.name || 'Kelompok';

            if (group.status === 'submitted') {
                activities.push({ name, status: 'Menunggu Validasi', type: 'Pendaftaran', date: group.created_at });
            } else if (group.status === 'approved') {
                activities.push({ name, status: 'Disetujui', type: 'Pendaftaran', date: group.updated_at });
            } else if (group.status === 'rejected') {
                activities.push({ name, status: 'Ditolak', type: 'Pendaftaran', date: group.updated_at });
            }
        });

        filteredLogbooks.forEach(logbook => {
            const student = logbook.student?.user?.name || 'Mahasiswa';
            activities.push({
                name: student,
                status: logbook.status === 'approved' ? 'Disetujui' : 'Menunggu Validasi',
                type: 'Logbook',
                date: logbook.created_at,
            });
        });

        filteredReports.forEach(report => {
            const group = report.kp_group;
            const ketua = group?.members?.find(m => m.role === 'ketua');
            const name = ketua?.student?.user?.name || 'Laporan';

            let status = 'Menunggu Validasi';
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28" />)}
                </div>
            </div>
        );
    }

    const periodLabel = PERIOD_OPTIONS.find(p => p.value === period)?.label || '30 Hari';

    return (
        <div className="space-y-6">
            <PageHeader
                title="Dashboard"
                description={
                    isAdmin ? 'Ringkasan sistem secara keseluruhan' :
                    isKoordinator ? 'Ringkasan verifikasi dan plotting' :
                    isDosen ? 'Ringkasan kelompok bimbingan Anda' :
                    'Ringkasan kegiatan KP Anda'
                }
                icon={TrendingUp}
            />

            {/* STATISTIK */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.map((stat, index) => <Statistik key={index} {...stat} />)}
            </div>

            {/* GRAFIK + AKTIVITAS */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* GRAFIK */}
                {(isAdmin || isKoordinator || isDosen) && (
                    <Card className="xl:col-span-2">
                        <div className="px-5 sm:px-6 py-5 border-b border-gray-200 flex items-center justify-between gap-4">
                            <div className="min-w-0">
                                <h3 className="text-base font-semibold text-gray-900">Statistik Kelompok KP</h3>
                                <p className="text-xs sm:text-sm text-gray-500">
                                    Tren pendaftaran dan distribusi status kelompok dalam periode {periodLabel.toLowerCase()}.
                                </p>
                            </div>
                            <Select
                                options={PERIOD_OPTIONS}
                                value={period}
                                onChange={(e) => setPeriod(e.target.value)}
                                className="w-40 flex-shrink-0"
                            />
                        </div>

                        <div className="p-4 sm:p-6">
                            <div className="w-full overflow-hidden">
                                <ResponsiveContainer width="100%" height={320}>
                                    <LineChart data={trendData} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} />
                                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '10px', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                                        />
                                        <Legend wrapperStyle={{ paddingTop: '15px', fontSize: '12px' }} />

                                        <Line type="monotone" dataKey="total" name="Total Pendaftaran" stroke="#10b981" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                                        <Line type="monotone" dataKey="submitted" name="Menunggu" stroke="#f59e0b" strokeWidth={2} dot={false} />
                                        <Line type="monotone" dataKey="approved" name="Disetujui" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                        <Line type="monotone" dataKey="rejected" name="Ditolak" stroke="#ef4444" strokeWidth={2} dot={false} />
                                        <Line type="monotone" dataKey="ongoing" name="Berjalan" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                                        <Line type="monotone" dataKey="grading" name="Dinilai" stroke="#06b6d4" strokeWidth={2} dot={false} />
                                        <Line type="monotone" dataKey="finished" name="Selesai" stroke="#6b7280" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </Card>
                )}

                {/* AKTIVITAS TERBARU */}
                <RecentActivity items={recentActivities} />
            </div>
        </div>
    );
};

export default Dashboard;
