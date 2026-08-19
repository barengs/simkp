import React, { useState, useMemo, useEffect } from 'react';
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
import Statistik from '../../../components/ui/Statistik';
import DataTableWrapper from '../../../components/ui/DataTableWrapper';
import Skeleton from '../../../components/ui/Skeleton';
import Modal from '../../../components/ui/Modal';
import Textarea from '../../../components/ui/Textarea';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import {
    FileText, Search, Eye, Check, AlertCircle, Clock, CheckCircle2,
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
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
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
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('pending');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [sortBy, setSortBy] = useState('date');
    const [sortDirection, setSortDirection] = useState('desc');

    const [showAction, setShowAction] = useState(false);
    const [selectedLogbook, setSelectedLogbook] = useState(null);

    // Debounce search term
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const { data: logbooksRaw, isLoading, refetch } = useGetLogbookQuery({
        page,
        per_page: perPage,
        sort_by: sortBy,
        sort_direction: sortDirection,
        search: debouncedSearch,
        status: filterStatus,
    });

    const [updateLogbook, { isLoading: isUpdating }] = useUpdateLogbookMutation();

    const logbooks = useMemo(() =>
        logbooksRaw?.data || [],
        [logbooksRaw]);

    const totalRows = useMemo(() =>
        logbooksRaw?.meta?.total || 0,
        [logbooksRaw]);

    const stats = useMemo(() => {
        const responseStats = logbooksRaw?.meta?.stats;
        return {
            total: responseStats?.total || 0,
            pending: responseStats?.pending || 0,
            approved: responseStats?.approved || 0,
        };
    }, [logbooksRaw]);

    const handleRowClick = (data) => {
        if (data?.kp_group_id) {
            navigate(`/kp/daftar-kelompok/${data.kp_group_id}`);
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
            sortable: false,
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
            sortField: 'date',
            width: '120px',
            cell: row => row.date ? new Date(row.date).toLocaleDateString('id-ID') : '-',
        },
        {
            name: 'Kegiatan',
            selector: row => row.activity,
            sortable: false,
            wrap: true,
        },
        {
            name: 'Perusahaan',
            selector: row => row?.kp_company?.name || '-',
            sortable: false,
            wrap: true,
        },
        {
            name: 'Status',
            selector: row => row.status,
            sortable: true,
            sortField: 'status',
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Statistik
                    title="Total"
                    value={stats.total}
                    icon={FileText}
                    iconClassName="text-blue-600"
                    borderClassName="bg-blue-500"
                />
                <Statistik
                    title="Menunggu"
                    value={stats.pending}
                    icon={Clock}
                    iconClassName="text-yellow-600"
                    borderClassName="bg-yellow-500"
                />
                <Statistik
                    title="Disetujui"
                    value={stats.approved}
                    icon={CheckCircle2}
                    iconClassName="text-emerald-600"
                    borderClassName="bg-emerald-500"
                />
            </div>

            {/* Table */}
            <Card>
                <div className="
                    flex flex-col
                    gap-4
                    border-b border-gray-100
                    p-5
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                ">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">
                            Daftar Logbook
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">
                            {totalRows} entri ditemukan
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-full sm:w-80">
                            <Input
                                placeholder="Cari mahasiswa atau kegiatan..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                icon={Search}
                            />
                        </div>
                        <div className="w-full sm:w-48">
                            <select
                                value={filterStatus}
                                onChange={(e) => {
                                    setFilterStatus(e.target.value);
                                    setPage(1);
                                }}
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
                <div className="overflow-hidden">
                    {isLoading ? (
                        <Skeleton className="h-64" />
                    ) : logbooks.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">
                                {searchTerm || filterStatus ? 'Tidak ada hasil pencarian' : 'Belum ada logbook'}
                            </p>
                        </div>
                    ) : (
                        <DataTableWrapper
                            columns={columns}
                            data={logbooks}
                            pagination
                            paginationServer
                            paginationTotalRows={totalRows}
                            onChangePage={(newPage) => setPage(newPage)}
                            onChangeRowsPerPage={(newPerPage) => {
                                setPerPage(newPerPage);
                                setPage(1);
                            }}
                            paginationDefaultPage={page}
                            sortServer
                            onSort={(column, direction) => {
                                setSortBy(column.sortField || 'date');
                                setSortDirection(direction);
                            }}
                            onRowClicked={handleRowClick}
                        />
                    )}
                </div>
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
