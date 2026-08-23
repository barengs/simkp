import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    useGetPengajuanQuery,
    useGetBimbinganQuery,
    useAddBimbinganMutation,
    useUpdateBimbinganMutation,
    useDeleteBimbinganMutation,
} from '../api/taApi';
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
    BookMarked, Search, Plus, MessageSquare, User, GraduationCap, Clock, Trash2, Pencil, CheckCircle, ArrowLeft 
} from 'lucide-react';

const DetailBimbinganTA = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const authUser = useSelector((state) => state.auth.user);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [noteForm, setNoteForm] = useState({ aktivitas: '', catatan_dosen: '', status: 'pending', tanggal: '' });
    const [file, setFile] = useState(null);

    const isMahasiswa = authUser?.roles?.includes('mahasiswa');
    const isDosen = authUser?.roles?.includes('dosen');

    const { data: pengajuanRaw, isLoading: isLoadingTA } = useGetPengajuanQuery();
    const [addBimbingan, { isLoading: isAdding }] = useAddBimbinganMutation();
    const [updateBimbingan, { isLoading: isUpdating }] = useUpdateBimbinganMutation();
    const [deleteBimbingan, { isLoading: isDeleting }] = useDeleteBimbinganMutation();

    const pengajuanList = useMemo(() => {
        const raw = pengajuanRaw?.data ?? (Array.isArray(pengajuanRaw) ? pengajuanRaw : []);
        const list = Array.isArray(raw) ? raw : (raw ? [raw] : []);
        if (isMahasiswa) {
            return list.filter(item => item.mahasiswa?.user?.id === authUser?.id && item.status === 'bimbingan');
        }
        return list.filter(item => item.status === 'bimbingan');
    }, [pengajuanRaw, isMahasiswa, authUser?.id]);

    const selectedTA = useMemo(() => {
        return pengajuanList.find(item => String(item.id) === String(id)) || null;
    }, [pengajuanList, id]);

    const { data: bimbinganData, refetch: refetchBimbingan } = useGetBimbinganQuery(id ?? 0, {
        skip: !id,
    });

    const bimbinganList = useMemo(() => {
        if (!bimbinganData) return [];
        return Array.isArray(bimbinganData) ? bimbinganData : [];
    }, [bimbinganData]);

    const openAddModal = () => {
        setNoteForm({ aktivitas: '', catatan_dosen: '', status: 'pending', tanggal: new Date().toISOString().split('T')[0] });
        setFile(null);
        setShowModal(true);
    };

    const openEditModal = (note) => {
        setEditingNote(note);
        setNoteForm({
            aktivitas: note.aktivitas || '',
            catatan_dosen: note.catatan_dosen || '',
            status: note.status || 'pending',
            tanggal: note.tanggal ? new Date(note.tanggal).toISOString().split('T')[0] : '',
        });
        setFile(null);
        setShowEditModal(true);
    };

    const handleAdd = async () => {
        if (!id || !noteForm.aktivitas.trim()) return;
        try {
            const formData = new FormData();
            formData.append('aktivitas', noteForm.aktivitas);
            formData.append('catatan_dosen', noteForm.catatan_dosen);
            formData.append('status', noteForm.status);
            formData.append('tanggal', noteForm.tanggal);
            if (file) {
                formData.append('file', file);
            }
            await addBimbingan({
                finalProjectId: id,
                ...formData,
            }).unwrap();
            handleApiSuccess('Catatan bimbingan berhasil ditambahkan.');
            setShowModal(false);
            setNoteForm({ aktivitas: '', catatan_dosen: '', status: 'pending', tanggal: '' });
            setFile(null);
            refetchBimbingan();
        } catch (err) {
            handleApiError(err, 'Gagal menambahkan catatan bimbingan.');
        }
    };

    const handleUpdate = async () => {
        if (!id || !editingNote || !noteForm.aktivitas.trim()) return;
        try {
            const formData = new FormData();
            formData.append('aktivitas', noteForm.aktivitas);
            formData.append('catatan_dosen', noteForm.catatan_dosen);
            formData.append('status', noteForm.status);
            formData.append('tanggal', noteForm.tanggal);
            if (file) {
                formData.append('file', file);
            }
            await updateBimbingan({
                finalProjectId: id,
                bimbinganId: editingNote.id,
                ...formData,
            }).unwrap();
            handleApiSuccess('Catatan bimbingan berhasil diperbarui.');
            setShowEditModal(false);
            setEditingNote(null);
            setFile(null);
            refetchBimbingan();
        } catch (err) {
            handleApiError(err, 'Gagal memperbarui catatan bimbingan.');
        }
    };

    const handleDelete = async (bimbinganId) => {
        if (!window.confirm('Hapus catatan bimbingan ini?')) return;
        try {
            await deleteBimbingan({
                finalProjectId: id,
                bimbinganId,
            }).unwrap();
            handleApiSuccess('Catatan bimbingan berhasil dihapus.');
            refetchBimbingan();
        } catch (err) {
            handleApiError(err, 'Gagal menghapus catatan bimbingan.');
        }
    };

    const bimbinganColumns = [
        {
            key: 'tanggal',
            label: 'Tanggal',
            render: (row) => row.tanggal ? (
                <div className="text-xs text-gray-600 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {new Date(row.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
            ) : '-',
        },
        {
            key: 'status',
            label: 'Status',
            render: (row) => {
                const statusConfig = {
                    pending: { label: 'Menunggu', color: 'yellow' },
                    diterima: { label: 'Diterima', color: 'green' },
                    revisi: { label: 'Revisi', color: 'red' },
                };
                const cfg = statusConfig[row.status] || { label: row.status, color: 'gray' };
                return <Badge status={cfg.color}>{cfg.label}</Badge>;
            },
        },
        {
            key: 'aktivitas',
            label: 'Aktivitas',
            render: (row) => (
                <div className="max-w-lg">
                    <p className="text-sm text-gray-800 whitespace-pre-line">{row.aktivitas}</p>
                </div>
            ),
        },
        {
            key: 'catatan_dosen',
            label: 'Catatan Dosen',
            render: (row) => (
                <div className="max-w-lg">
                    <p className="text-sm text-gray-800 whitespace-pre-line">{row.catatan_dosen || '-'}</p>
                </div>
            ),
        },
        {
            key: 'dosen',
            label: 'Dosen',
            render: (row) => (
                <span className="text-sm text-gray-700">{row.dosen?.user?.name ?? '-'}</span>
            ),
        },
        {
            key: 'actions',
            label: 'Aksi',
            render: (row) => {
                const canEdit = isMahasiswa || (isDosen && row.dosen_id === authUser?.lecturer?.id);
                const canDelete = !isMahasiswa;
                return (
                    <div className="flex gap-1">
                        {canEdit && (
                            <Button variant="secondary" size="sm" onClick={() => openEditModal(row)} title="Edit">
                                <Pencil size={13} />
                            </Button>
                        )}
                        {canDelete && (
                            <Button variant="danger" size="sm" onClick={() => handleDelete(row.id)} title="Hapus">
                                <Trash2 size={13} />
                            </Button>
                        )}
                    </div>
                );
            },
        },
    ];

    if (isLoadingTA) {
        return (
            <div className="space-y-6">
                <Skeleton height={40} width={250} />
                <Skeleton height={300} />
            </div>
        );
    }

    if (!selectedTA) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Detail Bimbingan Tugas Akhir"
                    description="Catatan bimbingan tidak ditemukan"
                    icon={BookMarked}
                />
                <Card className="p-8 text-center">
                    <p className="text-gray-500 mb-4">Data Tugas Akhir tidak ditemukan atau Anda tidak memiliki akses.</p>
                    <Button variant="secondary" onClick={() => navigate('/ta/bimbingan')}>
                        <ArrowLeft size={14} className="mr-1" />
                        Kembali ke Daftar Bimbingan
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Detail Bimbingan Tugas Akhir"
                description="Catatan dan riwayat bimbingan"
                icon={BookMarked}
            />

            <Card>
                <div className="border-b border-gray-100 p-5">
                    <h3 className="text-base font-bold text-gray-900 mb-3">Informasi Tugas Akhir</h3>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                        <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase">Mahasiswa</p>
                            <p className="text-sm font-semibold text-gray-800 mt-0.5">{selectedTA.mahasiswa?.user?.name ?? '-'}</p>
                            <p className="text-xs text-gray-400 font-mono mt-0.5">NIM: {selectedTA.mahasiswa?.nim ?? '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase">Judul TA</p>
                            <p className="text-sm font-bold text-gray-800 mt-0.5">{selectedTA.title}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase">Status</p>
                            <p className="text-sm text-gray-700 mt-0.5 capitalize">{selectedTA.status?.replace('_', ' ') ?? '-'}</p>
                        </div>
                        {selectedTA.dosen_pembimbing?.[0]?.dosen && (
                            <div>
                                <p className="text-xs text-gray-400 font-semibold uppercase">Dosen Pembimbing</p>
                                <p className="text-sm font-semibold text-emerald-700 mt-0.5">{selectedTA.dosen_pembimbing[0].dosen.user?.name ?? '-'}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-b border-gray-100 p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-base font-bold text-gray-900">
                            Catatan Bimbingan
                        </h3>
                        <p className="mt-0.5 text-xs text-gray-500">
                            Total {bimbinganList.length} catatan bimbingan
                        </p>
                    </div>
                    <Button variant="primary" size="sm" onClick={openAddModal}>
                        <Plus size={14} className="mr-1" />
                        Tambah Catatan
                    </Button>
                </div>

                <DataTableWrapper
                    columns={bimbinganColumns}
                    data={bimbinganList}
                    emptyMessage="Belum ada catatan bimbingan untuk TA ini."
                    loading={false}
                />
            </Card>

            <div className="flex justify-start">
                <Button variant="secondary" onClick={() => navigate('/ta/bimbingan')}>
                    <ArrowLeft size={14} className="mr-1" />
                    Kembali ke Daftar Bimbingan
                </Button>
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Tambah Catatan Bimbingan"
            >
                <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <p className="text-xs text-gray-400 font-semibold uppercase">Mahasiswa</p>
                        <p className="text-sm font-semibold text-gray-800 mt-1">{selectedTA.mahasiswa?.user?.name ?? '-'} ({selectedTA.mahasiswa?.nim ?? '-'})</p>
                        <p className="text-xs text-gray-400 font-semibold uppercase mt-2">Judul TA</p>
                        <p className="text-sm font-semibold text-gray-800 mt-1">{selectedTA.title}</p>
                    </div>

                    <Input
                        id="bimbingan-tanggal"
                        label="Tanggal Bimbingan"
                        type="date"
                        value={noteForm.tanggal}
                        onChange={(e) => setNoteForm((p) => ({ ...p, tanggal: e.target.value }))}
                    />

                    <Textarea
                        id="bimbingan-aktivitas"
                        label="Aktivitas / Progress"
                        value={noteForm.aktivitas}
                        onChange={(e) => setNoteForm((p) => ({ ...p, aktivitas: e.target.value }))}
                        rows={4}
                        required
                        placeholder="Tuliskan progres atau aktivitas yang dilakukan..."
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            File Lampiran (opsional)
                        </label>
                        <input
                            id="bimbingan-file"
                            type="file"
                            onChange={(e) => setFile(e.target.files[0] || null)}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                        />
                        {file && (
                            <p className="mt-1 text-xs text-gray-500">
                                Dipilih: <span className="font-medium text-gray-700">{file.name}</span> ({(file.size / 1024).toFixed(1)} KB)
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3 justify-end pt-2">
                        <Button variant="secondary" onClick={() => setShowModal(false)} disabled={isAdding}>
                            Batal
                        </Button>
                        <Button variant="primary" onClick={handleAdd} disabled={isAdding || !noteForm.aktivitas.trim()}>
                            {isAdding ? 'Menyimpan...' : 'Simpan Catatan'}
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit Catatan Bimbingan"
            >
                {editingNote && (
                    <div className="space-y-4">
                        <Input
                            id="edit-bimbingan-tanggal"
                            label="Tanggal Bimbingan"
                            type="date"
                            value={noteForm.tanggal}
                            onChange={(e) => setNoteForm((p) => ({ ...p, tanggal: e.target.value }))}
                        />

                        <Textarea
                            id="edit-bimbingan-aktivitas"
                            label="Aktivitas / Progress"
                            value={noteForm.aktivitas}
                            onChange={(e) => setNoteForm((p) => ({ ...p, aktivitas: e.target.value }))}
                            rows={4}
                            required
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                File Lampiran (opsional)
                            </label>
                            <input
                                id="edit-bimbingan-file"
                                type="file"
                                onChange={(e) => setFile(e.target.files[0] || null)}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                            />
                            {file && (
                                <p className="mt-1 text-xs text-gray-500">
                                    Dipilih: <span className="font-medium text-gray-700">{file.name}</span> ({(file.size / 1024).toFixed(1)} KB)
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3 justify-end pt-2">
                            <Button variant="secondary" onClick={() => setShowEditModal(false)} disabled={isUpdating}>
                                Batal
                            </Button>
                            <Button variant="primary" onClick={handleUpdate} disabled={isUpdating || !noteForm.aktivitas.trim()}>
                                {isUpdating ? 'Menyimpan...' : 'Perbarui Catatan'}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default DetailBimbinganTA;
