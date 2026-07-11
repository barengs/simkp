import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import DataTable from "react-data-table-component";
import { tableCustomStyles, makeNumberColumn } from "../../components/tableStyles";
import { fetchAllActivities } from "../../store/slice/activitySlice";
import { SkeletonList } from "../../components/Skeleton";
import { Activity, Clock, FileText, ChevronRight } from "lucide-react";

const ActivityIndex = () => {
    const dispatch = useDispatch();
    const { allActivities, loading, pagination } = useSelector((state) => state.activities);

    useEffect(() => {
        dispatch(fetchAllActivities());
    }, [dispatch]);

    const columns = [
        makeNumberColumn(1, 10),
        {
            name: "Waktu",
            selector: (row) => row.human_date,
            cell: (row) => (
                <div className="flex items-center gap-2 py-4">
                    <Clock size={16} className="text-indigo-400" />
                    <span className="text-sm text-gray-500 font-medium">{row.human_date}</span>
                </div>
            ),
            width: "150px",
        },
        {
            name: "Aktivitas",
            selector: (row) => row.description,
            cell: (row) => (
                <div className="py-4">
                    <p className="text-sm text-gray-800 font-bold leading-relaxed mb-1">
                        {row.description}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-black uppercase tracking-wider">
                        <FileText size={12} />
                        {row.type.replace("_", " ")}
                    </div>
                </div>
            ),
            grow: 1,
        }
    ];

    const customStyles = {
        table: { style: { backgroundColor: 'transparent' } },
        header: { style: { display: 'none' } },
        headRow: {
            style: {
                backgroundColor: '#F3F4F6',
                borderRadius: '16px',
                border: 'none',
                marginBottom: '10px',
            },
        },
        headCells: {
            style: {
                fontSize: '11px',
                fontWeight: '900',
                color: '#9CA3AF',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
            },
        },
        rows: {
            style: {
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                border: '1px solid #F9FAFB',
                marginBottom: '10px',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'scale(1.01)',
                    boxShadow: '0 4px 15px -1px rgb(0 0 0 / 0.05)',
                },
            },
        },
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center md:text-left space-y-2">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-xl shadow-indigo-200">
                        <Activity size={28} />
                    </div>
                    Aktivitas Saya
                </h2>
                <p className="text-gray-500 font-medium max-w-lg">
                    Lacak semua aksi dan perubahan status terkait proses Kerja Praktek Anda.
                </p>
            </div>

            <div className="bg-white/40 backdrop-blur-md rounded-[32px] p-6 md:p-8 border border-white/50 shadow-2xl shadow-gray-100/30">
                <DataTable
                    columns={columns}
                    data={allActivities}
                    loading={loading}
                    progressComponent={<div className="w-full py-10"><SkeletonList items={5} /></div>}
                    pagination
                    paginationServer
                    paginationTotalRows={pagination?.total}
                    onChangePage={(page) => dispatch(fetchAllActivities({ page }))}
                    noDataComponent={
                        <div className="py-24 text-center text-gray-400 flex flex-col items-center gap-4">
                            <Activity size={56} className="opacity-10" />
                            <p className="font-bold text-lg">Belum ada riwayat.</p>
                            <span className="text-sm font-medium">Aktivitas baru akan muncul secara otomatis.</span>
                        </div>
                    }
                    customStyles={customStyles}
                />
            </div>
        </div>
    );
};

export default ActivityIndex;
