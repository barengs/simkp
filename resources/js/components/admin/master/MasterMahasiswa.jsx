import React, { useState } from "react";
import DataTable from "react-data-table-component";
import { Plus, Pencil, Trash2, Search, FileSpreadsheet } from "lucide-react";

const MasterMahasiswa = () => {
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
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

    const [newRecord, setNewRecord] = useState({
        nim: "",
        name: "",
        email: "",
        phone: "",
    });

    const handleAddRecord = () => {
        const record = {
            id: mahasiswa.length + 1,
            ...newRecord,
            status: "Aktif",
        };
        setMahasiswa([...mahasiswa, record]);
        setNewRecord({ nim: "", name: "", email: "", phone: "" });
        setShowModal(false);
    };

    const columns = [
        { name: "NIM", selector: (row) => row.nim, sortable: true },
        { name: "Nama", selector: (row) => row.name, sortable: true },
        { name: "Email", selector: (row) => row.email, sortable: true },
        { name: "Telepon", selector: (row) => row.phone, sortable: true },
        {
            name: "Status",
            selector: (row) => row.status,
            sortable: true,
            cell: (row) => (
                <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${row.status === "Aktif"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                        }`}
                >
                    {row.status}
                </span>
            ),
        },
        {
            name: "Aksi",
            cell: (row) => (
                <div className="flex space-x-2">
                    <button className="text-indigo-600 hover:text-indigo-900 p-1" title="Edit">
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900 p-1" title="Hapus">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    const filteredData = mahasiswa.filter((item) =>
        ["nim", "name", "email"].some(
            (field) =>
                item[field] &&
                item[field].toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <>
            <div className="space-y-6">
                <div className="border-b border-gray-200 pb-5">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Data Mahasiswa
                    </h2>
                </div>

                <div className="flex justify-between items-center">
                    <div className="w-1/3">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Cari mahasiswa..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <button className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200">
                            <FileSpreadsheet className="h-5 w-5 mr-2" />
                            Import Excel
                        </button>
                        <button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Tambah Mahasiswa
                        </button>
                    </div>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <DataTable
                            columns={columns}
                            data={filteredData}
                            pagination
                            paginationPerPage={10}
                            paginationRowsPerPageOptions={[10, 25, 50, 100]}
                            highlightOnHover
                            pointerOnHover
                            responsive
                        />
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Tambah Mahasiswa Baru
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        NIM
                                    </label>
                                    <input
                                        type="text"
                                        value={newRecord.nim}
                                        onChange={(e) =>
                                            setNewRecord({
                                                ...newRecord,
                                                nim: e.target.value,
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
                                        value={newRecord.name}
                                        onChange={(e) =>
                                            setNewRecord({
                                                ...newRecord,
                                                name: e.target.value,
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
                                        value={newRecord.email}
                                        onChange={(e) =>
                                            setNewRecord({
                                                ...newRecord,
                                                email: e.target.value,
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
                                        value={newRecord.phone}
                                        onChange={(e) =>
                                            setNewRecord({
                                                ...newRecord,
                                                phone: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="081234567890"
                                    />
                                </div>
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

export default MasterMahasiswa;
