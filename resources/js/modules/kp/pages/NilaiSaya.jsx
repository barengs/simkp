import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
    useGetKpGradeQuery,
} from '../api/kpApi';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Skeleton from '../../../components/ui/Skeleton';
import DataTableWrapper from '../../../components/ui/DataTableWrapper';
import Input from '../../../components/ui/Input';
import { FileText, Search, CheckCircle, Award } from 'lucide-react';

const NilaiSaya = () => {
    const authUser = useSelector(s => s.auth.user);
    const [search, setSearch] = useState('');

    const { data: gradesRaw, isLoading } = useGetKpGradeQuery();

    const grades = useMemo(() =>
        Array.isArray(gradesRaw) ? gradesRaw
        : Array.isArray(gradesRaw?.data) ? gradesRaw.data : [],
    [gradesRaw]);

    const filtered = useMemo(() => {
        return grades.filter(item => {
            const member = item.kp_group_member;
            const studentName = member?.student?.user?.name || '';
            const groupName = member?.kp_group?.name || '';
            const companyName = member?.kp_group?.kp_company?.name || '';
            const matchSearch = !search ||
                studentName.toLowerCase().includes(search.toLowerCase()) ||
                groupName.toLowerCase().includes(search.toLowerCase()) ||
                companyName.toLowerCase().includes(search.toLowerCase());

            return matchSearch;
        });
    }, [grades, search]);

    const columns = [
        {
            name: 'No',
            selector: (r, i) => i + 1,
            width: '60px',
            center: true,
        },
        {
            name: 'Mahasiswa',
            selector: r => r.kp_group_member?.student?.user?.name || '-',
            sortable: true,
            wrap: true,
            cell: r => (
                <div>
                    <p className="text-sm font-medium text-gray-900">{r.kp_group_member?.student?.user?.name || '-'}</p>
                    <p className="text-xs text-gray-500 font-mono">{r.kp_group_member?.student?.nim || '-'}</p>
                </div>
            ),
        },
        {
            name: 'Kelompok',
            selector: r => r.kp_group_member?.kp_group?.name || '-',
            sortable: true,
            wrap: true,
        },
        {
            name: 'Nilai Lapangan',
            selector: r => r.score_field ?? '-',
            width: '120px',
            center: true,
        },
        {
            name: 'Nilai Laporan',
            selector: r => r.score_report ?? '-',
            width: '120px',
            center: true,
        },
        {
            name: 'Nilai Seminar',
            selector: r => r.score_seminar ?? '-',
            width: '120px',
            center: true,
        },
        {
            name: 'Nilai Akhir',
            selector: r => r.final_grade || '-',
            width: '120px',
            center: true,
            cell: r => r.final_grade ? (
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm">
                    {r.final_grade}
                </span>
            ) : '-',
        },
        {
            name: 'Status',
            width: '120px',
            center: true,
            cell: r => r.final_grade ? (
                <div className="flex items-center justify-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">Selesai</span>
                </div>
            ) : (
                <span className="text-xs text-yellow-600 font-medium">Belum</span>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Nilai KP Saya"
                description="Lihat nilai Kerja Praktek Anda"
                icon={Award}
            />

            {/* Filters */}
            <Card>
                <div className="p-4 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Cari kelompok atau perusahaan..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                icon={Search}
                            />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Table */}
            <Card title="Daftar Nilai" subtitle={`${filtered.length} entri`}>
                {isLoading ? (
                    <Skeleton className="h-64" />
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">
                            {search ? 'Tidak ada hasil pencarian' : 'Belum ada data nilai'}
                        </p>
                    </div>
                ) : (
                    <DataTableWrapper columns={columns} data={filtered} pagination />
                )}
            </Card>
        </div>
    );
};

export default NilaiSaya;
