import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvaluations } from '../../store/slice/evaluationSlice';
import Skeleton from '../../components/Skeleton';
import { Award, FileText, MapPin, Presentation, Calendar, CheckCircle } from 'lucide-react';

const Evaluation = () => {
    const dispatch = useDispatch();
    const { data: evaluations, loading } = useSelector((state) => state.evaluations || { data: [], loading: false });

    useEffect(() => {
        dispatch(fetchEvaluations());
    }, [dispatch]);

    if (loading && evaluations.length === 0) {
        return <Skeleton className="w-full h-96" />;
    }

    const currentEval = Array.isArray(evaluations) && evaluations.length > 0 ? evaluations[0] : null;

    if (!currentEval) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                    <Award className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Penilaian Belum Tersedia</h2>
                <p className="text-gray-500 max-w-md mx-auto">Dosen pembimbing Anda belum memasukkan nilai akhir Kerja Praktik. Harap selesaikan sidang dan unggah laporan final terlebih dahulu.</p>
            </div>
        );
    }

    // Get letter grade color config
    const gradeConfig = {
        'A': 'bg-emerald-500 text-white ring-emerald-200',
        'B': 'bg-blue-500 text-white ring-blue-200',
        'C': 'bg-yellow-500 text-white ring-yellow-200',
        'D': 'bg-orange-500 text-white ring-orange-200',
        'E': 'bg-red-500 text-white ring-red-200',
    };
    
    const colorClass = gradeConfig[currentEval.final_grade] || 'bg-gray-500 text-white ring-gray-200';

    return (
        <div className="max-w-auto mx-auto space-y-6">
            <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 rounded-2xl shadow-lg p-8 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 opacity-10">
                    <Award size={200} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="text-white">
                        <p className="text-indigo-200 font-medium mb-1 uppercase tracking-wider text-sm">Hasil Akhir Kerja Praktik</p>
                        <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
                            Selamat! <span className="transform rotate-12 inline-block">🎉</span>
                        </h1>
                        <p className="text-indigo-100 max-w-lg leading-relaxed">Penilaian dari dosen pembimbing telah diumumkan. Berikut adalah rincian nilai komponen dan hasil akhir dari kegiatan Kerja Praktik kelompok Anda.</p>
                    </div>
                    <div className="shrink-0 flex justify-center">
                        <div className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl ring-8 ${colorClass}`}>
                            <span className="text-6xl font-black drop-shadow-md">{currentEval.final_grade}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center group hover:border-indigo-200 transition-colors">
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 text-indigo-600 group-hover:scale-110 transition-transform">
                        <MapPin size={24} />
                    </div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Nilai Lapangan</p>
                    <p className="text-3xl font-black text-gray-900">{currentEval.score_field}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center group hover:border-indigo-200 transition-colors">
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 text-indigo-600 group-hover:scale-110 transition-transform">
                        <FileText size={24} />
                    </div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Nilai Laporan</p>
                    <p className="text-3xl font-black text-gray-900">{currentEval.score_report}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center group hover:border-indigo-200 transition-colors">
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 text-indigo-600 group-hover:scale-110 transition-transform">
                        <Presentation size={24} />
                    </div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Nilai Seminar</p>
                    <p className="text-3xl font-black text-gray-900">{currentEval.score_seminar}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <CheckCircle className="text-green-500" size={20} /> Rekapitulasi Informasi
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 text-sm">
                    <div>
                        <p className="text-gray-500 font-medium">Mitra KP</p>
                        <p className="font-semibold text-gray-900">{currentEval.internship?.company?.name || currentEval.internship?.company_name_manual}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 font-medium">Dosen Pembimbing</p>
                        <p className="font-semibold text-gray-900">{currentEval.internship?.supervisor?.name || '-'}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 font-medium">Ketua Kelompok</p>
                        <p className="font-semibold text-gray-900">{currentEval.internship?.leader?.name || '-'}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 font-medium">Tanggal Diterbitkan</p>
                        <p className="font-semibold text-gray-900 flex items-center gap-1">
                            <Calendar size={14} className="text-gray-400"/> 
                            {new Date(currentEval.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Evaluation;
