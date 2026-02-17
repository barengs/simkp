import React, { useState, useEffect } from "react";
import {
    Search,
    UserPlus,
    CheckCircle,
    Clock,
    AlertCircle,
    Building2,
    Calendar,
    ChevronDown,
    X,
    Users,
    Save
} from "lucide-react";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { fetchInternships, assignTeacher } from "../store/slices/internshipSlice";
import { fetchLecturers } from "../store/slices/lecturerSlice";
import { Skeleton } from "../ui/Skeleton";

const PlottingDosen = () => {
    const dispatch = useDispatch();
    const { internshipsByStatus, loading, forceRefetch } = useSelector((state) => state.internships);
    const { lecturers } = useSelector((state) => state.lecturers);

    // Filter only approved internships (ready for plotting)
    const internships = internshipsByStatus.approved?.data || [];

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [isPlotModalOpen, setIsPlotModalOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Assignments state: { [internshipId]: lecturerId }
    const [assignments, setAssignments] = useState({});

    useEffect(() => {
        dispatch(fetchInternships({ status: 'approved', search: searchTerm }));
        dispatch(fetchLecturers({ perPage: 100 }));
    }, [dispatch, searchTerm, forceRefetch]);

    // Group Internships by Company
    const groupedInternships = React.useMemo(() => {
        const groups = {};
        const filtered = Array.isArray(internships) ? internships.filter(reg =>
            reg.company?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.leader?.user?.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) : [];

        filtered.forEach(reg => {
            const companyName = reg.company?.name || reg.company_name_manual || "Perusahaan Tidak Diketahui";
            if (!groups[companyName]) {
                groups[companyName] = {
                    name: companyName,
                    internships: [],
                    totalStudents: 0
                };
            }
            groups[companyName].internships.push(reg);
            groups[companyName].totalStudents += (1 + (reg.members?.length || 0));
        });

        return Object.values(groups);
    }, [internships, searchTerm]);

    const handleOpenModal = (companyGroup) => {
        setSelectedCompany(companyGroup);
        // Reset assignments or pre-fill if already plotted (though here we list 'approved' mainly)
        const initialAssignments = {};
        companyGroup.internships.forEach(int => {
            if (int.supervisor_id) {
                initialAssignments[int.id] = int.supervisor_id;
            }
        });
        setAssignments(initialAssignments);
        setIsPlotModalOpen(true);
    };

    const handleAssignmentChange = (internshipId, lecturerId) => {
        setAssignments(prev => ({
            ...prev,
            [internshipId]: lecturerId
        }));
    };

    const handleSavePlotting = async () => {
        if (Object.keys(assignments).length === 0) {
            toast.warn("Belum ada dosen yang dipilih.");
            return;
        }

        setProcessing(true);
        try {
            // We can send items one by one or batch if needed.
            // The API supports batch updates if we group by teacher, OR we can just iterate.
            // Current API `assignTeacher` takes `internship_ids` (array) and `teacher_id`.
            // So we group by teacher_id first.

            const assignmentsByTeacher = {};
            Object.entries(assignments).forEach(([intId, teacherId]) => {
                if (teacherId) {
                    if (!assignmentsByTeacher[teacherId]) assignmentsByTeacher[teacherId] = [];
                    assignmentsByTeacher[teacherId].push(intId);
                }
            });

            const promises = Object.entries(assignmentsByTeacher).map(([teacherId, intIds]) =>
                dispatch(assignTeacher({
                    internship_ids: intIds,
                    teacher_id: teacherId
                })).unwrap()
            );

            await Promise.all(promises);

            toast.success("Plotting dosen berhasil disimpan.");
            setIsPlotModalOpen(false);
            setSelectedCompany(null);
            setAssignments({});
            // Refresh
            dispatch(fetchInternships({ status: 'approved', search: searchTerm }));
        } catch (error) {
            toast.error(typeof error === 'string' ? error : "Gagal menyimpan plotting.");
        } finally {
            setProcessing(false);
        }
    };

    const TableRowSkeleton = () => (
        <>
            {[...Array(3)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/3"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 bg-gray-200 rounded w-24 ml-auto"></div></td>
                </tr>
            ))}
        </>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-gray-900">Plotting Dosen Pembimbing</h1>
                <p className="text-sm text-gray-500">Tentukan dosen pembimbing berdasarkan perusahaan/instansi magang.</p>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari perusahaan atau mahasiswa..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Main Table (By Company) */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Perusahaan / Instansi</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Total Kelompok</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Total Mahasiswa</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading && groupedInternships.length === 0 ? (
                            <TableRowSkeleton />
                        ) : groupedInternships.length > 0 ? (
                            groupedInternships.map((group, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                                <Building2 className="w-5 h-5" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-900">{group.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-700">{group.internships.length} Kelompok</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-gray-700">{group.totalStudents} Mahasiswa</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleOpenModal(group)}
                                            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
                                        >
                                            Kelola Plotting
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-12 text-center">
                                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                    <span className="text-sm font-medium text-gray-500">Tidak ada data pendaftaran yang perlu di-plot.</span>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Plotting Modal */}
            {isPlotModalOpen && selectedCompany && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full flex items-center justify-center p-4">
                    <div className="relative mx-auto w-full max-w-4xl shadow-2xl rounded-2xl bg-white overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-indigo-600" />
                                    {selectedCompany.name}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Total {selectedCompany.internships.length} Kelompok, {selectedCompany.totalStudents} Mahasiswa
                                </p>
                            </div>
                            <button
                                onClick={() => setIsPlotModalOpen(false)}
                                className="text-gray-400 hover:text-gray-500 p-2 rounded-full hover:bg-white transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Content - Scrollable */}
                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="space-y-6">
                                {selectedCompany.internships.map((int) => (
                                    <div key={int.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-indigo-200 transition-colors shadow-sm">
                                        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                                            {/* Group Info */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 uppercase tracking-wide">
                                                        TA {int.period?.academic_year} ({int.period?.semester})
                                                    </span>
                                                    {assignments[int.id] ? (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-wide flex items-center gap-1">
                                                            <CheckCircle className="w-3 h-3" /> Sudah Dipilih
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-700 uppercase tracking-wide">
                                                            Belum Dipilih
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="text-sm font-bold text-gray-900">{int.theme?.name}</h4>
                                                <div className="mt-2 text-xs text-gray-600 space-y-1">
                                                    <p><strong>Ketua:</strong> {int.leader?.user?.name} ({int.leader?.nim})</p>
                                                    {int.members?.length > 0 && (
                                                        <p><strong>Anggota:</strong> {int.members.map(m => m.student?.user?.name).join(', ')}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Lecturer Selection */}
                                            <div className="w-full md:w-1/3">
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Dosen Pembimbing</label>
                                                <div className="relative">
                                                    <select
                                                        className={`w-full text-sm border rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${assignments[int.id] ? 'border-indigo-300 bg-indigo-50 text-indigo-900 font-bold' : 'border-gray-300 text-gray-700'
                                                            }`}
                                                        value={assignments[int.id] || ""}
                                                        onChange={(e) => handleAssignmentChange(int.id, e.target.value)}
                                                    >
                                                        <option value="">-- Pilih Dosen --</option>
                                                        {lecturers.map(lec => (
                                                            <option key={lec.id} value={lec.id}>
                                                                {lec.user?.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Modal Footer - Fixed */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 shrink-0">
                            <button
                                onClick={() => setIsPlotModalOpen(false)}
                                className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSavePlotting}
                                disabled={processing}
                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {processing ? (
                                    <Clock className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                Simpan Perubahan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlottingDosen;
