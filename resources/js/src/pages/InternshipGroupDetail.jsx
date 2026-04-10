import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInternshipDetail } from '../store/slice/internshipSlice';
import { approveReport, rejectReport } from '../store/slice/reportSlice';
import { approveLogbook as approveLogbookAction } from '../store/slice/logbookSlice';
import {
    ArrowLeft, Building2, Users, GraduationCap, Calendar,
    BookOpen, FileText, CheckCircle, XCircle, Clock,
    FileDown, ExternalLink, AlertCircle, RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';
import Skeleton from '../components/Skeleton';

// Status Badge helper
const StatusBadge = ({ status, size = 'sm' }) => {
    const configs = {
        approved: { bg: 'bg-green-100 text-green-700', label: 'Disetujui' },
        rejected: { bg: 'bg-red-100 text-red-700', label: 'Ditolak' },
        pending: { bg: 'bg-amber-100 text-amber-700', label: 'Menunggu' },
        submitted: { bg: 'bg-blue-100 text-blue-700', label: 'Diajukan' },
        ongoing: { bg: 'bg-green-100 text-green-700', label: 'Berjalan' },
        finished: { bg: 'bg-gray-100 text-gray-700', label: 'Selesai' },
        grading: { bg: 'bg-purple-100 text-purple-700', label: 'Penilaian' },
    };
    const config = configs[status] || { bg: 'bg-gray-100 text-gray-600', label: status };
    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.bg}`}>
            {config.label}
        </span>
    );
};

const InternshipGroupDetail = () => {
    const { internship_id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { groupDetail, detailLoading } = useSelector(
        (state) => state.internships || { groupDetail: null, detailLoading: false }
    );

    // Determine initial tab from location state (link dari halaman laporan bisa langsung ke Tab Laporan)
    const initialTab = location.state?.defaultTab || 'logbook';
    const [activeTab, setActiveTab] = useState(initialTab);
    const [logbookSearch, setLogbookSearch] = useState('');

    const role = user?.role?.toLowerCase();
    const isAdmin = role === 'admin';
    const isDosen = role === 'dosen';
    const canManageLogbook = isDosen || isAdmin;

    useEffect(() => {
        if (internship_id) {
            dispatch(fetchInternshipDetail(internship_id));
        }
    }, [dispatch, internship_id]);

    const handleApproveLogbook = async (logbookId) => {
        const action = await dispatch(approveLogbookAction({ id: logbookId, status: 'approved' }));
        if (approveLogbookAction.fulfilled.match(action)) {
            toast.success('Logbook disetujui');
            dispatch(fetchInternshipDetail(internship_id)); // refresh
        } else {
            toast.error(action.payload || 'Gagal menyetujui logbook');
        }
    };

    const backPath = `/${role}/internship-groups`;

    if (detailLoading) {
        return (
            <div className="space-y-4 p-4">
                <Skeleton className="h-10 w-1/3 rounded-xl" />
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <Skeleton className="h-64 lg:col-span-2 rounded-2xl" />
                    <Skeleton className="h-64 lg:col-span-3 rounded-2xl" />
                </div>
            </div>
        );
    }

    if (!groupDetail) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 space-y-4">
                <AlertCircle size={48} className="text-gray-300" />
                <p className="text-lg font-semibold">Data kelompok tidak ditemukan</p>
                <button
                    onClick={() => navigate(backPath)}
                    className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                    <ArrowLeft size={16} /> Kembali ke Daftar Kelompok
                </button>
            </div>
        );
    }

    const internship = groupDetail;
    const company = internship.company;
    const companyName = company?.name || internship.company_name_manual || '-';
    const supervisor = internship.supervisor;
    const students = internship.students || [];
    const logbooks = internship.logbooks || [];
    const reports = internship.reports || [];

    const filteredLogbooks = logbooks.filter((lb) =>
        lb.activity?.toLowerCase().includes(logbookSearch.toLowerCase())
    );

    // Sort reports: terbaru di atas
    const sortedReports = [...reports].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(backPath)}
                    className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Detail Kelompok KP</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Periode: {internship.period?.semester} {internship.period?.academic_year}
                    </p>
                </div>
                <div className="ml-auto">
                    <StatusBadge status={internship.status} size="lg" />
                </div>
            </div>

            {/* 2-Column Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                {/* === Grid Kiri: Detail Kelompok (2/5) === */}
                <div className="lg:col-span-2 space-y-4">

                    {/* Card: Perusahaan */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Building2 size={18} className="text-indigo-500" />
                            <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Tempat KP</h3>
                        </div>
                        <p className="font-semibold text-gray-900">{companyName}</p>
                        {company?.address && (
                            <p className="text-sm text-gray-500 mt-1">{company.address}</p>
                        )}
                        {internship.company_address_manual && !company?.address && (
                            <p className="text-sm text-gray-500 mt-1">{internship.company_address_manual}</p>
                        )}
                        {internship.theme && (
                            <div className="mt-3 pt-3 border-t border-gray-50">
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Tema</p>
                                <p className="text-sm font-medium text-gray-700">{internship.theme?.name}</p>
                            </div>
                        )}
                    </div>

                    {/* Card: Anggota Kelompok */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Users size={18} className="text-emerald-500" />
                            <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Anggota Kelompok</h3>
                            <span className="ml-auto bg-emerald-50 text-emerald-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                {students.length} Orang
                            </span>
                        </div>
                        <div className="space-y-2">
                            {students.map((student, idx) => (
                                <div key={student.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">{student.name}</p>
                                        <p className="text-xs text-gray-500">{student.nim}</p>
                                    </div>
                                    {internship.leader?.id === student.id && (
                                        <span className="text-[9px] font-bold uppercase bg-indigo-600 text-white px-2 py-0.5 rounded shadow-sm">
                                            Ketua
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Card: Dosen Pembimbing */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <GraduationCap size={18} className="text-blue-500" />
                            <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Dosen Pembimbing</h3>
                        </div>
                        {supervisor ? (
                            <div>
                                <p className="font-semibold text-gray-900">{supervisor.name}</p>
                                {supervisor.nip && (
                                    <p className="text-xs text-gray-500 mt-0.5">NIP: {supervisor.nip}</p>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-gray-400 italic text-sm">
                                <AlertCircle size={16} />
                                <span>Belum ada dosen pembimbing</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* === Grid Kanan: Tab View (3/5) === */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                        {/* Tab Navigation */}
                        <div className="flex border-b border-gray-100">
                            <button
                                onClick={() => setActiveTab('logbook')}
                                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors ${
                                    activeTab === 'logbook'
                                        ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <BookOpen size={16} />
                                Logbook
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    activeTab === 'logbook' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {logbooks.length}
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveTab('laporan')}
                                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors ${
                                    activeTab === 'laporan'
                                        ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <FileText size={16} />
                                Laporan
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    activeTab === 'laporan' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {reports.length}
                                </span>
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="p-5">

                            {/* ===== TAB 1: LOGBOOK ===== */}
                            {activeTab === 'logbook' && (
                                <div className="space-y-3">
                                    {/* Search */}
                                    <input
                                        type="text"
                                        placeholder="Cari aktivitas logbook..."
                                        value={logbookSearch}
                                        onChange={(e) => setLogbookSearch(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />

                                    {filteredLogbooks.length === 0 ? (
                                        <div className="py-12 text-center text-gray-400">
                                            <BookOpen size={40} className="mx-auto mb-3 text-gray-300" />
                                            <p className="text-sm">Belum ada logbook untuk kelompok ini.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                                            {filteredLogbooks.map((lb) => (
                                                <div
                                                    key={lb.id}
                                                    className="p-3 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-white hover:border-gray-200 transition-all"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Calendar size={12} className="text-gray-400 shrink-0" />
                                                                <span className="text-xs text-gray-500">{lb.date}</span>
                                                                <StatusBadge status={lb.status} />
                                                            </div>
                                                            <p className="text-sm text-gray-700 line-clamp-2">{lb.activity}</p>
                                                        </div>
                                                        {canManageLogbook && lb.status === 'pending' && (
                                                            <button
                                                                onClick={() => handleApproveLogbook(lb.id)}
                                                                className="shrink-0 p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                                title="Setujui Logbook"
                                                            >
                                                                <CheckCircle size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ===== TAB 2: LAPORAN ===== */}
                            {activeTab === 'laporan' && (
                                <div className="space-y-3">
                                    {sortedReports.length === 0 ? (
                                        <div className="py-12 text-center text-gray-400">
                                            <FileText size={40} className="mx-auto mb-3 text-gray-300" />
                                            <p className="text-sm">Belum ada laporan yang diupload.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                                            {sortedReports.map((rep, idx) => (
                                                <div
                                                    key={rep.id}
                                                    className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-white hover:border-gray-200 transition-all"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                                <span className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">
                                                                    Laporan
                                                                </span>
                                                                <StatusBadge status={rep.status} />
                                                                <span className="text-xs text-gray-400">{rep.created_at}</span>
                                                            </div>
                                                            {rep.title && (
                                                                <p className="text-sm font-semibold text-gray-800 mb-0.5">{rep.title}</p>
                                                            )}
                                                            {rep.description && (
                                                                <p className="text-xs text-gray-500 line-clamp-2">{rep.description}</p>
                                                            )}
                                                            {rep.status === 'rejected' && rep.feedback && (
                                                                <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded-lg">
                                                                    <p className="text-xs text-red-600 font-semibold">Alasan Penolakan:</p>
                                                                    <p className="text-xs text-red-500 mt-0.5">{rep.feedback}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <a
                                                            href={rep.file_url?.startsWith('http') ? rep.file_url : `/storage/${rep.file_url}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="shrink-0 flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-white px-3 py-2 rounded-lg border border-indigo-100 shadow-sm transition-all hover:shadow-md"
                                                        >
                                                            <FileDown size={14} /> Buka
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InternshipGroupDetail;
