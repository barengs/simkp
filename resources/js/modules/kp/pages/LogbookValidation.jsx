import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    useGetLogbookQuery,
    useUpdateLogbookMutation,
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
    FileText, Search, Eye, Check, AlertCircle,
} from 'lucide-react';

const STATUS_CONFIG = {
    pending: { label: 'Menunggu Validasi', color: 'yellow' },
    approved: { label: 'Disetujui', color: 'green' },
};

const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return <Badge status={config.color}>{config.label}</Badge>;
};

const ActionModal = ({ isOpen, onClose, onConfirm, submitting }) => {
    const [message, setMessage] = useState('');

    const handleConfirm = () => {
        onConfirm(message);
        setMessage('');
    };

    const handleClose = () => {
        setMessage('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Setujui Logbook" size="md">
            <div className="space-y-4">
                <div className="rounded-lg p-3 text-sm flex gap-2 bg-green-50 border border-green-200 text-green-800">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Konfirmasi bahwa logbook ini telah divalidasi dan disetujui.</span>
                </div>

                <Textarea
                    label="Pesan Konfirmasi"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Opsional: tambahkan pesan konfirmasi..."
                    rows={4}
                />
            </div>

            <div className="flex justify-end gap-3 pt-6">
                <Button variant="secondary" onClick={handleClose}>Batal</Button>
                <Button variant="primary" onClick={handleConfirm} loading={submitting}>
                    Setujui
                </Button>
            </div>
        </Modal>
    );
};

const LogbookValidation = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('pending');
    const [showAction, setShowAction] = useState(false);
    const [selectedLogbook, setSelectedLogbook] = useState(null);

    const { data: logbooksRaw, isLoading, refetch } = useGetLogbookQuery();
    const [updateLogbook, { isLoading: isUpdating }] = useUpdateLogbookMutation();

    const logbooks = useMemo(() =>
        Array.isArray(logbooksRaw) ? logbooksRaw
        : Array.isArray(logbooksRaw?.data) ? logbooksRaw.data : [],
    [logbooksRaw]);

    const filtered = useMemo(() =>
        logbooks.filter(item => {
            const matchSearch = !search ||
                item.student?.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
                item.activity?.toLowerCase().includes(search.toLowerCase());

            const matchStatus = !filterStatus || item.status === filterStatus;

            return matchSearch && matchStatus;
        }),
    [logbooks, search, filterStatus]);

    const stats = useMemo(() => ({
        total: logbooks.length,
        pending: logbooks.filter(l => l.status === 'pending').length,
        approved: logbooks.filter(l => l.status === 'approved').length,
    }), [logbooks]);

    const handleRowClick = (data) => {
        if (data?.kp_group?.id) {
            navigate(`/kp/daftar-kelompok/${data.kp_group.id}`);
        }
    };

    const openAction = (logbook) => {
        setSelectedLogbook(logbook);
        setShowAction(true);
    };

    const confirmAction = async (message) => {
        if (!selectedLogbook) return;
        try {
            const payload = {
                id: selectedLogbook.id,
                status: 'approved',
            };

            if (message) {
                payload.rejection_note = message;
            }

            await updateLogbook(payload).unwrap();
            handleApiSuccess('Logbook disetujui');
            setShowAction(false);
            setSelectedLogbook(null);
            refetch();
        } catch (err) {
            handleApiError(err, 'Gagal memproses logbook');
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
            name: 'Tanggal',
            selector: row => row.date,
            sortable: true,
            width: '120px',
            cell: row => row.date ? new Date(row.date).toLocaleDateString('id-ID') : '-',
        },
        {
            name: 'Kegiatan',
            selector: row => row.activity,
            sortable: true,
            wrap: true,
        },
        {
            name: 'Perusahaan',
            selector: row => row?.kp_company?.name || '-',
            sortable: true,
            wrap: true,
        },
        {
            name: 'Status',
            selector: row => row.status,
            width: '180px',
            center: true,
            cell: row => getStatusBadge(row.status),
        },
        {
            name: 'Aksi',
            width: '220px',
            center: true,
            cell: row => (
                <div className="flex items-center justify-center gap-2">
                    {row.status === 'pending' ? (
                        <Button size="sm" variant="primary" icon={Check} onClick={(e) => { e.stopPropagation(); openAction(row); }}>
                            Setujui
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
                title="Validasi Logbook"
                description="Tinjau dan validasi logbook mahasiswa"
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
                <Card className="bg-green-50 border-green-200">
                    <div className="p-4">
                        <p className="text-xs text-green-700 uppercase tracking-wide">Disetujui</p>
                        <p className="text-2xl font-bold text-green-900 mt-1">{stats.approved}</p>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <div className="p-4 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Cari mahasiswa atau kegiatan..."
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
            <Card title="Daftar Logbook" subtitle={`${filtered.length} entri`}>
                {isLoading ? (
                    <Skeleton className="h-64" />
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">
                            {search || filterStatus ? 'Tidak ada hasil pencarian' : 'Belum ada logbook'}
                        </p>
                    </div>
                ) : (
                    <DataTableWrapper
                        columns={columns}
                        data={filtered}
                        pagination
                        onRowClicked={handleRowClick}
                    />
                )}
            </Card>

            {showAction && (
                <ActionModal
                    isOpen={showAction}
                    onClose={() => {
                        setShowAction(false);
                        setSelectedLogbook(null);
                    }}
                    onConfirm={confirmAction}
                    submitting={isUpdating}
                />
            )}
        </div>
    );
};

export default LogbookValidation;
