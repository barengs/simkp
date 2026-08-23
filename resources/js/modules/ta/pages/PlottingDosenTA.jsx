import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    useGetPengajuanQuery,
    useAssignSupervisorTAMutation,
} from '../api/taApi';
import { useGetAvailableLecturersQuery } from '../../kp/api/kpApi';
import { handleApiError, handleApiSuccess } from '../../shared/api/errorHandler';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Statistik from '../../../components/ui/Statistik';
import Skeleton from '../../../components/ui/Skeleton';
import Modal from '../../../components/ui/Modal';
import Combobox from '../../../components/ui/Combobox';
import Input from '../../../components/ui/Input';
import DataTableWrapper from '../../../components/ui/DataTableWrapper';
import { 
    UsersRound, UserPlus, Search, GraduationCap, Clock, 
    CheckCircle, ShieldAlert, Award, Eye 
} from 'lucide-react';

const PlottingDosenTA = () => {
    const navigate = useNavigate();
    const [search, setSearch]             = useState('');
    const [selected, setSelected]           = useState(null);
    const [chosenLecturerId, setChosenLecturer] = useState('');
    const [showModal, setShowModal]         = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Ambil seluruh pengajuan untuk plotting dan statistik
    const { data: antrean, isLoading, isFetching } = useGetPengajuanQuery();
    const { data: lecturerData }                   = useGetAvailableLecturersQuery();
    const [assignSupervisor, { isLoading: isSaving }] = useAssignSupervisorTAMutation();

    const rawList = useMemo(() => {
        return antrean?.data ?? (Array.isArray(antrean) ? antrean : []);
    }, [antrean]);

    // Hitung statistik plotting
    const stats = useMemo(() => {
        const list = Array.isArray(rawList) ? rawList.filter(item => item.status !== 'pengajuan' && item.status !== 'revisi_judul') : [];
        return {
            total: list.length,
            unassigned: list.filter(item => !item.dosen_pembimbing?.length).length,
            assigned: list.filter(item => item.dosen_pembimbing?.length).length
        };
    }, [rawList]);

    // Filter daftar pengajuan untuk plotting (hanya tampilkan yang berstatus aktif: bimbingan, sidang, lulus, dst.)
    const filteredList = useMemo(() => {
        const list = Array.isArray(rawList) ? rawList.filter(item => item.status !== 'pengajuan' && item.status !== 'revisi_judul') : [];
        return list.filter(item => {
            const matchSearch = search ? (
                (item.mahasiswa?.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
                (item.mahasiswa?.nim || '').toLowerCase().includes(search.toLowerCase()) ||
                (item.title || '').toLowerCase().includes(search.toLowerCase())
            ) : true;
            return matchSearch;
        });
    }, [rawList, search]);

    const lecturerOptions = useMemo(() => {
        const raw = lecturerData?.data ?? (Array.isArray(lecturerData) ? lecturerData : []);
        return raw.map((l) => ({
            value: l.id,
            label: l.name ?? `Dosen #${l.id}`,
        }));
    }, [lecturerData]);

    const openModal = (item) => {
        setSelected(item);
        setChosenLecturer(item.dosen_pembimbing?.[0]?.dosen_id ? String(item.dosen_pembimbing[0].dosen_id) : '');
        setShowModal(true);
    };

    const openDetail = (item) => {
        setSelected(item);
        setShowDetailModal(true);
    };

    const handleAssign = async () => {
        if (!selected || !chosenLecturerId) return;
        try {
            await assignSupervisor({
                id: selected.id,
                lecturer_id: Number(chosenLecturerId),
            }).unwrap();
            handleApiSuccess('Dosen Pembimbing Tugas Akhir berhasil ditetapkan!');
            setShowModal(false);
            navigate('/ta/bimbingan');
        } catch (err) {
            handleApiError(err, 'Gagal menetapkan dosen pembimbing.');
        }
    };

    const columns = [
        {
            key: 'mahasiswa',
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
            label: 'Judul Tugas Akhir',
            render: (row) => (
                <div className="max-w-xs md:max-w-md">
                    <p className="text-sm font-medium text-gray-800 line-clamp-1">{row.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wide">Status: {row.status}</p>
                </div>
            ),
        },
        {
            key: 'dosen_pembimbing',
            label: 'Dosen Pembimbing',
            render: (row) =>
                row.dosen_pembimbing?.[0]?.dosen ? (
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                        <CheckCircle size={14} className="text-emerald-500" />
                        {row.dosen_pembimbing[0].dosen.user?.name ?? '-'}
                    </div>
                ) : (
                    <Badge status="yellow">Belum Ditentukan</Badge>
                ),
        },
        {
            key: 'actions',
            label: 'Aksi',
            render: (row) => (
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openDetail(row)}
                        title="Lihat Detail"
                    >
                        <Eye size={14} className="mr-1" />
                        Detail
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => openModal(row)}>
                        <UserPlus size={14} className="mr-1" />
                        {row.dosen_pembimbing?.[0]?.dosen ? 'Ganti Dosen' : 'Tetapkan Dosen'}
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Plotting Dosen Pembimbing TA"
                description="Tentukan dan kelola dosen pembimbing untuk proposal Tugas Akhir yang telah disetujui"
                icon={UsersRound}
            />

            {/* Statistik Plotting */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Statistik
                    title="Total TA Disetujui"
                    value={stats.total}
                    icon={GraduationCap}
                    iconClassName="text-blue-600"
                    borderClassName="bg-blue-500"
                />
                <Statistik
                    title="Sudah Di-Plot"
                    value={stats.assigned}
                    icon={CheckCircle}
                    iconClassName="text-emerald-600"
                    borderClassName="bg-emerald-500"
                />
                <Statistik
                    title="Belum Di-Plot"
                    value={stats.unassigned}
                    icon={Clock}
                    iconClassName="text-yellow-600"
                    borderClassName="bg-yellow-500"
                />
            </div>

            {/* Tabel Plotting */}
            <Card>
                <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-base font-bold text-gray-900">
                            Daftar Plotting Dosen TA
                        </h3>
                        <p className="mt-0.5 text-xs text-gray-500">
                            Pilih dosen pembimbing utama untuk mendampingi masa bimbingan mahasiswa
                        </p>
                    </div>
                    <div className="w-full sm:w-72 relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <Input
                            id="search-plotting"
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
                        emptyMessage="Tidak ada data Tugas Akhir disetujui untuk di-plotting."
                        loading={isFetching}
                    />
                )}
            </Card>

            {/* Modal Detail TA */}
            <Modal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                title="Detail Tugas Akhir"
                size="lg"
            >
                {selected && (
                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                            <div>
                                <p className="text-xs text-gray-400 font-semibold uppercase">Nama Mahasiswa</p>
                                <p className="text-sm font-semibold text-gray-800 mt-0.5">{selected.mahasiswa?.user?.name ?? '-'}</p>
                                <p className="text-xs text-gray-400 font-mono mt-0.5">NIM: {selected.mahasiswa?.nim ?? '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-semibold uppercase">Judul TA</p>
                                <p className="text-sm font-bold text-gray-800 mt-0.5">{selected.title}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-semibold uppercase">Status</p>
                                <p className="text-sm text-gray-700 mt-0.5 capitalize">{selected.status?.replace('_', ' ') ?? '-'}</p>
                            </div>
                            {selected.dosen_pembimbing?.[0]?.dosen && (
                                <div>
                                    <p className="text-xs text-gray-400 font-semibold uppercase">Dosen Pembimbing</p>
                                    <p className="text-sm font-semibold text-emerald-700 mt-0.5">{selected.dosen_pembimbing[0].dosen.user?.name ?? '-'}</p>
                                </div>
                            )}
                            {selected.catatan_penolakan && (
                                <div>
                                    <p className="text-xs text-gray-400 font-semibold uppercase">Catatan</p>
                                    <p className="text-sm text-gray-600 mt-0.5">{selected.catatan_penolakan}</p>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end">
                            <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                                Tutup
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal Plot Dosen */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Tetapkan Dosen Pembimbing"
            >
                {selected && (
                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                            <div>
                                <p className="text-xs text-gray-400 font-semibold uppercase">Nama Mahasiswa</p>
                                <p className="text-sm font-semibold text-gray-800 mt-0.5">{selected.mahasiswa?.user?.name ?? '-'}</p>
                                <p className="text-xs text-gray-400 font-mono mt-0.5">NIM: {selected.mahasiswa?.nim ?? '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-semibold uppercase">Judul TA</p>
                                <p className="text-sm font-bold text-gray-800 mt-0.5">{selected.title}</p>
                            </div>
                        </div>

                        <Combobox
                            id="select-dosen-pembimbing"
                            label="Pilih Dosen Pembimbing"
                            value={chosenLecturerId}
                            onChange={(e) => setChosenLecturer(e.target.value)}
                            options={lecturerOptions}
                            placeholder="-- Pilih Dosen Pembimbing --"
                            required
                        />

                        <div className="flex gap-3 justify-end pt-2">
                            <Button variant="secondary" onClick={() => setShowModal(false)} disabled={isSaving}>
                                Batal
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleAssign}
                                disabled={isSaving || !chosenLecturerId}
                            >
                                {isSaving ? 'Menyimpan...' : 'Simpan Plotting'}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default PlottingDosenTA;
