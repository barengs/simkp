import React, { useState } from "react";
import { Image, Plus } from "lucide-react";


const Logbook = () => {
    const [logbooks, setLogbooks] = useState([
        {
            id: 1,
            week: 1,
            date: "2024-02-05",
            activity:
                "Pengenalan lingkungan kerja dan struktur organisasi perusahaan",
            status: "Disetujui",
            feedback: "Kegiatan sudah sesuai, lanjutkan dengan baik",
            photo: "https://via.placeholder.com/150",
        },
        {
            id: 2,
            week: 2,
            date: "2024-02-12",
            activity:
                "Melakukan analisis kebutuhan sistem bersama tim pengembang",
            status: "Disetujui",
            feedback: "Analisis cukup mendalam, dokumentasi bisa diperbaiki",
            photo: "https://via.placeholder.com/150",
        },
        {
            id: 3,
            week: 3,
            date: "2024-02-19",
            activity:
                "Mengikuti pelatihan teknologi yang digunakan di perusahaan",
            status: "Menunggu Validasi",
            feedback: "",
            photo: null,
        },
    ]);

    const [showModal, setShowModal] = useState(false);
    const [newLogbook, setNewLogbook] = useState({
        week: "",
        date: "",
        activity: "",
        photo: null,
    });

    const handleAddLogbook = () => {
        const log = {
            id: logbooks.length + 1,
            ...newLogbook,
            status: "Menunggu Validasi",
            feedback: "",
        };
        setLogbooks([log, ...logbooks]);
        setNewLogbook({ week: "", date: "", activity: "", photo: null });
        setShowModal(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Disetujui":
                return "bg-green-100 text-green-800";
            case "Ditolak":
                return "bg-red-100 text-red-800";
            case "Menunggu Validasi":
                return "bg-yellow-100 text-yellow-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <>
            <div className="space-y-6">
                {/* Add Logbook Button */}
                <div className="flex justify-end">
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Tambah Logbook Mingguan
                    </button>
                </div>

                {/* Logbook List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {logbooks.map((log) => (
                        <div
                            key={log.id}
                            className="bg-white shadow overflow-hidden sm:rounded-lg"
                        >
                            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                                        Minggu {log.week}
                                    </h3>
                                    <span
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                            log.status
                                        )}`}
                                    >
                                        {log.status}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">
                                    {log.date}
                                </p>
                            </div>
                            <div className="px-4 py-5 sm:p-6">
                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-500">
                                        Aktivitas
                                    </h4>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {log.activity}
                                    </p>
                                </div>

                                {log.photo && (
                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-gray-500">
                                            Foto Kegiatan
                                        </h4>
                                        <img
                                            src={log.photo}
                                            alt="Aktivitas mingguan"
                                            className="mt-2 w-full h-48 object-cover rounded-md"
                                        />
                                    </div>
                                )}

                                {log.feedback && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">
                                            Feedback Dosen
                                        </h4>
                                        <p className="mt-1 text-sm text-gray-900 italic">
                                            "{log.feedback}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Logbook Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Tambah Logbook Mingguan Baru
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Minggu Ke-
                                    </label>
                                    <input
                                        type="number"
                                        value={newLogbook.week}
                                        onChange={(e) =>
                                            setNewLogbook({
                                                ...newLogbook,
                                                week: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Minggu ke berapa?"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tanggal
                                    </label>
                                    <input
                                        type="date"
                                        value={newLogbook.date}
                                        onChange={(e) =>
                                            setNewLogbook({
                                                ...newLogbook,
                                                date: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Aktivitas Mingguan
                                    </label>
                                    <textarea
                                        value={newLogbook.activity}
                                        onChange={(e) =>
                                            setNewLogbook({
                                                ...newLogbook,
                                                activity: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        rows="4"
                                        placeholder="Deskripsikan kegiatan yang dilakukan selama minggu ini..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Foto Kegiatan (Opsional)
                                    </label>
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                        <div className="space-y-1 text-center">
                                            <Image className="mx-auto h-12 w-12 text-gray-400" />
                                            <div className="flex text-sm text-gray-600">
                                                <label
                                                    htmlFor="photo-upload"
                                                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                                >
                                                    <span>Unggah foto</span>
                                                    <input
                                                        id="photo-upload"
                                                        name="photo-upload"
                                                        type="file"
                                                        className="sr-only"
                                                        onChange={(e) =>
                                                            setNewLogbook({
                                                                ...newLogbook,
                                                                photo: e.target
                                                                    .files[0],
                                                            })
                                                        }
                                                    />
                                                </label>
                                                <p className="pl-1">
                                                    atau seret dan lepas
                                                </p>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                JPG, PNG hingga 5MB
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-200"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleAddLogbook}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200"
                                    >
                                        Simpan
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Logbook;
