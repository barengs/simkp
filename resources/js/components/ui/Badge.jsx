import React from 'react';

const statusStyles = {
    // KP status
    draft: 'bg-gray-100 text-gray-700 border-gray-200',
    submitted: 'bg-blue-100 text-blue-700 border-blue-200',
    approved: 'bg-green-100 text-green-700 border-green-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
    ongoing: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    grading: 'bg-purple-100 text-purple-700 border-purple-200',
    finished: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    // Logbook status
    logbook_submitted: 'bg-blue-100 text-blue-700 border-blue-200',
    logbook_approved: 'bg-green-100 text-green-700 border-green-200',
    revision: 'bg-orange-100 text-orange-700 border-orange-200',
    // Umum
    aktif: 'bg-green-100 text-green-700 border-green-200',
    tidak_aktif: 'bg-gray-100 text-gray-600 border-gray-200',
    sukses: 'bg-green-100 text-green-700 border-green-200',
    gagal: 'bg-red-100 text-red-700 border-red-200',
    // Peran
    ketua: 'bg-amber-100 text-amber-700 border-amber-200',
    anggota: 'bg-gray-100 text-gray-700 border-gray-200',
};

const colorStyles = {
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    green: 'bg-green-100 text-green-700 border-green-200',
    red: 'bg-red-100 text-red-700 border-red-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    orange: 'bg-orange-100 text-orange-700 border-orange-200',
};

const Badge = ({ status, children, className = '' }) => {
    const normalized = String(status || '').toLowerCase().replace(/\s+/g, '_');
    const style = statusStyles[normalized] || colorStyles[normalized] || 'bg-gray-100 text-gray-700 border-gray-200';

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style} ${className}`}
        >
            {children || status}
        </span>
    );
};

export default Badge;
