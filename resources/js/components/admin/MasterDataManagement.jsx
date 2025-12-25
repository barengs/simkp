import React, { useState } from "react";


const MasterDataManagement = () => {
    const [activeTab, setActiveTab] = useState("dosen");
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("dosen");
    const [searchTerm, setSearchTerm] = useState("");

    // Mock data
    const [dosen, setDosen] = useState([
        {
            id: 1,
            nip: "123456789",
            name: "Dr. Budi Santoso, S.T., M.T.",
            email: "budi@university.ac.id",
            phone: "081234567890",
            status: "Aktif",
        },
        {
            id: 2,
            nip: "987654321",
            name: "Prof. Ani Lestari, S.T., Ph.D.",
            email: "ani@university.ac.id",
            phone: "081234567891",
            status: "Aktif",
        },
    ]);

    const [mahasiswa, setMahasiswa] = useState([
        {
            id: 1,
            nim: "1234567890",
            name: "Rudi Hartono",
            email: "rudi@student.university.ac.id",
            phone: "081234567892",
            status: "Aktif",
        },
        {
            id: 2,
            nim: "0987654321",
            name: "Siti Nurhaliza",
            email: "siti@student.university.ac.id",
            phone: "081234567893",
            status: "Aktif",
        },
    ]);

    const [mitra, setMitra] = useState([
        {
            id: 1,
            name: "PT. Teknologi Maju Jaya",
            address: "Jl. Sudirman No. 123, Jakarta",
            contactPerson: "Bapak Joko",
            phone: "021-12345678",
            status: "Aktif",
        },
        {
            id: 2,
            name: "CV. Inovasi Digital",
            address: "Jl. Gatot Subroto No. 45, Bandung",
            contactPerson: "Ibu Sari",
            phone: "022-87654321",
            status: "Aktif",
        },
    ]);

    const [newRecord, setNewRecord] = useState({
        dosen: { nip: "", name: "", email: "", phone: "" },
        mahasiswa: { nim: "", name: "", email: "", phone: "" },
        mitra: { name: "", address: "", contactPerson: "", phone: "" },
    });

    const handleAddRecord = () => {
        if (modalType === "dosen") {
            const record = {
                id: dosen.length + 1,
                ...newRecord.dosen,
                status: "Aktif",
            };
            setDosen([...dosen, record]);
        } else if (modalType === "mahasiswa") {
            const record = {
                id: mahasiswa.length + 1,
                ...newRecord.mahasiswa,
                status: "Aktif",
            };
            setMahasiswa([...mahasiswa, record]);
        } else if (modalType === "mitra") {
            const record = {
                id: mitra.length + 1,
                ...newRecord.mitra,
                status: "Aktif",
            };
            setMitra([...mitra, record]);
        }

        setNewRecord({
            dosen: { nip: "", name: "", email: "", phone: "" },
            mahasiswa: { nim: "", name: "", email: "", phone: "" },
            mitra: { name: "", address: "", contactPerson: "", phone: "" },
        });
        setShowModal(false);
    };

    const renderTable = () => {
        let data = [];
        let columns = [];
        let searchFields = [];

        switch (activeTab) {
            case "dosen":
                data = dosen;
                columns = [
                    { key: "nip", label: "NIP" },
                    { key: "name", label: "Nama" },
                    { key: "email", label: "Email" },
                    { key: "phone", label: "Telepon" },
                    { key: "status", label: "Status" },
                ];
                searchFields = ["nip", "name", "email"];
                break;
            case "mahasiswa":
                data = mahasiswa;
                columns = [
                    { key: "nim", label: "NIM" },
                    { key: "name", label: "Nama" },
                    { key: "email", label: "Email" },
                    { key: "phone", label: "Telepon" },
                    { key: "status", label: "Status" },
                ];
                searchFields = ["nim", "name", "email"];
                break;
            case "mitra":
                data = mitra;
                columns = [
                    { key: "name", label: "Nama Mitra" },
                    { key: "address", label: "Alamat" },
                    { key: "contactPerson", label: "Kontak" },
                    { key: "phone", label: "Telepon" },
                    { key: "status", label: "Status" },
                ];
                searchFields = ["name", "contactPerson"];
                break;
            default:
                data = [];
        }

        // Filter data based on search term
        const filteredData = data.filter((item) =>
            searchFields.some(
                (field) =>
                    item[field] &&
                    item[field].toLowerCase().includes(searchTerm.toLowerCase())
            )
        );

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    {column.label}
                                </th>
                            ))}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredData.map((item) => (
                            <tr key={item.id}>
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                    >
                                        {column.key === "status" ? (
                                            <span
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    item.status === "Aktif"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {item.status}
                                            </span>
                                        ) : (
                                            item[column.key]
                                        )}
                                    </td>
                                ))}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                                        Edit
                                    </button>
                                    <button className="text-red-600 hover:text-red-900">
                                        Hapus
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderFormFields = () => {
        switch (modalType) {
            case "dosen":
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                NIP
                            </label>
                            <input
                                type="text"
                                value={newRecord.dosen.nip}
                                onChange={(e) =>
                                    setNewRecord({
                                        ...newRecord,
                                        dosen: {
                                            ...newRecord.dosen,
                                            nip: e.target.value,
                                        },
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="NIP Dosen"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nama
                            </label>
                            <input
                                type="text"
                                value={newRecord.dosen.name}
                                onChange={(e) =>
                                    setNewRecord({
                                        ...newRecord,
                                        dosen: {
                                            ...newRecord.dosen,
                                            name: e.target.value,
                                        },
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Nama Lengkap"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={newRecord.dosen.email}
                                onChange={(e) =>
                                    setNewRecord({
                                        ...newRecord,
                                        dosen: {
                                            ...newRecord.dosen,
                                            email: e.target.value,
                                        },
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="email@university.ac.id"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Telepon
                            </label>
                            <input
                                type="text"
                                value={newRecord.dosen.phone}
                                onChange={(e) =>
                                    setNewRecord({
                                        ...newRecord,
                                        dosen: {
                                            ...newRecord.dosen,
                                            phone: e.target.value,
                                        },
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="081234567890"
                            />
                        </div>
                    </>
                );
            case "mahasiswa":
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                NIM
                            </label>
                            <input
                                type="text"
                                value={newRecord.mahasiswa.nim}
                                onChange={(e) =>
                                    setNewRecord({
                                        ...newRecord,
                                        mahasiswa: {
                                            ...newRecord.mahasiswa,
                                            nim: e.target.value,
                                        },
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="NIM Mahasiswa"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nama
                            </label>
                            <input
                                type="text"
                                value={newRecord.mahasiswa.name}
                                onChange={(e) =>
                                    setNewRecord({
                                        ...newRecord,
                                        mahasiswa: {
                                            ...newRecord.mahasiswa,
                                            name: e.target.value,
                                        },
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Nama Lengkap"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={newRecord.mahasiswa.email}
                                onChange={(e) =>
                                    setNewRecord({
                                        ...newRecord,
                                        mahasiswa: {
                                            ...newRecord.mahasiswa,
                                            email: e.target.value,
                                        },
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="email@student.university.ac.id"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Telepon
                            </label>
                            <input
                                type="text"
                                value={newRecord.mahasiswa.phone}
                                onChange={(e) =>
                                    setNewRecord({
                                        ...newRecord,
                                        mahasiswa: {
                                            ...newRecord.mahasiswa,
                                            phone: e.target.value,
                                        },
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="081234567890"
                            />
                        </div>
                    </>
                );
            case "mitra":
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nama Mitra/Perusahaan
                            </label>
                            <input
                                type="text"
                                value={newRecord.mitra.name}
                                onChange={(e) =>
                                    setNewRecord({
                                        ...newRecord,
                                        mitra: {
                                            ...newRecord.mitra,
                                            name: e.target.value,
                                        },
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Nama Perusahaan"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Alamat
                            </label>
                            <textarea
                                value={newRecord.mitra.address}
                                onChange={(e) =>
                                    setNewRecord({
                                        ...newRecord,
                                        mitra: {
                                            ...newRecord.mitra,
                                            address: e.target.value,
                                        },
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Alamat Lengkap"
                                rows="2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Kontak Person
                            </label>
                            <input
                                type="text"
                                value={newRecord.mitra.contactPerson}
                                onChange={(e) =>
                                    setNewRecord({
                                        ...newRecord,
                                        mitra: {
                                            ...newRecord.mitra,
                                            contactPerson: e.target.value,
                                        },
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Nama Kontak"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Telepon
                            </label>
                            <input
                                type="text"
                                value={newRecord.mitra.phone}
                                onChange={(e) =>
                                    setNewRecord({
                                        ...newRecord,
                                        mitra: {
                                            ...newRecord.mitra,
                                            phone: e.target.value,
                                        },
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="021-12345678"
                            />
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <div className="space-y-6">
                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab("dosen")}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === "dosen"
                                    ? "border-indigo-500 text-indigo-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            Dosen
                        </button>
                        <button
                            onClick={() => setActiveTab("mahasiswa")}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === "mahasiswa"
                                    ? "border-indigo-500 text-indigo-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            Mahasiswa
                        </button>
                        <button
                            onClick={() => setActiveTab("mitra")}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === "mitra"
                                    ? "border-indigo-500 text-indigo-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            Mitra/Perusahaan
                        </button>
                    </nav>
                </div>

                {/* Search and Add Button */}
                <div className="flex justify-between items-center">
                    <div className="w-1/3">
                        <input
                            type="text"
                            placeholder={`Cari ${
                                activeTab === "dosen"
                                    ? "dosen"
                                    : activeTab === "mahasiswa"
                                    ? "mahasiswa"
                                    : "mitra"
                            }...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div className="flex space-x-3">
                        {activeTab === "mahasiswa" && (
                            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200">
                                Import Excel
                            </button>
                        )}
                        <button
                            onClick={() => {
                                setModalType(activeTab);
                                setShowModal(true);
                            }}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
                        >
                            Tambah{" "}
                            {activeTab === "dosen"
                                ? "Dosen"
                                : activeTab === "mahasiswa"
                                ? "Mahasiswa"
                                : "Mitra"}
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">{renderTable()}</div>
                </div>
            </div>

            {/* Add Record Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Tambah{" "}
                                {modalType === "dosen"
                                    ? "Dosen"
                                    : modalType === "mahasiswa"
                                    ? "Mahasiswa"
                                    : "Mitra"}{" "}
                                Baru
                            </h3>
                            <div className="space-y-4">
                                {renderFormFields()}
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-200"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleAddRecord}
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

export default MasterDataManagement;
