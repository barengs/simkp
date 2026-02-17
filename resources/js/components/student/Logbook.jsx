import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLogbooks, createLogbook } from "../store/slices/logbookSlice";
import { toast } from "react-toastify";
import { Skeleton } from "../ui/Skeleton";
import Modal from "../ui/Modal";
import { Plus, Upload, Calendar, FileText, Image, Clock, CheckCircle, XCircle } from "lucide-react";

const Logbook = () => {
    const dispatch = useDispatch();
    const { logbooks, loading, submitLoading, error } = useSelector((state) => state.logbooks);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        activity: "",
        evidence: null
    });

    useEffect(() => {
        dispatch(fetchLogbooks());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const handleFileChange = (e) => {
        setFormData({ ...formData, evidence: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append("date", formData.date);
        data.append("activity", formData.activity);
        if (formData.evidence) {
            data.append("evidence", formData.evidence);
        }

        try {
            await dispatch(createLogbook(data)).unwrap();
            toast.success("Logbook berhasil disimpan");
            setIsModalOpen(false);
            setFormData({
                date: new Date().toISOString().split('T')[0],
                activity: "",
                evidence: null
            });
        } catch (err) {
            toast.error(err || "Gagal menyimpan logbook");
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "approved":
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Disetujui</span>;
            case "rejected":
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Ditolak</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Menunggu</span>;
        }
    };

    const TableSkeleton = () => (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex gap-4">
                    <Skeleton className="w-24 h-24 rounded-lg" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Logbook Kegiatan</h1>
                    <p className="mt-1 text-sm text-gray-500">Catat aktivitas harian pelaksanaan Kerja Praktek</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                    Tambah Logbook
                </button>
            </div>

            {loading ? (
                <TableSkeleton />
            ) : logbooks.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada logbook</h3>
                    <p className="mt-1 text-sm text-gray-500">Mulai catat kegiatanmu dengan tombol Tambah Logbook.</p>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {logbooks.map((logbook) => (
                            <li key={logbook.id}>
                                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition duration-150 ease-in-out">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex-shrink-0">
                                                <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                    {new Date(logbook.date).getDate()}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-indigo-600 truncate">
                                                    {new Date(logbook.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                </p>
                                                <p className="mt-1 flex items-center text-sm text-gray-500">
                                                    {logbook.activity}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            {getStatusBadge(logbook.status)}
                                            {logbook.evidence_photo && (
                                                <a
                                                    href={logbook.evidence_photo}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center text-xs text-gray-500 hover:text-indigo-600"
                                                >
                                                    <Image className="w-3 h-3 mr-1" /> Bukti
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    {logbook.rejection_reason && (
                                        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100">
                                            <strong>Alasan Penolakan:</strong> {logbook.rejection_reason}
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Tambah Logbook Harian"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tanggal</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Aktivitas</label>
                        <div className="mt-1">
                            <textarea
                                required
                                minLength={10}
                                rows={4}
                                value={formData.activity}
                                onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                placeholder="Jelaskan kegiatan yang dilakukan..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Bukti Kegiatan (Opsional)</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600 justify-center">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                        <span>Upload logbook</span>
                                        <input
                                            id="file-upload"
                                            name="file-upload"
                                            type="file"
                                            className="sr-only"
                                            accept="image/*,application/pdf"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG, PDF up to 2MB</p>
                                {formData.evidence && (
                                    <p className="text-sm text-green-600 mt-2">
                                        Terpilih: {formData.evidence.name}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                        <button
                            type="submit"
                            disabled={submitLoading}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
                        >
                            {submitLoading ? "Menyimpan..." : "Simpan Logbook"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                        >
                            Batal
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Logbook;
