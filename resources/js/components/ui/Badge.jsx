import React from 'react';

const statusStyles = {
    // KP status
    draft: 'bg-slate-100 text-slate-700 ring-slate-200',
    submitted: 'bg-amber-50 text-amber-700 ring-amber-200',
    approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    rejected: 'bg-rose-50 text-rose-700 ring-rose-200',
    ongoing: 'bg-blue-50 text-blue-700 ring-blue-200',
    grading: 'bg-purple-50 text-purple-700 ring-purple-200',
    finished: 'bg-slate-100 text-slate-800 ring-slate-200',
    // Logbook status
    logbook_submitted: 'bg-blue-50 text-blue-700 ring-blue-200',
    logbook_approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    revision: 'bg-amber-50 text-amber-800 ring-amber-300',
    // Umum
    aktif: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    tidak_aktif: 'bg-slate-100 text-slate-600 ring-slate-200',
    sukses: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    gagal: 'bg-rose-50 text-rose-700 ring-rose-200',
    // Peran
    ketua: 'bg-amber-50 text-amber-800 ring-amber-300 font-bold',
    anggota: 'bg-slate-100 text-slate-700 ring-slate-200',
};

const colorStyles = {
    gray: 'bg-slate-100 text-slate-700 ring-slate-200',
    blue: 'bg-blue-50 text-blue-700 ring-blue-200',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    red: 'bg-rose-50 text-rose-700 ring-rose-200',
    yellow: 'bg-amber-50 text-amber-800 ring-amber-200',
    purple: 'bg-purple-50 text-purple-700 ring-purple-200',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    amber: 'bg-amber-50 text-amber-800 ring-amber-200',
    orange: 'bg-orange-50 text-orange-700 ring-orange-200',
};

const Badge = ({ status, children, className = '' }) => {
    const normalized = String(status || '').toLowerCase().replace(/\s+/g, '_');
    const style = statusStyles[normalized] || colorStyles[normalized] || 'bg-slate-100 text-slate-700 ring-slate-200';

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ring-1 ${style} ${className}`}
        >
            {children || status}
        </span>
    );
};

export default Badge;
