import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
    useGetKpGradeQuery,
} from '../api/kpApi';
import { handleApiSuccess } from '../../shared/api/errorHandler';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Skeleton from '../../../components/ui/Skeleton';
import Input from '../../../components/ui/Input';
import {
    Award, Search, CheckCircle, Clock, Building2, Users,
    BookOpen, Trophy, Target, FileText
} from 'lucide-react';

const SCORE_COLORS = {
    A: 'bg-emerald-100 text-emerald-800',
    B: 'bg-blue-100 text-blue-800',
    C: 'bg-yellow-100 text-yellow-800',
    D: 'bg-orange-100 text-orange-800',
    E: 'bg-red-100 text-red-800',
};

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

    const stats = useMemo(() => ({
        total: filtered.length,
        finished: filtered.filter(g => g.final_grade).length,
        pending: filtered.filter(g => !g.final_grade).length,
    }), [filtered]);

    const renderScore = (value, label) => (
        <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-gray-900">{value ?? '-'}</span>
            <span className="text-xs text-gray-500">{label}</span>
        </div>
    );

    const renderGradeCard = (item) => {
        const member = item.kp_group_member;
        const group = member?.kp_group;
        const company = group?.kp_company;
        const isFinished = !!item.final_grade;

        return (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
                <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Users className="w-4 h-4 text-gray-400" />
                                <h3 className="text-sm font-semibold text-gray-900">
                                    {member?.student?.user?.name || 'Nama Mahasiswa'}
                                </h3>
                            </div>
                            <p className="text-xs text-gray-500 font-mono ml-6">
                                {member?.student?.nim || '-'}
                            </p>
                        </div>
                        {isFinished ? (
                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${SCORE_COLORS[item.final_grade] || 'bg-gray-100 text-gray-800'}`}>
                                <Trophy className="w-3 h-3" />
                                Nilai {item.final_grade}
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700">
                                <Clock className="w-3 h-3" />
                                Belum Dinilai
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <BookOpen className="w-4 h-4 text-gray-400" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500">Kelompok</p>
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {group?.name || group?.code || '-'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500">Perusahaan</p>
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {company?.name || '-'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                            Detail Nilai
                        </p>
                        <div className="flex items-center justify-between">
                            {renderScore(item.score_field, 'Lapangan')}
                            {renderScore(item.score_report, 'Laporan')}
                            {renderScore(item.score_seminar, 'Seminar')}
                            <div className="h-8 w-px bg-gray-200" />
                            <div className="flex flex-col items-center">
                                <span className={`text-lg font-bold ${isFinished ? 'text-emerald-600' : 'text-gray-400'}`}>
                                    {item.final_grade || '-'}
                                </span>
                                <span className="text-xs text-gray-500">Akhir</span>
                            </div>
                        </div>
                    </div>

                    {item.notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Catatan Dosen:</p>
                            <p className="text-sm text-gray-700">{item.notes}</p>
                        </div>
                    )}
                </div>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Nilai KP Saya"
                description="Lihat nilai Kerja Praktek Anda"
                icon={Award}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-white">
                    <div className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                            <Target className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Kelompok</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                    </div>
                </Card>
                <Card className="bg-white">
                    <div className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Sudah Dinilai</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.finished}</p>
                        </div>
                    </div>
                </Card>
                <Card className="bg-white">
                    <div className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Menunggu Nilai</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                        </div>
                    </div>
                </Card>
            </div>

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

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2].map(i => (
                        <Card key={i}>
                            <div className="p-5">
                                <Skeleton className="h-6 w-1/3 mb-4" />
                                <Skeleton className="h-4 w-1/2 mb-2" />
                                <Skeleton className="h-4 w-2/3 mb-4" />
                                <div className="flex gap-4">
                                    <Skeleton className="h-12 w-16" />
                                    <Skeleton className="h-12 w-16" />
                                    <Skeleton className="h-12 w-16" />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <Card>
                    <div className="p-12 text-center">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">
                            {search ? 'Tidak ada hasil pencarian' : 'Belum ada data nilai'}
                        </p>
                    </div>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filtered.map(renderGradeCard)}
                </div>
            )}
        </div>
    );
};

export default NilaiSaya;
