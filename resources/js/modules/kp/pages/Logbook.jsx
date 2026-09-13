import React, { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    useGetLogbookQuery,
    useCreateLogbookMutation,
    useUpdateLogbookMutation,
    useDeleteLogbookMutation,
} from '../api/kpApi';
import { handleApiError, handleApiSuccess } from '../../shared/api/errorHandler';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Skeleton from '../../../components/ui/Skeleton';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Textarea from '../../../components/ui/Textarea';
import Statistik from '../../../components/ui/Statistik';
import DataTableWrapper from '../../../components/ui/DataTableWrapper';
import {
    FileText, Search, Plus, Upload, Trash2, Pencil, CalendarDays, Clock, CheckCircle2, UserRound, ClipboardList, Eye,
} from 'lucide-react';


const STATUS_CONFIG = {
    pending: { label: 'Menunggu Validasi', color: 'yellow' },
    approved: { label: 'Disetujui', color: 'green' },
};

const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
    return <Badge status={config.color}>{config.label}</Badge>;
};

const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const isImageFile = (url) => {
    if (!url) return false;
    const ext = url.split('?')[0].split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext);
};

const Logbook = () => {
    const navigate = useNavigate();
    const authUser = useSelector(s => s.auth.user);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingLogbook, setEditingLogbook] = useState(null);
    const [filterStatus, setFilterStatus] = useState('');
    const [isRegistered, setIsRegistered] = useState(null);

    const approvedStatuses = ['approved', 'grading', 'finished'];

    const activeKpGroupId = useMemo(() => {
        const members = authUser?.student?.kp_group_members || [];
        const member = members.find(
            m => m.member_status === 'active' && approvedStatuses.includes(m.group_status) && m.group_supervisor !== null
        );
        return member?.kp_group_id || null;
    }, [authUser]);

    const { data: logbooksRaw, isLoading, refetch } = useGetLogbookQuery(activeKpGroupId || undefined);
    const [createLogbook, { isLoading: isCreating }] = useCreateLogbookMutation();
    const [updateLogbook, { isLoading: isUpdating }] = useUpdateLogbookMutation();
    const [deleteLogbook, { isLoading: isDeleting }] = useDeleteLogbookMutation();

    const logbooks = useMemo(() =>
        Array.isArray(logbooksRaw) ? logbooksRaw
        : Array.isArray(logbooksRaw?.data) ? logbooksRaw.data : [],
    [logbooksRaw]);

    useEffect(() => {
        if (!authUser?.student) {
            setIsRegistered(false);
            return;
        }

        const members = authUser.student.kp_group_members || [];
        const approvedStatuses = ['approved', 'grading', 'finished'];
        const hasActiveApproved = members.some(
            m => m.member_status === 'active' && approvedStatuses.includes(m.group_status) && m.group_supervisor !== null
        );

        if (hasActiveApproved) {
            setIsRegistered('approved');
        } else if (members.some(m => m.member_status === 'active' && approvedStatuses.includes(m.group_status))) {
            setIsRegistered('no_supervisor');
        } else if (members.length > 0) {
            setIsRegistered('pending');
        } else {
            setIsRegistered(false);
        }
    }, [authUser]);

    const filtered = useMemo(() =>
        logbooks.filter(item => {
            const matchSearch = !search ||
                item.activity?.toLowerCase().includes(search.toLowerCase()) ||
                item.kp_group?.kp_company?.name?.toLowerCase().includes(search.toLowerCase());

            const matchStatus = !filterStatus || item.status === filterStatus;

            return matchSearch && matchStatus;
        }),
    [logbooks, search, filterStatus]);

    const stats = useMemo(() => ({
        total: logbooks.length,
        pending: logbooks.filter(l => l.status === 'pending').length,
        approved: logbooks.filter(l => l.status === 'approved').length,
    }), [logbooks]);

    const handleDelete = async (id) => {
        if (!window.confirm('Hapus logbook ini?')) return;
        try {
            await deleteLogbook(id).unwrap();
            handleApiSuccess('Logbook berhasil dihapus');
            refetch();
        } catch (err) {
            handleApiError(err, 'Gagal menghapus logbook');
        }
    };

    const handleEdit = (logbook) => {
        setEditingLogbook(logbook);
        setShowEditModal(true);
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
            width: '140px',
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-gray-400" />

                    <span className="text-sm text-gray-700">
                        {row.date ? new Date(row.date).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                        }) : '-'}
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
                    <ClipboardList className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                    <p className="line-clamp-3 text-sm leading-5 text-gray-700">
                        {row.activity || '-'}
                    </p>
                </div>
            ),
        },
        {
            name: 'Status',
            selector: (row) => row.status,
            sortable: true,
            width: '170px',
            center: true,
            cell: (row) => {
                const config = STATUS_CONFIG[row.status] || STATUS_CONFIG.pending;
                return <Badge status={config.color}>{config.label}</Badge>;
            },
        },
        {
            name: 'Aksi',
            width: '120px',
            center: true,
            cell: (row) => (
                <div className="flex items-center justify-center gap-2">
                    {row.status === 'pending' && authUser?.student?.id === row.student_id && (
                        <>
                            <Button size="sm" variant="secondary" icon={Pencil} onClick={() => handleEdit(row)} />
                            <Button size="sm" variant="danger" icon={Trash2} onClick={() => handleDelete(row.id)} />
                        </>
                    )}
                    {/* Detail button */}
                    <Button size="sm" variant="secondary" icon={Eye} onClick={() => navigate(`/kp/daftar-kelompok/${row.kp_group_id}`)} />
                </div>

            ),
        },
    ];

    const renderContent = () => {
        if (isRegistered === false) {
            return (
                <Card>
                    <div className="p-12 text-center">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Anda belum terdaftar di KP
                        </h3>
                        <p className="text-sm text-gray-500 max-w-md mx-auto">
                            Silakan daftarkan kelompok KP terlebih dahulu melalui menu Pendaftaran Kelompok sebelum dapat mengisi logbook.
                        </p>
                    </div>
                </Card>
            );
        }

        if (isRegistered === 'pending') {
            return (
                <Card>
                    <div className="p-12 text-center">
                        <FileText className="w-16 h-16 text-yellow-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Pendaftaran KP Anda belum disetujui
                        </h3>
                        <p className="text-sm text-gray-500 max-w-md mx-auto">
                            Logbook hanya dapat diisi setelah pendaftaran kelompok KP Anda disetujui oleh koordinator. Silakan tunggu verifikasi.
                        </p>
                    </div>
                </Card>
            );
        }

        if (isRegistered === 'no_supervisor') {
            return (
                <Card>
                    <div className="p-12 text-center">
                        <FileText className="w-16 h-16 text-orange-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Menunggu Penugasan Dosen Pembimbing
                        </h3>
                        <p className="text-sm text-gray-500 max-w-md mx-auto">
                            Pendaftaran KP Anda sudah disetujui, tetapi dosen pembimbing belum ditugaskan. Logbook hanya dapat diisi setelah dosen pembimbing ditetapkan.
                        </p>
                    </div>
                </Card>
            );
        }

        return (
            <>
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
                    <div className="flex flex-col gap-4 border-b border-gray-100 p-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h3 className="text-base font-semibold text-gray-900">
                                Daftar Logbook
                            </h3>
                            <p className="mt-1 text-xs text-gray-500">
                                {filterStatus
                                    ? `${filtered.length} hasil ditemukan`
                                    : `${filtered.length} entri`}
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row">
                            <div className="w-full sm:w-80">
                                <Input
                                    placeholder="Cari mahasiswa atau kegiatan..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    icon={Search}
                                />
                            </div>

                            <div className="w-full sm:w-52">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
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
                        ) : filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                                    <FileText className="h-7 w-7 text-gray-400" />
                                </div>

                                <p className="text-sm font-medium text-gray-700">
                                    {search || filterStatus
                                        ? 'Tidak ada hasil pencarian'
                                        : 'Belum ada logbook'}
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                    {search || filterStatus
                                        ? 'Coba ubah kata kunci atau filter status.'
                                        : 'Belum terdapat aktivitas logbook.'}
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
                    </div>
                </Card>

                {/* Add Modal */}
                {showModal && (
                    <LogbookModal
                        isOpen={showModal}
                        onClose={() => setShowModal(false)}
                        onSubmit={refetch}
                        kpGroupId={activeKpGroupId}
                    />
                )}

                {/* Edit Modal */}
                {showEditModal && editingLogbook && (
                    <LogbookEditModal
                        isOpen={showEditModal}
                        onClose={() => {
                            setShowEditModal(false);
                            setEditingLogbook(null);
                        }}
                        onSubmit={refetch}
                        logbook={editingLogbook}
                        kpGroupId={activeKpGroupId}
                    />
                )}
            </>
        );
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Logbook KP"
                description="Catat dan kelola kegiatan harian Kerja Praktek Anda"
                icon={FileText}
                actions={
                    isRegistered === 'approved' ? (
                        <Button icon={Plus} onClick={() => setShowModal(true)}>
                            Tambah Logbook
                        </Button>
                    ) : null
                }
            />
            {renderContent()}
        </div>
    );
};

const FileDropZone = ({ label, accept, file, onChange, error }) => {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const dropped = e.dataTransfer.files?.[0];
        if (dropped) {
            onChange(dropped);
        }
    };

    const handleClick = () => {
        document.getElementById(`file-input-${label}`)?.click();
    };

    const handleInputChange = (e) => {
        const selected = e.target.files?.[0];
        if (selected) {
            onChange(selected);
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
                className={`flex flex-col items-center justify-center w-full px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    isDragOver ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-gray-400'
                }`}
            >
                <Upload className="w-6 h-6 text-gray-400 mb-2" />
                {file ? (
                    <div className="text-center">
                        <p className="text-sm text-emerald-600 font-medium">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                ) : (
                    <div className="text-center">
                        <p className="text-sm text-gray-600">Seret berkas ke sini atau klik untuk unggah</p>
                        <p className="text-xs text-gray-500 mt-1">{accept}</p>
                    </div>
                )}
                <input
                    id={`file-input-${label}`}
                    type="file"
                    className="hidden"
                    accept={accept}
                    onChange={handleInputChange}
                />
            </div>
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
    );
};

const LogbookModal = ({ isOpen, onClose, onSubmit, kpGroupId }) => {
    const [form, setForm] = useState({
        date: '',
        activity: '',
        evidence_photo: null,
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const [createLogbook] = useCreateLogbookMutation();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleFileChange = (e, field) => {
        const file = e.target.files?.[0];
        if (file) {
            setForm(prev => ({ ...prev, [field]: file }));
            if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setErrors({});

        try {
            const formData = new FormData();
            formData.append('kp_group_id', String(kpGroupId));
            formData.append('date', form.date);
            formData.append('activity', form.activity);
            formData.append('status', 'pending');
            if (form.evidence_photo) {
                formData.append('evidence_photo', form.evidence_photo);
            }

            await createLogbook(formData).unwrap();
            handleApiSuccess('Logbook berhasil ditambahkan');
            onClose();
            onSubmit();
        } catch (err) {
            if (err?.data?.errors) {
                setErrors(err.data.errors);
            }
            handleApiError(err, 'Gagal menambahkan logbook');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Tambah Logbook" size="lg">
            <div className="space-y-4">
                <Input
                    label="Tanggal"
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                    error={errors.date}
                />
                <Textarea
                    label="Kegiatan"
                    name="activity"
                    value={form.activity}
                    onChange={handleChange}
                    placeholder="Jelaskan kegiatan yang dilakukan..."
                    rows={4}
                    required
                    error={errors.activity}
                />
                <FileDropZone
                    label="Foto Bukti (Opsional)"
                    accept="image/*"
                    file={form.evidence_photo}
                    onChange={(file) => setForm(prev => ({ ...prev, evidence_photo: file }))}
                    error={errors.evidence_photo}
                />
            </div>

            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                <Button variant="secondary" onClick={onClose}>Batal</Button>
                <Button variant="primary" onClick={handleSubmit} loading={submitting}>
                    Kirim Logbook
                </Button>
            </div>
        </Modal>
    );
};

const LogbookEditModal = ({ isOpen, onClose, onSubmit, logbook, kpGroupId }) => {
    const [form, setForm] = useState({
        date: '',
        activity: '',
        evidence_photo: null,
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const [updateLogbook] = useUpdateLogbookMutation();

    useEffect(() => {
        if (logbook) {
            setForm({
                date: formatDateForInput(logbook.date),
                activity: logbook.activity || '',
                evidence_photo: null,
            });
        }
    }, [logbook]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleFileChange = (e, field) => {
        const file = e.target.files?.[0];
        if (file) {
            setForm(prev => ({ ...prev, [field]: file }));
            if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setErrors({});

        try {
            const formData = new FormData();
            formData.append('date', form.date);
            formData.append('activity', form.activity);
            formData.append('status', 'pending');
            if (form.evidence_photo) {
                formData.append('evidence_photo', form.evidence_photo);
            }

            await updateLogbook({ id: logbook.id, body: formData }).unwrap();
            handleApiSuccess('Logbook berhasil diperbarui');
            onClose();
            onSubmit();
        } catch (err) {
            if (err?.data?.errors) {
                setErrors(err.data.errors);
            }
            handleApiError(err, 'Gagal memperbarui logbook');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Logbook" size="lg">
            <div className="space-y-4">
                <Input
                    label="Tanggal"
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                    error={errors.date}
                />
                <Textarea
                    label="Kegiatan"
                    name="activity"
                    value={form.activity}
                    onChange={handleChange}
                    placeholder="Jelaskan kegiatan yang dilakukan..."
                    rows={4}
                    required
                    error={errors.activity}
                />
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Foto Bukti (Opsional)
                    </label>
                    <FileDropZone
                        accept="image/*"
                        file={form.evidence_photo}
                        onChange={(file) => setForm(prev => ({ ...prev, evidence_photo: file }))}
                        error={errors.evidence_photo}
                    />
                    {logbook.evidence_photo && !form.evidence_photo && (
                        <div className="mt-2">
                            <p className="text-xs text-gray-500 mt-1">
                                Foto saat ini: <a href={logbook.evidence_photo} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-800">Lihat Foto Bukti</a>
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                <Button variant="secondary" onClick={onClose}>Batal</Button>
                <Button variant="primary" onClick={handleSubmit} loading={submitting}>
                    Perbarui Logbook
                </Button>
            </div>
        </Modal>
    );
};

export default Logbook;
