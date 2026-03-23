import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { uploadReport } from "../store/slices/reportSlice";
import { fetchStudentDashboard } from "../store/slices/internshipSlice";
import { toast } from "react-toastify";
import { Upload, FileText, CheckCircle, Clock, Award } from "lucide-react";
import { Skeleton } from "../ui/Skeleton";

const Report = () => {
    const dispatch = useDispatch();
    const { loading, progress } = useSelector((state) => state.reports);
    const { dashboardData: internship, loading: fetchingInternship } = useSelector((state) => state.internships);
    const [file, setFile] = useState(null);

    useEffect(() => {
        dispatch(fetchStudentDashboard());
    }, [dispatch]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type !== 'application/pdf') {
            toast.error("Hanya file PDF");
            return;
        }
        if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
            toast.error("Maksimal 10MB");
            return;
        }
        setFile(selectedFile);
    };

    const handleUpload = async () => {
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);

        const result = await dispatch(uploadReport(formData));
        if (result.meta.requestStatus === 'fulfilled') {
            toast.success("Berhasil diunggah");
            dispatch(fetchStudentDashboard());
        }
    };

    const steps = [
        { id: 1, name: 'Pelaksanaan', icon: CheckCircle },
        { id: 2, name: 'Upload', icon: Upload },
        { id: 3, name: 'Penilaian', icon: Clock },
        { id: 4, name: 'Selesai', icon: Award },
    ];

    const getStepStatus = (index) => {
        if (!internship) return 'upcoming';
        const statusMap = { 'ongoing': 1, 'grading': 2, 'finished': 3 };
        const currentStage = statusMap[internship.status] || 0;
        if (index < currentStage) return 'completed';
        if (index === currentStage) return 'current';
        return 'upcoming';
    };

    if (fetchingInternship) return <div className="p-6"><Skeleton className="h-48 w-full rounded-lg" /></div>;
    if (!internship) return <div className="p-6 text-center text-sm text-gray-500">Data tidak ditemukan.</div>;

    return (
        <div className="max-w-3xl mx-auto px-4 py-6">
            <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-900">Laporan Akhir</h1>
                <p className="text-xs text-gray-500">Status progress dan penilaian Kerja Praktik.</p>
            </div>

            {/* Stepper Horizontal Compact */}
            <div className="relative mb-8 px-2">
                <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-100 -z-10" />
                <div className="flex justify-between items-start">
                    {steps.map((step, idx) => {
                        const status = getStepStatus(idx);
                        const isCompleted = status === 'completed';
                        const isCurrent = status === 'current';

                        return (
                            <div key={step.id} className="flex flex-col items-center flex-1">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full border transition-all bg-white 
                                    ${isCompleted ? 'bg-indigo-600 border-indigo-600' :
                                        isCurrent ? 'border-indigo-600 ring-2 ring-indigo-50' : 'border-gray-200'}`}>
                                    {isCompleted ? (
                                        <CheckCircle className="w-4 h-4 text-white" />
                                    ) : (
                                        <step.icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-indigo-600' : 'text-gray-400'}`} />
                                    )}
                                </div>
                                <span className={`mt-2 text-[10px] font-bold uppercase tracking-tight ${isCurrent ? 'text-indigo-600' : 'text-gray-400'}`}>
                                    {step.name}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Card Content Compact */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-5">
                    {getStepStatus(1) === 'current' && (
                        <div className="max-w-sm mx-auto text-center">
                            <h2 className="text-sm font-semibold text-gray-900 mb-4">Unggah Laporan (PDF)</h2>

                            <label className="group relative block w-full py-6 px-4 border border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50/50 transition-all cursor-pointer">
                                <input type="file" className="sr-only" accept="application/pdf" onChange={handleFileChange} />
                                <FileText className="mx-auto h-8 w-8 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                                <span className="mt-2 block text-xs text-gray-600 truncate px-2">
                                    {file ? file.name : "Pilih file laporan"}
                                </span>
                            </label>

                            {loading && (
                                <div className="mt-4">
                                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                                        <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${progress}%` }} />
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1 text-right">{progress}%</p>
                                </div>
                            )}

                            <button
                                onClick={handleUpload}
                                disabled={!file || loading}
                                className="mt-5 w-full bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 transition-all"
                            >
                                {loading ? 'Mengunggah...' : 'Kirim Laporan'}
                            </button>
                        </div>
                    )}

                    {getStepStatus(2) === 'current' && (
                        <div className="text-center py-4">
                            <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2 opacity-80" />
                            <h2 className="text-sm font-semibold text-gray-900">Menunggu Penilaian</h2>
                            <p className="text-xs text-gray-500 mt-1 text-pretty px-4">
                                Laporan sedang ditinjau oleh Dosen Pembimbing.
                            </p>
                        </div>
                    )}

                    {getStepStatus(3) === 'current' && (
                        <div className="text-center py-6">
                            <div className="relative inline-block mb-4">
                                <Award className="w-12 h-12 text-indigo-600 mx-auto" />
                                <div className="absolute -top-1 -right-1">
                                    <CheckCircle className="w-5 h-5 text-green-500 bg-white rounded-full shadow-sm" />
                                </div>
                            </div>
                            <h2 className="text-lg font-black text-gray-900 leading-tight">Proses KP Selesai!</h2>
                            <p className="text-xs text-gray-500 mt-1 mb-6 px-4">Selamat, Anda telah menyelesaikan seluruh rangkaian Kerja Praktik.</p>

                            <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100/50 inline-block min-w-[160px]">
                                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em] mb-2">Nilai Akhir</p>
                                <div className="text-5xl font-black text-indigo-600 tracking-tighter">
                                    {internship.evaluation?.final_score ?? '-'}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Report;