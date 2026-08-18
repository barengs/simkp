import React, { useMemo, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    useGetAssignedGroupsQuery,
    useGetMyAssignedGroupsQuery,
    useGetLogbookQuery,
} from '../api/kpApi';

import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import DataTableWrapper from '../../../components/ui/DataTableWrapper';
import Skeleton from '../../../components/ui/Skeleton';
import Statistik from '../../../components/ui/Statistik';

import {
    Users,
    FileText,
    Building2,
    BookOpen,
    CalendarDays,
    GraduationCap,
    Crown,
    ArrowLeft,
    BriefcaseBusiness,
    ClipboardList,
    Clock3,
    MapPin,
    UsersRound,
    UserRound,
    CheckCircle2,
} from 'lucide-react';

const STATUS_LABEL = {
    draft: 'Draft',
    submitted: 'Menunggu Validasi',
    rejected: 'Ditolak',
    approved: 'Disetujui',
    ongoing: 'Berjalan',
    grading: 'Dinilai',
    finished: 'Selesai',
};

const getStatusBadge = (status) => {
    const config = {
        draft: 'gray',
        submitted: 'blue',
        rejected: 'red',
        approved: 'emerald',
        ongoing: 'yellow',
        grading: 'purple',
        finished: 'green',
    };

    return (
        <Badge status={config[status] || 'gray'}>
            {STATUS_LABEL[status] || status || '-'}
        </Badge>
    );
};

const formatDate = (date) => {
    if (!date) return '-';

    return new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
};

const DetailItem = ({ icon: Icon, label, value, children }) => (
    <div className="flex gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-50 text-gray-500 flex-shrink-0">
            <Icon className="w-4 h-4" />
        </div>

        <div className="min-w-0">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                {label}
            </p>

            {children || (
                <p className="mt-1 text-sm font-medium text-gray-900 break-words">
                    {value || '-'}
                </p>
            )}
        </div>
    </div>
);

const SectionHeader = ({ icon: Icon, title, description, action }) => (
    <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex-shrink-0">
                <Icon className="w-4 h-4" />
            </div>

            <div>
                <h3 className="text-base font-semibold text-gray-900">
                    {title}
                </h3>

                {description && (
                    <p className="mt-0.5 text-xs text-gray-500">
                        {description}
                    </p>
                )}
            </div>
        </div>

        {action}
    </div>
);

const EmptyContent = ({ icon: Icon, title, description }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
            <Icon className="w-6 h-6 text-gray-400" />
        </div>

        <p className="text-sm font-medium text-gray-700">
            {title}
        </p>

        {description && (
            <p className="mt-1 text-xs text-gray-400 max-w-sm">
                {description}
            </p>
        )}
    </div>
);

const DetailKelompok = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector(s => s.auth);

    const isDosen = !!user?.lecturer_id;

    const [activeTab, setActiveTab] = useState('logbook');

    const {
        data: groupsRaw,
        isLoading: isLoadingAdmin,
        refetch: refetchAdmin,
    } = useGetAssignedGroupsQuery();

    const {
        data: myGroupsRaw,
        isLoading: isLoadingDosen,
        refetch: refetchMy,
    } = useGetMyAssignedGroupsQuery();

    const {
        data: logbooksRaw,
        isLoading: isLoadingLogbook,
    } = useGetLogbookQuery(id);

    useEffect(() => {
        if (isDosen) {
            refetchMy();
        } else {
            refetchAdmin();
        }
    }, [isDosen, refetchAdmin, refetchMy]);

    const source = isDosen ? myGroupsRaw : groupsRaw;

    const isLoading = isDosen
        ? isLoadingDosen
        : isLoadingAdmin;

    const groups = useMemo(() => {
        if (Array.isArray(source)) return source;

        if (Array.isArray(source?.data)) {
            return source.data;
        }

        return [];
    }, [source]);

    const data = useMemo(
        () => groups.find(g => String(g.id) === String(id)),
        [groups, id]
    );

    const logbooks = useMemo(() => {
        if (Array.isArray(logbooksRaw)) {
            return logbooksRaw;
        }

        if (Array.isArray(logbooksRaw?.data)) {
            return logbooksRaw.data;
        }

        return [];
    }, [logbooksRaw]);

    const members = data?.members || [];
    const documents = data?.kp_documents || [];

    const ketua = members.find(
        member => member.role === 'ketua'
    );

    const supervisor = members.find(m => m.supervisor)?.supervisor;

    const logbookColumns = [
        {
            name: 'No',
            width: '60px',
            center: true,
            cell: (_, index) => index + 1,
        },
        {
            name: 'Tanggal',
            selector: r => r.date,
            sortable: true,
            width: '140px',
            cell: r => (
                <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-gray-400" />

                    <span className="text-sm text-gray-700">
                        {formatDate(r.date)}
                    </span>
                </div>
            ),
        },
        {
            name: 'Kegiatan',
            selector: r => r.activity,
            sortable: true,
            wrap: true,
            cell: r => (
                <div className="py-2">
                    <p className="text-sm font-medium text-gray-800 line-clamp-2">
                        {r.activity || '-'}
                    </p>
                </div>
            ),
        },
        {
            name: 'Mahasiswa',
            selector: r => r.student?.user?.name || '-',
            sortable: true,
            wrap: true,
            width: '220px',
            cell: r => (
                <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex-shrink-0">
                        <UserRound className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {r.student?.user?.name || '-'}
                        </p>

                        <p className="text-xs text-gray-400 font-mono">
                            {r.student?.nim || '-'}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            name: 'Status',
            selector: r => r.status,
            width: '130px',
            center: true,
            cell: r => {
                const config = {
                    draft: {
                        label: 'Draft',
                        color: 'gray',
                    },
                    submitted: {
                        label: 'Menunggu',
                        color: 'yellow',
                    },
                    approved: {
                        label: 'Disetujui',
                        color: 'green',
                    },
                    revision: {
                        label: 'Revisi',
                        color: 'red',
                    },
                };

                const status =
                    config[r.status] || config.draft;

                return (
                    <Badge status={status.color}>
                        {status.label}
                    </Badge>
                );
            },
        },
    ];

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Detail Kelompok KP"
                    description="Memuat informasi kelompok..."
                    icon={Users}
                />

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton
                            key={i}
                            className="h-28 rounded-lg"
                        />
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-[500px] rounded-lg lg:col-span-1" />

                    <Skeleton className="h-[500px] rounded-lg lg:col-span-2" />
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Detail Kelompok KP"
                    description="Data kelompok tidak ditemukan"
                    icon={Users}
                />

                <Card>
                    <EmptyContent
                        icon={Users}
                        title="Kelompok tidak ditemukan"
                        description="Data kelompok yang Anda cari tidak tersedia atau sudah tidak dapat diakses."
                    />

                    <div className="flex justify-center pb-8">
                        <Button
                            variant="secondary"
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* =========================
                HEADER
            ========================== */}
            <PageHeader
                title={`Detail Kelompok ${data.id}`}
                description="Detail informasi dan aktivitas kelompok Kerja Praktek"
                icon={Users}
                actions={
                    <Button
                        variant="secondary"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali
                    </Button>
                }
            />

            {/* =========================
                HERO
            ========================== */}
            <Card className="overflow-hidden">
                <div className="relative bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-7 text-white">

                    <div className="absolute right-0 top-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />

                    <div className="absolute right-20 bottom-0 w-32 h-32 rounded-full bg-white/5 translate-y-1/2" />

                    <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                        <div className="flex items-center gap-4">

                            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-sm">
                                <UsersRound className="w-8 h-8 text-white" />
                            </div>

                            <div>
                                <p className="text-sm text-emerald-100">
                                    Kelompok Kerja Praktek
                                </p>

                                <h2 className="mt-1 text-2xl font-bold">
                                    Kelompok {data.id}
                                </h2>

                                <p className="mt-1 text-sm text-emerald-100 font-mono">
                                    KP-{data.id}
                                </p>
                            </div>

                        </div>

                        <div className="flex items-center">
                            <div className="bg-white px-4 py-2 rounded-lg">
                                {getStatusBadge(data.status)}
                            </div>
                        </div>

                    </div>
                </div>
            </Card>

            {/* =========================
                CONTENT
            ========================== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* =========================
                    SIDEBAR
                ========================== */}
                <div className="space-y-6">

                    {/* INFORMASI KELOMPOK */}
                    <Card>
                        <div className="p-5">

                            <SectionHeader
                                icon={Users}
                                title="Informasi Kelompok"
                                description="Informasi dasar kelompok"
                            />

                            <div className="space-y-5">

                                <div>
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                                        Daftar Anggota
                                    </p>
                                    <div className="space-y-2">
                                        {members.map((member, index) => (
                                            <div key={member.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex-shrink-0">
                                                        <span className="text-xs font-semibold">{index + 1}</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {member.student?.name || '-'}
                                                        </p>
                                                        <p className="text-xs text-gray-500 font-mono">
                                                            {member.student?.nim || '-'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge status={member.role === 'ketua' ? 'ketua' : 'anggota'}>
                                                    {member.role === 'ketua' ? 'Ketua' : 'Anggota'}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <DetailItem
                                    icon={CalendarDays}
                                    label="Periode Akademik"
                                    value={
                                        data.academic_period?.name
                                    }
                                />

                                <DetailItem
                                    icon={Clock3}
                                    label="Tanggal Daftar"
                                    value={formatDate(
                                        data.created_at
                                    )}
                                />

                                {/* DOSEN PEMBIMBING
                                    DIGABUNGKAN DI SINI */}
                                <div className="pt-5 border-t border-gray-100">

                                    <div className="flex gap-3">

                                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex-shrink-0">
                                            <GraduationCap className="w-4 h-4" />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                                                Dosen Pembimbing
                                            </p>

                                            {supervisor ? (
                                                <div className="mt-2 flex items-center gap-3">

                                                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                        <GraduationCap className="w-4 h-4" />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            {supervisor.name}
                                                        </p>

                                                        <p className="text-xs text-gray-400 mt-0.5">
                                                            Dosen Pembimbing
                                                        </p>
                                                    </div>

                                                </div>
                                            ) : (
                                                <p className="mt-1 text-sm text-gray-400">
                                                    Belum ada dosen pembimbing
                                                </p>
                                            )}
                                        </div>

                                    </div>

                                </div>

                            </div>
                        </div>
                    </Card>

                    {/* DETAIL KERJA PRAKTEK */}
                    <Card>
                        <div className="p-5">

                            <SectionHeader
                                icon={BriefcaseBusiness}
                                title="Detail Kerja Praktek"
                                description="Informasi tempat dan tema KP"
                            />

                            <div className="space-y-5">

                                <DetailItem
                                    icon={Building2}
                                    label="Perusahaan"
                                    value={
                                        data.kp_company?.name
                                    }
                                />

                                {data.kp_company?.address && (
                                    <DetailItem
                                        icon={MapPin}
                                        label="Alamat"
                                        value={
                                            data.kp_company.address
                                        }
                                    />
                                )}

                                <DetailItem
                                    icon={BookOpen}
                                    label="Tema KP"
                                    value={
                                        data.kp_theme?.title
                                    }
                                />

                            </div>

                        </div>
                    </Card>

                    {/* DOKUMEN KELOMPOK */}
                    {documents.length > 0 && (
                        <Card>
                            <div className="p-5">
                                <SectionHeader
                                    icon={FileText}
                                    title="Dokumen Kelompok"
                                    description={`${documents.length} dokumen`}
                                />

                                <div className="space-y-3">
                                    {documents.map((doc) => (
                                        <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {doc.document_type?.name || doc.title || 'Dokumen'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatDate(doc.submitted_at || doc.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge status={doc.status === 'approved' ? 'approved' : doc.status === 'rejected' ? 'rejected' : 'submitted'}>
                                                    {doc.status === 'approved' ? 'Disetujui' : doc.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                                                </Badge>
                                                {doc.file_url && (
                                                    <a
                                                        href={doc.file_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-emerald-600 hover:text-emerald-800 font-medium"
                                                    >
                                                        Lihat
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    )}

                    {data.rejection_note && (
                        <Card>
                            <div className="p-5">
                                <SectionHeader
                                    icon={XCircle}
                                    title="Catatan Penolakan"
                                    description="Alasan penolakan pendaftaran"
                                />
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-sm text-red-700 whitespace-pre-wrap">
                                        {data.rejection_note}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    )}

                    {data.description && (
                        <Card>
                            <div className="p-5">
                                <SectionHeader
                                    icon={FileText}
                                    title="Deskripsi"
                                    description="Deskripsi kelompok"
                                />
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                        {data.description}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    )}

                </div>

                {/* =========================
                    MAIN CONTENT
                ========================== */}
                <div className="lg:col-span-2">

                    <Card className="overflow-hidden">

                        {/* TABS */}
                        <div className="px-5 pt-5">

                            <div className="flex items-center gap-1 border-b border-gray-200">

                                {/* LOGBOOK */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setActiveTab('logbook')
                                    }
                                    className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                                        activeTab === 'logbook'
                                            ? 'text-emerald-700'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <BookOpen className="w-4 h-4" />

                                    Logbook

                                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-gray-100 text-gray-500">
                                        {logbooks.length}
                                    </span>

                                    {activeTab === 'logbook' && (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
                                    )}
                                </button>

                                {/* LAPORAN */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setActiveTab('laporan')
                                    }
                                    className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                                        activeTab === 'laporan'
                                            ? 'text-emerald-700'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <ClipboardList className="w-4 h-4" />

                                    Laporan

                                    {activeTab === 'laporan' && (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
                                    )}
                                </button>

                            </div>
                        </div>

                        {/* TAB CONTENT */}
                        <div className="p-5">

                            {/* LOGBOOK */}
                            {activeTab === 'logbook' && (
                                <div>

                                    <div className="flex items-center justify-between mb-4">

                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900">
                                                Aktivitas Logbook
                                            </h3>

                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Daftar aktivitas mahasiswa dalam kelompok
                                            </p>
                                        </div>

                                    </div>

                                    {isLoadingLogbook ? (
                                        <Skeleton className="h-64 rounded-lg" />
                                    ) : logbooks.length === 0 ? (
                                        <EmptyContent
                                            icon={BookOpen}
                                            title="Belum ada logbook"
                                            description="Belum terdapat aktivitas logbook yang dicatat oleh anggota kelompok."
                                        />
                                    ) : (
                                        <div className="border border-gray-200 rounded-lg overflow-hidden">

                                            <DataTableWrapper
                                                columns={logbookColumns}
                                                data={logbooks}
                                                pagination
                                            />

                                        </div>
                                    )}

                                </div>
                            )}

                            {/* LAPORAN */}
                            {activeTab === 'laporan' && (
                                <EmptyContent
                                    icon={ClipboardList}
                                    title="Laporan belum tersedia"
                                    description="Fitur pengelolaan dan pemeriksaan laporan kelompok akan tersedia pada tahap berikutnya."
                                />
                            )}

                        </div>

                    </Card>

                </div>
            </div>
        </div>
    );
};

export default DetailKelompok;