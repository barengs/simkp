import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    useGetPengajuanQuery,
} from '../api/taApi';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Statistik from '../../../components/ui/Statistik';
import Skeleton from '../../../components/ui/Skeleton';
import DataTableWrapper from '../../../components/ui/DataTableWrapper';
import Input from '../../../components/ui/Input';
import { 
    BookMarked, Search, MessageSquare, User, GraduationCap, Clock, CheckCircle 
} from 'lucide-react';

const BimbinganTA = () => {
    const navigate = useNavigate();
    const authUser = useSelector((state) => state.auth.user);
    const [search, setSearch] = useState('');

    const isMahasiswa = authUser?.roles?.includes('mahasiswa');
    const isDosen = authUser?.roles?.includes('dosen');

    const { data: pengajuanRaw, isLoading: isLoadingTA } = useGetPengajuanQuery();

    const pengajuanList = useMemo(() => {
        const raw = pengajuanRaw?.data ?? (Array.isArray(pengajuanRaw) ? pengajuanRaw : []);
        const list = Array.isArray(raw) ? raw : (raw ? [raw] : []);
        if (isMahasiswa) {
            return list.filter(item => item.mahasiswa?.user?.id === authUser?.id && item.status === 'bimbingan');
        }
        return list.filter(item => item.status === 'bimbingan');
    }, [pengajuanRaw, isMahasiswa, authUser?.id]);

    const stats = useMemo(() => ({
        total: pengajuanList.length,
        withSupervisor: pengajuanList.filter(item => item.dosen_pembimbing?.length).length,
        withoutSupervisor: pengajuanList.filter(item => !item.dosen_pembimbing?.length).length,
    }), [pengajuanList]);

    const filteredTA = useMemo(() => {
        return pengajuanList.filter(item => {
            const matchSearch = !search ||
                (item.mahasiswa?.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
                (item.mahasiswa?.nim || '').toLowerCase().includes(search.toLowerCase()) ||
                (item.title || '').toLowerCase().includes(search.toLowerCase());
            return matchSearch;
        });
    }, [pengajuanList, search]);

    const taColumns = [
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
            label: 'Judul TA',
            render: (row) => (
                <div className="max-w-md">
                    <p className="text-sm font-medium text-gray-800 line-clamp-1">{row.title}</p>
                </div>
            ),
        },
        {
            key: 'dosen_pembimbing',
            label: 'Dosen Pembimbing',
            render: (row) =>
                row.dosen_pembimbing?.[0]?.dosen ? (
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                        <User size={14} className="text-emerald-500" />
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
                <Button variant="secondary" size="sm" onClick={() => navigate(`/ta/bimbingan/${row.id}`)}>
                    <MessageSquare size={14} className="mr-1" />
                    Detail Bimbingan
                </Button>
            ),
        },
    ];

    if (isLoadingTA) {
        return (
            <div className="space-y-6">
                <Skeleton height={40} width={250} />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Skeleton height={100} />
                    <Skeleton height={100} />
                    <Skeleton height={100} />
                </div>
                <Skeleton height={300} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Bimbingan Tugas Akhir"
                description="Daftar Tugas Akhir yang sedang dalam tahap bimbingan"
                icon={BookMarked}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Statistik
                    title="Total TA dalam Bimbingan"
                    value={stats.total}
                    icon={GraduationCap}
                    iconClassName="text-blue-600"
                    borderClassName="bg-blue-500"
                />
                <Statistik
                    title="Sudah Ada Dosen Pembimbing"
                    value={stats.withSupervisor}
                    icon={CheckCircle}
                    iconClassName="text-emerald-600"
                    borderClassName="bg-emerald-500"
                />
                <Statistik
                    title="Belum Ada Dosen Pembimbing"
                    value={stats.withoutSupervisor}
                    icon={Clock}
                    iconClassName="text-yellow-600"
                    borderClassName="bg-yellow-500"
                />
            </div>

            <Card>
                <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-base font-bold text-gray-900">
                            Daftar Tugas Akhir
                        </h3>
                        <p className="mt-0.5 text-xs text-gray-500">
                            Pilih TA untuk melihat detail bimbingan
                        </p>
                    </div>
                    <div className="w-full sm:w-72 relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <Input
                            id="search-bimbingan"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari mahasiswa atau NIM..."
                            className="pl-9 py-1.5"
                        />
                    </div>
                </div>

                <DataTableWrapper
                    columns={taColumns}
                    data={filteredTA}
                    emptyMessage="Tidak ada data Tugas Akhir yang sedang dalam tahap bimbingan."
                    loading={false}
                />
            </Card>
        </div>
    );
};

export default BimbinganTA;
