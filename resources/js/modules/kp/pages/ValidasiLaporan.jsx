import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
    useGetReportQuery,
    useUpdateReportMutation,
    useCreateGroupGradeMutation,
    useGetEvaluationCriteriaQuery,
} from '../api/kpApi';
import { handleApiError, handleApiSuccess } from '../../shared/api/errorHandler';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import DataTableWrapper from '../../../components/ui/DataTableWrapper';
import Skeleton from '../../../components/ui/Skeleton';
import Modal from '../../../components/ui/Modal';
import Textarea from '../../../components/ui/Textarea';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import {
    FileText, Search, Check, X, AlertCircle, Eye, Award,
} from 'lucide-react';

const STATUS_CONFIG = {
    pending: { label: 'Menunggu Review', color: 'yellow' },
    approved: { label: 'Disetujui', color: 'green' },
    rejected: { label: 'Perlu Revisi', color: 'red' },
};

const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return <Badge status={config.color}>{config.label}</Badge>;
};

const ActionModal = ({ isOpen, onClose, onConfirm, submitting, type }) => {
    const [message, setMessage] = useState('');

    const handleConfirm = () => {
        onConfirm(message);
        setMessage('');
    };

    const handleClose = () => {
        setMessage('');
        onClose();
    };

    const isApprove = type === 'approve';

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={isApprove ? 'Setujui Laporan' : 'Kembalikan untuk Revisi'} size="md">
            <div className="space-y-4">
                <div className={`rounded-lg p-3 text-sm flex gap-2 ${isApprove ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                        {isApprove
                            ? 'Konfirmasi bahwa laporan ini telah divalidasi dan disetujui.'
                            : 'Berikan catatan revisi yang jelas untuk mahasiswa.'}
                    </span>
                </div>

                <Textarea
                    label={isApprove ? 'Pesan Konfirmasi' : 'Catatan Revisi'}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={isApprove ? 'Opsional: tambahkan pesan konfirmasi...' : 'Jelaskan apa yang perlu diperbaiki...'}
                    rows={4}
                />
            </div>

            <div className="flex justify-end gap-3 pt-6">
                <Button variant="secondary" onClick={handleClose}>Batal</Button>
                <Button
                    variant={isApprove ? 'primary' : 'danger'}
                    onClick={handleConfirm}
                    loading={submitting}
                >
                    {isApprove ? 'Setujui' : 'Kirim Revisi'}
                </Button>
            </div>
        </Modal>
    );
};

const ValidasiLaporan = () => {
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('pending');
    const [showAction, setShowAction] = useState(false);
    const [actionType, setActionType] = useState('approve');
    const [selectedReport, setSelectedReport] = useState(null);
    const [showGradeModal, setShowGradeModal] = useState(false);
    const [gradingReport, setGradingReport] = useState(null);
    const [gradeForm, setGradeForm] = useState({
        score_field: '',
        score_report: '',
        score_seminar: '',
        notes: '',
    });
    const [gradeErrors, setGradeErrors] = useState({});

    const { data: reportsRaw, isLoading, refetch } = useGetReportQuery();
    const [updateReport, { isLoading: isUpdating }] = useUpdateReportMutation();
    const [createGroupGrade, { isLoading: isCreatingGrade }] = useCreateGroupGradeMutation();
    const { data: criteriaRaw } = useGetEvaluationCriteriaQuery();

    const reports = useMemo(() =>
        Array.isArray(reportsRaw) ? reportsRaw
        : Array.isArray(reportsRaw?.data) ? reportsRaw.data : [],
    [reportsRaw]);

    const criteria = useMemo(() =>
        Array.isArray(criteriaRaw) ? criteriaRaw
        : Array.isArray(criteriaRaw?.data) ? criteriaRaw.data : [],
    [criteriaRaw]);

    const filtered = useMemo(() => {
        return reports.filter(item => {
            const groupName = item.kp_group?.name || '';
            const companyName = item.kp_group?.kp_company?.name || '';
            const studentName = item.student?.user?.name || '';
            const matchSearch = !search ||
                studentName.toLowerCase().includes(search.toLowerCase()) ||
                groupName.toLowerCase().includes(search.toLowerCase()) ||
                companyName.toLowerCase().includes(search.toLowerCase());

            const matchStatus = !filterStatus || item.status === filterStatus;

            return matchSearch && matchStatus;
        });
    }, [reports, search, filterStatus]);

    const stats = useMemo(() => ({
        total: reports.length,
        pending: reports.filter(r => r.status === 'pending').length,
        approved: reports.filter(r => r.status === 'approved').length,
        rejected: reports.filter(r => r.status === 'rejected').length,
    }), [reports]);

    const openAction = (report, type) => {
        setSelectedReport(report);
        setActionType(type);
        setShowAction(true);
    };

    const confirmAction = async (message) => {
        if (!selectedReport) return;
        try {
            const payload = {
                id: selectedReport.id,
                status: actionType === 'approve' ? 'approved' : 'rejected',
            };

            if (message) {
                payload.rejection_note = message;
            }

            await updateReport(payload).unwrap();
            handleApiSuccess(
                actionType === 'approve' ? 'Laporan disetujui' : 'Laporan dikembalikan untuk revisi'
            );
            setShowAction(false);
            setSelectedReport(null);
            refetch();
        } catch (err) {
            handleApiError(err, 'Gagal memproses laporan');
        }
    };

    const openGradeModal = (report) => {
        setGradingReport(report);
        setGradeForm({
            score_field: '',
            score_report: '',
            score_seminar: '',
            notes: '',
        });
        setGradeErrors({});
        setShowGradeModal(true);
    };

    const calculateFinalGrade = (field, report, seminar) => {
        const scores = [field, report, seminar].filter(v => v !== null && v !== '');
        if (scores.length === 0) return '';
        const avg = scores.reduce((a, b) => Number(a) + Number(b), 0) / scores.length;
        if (avg >= 80) return 'A';
        if (avg >= 70) return 'B';
        if (avg >= 60) return 'C';
        if (avg >= 50) return 'D';
        return 'E';
    };

    const submitGrade = async () => {
        if (!gradingReport) return;
        setGradeErrors({});
        try {
            await createGroupGrade({
                kp_group_id: gradingReport.kp_group?.id || gradingReport.kp_group_id,
                score_field: gradeForm.score_field ? Number(gradeForm.score_field) : null,
                score_report: gradeForm.score_report ? Number(gradeForm.score_report) : null,
                score_seminar: gradeForm.score_seminar ? Number(gradeForm.score_seminar) : null,
                notes: gradeForm.notes || null,
            }).unwrap();
            handleApiSuccess('Nilai berhasil disimpan untuk seluruh anggota kelompok');
            setShowGradeModal(false);
            setGradingReport(null);
            refetch();
        } catch (err) {
            if (err?.data?.errors) {
                setGradeErrors(err.data.errors);
            }
            handleApiError(err, 'Gagal menyimpan nilai');
        }
    };

    const columns = [
        {
            name: 'Mahasiswa',
            selector: row => row.student?.user?.name || '-',
            sortable: true,
            wrap: true,
            cell: row => (
                <div>
                    <p className="text-sm font-medium text-gray-900">{row.student?.user?.name || '-'}</p>
                    <p className="text-xs text-gray-500 font-mono">{row.student?.nim || '-'}</p>
                </div>
            ),
        },
        {
            name: 'Kelompok',
            selector: row => row.kp_group?.name || '-',
            sortable: true,
            wrap: true,
        },
        {
            name: 'Mitra',
            selector: row => row.kp_group?.kp_company?.name || '-',
            sortable: true,
            wrap: true,
        },
        {
            name: 'Status',
            selector: row => row.status,
            width: '150px',
            center: true,
            cell: row => getStatusBadge(row.status),
        },
        {
            name: 'Dokumen',
            width: '120px',
            center: true,
            cell: row => (
                row.file_url ? (
                    <a
                        href={row.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-800 font-medium"
                    >
                        <Eye className="w-4 h-4" />
                        Lihat
                    </a>
                ) : (
                    <span className="text-xs text-gray-400">-</span>
                )
            ),
        },
        {
            name: 'Aksi',
            width: '280px',
            center: true,
            cell: row => (
                <div className="flex items-center justify-center gap-2">
                    {row.status === 'pending' ? (
                        <>
                            <Button size="sm" variant="primary" icon={Check} onClick={(e) => { e.stopPropagation(); openAction(row, 'approve'); }}>
                                Setujui
                            </Button>
                            <Button size="sm" variant="danger" icon={X} onClick={(e) => { e.stopPropagation(); openAction(row, 'reject'); }}>
                                Revisi
                            </Button>
                        </>
                    ) : row.status === 'approved' ? (
                        <Button size="sm" variant="success" icon={Award} onClick={(e) => { e.stopPropagation(); openGradeModal(row); }}>
                            Input Nilai
                        </Button>
                    ) : (
                        <span className="text-xs text-gray-400">Tidak ada aksi</span>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Validasi Laporan KP"
                description="Tinjau dan validasi laporan mahasiswa"
                icon={FileText}
            />

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Card className="bg-white">
                    <div className="p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                    </div>
                </Card>
                <Card className="bg-yellow-50 border-yellow-200">
                    <div className="p-4">
                        <p className="text-xs text-yellow-700 uppercase tracking-wide">Menunggu</p>
                        <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
                    </div>
                </Card>
                <Card className="bg-emerald-50 border-emerald-200">
                    <div className="p-4">
                        <p className="text-xs text-emerald-700 uppercase tracking-wide">Disetujui</p>
                        <p className="text-2xl font-bold text-emerald-900 mt-1">{stats.approved}</p>
                    </div>
                </Card>
                <Card className="bg-red-50 border-red-200">
                    <div className="p-4">
                        <p className="text-xs text-red-700 uppercase tracking-wide">Revisi</p>
                        <p className="text-2xl font-bold text-red-900 mt-1">{stats.rejected}</p>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <div className="p-4 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Cari mahasiswa atau kelompok..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                icon={Search}
                            />
                        </div>
                        <div className="w-full sm:w-48">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="">Semua Status</option>
                                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                    <option key={key} value={key}>{config.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Table */}
            <Card title="Daftar Laporan" subtitle={`${filtered.length} entri`}>
                {isLoading ? (
                    <Skeleton className="h-64" />
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">
                            {search || filterStatus ? 'Tidak ada hasil pencarian' : 'Belum ada laporan'}
                        </p>
                    </div>
                ) : (
                    <DataTableWrapper
                        columns={columns}
                        data={filtered}
                        pagination
                    />
                )}
            </Card>

            {showAction && (
                <ActionModal
                    isOpen={showAction}
                    onClose={() => {
                        setShowAction(false);
                        setSelectedReport(null);
                    }}
                    onConfirm={confirmAction}
                    submitting={isUpdating}
                    type={actionType}
                />
            )}

            {showGradeModal && gradingReport && (
                <Modal isOpen={showGradeModal} onClose={() => {
                    setShowGradeModal(false);
                    setGradingReport(null);
                }} title="Input Nilai Laporan" size="lg">
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 flex gap-2">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                            <span>Input nilai untuk laporan kelompok <strong>{gradingReport.kp_group?.name || '-'}</strong>. Nilai akan diterapkan ke seluruh anggota kelompok.</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="Nilai Lapangan"
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={gradeForm.score_field}
                                onChange={(e) => setGradeForm(prev => ({ ...prev, score_field: e.target.value }))}
                                placeholder="0.00"
                                error={gradeErrors.score_field?.[0]}
                            />
                            <Input
                                label="Nilai Laporan"
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={gradeForm.score_report}
                                onChange={(e) => setGradeForm(prev => ({ ...prev, score_report: e.target.value }))}
                                placeholder="0.00"
                                error={gradeErrors.score_report?.[0]}
                            />
                            <Input
                                label="Nilai Seminar"
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={gradeForm.score_seminar}
                                onChange={(e) => setGradeForm(prev => ({ ...prev, score_seminar: e.target.value }))}
                                placeholder="0.00"
                                error={gradeErrors.score_seminar?.[0]}
                            />
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Nilai Akhir (Otomatis)</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {calculateFinalGrade(gradeForm.score_field, gradeForm.score_report, gradeForm.score_seminar) || '-'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Dihitung dari rata-rata nilai lapangan, laporan, dan seminar</p>
                        </div>

                        <Textarea
                            label="Catatan"
                            value={gradeForm.notes}
                            onChange={(e) => setGradeForm(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Tambahkan catatan (opsional)..."
                            rows={3}
                            error={gradeErrors.notes?.[0]}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-6">
                        <Button variant="secondary" onClick={() => {
                            setShowGradeModal(false);
                            setGradingReport(null);
                        }}>Batal</Button>
                        <Button onClick={submitGrade} loading={isCreatingGrade}>
                            Simpan Nilai
                        </Button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default ValidasiLaporan;
