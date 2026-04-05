import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { fetchEvaluations, saveEvaluation } from '../../store/slice/evaluationSlice';
import DataTable from 'react-data-table-component';
import { Search, Edit, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import Skeleton from '../../components/Skeleton';
import Modal from '../../components/Modal';

const Evaluation = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const { data: internships, loading } = useSelector((state) => state.evaluations || { data: [], loading: false });

    const [searchTerm, setSearchTerm] = useState('');
    const [modalConfig, setModalConfig] = useState({ isOpen: false, data: null });
    const [formData, setFormData] = useState({
        score_field: '',
        score_report: '',
        score_seminar: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        dispatch(fetchEvaluations());
    }, [dispatch]);

    const openModal = (internship) => {
        setModalConfig({ isOpen: true, data: internship });
        if (internship.evaluation) {
            setFormData({
                score_field: internship.evaluation.score_field || '',
                score_report: internship.evaluation.score_report || '',
                score_seminar: internship.evaluation.score_seminar || '',
            });
        } else {
            setFormData({
                score_field: '',
                score_report: '',
                score_seminar: '',
            });
        }
    };

    // Handle automatic modal opening if redirected from Report page
    useEffect(() => {
        if (location.state?.openInternshipId && internships.length > 0) {
            const internship = internships.find(i => i.id === location.state.openInternshipId);
            if (internship) {
                openModal(internship);
                // Clear state to prevent modal from re-opening on manual refresh/nav
                window.history.replaceState({}, document.title);
            }
        }
    }, [location.state, internships]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const payload = {
            internship_id: modalConfig.data.id,
            ...formData
        };

        const action = await dispatch(saveEvaluation(payload));
        if (saveEvaluation.fulfilled.match(action)) {
            toast.success("Penilaian berhasil disimpan");
            setModalConfig({ isOpen: false, data: null });
        } else {
            toast.error(action.payload || "Gagal menyimpan penilaian");
        }
        setIsSubmitting(false);
    };

    const filteredData = Array.isArray(internships) ? internships.filter(
        (item) => 
            item.leader?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.company?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.company_name_manual?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    const columns = [
        {
            name: 'Ketua Kelompok',
            selector: (row) => row.leader?.name || '-',
            sortable: true,
            width: '200px'
        },
        {
            name: 'Anggota',
            selector: (row) => (row.students?.length || 1) + " Orang",
            width: '100px'
        },
        {
            name: 'Mitra KP',
            selector: (row) => row.company?.name || row.company_name_manual || '-',
            sortable: true,
        },
        {
            name: 'Nilai Akhir',
            selector: (row) => row.evaluation?.final_grade || '-',
            sortable: true,
            width: '120px',
            cell: row => (
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    row.evaluation ? 'bg-green-100 text-green-800 font-bold text-sm' : 'bg-gray-100 text-gray-500'
                }`}>
                    {row.evaluation ? row.evaluation.final_grade : 'Belum'}
                </span>
            )
        },
        {
            name: 'Aksi',
            cell: (row) => (
                <button
                    onClick={() => row.has_final_report && openModal(row)}
                    disabled={!row.has_final_report}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm transition-all ${
                        !row.has_final_report 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                            : row.evaluation 
                                ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100' 
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                    }`}
                    title={!row.has_final_report ? "Laporan belum Final" : ""}
                >
                    {row.evaluation ? <><Edit size={16} /> <span>Edit Nilai</span></> : <><FileText size={16} /> <span>Input Nilai</span></>}
                </button>
            ),
            width: '160px'
        }
    ];

    if (loading && filteredData.length === 0) {
        return <Skeleton className="w-full h-96" />;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Evaluasi & Penilaian KP</h2>
                    <p className="text-sm text-gray-500">Berikan penilaian akhir untuk kelompok kerja praktik bimbingan Anda.</p>
                </div>
                <div className="mt-4 md:mt-0">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari kelompok..."
                            className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="mb-6 bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                <div className="text-sm text-amber-800">
                    <p className="font-bold mb-0.5">Ketentuan Penilaian:</p>
                    <p>Tombol <strong>"Input Nilai"</strong> hanya akan aktif jika kelompok mahasiswa sudah mengunggah laporan dan statusnya telah Anda validasi menjadi <strong>FINAL</strong> di menu <span className="font-semibold italic">Validasi Laporan</span>.</p>
                </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <DataTable
                    columns={columns}
                    data={filteredData}
                    pagination
                    highlightOnHover
                    responsive
                    noDataComponent={<div className="p-6 text-gray-500">Belum ada kelompok KP yang disetujui untuk Anda bimbing.</div>}
                />
            </div>

            <Modal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ isOpen: false, data: null })}
                title={`Formulir Penilaian KP - Group ${modalConfig.data?.leader?.name}`}
            >
                <form onSubmit={handleSubmit} className="space-y-5 py-2">
                    <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-bold text-indigo-900">Peserta Penilaian:</p>
                            <ul className="mt-1 text-sm text-indigo-800 list-disc list-inside">
                                {modalConfig.data?.students?.map(s => <li key={s.id}>{s.name} ({s.nim})</li>)}
                            </ul>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-indigo-600 mb-1">Status Penilaian:</p>
                            {modalConfig.data?.evaluation ? (
                                <span className="inline-block bg-green-500 text-white font-bold px-3 py-1 rounded-full text-lg shadow-sm">
                                    {modalConfig.data.evaluation.final_grade}
                                </span>
                            ) : (
                                <span className="inline-block bg-gray-200 text-gray-700 font-semibold px-2 py-1 rounded-md text-sm">
                                    Belum Diisi
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Skor Lapangan</label>
                            <input
                                type="number" step="0.01" min="0" max="100" required
                                value={formData.score_field}
                                onChange={(e) => setFormData({...formData, score_field: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="0 - 100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Skor Laporan</label>
                            <input
                                type="number" step="0.01" min="0" max="100" required
                                value={formData.score_report}
                                onChange={(e) => setFormData({...formData, score_report: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="0 - 100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Skor Seminar</label>
                            <input
                                type="number" step="0.01" min="0" max="100" required
                                value={formData.score_seminar}
                                onChange={(e) => setFormData({...formData, score_seminar: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="0 - 100"
                            />
                        </div>
                    </div>

                    <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-xs leading-relaxed border border-yellow-200">
                        <strong>Catatan Sistem:</strong> Sistem akan otomatis mengakumulasikan rata-rata dari ketiga skor di atas. Skor rata-rata <strong>&ge;85</strong> = A, <strong>&ge;75</strong> = B, <strong>&ge;60</strong> = C, <strong>&ge;45</strong> = D.
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={() => setModalConfig({ isOpen: false, data: null })} className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl">Batal</button>
                        <button type="submit" disabled={isSubmitting} className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center shadow-md disabled:opacity-70">
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Penilaian'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Evaluation;
