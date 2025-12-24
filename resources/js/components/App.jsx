import React, { useState } from "react";

const App = () => {
    const [count, setCount] = useState(0);

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-gray-800">
                                SIMKP - Sistem Informasi Kerja Praktek
                            </h1>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h2 className="text-2xl font-semibold mb-4">
                            Selamat Datang di SIMKP
                        </h2>
                        <p className="mb-4">
                            Sistem Informasi Manajemen Kerja Praktek Mahasiswa
                        </p>

                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <p className="text-gray-700">
                                Status:{" "}
                                <span className="font-medium">
                                    React telah terintegrasi dengan Laravel
                                </span>
                            </p>
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={() => setCount(count + 1)}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Counter: {count}
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="bg-white mt-8 py-4 border-t">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
                    <p>
                        © {new Date().getFullYear()} SIMKP - Sistem Informasi
                        Kerja Praktek
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default App;
