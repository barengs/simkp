import React, { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    useGetAssignedGroupsQuery,
    useGetMyAssignedGroupsQuery,
    useRemoveSupervisorMutation,
} from '../api/kpApi';
import { handleApiError, handleApiSuccess } from '../../shared/api/errorHandler';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import DataTableWrapper from '../../../components/ui/DataTableWrapper';
import Skeleton from '../../../components/ui/Skeleton';
import Modal from '../../../components/ui/Modal';
import {
    Users, FileText, Search, Building2, BookOpen, CalendarDays,
    GraduationCap, Crown, Eye, Trash2, UserMinus, UsersRound,
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

// ─── Remove Supervisor Modal (Admin only) ─────────────────────────────────────
const RemoveSupervisorModal = ({ isOpen, onClose, onConfirm, submitting, data }) => {
    if (!data) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Hapus Plotting Dosen"
            size="md"
        >
            <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800 flex gap-2">
                    <UserMinus className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-600" />
                    <span>Konfirmasi penghapusan plotting dosen pembimbing.</span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Kelompok</p>
                    <p className="text-sm font-medium text-gray-900 font-mono">{data.code}</p>
                    <p className="text-xs text-gray-500">{data.kp_company?.name}</p>
                </div>

                {data.supervisor && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Dosen Pembimbing Saat Ini</p>
                        <p className="text-sm font-medium text-gray-900">{data.supervisor.name}</p>
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-3 pt-6">
                <Button variant="secondary" onClick={onClose}>
                    Batal
                </Button>
                <Button
                    variant="danger"
                    icon={Trash2}
                    onClick={onConfirm}
                    loading={submitting}
                >
                    Hapus Plotting
                </Button>
            </div>
        </Modal>
    );
};

// ─── Admin View Component ─────────────────────────────────────────────────────
const AdminKelompokView = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [selectedData, setSelectedData] = useState(null);
    const [showRemove, setShowRemove] = useState(false);
    const { data: groupsRaw, isLoading, refetch } = useGetAssignedGroupsQuery();
    const [removeSupervisor, { isLoading: isRemoving }] = useRemoveSupervisorMutation();

    useEffect(() => {
        refetch();
    }, [refetch]);

    // Process data
    const groups = useMemo(() =>
        Array.isArray(groupsRaw) ? groupsRaw
        : Array.isArray(groupsRaw?.data) ? groupsRaw.data : [],
    [groupsRaw]);

    const filtered = useMemo(() =>
        groups.filter(g =>
            !search || g.code?.toLowerCase().includes(search.toLowerCase()) ||
            g.kp_company?.name?.toLowerCase().includes(search.toLowerCase()) ||
            g.supervisor?.name?.toLowerCase().includes(search.toLowerCase())
        ),
    [groups, search]);

    // Stats
    const stats = useMemo(() => ({
        total: groups.length,
        ongoing: groups.filter(g => g.status === 'ongoing').length,
        approved: groups.filter(g => g.status === 'approved').length,
    }), [groups]);

    // Handlers
    const handleView = (data) => {
        navigate(`/kp/daftar-kelompok/${data.id}`);
    };

    const handleRemove = (data) => {
        setSelectedData(data);
        setShowRemove(true);
    };

    const confirmRemove = async () => {
        try {
            await removeSupervisor(selectedData.id).unwrap();
            handleApiSuccess('Plotting dosen pembimbing berhasil dihapus');
            setShowRemove(false);
        } catch (err) {
            handleApiError(err, 'Gagal menghapus plotting');
        }
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
            name: 'Dosen Pembimbing',
            selector: r => r.supervisor?.name || '-',
            sortable: true,
            wrap: true,
            cell: r => r.supervisor ? (
                <div>
                    <p className="text-sm font-medium text-gray-900">{r.supervisor.name}</p>
                    {r.supervisor.nidn && (
                        <p className="text-xs text-gray-500 font-mono">{r.supervisor.nidn}</p>
                    )}
                </div>
            ) : '-',
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
            width: '240px',
            center: true,
            cell: r => (
                <div className="flex gap-1">
                    <Button size="sm" variant="secondary" icon={Eye} onClick={() => handleView(r)}>
                        Detail
                    </Button>
                    <Button size="sm" variant="danger" icon={Trash2} onClick={() => handleRemove(r)}>
                        Hapus
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
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
                        <p className="text-2xl font-bold text-emerald-900 mt-1">{stats.approved}</p>
                    </div>
                </Card>
                <Card className="bg-yellow-50 border-yellow-200">
                    <div className="p-4">
                        <p className="text-xs text-yellow-700 uppercase tracking-wide">Berjalan</p>
                        <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.ongoing}</p>
                    </div>
                </Card>
            </div>

            {/* Search */}
            <Card>
                <div className="p-4 border-b border-gray-200">
                    <input
                        type="text"
                        placeholder="Cari kode kelompok, perusahaan, atau dosen..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
            </Card>

            {/* Table */}
            <Card title="Daftar Kelompok Terplotting" subtitle={`${filtered.length} kelompok`}>
                {isLoading ? (
                    <Skeleton className="h-64" />
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">
                            {search ? 'Tidak ada hasil pencarian' : 'Belum ada kelompok yang diplotting'}
                        </p>
                    </div>
                ) : (
                    <DataTableWrapper columns={columns} data={filtered} pagination />
                )}
            </Card>

            {/* Modals */}
            {showRemove && selectedData && (
                <RemoveSupervisorModal
                    isOpen={showRemove}
                    onClose={() => setShowRemove(false)}
                    onConfirm={confirmRemove}
                    submitting={isRemoving}
                    data={selectedData}
                />
            )}
        </div>
    );
};

// ─── Dosen View Component ─────────────────────────────────────────────────────
const DosenKelompokView = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [selectedData, setSelectedData] = useState(null);

    // API
    const { data: groupsRaw, isLoading, refetch } = useGetMyAssignedGroupsQuery();

    useEffect(() => {
        refetch();
    }, [refetch]);

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
        ongoing: groups.filter(g => g.status === 'ongoing').length,
        approved: groups.filter(g => g.status === 'approved').length,
    }), [groups]);

    // Handlers
    const handleView = (data) => {
        navigate(`/kp/daftar-kelompok/${data.id}`);
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
            width: '190px',
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
            width: '120px',
            center: true,
            cell: r => (
                <Button size="sm" variant="secondary" icon={Eye} onClick={() => handleView(r)}>
                    Detail
                </Button>
            ),
        },
    ];

    return (
        <div className="space-y-6">
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
                        <p className="text-2xl font-bold text-emerald-900 mt-1">{stats.approved}</p>
                    </div>
                </Card>
                <Card className="bg-yellow-50 border-yellow-200">
                    <div className="p-4">
                        <p className="text-xs text-yellow-700 uppercase tracking-wide">Berjalan</p>
                        <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.ongoing}</p>
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
            <Card title="Kelompok Bimbingan Anda" subtitle={`${filtered.length} kelompok`}>
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
            {/* {showRemove && selectedData && (
                <RemoveSupervisorModal
                    isOpen={showRemove}
                    onClose={() => setShowRemove(false)}
                    onConfirm={confirmRemove}
                    submitting={isRemoving}
                    data={selectedData}
                />
            )} */}
        </div>
    );
};

// ─── Main Component (Router Based on Role) ───────────────────────────────────
const DaftarKelompok = () => {
    // Check user role
    const { user, roles, permissions } = useSelector(s => s.auth);
    const isDosen = !!user?.lecturer_id;
    const canViewAll = permissions?.some(p => 
        p === 'kp.plotting-dosen' || p === 'master-data.manage' || p === 'kp.verifikasi-pendaftaran'
    ) || false;

    // Title and description based on role
    const pageConfig = isDosen ? {
        title: 'Kelompok Bimbingan',
        description: 'Kelompok KP yang Anda bimbing',
        icon: Users,
        showAdminView: false,
    } : {
        title: 'Daftar Kelompok Terplotting',
        description: 'Semua kelompok KP yang sudah memiliki dosen pembimbing',
        icon: UsersRound,
        showAdminView: true,
    };

    // If lecturer, show dosen's view
    if (isDosen) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title={pageConfig.title}
                    description={pageConfig.description}
                    icon={pageConfig.icon}
                />
                <DosenKelompokView />
            </div>
        );
    }

    // If admin/coordinator, show admin's view
    if (canViewAll) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title={pageConfig.title}
                    description={pageConfig.description}
                    icon={pageConfig.icon}
                />
                <AdminKelompokView />
            </div>
        );
    }

    // No access
    return (
        <div className="space-y-6">
            <PageHeader
                title="Akses Ditolak"
                description="Anda tidak memiliki akses ke halaman ini"
                icon={Users}
            />
            <Card>
                <div className="p-8 text-center">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                        Anda tidak memiliki izin untuk mengakses halaman ini.
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default DaftarKelompok;