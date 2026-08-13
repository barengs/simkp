import React, { useMemo, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetAssignedGroupsQuery, useGetMyAssignedGroupsQuery, useGetLogbookQuery } from '../api/kpApi';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import DataTableWrapper from '../../../components/ui/DataTableWrapper';
import Skeleton from '../../../components/ui/Skeleton';
import {
    Users, FileText, Search, Building2, BookOpen, CalendarDays,
    GraduationCap, Crown, Eye, Trash2, UserMinus, UsersRound, ArrowLeft,
} from 'lucide-react';

const STATUS_LABEL = {
    draft: 'Draft', submitted: 'Menunggu Validasi', rejected: 'Ditolak',
    approved: 'Disetujui', ongoing: 'Berjalan', grading: 'Dinilai', finished: 'Selesai',
};

const getStatusBadge = (status) => {
    const config = {
        draft: 'gray', submitted: 'blue', rejected: 'red',
        approved: 'emerald', ongoing: 'yellow', grading: 'purple', finished: 'green',
    };
    return <Badge status={config[status] || 'gray'}>{STATUS_LABEL[status] || status}</Badge>;
};

const DetailKelompok = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector(s => s.auth);
    const isDosen = !!user?.lecturer_id;
    const [activeTab, setActiveTab] = useState('logbook');

    const { data: groupsRaw, isLoading: isLoadingAdmin, refetch: refetchAdmin } = useGetAssignedGroupsQuery();
    const { data: myGroupsRaw, isLoading: isLoadingDosen, refetch: refetchMy } = useGetMyAssignedGroupsQuery();
    const { data: logbooksRaw, isLoading: isLoadingLogbook, refetch: refetchLogbook } = useGetLogbookQuery(id);

    useEffect(() => {
        if (isDosen) {
            refetchMy();
        } else {
            refetchAdmin();
        }
    }, [isDosen, refetchAdmin, refetchMy]);

    const source = isDosen ? myGroupsRaw : groupsRaw;
    const isLoading = isDosen ? isLoadingDosen : isLoadingAdmin;
    const groups = useMemo(() =>
        Array.isArray(source) ? source
        : Array.isArray(source?.data) ? source.data : [],
    [source]);

    const data = useMemo(() => groups.find(g => g.id == id), [groups, id]);

    const logbooks = useMemo(() => {
        if (!logbooksRaw) return [];
        return Array.isArray(logbooksRaw) ? logbooksRaw
            : Array.isArray(logbooksRaw?.data) ? logbooksRaw.data : [];
    }, [logbooksRaw]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Detail Kelompok KP" description="Memuat data..." icon={Users} />
                <Card><Skeleton className="h-64" /></Card>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="space-y-6">
                <PageHeader title="Detail Kelompok KP" description="Data tidak ditemukan" icon={Users} />
                <Card>
                    <div className="p-8 text-center">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Kelompok tidak ditemukan.</p>
                        <Button variant="secondary" onClick={() => navigate(-1)} className="mt-4">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    const ketua = data.members?.find(m => m.role === 'ketua');

    const logbookColumns = [
        {
            name: 'No',
            selector: (r, i) => i + 1,
            width: '60px',
            center: true,
        },
        {
            name: 'Tanggal',
            selector: r => r.date,
            sortable: true,
            width: '120px',
            cell: r => r.date ? new Date(r.date).toLocaleDateString('id-ID') : '-',
        },
        {
            name: 'Kegiatan',
            selector: r => r.activity,
            sortable: true,
            wrap: true,
        },
        {
            name: 'Mahasiswa',
            selector: r => r.student?.user?.name || '-',
            sortable: true,
            wrap: true,
            cell: r => (
                <div>
                    <p className="text-sm font-medium text-gray-900">{r.student?.user?.name || '-'}</p>
                    <p className="text-xs text-gray-500 font-mono">{r.student?.nim || '-'}</p>
                </div>
            ),
        },
        {
            name: 'Status',
            selector: r => r.status,
            width: '120px',
            center: true,
            cell: r => {
                const config = {
                    draft: { label: 'Draft', color: 'gray' },
                    submitted: { label: 'Menunggu', color: 'yellow' },
                    approved: { label: 'Disetujui', color: 'green' },
                    revision: { label: 'Revisi', color: 'red' },
                };
                const c = config[r.status] || config.draft;
                return <Badge status={c.color}>{c.label}</Badge>;
            },
        },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title={`Detail Kelompok ${data.code}`}
                description="Informasi lengkap kelompok KP"
                icon={Users}
            />

            <div className="flex items-center gap-3">
                <Button variant="secondary" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Group Details */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Info Kelompok */}
                    <Card>
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5 text-emerald-600" />
                                Informasi Kelompok
                            </h3>
                            <div className="space-y-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Kode Kelompok</p>
                                    <p className="text-sm font-medium text-gray-900 font-mono">{data.code || '-'}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                                    {getStatusBadge(data.status)}
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Periode</p>
                                    <p className="text-sm font-medium text-gray-900">{data.academic_period?.name || '-'}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Tanggal Plotting</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {data.assigned_at ? new Date(data.assigned_at).toLocaleDateString('id-ID') : '-'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Dosen Pembimbing */}
                    {data.supervisor && (
                        <Card className="bg-emerald-50 border-emerald-200">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5 text-emerald-600" />
                                    Dosen Pembimbing
                                </h3>
                                <div className="bg-white rounded-lg p-4 border border-emerald-100">
                                    <p className="text-sm font-medium text-gray-900">{data.supervisor.name}</p>
                                    {data.supervisor.nidn && (
                                        <p className="text-xs text-gray-500 font-mono mt-1">{data.supervisor.nidn}</p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Detail KP */}
                    <Card>
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-emerald-600" />
                                Detail KP
                            </h3>
                            <div className="space-y-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Perusahaan</p>
                                    <p className="text-sm font-medium text-gray-900">{data.kp_company?.name || '-'}</p>
                                    {data.kp_company?.address && (
                                        <p className="text-xs text-gray-500 mt-1">{data.kp_company.address}</p>
                                    )}
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Tema KP</p>
                                    <p className="text-sm font-medium text-gray-900">{data.kp_theme?.title || '-'}</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Daftar Anggota */}
                    <Card>
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <UsersRound className="w-5 h-5 text-emerald-600" />
                                Anggota Kelompok ({data.members?.length || data.members_count || 0} orang)
                            </h3>
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <DataTableWrapper
                                    columns={[
                                        {
                                            name: 'No',
                                            width: '60px',
                                            center: true,
                                            cell: (_, index) => index + 1,
                                        },
                                        {
                                            name: 'Nama',
                                            selector: r => r.student?.user?.name || '-',
                                            sortable: true,
                                        },
                                        {
                                            name: 'NIM',
                                            selector: r => r.student?.nim || '-',
                                            width: '120px',
                                        },
                                        {
                                            name: 'Peran',
                                            width: '120px',
                                            center: true,
                                            cell: r => (
                                                <Badge status={r.role === 'ketua' ? 'amber' : 'gray'}>
                                                    {r.role === 'ketua' ? 'Ketua' : 'Anggota'}
                                                </Badge>
                                            ),
                                        },
                                    ]}
                                    data={data.members || []}
                                    pagination={false}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Dokumen yang Diunggah */}
                    {data.kp_documents?.length > 0 && (
                        <Card>
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-emerald-600" />
                                    Dokumen ({data.kp_documents.length} file)
                                </h3>
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <DataTableWrapper
                                        columns={[
                                            {
                                                name: 'No',
                                                width: '60px',
                                                center: true,
                                                cell: (_, index) => index + 1,
                                            },
                                            {
                                                name: 'Jenis Dokumen',
                                                selector: r => r.document_type?.name || r.title || '-',
                                            },
                                            {
                                                name: 'Status',
                                                width: '120px',
                                                center: true,
                                                cell: r => (
                                                    <Badge status={r.status === 'approved' ? 'approved' : r.status === 'rejected' ? 'rejected' : 'submitted'}>
                                                        {r.status === 'approved' ? 'Disetujui' : r.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                                                    </Badge>
                                                ),
                                            },
                                        ]}
                                        data={data.kp_documents}
                                        pagination={false}
                                    />
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Right Column - Tabs */}
                <div className="lg:col-span-2">
                    <Card>
                        <div className="p-6">
                            {/* Tabs Header */}
                            <div className="flex items-center gap-1 border-b border-gray-200 mb-6">
                                <button
                                    onClick={() => setActiveTab('logbook')}
                                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                                        activeTab === 'logbook'
                                            ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <BookOpen className="w-4 h-4 inline mr-2" />
                                    Logbook
                                </button>
                                <button
                                    onClick={() => setActiveTab('laporan')}
                                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                                        activeTab === 'laporan'
                                            ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <FileText className="w-4 h-4 inline mr-2" />
                                    Laporan
                                </button>
                            </div>

                            {/* Tab Content */}
                            {activeTab === 'logbook' && (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-semibold text-gray-900">
                                            Logbook Kelompok ({logbooks.length} entri)
                                        </h3>
                                    </div>
                                    {isLoadingLogbook ? (
                                        <Skeleton className="h-64" />
                                    ) : logbooks.length === 0 ? (
                                        <div className="text-center py-12">
                                            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500">Belum ada logbook untuk kelompok ini.</p>
                                        </div>
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

                            {activeTab === 'laporan' && (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-semibold text-gray-900">
                                            Laporan Kelompok
                                        </h3>
                                    </div>
                                    <div className="text-center py-12">
                                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">Fitur laporan sedang dalam pengembangan.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default DetailKelompok;
