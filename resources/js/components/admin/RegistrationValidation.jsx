import React, { useState } from "react";


const RegistrationValidation = () => {
    const [registrations, setRegistrations] = useState([
        {
            id: 1,
            studentName: "Rudi Hartono",
            studentNim: "1234567890",
            company: "PT. Teknologi Maju Jaya",
            theme: "Pengembangan Web Application",
            period: "KP Genap 2023/2024",
            status: "Menunggu Validasi",
            registrationDate: "2024-01-15",
            documents: ["Proposal", "KRS", "Kartu Mahasiswa"],
            notes: "Dokumen lengkap, menunggu verifikasi",
        },
        {
            id: 2,
            studentName: "Siti Nurhaliza",
            studentNim: "0987654321",
            company: "CV. Inovasi Digital",
            theme: "Mobile Application Development",
            period: "KP Genap 2023/2024",
            status: "Ditolak",
            registrationDate: "2024-01-14",
            documents: ["Proposal", "KRS"],
            notes: "Dokumen KTM belum diunggah",
        },
        {
            id: 3,
            studentName: "Ahmad Fauzi",
            studentNim: "1122334455",
            company: "PT. Solusi Kreatif",
            theme: "Data Science & Analytics",
            period: "KP Genap 2023/2024",
            status: "Disetujui",
            registrationDate: "2024-01-13",
            documents: [
                "Proposal",
                "KRS",
                "Kartu Mahasiswa",
                "Surat Rekomendasi",
            ],
            notes: "Semua dokumen valid",
        },
    ]);

    const [selectedRegistration, setSelectedRegistration] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showActionModal, setShowActionModal] = useState(false);
    const [action, setAction] = useState(""); // 'approve' or 'reject'
    const [notes, setNotes] = useState("");

    const handleAction = (regId, actionType) => {
        const registration = registrations.find((r) => r.id === regId);
        setSelectedRegistration(registration);
        setAction(actionType);
        setShowActionModal(true);
    };

    const confirmAction = () => {
        setRegistrations((prev) =>
            prev.map((reg) => {
                if (reg.id === selectedRegistration.id) {
                    return {
                        ...reg,
                        status: action === "approve" ? "Disetujui" : "Ditolak",
                        notes: notes || reg.notes,
                    };
                }
                return reg;
            })
        );
        setShowActionModal(false);
        setNotes("");
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
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Daftar Pendaftaran KP
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            Daftar pendaftaran kerja praktek yang menunggu
                            validasi
                        </p>
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
                                            Perusahaan
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tema
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Periode
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tanggal
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {registrations.map((registration) => (
                                        <tr key={registration.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {registration.studentName}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {registration.studentNim}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {registration.company}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {registration.theme}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {registration.period}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                                        registration.status
                                                    )}`}
                                                >
                                                    {registration.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {registration.registrationDate}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => {
                                                        setSelectedRegistration(
                                                            registration
                                                        );
                                                        setShowDetailModal(
                                                            true
                                                        );
                                                    }}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                >
                                                    Detail
                                                </button>
                                                {registration.status ===
                                                    "Menunggu Validasi" && (
                                                    <>
                                                        <button
                                                            onClick={() =>
                                                                handleAction(
                                                                    registration.id,
                                                                    "approve"
                                                                )
                                                            }
                                                            className="text-green-600 hover:text-green-900 mr-2"
                                                        >
                                                            Setujui
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleAction(
                                                                    registration.id,
                                                                    "reject"
                                                                )
                                                            }
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Tolak
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Registration Detail Modal */}
            {showDetailModal && selectedRegistration && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Detail Pendaftaran
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
                                            {selectedRegistration.studentName}
                                        </p>
                                        <p>
                                            <span className="font-medium">
                                                NIM:
                                            </span>{" "}
                                            {selectedRegistration.studentNim}
                                        </p>
                                        <p>
                                            <span className="font-medium">
                                                Status:
                                            </span>
                                            <span
                                                className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                                    selectedRegistration.status
                                                )}`}
                                            >
                                                {selectedRegistration.status}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-md font-medium text-gray-900 mb-2">
                                        Detail KP
                                    </h4>
                                    <div className="space-y-2">
                                        <p>
                                            <span className="font-medium">
                                                Perusahaan:
                                            </span>{" "}
                                            {selectedRegistration.company}
                                        </p>
                                        <p>
                                            <span className="font-medium">
                                                Tema:
                                            </span>{" "}
                                            {selectedRegistration.theme}
                                        </p>
                                        <p>
                                            <span className="font-medium">
                                                Periode:
                                            </span>{" "}
                                            {selectedRegistration.period}
                                        </p>
                                        <p>
                                            <span className="font-medium">
                                                Tanggal Pendaftaran:
                                            </span>{" "}
                                            {
                                                selectedRegistration.registrationDate
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-md font-medium text-gray-900 mb-2">
                                    Dokumen yang Diunggah
                                </h4>
                                <ul className="list-disc pl-5 space-y-1">
                                    {selectedRegistration.documents.map(
                                        (doc, index) => (
                                            <li
                                                key={index}
                                                className="text-sm text-gray-600"
                                            >
                                                {doc}
                                            </li>
                                        )
                                    )}
                                </ul>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-md font-medium text-gray-900 mb-2">
                                    Catatan
                                </h4>
                                <p className="text-sm text-gray-600">
                                    {selectedRegistration.notes}
                                </p>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                {selectedRegistration.status ===
                                    "Menunggu Validasi" && (
                                    <>
                                        <button
                                            onClick={() => {
                                                handleAction(
                                                    selectedRegistration.id,
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
                                                    selectedRegistration.id,
                                                    "reject"
                                                );
                                                setShowDetailModal(false);
                                            }}
                                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
                                        >
                                            Tolak
                                        </button>
                                    </>
                                )}
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

            {/* Action Confirmation Modal */}
            {showActionModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {action === "approve"
                                    ? "Setujui Pendaftaran"
                                    : "Tolak Pendaftaran"}
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Apakah Anda yakin ingin{" "}
                                {action === "approve"
                                    ? "menyetujui"
                                    : "menolak"}{" "}
                                pendaftaran KP untuk:
                            </p>
                            <p className="font-medium">
                                {selectedRegistration?.studentName} (
                                {selectedRegistration?.studentNim})
                            </p>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Catatan (Opsional)
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    rows="3"
                                    placeholder="Tambahkan catatan atau alasan..."
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    onClick={() => {
                                        setShowActionModal(false);
                                        setNotes("");
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
                                    {action === "approve" ? "Setujui" : "Tolak"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default RegistrationValidation;
