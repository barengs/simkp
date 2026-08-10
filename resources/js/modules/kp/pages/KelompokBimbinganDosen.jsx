import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
    useGetMyAssignedGroupsQuery,
} from '../api/kpApi';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import DataTableWrapper from '../../../components/ui/DataTableWrapper';
import Skeleton from '../../../components/ui/Skeleton';
import Modal from '../../../components/ui/Modal';
import {
    Users, FileText, Search, Building2, BookOpen, CalendarDays,
    GraduationCap, Crown,
} from 'lucide-react';

const STATUS_LABEL = {
    draft: 'Draft', diajukan: 'Menunggu Validasi', ditolak: 'Ditolak',
    disetujui: 'Disetujui', berjalan: 'Berjalan', laporan_masuk: 'Laporan Masuk',
    revisi_laporan: 'Revisi Laporan', dinilai: 'Dinilai', selesai: 'Selesai',
};

const getStatusBadge = (status) => {
    const config = {
        draft: 'gray', diajukan: 'blue', ditolak: 'red',
        disetujui: 'emerald', berjalan: 'yellow', laporan_masuk: 'purple',
        revisi_laporan: 'orange', dinilai: 'teal', selesai: 'green',
    };
    return <Badge status={config[status] || 'gray'}>{STATUS_LABEL[status] || status}</Badge>;
};

// ─── Detail Modal ────────────────────────────────────────────────────────────
const DetailModal = ({ data, onClose }) => {
    if (!data) return null;

    return (
        <Modal isOpen={true} onClose={onClose} title="Detail Kelompok KP" size="lg">
            <div className="space-y-6">
                {/* Info Kelompok */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-600" />
                        Informasi Kelompok
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Kode Kelompok</p>
                            <p className="text-sm font-medium text-gray-900 font-mono">{data.code || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                            {getStatusBadge(data.status)}
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Periode</p>
                            <p className="text-sm font-medium text-gray-900">{data.academic_period?.name || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Tanggal Plotting</p>
                            <p className="text-sm font-medium text-gray-900">
                                {data.assigned_at ? new Date(data.assigned_at).toLocaleDateString('id-ID') : '-'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Detail KP */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-600" />
                        Detail KP
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Perusahaan</p>
                            <p className="text-sm font-medium text-gray-900">{data.kp_company?.name || '-'}</p>
                            {data.kp_company?.address && (
                                <p className="text-xs text-gray-500 mt-1">{data.kp_company.address}</p>
                            )}
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Tema KP</p>
                            <p className="text-sm font-medium text-gray-900">{data.kp_theme?.title || '-'}</p>
                        </div>
                    </div>
                </div>

                {/* Daftar Anggota */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-emerald-600" />
                        Anggota Kelompok ({data.members?.length || 0} orang)
                    </h4>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">NIM</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Peran</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {(data.members || []).map((member, index) => (
                                    <tr key={member.id}>
                                        <td className="px-4 py-2 text-sm text-gray-500">{index + 1}</td>
                                        <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                            {member.student?.name || '-'}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-500 font-mono">
                                            {member.student?.nim || '-'}
                                        </td>
                                        <td className="px-4 py-2">
                                            <Badge status={member.role === 'ketua' ? 'amber' : 'gray'}>
                                                {member.role === 'ketua' ? 'Chairman' : 'Member'}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Dokumen yang Diunggah */}
                {data.kp_documents?.length > 0 && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-emerald-600" />
                            Dokumen ({data.kp_documents.length} file)
                        </h4>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Jenis Dokumen</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {(data.kp_documents || []).map((doc, index) => (
                                        <tr key={doc.id}>
                                            <td className="px-4 py-2 text-sm text-gray-500">{index + 1}</td>
                                            <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                                {doc.document_type?.name || doc.title || '-'}
                                            </td>
                                            <td className="px-4 py-2">
                                                <Badge status={doc.status === 'approved' ? 'approved' : doc.status === 'rejected' ? 'ditolak' : 'submitted'}>
                                                    {doc.status === 'approved' ? 'Disetujui' : doc.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end pt-6 mt-6 border-t border-gray-200">
                <Button variant="secondary" onClick={onClose}>Tutup</Button>
            </div>
        </Modal>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const KelompokBimbinganDosen = () => {
    const [search, setSearch] = useState('');
    const [selectedData, setSelectedData] = useState(null);
    const [showDetail, setShowDetail] = useState(false);

    // Auth - check if user is a lecturer
    const user = useSelector(s => s.auth.user);
    const isDosen = user?.roles?.some(r => r === 'dosen') || false;

    // API
    const { data: groupsRaw, isLoading } = useGetMyAssignedGroupsQuery();

    // Process data
    const groups = useMemo(() =>
        Array.isArray(groupsRaw) ? groupsRaw
        : Array.isArray(groupsRaw?.data) ? groupsRaw.data : [],
    [groupsRaw]);

    const filtered = useMemo(() =>
        groups.filter(g =>
            !search || g.code?.toLowerCase().includes(search.toLowerCase()) ||
            g.kp_company?.name?.toLowerCase().includes(search.toLowerCase())
        ),
    [groups, search]);

    // Stats
    const stats = useMemo(() => ({
        total: groups.length,
        berjalan: groups.filter(g => g.status === 'berjalan').length,
        disetujui: groups.filter(g => g.status === 'disetujui').length,
    }), [groups]);

    // Handlers
    const handleView = (data) => {
        setSelectedData(data);
        setShowDetail(true);
    };

    // Columns
    const columns = [
        {
            name: 'Kode',
            selector: r => r.code || '-',
            sortable: true,
            width: '120px',
            cell: r => <code className="text-xs">{r.code}</code>,
        },
        {
            name: 'Perusahaan',
            selector: r => r.kp_company?.name || '-',
            sortable: true,
            wrap: true,
        },
        {
            name: 'Tema',
            selector: r => r.kp_theme?.title || '-',
            sortable: true,
            wrap: true,
        },
        {
            name: 'Periode',
            selector: r => r.academic_period?.name || '-',
            sortable: true,
            wrap: true,
        },
        {
            name: 'Anggota',
            selector: r => r.members_count || r.members?.length || 0,
            width: '90px',
            center: true,
        },
        {
            name: 'Status',
            selector: r => r.status,
            width: '120px',
            center: true,
            cell: r => getStatusBadge(r.status),
        },
        {
            name: 'Aksi',
            width: '80px',
            center: true,
            cell: r => (
                <Button size="sm" variant="secondary" icon={Users} onClick={() => handleView(r)}>
                    Detail
                </Button>
            ),
        },
    ];

    if (!isDosen) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Kelompok Bimbingan"
                    description="Kelompok KP yang dibimbing oleh Anda"
                    icon={Users}
                />
                <Card>
                    <div className="p-8 text-center">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">
                            Anda tidak memiliki akses sebagai dosen pembimbing.
                        </p>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Kelompok Bimbingan"
                description="Kelompok KP yang dibimbing oleh Anda"
                icon={Users}
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-white">
                    <div className="p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Total Kelompok</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                    </div>
                </Card>
                <Card className="bg-emerald-50 border-emerald-200">
                    <div className="p-4">
                        <p className="text-xs text-emerald-700 uppercase tracking-wide">Disetujui</p>
                        <p className="text-2xl font-bold text-emerald-900 mt-1">{stats.disetujui}</p>
                    </div>
                </Card>
                <Card className="bg-yellow-50 border-yellow-200">
                    <div className="p-4">
                        <p className="text-xs text-yellow-700 uppercase tracking-wide">Berjalan</p>
                        <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.berjalan}</p>
                    </div>
                </Card>
            </div>

            {/* Search */}
            <Card>
                <div className="p-4 border-b border-gray-200">
                    <input
                        type="text"
                        placeholder="Cari kode kelompok atau perusahaan..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
            </Card>

            {/* Table */}
            <Card title="Daftar Kelompok" subtitle={`${filtered.length} kelompok`}>
                {isLoading ? (
                    <Skeleton className="h-64" />
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">
                            {search ? 'Tidak ada hasil pencarian' : 'Belum ada kelompok yang dibimbing'}
                        </p>
                    </div>
                ) : (
                    <DataTableWrapper columns={columns} data={filtered} pagination />
                )}
            </Card>

            {/* Modals */}
            {showDetail && selectedData && (
                <DetailModal data={selectedData} onClose={() => setShowDetail(false)} />
            )}
        </div>
    );
};

export default KelompokBimbinganDosen;