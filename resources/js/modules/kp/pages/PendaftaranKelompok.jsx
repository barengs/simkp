import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
    useGetKpGroupsQuery,
    useCreateKpGroupMutation,
    useUpdateKpGroupMutation,
    useProposeKpCompanyMutation,
    useGetDocumentTypesQuery,
} from '../api/kpApi';
import {
    useGetAcademicPeriodsQuery,
    useGetKpCompaniesQuery,
    useGetKpThemesQuery,
    useGetStudentsQuery,
} from '../../master-data/api/masterDataApi';
import { handleApiError, handleApiSuccess } from '../../shared/api/errorHandler';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import DataTableWrapper from '../../../components/ui/DataTableWrapper';
import Skeleton from '../../../components/ui/Skeleton';
import {
    UserPlus, Check, ChevronRight, ChevronLeft,
    Building2, BookOpen, Users, CalendarDays, Pencil,
    AlertCircle, CheckCircle2, Search, X, GraduationCap,
    Plus, MapPin, Phone, ArrowLeft, Crown, UserCheck, FileText,
} from 'lucide-react';

// ─── Langkah stepper ─────────────────────────────────────────────────────────
const STEPS = [
    { id: 1, label: 'Periode & Tempat', icon: Building2,    desc: 'Pilih periode dan perusahaan tujuan' },
    { id: 2, label: 'Tema KP',          icon: BookOpen,     desc: 'Topik kerja praktek' },
    { id: 3, label: 'Anggota',          icon: Users,        desc: 'Tambah anggota (ketua otomatis)' },
    { id: 4, label: 'Dokumen',          icon: FileText,     desc: 'Unggah dokumen pendukung' },
    { id: 5, label: 'Preview',          icon: CheckCircle2, desc: 'Tinjau dan kirim' },
];

// ─── Stepper header ───────────────────────────────────────────────────────────
const StepperHeader = ({ currentStep, completedSteps }) => (
    <div className="flex items-start mb-8">
        {STEPS.map((step, idx) => {
            const done    = completedSteps.includes(step.id);
            const active  = currentStep === step.id;
            const isLast  = idx === STEPS.length - 1;
            return (
                <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center flex-shrink-0 w-20">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                            done   ? 'bg-emerald-600 border-emerald-600 text-white'
                            : active ? 'bg-white border-emerald-600 text-emerald-600'
                                     : 'bg-white border-gray-200 text-gray-400'
                        }`}>
                            {done ? <Check className="w-5 h-5" /> : <step.icon className="w-4 h-4" />}
                        </div>
                        <p className={`mt-1.5 text-xs font-medium text-center leading-tight ${
                            active ? 'text-emerald-700' : done ? 'text-emerald-600' : 'text-gray-400'
                        }`}>{step.label}</p>
                    </div>
                    {!isLast && (
                        <div className={`flex-1 h-0.5 mt-5 transition-all ${
                            done ? 'bg-emerald-500' : 'bg-gray-200'
                        }`} />
                    )}
                </React.Fragment>
            );
        })}
    </div>
);

// ─── Selection Card generik ───────────────────────────────────────────────────
const SelectionCard = ({ selected, onClick, children }) => (
    <button
        type="button"
        onClick={onClick}
        className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
            selected
                ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-200'
                : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-gray-50'
        }`}
    >
        <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">{children}</div>
            <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                selected ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
            }`}>
                {selected && <Check className="w-3 h-3 text-white" />}
            </div>
        </div>
    </button>
);

// ─── Langkah 1: Pilih Periode & Tempat KP (merged) ────────────────────────────
const Step1PeriodeTempatKP = ({ form, onChange, periodeList, perusahaanList, onPropose }) => {
    const [mode, setMode]       = useState('pilih-perusahaan'); // 'pilih-periode' | 'pilih-perusahaan' | 'daftar'
    const [search, setSearch]   = useState('');
    const [propForm, setPropForm] = useState({ name: '', address: '', contact_person: '', phone_number: '', email: '' });
    const [propErr, setPropErr]   = useState({});

    const aktiPeriode = (periodeList || []).filter(p => p.is_active);
    
    const filtered = useMemo(() =>
        (perusahaanList || []).filter(p =>
            !search || p.name?.toLowerCase().includes(search.toLowerCase()) ||
            p.address?.toLowerCase().includes(search.toLowerCase())
        ),
    [perusahaanList, search]);

    const handlePropose = () => {
        const e = {};
        if (!propForm.name.trim()) e.name = 'Nama perusahaan wajib diisi';
        if (Object.keys(e).length) { setPropErr(e); return; }
        onPropose(propForm, (newCompany) => {
            onChange({ target: { name: 'kp_company_id', value: newCompany.id } });
            setMode('pilih-perusahaan');
        });
    };

    // Jika periode belum dipilih, tampilkan pilih periode dulu
    if (!form.academic_period_id) {
        return (
            <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5 text-sm text-blue-800 flex gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                    <span>Langkah 1: Pilih periode akademik terlebih dahulu, kemudian pilih perusahaan tujuan KP.</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mt-4">Periode Akademik</h3>
                {aktiPeriode.length === 0 ? (
                    <div className="text-center py-8 text-sm text-gray-400">
                        <CalendarDays className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                        Tidak ada periode akademik aktif. Hubungi koordinator.
                    </div>
                ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                        {aktiPeriode.map(p => {
                            const sel = String(form.academic_period_id) === String(p.id);
                            return (
                                <SelectionCard
                                    key={p.id}
                                    selected={sel}
                                    onClick={() => onChange({ target: { name: 'academic_period_id', value: p.id } })}
                                >
                                    <p className={`text-sm font-semibold ${sel ? 'text-emerald-800' : 'text-gray-800'}`}>
                                        {p.name}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">{p.code}</p>
                                    {p.total_members && (
                                        <span className="inline-flex items-center gap-1 mt-2 text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                                            <Users className="w-3 h-3" />
                                            Maks {p.total_members} anggota
                                        </span>
                                    )}
                                </SelectionCard>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    // Setelah periode dipilih, tampilkan pilih perusahaan
    const selectedPeriode = aktiPeriode.find(p => String(p.id) === String(form.academic_period_id));

    if (mode === 'daftar') {
        return (
            <div className="space-y-4">
                <div>
                    <p className="text-xs text-gray-500 mb-1">Periode yang dipilih:</p>
                    <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <p className="text-sm font-medium text-emerald-900">{selectedPeriode?.name}</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setMode('pilih-perusahaan')}
                    className="flex items-center gap-1.5 text-sm text-emerald-700 hover:text-emerald-900 font-medium"
                >
                    <ArrowLeft className="w-4 h-4" /> Kembali ke daftar perusahaan
                </button>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5 text-sm text-blue-800 flex gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                    <span>Perusahaan yang Anda daftarkan akan diajukan dan dapat diverifikasi oleh koordinator.</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Nama Perusahaan" required value={propForm.name}
                        onChange={e => { setPropForm(p => ({...p, name: e.target.value})); if (propErr.name) setPropErr(p => ({...p, name:''})); }}
                        placeholder="PT. Contoh Indonesia" error={propErr.name} />
                    <Input label="Kontak Person" value={propForm.contact_person}
                        onChange={e => setPropForm(p => ({...p, contact_person: e.target.value}))}
                        placeholder="Nama penanggung jawab" />
                    <Input label="Alamat" value={propForm.address}
                        onChange={e => setPropForm(p => ({...p, address: e.target.value}))}
                        placeholder="Jl. Contoh No. 1, Kota" />
                    <Input label="Telepon" value={propForm.phone_number}
                        onChange={e => setPropForm(p => ({...p, phone_number: e.target.value}))}
                        placeholder="021-xxxx" />
                    <div className="md:col-span-2">
                        <Input label="Email" type="email" value={propForm.email}
                            onChange={e => setPropForm(p => ({...p, email: e.target.value}))}
                            placeholder="info@perusahaan.com" />
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button type="button" variant="primary" icon={Plus} onClick={handlePropose}>
                        Daftarkan Perusahaan
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div>
                <p className="text-xs text-gray-500 mb-1">Periode yang dipilih:</p>
                <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <p className="text-sm font-medium text-emerald-900">{selectedPeriode?.name}</p>
                </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mt-5">Perusahaan Tujuan KP</h3>
            <div className="flex gap-2">
                <div className="flex-1">
                    <Input placeholder="Cari nama atau lokasi perusahaan..." value={search}
                        onChange={e => setSearch(e.target.value)} icon={Search} />
                </div>
                <Button type="button" variant="secondary" size="md" icon={Plus}
                    onClick={() => setMode('daftar')}>
                    Daftarkan Baru
                </Button>
            </div>
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {filtered.length === 0 && (
                    <p className="text-center py-8 text-sm text-gray-400">
                        Perusahaan tidak ditemukan. Klik "Daftarkan Baru" untuk menambah.
                    </p>
                )}
                {filtered.map(p => {
                    const sel = String(form.kp_company_id) === String(p.id);
                    return (
                        <SelectionCard key={p.id} selected={sel}
                            onClick={() => onChange({ target: { name: 'kp_company_id', value: p.id } })}>
                            <p className={`text-sm font-semibold ${sel ? 'text-emerald-800' : 'text-gray-800'}`}>{p.name}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                                {p.address && (
                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                        <MapPin className="w-3 h-3" />{p.address}
                                    </span>
                                )}
                                {p.contact_person && (
                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                        <Users className="w-3 h-3" />{p.contact_person}
                                    </span>
                                )}
                                {p.phone_number && (
                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                        <Phone className="w-3 h-3" />{p.phone_number}
                                    </span>
                                )}
                            </div>
                        </SelectionCard>
                    );
                })}
            </div>
        </div>
    );
};

// ─── Langkah 2: Tema KP ───────────────────────────────────────────────────────
const Step2TemaKp = ({ form, onChange, temaList }) => {
    const aktif = (temaList || []).filter(t => t.is_active);
    return (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {aktif.length === 0 && (
                <p className="text-center py-8 text-sm text-gray-400">
                    <BookOpen className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    Belum ada tema KP aktif.
                </p>
            )}
            {aktif.map(t => {
                const sel = String(form.kp_theme_id) === String(t.id);
                return (
                    <SelectionCard key={t.id} selected={sel}
                        onClick={() => onChange({ target: { name: 'kp_theme_id', value: t.id } })}>
                        <p className={`text-sm font-semibold ${sel ? 'text-emerald-800' : 'text-gray-800'}`}>{t.title}</p>
                        {t.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{t.description}</p>
                        )}
                    </SelectionCard>
                );
            })}
        </div>
    );
};

// ─── Langkah 3: Anggota (dengan ketua auto-inject read-only) ──────────────────
const Step3Anggota = ({ form, onChange, studentList, maxAnggota, ketuaStudent }) => {
    const [nimSearch, setNimSearch] = useState('');
    const ids = form.anggota_ids || [];

    const found = useMemo(() => {
        if (!nimSearch.trim()) return null;
        return (studentList || []).find(s => s.nim === nimSearch.trim());
    }, [nimSearch, studentList]);

    const add = () => {
        if (!found || ids.includes(found.id) || (ketuaStudent && found.id === ketuaStudent.id)) return;
        onChange({ target: { name: 'anggota_ids', value: [...ids, found.id] } });
        setNimSearch('');
    };

    const remove = (id) =>
        onChange({ target: { name: 'anggota_ids', value: ids.filter(x => x !== id) } });

    const details = ids.map(id => (studentList || []).find(s => s.id === id)).filter(Boolean);
    
    // Total anggota termasuk ketua (ketua + members)
    const totalWithKetua = (ketuaStudent ? 1 : 0) + details.length;
    const target  = maxAnggota ?? 3; // maxAnggota sudah exclude ketua
    const pct     = Math.min(Math.round((details.length / target) * 100), 100);
    const isFull  = details.length >= target;

    return (
        <div className="space-y-5">
            {/* Info ketua otomatis */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 text-sm text-amber-800 flex gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
                <span>Anda akan otomatis menjadi <strong>Ketua Kelompok</strong>.</span>
            </div>

            {/* Ketua (read-only) */}
            {ketuaStudent && (
                <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Ketua Kelompok (Anda)</p>
                    <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                <Crown className="w-4 h-4 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-800">{ketuaStudent.user?.name}</p>
                                <p className="text-xs text-gray-500 font-mono">{ketuaStudent.nim}</p>
                            </div>
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                            <Crown className="w-3 h-3" /> Ketua
                        </span>
                    </div>
                </div>
            )}

            {/* Progress */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progres Anggota Tambahan</span>
                    <span className={`text-sm font-bold ${isFull ? 'text-emerald-600' : 'text-gray-500'}`}>
                        {details.length}/{target}
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all ${isFull ? 'bg-emerald-500' : 'bg-blue-400'}`}
                        style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">
                    {isFull ? '✓ Kelompok sudah penuh.' : `Tambah ${target - details.length} anggota lagi (total ${totalWithKetua}/${target + 1})`}
                </p>
            </div>

            {/* Cari NIM */}
            {!isFull && (
                <div className="flex gap-2">
                    <div className="flex-1">
                        <Input placeholder={`Ketik NIM anggota…`} value={nimSearch}
                            onChange={e => setNimSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
                            icon={Search} />
                        {nimSearch && !found && (
                            <p className="text-xs text-red-500 mt-1">NIM tidak ditemukan.</p>
                        )}
                        {found && !ids.includes(found.id) && ketuaStudent && found.id === ketuaStudent.id && (
                            <p className="text-xs text-yellow-600 mt-1">Anda sudah menjadi ketua.</p>
                        )}
                        {found && !ids.includes(found.id) && (!ketuaStudent || found.id !== ketuaStudent.id) && (
                            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                {found.user?.name} — {found.nim}
                            </p>
                        )}
                        {found && ids.includes(found.id) && (
                            <p className="text-xs text-yellow-600 mt-1">Mahasiswa ini sudah ditambahkan.</p>
                        )}
                    </div>
                    <Button type="button" variant="primary" icon={Plus}
                        disabled={!found || ids.includes(found?.id) || (ketuaStudent && found?.id === ketuaStudent.id)} 
                        onClick={add}>
                        Tambah
                    </Button>
                </div>
            )}

            {/* Daftar Anggota */}
            <div className="space-y-2">
                {details.length === 0 && (
                    <div className="border border-dashed border-gray-200 rounded-lg py-6 text-center text-sm text-gray-400">
                        Belum ada anggota tambahan. Cari berdasarkan NIM di atas.
                    </div>
                )}
                {details.map((s, i) => (
                    <div key={s.id} className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <GraduationCap className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-800">{s.user?.name}</p>
                                <p className="text-xs text-gray-500 font-mono">{s.nim}</p>
                            </div>
                        </div>
                        <button type="button" onClick={() => remove(s.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─── Langkah 4: Dokumen ───────────────────────────────────────────────────────
const Step4Dokumen = ({ form, onChange, documentTypes = [] }) => {
    const [uploads, setUploads] = useState({}); // { document_type_id: file }

    const handleFileChange = (documentTypeId, file) => {
        if (file) {
            setUploads(prev => ({ ...prev, [documentTypeId]: file }));
            // Update form jika perlu
        } else {
            setUploads(prev => {
                const updated = { ...prev };
                delete updated[documentTypeId];
                return updated;
            });
        }
    };

    const requiredDocs = (documentTypes || []).filter(dt => dt.is_required);
    const optionalDocs = (documentTypes || []).filter(dt => !dt.is_required);

    return (
        <div className="space-y-6">
            {documentTypes.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-400">
                    <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p>Belum ada dokumen yang diperlukan untuk pendaftaran ini.</p>
                </div>
            ) : (
                <>
                    {/* Dokumen Wajib */}
                    {requiredDocs.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <span className="text-red-500">*</span> Dokumen Wajib
                            </h3>
                            <div className="space-y-3">
                                {requiredDocs.map(doc => (
                                    <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                                                {doc.description && (
                                                    <p className="text-xs text-gray-500 mt-1">{doc.description}</p>
                                                )}
                                            </div>
                                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-700">
                                                Wajib
                                            </span>
                                        </div>
                                        <div className="mt-3">
                                            <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                                                <div className="text-center">
                                                    <FileText className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                                                    {uploads[doc.id] ? (
                                                        <div>
                                                            <p className="text-sm text-emerald-600 font-medium">{uploads[doc.id].name}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {(uploads[doc.id].size / 1024 / 1024).toFixed(2)} MB
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <p className="text-sm text-gray-600">Klik untuk unggah atau seret berkas</p>
                                                            <p className="text-xs text-gray-500 mt-0.5">PDF, DOC, DOCX (Max 10 MB)</p>
                                                        </>
                                                    )}
                                                </div>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept=".pdf,.doc,.docx"
                                                    onChange={e => handleFileChange(doc.id, e.target.files?.[0])}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Dokumen Opsional */}
                    {optionalDocs.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Dokumen Opsional</h3>
                            <div className="space-y-3">
                                {optionalDocs.map(doc => (
                                    <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                                                {doc.description && (
                                                    <p className="text-xs text-gray-500 mt-1">{doc.description}</p>
                                                )}
                                            </div>
                                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                                                Opsional
                                            </span>
                                        </div>
                                        <div className="mt-3">
                                            <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors">
                                                <div className="text-center">
                                                    <FileText className="w-5 h-5 text-gray-300 mx-auto mb-1" />
                                                    {uploads[doc.id] ? (
                                                        <div>
                                                            <p className="text-sm text-emerald-600 font-medium">{uploads[doc.id].name}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {(uploads[doc.id].size / 1024 / 1024).toFixed(2)} MB
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <p className="text-sm text-gray-500">Klik untuk unggah atau seret berkas</p>
                                                            <p className="text-xs text-gray-400 mt-0.5">PDF, DOC, DOCX (Max 10 MB)</p>
                                                        </>
                                                    )}
                                                </div>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept=".pdf,.doc,.docx"
                                                    onChange={e => handleFileChange(doc.id, e.target.files?.[0])}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

// ─── Langkah 5: Preview ───────────────────────────────────────────────────────
const Step5Preview = ({ form, periodeList, perusahaanList, temaList, studentList, ketuaStudent }) => {
    const periode    = (periodeList    || []).find(p => String(p.id) === String(form.academic_period_id));
    const perusahaan = (perusahaanList || []).find(p => String(p.id) === String(form.kp_company_id));
    const tema       = (temaList       || []).find(t => String(t.id) === String(form.kp_theme_id));
    const anggotaTambahan = (form.anggota_ids || []).map(id => (studentList || []).find(s => s.id === id)).filter(Boolean);

    const Row = ({ label, value }) => (
        <div className="flex gap-3 py-2.5 border-b border-gray-100 last:border-0">
            <span className="text-sm text-gray-500 w-40 flex-shrink-0">{label}</span>
            <span className="text-sm font-medium text-gray-900 flex-1">{value || '-'}</span>
        </div>
    );

    return (
        <div className="space-y-5">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3.5 text-sm text-green-800 flex gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                <span>Tinjau kembali semua data di bawah sebelum mengirim pendaftaran.</span>
            </div>
            
            {/* Periode & Perusahaan */}
            <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Periode & Perusahaan</h3>
                <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100 px-4">
                    <Row label="Periode Akademik" value={periode ? `${periode.name} (${periode.code})` : null} />
                    <Row label="Perusahaan Tujuan KP" value={perusahaan?.name} />
                </div>
            </div>

            {/* Tema */}
            <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Tema KP</h3>
                <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{tema?.title || '-'}</p>
                    {tema?.description && (
                        <p className="text-xs text-gray-500 mt-1.5">{tema.description}</p>
                    )}
                </div>
            </div>

            {/* Anggota */}
            <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Anggota Kelompok ({(ketuaStudent ? 1 : 0) + anggotaTambahan.length} orang)</h3>
                <div className="space-y-1.5">
                    {/* Ketua */}
                    {ketuaStudent && (
                        <div className="flex items-center gap-3 py-2 px-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <span className="text-xs text-amber-600 w-5 font-semibold">1.</span>
                            <Crown className="w-4 h-4 text-amber-500 flex-shrink-0" />
                            <span className="text-sm text-gray-800 flex-1">{ketuaStudent.user?.name}</span>
                            <span className="text-xs text-gray-500 font-mono">{ketuaStudent.nim}</span>
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Ketua</span>
                        </div>
                    )}
                    {/* Anggota tambahan */}
                    {anggotaTambahan.map((s, i) => (
                        <div key={s.id} className="flex items-center gap-3 py-2 px-3 bg-gray-50 rounded-lg">
                            <span className="text-xs text-gray-400 w-5">{(ketuaStudent ? 1 : 0) + i + 1}.</span>
                            <GraduationCap className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <span className="text-sm text-gray-800 flex-1">{s.user?.name}</span>
                            <span className="text-xs text-gray-500 font-mono">{s.nim}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ─── Status badge label ───────────────────────────────────────────────────────
const STATUS_LABEL = {
    draft: 'Draft', diajukan: 'Diajukan', ditolak: 'Ditolak',
    disetujui: 'Disetujui', berjalan: 'Berjalan',
    laporan_masuk: 'Laporan Masuk', revisi_laporan: 'Revisi Laporan',
    dinilai: 'Dinilai', selesai: 'Selesai',
};

// ─── Kartu undangan: tampil di halaman mahasiswa yang diundang ────────────────
const KartuUndangan = ({ group, myStudentId }) => {
    const ketua = group.members?.find(m => m.role === 'ketua');
    const saya  = group.members?.find(m => m.student_id === myStudentId);

    return (
        <div className="bg-white rounded-xl border-2 border-blue-200 shadow-sm p-5 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
                        <UserCheck className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-900">{group.name || group.code}</p>
                        <p className="text-xs text-gray-500 font-mono">{group.code}</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                    <Badge status={group.status}>{STATUS_LABEL[group.status] || group.status}</Badge>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                        <UserCheck className="w-3 h-3" /> Anggota
                    </span>
                </div>
            </div>

            {/* Info kelompok */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm">
                <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Periode</p>
                    <p className="text-gray-800">{group.academic_period?.name || '-'}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Perusahaan</p>
                    <p className="text-gray-800">{group.kp_company?.name || '-'}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Tema KP</p>
                    <p className="text-gray-800">{group.kp_theme?.title || '-'}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Ketua Kelompok</p>
                    <p className="text-gray-800 flex items-center gap-1">
                        <Crown className="w-3.5 h-3.5 text-amber-500" />
                        {ketua?.student?.name || '-'}
                        <span className="text-xs text-gray-400 font-mono ml-1">({ketua?.student?.nim || '-'})</span>
                    </p>
                </div>
            </div>

            {/* Daftar anggota */}
            <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">
                    Anggota Kelompok ({group.members?.length ?? 0} orang)
                </p>
                <div className="space-y-1.5">
                    {(group.members || []).map((m) => {
                        const isSaya = m.student_id === myStudentId;
                        return (
                            <div key={m.id}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                                    isSaya ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                                }`}
                            >
                                <div className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                                    {m.role === 'ketua'
                                        ? <Crown className="w-3.5 h-3.5 text-amber-500" />
                                        : <GraduationCap className="w-3.5 h-3.5 text-gray-400" />
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">
                                        {m.student?.name || '-'}
                                        {isSaya && <span className="ml-1.5 text-xs text-blue-600 font-normal">(Anda)</span>}
                                    </p>
                                    <p className="text-xs text-gray-500 font-mono">{m.student?.nim || '-'}</p>
                                </div>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                    m.role === 'ketua'
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {m.role === 'ketua' ? 'Ketua' : 'Anggota'}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Catatan penolakan */}
            {group.status === 'ditolak' && group.rejection_note && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800 flex gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-600" />
                    <div>
                        <p className="font-semibold mb-0.5">Catatan Penolakan:</p>
                        <p>{group.rejection_note}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Initial form ─────────────────────────────────────────────────────────────
const EMPTY = { academic_period_id: '', kp_company_id: '', kp_theme_id: '', anggota_ids: [] };

// ─── Halaman utama ────────────────────────────────────────────────────────────
const PendaftaranKelompok = () => {
    // Auth: ambil user yang login untuk tahu student_id-nya
    const authUser = useSelector(s => s.auth.user);

    // Data fetching
    const { data: kpGroups, isLoading }  = useGetKpGroupsQuery();
    const { data: periodeList }          = useGetAcademicPeriodsQuery();
    const { data: perusahaanListRaw }    = useGetKpCompaniesQuery();
    const { data: temaList }             = useGetKpThemesQuery();
    const { data: studentListRaw }       = useGetStudentsQuery();
    const { data: documentTypesRaw }     = useGetDocumentTypesQuery();
    const [createKpGroup]                = useCreateKpGroupMutation();
    const [updateKpGroup]                = useUpdateKpGroupMutation();
    const [proposeKpCompany]             = useProposeKpCompanyMutation();

    const perusahaanList = useMemo(() =>
        Array.isArray(perusahaanListRaw) ? perusahaanListRaw
        : Array.isArray(perusahaanListRaw?.data) ? perusahaanListRaw.data : [],
    [perusahaanListRaw]);

    const studentList = useMemo(() =>
        Array.isArray(studentListRaw) ? studentListRaw
        : Array.isArray(studentListRaw?.data) ? studentListRaw.data : [],
    [studentListRaw]);

    const documentTypes = useMemo(() =>
        Array.isArray(documentTypesRaw) ? documentTypesRaw
        : Array.isArray(documentTypesRaw?.data) ? documentTypesRaw.data : [],
    [documentTypesRaw]);

    // Semua kelompok yang melibatkan user ini
    const kelompok = useMemo(() =>
        Array.isArray(kpGroups) ? kpGroups
        : Array.isArray(kpGroups?.data) ? kpGroups.data : [],
    [kpGroups]);

    // Student record user yang login (untuk cek peran di kelompok)
    const myStudent = useMemo(() =>
        studentList.find(s => s.user_id === authUser?.id || String(s.user_id) === String(authUser?.id)),
    [studentList, authUser]);

    // Pisahkan: kelompok yang user ini jadi KETUA vs jadi ANGGOTA (diundang)
    const kelompokSebagaiKetua = useMemo(() =>
        kelompok.filter(g =>
            g.members?.some(m => m.student_id === myStudent?.id && m.role === 'ketua')
        ),
    [kelompok, myStudent]);

    const kelompokSebagaiAnggota = useMemo(() =>
        kelompok.filter(g =>
            g.members?.some(m => m.student_id === myStudent?.id && m.role !== 'ketua')
        ),
    [kelompok, myStudent]);

    // State wizard
    const [editing, setEditing]           = useState(null);
    const [currentStep, setStep]          = useState(1);
    const [completedSteps, setCompleted]  = useState([]);
    const [form, setForm]                 = useState(EMPTY);
    const [errors, setErrors]             = useState({});
    const [submitting, setSubmitting]     = useState(false);
    const [showConfirm, setShowConfirm]   = useState(false);

    // Jumlah anggota maksimal dari periode yang dipilih
    const maxAnggota = useMemo(() => {
        const p = (periodeList || []).find(p => String(p.id) === String(form.academic_period_id));
        return (p?.total_members ?? 3) - 1; // -1 karena ketua tidak dimasukkan ke anggota_ids
    }, [periodeList, form.academic_period_id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    // Edit kelompok yang masih draft
    const openEdit = (item) => {
        setEditing(item);
        setForm({
            academic_period_id: item.academic_period?.id || '',
            kp_company_id:      item.kp_company?.id      || '',
            kp_theme_id:        item.kp_theme?.id         || '',
            anggota_ids:        (item.members || [])
                .filter(m => m.role === 'anggota')
                .map(m => m.student_id),
        });
        setErrors({});
        setStep(1);
        setCompleted([1, 2, 3, 4]); // Mark first 4 steps as completed, move to step 1
    };

    // Reset ke halaman awal (tanpa menghapus data — hanya tutup wizard)
    const resetWizard = () => {
        setEditing(null);
        setForm(EMPTY);
        setErrors({});
        setStep(1);
        setCompleted([]);
    };

    // Validasi per langkah (untuk 5 steps)
    const validate = (step) => {
        const e = {};
        if (step === 1 && !form.academic_period_id) e.academic_period_id = 'Pilih periode terlebih dahulu';
        if (step === 1 && !form.kp_company_id)      e.kp_company_id      = 'Pilih perusahaan tujuan KP';
        if (step === 2 && !form.kp_theme_id)         e.kp_theme_id        = 'Pilih tema KP';
        if (step === 3 && form.anggota_ids.length === 0)
            e.anggota_ids = 'Tambah minimal 1 anggota tambahan (selain ketua)';
        // Step 4 (Dokumen): validasi dapat ditambahkan nanti
        // Step 5 (Preview): tidak ada validasi khusus
        return e;
    };

    const goNext = () => {
        const e = validate(currentStep);
        if (Object.keys(e).length) { setErrors(e); return; }
        setErrors({});
        setCompleted(prev => prev.includes(currentStep) ? prev : [...prev, currentStep]);
        if (currentStep < STEPS.length) setStep(s => s + 1);
    };

    const goPrev = () => { if (currentStep > 1) setStep(s => s - 1); };

    // Propose perusahaan baru oleh mahasiswa
    const handlePropose = async (data, onSuccess) => {
        try {
            const result = await proposeKpCompany(data).unwrap();
            handleApiSuccess('Perusahaan berhasil didaftarkan');
            onSuccess(result);
        } catch (err) {
            handleApiError(err, 'Gagal mendaftarkan perusahaan');
        }
    };

    // Submit pendaftaran kelompok
    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const payload = {
                academic_period_id: Number(form.academic_period_id),
                kp_company_id:      Number(form.kp_company_id),
                kp_theme_id:        Number(form.kp_theme_id),
                anggota_ids:        form.anggota_ids,
            };
            if (editing) {
                await updateKpGroup({ id: editing.id, ...payload }).unwrap();
                handleApiSuccess('Pendaftaran kelompok berhasil diperbarui');
            } else {
                await createKpGroup(payload).unwrap();
                handleApiSuccess('Pendaftaran kelompok berhasil dikirim');
            }
            resetWizard();
            setShowConfirm(false);
        } catch (err) {
            handleApiError(err, 'Gagal menyimpan pendaftaran kelompok');
        } finally {
            setSubmitting(false);
        }
    };

    // Kolom tabel riwayat — kelompok yang user ini jadi ketua
    const columns = [
        {
            name: 'Peran',
            cell: r => {
                const isKetua = r.members?.some(m => m.student_id === myStudent?.id && m.role === 'ketua');
                return (
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        isKetua ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                        {isKetua ? <><Crown className="w-3 h-3" /> Ketua</> : <><UserCheck className="w-3 h-3" /> Anggota</>}
                    </span>
                );
            },
            width: '100px',
        },
        { name: 'Kode',       selector: r => r.code || '-',                  sortable: true, width: '120px' },
        { name: 'Periode',    selector: r => r.academic_period?.name || '-', sortable: true, wrap: true },
        { name: 'Perusahaan', selector: r => r.kp_company?.name || '-',      sortable: true, wrap: true },
        { name: 'Tema',       selector: r => r.kp_theme?.title || '-',       sortable: true, wrap: true },
        {
            name: 'Anggota',
            selector: r => r.members?.length ?? '-',
            width: '90px',
            center: true,
        },
        {
            name: 'Status',
            cell: r => <Badge status={r.status}>{STATUS_LABEL[r.status] || r.status}</Badge>,
            width: '130px',
        },
        {
            name: 'Aksi',
            cell: r => {
                const isKetua = r.members?.some(m => m.student_id === myStudent?.id && m.role === 'ketua');
                return isKetua && r.status === 'draft' ? (
                    <Button size="sm" variant="warning" icon={Pencil} onClick={() => openEdit(r)}>Edit</Button>
                ) : null;
            },
            width: '90px',
        },
    ];

        // Wizard tampil jika: sedang edit, form sudah diisi, atau belum ada kelompok sebagai ketua
    const hasKelompokSebagaiKetua = kelompokSebagaiKetua.length > 0;
    const showWizard = editing !== null || currentStep > 1 ||
        form.academic_period_id !== '' || !hasKelompokSebagaiKetua;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Pendaftaran Kelompok KP"
                description="Daftarkan kelompok Kerja Praktek Anda melalui panduan langkah demi langkah."
                icon={UserPlus}
                actions={
                    !showWizard && hasKelompokSebagaiKetua ? (
                        <Button icon={Plus} onClick={() => setStep(1)}>
                            Daftar Kelompok Baru
                        </Button>
                    ) : null
                }
            />

            {/* ── Wizard ── */}
            {(showWizard || editing !== null) && (
                <Card>
                    <div className="p-6">
                        {/* Header wizard */}
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h2 className="text-base font-bold text-gray-900">
                                    {editing ? 'Edit Pendaftaran Kelompok' : 'Pendaftaran Kelompok Baru'}
                                </h2>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    Langkah {currentStep} dari {STEPS.length} — {STEPS[currentStep - 1].label}
                                </p>
                            </div>
                            {hasKelompokSebagaiKetua && (
                                <button type="button" onClick={resetWizard}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        <StepperHeader currentStep={currentStep} completedSteps={completedSteps} />

                        {/* Konten langkah */}
                        <div className="min-h-[280px]">
                            {currentStep === 1 && (
                                <Step1PeriodeTempatKP 
                                    form={form} onChange={handleChange}
                                    periodeList={periodeList} perusahaanList={perusahaanList} 
                                    onPropose={handlePropose}
                                />
                            )}
                            {currentStep === 2 && (
                                <Step2TemaKp form={form} onChange={handleChange} temaList={temaList} />
                            )}
                            {currentStep === 3 && (
                                <Step3Anggota
                                    form={form} onChange={handleChange}
                                    studentList={studentList} maxAnggota={maxAnggota}
                                    ketuaStudent={myStudent}
                                />
                            )}
                            {currentStep === 4 && (
                                <Step4Dokumen form={form} onChange={handleChange} documentTypes={documentTypes} />
                            )}
                            {currentStep === 5 && (
                                <Step5Preview 
                                    form={form} periodeList={periodeList}
                                    perusahaanList={perusahaanList} temaList={temaList}
                                    studentList={studentList} ketuaStudent={myStudent}
                                />
                            )}
                        </div>

                        {/* Error validasi */}
                        {Object.keys(errors).length > 0 && (
                            <div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {Object.values(errors)[0]}
                            </div>
                        )}

                        {/* Navigasi */}
                        <div className="flex items-center justify-between pt-6 mt-4 border-t border-gray-100">
                            <Button type="button" variant="secondary" icon={ChevronLeft}
                                onClick={goPrev} disabled={currentStep === 1}>
                                Sebelumnya
                            </Button>
                            {currentStep < STEPS.length ? (
                                <Button type="button" variant="primary" onClick={goNext}>
                                    Lanjut <ChevronRight className="w-4 h-4 ml-1 inline" />
                                </Button>
                            ) : (
                                <Button type="button" variant="primary" icon={CheckCircle2}
                                    onClick={() => {
                                        setShowConfirm(true);
                                    }}>
                                    Kirim Pendaftaran
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>
            )}

            {/* ── Modal konfirmasi ── */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
                            onClick={() => setShowConfirm(false)} />
                        <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                                <h3 className="text-base font-semibold text-gray-900">Konfirmasi Pendaftaran</h3>
                                <button onClick={() => setShowConfirm(false)}
                                    className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="px-6 py-4 max-h-[65vh] overflow-y-auto">
                                <Step5Preview form={form} periodeList={periodeList}
                                    perusahaanList={perusahaanList} temaList={temaList}
                                    studentList={studentList} ketuaStudent={myStudent} />
                            </div>
                            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
                                <Button variant="secondary" onClick={() => setShowConfirm(false)}>
                                    Kembali Edit
                                </Button>
                                <Button variant="primary" loading={submitting}
                                    icon={CheckCircle2} onClick={handleSubmit}>
                                    {editing ? 'Perbarui Pendaftaran' : 'Kirim Pendaftaran'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Undangan: kelompok di mana user diundang sebagai anggota ── */}
            {kelompokSebagaiAnggota.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <UserCheck className="w-5 h-5 text-blue-600" />
                        <h2 className="text-sm font-bold text-gray-800">
                            Undangan Kelompok ({kelompokSebagaiAnggota.length})
                        </h2>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                        Anda telah diundang bergabung ke kelompok berikut oleh ketua kelompok masing-masing.
                    </p>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {kelompokSebagaiAnggota.map(g => (
                            <KartuUndangan key={g.id} group={g} myStudentId={myStudent?.id} />
                        ))}
                    </div>
                </div>
            )}

            {/* ── Tabel riwayat kelompok yang user buat/ketua ── */}
            {kelompokSebagaiKetua.length > 0 && (
                <Card
                    title="Kelompok yang Anda Buat"
                    subtitle={`${kelompokSebagaiKetua.length} kelompok sebagai ketua`}
                >
                    {isLoading
                        ? <Skeleton className="h-48" />
                        : <DataTableWrapper columns={columns} data={kelompokSebagaiKetua} pagination />
                    }
                </Card>
            )}
        </div>
    );
};

export default PendaftaranKelompok;
