import React, { useState } from "react";


const PeriodThemeManagement = () => {
    const [periods, setPeriods] = useState([
        {
            id: 1,
            name: "KP Genap 2023/2024",
            startDate: "2024-02-01",
            endDate: "2024-07-31",
            status: "Aktif",
        },
        {
            id: 2,
            name: "KP Ganjil 2023/2024",
            startDate: "2023-08-01",
            endDate: "2023-12-31",
            status: "Selesai",
        },
    ]);

    const [themes, setThemes] = useState([
        {
            id: 1,
            name: "Pengembangan Web Application",
            year: "2024",
            status: "Aktif",
        },
        {
            id: 2,
            name: "Mobile Application Development",
            year: "2024",
            status: "Aktif",
        },
        {
            id: 3,
            name: "Data Science & Analytics",
            year: "2023",
            status: "Tidak Aktif",
        },
    ]);

    const [showPeriodModal, setShowPeriodModal] = useState(false);
    const [showThemeModal, setShowThemeModal] = useState(false);
    const [newPeriod, setNewPeriod] = useState({
        name: "",
        startDate: "",
        endDate: "",
    });
    const [newTheme, setNewTheme] = useState({ name: "", year: "" });

    const handleAddPeriod = () => {
        const period = {
            id: periods.length + 1,
            ...newPeriod,
            status: "Aktif",
        };
        setPeriods([...periods, period]);
        setNewPeriod({ name: "", startDate: "", endDate: "" });
        setShowPeriodModal(false);
    };

    const handleAddTheme = () => {
        const theme = {
            id: themes.length + 1,
            ...newTheme,
            status: "Aktif",
        };
        setThemes([...themes, theme]);
        setNewTheme({ name: "", year: "" });
        setShowThemeModal(false);
    };

    return (
        <>
            <div className="space-y-6">
                {/* Period Management */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Manajemen Periode KP
                            </h3>
                            <button
                                onClick={() => setShowPeriodModal(true)}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
                            >
                                Tambah Periode
                            </button>
                        </div>
                    </div>
                    <div className="px-4 py-5 sm:p-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nama Periode
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tanggal Mulai
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tanggal Selesai
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
                                    {periods.map((period) => (
                                        <tr key={period.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {period.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {period.startDate}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {period.endDate}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        period.status ===
                                                        "Aktif"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                    }`}
                                                >
                                                    {period.status}
                                                </span>
                                            </td>
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
                    </div>
                </div>

                {/* Theme Management */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Manajemen Tema KP
                            </h3>
                            <button
                                onClick={() => setShowThemeModal(true)}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
                            >
                                Tambah Tema
                            </button>
                        </div>
                    </div>
                    <div className="px-4 py-5 sm:p-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nama Tema
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tahun
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
                                    {themes.map((theme) => (
                                        <tr key={theme.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {theme.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {theme.year}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        theme.status === "Aktif"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-gray-100 text-gray-800"
                                                    }`}
                                                >
                                                    {theme.status}
                                                </span>
                                            </td>
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
                    </div>
                </div>
            </div>

            {/* Add Period Modal */}
            {showPeriodModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Tambah Periode KP Baru
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nama Periode
                                    </label>
                                    <input
                                        type="text"
                                        value={newPeriod.name}
                                        onChange={(e) =>
                                            setNewPeriod({
                                                ...newPeriod,
                                                name: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Contoh: KP Genap 2024/2025"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tanggal Mulai
                                        </label>
                                        <input
                                            type="date"
                                            value={newPeriod.startDate}
                                            onChange={(e) =>
                                                setNewPeriod({
                                                    ...newPeriod,
                                                    startDate: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tanggal Selesai
                                        </label>
                                        <input
                                            type="date"
                                            value={newPeriod.endDate}
                                            onChange={(e) =>
                                                setNewPeriod({
                                                    ...newPeriod,
                                                    endDate: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        onClick={() =>
                                            setShowPeriodModal(false)
                                        }
                                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-200"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleAddPeriod}
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

            {/* Add Theme Modal */}
            {showThemeModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Tambah Tema KP Baru
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nama Tema
                                    </label>
                                    <input
                                        type="text"
                                        value={newTheme.name}
                                        onChange={(e) =>
                                            setNewTheme({
                                                ...newTheme,
                                                name: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Contoh: Pengembangan Web Application"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tahun
                                    </label>
                                    <input
                                        type="number"
                                        value={newTheme.year}
                                        onChange={(e) =>
                                            setNewTheme({
                                                ...newTheme,
                                                year: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Contoh: 2024"
                                    />
                                </div>
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        onClick={() => setShowThemeModal(false)}
                                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-200"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleAddTheme}
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

export default PeriodThemeManagement;
