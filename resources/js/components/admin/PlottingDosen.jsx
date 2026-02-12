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
    X
} from "lucide-react";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { fetchInternships, plotLecturer } from "../store/slices/internshipSlice";
import { fetchLecturers } from "../store/slices/lecturerSlice";

const PlottingDosen = () => {
    const dispatch = useDispatch();
    const { internshipsByStatus, loading, forceRefetch } = useSelector((state) => state.internships);
    const { lecturers } = useSelector((state) => state.lecturers);

    const internships = internshipsByStatus.approved?.data || [];

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedInternship, setSelectedInternship] = useState(null);
    const [isPlotModalOpen, setIsPlotModalOpen] = useState(false);
    const [selectedLecturerId, setSelectedLecturerId] = useState("");
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        dispatch(fetchInternships({ status: 'approved', search: searchTerm }));
        dispatch(fetchLecturers({ perPage: 100 })); // Get more lecturers for dropdown
    }, [dispatch, searchTerm]);

    const handlePlotSubmit = async () => {
        if (!selectedInternship || !selectedLecturerId) {
            toast.error("Pilih dosen pembimbing terlebih dahulu");
            return;
        }

        setProcessing(true);
        try {
            await dispatch(plotLecturer({
                id: selectedInternship.id,
                lecturer_id: selectedLecturerId
            })).unwrap();

            toast.success("Dosen pembimbing berhasil di-plot");
            setIsPlotModalOpen(false);
            setSelectedInternship(null);
            setSelectedLecturerId("");
            // Re-fetch data after action
            dispatch(fetchInternships({ status: 'approved', search: searchTerm }));
        } catch (error) {
            toast.error(error || "Gagal melakukan plotting dosen");
        } finally {
            setProcessing(false);
        }
    };

    const filteredInternships = Array.isArray(internships) ? internships.filter(reg =>
        reg.leader?.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.leader?.nim?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.company?.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-gray-900">Plotting Dosen Pembimbing</h1>
                <p className="text-sm text-gray-500">Tentukan dosen pembimbing untuk pendaftaran yang telah disetujui.</p>
            </div>


            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari nama mahasiswa, NIM, atau perusahaan..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Mahasiswa</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Perusahaan & Tema</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Periode</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-12 text-center">
                                    <Clock className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-500" />
                                    <span className="text-sm font-medium text-gray-500">Memuat data...</span>
                                </td>
                            </tr>
                        ) : filteredInternships.length > 0 ? (
                            filteredInternships.map((reg) => (
                                <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-gray-900">{reg.leader?.user?.name}</div>
                                        <div className="text-xs text-gray-500 font-medium">{reg.leader?.nim}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Building2 className="w-3.5 h-3.5 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-900">{reg.company?.name}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 line-clamp-1">{reg.theme?.name}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 font-medium whitespace-nowrap">
                                        TA {reg.period?.academic_year} ({reg.period?.semester})
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => {
                                                setSelectedInternship(reg);
                                                setIsPlotModalOpen(true);
                                            }}
                                            className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors flex items-center gap-2 float-right"
                                        >
                                            <UserPlus className="w-3.5 h-3.5" />
                                            Plot Dosen
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-12 text-center">
                                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                    <span className="text-sm font-medium text-gray-500">Tidak ada pendaftaran yang perlu di-plot.</span>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Plot Modal */}
            {isPlotModalOpen && selectedInternship && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-900">Plot Dosen Pembimbing</h2>
                            <button onClick={() => setIsPlotModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Student Brief */}
                            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                                        {selectedInternship.leader?.user?.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{selectedInternship.leader?.user?.name}</p>
                                        <p className="text-xs text-gray-500 font-medium">{selectedInternship.leader?.nim}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs">
                                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="text-gray-600 font-medium">{selectedInternship.company?.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="text-gray-600 font-medium">TA {selectedInternship.period?.academic_year} ({selectedInternship.period?.semester})</span>
                                    </div>
                                </div>
                            </div>

                            {/* Dropdown Select */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Pilih Dosen Pembimbing</label>
                                <div className="relative">
                                    <select
                                        className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm font-medium bg-white"
                                        value={selectedLecturerId}
                                        onChange={(e) => setSelectedLecturerId(e.target.value)}
                                    >
                                        <option value="">-- Pilih Dosen --</option>
                                        {lecturers.map((lecturer) => (
                                            <option key={lecturer.id} value={lecturer.id}>
                                                {lecturer.user?.name} ({lecturer.nip})
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                                <p className="text-[10px] text-gray-400 font-medium">* Status pendaftaran akan otomatis berubah menjadi "Sedang Berjalan" setelah di-plot.</p>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={() => setIsPlotModalOpen(false)}
                                className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handlePlotSubmit}
                                disabled={processing}
                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {processing ? (
                                    <Clock className="w-4 h-4 animate-spin" />
                                ) : (
                                    <CheckCircle className="w-4 h-4" />
                                )}
                                Simpan Plotting
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlottingDosen;
