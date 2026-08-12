import React, { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
import DataTableWrapper from '../../../components/ui/DataTableWrapper';
import {
    FileText, Search, Plus, Upload, Trash2, Pencil, CalendarDays,
} from 'lucide-react';

const STATUS_CONFIG = {
    draft: { label: 'Draft', color: 'gray' },
    submitted: { label: 'Menunggu Validasi', color: 'yellow' },
    approved: { label: 'Disetujui', color: 'green' },
    revision: { label: 'Perlu Revisi', color: 'red' },
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
    const authUser = useSelector(s => s.auth.user);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingLogbook, setEditingLogbook] = useState(null);
    const [filterStatus, setFilterStatus] = useState('');
    const [isRegistered, setIsRegistered] = useState(null);

    const activeKpGroupId = useMemo(() => {
        const members = authUser?.student?.kp_group_members || [];
        const member = members.find(
            m => m.member_status === 'active' && m.group_status === 'disetujui' && m.group_supervisor !== null
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
        const hasActiveApproved = members.some(
            m => m.member_status === 'active' && m.group_status === 'disetujui' && m.group_supervisor !== null
        );

        if (hasActiveApproved) {
            setIsRegistered('approved');
        } else if (members.some(m => m.member_status === 'active' && m.group_status === 'disetujui')) {
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
        submitted: logbooks.filter(l => l.status === 'submitted').length,
        approved: logbooks.filter(l => l.status === 'approved').length,
        revision: logbooks.filter(l => l.status === 'revision').length,
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
            name: 'No',
            selector: (r, i) => i + 1,
            width: '60px',
            center: true,
        },
        {
            name: 'Nama Ketua',
            selector: r => r.kp_group?.members?.find(m => m.role === 'ketua')?.student?.user?.name || r.student?.user?.name || '-',
            sortable: true,
            wrap: true,
        },
        {
            name: 'Kegiatan',
            selector: r => r.activity || '-',
            sortable: true,
            wrap: true,
        },
        {
            name: 'Tanggal',
            selector: r => r.date || '-',
            sortable: true,
            wrap: true,
            cell: r => r.date ? new Date(r.date).toLocaleDateString('id-ID') : '-',
        },
        {
            name: 'Status',
            selector: r => r.status,
            width: '120px',
            center: true,
            cell: r => {
                const config = STATUS_CONFIG[r.status] || STATUS_CONFIG.draft;
                return <Badge status={config.color}>{config.label}</Badge>;
            },
        },
        {
            name: 'Aksi',
            width: '120px',
            center: true,
            cell: r => (
                <div className="flex items-center justify-center gap-2">
                    {(r.status === 'draft' || r.status === 'revision' || r.status === 'submitted') && authUser?.student?.id === r.student_id && (
                        <>
                            <Button size="sm" variant="secondary" icon={Pencil} onClick={() => handleEdit(r)} />
                            <Button size="sm" variant="danger" icon={Trash2} onClick={() => handleDelete(r.id)} />
                        </>
                    )}
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
                            <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.submitted}</p>
                        </div>
                    </Card>
                    <Card className="bg-green-50 border-green-200">
                        <div className="p-4">
                            <p className="text-xs text-green-700 uppercase tracking-wide">Disetujui</p>
                            <p className="text-2xl font-bold text-green-900 mt-1">{stats.approved}</p>
                        </div>
                    </Card>
                    <Card className="bg-red-50 border-red-200">
                        <div className="p-4">
                            <p className="text-xs text-red-700 uppercase tracking-wide">Revisi</p>
                            <p className="text-2xl font-bold text-red-900 mt-1">{stats.revision}</p>
                        </div>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <Input
                                    placeholder="Cari kegiatan..."
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
                        <DataTableWrapper columns={columns} data={filtered} pagination />
                    )}
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
        attachment: null,
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
            formData.append('status', 'submitted');
            if (form.attachment) {
                formData.append('attachment', form.attachment);
            }
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FileDropZone
                        label="Lampiran (Opsional)"
                        accept=".pdf,.doc,.docx"
                        file={form.attachment}
                        onChange={(file) => setForm(prev => ({ ...prev, attachment: file }))}
                        error={errors.attachment}
                    />
                    <FileDropZone
                        label="Foto Bukti (Opsional)"
                        accept="image/*"
                        file={form.evidence_photo}
                        onChange={(file) => setForm(prev => ({ ...prev, evidence_photo: file }))}
                        error={errors.evidence_photo}
                    />
                </div>
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
        attachment: null,
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
                attachment: null,
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
            formData.append('status', 'submitted');
            if (form.attachment) {
                formData.append('attachment', form.attachment);
            }
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Lampiran (Opsional)
                        </label>
                        <FileDropZone
                            accept=".pdf,.doc,.docx"
                            file={form.attachment}
                            onChange={(file) => setForm(prev => ({ ...prev, attachment: file }))}
                            error={errors.attachment}
                        />
                        {logbook.attachment && !form.attachment && (
                            <p className="text-xs text-gray-500 mt-1">
                                File saat ini: <a href={logbook.attachment} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-800">Lihat Lampiran</a>
                            </p>
                        )}
                    </div>
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
