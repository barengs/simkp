import React from 'react';

const statusStyles = {
    // KP status
    draft: 'bg-gray-100 text-gray-700 border-gray-200',
    diajukan: 'bg-blue-100 text-blue-700 border-blue-200',
    menunggu_validasi: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    disetujui: 'bg-green-100 text-green-700 border-green-200',
    ditolak: 'bg-red-100 text-red-700 border-red-200',
    berjalan: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    laporan_masuk: 'bg-purple-100 text-purple-700 border-purple-200',
    revisi_laporan: 'bg-orange-100 text-orange-700 border-orange-200',
    dinilai: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    selesai: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    // Logbook status
    submitted: 'bg-blue-100 text-blue-700 border-blue-200',
    approved: 'bg-green-100 text-green-700 border-green-200',
    revision: 'bg-orange-100 text-orange-700 border-orange-200',
    // Umum
    aktif: 'bg-green-100 text-green-700 border-green-200',
    tidak_aktif: 'bg-gray-100 text-gray-600 border-gray-200',
    sukses: 'bg-green-100 text-green-700 border-green-200',
    gagal: 'bg-red-100 text-red-700 border-red-200',
};

const Badge = ({ status, children, className = '' }) => {
    const normalized = String(status || '').toLowerCase().replace(/\s+/g, '_');
    const style = statusStyles[normalized] || 'bg-gray-100 text-gray-700 border-gray-200';

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style} ${className}`}
        >
            {children || status}
        </span>
    );
};

export default Badge;
