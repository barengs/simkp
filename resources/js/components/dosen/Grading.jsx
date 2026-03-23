import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBimbingan, submitEvaluation } from "../store/slices/gradingSlice";
import { toast } from "react-toastify";
import { Skeleton } from "../ui/Skeleton";
import { Search, FileText, User, ChevronRight, X } from "lucide-react";
import Modal from "../ui/Modal";

const Grading = () => {
    const dispatch = useDispatch();
    const { students, loading, submitLoading, error } = useSelector((state) => state.grading);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStudent, setSelectedStudent] = useState(null);

    // Grading Form State
    const [grades, setGrades] = useState({
        score_field: 0,
        score_report: 0,
        score_presentation: 0,
        final_score: 0,
        notes: ""
    });

    useEffect(() => {
        dispatch(fetchBimbingan());
    }, [dispatch]);

    // Real-time calculation
    useEffect(() => {
        const { score_field, score_report, score_presentation } = grades;
        // Formula: Field (40%), Report (30%), Presentation (30%) - Example
        const final = (parseFloat(score_field) * 0.4) + (parseFloat(score_report) * 0.3) + (parseFloat(score_presentation) * 0.3);
        setGrades(prev => ({ ...prev, final_score: final.toFixed(2) }));
    }, [grades.score_field, grades.score_report, grades.score_presentation]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await dispatch(submitEvaluation({
                internship_id: selectedStudent.id,
                ...grades
            })).unwrap();
            toast.success("Nilai berhasil disimpan");
            setSelectedStudent(null);
        } catch (err) {
            toast.error(err || "Gagal menyimpan nilai");
        }
    };

    const filteredStudents = students.filter(s =>
        s.leader?.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.leader?.user?.nim.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-64px)] flex flex-col">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Penilaian Mahasiswa</h1>

            {!selectedStudent ? (
                // List View (Data Table)
                <div className="bg-white shadow rounded-lg overflow-hidden flex-1 flex flex-col">
                    <div className="p-4 border-b border-gray-200">
                        <div className="relative rounded-md shadow-sm max-w-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                                placeholder="Cari Mahasiswa..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mahasiswa</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Laporan</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr><td colSpan="4" className="px-6 py-4"><Skeleton className="h-4 w-full" /></td></tr>
                                ) : filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                                                    {student.leader?.user?.name.charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{student.leader?.user?.name}</div>
                                                    <div className="text-sm text-gray-500">{student.leader?.nim}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.status === 'finished' ? 'bg-green-100 text-green-800' :
                                                student.status === 'grading' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {student.status === 'finished' ? 'Selesai' :
                                                    student.status === 'grading' ? 'Siap Dinilai' : 'Sedang Berjalan'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {student.report ? (
                                                <a href={student.report.file_url} target="_blank" className="text-indigo-600 hover:text-indigo-900 flex items-center">
                                                    <FileText className="w-4 h-4 mr-1" /> PDF Laporan
                                                </a>
                                            ) : (
                                                <span className="text-gray-400">Belum upload</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => {
                                                    setSelectedStudent(student);
                                                    if (student.evaluation) {
                                                        setGrades(student.evaluation);
                                                    } else {
                                                        setGrades({ score_field: 0, score_report: 0, score_presentation: 0, final_score: 0, notes: "" });
                                                    }
                                                }}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                Nilai <ChevronRight className="w-4 h-4 inline" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                // Split Screen View
                <div className="flex-1 flex gap-4 overflow-hidden">
                    {/* Left Side: PDF Preview */}
                    <div className="w-1/2 bg-gray-100 rounded-lg p-4 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-gray-700">Preview Laporan: {selectedStudent.leader?.user?.name}</h3>
                        </div>
                        <div className="flex-1 bg-white rounded shadow-inner overflow-hidden flex items-center justify-center">
                            {selectedStudent.report ? (
                                <iframe src={selectedStudent.report.file_url} className="w-full h-full" title="PDF Preview"></iframe>
                            ) : (
                                <p className="text-gray-400">Mahasiswa belum mengunggah laporan PDF.</p>
                            )}
                        </div>
                    </div>

                    {/* Right Side: Floating Form */}
                    <div className="w-1/2 bg-white shadow rounded-lg p-6 overflow-y-auto relative">
                        <button
                            onClick={() => setSelectedStudent(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-xl font-bold text-gray-900 mb-6">Input Penilaian</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                <div className="sm:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700">Nilai Lapangan (40%)</label>
                                    <div className="mt-1">
                                        <input
                                            type="number"
                                            max="100"
                                            min="0"
                                            value={grades.score_field}
                                            onChange={(e) => setGrades({ ...grades, score_field: e.target.value })}
                                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700">Nilai Laporan (30%)</label>
                                    <div className="mt-1">
                                        <input
                                            type="number"
                                            max="100"
                                            min="0"
                                            value={grades.score_report}
                                            onChange={(e) => setGrades({ ...grades, score_report: e.target.value })}
                                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700">Nilai Presentasi (30%)</label>
                                    <div className="mt-1">
                                        <input
                                            type="number"
                                            max="100"
                                            min="0"
                                            value={grades.score_presentation}
                                            onChange={(e) => setGrades({ ...grades, score_presentation: e.target.value })}
                                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-6">
                                    <div className="bg-indigo-50 p-4 rounded-md">
                                        <p className="text-sm font-semibold text-indigo-900">Nilai Akhir Kalkulasi</p>
                                        <p className="text-3xl font-bold text-indigo-600">{grades.final_score}</p>
                                    </div>
                                </div>

                                <div className="sm:col-span-6">
                                    <label className="block text-sm font-medium text-gray-700">Catatan Revisi / Masukan</label>
                                    <div className="mt-1">
                                        <textarea
                                            rows={4}
                                            value={grades.notes}
                                            onChange={(e) => setGrades({ ...grades, notes: e.target.value })}
                                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-5">
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedStudent(null)}
                                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitLoading}
                                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                    >
                                        {submitLoading ? 'Menyimpan...' : 'Simpan Nilai'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Grading;
