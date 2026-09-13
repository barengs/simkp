import React, { useEffect, useMemo, useState } from 'react';
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
    FileText,
    Search,
    Check,
    AlertCircle,
    Clock,
    CheckCircle2,
    UserRound,
    CalendarDays,
    Building2,
    Activity,
    Eye
} from 'lucide-react';

const STATUS_CONFIG = {
    pending: {
        label: 'Menunggu Validasi',
        color: 'yellow',
    },
    approved: {
        label: 'Disetujui',
        color: 'green',
    },
};

const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

    return (
        <Badge status={config.color}>
            {config.label}
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

const ActionModal = ({
    isOpen,
    onClose,
    onConfirm,
    submitting,
    logbook,
}) => {
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
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Konfirmasi Validasi"
            size="md"
        >
            <div className="space-y-5">
                <div className="flex gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                    <div>
                        <p className="font-semibold">
                            Konfirmasi validasi
                        </p>

                        <p className="mt-1 text-sm">
                            Pastikan aktivitas logbook sudah sesuai sebelum
                            menyetujui data ini.
                        </p>
                    </div>
                </div>

                {logbook && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm">
                                <FileText className="h-4 w-4" />
                            </div>

                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900">
                                    {logbook.student?.user?.name || '-'}
                                </p>

                                <p className="text-xs text-gray-500">
                                    {logbook.student?.nim || '-'}
                                </p>

                                <p className="mt-2 line-clamp-3 text-sm text-gray-700">
                                    {logbook.activity || '-'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <Textarea
                    label="Catatan Validasi"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Opsional: tambahkan catatan..."
                    rows={4}
                />

                <div className="flex justify-end gap-3 pt-2">
                    <Button
                        variant="secondary"
                        onClick={handleClose}
                    >
                        Batal
                    </Button>

                    <Button
                        variant="primary"
                        onClick={handleConfirm}
                        loading={submitting}
                        icon={Check}
                    >
                        Setujui Logbook
                    </Button>
                </div>
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

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 500);

        return () => clearTimeout(handler);
    }, [searchTerm]);

    const {
        data: logbooksRaw,
        isLoading,
        refetch,
    } = useGetLogbookQuery({
        page,
        per_page: perPage,
        sort_by: sortBy,
        sort_direction: sortDirection,
        search: debouncedSearch,
        status: filterStatus,
    });

    const [updateLogbook, { isLoading: isUpdating }] =
        useUpdateLogbookMutation();

    const logbooks = useMemo(
        () => logbooksRaw?.data || [],
        [logbooksRaw]
    );

    const totalRows = useMemo(
        () => logbooksRaw?.meta?.total || 0,
        [logbooksRaw]
    );

    const stats = useMemo(() => {
        const responseStats = logbooksRaw?.meta?.stats;

        return {
            total: responseStats?.total || 0,
            pending: responseStats?.pending || 0,
            approved: responseStats?.approved || 0,
        };
    }, [logbooksRaw]);

    const handleRowClick = (row) => {
        if (row?.kp_group_id) {
            navigate(`/kp/daftar-kelompok/${row.kp_group_id}`);
        }
    };

    const openAction = (logbook) => {
        setSelectedLogbook(logbook);
        setShowAction(true);
    };

    const closeAction = () => {
        setShowAction(false);
        setSelectedLogbook(null);
    };

    const confirmAction = async (message) => {
        if (!selectedLogbook) return;

        try {
            const payload = {
                id: selectedLogbook.id,
                status: 'approved',
            };

            await updateLogbook(payload).unwrap();

            handleApiSuccess('Logbook berhasil disetujui');

            closeAction();
            refetch();
        } catch (error) {
            handleApiError(
                error,
                'Gagal memproses logbook'
            );
        }
    };

    const columns = [
        {
            name: 'Mahasiswa',
            selector: (row) => row.student?.user?.name || '-',
            sortable: false,
            wrap: true,
            width: '190px',
            cell: (row) => (
                <div className="flex items-center gap-3 py-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                        <UserRound className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">
                            {row.student?.user?.name || '-'}
                        </p>

                        <p className="font-mono text-xs text-gray-400">
                            {row.student?.nim || '-'}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            name: 'Tanggal',
            selector: (row) => row.date,
            sortable: true,
            sortField: 'date',
            width: '140px',
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-gray-400" />

                    <span className="text-sm text-gray-700">
                        {formatDate(row.date)}
                    </span>
                </div>
            ),
        },
        {
            name: 'Kegiatan',
            selector: (row) => row.activity,
            sortable: false,
            wrap: true,
            cell: (row) => (
                <div className="flex items-start gap-2 py-3">
                    <Activity className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                    <p className="line-clamp-3 text-sm leading-5 text-gray-700">
                        {row.activity || '-'}
                    </p>
                </div>
            ),
        },
        {
            name: 'Perusahaan',
            selector: (row) => row.kp_company?.name || '-',
            sortable: false,
            wrap: true,
            width: '180px',
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 shrink-0 text-gray-400" />

                    <span className="text-sm text-gray-700">
                        {row.kp_company?.name || '-'}
                    </span>
                </div>
            ),
        },
        {
            name: 'Status',
            selector: (row) => row.status,
            sortable: true,
            sortField: 'status',
            width: '170px',
            center: true,
            cell: (row) => getStatusBadge(row.status),
        },
        {
            name: 'Aksi',
            width: '240px',
            center: true,
            cell: (row) => (
                <div className="flex items-center justify-center gap-2">
                    {row.kp_group_id && (
                        <Button
                            size="sm"
                            variant="secondary"
                            icon={Eye}
                            onClick={() => {
                                navigate(`/kp/daftar-kelompok/${row.kp_group_id}`);
                            }}
                        >
                            Detail
                        </Button>
                    )}

                    {row.status === 'pending' ? (
                        <Button
                            size="sm"
                            variant="primary"
                            icon={Check}
                            onClick={(event) => {
                                event.stopPropagation();
                                openAction(row);
                            }}
                        >
                            Setujui
                        </Button>
                    ) : (
                        <span className="text-xs text-gray-400">
                            Sudah divalidasi
                        </span>
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

            <Card>
                <div className="flex flex-col gap-4 border-b border-gray-100 p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">
                            Daftar Logbook
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                            {totalRows} entri ditemukan
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <div className="w-full sm:w-80">
                            <Input
                                placeholder="Cari mahasiswa atau kegiatan..."
                                value={searchTerm}
                                onChange={(e) =>
                                    setSearchTerm(e.target.value)
                                }
                                icon={Search}
                            />
                        </div>

                        <div className="w-full sm:w-52">
                            <select
                                value={filterStatus}
                                onChange={(e) => {
                                    setFilterStatus(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="">
                                    Semua Status
                                </option>

                                {Object.entries(STATUS_CONFIG).map(
                                    ([key, config]) => (
                                        <option
                                            key={key}
                                            value={key}
                                        >
                                            {config.label}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden">
                    {isLoading ? (
                        <div className="p-5">
                            <Skeleton className="h-64 rounded-lg" />
                        </div>
                    ) : logbooks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                                <FileText className="h-7 w-7 text-gray-400" />
                            </div>

                            <p className="text-sm font-medium text-gray-700">
                                {searchTerm || filterStatus
                                    ? 'Tidak ada hasil pencarian'
                                    : 'Belum ada logbook'}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                                {searchTerm || filterStatus
                                    ? 'Coba ubah kata kunci atau filter status.'
                                    : 'Belum terdapat aktivitas logbook mahasiswa.'}
                            </p>
                        </div>
                    ) : (
                        <DataTableWrapper
                            columns={columns}
                            data={logbooks}
                            pagination
                            paginationServer
                            paginationTotalRows={totalRows}
                            onChangePage={(newPage) =>
                                setPage(newPage)
                            }
                            onChangeRowsPerPage={(newPerPage) => {
                                setPerPage(newPerPage);
                                setPage(1);
                            }}
                            paginationDefaultPage={page}
                            sortServer
                            onSort={(column, direction) => {
                                setSortBy(
                                    column.sortField || 'date'
                                );
                                setSortDirection(direction);
                            }}
                            pointerOnHover={false}
                        />
                    )}
                </div>
            </Card>

            <ActionModal
                isOpen={showAction}
                onClose={closeAction}
                onConfirm={confirmAction}
                submitting={isUpdating}
                logbook={selectedLogbook}
            />
        </div>
    );
};

export default LogbookValidation;