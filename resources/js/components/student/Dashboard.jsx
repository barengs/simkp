import { Skeleton } from "../ui/Skeleton";
import { CheckCircle, Clock, XCircle, PlayCircle, GraduationCap, Building2, Calendar, FileText } from "lucide-react";
import { useStudentDashboard } from "../context/StudentDashboardContext";

const Dashboard = () => {
    const {
        existingInternship: myInternship,
        internshipHistory,
        loading
    } = useStudentDashboard();

    const getStatusInfo = (status) => {
        switch (status) {
            case 'draft':
                return { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: <Clock className="w-5 h-5 text-gray-500" /> };
            case 'submitted':
                return { label: 'Menunggu Validasi', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-5 h-5 text-yellow-500" /> };
            case 'approved':
                return { label: 'Disetujui', color: 'bg-blue-100 text-blue-800', icon: <CheckCircle className="w-5 h-5 text-blue-500" /> };
            case 'rejected':
                return { label: 'Ditolak', color: 'bg-red-100 text-red-800', icon: <XCircle className="w-5 h-5 text-red-500" /> };
            case 'ongoing':
                return { label: 'Sedang Berjalan', color: 'bg-green-100 text-green-800', icon: <PlayCircle className="w-5 h-5 text-green-500" /> };
            case 'grading':
                return { label: 'Penilaian', color: 'bg-indigo-100 text-indigo-800', icon: <GraduationCap className="w-5 h-5 text-indigo-500" /> };
            case 'finished':
                return { label: 'Selesai', color: 'bg-purple-100 text-purple-800', icon: <CheckCircle className="w-5 h-5 text-purple-500" /> };
            default:
                return { label: 'Belum Terdaftar', color: 'bg-gray-100 text-gray-800', icon: <Clock className="w-5 h-5 text-gray-500" /> };
        }
    };

    const stats = [
        {
            name: "Status Kerja Praktek",
            value: myInternship ? getStatusInfo(myInternship.status).label : "Belum Daftar",
            change: myInternship ? `TA ${myInternship.period?.academic_year} (${myInternship.period?.semester})` : "-",
            changeType: "positive",
        },
        {
            name: "Dosen Pembimbing",
            value: myInternship?.lecturer?.user?.name || "Belum di-plot",
            change: "Dosen Pembimbing",
            changeType: "neutral",
        },
        {
            name: "Perusahaan",
            value: myInternship?.company?.name || "-",
            change: "Lokasi KP",
            changeType: "neutral",
        },
        {
            name: "Tema KP",
            value: myInternship?.theme?.name || "-",
            change: "Topik Kajian",
            changeType: "neutral",
        },
    ];

    if (loading) {
        return (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white p-6 shadow-sm border border-gray-100 rounded-xl space-y-3">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
                        <div className="px-5 py-5 border-b border-gray-50">
                            <Skeleton className="h-5 w-40" />
                        </div>
                        <div className="p-6 space-y-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="flex gap-4">
                                    <Skeleton className="h-4 w-1/3" />
                                    <Skeleton className="h-4 w-2/3" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
                        <div className="px-5 py-5 border-b border-gray-50">
                            <Skeleton className="h-5 w-40" />
                        </div>
                        <div className="p-4 space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="p-4 border border-gray-50 rounded-lg space-y-2">
                                    <div className="flex justify-between">
                                        <Skeleton className="h-4 w-1/2" />
                                        <Skeleton className="h-4 w-1/4" />
                                    </div>
                                    <Skeleton className="h-3 w-1/3" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white overflow-hidden shadow-sm border border-gray-100 rounded-xl"
                    >
                        <div className="px-5 py-6">
                            <dl>
                                <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider truncate mb-2">
                                    {stat.name}
                                </dt>
                                <dd>
                                    <div className="text-lg font-bold text-gray-900 truncate mb-1">
                                        {stat.value}
                                    </div>
                                    <div className="text-xs text-gray-500 font-medium">
                                        {stat.change}
                                    </div>
                                </dd>
                            </dl>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Card */}
                <div className="bg-white shadow-sm border border-gray-100 overflow-hidden rounded-xl">
                    <div className="px-5 py-5 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-gray-900">
                            Informasi Kerja Praktek
                        </h3>
                        {myInternship && (
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusInfo(myInternship.status).color}`}>
                                {getStatusInfo(myInternship.status).label}
                            </span>
                        )}
                    </div>
                    <div className="px-6 py-6">
                        {myInternship ? (
                            <div className="space-y-5">
                                <div className="flex items-start">
                                    <div className="w-1/3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Perusahaan</div>
                                    <div className="w-2/3">
                                        <p className="text-sm font-bold text-gray-900">{myInternship.company?.name}</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <Building2 className="w-3 h-3 text-gray-400" />
                                            <span className="text-xs text-gray-500 font-medium">{myInternship.company?.address || 'Alamat Belum Tersedia'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-1/3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Tema</div>
                                    <div className="w-2/3 text-sm font-medium text-gray-700 leading-relaxed">{myInternship.theme?.name}</div>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-1/3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Periode</div>
                                    <div className="w-2/3 flex items-center gap-1.5 text-sm font-bold text-indigo-600">
                                        <Calendar className="w-4 h-4" />
                                        TA {myInternship.period?.academic_year} ({myInternship.period?.semester})
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-1/3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Dokumen</div>
                                    <div className="w-2/3 flex flex-wrap gap-3">
                                        {myInternship.proposal_url && (
                                            <a href={myInternship.proposal_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold hover:bg-indigo-50 px-2 py-1 rounded transition-colors bg-white border border-indigo-100">
                                                <FileText className="w-3 h-3" />
                                                Proposal
                                            </a>
                                        )}
                                        {myInternship.krs_url && (
                                            <a href={myInternship.krs_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold hover:bg-indigo-50 px-2 py-1 rounded transition-colors bg-white border border-indigo-100">
                                                <FileText className="w-3 h-3" />
                                                KRS
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4 text-gray-400">
                                    <Clock className="h-6 w-6" />
                                </div>
                                <p className="text-sm font-bold text-gray-900 mb-1">Pendaftaran Kerja Praktek</p>
                                <p className="text-xs font-medium text-gray-500 mb-6">Anda belum melakukan pendaftaran untuk periode ini.</p>
                                <a href="/student/registration" className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all uppercase tracking-widest">
                                    Daftar Sekarang
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Registration History */}
                <div className="bg-white shadow-sm border border-gray-100 overflow-hidden rounded-xl">
                    <div className="px-5 py-5 border-b border-gray-50">
                        <h3 className="text-sm font-bold text-gray-900">
                            Riwayat Pendaftaran
                        </h3>
                    </div>
                    <ul className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
                        {internshipHistory.length > 0 ? internshipHistory.map((history) => (
                            <li key={history.id} className="px-5 py-5 hover:bg-gray-50/50 transition-colors">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="space-y-1">
                                        <div className="text-xs font-bold text-gray-900 line-clamp-1">
                                            {history.company?.name}
                                        </div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            TA {history.period?.academic_year} ({history.period?.semester})
                                        </div>
                                    </div>
                                    <div className="shrink-0">
                                        <span
                                            className={`px-2 py-0.5 inline-flex text-[10px] font-bold rounded-full uppercase tracking-tighter ${history.status === "approved" || history.status === "ongoing" || history.status === "finished"
                                                ? "bg-green-100 text-green-800"
                                                : history.status === "rejected"
                                                    ? "bg-red-100 text-red-800"
                                                    : history.status === "submitted"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-gray-100 text-gray-800"
                                                }`}
                                        >
                                            {getStatusInfo(history.status).label}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-3">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Tema:</span>
                                        <span className="text-[10px] text-gray-600 font-medium line-clamp-1">{history.theme?.name}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400">{new Date(history.created_at).toLocaleDateString('id-ID')}</span>
                                </div>
                            </li>
                        )) : (
                            <div className="py-20 text-center">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Belum Ada Riwayat</p>
                            </div>
                        )}
                    </ul>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
