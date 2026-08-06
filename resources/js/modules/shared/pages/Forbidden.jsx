import React from 'react';

const Forbidden = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
                <p className="text-gray-700 mb-6">Anda tidak memiliki hak akses ke halaman ini.</p>
                <a href="/dashboard" className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">
                    Kembali ke Dashboard
                </a>
            </div>
        </div>
    );
};

export default Forbidden;
