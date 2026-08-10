import React, { useState, useMemo } from 'react';
import {
    useGetUnassignedGroupsQuery,
    useGetAssignedGroupsQuery,
    useGetAvailableLecturersQuery,
    useAssignSupervisorMutation,
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
import Select from '../../../components/ui/Select';
import {
    Users, Search, CheckCircle2, UserPlus, UserMinus,
    Building2, BookOpen, CalendarDays, GraduationCap, Crown,
} from 'lucide-react';

const STATUS_LABEL = {
    draft: 'Draft',
    diajukan: 'Menunggu Validasi',
    ditolak: 'Ditolak',
    disetujui: 'Disetujui',
    berjalan: 'Berjalan',
    laporan_masuk: 'Laporan Masuk',
    revisi_laporan: 'Revisi Laporan',
    dinilai: 'Dinilai',
    selesai: 'Selesai',
};

const getStatusBadge = (status) => {
    const config = {
        draft: 'gray', diajukan: 'blue', ditolak: 'red',
        disetujui: 'emerald', berjalan: 'yellow',
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
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Tanggal Daftar</p>
                            <p className="text-sm font-medium text-gray-900">
                                {data.created_at ? new Date(data.created_at).toLocaleDateString('id-ID') : '-'}
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

                {/* Anggota Kelompok */}
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
                                            <Badge status={member.role === 'ketua' ? 'ketua' : 'anggota'}>
                                                {member.role === 'ketua' ? 'Chairman' : 'Member'}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-6 mt-6 border-t border-gray-200">
                <Button variant="secondary" onClick={onClose}>Tutup</Button>
            </div>
        </Modal>
    );
};

// ─── Assign Modal ─────────────────────────────────────────────────────────────
const AssignModal = ({ isOpen, onClose, onConfirm, groups, lecturers, submitting }) => {
    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedLecturer, setSelectedLecturer] = useState('');

    const handleConfirm = () => {
        if (!selectedGroup || !selectedLecturer) return;
        onConfirm({ kp_group_id: Number(selectedGroup), lecturer_id: Number(selectedLecturer) });
        setSelectedGroup('');
        setSelectedLecturer('');
    };

    const handleClose = () => {
        setSelectedGroup('');
        setSelectedLecturer('');
        onClose();
    };

    const group = groups.find(g => g.id === Number(selectedGroup));

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Plotting Dosen Pembimbing" size="md">
            <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 flex gap-2">
                    <UserPlus className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                    <span>Pilih kelompok KP dan dosen pembimbing yang akan ditugaskan.</span>
                </div>

                <Select
                    label="Pilih Kelompok KP"
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    required
                >
                    <option value="">-- Pilih Kelompok --</option>
                    {groups.map(g => (
                        <option key={g.id} value={g.id}>
                            {g.code} - {g.kp_company?.name} ({g.members?.length} anggota)
                        </option>
                    ))}
                </Select>

                {group && (
                    <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Kelompok Dipilih:</p>
                        <p className="text-sm font-medium text-gray-900">{group.code}</p>
                        <p className="text-xs text-gray-500">{group.kp_company?.name}</p>
                        <p className="text-xs text-gray-500">{group.members?.length} anggota</p>
                    </div>
                )}

                <Select
                    label="Pilih Dosen Pembimbing"
                    value={selectedLecturer}
                    onChange={(e) => setSelectedLecturer(e.target.value)}
                    required
                >
                    <option value="">-- Pilih Dosen --</option>
                    {lecturers.map(l => (
                        <option key={l.id} value={l.id}>
                            {l.name} ({l.nidn})
                        </option>
                    ))}
                </Select>
            </div>

            <div className="flex justify-end gap-3 pt-6">
                <Button variant="secondary" onClick={handleClose}>Batal</Button>
                <Button
                    variant="primary"
                    icon={UserPlus}
                    onClick={handleConfirm}
                    loading={submitting}
                    disabled={!selectedGroup || !selectedLecturer}
                >
                    Plotting Dosen
                </Button>
            </div>
        </Modal>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const PlottingDosen = () => {
    const [activeTab, setActiveTab] = useState('unassigned');
    const [search, setSearch] = useState('');
    const [selectedData, setSelectedData] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [showAssign, setShowAssign] = useState(false);

    // API
    const { data: unassignedRaw, isLoading: loadingUnassigned } = useGetUnassignedGroupsQuery();
    const { data: assignedRaw, isLoading: loadingAssigned } = useGetAssignedGroupsQuery();
    const { data: lecturersRaw, isLoading: loadingLecturers } = useGetAvailableLecturersQuery();
    const [assignSupervisor, { isLoading: submittingAssign }] = useAssignSupervisorMutation();
    const [removeSupervisor, { isLoading: submittingRemove }] = useRemoveSupervisorMutation();

    // Process data
    const unassignedGroups = useMemo(() =>
        Array.isArray(unassignedRaw) ? unassignedRaw
        : Array.isArray(unassignedRaw?.data) ? unassignedRaw.data : [],
    [unassignedRaw]);

    const assignedGroups = useMemo(() =>
        Array.isArray(assignedRaw) ? assignedRaw
        : Array.isArray(assignedRaw?.data) ? assignedRaw.data : [],
    [assignedRaw]);

    const lecturers = useMemo(() =>
        Array.isArray(lecturersRaw) ? lecturersRaw
        : Array.isArray(lecturersRaw?.data) ? lecturersRaw.data : [],
    [lecturersRaw]);

    const filteredUnassigned = useMemo(() =>
        unassignedGroups.filter(g =>
            !search || g.code?.toLowerCase().includes(search.toLowerCase()) ||
            g.kp_company?.name?.toLowerCase().includes(search.toLowerCase())
        ),
    [unassignedGroups, search]);

    const filteredAssigned = useMemo(() =>
        assignedGroups.filter(g =>
            !search || g.code?.toLowerCase().includes(search.toLowerCase()) ||
            g.kp_company?.name?.toLowerCase().includes(search.toLowerCase()) ||
            g.supervisor?.name?.toLowerCase().includes(search.toLowerCase())
        ),
    [assignedGroups, search]);

    // Stats
    const stats = useMemo(() => ({
        unassigned: unassignedGroups.length,
        assigned: assignedGroups.length,
        total: unassignedGroups.length + assignedGroups.length,
    }), [unassignedGroups, assignedGroups]);

    // Handlers
    const handleView = (data) => {
        setSelectedData(data);
        setShowDetail(true);
    };

    const handleAssign = async ({ kp_group_id, lecturer_id }) => {
        try {
            await assignSupervisor({ kp_group_id, lecturer_id }).unwrap();
            handleApiSuccess('Dosen pembimbing berhasil ditugaskan');
            setShowAssign(false);
        } catch (err) {
            handleApiError(err, 'Gagal menugaskan dosen pembimbing');
        }
    };

    const handleRemove = async (kpGroupId) => {
        if (!confirm('Yakin ingin menghapus plotting dosen pembimbing?')) return;
        try {
            await removeSupervisor(kpGroupId).unwrap();
            handleApiSuccess('Dosen pembimbing berhasil dihapus');
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
            name: 'Status',
            selector: r => r.status,
            width: '100px',
            center: true,
            cell: r => getStatusBadge(r.status),
        },
        {
            name: 'Aksi',
            width: '180px',
            center: true,
            cell: r => (
                <div className="flex gap-1">
                    <Button size="sm" variant="secondary" icon={Users} onClick={() => handleView(r)}>
                        Detail
                    </Button>
                    {activeTab === 'unassigned' ? (
                        <Button size="sm" variant="primary" icon={UserPlus} onClick={() => { setSelectedData(r); setShowAssign(true); }}>
                            Plotting
                        </Button>
                    ) : (
                        <Button size="sm" variant="danger" icon={UserMinus} onClick={() => handleRemove(r.id)}>
                            Hapus
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    const assignedColumns = [
        ...columns.slice(0, 5),
        {
            name: 'Dosen Pembimbing',
            selector: r => r.supervisor?.name || '-',
            sortable: true,
            wrap: true,
            cell: r => r.supervisor ? (
                <div>
                    <p className="text-sm font-medium text-gray-900">{r.supervisor.name}</p>
                    <p className="text-xs text-gray-500 font-mono">{r.supervisor.nidn}</p>
                </div>
            ) : '-',
        },
        ...columns.slice(5),
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Plotting Dosen Pembimbing"
                description="Tugaskan dosen pembimbing ke kelompok KP yang sudah disetujui"
                icon={Users}
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-white">
                    <div className="p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Belum Plotting</p>
                        <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.unassigned}</p>
                    </div>
                </Card>
                <Card className="bg-white">
                    <div className="p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Sudah Plotting</p>
                        <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.assigned}</p>
                    </div>
                </Card>
                <Card className="bg-white">
                    <div className="p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Total Kelompok</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                    </div>
                </Card>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="border-b border-gray-200 px-2 flex gap-1">
                    <button
                        onClick={() => setActiveTab('unassigned')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'unassigned'
                                ? 'border-emerald-500 text-emerald-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Belum Plotting ({stats.unassigned})
                    </button>
                    <button
                        onClick={() => setActiveTab('assigned')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'assigned'
                                ? 'border-emerald-500 text-emerald-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Sudah Plotting ({stats.assigned})
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-200">
                    <input
                        type="text"
                        placeholder="Cari kode kelompok, perusahaan, atau dosen..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>

                {/* Table */}
                <div className="p-4">
                    {loadingUnassigned || loadingAssigned ? (
                        <Skeleton className="h-64" />
                    ) : activeTab === 'unassigned' ? (
                        filteredUnassigned.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">
                                    {search ? 'Tidak ada hasil pencarian' : 'Semua kelompok sudah memiliki dosen pembimbing'}
                                </p>
                            </div>
                        ) : (
                            <DataTableWrapper columns={columns} data={filteredUnassigned} pagination />
                        )
                    ) : (
                        filteredAssigned.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">
                                    {search ? 'Tidak ada hasil pencarian' : 'Belum ada kelompok yang diplotting'}
                                </p>
                            </div>
                        ) : (
                            <DataTableWrapper columns={assignedColumns} data={filteredAssigned} pagination />
                        )
                    )}
                </div>
            </div>

            {/* Modals */}
            {showDetail && (
                <DetailModal data={selectedData} onClose={() => setShowDetail(false)} />
            )}

            {showAssign && (
                <AssignModal
                    isOpen={showAssign}
                    onClose={() => setShowAssign(false)}
                    onConfirm={handleAssign}
                    groups={unassignedGroups}
                    lecturers={lecturers}
                    submitting={submittingAssign}
                />
            )}
        </div>
    );
};

export default PlottingDosen;