import React, { useMemo } from 'react';
import DataTable from 'react-data-table-component';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/* =========================================================
 * HELPER GENERATOR ITEM PAGINASI DENGAN ELLIPSIS (...)
 * Contoh output saat currentPage 5 dari 9 total:
 * [1, '...', 4, 5, 6, '...', 9]
 * ========================================================= */
const getPaginationItems = (currentPage, totalPages) => {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
        return [1, 2, 3, 4, 5, '...', totalPages];
    }

    if (currentPage >= totalPages - 3) {
        return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
};

/* =========================================================
 * KOMPONEN PAGINASI MODERN
 * Kiri : Total Halaman & Data
 * Kanan: <  1  ...  4  5  6  ...  9  >
 * ========================================================= */
const CustomPagination = ({
    rowsPerPage = 10,
    rowCount = 0,
    onChangePage,
    onChangeRowsPerPage,
    currentPage = 1,
    paginationRowsPerPageOptions = [10, 15, 20, 25, 30],
}) => {
    const effectiveRowsPerPage = rowsPerPage || 10;
    const totalPages = Math.max(1, Math.ceil(rowCount / effectiveRowsPerPage));
    const from = rowCount === 0 ? 0 : (currentPage - 1) * effectiveRowsPerPage + 1;
    const to = Math.min(currentPage * effectiveRowsPerPage, rowCount);

    const paginationItems = useMemo(
        () => getPaginationItems(currentPage, totalPages),
        [currentPage, totalPages]
    );

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5 px-5 py-3.5 border-t border-slate-200/80 bg-white select-none">
            {/* SISI KIRI: Total Page & Ringkasan Data */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">
                    Menampilkan <span className="font-bold text-slate-900">{from}</span>–<span className="font-bold text-slate-900">{to}</span> dari <span className="font-bold text-slate-900">{rowCount}</span> data
                </span>
                <span className="text-slate-300">•</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-bold text-[11px]">
                    Total {totalPages} Halaman
                </span>

                {/* Dropdown Jumlah Baris per Halaman */}
                {paginationRowsPerPageOptions && paginationRowsPerPageOptions.length > 0 && (
                    <div className="hidden md:flex items-center gap-1.5 ml-1">
                        <span className="text-slate-400">Tampilkan:</span>
                        <select
                            value={effectiveRowsPerPage}
                            onChange={(e) => onChangeRowsPerPage && onChangeRowsPerPage(Number(e.target.value), currentPage)}
                            className="px-2 py-1 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                        >
                            {paginationRowsPerPageOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt} baris
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* SISI KANAN: Navigasi Nomor Halaman < 1 ... 4 5 6 ... 9 > */}
            <div className="flex items-center gap-1.5 self-center sm:self-auto">
                {/* Tombol Sebelumnya < */}
                <button
                    type="button"
                    onClick={() => onChangePage && onChangePage(currentPage - 1, rowCount)}
                    disabled={currentPage <= 1}
                    aria-label="Halaman Sebelumnya"
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-2xs"
                >
                    <ChevronLeft className="w-4 h-4 stroke-[2.2]" />
                </button>

                {/* Daftar Nomor Halaman dengan Ellipsis (...) */}
                {paginationItems.map((item, idx) => {
                    if (item === '...') {
                        return (
                            <span
                                key={`ellipsis-${idx}`}
                                className="w-6 h-8 flex items-center justify-center text-xs text-slate-400 font-bold tracking-widest select-none"
                            >
                                ...
                            </span>
                        );
                    }

                    const isActive = item === currentPage;
                    return (
                        <button
                            type="button"
                            key={`page-${item}`}
                            onClick={() => onChangePage && onChangePage(item, rowCount)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                                isActive
                                    ? 'bg-emerald-600 text-white border border-emerald-600 ring-2 ring-emerald-500/20'
                                    : 'border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
                            }`}
                        >
                            {item}
                        </button>
                    );
                })}

                {/* Tombol Selanjutnya > */}
                <button
                    type="button"
                    onClick={() => onChangePage && onChangePage(currentPage + 1, rowCount)}
                    disabled={currentPage >= totalPages || totalPages === 0}
                    aria-label="Halaman Selanjutnya"
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-2xs"
                >
                    <ChevronRight className="w-4 h-4 stroke-[2.2]" />
                </button>
            </div>
        </div>
    );
};

/* =========================================================
 * STYLING DEFAULT TABEL
 * ========================================================= */
const customStyles = {
    headRow: {
        style: {
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            borderBottom: '1px solid #e2e8f0',
            minHeight: '44px',
        },
    },
    headCells: {
        style: {
            fontSize: '11px',
            fontWeight: '700',
            color: '#475569',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            paddingLeft: '16px',
            paddingRight: '16px',
        },
    },
    rows: {
        style: {
            fontSize: '13px',
            color: '#334155',
            minHeight: '52px',
            '&:hover': {
                backgroundColor: '#f0fdf4',
            },
        },
    },
};

const DataTableWrapper = ({ columns, data, loading, emptyMessage, ...props }) => {
    const mappedColumns = useMemo(() => {
        return (columns || []).map((col) => ({
            ...col,
            id: col.id || col.key,
            name: col.name || col.label,
            cell: col.cell || col.render,
            selector: col.selector || (col.key ? (row) => row[col.key] : undefined),
        }));
    }, [columns]);

    const noDataComponent = emptyMessage ? (
        <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
            {emptyMessage}
        </div>
    ) : undefined;

    return (
        <DataTable
            columns={mappedColumns}
            data={data || []}
            customStyles={customStyles}
            highlightOnHover
            pointerOnHover
            responsive
            progressPending={loading}
            noDataComponent={noDataComponent}
            paginationComponent={props.paginationComponent || CustomPagination}
            {...props}
        />
    );
};

export default DataTableWrapper;
