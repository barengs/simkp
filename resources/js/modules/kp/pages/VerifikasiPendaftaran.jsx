import React, { useState, useMemo, useEffect } from 'react';
import {
    useGetVerifikasiQuery,
    useUpdateVerifikasiMutation,
    useRemoveGroupMemberMutation,
    useAddGroupMemberMutation,
    useGetAvailableLecturersQuery,
    useAssignSupervisorMutation,
    useApproveKpDocumentMutation,
    useSubmitDocumentRevisionMutation,
} from '../api/kpApi';
import {
    useGetStudentsQuery,
} from '../../master-data/api/masterDataApi';
import { handleApiError, handleApiSuccess } from '../../shared/api/errorHandler';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Statistik from '../../../components/ui/Statistik';
import DataTableWrapper from '../../../components/ui/DataTableWrapper';
import Skeleton from '../../../components/ui/Skeleton';
import Modal from '../../../components/ui/Modal';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import Input from '../../../components/ui/Input';
import Textarea from '../../../components/ui/Textarea';
import Select from '../../../components/ui/Select';
import Combobox from '../../../components/ui/Combobox';
import {
    FileText, Search, CheckCircle2, XCircle, Eye,
    Check, X, AlertCircle, Building2, BookOpen, CalendarDays,
    GraduationCap, UserPlus, User, Users, SearchX, ExternalLink, Lightbulb, Calendar, BriefcaseBusiness, UserMinus, Plus,
} from 'lucide-react';

// ─── Status configuration ─────────────────────────────────────────────────────
const STATUS_CONFIG = {
    draft: { label: 'Draft', color: 'gray' },
    submitted: { label: 'Menunggu Validasi', color: 'yellow' },
    rejected: { label: 'Ditolak', color: 'red' },
    approved: { label: 'Disetujui', color: 'emerald' },
};

const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
    return <Badge status={config.color}>{config.label}</Badge>;
};

const InfoItem = ({
    icon: Icon,
    label,
    value,
    iconClass = 'bg-gray-100 text-gray-600',
}) => (
    <div className="flex gap-4 p-5">
        <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
            <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                {label}
            </p>

            <p className="mt-1 text-sm font-semibold leading-relaxed text-gray-800">
                {value}
            </p>
        </div>
    </div>
);

// ─── Detail Modal ────────────────────────────────────────────────────────────
const DetailModal = ({
    data,
    onClose,
    onApprove,
    onReject,
    onReviseDocument,
    onApproveDocument,
    onPlot,
    onRemoveMember,
    onAddMember,
    isProcessing,
    canPlot,
    students,
    approvingDocId,
}) => {
    if (!data) return null;

    const [nimSearch, setNimSearch] = useState('');
    const [foundStudent, setFoundStudent] = useState(null);
    const [addingMember, setAddingMember] = useState(false);
    const [showAddMemberInput, setShowAddMemberInput] = useState(false);

    const [revisingDocId, setRevisingDocId] = useState(null);
    const [revisionNotes, setRevisionNotes] = useState({});
    const [validationErrors, setValidationErrors] = useState({});

    const maxMembers = data.academic_period?.total_members || 5;
    const currentMembers = data.members?.length || 0;
    const availableSlots = maxMembers - currentMembers;

    useEffect(() => {
        if (!nimSearch.trim()) {
            setFoundStudent(null);
            return;
        }

        const searchLower = nimSearch.toLowerCase();

        const found =
            students?.find(
                (student) =>
                    student.nim?.toLowerCase().includes(searchLower) ||
                    student.user?.name?.toLowerCase().includes(searchLower)
            ) || null;

        setFoundStudent(found);
    }, [nimSearch, students]);

    const handleSearch = (e) => {
        setNimSearch(e.target.value);
    };

    const handleAddMember = async () => {
        if (!foundStudent || !onAddMember) return;

        setAddingMember(true);

        try {
            await onAddMember(foundStudent.id);
            setNimSearch('');
            setFoundStudent(null);
            setShowAddMemberInput(false);
        } catch (error) {
            // Skip logging for our custom validation rejection (already shown via toast)
            if (error !== 'Mahasiswa sudah terdaftar') {
                console.error('Failed to add member:', error);
            }
        } finally {
            setAddingMember(false);
        }
    };

    const handleReviseDoc = (docId) => {
        setRevisingDocId(docId);
    };

    const handleSaveRevision = async (docId) => {
        const note = revisionNotes[docId]?.trim();

        if (!note) return;

        try {
            await onReviseDocument(docId, note);

            setRevisingDocId(null);
            setRevisionNotes((prev) => ({
                ...prev,
                [docId]: '',
            }));
            setValidationErrors({});
        } catch (error) {
            console.error('Failed to revise document:', error);
        }
    };

    const validateDocumentNotes = () => {
        const docs = data.kp_documents || [];
        const errors = {};
        const notes = [];

        // Collect all notes that are provided
        for (const doc of docs) {
            const note = revisionNotes[doc.id]?.trim();
            if (note) {  // Only collect notes that are provided
                notes.push({ docId: doc.id, note });
            }
        }

        // Check for duplicate notes only among provided notes
        if (notes.length > 0) {
            const noteValues = notes.map(n => n.note.toLowerCase());
            const uniqueNotes = new Set(noteValues);
            
            if (uniqueNotes.size !== noteValues.length) {
                // Find duplicates
                notes.forEach(({ docId, note }) => {
                    const count = noteValues.filter(n => n === note.toLowerCase()).length;
                    if (count > 1) {
                        errors[docId] = 'Catatan revisi tidak boleh sama dengan dokumen lain';
                    }
                });
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const isMemberAlreadyAdded = foundStudent
        ? data.members?.some(
              (member) => member.student?.id === foundStudent.id
          )
        : false;

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="Detail Pendaftaran Kerja Praktik"
            size="xl"
        >
            <div className="space-y-6">
                {/* Header Summary */}
                <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5">
                    <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-emerald-100/50 blur-3xl" />

                    <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
                                <BriefcaseBusiness className="h-7 w-7" />
                            </div>

                            <div>
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                    {getStatusBadge(data.status)}
                                    <span className="text-xs text-gray-400">
                                        ID #{data.id}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900">
                                    {data.kp_company?.name || 'Pendaftaran Kerja Praktik'}
                                </h3>

                                <p className="mt-1 text-sm text-gray-500">
                                    {data.kp_theme?.title || 'Tema kerja praktik belum tersedia'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                <CalendarDays className="h-4 w-4" />
                            </div>

                            <div>
                                <p className="text-xs text-gray-400">
                                    Tanggal Pendaftaran
                                </p>

                                <p className="text-sm font-semibold text-gray-800">
                                    {data.created_at
                                        ? new Date(data.created_at).toLocaleDateString(
                                              'id-ID',
                                              {
                                                  day: 'numeric',
                                                  month: 'long',
                                                  year: 'numeric',
                                              }
                                          )
                                        : '-'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Informasi Pendaftaran */}
                <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <Building2 className="h-5 w-5" />
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900">
                                Informasi Pendaftaran
                            </h4>

                            <p className="text-xs text-gray-500">
                                Informasi detail terkait pendaftaran kerja praktik
                            </p>
                        </div>
                    </div>

                    <div className="grid divide-y divide-gray-100 md:grid-cols-2 md:divide-x md:divide-y-0">
                        <InfoItem
                            icon={Building2}
                            label="Perusahaan / Instansi"
                            value={data.kp_company?.name || '-'}
                            iconClass="bg-blue-50 text-blue-600"
                        />

                        <InfoItem
                            icon={Lightbulb}
                            label="Tema Kerja Praktik"
                            value={data.kp_theme?.title || '-'}
                            iconClass="bg-amber-50 text-amber-600"
                        />

                        <InfoItem
                            icon={Calendar}
                            label="Periode Akademik"
                            value={data.academic_period?.name || '-'}
                            iconClass="bg-purple-50 text-purple-600"
                        />

                        <InfoItem
                            icon={GraduationCap}
                            label="Dosen Pembimbing"
                            value={
                                data.supervisor?.user?.name
                                    ? `${data.supervisor.user.name} (${data.supervisor.nidn || '-'})`
                                    : 'Belum ditugaskan'
                            }
                            iconClass="bg-rose-50 text-rose-600"
                        />
                    </div>
                </section>

                {/* Anggota Kelompok */}
                <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                <Users className="h-5 w-5" />
                            </div>

                            <div>
                                <h4 className="font-semibold text-gray-900">
                                    Anggota Kelompok
                                </h4>

                                <p className="text-xs text-gray-500">
                                    {currentMembers} dari {maxMembers} anggota
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="hidden items-center gap-2 sm:flex">
                                <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100">
                                    <div
                                        className="h-full rounded-full bg-emerald-500 transition-all"
                                        style={{
                                            width: `${Math.min(
                                                (currentMembers / maxMembers) * 100,
                                                100
                                            )}%`,
                                        }}
                                    />
                                </div>

                                <span className="text-xs font-medium text-gray-500">
                                    {availableSlots > 0
                                        ? `${availableSlots} slot`
                                        : 'Penuh'}
                                </span>
                            </div>

                            {availableSlots > 0 && !showAddMemberInput && (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    icon={UserPlus}
                                    onClick={() => setShowAddMemberInput(true)}
                                >
                                    Tambah Anggota
                                </Button>
                            )}
                        </div>
                    </div>

                    {showAddMemberInput && (
                        <div className="border-b border-gray-100 bg-gray-50 p-5">
                            <div className="rounded-xl border border-emerald-100 bg-white p-4">
                                <div className="mb-3 flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                        <UserPlus className="h-4 w-4" />
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">
                                            Tambahkan Anggota Baru
                                        </p>

                                        <p className="text-xs text-gray-500">
                                            Cari mahasiswa berdasarkan NIM atau nama
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <Input
                                        value={nimSearch}
                                        onChange={handleSearch}
                                        placeholder="Cari NIM atau nama mahasiswa..."
                                        icon={Search}
                                        className="flex-1"
                                    />

                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => {
                                            setShowAddMemberInput(false);
                                            setNimSearch('');
                                            setFoundStudent(null);
                                        }}
                                    >
                                        Batal
                                    </Button>
                                </div>

                                {foundStudent && (
                                    <div className="mt-4 flex flex-col gap-4 rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                                <GraduationCap className="h-5 w-5" />
                                            </div>

                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {foundStudent.user?.name}
                                                </p>

                                                <p className="font-mono text-xs text-gray-500">
                                                    {foundStudent.nim}
                                                </p>
                                            </div>
                                        </div>

                                        {isMemberAlreadyAdded ? (
                                            <Badge status="gray">
                                                Sudah Menjadi Anggota
                                            </Badge>
                                        ) : (
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                icon={UserPlus}
                                                onClick={handleAddMember}
                                                loading={addingMember}
                                                disabled={addingMember}
                                            >
                                                Tambahkan
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {!foundStudent && nimSearch && (
                                    <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                                        <SearchX className="h-4 w-4" />
                                        Mahasiswa tidak ditemukan.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="divide-y divide-gray-100">
                        {(data.members || []).map((member, index) => {
                            const name =
                                member.student?.user?.name ||
                                member.student?.name ||
                                '-';

                            const nim = member.student?.nim || '-';

                            const initials = name
                                .split(' ')
                                .map((word) => word[0])
                                .slice(0, 2)
                                .join('')
                                .toUpperCase();

                            return (
                                <div
                                    key={member.id}
                                    className="flex flex-col gap-4 px-5 py-4 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center"
                                >
                                    <div className="hidden w-8 text-center text-sm font-medium text-gray-400 sm:block">
                                        {index + 1}
                                    </div>

                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-semibold text-white shadow-sm">
                                        {initials}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="truncate font-semibold text-gray-900">
                                                {name}
                                            </p>

                                            {member.role === 'ketua' && (
                                                <Badge status="amber">
                                                    Ketua Kelompok
                                                </Badge>
                                            )}
                                        </div>

                                        <p className="mt-0.5 font-mono text-xs text-gray-500">
                                            {nim}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-end">
                                        {member.role !== 'ketua' ? (
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                icon={UserMinus}
                                                onClick={() =>
                                                    onRemoveMember?.(member)
                                                }
                                                loading={isProcessing}
                                            >
                                                Keluarkan
                                            </Button>
                                        ) : (
                                            <span className="text-xs font-medium text-amber-600">
                                                Ketua Kelompok
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Dokumen */}
                <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                                <FileText className="h-5 w-5" />
                            </div>

                            <div>
                                <h4 className="font-semibold text-gray-900">
                                    Dokumen Pendaftaran
                                </h4>

                                <p className="text-xs text-gray-500">
                                    {data.kp_documents?.length || 0} dokumen tersedia
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Validation Summary */}
                    {Object.keys(validationErrors).length > 0 && (
                        <div className="mx-5 my-4 rounded-lg border border-red-200 bg-red-50 p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-red-800">
                                        Validasi Dokumen Gagal
                                    </p>
                                    <p className="mt-1 text-sm text-red-700">
                                        Catatan revisi dokumen tidak boleh sama satu dengan lainnya.
                                    </p>
                                    <p className="mt-1 text-xs text-red-600">
                                        {Object.keys(validationErrors).length} dokumen memiliki catatan duplikat.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {data.kp_documents?.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {data.kp_documents.map((doc, index) => (
                                <div key={doc.id} className="px-5 py-4">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                                            <FileText className="h-5 w-5" />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="font-semibold text-gray-900">
                                                    {doc.document_type?.name ||
                                                        doc.title ||
                                                        `Dokumen ${index + 1}`}
                                                </p>

                                                <Badge
                                                    status={
                                                        doc.status === 'approved'
                                                            ? 'approved'
                                                            : doc.status === 'rejected'
                                                            ? 'rejected'
                                                            : doc.status === 'revision'
                                                            ? 'warning'
                                                            : 'submitted'
                                                    }
                                                >
                                                    {doc.status === 'approved'
                                                        ? 'Disetujui'
                                                        : doc.status === 'rejected'
                                                        ? 'Ditolak'
                                                        : doc.status === 'revision'
                                                        ? 'Revisi'
                                                        : 'Menunggu'}
                                                </Badge>
                                            </div>

                                            {doc.notes && (
                                                <p className="mt-1 text-sm text-gray-800">
                                                    {doc.notes}
                                                </p>
                                            )}

                                            <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                                                <CalendarDays className="h-3.5 w-3.5" />

                                                {doc.submitted_at || doc.created_at
                                                    ? new Date(
                                                          doc.submitted_at ||
                                                              doc.created_at
                                                      ).toLocaleDateString(
                                                          'id-ID',
                                                          {
                                                              day: 'numeric',
                                                              month: 'short',
                                                              year: 'numeric',
                                                          }
                                                      )
                                                    : '-'}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {doc.file_url && (
                                                <a
                                                    href={doc.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        icon={ExternalLink}
                                                    >
                                                        Lihat
                                                    </Button>
                                                </a>
                                            )}

                                            {revisingDocId !== doc.id && doc.status !== 'approved' && (
                                                <>
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        icon={Check}
                                                        onClick={() => onApproveDocument?.(doc.id)}
                                                        loading={approvingDocId === doc.id}
                                                        disabled={approvingDocId === doc.id}
                                                    >
                                                        Setujui
                                                    </Button>
                                                    <Button
                                                        variant="warning"
                                                        size="sm"
                                                        icon={AlertCircle}
                                                        onClick={() =>
                                                            handleReviseDoc(doc.id)
                                                        }
                                                    >
                                                        Minta Revisi
                                                    </Button>
                                                </>
                                            )}
                                            {revisingDocId !== doc.id && doc.status === 'approved' && (
                                                <Badge status="approved">Disetujui</Badge>
                                            )}
                                        </div>
                                    </div>

                                    {revisingDocId === doc.id && (
                                        <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50/50 p-4">
                                            <div className="mb-3 flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4 text-orange-600" />

                                                <p className="text-sm font-semibold text-orange-800">
                                                    Catatan Revisi Dokumen
                                                </p>
                                            </div>

                                            <Textarea
                                                value={revisionNotes[doc.id] || ''}
                                                onChange={(e) =>
                                                    setRevisionNotes((prev) => ({
                                                        ...prev,
                                                        [doc.id]: e.target.value,
                                                    }))
                                                }
                                                placeholder="Tuliskan catatan atau perbaikan yang harus dilakukan mahasiswa..."
                                                rows={3}
                                            />

                                            {validationErrors[doc.id] && (
                                                <div className="mt-2 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                                    <span>{validationErrors[doc.id]}</span>
                                                </div>
                                            )}

                                            <div className="mt-3 flex justify-end gap-2">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() =>
                                                        setRevisingDocId(null)
                                                    }
                                                >
                                                    Batal
                                                </Button>

                                                <Button
                                                    variant="warning"
                                                    size="sm"
                                                    icon={Check}
                                                    onClick={() =>
                                                        handleSaveRevision(doc.id)
                                                    }
                                                    disabled={
                                                        !revisionNotes[
                                                            doc.id
                                                        ]?.trim()
                                                    }
                                                >
                                                    Simpan Catatan
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-gray-300">
                                <FileText className="h-8 w-8" />
                            </div>

                            <p className="font-semibold text-gray-700">
                                Belum Ada Dokumen
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                                Mahasiswa belum mengunggah dokumen pendaftaran.
                            </p>
                        </div>
                    )}
                </section>

                {/* Catatan Penolakan */}
                {data.rejection_note && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                                <XCircle className="h-5 w-5" />
                            </div>

                            <div>
                                <p className="font-semibold text-red-900">
                                    Pendaftaran Ditolak
                                </p>

                                <p className="mt-1 text-sm leading-relaxed text-red-700">
                                    {data.rejection_note}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Catatan Revisi */}
                {data.document_revision_note && (
                    <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                                <AlertCircle className="h-5 w-5" />
                            </div>

                            <div>
                                <p className="font-semibold text-orange-900">
                                    Dokumen Memerlukan Revisi
                                </p>

                                <p className="mt-1 text-sm leading-relaxed text-orange-700">
                                    {data.document_revision_note}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Action */}
            <div className="sticky bottom-0 mt-8 border-t border-gray-200 bg-white pt-5">
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-xs text-gray-400">
                        Detail pendaftaran kerja praktik
                    </span>

                    <div className="flex flex-wrap justify-end gap-2">
                        <Button variant="secondary" onClick={onClose}>
                            Tutup
                        </Button>

                        {data.status === 'submitted' && (
                            <>
                                <Button
                                    variant="danger"
                                    icon={XCircle}
                                    onClick={onReject}
                                    loading={isProcessing}
                                >
                                    Tolak
                                </Button>

                                <Button
                                    variant="primary"
                                    icon={CheckCircle2}
                                    onClick={() => {
                                        if (validateDocumentNotes()) {
                                            onApprove();
                                        }
                                    }}
                                    loading={isProcessing}
                                >
                                    Setujui Pendaftaran
                                </Button>
                            </>
                        )}

                        {data.status === 'approved' && (
                            <>
                                {(!data.document_revision_note ||
                                    (data.kp_documents || []).some(
                                        (doc) =>
                                            doc.status === 'submitted' ||
                                            !doc.status
                                    )) && (
                                    <Button
                                        variant="warning"
                                        icon={AlertCircle}
                                        onClick={() => onReviseDocument?.(doc?.id, revisionNotes[doc?.id] || '')}
                                        loading={isProcessing}
                                    >
                                        Revisi Dokumen
                                    </Button>
                                )}

                                {canPlot && (
                                    <Button
                                        variant="primary"
                                        icon={GraduationCap}
                                        onClick={onPlot}
                                        loading={isProcessing}
                                    >
                                        Plotting Dosen
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

// ─── Reject Registration Modal ────────────────────────────────────────────────
const RejectRegistrationModal = ({ isOpen, onClose, onConfirm, submitting, data }) => {
    const [reason, setReason] = useState('');

    const handleConfirm = () => {
        onConfirm(reason);
        setReason('');
    };

    const handleClose = () => {
        setReason('');
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Tolak Pendaftaran KP"
            size="md"
        >
            <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800 flex gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
                    <span>Pendaftaran KP ini akan ditolak. Mahasiswa tidak dapat melanjutkan hingga mendaftar ulang.</span>
                </div>

                <div>
                    <p className="text-sm text-gray-600 mb-2">
                        Pendaftaran dari <strong>{data?.student?.name}</strong> ({data?.student?.nim}) akan ditolak.
                    </p>
                </div>

                <Textarea
                    label="Catatan Penolakan Pendaftaran"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Jelaskan alasan penolakan pendaftaran..."
                    rows={4}
                    required
                />
            </div>

            <div className="flex justify-end gap-3 pt-6">
                <Button variant="secondary" onClick={handleClose}>
                    Batal
                </Button>
                <Button
                    variant="danger"
                    icon={XCircle}
                    onClick={handleConfirm}
                    loading={submitting}
                    disabled={!reason.trim()}
                >
                    Tolak Pendaftaran
                </Button>
            </div>
        </Modal>
    );
};

// ─── Document Revision Modal ──────────────────────────────────────────────────
const DocumentRevisionModal = ({ isOpen, onClose, onConfirm, submitting, data }) => {
    const [reason, setReason] = useState('');

    const handleConfirm = () => {
        onConfirm(reason);
        setReason('');
    };

    const handleClose = () => {
        setReason('');
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Revisi Dokumen"
            size="md"
        >
            <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800 flex gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-orange-600" />
                    <span>Dokumen pendaftaran perlu direvisi. Pendaftaran diterima, namun dokumen wajib diperbaiki.</span>
                </div>

                <div>
                    <p className="text-sm text-gray-600 mb-2">
                        Dokumen dari <strong>{data?.student?.name}</strong> ({data?.student?.nim}) perlu revisi.
                    </p>
                </div>

                <Textarea
                    label="Catatan Revisi Dokumen"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Jelaskan dokumen apa yang perlu diperbaiki..."
                    rows={4}
                    required
                />
            </div>

            <div className="flex justify-end gap-3 pt-6">
                <Button variant="secondary" onClick={handleClose}>
                    Batal
                </Button>
                <Button
                    variant="warning"
                    icon={AlertCircle}
                    onClick={handleConfirm}
                    loading={submitting}
                    disabled={!reason.trim()}
                >
                    Minta Revisi Dokumen
                </Button>
            </div>
        </Modal>
    );
};

// ─── Approve Modal ────────────────────────────────────────────────────────────
const ApproveModal = ({ isOpen, onClose, onConfirm, submitting, data }) => {
    const [notes, setNotes] = useState('');

    const handleConfirm = () => {
        onConfirm(notes);
        setNotes('');
    };

    const handleClose = () => {
        setNotes('');
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Setuju Pendaftaran KP"
            size="md"
        >
            <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-800 flex gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
                    <span>Pendaftaran akan disetujui dan mahasiswa dapat melanjutkan ke tahap berikutnya.</span>
                </div>

                <div>
                    <p className="text-sm text-gray-600 mb-2">
                        Setuju pendaftaran dari <strong>{data?.student?.name}</strong> ({data?.student?.nim})?
                    </p>
                </div>

                <Textarea
                    label="Catatan (Opsional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tambahkan catatan atau apresiasi..."
                    rows={4}
                />
            </div>

            <div className="flex justify-end gap-3 pt-6">
                <Button variant="secondary" onClick={handleClose}>
                    Batal
                </Button>
                <Button
                    variant="primary"
                    icon={CheckCircle2}
                    onClick={handleConfirm}
                    loading={submitting}
                >
                    Setuju Pendaftaran
                </Button>
            </div>
        </Modal>
    );
};

// ─── Plotting Modal ───────────────────────────────────────────────────────────
const PlottingModal = ({ isOpen, onClose, onConfirm, submitting, data, lecturers }) => {
    const [selectedLecturer, setSelectedLecturer] = useState('');

    // Convert lecturers to options format for combobox
    const lecturerOptions = (lecturers || []).map(l => ({
        value: l.id,
        label: l.name || l.label,
    }));

    const handleConfirm = () => {
        if (!selectedLecturer) return;
        onConfirm(Number(selectedLecturer));
        setSelectedLecturer('');
    };

    const handleClose = () => {
        setSelectedLecturer('');
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Plotting Dosen Pembimbing"
            size="md"
        >
            <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 flex gap-2">
                    <UserPlus className="w-4 h-4 mt-0.5 shrink-0 text-blue-600" />
                    <span>Pilih dosen pembimbing untuk kelompok ini.</span>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Kelompok</p>
                    <p className="text-sm font-medium text-gray-900 font-mono">{data?.id}</p>
                    <p className="text-xs text-gray-500">{data?.kp_company?.name}</p>
                </div>

                <Combobox
                    label="Pilih Dosen Pembimbing"
                    value={selectedLecturer}
                    onChange={(e) => setSelectedLecturer(e.target.value)}
                    options={lecturerOptions}
                    placeholder="Cari atau pilih dosen..."
                    required
                />
            </div>

            <div className="flex justify-end gap-3 pt-6">
                <Button variant="secondary" onClick={handleClose}>
                    Batal
                </Button>
                <Button
                    variant="primary"
                    icon={User}
                    onClick={handleConfirm}
                    loading={submitting}
                    disabled={!selectedLecturer}
                >
                    Plotting
                </Button>
            </div>
        </Modal>
    );
};

// ─── Add Member Modal (dynamic multiple input) ────────────────────────────────
const AddMemberModal = ({ isOpen, onClose, selectedData, students, isLoadingStudents, studentSearchTerm, onSearchChange, selectedMemberIds, onAdd, onRemove, maxMembers }) => {
    const filteredStudents = students.filter(s =>
        !selectedData?.members?.some(m => m.student?.id === s.id)
    );

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />
                <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Kelola Anggota Kelompok</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="px-6 py-4 max-h-[75vh] overflow-y-auto">
                        {/* Anggota Saat Ini */}
                        {selectedData && selectedData.members && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                                    Anggota Saat Ini ({selectedData.members.length} / {maxMembers || 5} orang)
                                </p>
                                <ul className="space-y-1">
                                    {selectedData.members.slice(0, 5).map((m) => (
                                        <li key={m.id} className="flex items-center justify-between text-sm py-1">
                                            <span className="text-gray-700">{m.student?.name} ({m.student?.nim})</span>
                                            <Badge status={m.role === 'ketua' ? 'ketua' : 'anggota'}>{m.role === 'ketua' ? 'Ketua' : 'Anggota'}</Badge>
                                        </li>
                                    ))}
                                    {selectedData.members.length > 5 && <li className="text-xs text-gray-400">+{selectedData.members.length - 5} lainnya...</li>}
                                </ul>
                            </div>
                        )}

                        {/* Cari Mahasiswa */}
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">
                                Cari Mahasiswa (NIM / Nama)
                                <span className="ml-2 text-xs text-gray-400 font-normal">
                                    {students.length > 0 && `(${students.length} data tersedia)`}
                                </span>
                            </label>
                            <Input
                                value={studentSearchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                                placeholder="Ketik NIM atau nama mahasiswa..."
                                icon={Search}
                            />
                            <div className="bg-white border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                                {!studentSearchTerm.trim() ? (
                                    <div className="p-4 text-center text-gray-500">
                                        Ketik NIM atau nama mahasiswa untuk mencari
                                    </div>
                                ) : isLoadingStudents ? (
                                    <div className="p-4 text-center text-gray-500">Memuat data mahasiswa</div>
                                ) : filteredStudents.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500">
                                        Tidak ada mahasiswa ditemukan atau sudah menjadi anggota
                                    </div>
                                ) : (
                                    filteredStudents
                                        .filter(s =>
                                            s.nim?.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
                                            s.user?.name?.toLowerCase().includes(studentSearchTerm.toLowerCase())
                                        )
                                        .map((s) => {
                                            const alreadySelected = selectedMemberIds.includes(s.id);
                                            return (
                                                <div key={s.id} className="border-t border-gray-100">
                                                    <div className="flex items-center justify-between p-3 hover:bg-gray-50">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                                <GraduationCap className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">{s.user?.name}</p>
                                                                <p className="text-xs text-gray-500 font-mono">{s.nim}</p>
                                                            </div>
                                                        </div>
                                                        {alreadySelected ? (
                                                            <Button
                                                                size="sm"
                                                                variant="secondary"
                                                                icon={X}
                                                                onClick={() => onRemove(s.id)}
                                                                className="text-xs"
                                                            >
                                                                Hapus
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                variant="primary"
                                                                icon={Plus}
                                                                onClick={() => onAdd(s.id)}
                                                                className="text-xs"
                                                                disabled={selectedMemberIds.length >= (maxMembers - selectedData.members.length)}
                                                            >
                                                                Tambah
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                )}
                            </div>
                        </div>

                        {/* Daftar Mahasiswa yang Dipilih */}
                        {selectedMemberIds.length > 0 && (
                            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                                <p className="text-sm font-medium text-emerald-800 mb-2 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Mahasiswa Dipilih ({selectedMemberIds.length})
                                </p>
                                <ul className="space-y-1">
                                    {selectedMemberIds.map(id => {
                                        const s = students.find(st => st.id === id);
                                        if (!s) return null;
                                        return (
                                            <li key={s.id} className="flex items-center justify-between text-sm py-1">
                                                <span className="text-gray-700">{s.user?.name} ({s.nim})</span>
                                                <button
                                                    onClick={() => onRemove(s.id)}
                                                    className="text-xs text-emerald-600 hover:underline"
                                                >
                                                    Hapus
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                        <div className="flex justify-end gap-2">
                            <Button variant="secondary" onClick={onClose}>
                                Batal
                            </Button>
                            <Button
                                variant="primary"
                                icon={UserPlus}
                                onClick={onClose}
                                disabled={selectedMemberIds.length === 0}
                            >
                                Simpan
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const VerifikasiPendaftaran = () => {
    // API
    const { data: verifikasiRaw, isLoading, refetch } = useGetVerifikasiQuery();
    const { data: lecturersRaw } = useGetAvailableLecturersQuery();
    const [updateVerifikasi, { isLoading: isUpdating }] = useUpdateVerifikasiMutation();
    const [removeGroupMember, { isLoading: isRemovingMember }] = useRemoveGroupMemberMutation();
    const [addGroupMember, { isLoading: isAddingMember }] = useAddGroupMemberMutation();
    const [assignSupervisor, { isLoading: isAssigning }] = useAssignSupervisorMutation();
    const [approveKpDocument] = useApproveKpDocumentMutation();
    const [submitDocumentRevision] = useSubmitDocumentRevisionMutation();

    // State
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [filterStatus, setFilterStatus] = useState('');
    const [selectedData, setSelectedData] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [approvingDocId, setApprovingDocId] = useState(null);
    const [showReject, setShowReject] = useState(false);
    const [showReviseDocument, setShowReviseDocument] = useState(false);
    const [showApprove, setShowApprove] = useState(false);
    const [showPlotting, setShowPlotting] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState(null);
    const [showAddMember, setShowAddMember] = useState(false);
    const [selectedMemberIds, setSelectedMemberIds] = useState([]);
    const [studentSearchTerm, setStudentSearchTerm] = useState('');
    const [debouncedStudentSearch, setDebouncedStudentSearch] = useState('');
    const [studentSearchResults, setStudentSearchResults] = useState([]);
    const [isSearchingStudents, setIsSearchingStudents] = useState(false);

    // Debounce student search to avoid too many API calls
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedStudentSearch(studentSearchTerm);
        }, 300);
        return () => clearTimeout(handler);
    }, [studentSearchTerm]);

    // API - fetch students always (needed for inline search in DetailModal)
    const { data: studentsRaw, isLoading: isLoadingStudents, refetch: refetchStudents } = useGetStudentsQuery(
        { per_page: 500 }
    );

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Keep selectedData in sync with latest verifikasi query data
    useEffect(() => {
        if (selectedData) {
            const list = Array.isArray(verifikasiRaw) ? verifikasiRaw
                : Array.isArray(verifikasiRaw?.data) ? verifikasiRaw.data : [];
            const updated = list.find(item => item.id === selectedData.id);
            if (updated) {
                setSelectedData(updated);
            }
        }
    }, [verifikasiRaw]);

    // Debounce student search
    useEffect(() => {
        const handler = setTimeout(() => {
            // useGetStudentsQuery will automatically refetch with new search param
        }, 300);
        return () => clearTimeout(handler);
    }, [studentSearchTerm]);

    // Process data
    const verifikasi = useMemo(() =>
        Array.isArray(verifikasiRaw) ? verifikasiRaw
            : Array.isArray(verifikasiRaw?.data) ? verifikasiRaw.data : [],
        [verifikasiRaw]);

    const lecturers = useMemo(() =>
        Array.isArray(lecturersRaw) ? lecturersRaw
            : Array.isArray(lecturersRaw?.data) ? lecturersRaw.data : [],
        [lecturersRaw]);

    const students = useMemo(() =>
        Array.isArray(studentsRaw) ? studentsRaw
            : Array.isArray(studentsRaw?.data) ? studentsRaw.data : [],
        [studentsRaw]);

    const filtered = useMemo(() =>
        verifikasi.filter(item => {
            const matchSearch = !debouncedSearch ||
                item.student?.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                item.student?.nim?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                item.kp_company?.name?.toLowerCase().includes(debouncedSearch.toLowerCase());

            const matchStatus = !filterStatus || item.status === filterStatus;

            return matchSearch && matchStatus;
        }),
        [verifikasi, debouncedSearch, filterStatus]);

    const paginatedData = useMemo(() => {
        const start = (page - 1) * perPage;
        return filtered.slice(start, start + perPage);
    }, [filtered, page, perPage]);

    // Stats
    const stats = useMemo(() => ({
        total: verifikasi.length,
        submitted: verifikasi.filter(v => v.status === 'submitted').length,
        approved: verifikasi.filter(v => v.status === 'approved').length,
        rejected: verifikasi.filter(v => v.status === 'rejected').length,
    }), [verifikasi]);

    // Handlers
    const handleView = (data) => {
        setSelectedData(data);
        setShowDetail(true);
    };

    const handleReject = async (reason) => {
        if (!reason.trim()) return;
        await submitVerification(selectedData.id, 'rejected', reason)
            .then(() => {
                setShowReject(false);
                setShowDetail(false);
                refetch();
                setPage(1);
            })
            .catch(() => { });
    };

    const handleReviseDocument = async (note) => {
        if (!note.trim()) return;
        await submitDocumentRevision({ groupId: selectedData.id, documentId: null, notes: note })
            .unwrap()
            .then(() => {
                setShowReviseDocument(false);
                setShowDetail(false);
                refetch();
                setPage(1);
            })
            .catch(() => { });
    };

    const handleApprove = (notes) => {
        submitVerification(selectedData.id, 'approved', notes)
            .then(() => {
                setShowApprove(false);
                setShowDetail(false);
                refetch();
                setPage(1);
            })
            .catch(() => { });
    };

    const handlePlotting = (lecturerId) => {
        submitPlotting(selectedData.id, lecturerId);
    };

    const submitVerification = async (id, status, notes) => {
        try {
            const payload = { id, status };
            if (status === 'rejected') {
                payload.rejection_note = notes;
            } else if (status === 'approved') {
                payload.notes = notes;
            }

            await updateVerifikasi(payload).unwrap();
            handleApiSuccess(
                status === 'approved'
                    ? 'Pendaftaran berhasil disetujui'
                    : status === 'rejected'
                        ? 'Pendaftaran ditolak'
                        : 'Pendaftaran berhasil disetujui'
            );
        } catch (err) {
            handleApiError(err, 'Gagal memproses verifikasi');
            throw err;
        }
    };



    const submitPlotting = async (id, lecturerId) => {
        try {
            await assignSupervisor({ kp_group_id: id, lecturer_id: lecturerId }).unwrap();
            handleApiSuccess('Dosen pembimbing berhasil ditugaskan');
            setShowPlotting(false);
            setShowDetail(false);
            refetch();
            setPage(1);
        } catch (err) {
            handleApiError(err, 'Gagal menugaskan dosen pembimbing');
        }
    };

    const submitRemoveMember = async () => {
        if (!selectedData || !memberToRemove) return;
        try {
            const res = await removeGroupMember({
                groupId: selectedData.id,
                memberId: memberToRemove.id,
            }).unwrap();

            handleApiSuccess(res?.message || 'Anggota berhasil dikeluarkan');

            if (res?.data) {
                setSelectedData(res.data);
            }
            setMemberToRemove(null);
            refetch();
        } catch (err) {
            handleApiError(err, 'Gagal mengeluarkan anggota');
        }
    };

const submitAddMember = async () => {
        if (!selectedData || selectedMemberIds.length === 0) return;

        // Check if any selected student is already in another active group
        const alreadyInGroupStudents = [];
        for (const studentId of selectedMemberIds) {
            const isAlreadyInGroup = verifikasi.some(g =>
                g.members.some(m => m.student_id === Number(studentId)) &&
                ['submitted', 'approved', 'ongoing', 'grading'].includes(g.status)
            );
            if (isAlreadyInGroup) {
                const student = students.find(s => s.id === Number(studentId));
                alreadyInGroupStudents.push(student?.user?.name || `ID ${studentId}`);
            }
        }

        if (alreadyInGroupStudents.length > 0) {
            handleApiError({ data: { message: `Mahasiswa ${alreadyInGroupStudents.join(', ')} sudah terdaftar dalam kelompok KP lain.` } });
            return;
        }

        try {
            let lastResult = null;
            for (const studentId of selectedMemberIds) {
                const res = await addGroupMember({
                    groupId: selectedData.id,
                    studentId: Number(studentId),
                }).unwrap();
                lastResult = res;
            }

            handleApiSuccess(lastResult?.message || 'Anggota baru ditambahkan ke kelompok');

            if (lastResult?.data) {
                setSelectedData(lastResult.data);
            }
            setShowAddMember(false);
            setSelectedMemberIds([]);
            setStudentSearchTerm('');
            setStudentSearchResults([]);
            refetch();
        } catch (err) {
            handleApiError(err, 'Gagal menambahkan anggota');
        }
    };

    const handleAddMemberSelect = (studentId) => {
        setSelectedMemberIds(prev => [...prev, studentId]);
    };

    const handleRemoveMemberSelect = (studentId) => {
        setSelectedMemberIds(prev => prev.filter(id => id !== studentId));
    };

    const approveDocument = async (docId) => {
        try {
            setApprovingDocId(docId);
            const res = await approveKpDocument(docId).unwrap();
            handleApiSuccess(res?.message || 'Dokumen disetujui');
            refetch();
            if (selectedData && res?.data) {
                setSelectedData(res.data);
            }
        } catch (err) {
            handleApiError(err, 'Gagal menyetujui dokumen');
        } finally {
            setApprovingDocId(null);
        }
    };

    const maxMembers = selectedData?.academic_period?.total_members || 5;
    const currentMembersCount = selectedData?.members?.length || 0;
    const availableSlots = maxMembers - currentMembersCount;

    // Table columns
    const columns = [
        {
            name: 'Mahasiswa',
            selector: row =>
                row.members?.find(m => m.role === "ketua")
                    ?.student?.user?.name ?? "-",
            sortable: true,
            wrap: true,
            cell: row => {
                const ketua = row.members?.find(m => m.role === "ketua");
                return (
                    <div>
                        <p className="text-sm font-medium text-gray-900">{ketua?.student?.name || '-'}</p>
                        <p className="text-xs text-gray-500 font-mono">{ketua?.student?.nim || '-'}</p>
                    </div>
                );
            }
        },
        {
            name: 'Perusahaan',
            selector: row => row.kp_company?.name || '-',
            sortable: true,
            wrap: true,
        },
        {
            name: 'Tema KP',
            selector: row => row.kp_theme?.title || '-',
            sortable: true,
            wrap: true,
        },
        {
            name: 'Periode',
            selector: row => row.academic_period?.name || '-',
            sortable: true,
            wrap: true,
        },
        {
            name: 'Status',
            selector: row => row.status,
            sortable: true,
            width: '200px',
            cell: row => (
                <div className="text-center">
                    {getStatusBadge(row.status)}
                </div>
            ),
        },
        {
            name: 'Tanggal',
            selector: row => row.created_at,
            sortable: true,
            width: '120px',
            cell: row => row.created_at
                ? new Date(row.created_at).toLocaleDateString('id-ID')
                : '-',
        },
        {
            name: 'Aksi',
            width: '200px',
            cell: row => (
                <div className="flex gap-1 justify-center">
                    <Button
                        size="sm"
                        variant="secondary"
                        icon={Eye}
                        onClick={() => handleView(row)}
                    />
                    {row.status === 'submitted' && (
                        <>
                            <Button
                                size="sm"
                                variant="success"
                                icon={Check}
                                onClick={() => {
                                    setSelectedData(row);
                                    setShowApprove(true);
                                }}
                            />
                            <Button
                                size="sm"
                                variant="danger"
                                icon={X}
                                onClick={() => {
                                    setSelectedData(row);
                                    setShowReject(true);
                                }}
                            />
                        </>
                    )}
                    {row.status === 'approved' && (!row.document_revision_note || (row.kp_documents || []).some(doc => doc.status === 'submitted' || !doc.status)) && (
                        <Button
                            size="sm"
                            variant="warning"
                            icon={AlertCircle}
                            onClick={() => {
                                setSelectedData(row);
                                setShowReviseDocument(true);
                            }}
                        />
                    )}
                    {row.status === 'approved' && (
                        <Button
                            size="sm"
                            variant="primary"
                            icon={UserPlus}
                            onClick={() => {
                                setSelectedData(row);
                                setShowPlotting(true);
                            }}
                        >
                            Plotting
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Verifikasi Pendaftaran KP"
                description="Validasi dan approve/reject pendaftaran kelompok kerja praktek"
                icon={FileText}
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Statistik
                    title="Total Pendaftaran"
                    value={stats.total}
                    icon={FileText}
                    iconClassName="text-blue-600"
                    borderClassName="bg-blue-500"
                />
                <Statistik
                    title="Menunggu Validasi"
                    value={stats.submitted}
                    icon={AlertCircle}
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
                <Statistik
                    title="Ditolak"
                    value={stats.rejected}
                    icon={XCircle}
                    iconClassName="text-red-600"
                    borderClassName="bg-red-500"
                />
            </div>

            {/* Table */}
            <Card>
                <div className="
                    flex flex-col
                    gap-4
                    border-b border-gray-100
                    p-5
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                ">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">
                            Daftar Pendaftaran
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">
                            {debouncedSearch || filterStatus
                                ? `${filtered.length} hasil ditemukan`
                                : `${filtered.length} pendaftaran`}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-full sm:w-80">
                            <Input
                                placeholder="Cari nama, NIM, perusahaan, atau kode..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                icon={Search}
                            />
                        </div>
                        <div className="w-full sm:w-48">
                            <Select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="">Semua Status</option>
                                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                    <option key={key} value={key}>{config.label}</option>
                                ))}
                            </Select>
                        </div>
                    </div>
                </div>
                <div className="overflow-hidden">
                    {isLoading ? (
                        <Skeleton className="h-64" />
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">
                                {debouncedSearch || filterStatus ? 'Tidak ada hasil pencarian' : 'Belum ada pendaftaran'}
                            </p>
                        </div>
                    ) : (
                        <DataTableWrapper
                            columns={columns}
                            data={paginatedData}
                            pagination
                            paginationTotalRows={filtered.length}
                            paginationDefaultPage={page}
                            onChangeRowsPerPage={(currentRowsPerPage) => {
                                setPerPage(currentRowsPerPage);
                                setPage(1);
                            }}
                            onChangePage={(page) => setPage(page)}
                            highlightOnHover
                        />
                    )}
                </div>
            </Card>

            {/* Modals */}
            {showDetail && (
                <DetailModal
                    data={selectedData}
                    onClose={() => setShowDetail(false)}
                    onApprove={() => setShowApprove(true)}
                    onReject={() => setShowReject(true)}
                    onReviseDocument={async (docId, notes) => {
                        try {
                            const res = await submitDocumentRevision({ groupId: selectedData.id, documentId: docId, notes }).unwrap();
                            handleApiSuccess(res?.message || 'Dokumen diminta revisi');
                            if (selectedData && res?.data) {
                                setSelectedData(res.data);
                            }
                            refetch();
                        } catch (err) {
                            handleApiError(err, 'Gagal meminta revisi dokumen');
                        }
                    }}
                    onApproveDocument={(docId) => approveDocument(docId)}
                    onPlot={() => setShowPlotting(true)}
                    onRemoveMember={(member) => setMemberToRemove(member)}
                    onAddMember={(studentId) => {
                        // Check if student is already in another active group
                        const isAlreadyInGroup = verifikasi.some(g => 
                            g.members.some(m => m.student_id === Number(studentId)) && 
                            ['submitted', 'approved', 'ongoing', 'grading'].includes(g.status)
                        );

                        if (isAlreadyInGroup) {
                            const student = students.find(s => s.id === Number(studentId));
                            const studentInfo = student ? `${student.user?.name}` : `ID ${studentId}`;
                            handleApiError({ data: { message: `Mahasiswa ${studentInfo} sudah terdaftar di kelompok lain.` } });
                            return Promise.reject('Mahasiswa sudah terdaftar');
                        }

                        return addGroupMember({
                            groupId: selectedData.id,
                            studentId: Number(studentId),
                        }).unwrap().then(res => {
                            handleApiSuccess(res?.message || 'Anggota berhasil ditambahkan');
                            if (res?.data) {
                                setSelectedData(res.data);
                            }
                            refetch();
                        }).catch(err => {
                            handleApiError(err, 'Gagal menambahkan anggota');
                            throw err;
                        });
                    }}
                    isProcessing={isUpdating || isRemovingMember || isAddingMember}
                    canPlot={true}
                    students={students}
                />
            )}

            {/* Confirm Dialog for Removing Member */}
            <ConfirmDialog
                isOpen={!!memberToRemove}
                onClose={() => setMemberToRemove(null)}
                onConfirm={submitRemoveMember}
                title="Keluarkan Anggota Kelompok"
                message={`Apakah Anda yakin ingin mengeluarkan ${memberToRemove?.student?.name || 'anggota ini'} (${memberToRemove?.student?.nim || '-'}) dari kelompok KP?`}
                loading={isRemovingMember}
            />

            {/* Add Member Modal */}
            {showAddMember && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setShowAddMember(false)} />
                        <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Tambah Anggota Kelompok</h3>
                                <button
                                    onClick={() => { setShowAddMember(false); setNewMemberStudentId(''); setStudentSearchTerm(''); setStudentSearchResults([]); }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                                {selectedData && selectedData.members && (
                                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Anggota Saat Ini ({selectedData.members.length} / {(() => {
                                            const maxSetting = selectedData.settings?.max_members || 5;
                                            return maxSetting;
                                        })()} orang)</p>
                                        <ul className="space-y-1">
                                            {selectedData.members.slice(0, 5).map((m) => (
                                                <li key={m.id} className="flex items-center justify-between text-sm py-1">
                                                    <span className="text-gray-700">{m.student?.name} ({m.student?.nim})</span>
                                                    <Badge status={m.role === 'ketua' ? 'ketua' : 'anggota'}>{m.role === 'ketua' ? 'Ketua' : 'Anggota'}</Badge>
                                                </li>
                                            ))}
                                            {selectedData.members.length > 5 && <li className="text-xs text-gray-400">+{selectedData.members.length - 5} lainnya...</li>}
                                        </ul>
                                    </div>
                                )}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Cari Mahasiswa (NIM / Nama)
                                        <span className="ml-2 text-xs text-gray-400 font-normal">
                                            {students.length > 0 && `(${students.length} data tersedia)`}
                                        </span>
                                    </label>
                                    <Input
                                        value={studentSearchTerm}
                                        onChange={(e) => setStudentSearchTerm(e.target.value)}
                                        placeholder="Ketik NIM atau nama mahasiswa..."
                                        icon={Search}
                                    />
                                    <div className="bg-white border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                                        {!studentSearchTerm.trim() ? (
                                            <div className="p-4 text-center text-gray-500">
                                                Ketik NIM atau nama mahasiswa untuk mencari
                                            </div>
                                        ) : isLoadingStudents ? (
                                            <div className="p-4 text-center text-gray-500">Memuat data mahasiswa</div>
                                        ) : students.length === 0 ? (
                                            <div className="p-4 text-center text-gray-500">
                                                {debouncedStudentSearch ? 'Tidak ada mahasiswa ditemukan' : 'Ketik NIM atau nama untuk mencari'}
                                            </div>
                                        ) : (
                                            students
                                                .filter(s => !selectedData?.members?.some(m => m.student?.id === s.id))
                                                .filter(s => 
                                                    s.nim?.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
                                                    s.user?.name?.toLowerCase().includes(studentSearchTerm.toLowerCase())
                                                )
                                                .map((s) => (
                                                    <button
                                                        key={s.id}
                                                        onClick={() => { setNewMemberStudentId(s.id); setStudentSearchResults([s]); }}
                                                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-t border-gray-100 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                                <GraduationCap className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">{s.user?.name}</p>
                                                                <p className="text-xs text-gray-500 font-mono">{s.nim}</p>
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))
                                        )}
                                    </div>
                                    {newMemberStudentId && (
                                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                                            <p className="text-sm font-medium text-emerald-800 flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4" />
                                                Mahasiswa dipilih: {students.find(s => s.id === newMemberStudentId)?.user?.name} ({students.find(s => s.id === newMemberStudentId)?.nim})
                                            </p>
                                            <button
                                                onClick={() => { setNewMemberStudentId(''); setStudentSearchResults([]); }}
                                                className="mt-1 text-xs text-emerald-600 hover:underline"
                                            >
                                                Ganti mahasiswa
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                                <div className="flex justify-end gap-2">
                                    <Button variant="secondary" onClick={() => { setShowAddMember(false); setNewMemberStudentId(''); setStudentSearchTerm(''); setStudentSearchResults([]); }}>
                                        Batal
                                    </Button>
                                    <Button
                                        variant="primary"
                                        icon={UserPlus}
                                        onClick={submitAddMember}
                                        loading={isAddingMember}
                                        disabled={!newMemberStudentId}
                                    >
                                        Tambah Anggota
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showReject && (
                <RejectRegistrationModal
                    isOpen={showReject}
                    onClose={() => setShowReject(false)}
                    onConfirm={handleReject}
                    submitting={isUpdating}
                    data={selectedData}
                />
            )}

            {showReviseDocument && (
                <DocumentRevisionModal
                    isOpen={showReviseDocument}
                    onClose={() => setShowReviseDocument(false)}
                    onConfirm={handleReviseDocument}
                    submitting={isUpdating}
                    data={selectedData}
                />
            )}

            {showApprove && (
                <ApproveModal
                    isOpen={showApprove}
                    onClose={() => setShowApprove(false)}
                    onConfirm={handleApprove}
                    submitting={isUpdating}
                    data={selectedData}
                />
            )}

            {showPlotting && (
                <PlottingModal
                    isOpen={showPlotting}
                    onClose={() => setShowPlotting(false)}
                    onConfirm={handlePlotting}
                    submitting={isAssigning}
                    data={selectedData}
                    lecturers={lecturers}
                />
            )}
        </div>
    );
};

export default VerifikasiPendaftaran;