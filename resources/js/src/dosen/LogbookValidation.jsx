import React, { useState } from "react";


const LogbookValidation = () => {
    const [logbooks, setLogbooks] = useState([
        {
            id: 1,
            studentName: "Rudi Hartono",
            studentNim: "1234567890",
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
            studentName: "Siti Nurhaliza",
            studentNim: "0987654321",
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
            studentName: "Ahmad Fauzi",
            studentNim: "1122334455",
            week: 3,
            date: "2024-02-19",
            activity:
                "Mengikuti pelatihan teknologi yang digunakan di perusahaan",
            status: "Menunggu Validasi",
            feedback: "",
            photo: null,
        },
        {
            id: 4,
            studentName: "Budi Santoso",
            studentNim: "2233445566",
            week: 2,
            date: "2024-02-12",
            activity: "Membantu implementasi modul login pada sistem",
            status: "Menunggu Validasi",
            feedback: "",
            photo: "https://via.placeholder.com/150",
        },
    ]);

    const [selectedLogbook, setSelectedLogbook] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [action, setAction] = useState(""); // 'approve' or 'reject'

    const handleAction = (logbookId, actionType) => {
        const logbook = logbooks.find((l) => l.id === logbookId);
        setSelectedLogbook(logbook);
        setAction(actionType);
        setFeedback("");
        setShowFeedbackModal(true);
    };

    const confirmAction = () => {
        setLogbooks((prev) =>
            prev.map((log) => {
                if (log.id === selectedLogbook.id) {
                    return {
                        ...log,
                        status:
                            action === "approve"
                                ? "Disetujui"
                                : "Perlu Perbaikan",
                        feedback:
                            feedback || "Perlu perbaikan sesuai masukan dosen",
                    };
                }
                return log;
            })
        );
        setShowFeedbackModal(false);
        setFeedback("");
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Disetujui":
                return "bg-green-100 text-green-800";
            case "Perlu Perbaikan":
                return "bg-red-100 text-red-800";
            case "Menunggu Validasi":
                return "bg-yellow-100 text-yellow-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const pendingLogbooks = logbooks.filter(
        (log) => log.status === "Menunggu Validasi"
    );
    const approvedLogbooks = logbooks.filter(
        (log) => log.status === "Disetujui"
    );
    const needsRevisionLogbooks = logbooks.filter(
        (log) => log.status === "Perlu Perbaikan"
    );

    const [searchTerm, setSearchTerm] = useState("");

    const filteredPending = pendingLogbooks.filter((log) =>
        [log.studentName, log.studentNim].some((field) =>
            field.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <>
            <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* ... stats ... */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                                <div className="text-yellow-600 text-lg font-bold">
                                    {pendingLogbooks.length}
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Menunggu Validasi
                                    </dt>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                                <div className="text-green-600 text-lg font-bold">
                                    {approvedLogbooks.length}
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Disetujui
                                    </dt>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                                <div className="text-red-600 text-lg font-bold">
                                    {needsRevisionLogbooks.length}
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Perlu Perbaikan
                                    </dt>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs, Search & Table */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="border-b border-gray-200 px-4 pt-5 sm:px-6">
                        <div className="flex justify-between items-center mb-4">
                             <nav className="-mb-px flex space-x-6">
                                <button className="whitespace-nowrap pb-4 border-b-2 font-medium text-sm border-indigo-500 text-indigo-600">
                                    Menunggu Validasi ({pendingLogbooks.length})
                                </button>
                                {/* Other tabs can be active if implementing full tab switching logic, for now static display based on original code structure which focused on Pending View */}
                            </nav>
                            <div className="w-1/3 pb-4">
                                <input
                                    type="text"
                                    placeholder="Cari mahasiswa..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="px-4 py-5 sm:p-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Mahasiswa
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Minggu
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tanggal
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredPending.map((logbook) => (
                                        <tr key={logbook.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {logbook.studentName}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {logbook.studentNim}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                Minggu {logbook.week}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {logbook.date}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                                        logbook.status
                                                    )}`}
                                                >
                                                    {logbook.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedLogbook(logbook);
                                                            setShowDetailModal(true);
                                                        }}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                        title="Detail"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(logbook.id, "approve")}
                                                        className="text-green-600 hover:text-green-900"
                                                        title="Setujui"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(logbook.id, "reject")}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Revisi"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logbook Detail Modal */}
            {showDetailModal && selectedLogbook && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Detail Logbook
                                </h3>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <span className="text-2xl">&times;</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h4 className="text-md font-medium text-gray-900 mb-2">
                                        Informasi Mahasiswa
                                    </h4>
                                    <div className="space-y-2">
                                        <p>
                                            <span className="font-medium">
                                                Nama:
                                            </span>{" "}
                                            {selectedLogbook.studentName}
                                        </p>
                                        <p>
                                            <span className="font-medium">
                                                NIM:
                                            </span>{" "}
                                            {selectedLogbook.studentNim}
                                        </p>
                                        <p>
                                            <span className="font-medium">
                                                Minggu:
                                            </span>{" "}
                                            {selectedLogbook.week}
                                        </p>
                                        <p>
                                            <span className="font-medium">
                                                Tanggal:
                                            </span>{" "}
                                            {selectedLogbook.date}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-md font-medium text-gray-900 mb-2">
                                        Status
                                    </h4>
                                    <div className="space-y-2">
                                        <p>
                                            <span className="font-medium">
                                                Status:
                                            </span>
                                            <span
                                                className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                                    selectedLogbook.status
                                                )}`}
                                            >
                                                {selectedLogbook.status}
                                            </span>
                                        </p>
                                        {selectedLogbook.feedback && (
                                            <p>
                                                <span className="font-medium">
                                                    Feedback:
                                                </span>{" "}
                                                {selectedLogbook.feedback}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-md font-medium text-gray-900 mb-2">
                                    Aktivitas Mingguan
                                </h4>
                                <p className="text-gray-700">
                                    {selectedLogbook.activity}
                                </p>
                            </div>

                            {selectedLogbook.photo && (
                                <div className="mb-6">
                                    <h4 className="text-md font-medium text-gray-900 mb-2">
                                        Foto Kegiatan
                                    </h4>
                                    <img
                                        src={selectedLogbook.photo}
                                        alt="Aktivitas mingguan"
                                        className="w-full h-64 object-cover rounded-md"
                                    />
                                </div>
                            )}

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    onClick={() => {
                                        handleAction(
                                            selectedLogbook.id,
                                            "approve"
                                        );
                                        setShowDetailModal(false);
                                    }}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200"
                                >
                                    Setujui
                                </button>
                                <button
                                    onClick={() => {
                                        handleAction(
                                            selectedLogbook.id,
                                            "reject"
                                        );
                                        setShowDetailModal(false);
                                    }}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
                                >
                                    Perlu Revisi
                                </button>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-200"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Feedback Modal */}
            {showFeedbackModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {action === "approve"
                                    ? "Setujui Logbook"
                                    : "Revisi Logbook"}
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                {action === "approve"
                                    ? `Apakah Anda yakin ingin menyetujui logbook minggu ${selectedLogbook?.week} milik ${selectedLogbook?.studentName}?`
                                    : `Berikan masukan untuk logbook minggu ${selectedLogbook?.week} milik ${selectedLogbook?.studentName}:`}
                            </p>

                            {action === "reject" && (
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Catatan Revisi
                                    </label>
                                    <textarea
                                        value={feedback}
                                        onChange={(e) =>
                                            setFeedback(e.target.value)
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        rows="4"
                                        placeholder="Tulis masukan atau saran perbaikan..."
                                    />
                                </div>
                            )}

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    onClick={() => {
                                        setShowFeedbackModal(false);
                                        setFeedback("");
                                    }}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-200"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmAction}
                                    className={`px-4 py-2 text-white rounded-md transition duration-200 ${
                                        action === "approve"
                                            ? "bg-green-600 hover:bg-green-700"
                                            : "bg-red-600 hover:bg-red-700"
                                    }`}
                                >
                                    {action === "approve"
                                        ? "Setujui"
                                        : "Kirim Revisi"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default LogbookValidation;
