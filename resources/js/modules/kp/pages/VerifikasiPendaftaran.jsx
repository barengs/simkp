import React, { useState, useMemo } from 'react';
import {
    useGetVerifikasiQuery,
    useUpdateVerifikasiMutation,
    useGetAvailableLecturersQuery,
    useAssignSupervisorMutation,
} from '../api/kpApi';
import { handleApiError, handleApiSuccess } from '../../shared/api/errorHandler';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import DataTableWrapper from '../../../components/ui/DataTableWrapper';
import Skeleton from '../../../components/ui/Skeleton';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Textarea from '../../../components/ui/Textarea';
import Select from '../../../components/ui/Select';
import Combobox from '../../../components/ui/Combobox';
import {
    FileText, Search, CheckCircle2, XCircle, Eye,
    Check, X, AlertCircle, Building2, BookOpen, CalendarDays,
    GraduationCap, UserPlus, User, Users,
} from 'lucide-react';

// ─── Status configuration ─────────────────────────────────────────────────────
const STATUS_CONFIG = {
    draft: { label: 'Draft', color: 'gray' },
    diajukan: { label: 'Menunggu Validasi', color: 'yellow' },
    ditolak: { label: 'Ditolak', color: 'red' },
    disetujui: { label: 'Disetujui', color: 'emerald' },
};

const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
    return <Badge status={config.color}>{config.label}</Badge>;
};

// ─── Detail Modal ────────────────────────────────────────────────────────────
const DetailModal = ({ data, onClose, onApprove, onReject, onPlot, isProcessing, canPlot }) => {
    if (!data) return null;
    const ketua = data.members?.find(
        member => member.role === "ketua"
    );

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="Detail Pendaftaran KP"
            size="lg"
        >
            <div className="space-y-6">
                {/* Informasi Mahasiswa */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-emerald-600" />
                        Informasi Mahasiswa
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Nama</p>
                            <p className="text-sm font-medium text-gray-900">{ketua.student?.user?.name || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">NIM</p>
                            <p className="text-sm font-medium text-gray-900">{ketua.student?.nim || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                            {getStatusBadge(data.status)}
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
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Periode</p>
                            <p className="text-sm font-medium text-gray-900">
                                {data.academic_period?.name || '-'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Tanggal Daftar</p>
                            <p className="text-sm font-medium text-gray-900">
                                {data.created_at ? new Date(data.created_at).toLocaleDateString('id-ID') : '-'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Kode Kelompok</p>
                            <p className="text-sm font-medium text-gray-900 font-mono">
                                {data.code || '-'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Anggota Kelompok */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-600" />
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
                                            {member.student?.user?.name || '-'}
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
                <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-600" />
                        Dokumen ({data.kp_documents?.length || 0} file)
                    </h4>
                    {data.kp_documents?.length > 0 ? (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Jenis Dokumen</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Upload</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {(data.kp_documents || []).map((doc, index) => (
                                        <tr key={doc.id}>
                                            <td className="px-4 py-2 text-sm text-gray-500">{index + 1}</td>
                                            <td className="px-4 py-2">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {doc.document_type?.name || doc.title || '-'}
                                                        </p>
                                                        {doc.document_type?.code && (
                                                            <p className="text-xs text-gray-500 font-mono">
                                                                {doc.document_type.code}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2">
                                                <Badge status={doc.status === 'approved' ? 'approved' : doc.status === 'rejected' ? 'ditolak' : 'submitted'}>
                                                    {doc.status === 'approved' ? 'Disetujui' : doc.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-500">
                                                {doc.submitted_at
                                                    ? new Date(doc.submitted_at).toLocaleDateString('id-ID')
                                                    : (doc.created_at ? new Date(doc.created_at).toLocaleDateString('id-ID') : '-')}
                                            </td>
                                            <td className="px-4 py-2">
                                                {doc.file_url ? (
                                                    <a
                                                        href={doc.file_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-emerald-600 hover:text-emerald-800 font-medium"
                                                    >
                                                        View
                                                    </a>
                                                ) : (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-lg p-6 text-center">
                            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Belum ada dokumen yang diunggah</p>
                        </div>
                    )}
                </div>

                {/* Catatan Penolakan */}
                {data.rejection_note && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs font-medium text-red-800 uppercase tracking-wide mb-1">
                                    Catatan Penolakan
                                </p>
                                <p className="text-sm text-red-700">{data.rejection_note}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                {data.status === 'diajukan' && (
                    <>
                        <Button variant="secondary" onClick={onClose}>
                            Tutup
                        </Button>
                        <Button
                            variant="danger"
                            icon={X}
                            onClick={onReject}
                            loading={isProcessing}
                        >
                            Tolak
                        </Button>
                        <Button
                            variant="primary"
                            icon={Check}
                            onClick={onApprove}
                            loading={isProcessing}
                        >
                            Setuju
                        </Button>
                    </>
                )}
                {data.status === 'disetujui' && (
                    <>
                        <Button variant="secondary" onClick={onClose}>
                            Tutup
                        </Button>
                        {canPlot && (
                            <Button
                                variant="primary"
                                icon={UserPlus}
                                onClick={onPlot}
                                loading={isProcessing}
                            >
                                Plotting Dosen
                            </Button>
                        )}
                    </>
                )}
            </div>
        </Modal>
    );
};

// ─── Reject Modal ─────────────────────────────────────────────────────────────
const RejectModal = ({ isOpen, onClose, onConfirm, submitting, data }) => {
    const [reason, setReason] = useState('');

    const handleConfirm = () => {
        onConfirm(reason);
        setReason('');
    };

    const handleClose = () => {
        setReason('');
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Tolak Pendaftaran KP"
            size="md"
        >
            <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800 flex gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-600" />
                    <span>Konfirmasi penolakan pendaftaran KP.</span>
                </div>

                <div>
                    <p className="text-sm text-gray-600 mb-2">
                        Pendaftaran dari <strong>{data?.student?.name}</strong> ({data?.student?.nim}) akan ditolak.
                    </p>
                </div>

                <Textarea
                    label="Catatan Penolakan"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Jelaskan alasan penolakan..."
                    rows={4}
                    required
                />
            </div>

            <div className="flex justify-end gap-3 pt-6">
                <Button variant="secondary" onClick={handleClose}>
                    Batal
                </Button>
                <Button
                    variant="danger"
                    icon={XCircle}
                    onClick={handleConfirm}
                    loading={submitting}
                    disabled={!reason.trim()}
                >
                    Tolak Pendaftaran
                </Button>
            </div>
        </Modal>
    );
};

// ─── Approve Modal ────────────────────────────────────────────────────────────
const ApproveModal = ({ isOpen, onClose, onConfirm, submitting, data }) => {
    const [notes, setNotes] = useState('');

    const handleConfirm = () => {
        onConfirm(notes);
        setNotes('');
    };

    const handleClose = () => {
        setNotes('');
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Setuju Pendaftaran KP"
            size="md"
        >
            <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-800 flex gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-600" />
                    <span>Pendaftaran akan disetujui dan mahasiswa dapat melanjutkan ke tahap berikutnya.</span>
                </div>

                <div>
                    <p className="text-sm text-gray-600 mb-2">
                        Setuju pendaftaran dari <strong>{data?.student?.name}</strong> ({data?.student?.nim})?
                    </p>
                </div>

                <Textarea
                    label="Catatan (Opsional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tambahkan catatan atau apresiasi..."
                    rows={4}
                />
            </div>

            <div className="flex justify-end gap-3 pt-6">
                <Button variant="secondary" onClick={handleClose}>
                    Batal
                </Button>
                <Button
                    variant="primary"
                    icon={CheckCircle2}
                    onClick={handleConfirm}
                    loading={submitting}
                >
                    Setuju Pendaftaran
                </Button>
            </div>
        </Modal>
    );
};

// ─── Plotting Modal ───────────────────────────────────────────────────────────
const PlottingModal = ({ isOpen, onClose, onConfirm, submitting, data, lecturers }) => {
    const [selectedLecturer, setSelectedLecturer] = useState('');

    // Convert lecturers to options format for combobox
    const lecturerOptions = (lecturers || []).map(l => ({
        value: l.id,
        label: l.name || l.label,
    }));

    const handleConfirm = () => {
        if (!selectedLecturer) return;
        onConfirm(Number(selectedLecturer));
        setSelectedLecturer('');
    };

    const handleClose = () => {
        setSelectedLecturer('');
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Plotting Dosen Pembimbing"
            size="md"
        >
            <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 flex gap-2">
                    <UserPlus className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                    <span>Pilih dosen pembimbing untuk kelompok ini.</span>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Kelompok</p>
                    <p className="text-sm font-medium text-gray-900 font-mono">{data?.code}</p>
                    <p className="text-xs text-gray-500">{data?.kp_company?.name}</p>
                </div>

                <Combobox
                    label="Pilih Dosen Pembimbing"
                    value={selectedLecturer}
                    onChange={(e) => setSelectedLecturer(e.target.value)}
                    options={lecturerOptions}
                    placeholder="Cari atau pilih dosen..."
                    required
                />
            </div>

            <div className="flex justify-end gap-3 pt-6">
                <Button variant="secondary" onClick={handleClose}>
                    Batal
                </Button>
                <Button
                    variant="primary"
                    icon={User}
                    onClick={handleConfirm}
                    loading={submitting}
                    disabled={!selectedLecturer}
                >
                    Plotting
                </Button>
            </div>
        </Modal>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const VerifikasiPendaftaran = () => {
    // API
    const { data: verifikasiRaw, isLoading, refetch } = useGetVerifikasiQuery();
    const { data: lecturersRaw } = useGetAvailableLecturersQuery();
    const [updateVerifikasi, { isLoading: isUpdating }] = useUpdateVerifikasiMutation();
    const [assignSupervisor, { isLoading: isAssigning }] = useAssignSupervisorMutation();

    // State
    const [search, setSearch] = useState('');
    const [selectedData, setSelectedData] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [showReject, setShowReject] = useState(false);
    const [showApprove, setShowApprove] = useState(false);
    const [showPlotting, setShowPlotting] = useState(false);
    const [filterStatus, setFilterStatus] = useState('');

    // Process data
    const verifikasi = useMemo(() =>
        Array.isArray(verifikasiRaw) ? verifikasiRaw
        : Array.isArray(verifikasiRaw?.data) ? verifikasiRaw.data : [],
    [verifikasiRaw]);

    const lecturers = useMemo(() =>
        Array.isArray(lecturersRaw) ? lecturersRaw
        : Array.isArray(lecturersRaw?.data) ? lecturersRaw.data : [],
    [lecturersRaw]);

    const filtered = useMemo(() =>
        verifikasi.filter(item => {
            const matchSearch = !search ||
                item.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
                item.student?.nim?.toLowerCase().includes(search.toLowerCase()) ||
                item.kp_company?.name?.toLowerCase().includes(search.toLowerCase()) ||
                item.code?.toLowerCase().includes(search.toLowerCase());

            const matchStatus = !filterStatus || item.status === filterStatus;

            return matchSearch && matchStatus;
        }),
    [verifikasi, search, filterStatus]);

    // Stats
    const stats = useMemo(() => ({
        total: verifikasi.length,
        diajukan: verifikasi.filter(v => v.status === 'diajukan').length,
        disetujui: verifikasi.filter(v => v.status === 'disetujui').length,
        ditolak: verifikasi.filter(v => v.status === 'ditolak').length,
    }), [verifikasi]);

    // Handlers
    const handleView = (data) => {
        setSelectedData(data);
        setShowDetail(true);
    };

    const handleReject = (reason) => {
        if (!reason.trim()) return;
        submitVerification(selectedData.id, 'ditolak', reason)
            .then(() => {
                setShowReject(false);
                setShowDetail(false);
                refetch();
            })
            .catch(() => {});
    };

    const handleApprove = (notes) => {
        submitVerification(selectedData.id, 'disetujui', notes)
            .then(() => {
                setShowApprove(false);
                setShowDetail(false);
                refetch();
            })
            .catch(() => {});
    };

    const handlePlotting = (lecturerId) => {
        submitPlotting(selectedData.id, lecturerId);
    };

    const submitVerification = async (id, status, notes) => {
        try {
            await updateVerifikasi({ id, status, rejection_note: notes }).unwrap();
            handleApiSuccess(status === 'disetujui'
                ? 'Pendaftaran berhasil disetujui'
                : 'Pendaftaran ditolak');
        } catch (err) {
            handleApiError(err, 'Gagal memproses verifikasi');
            throw err;
        }
    };

    const submitPlotting = async (id, lecturerId) => {
        try {
            await assignSupervisor({ kp_group_id: id, lecturer_id: lecturerId }).unwrap();
            handleApiSuccess('Dosen pembimbing berhasil ditugaskan');
            setShowPlotting(false);
            setShowDetail(false);
            refetch();
        } catch (err) {
            handleApiError(err, 'Gagal menugaskan dosen pembimbing');
        }
    };

    // Table columns
    const columns = [
        {
            name: 'Mahasiswa',
            selector: row =>
                row.members?.find(m => m.role === "ketua")
                    ?.student?.user?.name ?? "-",
            sortable: true,
            wrap: true,
            cell: row => {
                const ketua = row.members?.find(m => m.role === "ketua");
                return (
                    <div>
                        <p className="text-sm font-medium text-gray-900">{ketua?.student?.user?.name || '-'}</p>
                        <p className="text-xs text-gray-500 font-mono">{ketua?.student?.nim || '-'}</p>
                    </div>
                );
            }
        },
        {
            name: 'Perusahaan',
            selector: row => row.kp_company?.name || '-',
            sortable: true,
            wrap: true,
        },
        {
            name: 'Tema KP',
            selector: row => row.kp_theme?.title || '-',
            sortable: true,
            wrap: true,
        },
        {
            name: 'Periode',
            selector: row => row.academic_period?.name || '-',
            sortable: true,
            wrap: true,
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
            selector: row => row.created_at,
            sortable: true,
            width: '120px',
            cell: row => row.created_at
                ? new Date(row.created_at).toLocaleDateString('id-ID')
                : '-',
        },
        {
            name: 'Aksi',
            width: '140px',
            center: true,
            cell: row => (
                <div className="flex gap-1">
                    <Button
                        size="sm"
                        variant="secondary"
                        icon={Eye}
                        onClick={() => handleView(row)}
                    />
                    {row.status === 'diajukan' && (
                        <>
                            <Button
                                size="sm"
                                variant="success"
                                icon={Check}
                                onClick={() => {
                                    setSelectedData(row);
                                    setShowApprove(true);
                                }}
                            />
                            <Button
                                size="sm"
                                variant="danger"
                                icon={X}
                                onClick={() => {
                                    setSelectedData(row);
                                    setShowReject(true);
                                }}
                            />
                        </>
                    )}
                    {row.status === 'disetujui' && (
                        <Button
                            size="sm"
                            variant="primary"
                            icon={UserPlus}
                            onClick={() => {
                                setSelectedData(row);
                                setShowPlotting(true);
                            }}
                        >
                            Plotting
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Verifikasi Pendaftaran KP"
                description="Validasi dan approve/reject pendaftaran kelompok kerja praktek"
                icon={FileText}
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Card className="bg-white">
                    <div className="p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Total Pendaftaran</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                    </div>
                </Card>
                <Card className="bg-yellow-50 border-yellow-200">
                    <div className="p-4">
                        <p className="text-xs text-yellow-700 uppercase tracking-wide">Menunggu Validasi</p>
                        <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.diajukan}</p>
                    </div>
                </Card>
                <Card className="bg-emerald-50 border-emerald-200">
                    <div className="p-4">
                        <p className="text-xs text-emerald-700 uppercase tracking-wide">Disetujui</p>
                        <p className="text-2xl font-bold text-emerald-900 mt-1">{stats.disetujui}</p>
                    </div>
                </Card>
                <Card className="bg-red-50 border-red-200">
                    <div className="p-4">
                        <p className="text-xs text-red-700 uppercase tracking-wide">Ditolak</p>
                        <p className="text-2xl font-bold text-red-900 mt-1">{stats.ditolak}</p>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <div className="p-4 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Cari berdasarkan nama, NIM, perusahaan, atau kode kelompok..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                icon={Search}
                            />
                        </div>
                        <div className="w-full sm:w-48">
                            <Select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="">Semua Status</option>
                                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                    <option key={key} value={key}>{config.label}</option>
                                ))}
                            </Select>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Table */}
            <Card title="Daftar Pendaftaran" subtitle={`${filtered.length} pendaftaran`}>
                {isLoading ? (
                    <Skeleton className="h-64" />
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">
                            {search || filterStatus ? 'Tidak ada hasil pencarian' : 'Belum ada pendaftaran'}
                        </p>
                    </div>
                ) : (
                    <DataTableWrapper
                        columns={columns}
                        data={filtered}
                        pagination
                        highlightOnHover
                    />
                )}
            </Card>

            {/* Modals */}
            {showDetail && (
                <DetailModal
                    data={selectedData}
                    onClose={() => setShowDetail(false)}
                    onApprove={() => setShowApprove(true)}
                    onReject={() => setShowReject(true)}
                    onPlot={() => setShowPlotting(true)}
                    isProcessing={isUpdating}
                    canPlot={true}
                />
            )}

            {showReject && (
                <RejectModal
                    isOpen={showReject}
                    onClose={() => setShowReject(false)}
                    onConfirm={handleReject}
                    submitting={isUpdating}
                    data={selectedData}
                />
            )}

            {showApprove && (
                <ApproveModal
                    isOpen={showApprove}
                    onClose={() => setShowApprove(false)}
                    onConfirm={handleApprove}
                    submitting={isUpdating}
                    data={selectedData}
                />
            )}

            {showPlotting && (
                <PlottingModal
                    isOpen={showPlotting}
                    onClose={() => setShowPlotting(false)}
                    onConfirm={handlePlotting}
                    submitting={isAssigning}
                    data={selectedData}
                    lecturers={lecturers}
                />
            )}
        </div>
    );
};

export default VerifikasiPendaftaran;