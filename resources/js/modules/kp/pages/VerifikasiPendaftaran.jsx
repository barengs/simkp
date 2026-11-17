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
import { useGetStudentsQuery } from '../../master-data/api/masterDataApi';
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
    Check, X, AlertCircle, Building2, CalendarDays,
    GraduationCap, UserPlus, Users, SearchX, ExternalLink,
    Lightbulb, UserMinus, Plus, Clock, AlertTriangle,
    MapPin,
} from 'lucide-react';

/* =============================================================================
 * STATUS CONFIGURATION
 * ============================================================================= */
const STATUS_CONFIG = {
    draft: { label: 'Draft', color: 'gray' },
    submitted: { label: 'Menunggu Validasi', color: 'yellow' },
    approved: { label: 'Disetujui', color: 'emerald' },
    rejected: { label: 'Ditolak', color: 'red' },
};

const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
    return <Badge status={config.color}>{config.label}</Badge>;
};

/* =============================================================================
 * DETAIL MODAL COMPONENT (CLEAN CORPORATE DESIGN, NOT OVERLY ROUNDED)
 * ============================================================================= */
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

    const [activeTab, setActiveTab] = useState('documents'); // 'documents' | 'team' | 'info'
    const [nimSearch, setNimSearch] = useState('');
    const [foundStudent, setFoundStudent] = useState(null);
    const [addingMember, setAddingMember] = useState(false);
    const [showAddMemberInput, setShowAddMemberInput] = useState(false);
    const [revisingDocId, setRevisingDocId] = useState(null);
    const [revisionNotes, setRevisionNotes] = useState({});

    const maxMembers = data.academic_period?.total_members || 3;
    const currentMembers = data.members?.length || 0;
    const availableSlots = maxMembers - currentMembers;
    const docs = data.kp_documents || [];

    useEffect(() => {
        if (!nimSearch.trim()) {
            setFoundStudent(null);
            return;
        }
        const searchLower = nimSearch.toLowerCase();
        const found = students?.find(
            (student) =>
                student.nim?.toLowerCase().includes(searchLower) ||
                student.user?.name?.toLowerCase().includes(searchLower)
        ) || null;
        setFoundStudent(found);
    }, [nimSearch, students]);

    const handleAddMember = async () => {
        if (!foundStudent || !onAddMember) return;
        setAddingMember(true);
        try {
            await onAddMember(foundStudent.id);
            setNimSearch('');
            setFoundStudent(null);
            setShowAddMemberInput(false);
        } catch {
            // Handled via toast in parent
        } finally {
            setAddingMember(false);
        }
    };

    const handleSaveRevision = async (docId) => {
        const note = revisionNotes[docId]?.trim();
        if (!note) return;
        try {
            await onReviseDocument(docId, note);
            setRevisingDocId(null);
            setRevisionNotes((prev) => ({ ...prev, [docId]: '' }));
        } catch (error) {
            console.error('Failed to revise document:', error);
        }
    };

    const isMemberAlreadyAdded = foundStudent
        ? data.members?.some((member) => member.student?.id === foundStudent.id)
        : false;

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="Detail Verifikasi Pendaftaran KP"
            size="xl"
        >
            <div className="space-y-5">
                {/* Header Summary Box */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            {getStatusBadge(data.status)}
                            <span className="text-xs text-gray-500 font-mono">ID #{data.id}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                                {data.academic_period?.name || 'Periode Aktif'}
                            </span>
                        </div>
                        <h4 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-gray-500" />
                            {data.kp_company?.name || 'Instansi Mitra KP'}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                            <span>{data.kp_theme?.title || 'Tema belum tersedia'}</span>
                        </p>
                    </div>

                    <div className="text-xs text-gray-500 sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                        <span className="text-gray-400 block text-[11px] uppercase">Tanggal Pendaftaran</span>
                        <span className="font-semibold text-gray-800 text-sm">
                            {data.created_at
                                ? new Date(data.created_at).toLocaleDateString('id-ID', {
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric',
                                  })
                                : '-'}
                        </span>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 gap-1">
                    <button
                        type="button"
                        onClick={() => setActiveTab('documents')}
                        className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                            activeTab === 'documents'
                                ? 'border-emerald-600 text-emerald-700 font-bold bg-emerald-50/50'
                                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                        Dokumen Persyaratan ({docs.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('team')}
                        className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                            activeTab === 'team'
                                ? 'border-emerald-600 text-emerald-700 font-bold bg-emerald-50/50'
                                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                        Anggota Kelompok ({currentMembers}/{maxMembers})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('info')}
                        className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                            activeTab === 'info'
                                ? 'border-emerald-600 text-emerald-700 font-bold bg-emerald-50/50'
                                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                        Informasi & Pembimbing
                    </button>
                </div>

                {/* TAB 1: DOKUMEN */}
                {activeTab === 'documents' && (
                    <div className="space-y-3">
                        {docs.length > 0 ? (
                            docs.map((doc, idx) => {
                                const isApproved = doc.status === 'approved';
                                const isRevision = doc.status === 'revision';
                                const isEditing = revisingDocId === doc.id;

                                return (
                                    <div
                                        key={doc.id || idx}
                                        className={`border rounded-lg p-4 transition-colors ${
                                            isApproved
                                                ? 'border-emerald-200 bg-emerald-50/30'
                                                : isRevision
                                                ? 'border-amber-200 bg-amber-50/30'
                                                : 'border-gray-200 bg-white'
                                        }`}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-9 h-9 rounded-md bg-gray-100 text-gray-600 flex items-center justify-center shrink-0 mt-0.5">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h5 className="font-semibold text-sm text-gray-900">
                                                            {doc.document_type?.name || doc.title || `Dokumen ${idx + 1}`}
                                                        </h5>
                                                        <Badge
                                                            status={
                                                                isApproved ? 'emerald' : isRevision ? 'amber' : 'yellow'
                                                            }
                                                        >
                                                            {isApproved ? 'Disetujui' : isRevision ? 'Perlu Revisi' : 'Menunggu Validasi'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                                                        <CalendarDays className="w-3.5 h-3.5" />
                                                        <span>
                                                            Diunggah:{' '}
                                                            {doc.submitted_at || doc.created_at
                                                                ? new Date(doc.submitted_at || doc.created_at).toLocaleDateString('id-ID')
                                                                : '-'}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 self-end sm:self-center">
                                                {doc.file_url ? (
                                                    <a
                                                        href={doc.file_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                        <span>Buka Berkas</span>
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">File tidak ada</span>
                                                )}

                                                {!isApproved && (
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        icon={Check}
                                                        onClick={() => onApproveDocument(doc.id)}
                                                        loading={approvingDocId === doc.id}
                                                        disabled={approvingDocId === doc.id}
                                                    >
                                                        Setujui
                                                    </Button>
                                                )}

                                                {!isApproved && !isEditing && (
                                                    <Button
                                                        variant="warning"
                                                        size="sm"
                                                        icon={AlertCircle}
                                                        onClick={() => setRevisingDocId(doc.id)}
                                                    >
                                                        Minta Revisi
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        {doc.notes && !isEditing && (
                                            <div className="mt-3 p-3 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                                                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                                <div>
                                                    <span className="font-semibold block">Catatan Revisi:</span>
                                                    <p className="mt-0.5">{doc.notes}</p>
                                                </div>
                                            </div>
                                        )}

                                        {isEditing && (
                                            <div className="mt-3 p-3.5 rounded-md bg-amber-50 border border-amber-200 space-y-2">
                                                <label className="block text-xs font-semibold text-amber-900">
                                                    Catatan Perbaikan Dokumen:
                                                </label>
                                                <Textarea
                                                    rows={3}
                                                    value={revisionNotes[doc.id] || ''}
                                                    onChange={(e) =>
                                                        setRevisionNotes((prev) => ({
                                                            ...prev,
                                                            [doc.id]: e.target.value,
                                                        }))
                                                    }
                                                    placeholder="Tuliskan catatan perbaikan berkas untuk mahasiswa..."
                                                />
                                                <div className="flex justify-end gap-2 pt-1">
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => setRevisingDocId(null)}
                                                    >
                                                        Batal
                                                    </Button>
                                                    <Button
                                                        variant="warning"
                                                        size="sm"
                                                        icon={Check}
                                                        onClick={() => handleSaveRevision(doc.id)}
                                                        disabled={!revisionNotes[doc.id]?.trim()}
                                                    >
                                                        Simpan Catatan
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-10 border border-gray-200 rounded-lg bg-gray-50">
                                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                <p className="text-xs text-gray-500 font-medium">Belum ada berkas persyaratan yang diunggah.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: ANGGOTA KELOMPOK */}
                {activeTab === 'team' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-200 rounded-lg text-xs">
                            <div>
                                <span className="font-semibold text-gray-800">Kuota Anggota Kelompok:</span>
                                <span className="text-gray-500 ml-1.5">
                                    {currentMembers} dari {maxMembers} orang ({availableSlots > 0 ? `tersisa ${availableSlots} slot` : 'slot penuh'})
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

                        {showAddMemberInput && (
                            <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-lg space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-emerald-900">
                                        Cari Mahasiswa (NIM atau Nama):
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddMemberInput(false);
                                            setNimSearch('');
                                            setFoundStudent(null);
                                        }}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <Input
                                            value={nimSearch}
                                            onChange={(e) => setNimSearch(e.target.value)}
                                            placeholder="Ketik NIM atau nama..."
                                            icon={Search}
                                            autoFocus
                                        />
                                    </div>
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
                                    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                                        <div>
                                            <p className="font-semibold text-sm text-gray-900">{foundStudent.user?.name}</p>
                                            <p className="text-xs text-gray-500 font-mono">{foundStudent.nim}</p>
                                        </div>
                                        {isMemberAlreadyAdded ? (
                                            <span className="text-xs text-gray-400 font-medium">Sudah Terdaftar</span>
                                        ) : (
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                icon={Plus}
                                                onClick={handleAddMember}
                                                loading={addingMember}
                                                disabled={addingMember}
                                            >
                                                Tambahkan
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {!foundStudent && nimSearch.trim().length > 2 && (
                                    <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                                        Mahasiswa tidak ditemukan.
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 bg-white overflow-hidden">
                            {(data.members || []).map((member, index) => {
                                const name = member.student?.user?.name || member.student?.name || '-';
                                const nim = member.student?.nim || '-';
                                const isKetua = member.role === 'ketua';
                                const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

                                return (
                                    <div key={member.id || index} className="flex items-center justify-between p-3.5 hover:bg-gray-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0">
                                                {initials}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-sm text-gray-900">{name}</span>
                                                    {isKetua && <Badge status="amber">Ketua</Badge>}
                                                </div>
                                                <span className="font-mono text-xs text-gray-500">{nim}</span>
                                            </div>
                                        </div>

                                        <div>
                                            {!isKetua ? (
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    icon={UserMinus}
                                                    onClick={() => onRemoveMember(member)}
                                                    loading={isProcessing}
                                                >
                                                    Keluarkan
                                                </Button>
                                            ) : (
                                                <span className="text-xs text-gray-400 font-medium">Ketua Kelompok</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* TAB 3: INFO MITRA & PEMBIMBING */}
                {activeTab === 'info' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-2">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide block">
                                    Instansi / Perusahaan
                                </span>
                                <h5 className="font-bold text-sm text-gray-900">{data.kp_company?.name || '-'}</h5>
                                <p className="text-xs text-gray-600 flex items-start gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                                    <span>{data.kp_company?.address || 'Alamat belum tercatat'}</span>
                                </p>
                            </div>

                            <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-2">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide block">
                                    Tema Kajian KP
                                </span>
                                <h5 className="font-bold text-sm text-gray-900">{data.kp_theme?.title || '-'}</h5>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    {data.kp_theme?.description || 'Deskripsi tema belum tersedia.'}
                                </p>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide block">
                                    Dosen Pembimbing
                                </span>
                                <h5 className="font-semibold text-sm text-gray-900 mt-1">
                                    {data.supervisor?.user?.name || data.members?.[0]?.supervisor?.name || 'Belum Ditugaskan'}
                                </h5>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {data.supervisor ? 'Dosen pembimbing telah aktif' : 'Plotting pembimbing dapat dilakukan setelah pendaftaran disetujui'}
                                </p>
                            </div>

                            {canPlot && data.status === 'approved' && (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    icon={GraduationCap}
                                    onClick={onPlot}
                                >
                                    {data.supervisor ? 'Ganti Dosen' : 'Plotting Dosen'}
                                </Button>
                            )}
                        </div>

                        {data.rejection_note && (
                            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-900">
                                <span className="font-bold block mb-1">Alasan Penolakan:</span>
                                <p>{data.rejection_note}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal Footer Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 pt-4 border-t border-gray-200 mt-6">
                <Button variant="secondary" onClick={onClose}>
                    Tutup
                </Button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
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
                                onClick={onApprove}
                                loading={isProcessing}
                            >
                                Setujui Pendaftaran
                            </Button>
                        </>
                    )}

                    {data.status === 'approved' && canPlot && (
                        <Button
                            variant="primary"
                            icon={GraduationCap}
                            onClick={onPlot}
                            loading={isProcessing}
                        >
                            Plotting Dosen
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    );
};

/* =============================================================================
 * REJECT MODAL
 * ============================================================================= */
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
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>Pendaftaran KP ini akan ditolak. Mahasiswa tidak dapat melanjutkan proses hingga mengajukan ulang.</span>
                </div>

                <div className="text-xs text-gray-600">
                    Pendaftaran untuk kelompok: <strong>{data?.kp_company?.name || 'Kelompok KP'}</strong>
                </div>

                <Textarea
                    label="Catatan Alasan Penolakan"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Tuliskan alasan penolakan secara jelas..."
                    rows={4}
                    required
                />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 mt-5">
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

/* =============================================================================
 * APPROVE MODAL
 * ============================================================================= */
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
            title="Setujui Pendaftaran KP"
            size="md"
        >
            <div className="space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-800 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Pendaftaran akan disetujui secara resmi. Kelompok mahasiswa dapat melanjutkan ke tahap plotting pembimbing.</span>
                </div>

                <div className="text-xs text-gray-600">
                    Menyetujui pendaftaran mitra: <strong>{data?.kp_company?.name || 'Kelompok KP'}</strong>
                </div>

                <Textarea
                    label="Catatan Tambahan (Opsional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tambahkan catatan atau arahan awal..."
                    rows={3}
                />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 mt-5">
                <Button variant="secondary" onClick={handleClose}>
                    Batal
                </Button>
                <Button
                    variant="primary"
                    icon={CheckCircle2}
                    onClick={handleConfirm}
                    loading={submitting}
                >
                    Setujui Pendaftaran
                </Button>
            </div>
        </Modal>
    );
};

/* =============================================================================
 * PLOTTING MODAL
 * ============================================================================= */
const PlottingModal = ({ isOpen, onClose, onConfirm, submitting, data, lecturers }) => {
    const [selectedLecturer, setSelectedLecturer] = useState('');

    const lecturerOptions = useMemo(() => {
        return (lecturers || []).map((l) => ({
            value: l.id,
            label: l.name || l.label || `Dosen #${l.id}`,
        }));
    }, [lecturers]);

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
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-800 flex items-start gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Pilih dosen pembimbing untuk ditugaskan pada kelompok kerja praktik ini.</span>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-xs space-y-1">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Kelompok:</span>
                    <p className="font-semibold text-gray-900">{data?.kp_company?.name || 'Mitra KP'}</p>
                    <p className="text-gray-500">{data?.kp_theme?.title || '-'}</p>
                </div>

                <Combobox
                    label="Pilih Dosen Pembimbing"
                    value={selectedLecturer}
                    onChange={(e) => setSelectedLecturer(e.target.value)}
                    options={lecturerOptions}
                    placeholder="Cari atau pilih nama dosen..."
                    required
                />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 mt-5">
                <Button variant="secondary" onClick={handleClose}>
                    Batal
                </Button>
                <Button
                    variant="primary"
                    icon={GraduationCap}
                    onClick={handleConfirm}
                    loading={submitting}
                    disabled={!selectedLecturer}
                >
                    Tugaskan Dosen
                </Button>
            </div>
        </Modal>
    );
};

/* =============================================================================
 * MAIN COMPONENT: VERIFIKASI PENDAFTARAN (MATCHING MASTER-DATA/DOSEN LAYOUT)
 * ============================================================================= */
const VerifikasiPendaftaran = () => {
    // API
    const { data: verifikasiRaw, isLoading, refetch } = useGetVerifikasiQuery();
    const { data: lecturersRaw } = useGetAvailableLecturersQuery();
    const { data: studentsRaw } = useGetStudentsQuery({ per_page: 500 });

    const [updateVerifikasi, { isLoading: isUpdating }] = useUpdateVerifikasiMutation();
    const [removeGroupMember, { isLoading: isRemovingMember }] = useRemoveGroupMemberMutation();
    const [addGroupMember, { isLoading: isAddingMember }] = useAddGroupMemberMutation();
    const [assignSupervisor, { isLoading: isAssigning }] = useAssignSupervisorMutation();
    const [approveKpDocument] = useApproveKpDocumentMutation();
    const [submitDocumentRevision] = useSubmitDocumentRevisionMutation();

    // State
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [selectedData, setSelectedData] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [showReject, setShowReject] = useState(false);
    const [showApprove, setShowApprove] = useState(false);
    const [showPlotting, setShowPlotting] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState(null);
    const [approvingDocId, setApprovingDocId] = useState(null);

    // Debounce search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 400);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Keep selectedData in sync
    useEffect(() => {
        if (selectedData) {
            const list = Array.isArray(verifikasiRaw)
                ? verifikasiRaw
                : Array.isArray(verifikasiRaw?.data)
                ? verifikasiRaw.data
                : [];
            const updated = list.find((item) => item.id === selectedData.id);
            if (updated) {
                setSelectedData(updated);
            }
        }
    }, [verifikasiRaw]);

    // Data normalization
    const verifikasi = useMemo(() => {
        return Array.isArray(verifikasiRaw)
            ? verifikasiRaw
            : Array.isArray(verifikasiRaw?.data)
            ? verifikasiRaw.data
            : [];
    }, [verifikasiRaw]);

    const lecturers = useMemo(() => {
        return Array.isArray(lecturersRaw)
            ? lecturersRaw
            : Array.isArray(lecturersRaw?.data)
            ? lecturersRaw.data
            : [];
    }, [lecturersRaw]);

    const students = useMemo(() => {
        return Array.isArray(studentsRaw)
            ? studentsRaw
            : Array.isArray(studentsRaw?.data)
            ? studentsRaw.data
            : [];
    }, [studentsRaw]);

    // Filtering
    const filtered = useMemo(() => {
        return verifikasi.filter((item) => {
            const ketuaName = item.members?.find((m) => m.role === 'ketua')?.student?.name || item.student?.name || '';
            const ketuaNim = item.members?.find((m) => m.role === 'ketua')?.student?.nim || item.student?.nim || '';
            const companyName = item.kp_company?.name || '';
            const themeTitle = item.kp_theme?.title || '';

            const matchSearch =
                !debouncedSearch ||
                ketuaName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                ketuaNim.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                companyName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                themeTitle.toLowerCase().includes(debouncedSearch.toLowerCase());

            const matchStatus = !filterStatus || item.status === filterStatus;

            return matchSearch && matchStatus;
        });
    }, [verifikasi, debouncedSearch, filterStatus]);

    // Statistics using provided Statistik component
    const stats = useMemo(() => {
        return {
            total: verifikasi.length,
            submitted: verifikasi.filter((v) => v.status === 'submitted').length,
            approved: verifikasi.filter((v) => v.status === 'approved').length,
            rejected: verifikasi.filter((v) => v.status === 'rejected').length,
        };
    }, [verifikasi]);

    // Handlers
    const handleView = (data) => {
        setSelectedData(data);
        setShowDetail(true);
    };

    const handleReject = async (reason) => {
        if (!reason.trim() || !selectedData) return;
        try {
            await updateVerifikasi({
                id: selectedData.id,
                status: 'rejected',
                rejection_note: reason,
            }).unwrap();
            handleApiSuccess('Pendaftaran berhasil ditolak');
            setShowReject(false);
            setShowDetail(false);
            refetch();
        } catch (err) {
            handleApiError(err, 'Gagal menolak pendaftaran');
        }
    };

    const handleApprove = async (notes) => {
        if (!selectedData) return;
        try {
            await updateVerifikasi({
                id: selectedData.id,
                status: 'approved',
                notes: notes,
            }).unwrap();
            handleApiSuccess('Pendaftaran berhasil disetujui');
            setShowApprove(false);
            setShowDetail(false);
            refetch();
        } catch (err) {
            handleApiError(err, 'Gagal menyetujui pendaftaran');
        }
    };

    const handlePlotting = async (lecturerId) => {
        if (!selectedData) return;
        try {
            await assignSupervisor({
                kp_group_id: selectedData.id,
                lecturer_id: lecturerId,
            }).unwrap();
            handleApiSuccess('Dosen pembimbing berhasil ditugaskan');
            setShowPlotting(false);
            setShowDetail(false);
            refetch();
        } catch (err) {
            handleApiError(err, 'Gagal menugaskan dosen pembimbing');
        }
    };

    const handleApproveDocument = async (docId) => {
        try {
            setApprovingDocId(docId);
            const res = await approveKpDocument(docId).unwrap();
            handleApiSuccess(res?.message || 'Dokumen berhasil disetujui');
            refetch();
        } catch (err) {
            handleApiError(err, 'Gagal menyetujui dokumen');
        } finally {
            setApprovingDocId(null);
        }
    };

    const handleReviseDocument = async (docId, note) => {
        if (!selectedData) return;
        try {
            const res = await submitDocumentRevision({
                groupId: selectedData.id,
                documentId: docId,
                notes: note,
            }).unwrap();
            handleApiSuccess(res?.message || 'Catatan revisi dokumen berhasil dikirim');
            refetch();
        } catch (err) {
            handleApiError(err, 'Gagal meminta revisi dokumen');
            throw err;
        }
    };

    const handleRemoveMember = async () => {
        if (!selectedData || !memberToRemove) return;
        try {
            const res = await removeGroupMember({
                groupId: selectedData.id,
                memberId: memberToRemove.id,
            }).unwrap();
            handleApiSuccess(res?.message || 'Anggota berhasil dikeluarkan');
            setMemberToRemove(null);
            refetch();
        } catch (err) {
            handleApiError(err, 'Gagal mengeluarkan anggota');
        }
    };

    const handleAddMember = async (studentId) => {
        if (!selectedData) return;
        const isAlreadyInGroup = verifikasi.some(
            (g) =>
                g.members?.some((m) => m.student_id === Number(studentId)) &&
                ['submitted', 'approved', 'ongoing', 'grading'].includes(g.status)
        );

        if (isAlreadyInGroup) {
            const student = students.find((s) => s.id === Number(studentId));
            const studentInfo = student ? `${student.user?.name || student.name}` : `ID ${studentId}`;
            handleApiError({
                data: { message: `Mahasiswa ${studentInfo} sudah terdaftar di kelompok aktif lain.` },
            });
            return Promise.reject('Mahasiswa sudah terdaftar');
        }

        try {
            const res = await addGroupMember({
                groupId: selectedData.id,
                studentId: Number(studentId),
            }).unwrap();
            handleApiSuccess(res?.message || 'Anggota berhasil ditambahkan');
            refetch();
        } catch (err) {
            handleApiError(err, 'Gagal menambahkan anggota');
            throw err;
        }
    };

    // Columns format matching master-data/dosen
    const columns = [
        {
            name: 'Mahasiswa / Ketua',
            selector: (row) => row.members?.find((m) => m.role === 'ketua')?.student?.name || '-',
            sortable: true,
            width: '280px',
            cell: (row) => {
                const ketua = row.members?.find((m) => m.role === 'ketua');
                const name = ketua?.student?.name || row.student?.name || '-';
                const nim = ketua?.student?.nim || row.student?.nim || '-';
                const memberCount = row.members?.length || 1;
                const initials = name
                    .trim()
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((w) => w.charAt(0))
                    .join('')
                    .toUpperCase() || 'M';

                return (
                    <div className="flex items-center gap-3 py-2">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                            {initials}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                                <p className="truncate text-sm font-semibold text-gray-900">{name}</p>
                                {memberCount > 1 && (
                                    <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded font-medium border border-gray-200">
                                        +{memberCount - 1}
                                    </span>
                                )}
                            </div>
                            <p className="mt-0.5 text-xs text-gray-500 font-mono">{nim}</p>
                        </div>
                    </div>
                );
            },
        },
        {
            name: 'Perusahaan / Mitra',
            selector: (row) => row.kp_company?.name || '-',
            sortable: true,
            width: '240px',
            cell: (row) => (
                <div>
                    <p className="text-sm font-medium text-gray-800 leading-tight">
                        {row.kp_company?.name || '-'}
                    </p>
                    <p className="mt-0.5 text-[11px] text-gray-400">
                        {row.academic_period?.name || 'Periode Aktif'}
                    </p>
                </div>
            ),
        },
        {
            name: 'Tema KP',
            selector: (row) => row.kp_theme?.title || '-',
            sortable: true,
            width: '240px',
            cell: (row) => (
                <div className="max-w-xs" title={row.kp_theme?.title}>
                    <p className="text-sm text-gray-700 truncate">
                        {row.kp_theme?.title || '-'}
                    </p>
                </div>
            ),
        },
        {
            name: 'Status',
            selector: (row) => row.status,
            sortable: true,
            width: '180px',
            cell: (row) => (
                <div className="py-2">
                    {getStatusBadge(row.status)}
                </div>
            ),
        },
        {
            name: 'Pembimbing',
            width: '220px',
            cell: (row) => {
                const supervisor = row.supervisor?.user?.name || row.members?.[0]?.supervisor?.name;
                if (supervisor) {
                    return (
                        <div className="flex items-center gap-1.5 text-xs text-gray-800">
                            <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="truncate font-medium">{supervisor}</span>
                        </div>
                    );
                }
                if (row.status === 'approved') {
                    return (
                        <span className="text-[11px] font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded">
                            Belum Di-plot
                        </span>
                    );
                }
                return <span className="text-xs text-gray-400">-</span>;
            },
        },
        {
            name: 'Tanggal',
            selector: (row) => row.created_at,
            sortable: true,
            width: '130px',
            cell: (row) => (
                <span className="text-xs text-gray-600">
                    {row.created_at
                        ? new Date(row.created_at).toLocaleDateString('id-ID')
                        : '-'}
                </span>
            ),
        },
        {
            name: 'Aksi',
            width: '190px',
            cell: (row) => (
                <div className="flex items-center justify-center gap-1.5 py-1">
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

                    {row.status === 'approved' && !row.supervisor && (
                        <Button
                            size="sm"
                            variant="primary"
                            icon={GraduationCap}
                            onClick={() => {
                                setSelectedData(row);
                                setShowPlotting(true);
                            }}
                        >
                            Plot
                        </Button>
                    )}
                </div>
            ),
            ignoreRowClick: true,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <PageHeader
                title="Verifikasi Pendaftaran KP"
                description="Validasi dan periksa pendaftaran kelompok kerja praktik mahasiswa"
                icon={FileText}
            />

            {/* Statistik Cards using provided Statistik component */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <Statistik
                    title="Ditolak"
                    value={stats.rejected}
                    icon={XCircle}
                    iconClassName="text-red-600"
                    borderClassName="bg-red-500"
                />
            </div>

            {/* Main Card with Toolbar & DataTable */}
            <Card>
                {/* Toolbar matching master-data/dosen */}
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
                            {searchTerm || filterStatus
                                ? `${filtered.length} hasil ditemukan`
                                : `${filtered.length} pendaftaran terdaftar`}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        {/* Dropdown Filter Status using provided Select component */}
                        <div className="w-full sm:w-48">
                            <Select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                options={[
                                    { value: '', label: 'Semua Status' },
                                    { value: 'submitted', label: 'Menunggu Validasi' },
                                    { value: 'approved', label: 'Disetujui' },
                                    { value: 'rejected', label: 'Ditolak' },
                                ]}
                            />
                        </div>

                        {/* Search Input using provided Input component */}
                        <div className="w-full sm:w-80">
                            <Input
                                type="text"
                                placeholder="Cari nama, NIM, atau instansi..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                icon={Search}
                            />
                        </div>
                    </div>
                </div>

                {/* DataTable */}
                <div className="overflow-hidden">
                    {isLoading ? (
                        <div className="p-6 space-y-3">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">
                                {searchTerm || filterStatus
                                    ? 'Tidak ada data yang sesuai dengan pencarian'
                                    : 'Belum ada data pendaftaran'}
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

            {/* Modals */}
            {showDetail && selectedData && (
                <DetailModal
                    data={selectedData}
                    onClose={() => setShowDetail(false)}
                    onApprove={() => setShowApprove(true)}
                    onReject={() => setShowReject(true)}
                    onReviseDocument={handleReviseDocument}
                    onApproveDocument={handleApproveDocument}
                    onPlot={() => setShowPlotting(true)}
                    onRemoveMember={(member) => setMemberToRemove(member)}
                    onAddMember={handleAddMember}
                    isProcessing={isUpdating || isRemovingMember || isAddingMember}
                    canPlot={true}
                    students={students}
                    approvingDocId={approvingDocId}
                />
            )}

            {/* Confirm Dialog for Removing Member */}
            <ConfirmDialog
                isOpen={!!memberToRemove}
                onClose={() => setMemberToRemove(null)}
                onConfirm={handleRemoveMember}
                title="Keluarkan Anggota Kelompok"
                message={`Apakah Anda yakin ingin mengeluarkan ${
                    memberToRemove?.student?.name || 'anggota ini'
                } (${memberToRemove?.student?.nim || '-'}) dari kelompok KP?`}
                loading={isRemovingMember}
            />

            {/* Reject Modal */}
            {showReject && (
                <RejectRegistrationModal
                    isOpen={showReject}
                    onClose={() => setShowReject(false)}
                    onConfirm={handleReject}
                    submitting={isUpdating}
                    data={selectedData}
                />
            )}

            {/* Approve Modal */}
            {showApprove && (
                <ApproveModal
                    isOpen={showApprove}
                    onClose={() => setShowApprove(false)}
                    onConfirm={handleApprove}
                    submitting={isUpdating}
                    data={selectedData}
                />
            )}

            {/* Plotting Modal */}
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
