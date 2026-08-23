import React, { useState, useMemo } from 'react';
import { useGetPengajuanQuery, useVerifyJudulMutation } from '../api/taApi';
import { handleApiError, handleApiSuccess } from '../../shared/api/errorHandler';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Statistik from '../../../components/ui/Statistik';
import DataTableWrapper from '../../../components/ui/DataTableWrapper';
import Skeleton from '../../../components/ui/Skeleton';
import Modal from '../../../components/ui/Modal';
import Textarea from '../../../components/ui/Textarea';
import Input from '../../../components/ui/Input';
import { 
    CheckCircle, Clock, XCircle, Search, Eye, AlertCircle, FileText, 
    BookOpen, GraduationCap, ChevronRight, MessageSquare 
} from 'lucide-react';

const STATUS_CONFIG = {
    pengajuan:    { label: 'Menunggu Verifikasi', color: 'yellow' },
    revisi_judul: { label: 'Perlu Revisi',  color: 'red' },
    bimbingan:    { label: 'Bimbingan Aktif',      color: 'emerald' },
};

const getStatusBadge = (status) => {
    const cfg = STATUS_CONFIG[status] || { label: status, color: 'gray' };
    return <Badge status={cfg.color}>{cfg.label}</Badge>;
};

const VerifikasiJudulTA = () => {
    const [search, setSearch]             = useState('');
    const [selected, setSelected]         = useState(null);
    const [action, setAction]             = useState(null); // 'approved' | 'rejected'
    const [catatan, setCatatan]           = useState('');
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Ambil seluruh pengajuan untuk statistik dan tabel
    const { data, isLoading, isFetching } = useGetPengajuanQuery();
    const [verifyJudul, { isLoading: isSaving }] = useVerifyJudulMutation();

    const rawList = useMemo(() => {
        return data?.data ?? (Array.isArray(data) ? data : []);
    }, [data]);

    // Hitung statistik
    const stats = useMemo(() => {
        const list = Array.isArray(rawList) ? rawList : [];
        return {
            total: list.length,
            waiting: list.filter(item => item.status === 'pengajuan').length,
            approved: list.filter(item => item.status === 'bimbingan' || item.status === 'lulus' || item.status === 'daftar_sidang').length,
            rejected: list.filter(item => item.status === 'revisi_judul').length
        };
    }, [rawList]);

    // Filter daftar pengajuan untuk tabel (hanya tampilkan yang statusnya 'pengajuan')
    const filteredList = useMemo(() => {
        const list = Array.isArray(rawList) ? rawList : [];
        return list.filter(item => {
            const matchStatus = item.status === 'pengajuan';
            const matchSearch = search ? (
                (item.mahasiswa?.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
                (item.mahasiswa?.nim || '').toLowerCase().includes(search.toLowerCase()) ||
                (item.title || '').toLowerCase().includes(search.toLowerCase())
            ) : true;
            return matchStatus && matchSearch;
        });
    }, [rawList, search]);

    const openVerifyModal = (item, act) => {
        setSelected(item);
        setAction(act);
        setCatatan('');
        setShowDetailModal(false);
        setShowVerifyModal(true);
    };

    const openDetailModal = (item) => {
        setSelected(item);
        setShowDetailModal(true);
    };

    const handleVerify = async () => {
        if (!selected) return;
        try {
            await verifyJudul({ 
                id: selected.id, 
                status: action, 
                catatan_penolakan: action === 'rejected' ? catatan : null,
                judul_disetujui: action === 'approved' ? selected.title : null
            }).unwrap();
            handleApiSuccess(
                action === 'approved'
                    ? 'Judul Tugas Akhir berhasil disetujui!'
                    : 'Judul Tugas Akhir ditolak / dikembalikan untuk revisi.'
            );
            setShowVerifyModal(false);
            setSelected(null);
            setCatatan('');
        } catch (err) {
            handleApiError(err, 'Gagal memproses keputusan verifikasi.');
        }
    };

    const columns = [
        {
            key: 'student',
            label: 'Mahasiswa',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                        {row.mahasiswa?.user?.name ? row.mahasiswa.user.name[0] : 'M'}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800 text-sm">{row.mahasiswa?.user?.name ?? '-'}</p>
                        <p className="text-xs text-gray-500 font-mono">{row.mahasiswa?.nim ?? '-'}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'title',
            label: 'Judul yang Diajukan',
            render: (row) => (
                <div className="max-w-md">
                    <p className="text-sm font-medium text-gray-800 line-clamp-1">{row.title}</p>
                    {row.description && (
                        <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{row.description}</p>
                    )}
                </div>
            ),
        },
        {
            key: 'created_at',
            label: 'Tanggal Pengajuan',
            render: (row) => row.created_at ? (
                <div className="text-xs text-gray-600 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {new Date(row.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
            ) : '-',
        },
        {
            key: 'actions',
            label: 'Aksi',
            render: (row) => (
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openDetailModal(row)}
                        title="Tinjau Detail"
                    >
                        <Eye size={14} className="mr-1" />
                        Tinjau
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Verifikasi Judul Tugas Akhir"
                description="Tinjau, setujui, atau minta revisi judul proposal Tugas Akhir mahasiswa"
                icon={CheckCircle}
            />

            {/* Statistik Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Statistik
                    title="Total Pengajuan TA"
                    value={stats.total}
                    icon={BookOpen}
                    iconClassName="text-blue-600"
                    borderClassName="bg-blue-500"
                />
                <Statistik
                    title="Menunggu Verifikasi"
                    value={stats.waiting}
                    icon={AlertCircle}
                    iconClassName="text-yellow-600"
                    borderClassName="bg-yellow-500"
                />
                <Statistik
                    title="Judul Disetujui"
                    value={stats.approved}
                    icon={CheckCircle}
                    iconClassName="text-emerald-600"
                    borderClassName="bg-emerald-500"
                />
                <Statistik
                    title="Perlu Revisi"
                    value={stats.rejected}
                    icon={XCircle}
                    iconClassName="text-red-600"
                    borderClassName="bg-red-500"
                />
            </div>

            {/* Table Card */}
            <Card>
                <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-base font-bold text-gray-900">
                            Antrean Pengajuan Judul
                        </h3>
                        <p className="mt-0.5 text-xs text-gray-500">
                            Menampilkan seluruh judul TA mahasiswa yang memerlukan tindakan verifikasi
                        </p>
                    </div>
                    <div className="w-full sm:w-72 relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <Input
                            id="search-verifikasi"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari mahasiswa atau NIM..."
                            className="pl-9 py-1.5"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="p-6 space-y-4">
                        <Skeleton height={40} />
                        <Skeleton height={40} />
                        <Skeleton height={40} />
                    </div>
                ) : (
                    <DataTableWrapper
                        columns={columns}
                        data={filteredList}
                        emptyMessage="Tidak ada pengajuan judul Tugas Akhir yang memerlukan verifikasi."
                        loading={isFetching}
                    />
                )}
            </Card>

            {/* Modal Detail Proposal */}
            <Modal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                title="Detail Pengajuan Tugas Akhir"
                size="lg"
            >
                {selected && (
                    <div className="space-y-6">
                        {/* Detail Mahasiswa */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <GraduationCap className="w-4.5 h-4.5 text-emerald-600" />
                                Informasi Mahasiswa
                            </h4>
                            <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-4 border border-gray-100">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-semibold">Nama Mahasiswa</p>
                                    <p className="text-sm font-semibold text-gray-800 mt-1">{selected.mahasiswa?.user?.name || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-semibold">NIM</p>
                                    <p className="text-sm font-semibold text-gray-800 mt-1 font-mono">{selected.mahasiswa?.nim || '-'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Detail Judul */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <FileText className="w-4.5 h-4.5 text-emerald-600" />
                                Judul & Deskripsi TA
                            </h4>
                            <div className="bg-gray-50 rounded-xl p-4 space-y-4 border border-gray-100">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-semibold">Judul TA</p>
                                    <p className="text-sm font-bold text-gray-800 mt-1">{selected.title}</p>
                                </div>
                                {selected.description && (
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-semibold">Latar Belakang & Deskripsi Masalah</p>
                                        <p className="text-sm text-gray-600 mt-1 whitespace-pre-line leading-relaxed">{selected.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Aksi Verifikasi */}
                        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                            <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                                Tutup
                            </Button>
                            <Button variant="danger" onClick={() => openVerifyModal(selected, 'rejected')}>
                                <XCircle size={15} className="mr-1.5" />
                                Tolak & Revisi
                            </Button>
                            <Button variant="success" onClick={() => openVerifyModal(selected, 'approved')}>
                                <CheckCircle size={15} className="mr-1.5" />
                                Setujui Judul
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal Input Catatan Verifikasi */}
            <Modal
                isOpen={showVerifyModal}
                onClose={() => setShowVerifyModal(false)}
                title={action === 'approved' ? 'Setujui Judul Tugas Akhir' : 'Tolak & Minta Revisi Judul'}
            >
                {selected && (
                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <p className="text-xs text-gray-400 font-semibold uppercase">Judul TA</p>
                            <p className="text-sm font-semibold text-gray-800 mt-1">{selected.title}</p>
                        </div>

                        <Textarea
                            id="catatan-verifikator"
                            label={action === 'approved' ? 'Catatan Tambahan (opsional)' : 'Catatan Revisi / Alasan Penolakan'}
                            value={catatan}
                            onChange={(e) => setCatatan(e.target.value)}
                            rows={4}
                            required={action === 'rejected'}
                            placeholder={
                                action === 'approved'
                                    ? 'Masukkan catatan atau petunjuk awal jika ada...'
                                    : 'Jelaskan alasan judul ditolak atau poin-poin revisi yang harus diperbaiki mahasiswa...'
                            }
                        />

                        <div className="flex gap-3 justify-end pt-2">
                            <Button variant="secondary" onClick={() => setShowVerifyModal(false)} disabled={isSaving}>
                                Batal
                            </Button>
                            <Button
                                variant={action === 'approved' ? 'success' : 'danger'}
                                onClick={handleVerify}
                                disabled={isSaving || (action === 'rejected' && !catatan.trim())}
                            >
                                {isSaving ? 'Memproses...' : 'Simpan Keputusan'}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default VerifikasiJudulTA;
