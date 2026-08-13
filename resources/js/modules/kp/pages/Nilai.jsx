import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
    useGetSupervisedGroupsQuery,
    useGetKpGradeQuery,
    useCreateGroupGradeMutation,
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
    FileText, Search, Award, CheckCircle, Users,
} from 'lucide-react';

const Nilai = () => {
    const authUser = useSelector(s => s.auth.user);
    const [search, setSearch] = useState('');
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [showGradeModal, setShowGradeModal] = useState(false);
    const [gradeForm, setGradeForm] = useState({
        score_field: '',
        score_report: '',
        score_seminar: '',
        notes: '',
    });
    const [gradeErrors, setGradeErrors] = useState({});

    const { data: groupsRaw, isLoading: isLoadingGroups } = useGetSupervisedGroupsQuery();
    const { data: gradesRaw, refetch: refetchGrades } = useGetKpGradeQuery();
    const [createGroupGrade, { isLoading: isCreatingGrade }] = useCreateGroupGradeMutation();

    const groups = useMemo(() =>
        Array.isArray(groupsRaw) ? groupsRaw
        : Array.isArray(groupsRaw?.data) ? groupsRaw.data : [],
    [groupsRaw]);

    const grades = useMemo(() =>
        Array.isArray(gradesRaw) ? gradesRaw
        : Array.isArray(gradesRaw?.data) ? gradesRaw.data : [],
    [gradesRaw]);

    const filteredGroups = useMemo(() => {
        return groups.filter(group => {
            const groupName = group.name || '';
            const companyName = group.kp_company?.name || '';
            const matchSearch = !search ||
                groupName.toLowerCase().includes(search.toLowerCase()) ||
                companyName.toLowerCase().includes(search.toLowerCase());

            return matchSearch;
        });
    }, [groups, search]);

    const getGroupGrades = (groupId) => {
        return grades.filter(g => {
            const member = g.kp_group_member;
            return member?.kp_group?.id === groupId;
        });
    };

    const getGroupStats = (groupId) => {
        const groupGrades = getGroupGrades(groupId);
        const graded = groupGrades.filter(g => g.final_grade).length;
        const total = groupGrades.length;
        return { total, graded, pending: total - graded };
    };

    const openGradeModal = (group) => {
        setSelectedGroup(group);
        setGradeForm({
            score_field: '',
            score_report: '',
            score_seminar: '',
            notes: '',
        });
        setGradeErrors({});
        setShowGradeModal(true);
    };

    const calculateFinalGrade = (field, report, seminar) => {
        const scores = [field, report, seminar].filter(v => v !== null && v !== '');
        if (scores.length === 0) return '';
        const avg = scores.reduce((a, b) => Number(a) + Number(b), 0) / scores.length;
        if (avg >= 80) return 'A';
        if (avg >= 70) return 'B';
        if (avg >= 60) return 'C';
        if (avg >= 50) return 'D';
        return 'E';
    };

    const submitGroupGrade = async () => {
        if (!selectedGroup) return;
        setGradeErrors({});
        try {
            await createGroupGrade({
                kp_group_id: selectedGroup.id,
                score_field: gradeForm.score_field ? Number(gradeForm.score_field) : null,
                score_report: gradeForm.score_report ? Number(gradeForm.score_report) : null,
                score_seminar: gradeForm.score_seminar ? Number(gradeForm.score_seminar) : null,
                notes: gradeForm.notes || null,
            }).unwrap();
            handleApiSuccess('Nilai berhasil disimpan untuk seluruh anggota kelompok');
            setShowGradeModal(false);
            setSelectedGroup(null);
            refetchGrades();
        } catch (err) {
            if (err?.data?.errors) {
                setGradeErrors(err.data.errors);
            }
            handleApiError(err, 'Gagal menyimpan nilai');
        }
    };

    const columns = [
        {
            name: 'No',
            selector: (r, i) => i + 1,
            width: '60px',
            center: true,
        },
        {
            name: 'Kelompok',
            selector: r => r.name || '-',
            sortable: true,
            wrap: true,
            cell: r => (
                <div>
                    <p className="text-sm font-medium text-gray-900">{r.name || '-'}</p>
                    <p className="text-xs text-gray-500 font-mono">{r.code || '-'}</p>
                </div>
            ),
        },
        {
            name: 'Mitra',
            selector: r => r.kp_company?.name || '-',
            sortable: true,
            wrap: true,
        },
        {
            name: 'Anggota',
            selector: r => r.members?.length || 0,
            width: '100px',
            center: true,
        },
        {
            name: 'Periode',
            selector: r => r.academic_period?.name || '-',
            sortable: true,
            wrap: true,
        },
        {
            name: 'Status Nilai',
            width: '150px',
            center: true,
            cell: r => {
                const stats = getGroupStats(r.id);
                if (stats.pending === 0 && stats.total > 0) {
                    return (
                        <div className="flex items-center justify-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-xs font-medium">Selesai</span>
                        </div>
                    );
                }
                return (
                    <span className="text-xs text-yellow-600 font-medium">
                        {stats.total > 0 ? `${stats.pending} belum dinilai` : 'Belum ada nilai'}
                    </span>
                );
            },
        },
        {
            name: 'Aksi',
            width: '150px',
            center: true,
            cell: r => (
                <Button
                    size="sm"
                    variant="primary"
                    icon={Award}
                    onClick={(e) => { e.stopPropagation(); openGradeModal(r); }}
                >
                    Input Nilai
                </Button>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Nilai KP"
                description="Input dan kelola nilai Kerja Praktek mahasiswa"
                icon={Award}
            />

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <div className="p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Total Kelompok</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{groups.length}</p>
                    </div>
                </Card>
                <Card>
                    <div className="p-4">
                        <p className="text-xs text-green-700 uppercase tracking-wide">Sudah Dinilai</p>
                        <p className="text-2xl font-bold text-green-900 mt-1">
                            {groups.filter(g => getGroupStats(g.id).pending === 0 && getGroupStats(g.id).total > 0).length}
                        </p>
                    </div>
                </Card>
                <Card>
                    <div className="p-4">
                        <p className="text-xs text-yellow-700 uppercase tracking-wide">Belum Dinilai</p>
                        <p className="text-2xl font-bold text-yellow-900 mt-1">
                            {groups.filter(g => getGroupStats(g.id).pending > 0).length}
                        </p>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <div className="p-4 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Cari kelompok atau mitra..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                icon={Search}
                            />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Table */}
            <Card title="Daftar Kelompok" subtitle={`${filteredGroups.length} kelompok`}>
                {isLoadingGroups ? (
                    <Skeleton className="h-64" />
                ) : filteredGroups.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">
                            {search ? 'Tidak ada hasil pencarian' : 'Belum ada kelompok yang disetujui'}
                        </p>
                    </div>
                ) : (
                    <DataTableWrapper columns={columns} data={filteredGroups} pagination />
                )}
            </Card>

            {/* Grade Modal */}
            {showGradeModal && selectedGroup && (
                <Modal isOpen={showGradeModal} onClose={() => {
                    setShowGradeModal(false);
                    setSelectedGroup(null);
                }} title="Input Nilai Kelompok" size="lg">
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 flex gap-2">
                            <Users className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                            <span>Input nilai untuk kelompok <strong>{selectedGroup.name || '-'}</strong>. Nilai akan diterapkan ke seluruh anggota kelompok.</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="Nilai Lapangan"
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={gradeForm.score_field}
                                onChange={(e) => setGradeForm(prev => ({ ...prev, score_field: e.target.value }))}
                                placeholder="0.00"
                                error={gradeErrors.score_field?.[0]}
                            />
                            <Input
                                label="Nilai Laporan"
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={gradeForm.score_report}
                                onChange={(e) => setGradeForm(prev => ({ ...prev, score_report: e.target.value }))}
                                placeholder="0.00"
                                error={gradeErrors.score_report?.[0]}
                            />
                            <Input
                                label="Nilai Seminar"
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={gradeForm.score_seminar}
                                onChange={(e) => setGradeForm(prev => ({ ...prev, score_seminar: e.target.value }))}
                                placeholder="0.00"
                                error={gradeErrors.score_seminar?.[0]}
                            />
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Nilai Akhir (Otomatis)</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {calculateFinalGrade(gradeForm.score_field, gradeForm.score_report, gradeForm.score_seminar) || '-'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Dihitung dari rata-rata nilai lapangan, laporan, dan seminar</p>
                        </div>

                        <Textarea
                            label="Catatan"
                            value={gradeForm.notes}
                            onChange={(e) => setGradeForm(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Tambahkan catatan (opsional)..."
                            rows={3}
                            error={gradeErrors.notes?.[0]}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-6">
                        <Button variant="secondary" onClick={() => {
                            setShowGradeModal(false);
                            setSelectedGroup(null);
                        }}>Batal</Button>
                        <Button onClick={submitGroupGrade} loading={isCreatingGrade}>
                            Simpan Nilai
                        </Button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Nilai;
