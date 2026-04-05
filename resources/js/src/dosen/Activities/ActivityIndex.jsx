import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import DataTable from "react-data-table-component";
import { fetchAllActivities } from "../../store/slice/activitySlice";
import Skeleton from "../../components/Skeleton";
import { Activity, Clock, User, FileText } from "lucide-react";

const ActivityIndex = () => {
    const dispatch = useDispatch();
    const { allActivities, loading, pagination } = useSelector((state) => state.activities);

    useEffect(() => {
        dispatch(fetchAllActivities());
    }, [dispatch]);

    const columns = [
        {
            name: "Waktu",
            selector: (row) => row.human_date,
            sortable: true,
            cell: (row) => (
                <div className="flex items-center gap-2 py-4">
                    <Clock size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-500 font-medium">{row.human_date}</span>
                </div>
            ),
            width: "150px",
        },
        {
            name: "Mahasiswa",
            selector: (row) => row.user_name,
            sortable: true,
            cell: (row) => (
                <div className="flex flex-col py-4">
                    <span className="font-bold text-indigo-900 flex items-center gap-1">
                        <User size={14} className="text-indigo-400" />
                        {row.user_name}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        Mahasiswa Bimbingan
                    </span>
                </div>
            ),
            width: "200px",
        },
        {
            name: "Aktivitas",
            selector: (row) => row.description,
            cell: (row) => (
                <div className="py-4">
                    <p className="text-sm text-gray-700 leading-relaxed font-semibold">
                        {row.description}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400 uppercase tracking-widest font-black">
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
                backgroundColor: '#F3F4FB',
                borderRadius: '16px',
                border: 'none',
                marginBottom: '10px',
            },
        },
        headCells: {
            style: {
                fontSize: '11px',
                fontWeight: '900',
                color: '#818CF8',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
            },
        },
        rows: {
            style: {
                backgroundColor: '#FFFFFF',
                borderRadius: '24px',
                border: '1px solid #F1F5F9',
                marginBottom: '12px',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                    backgroundColor: '#F8FAFC',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 8px 20px -1px rgb(0 0 0 / 0.05)',
                },
            },
        },
    };

    return (
        <div className="space-y-10 p-2">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-3 rounded-2xl text-white shadow-2xl shadow-indigo-100 ring-4 ring-indigo-50">
                         <Activity size={28} />
                    </div>
                    Log Keaktifan Mahasiswa
                </h2>
                <p className="text-slate-500 font-medium italic">
                    Memantau riwayat aksi mahasiswa bimbingan secara real-time.
                </p>
            </div>

            <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-2xl shadow-slate-200/50">
                <DataTable
                    columns={columns}
                    data={allActivities}
                    loading={loading}
                    progressComponent={<div className="w-full py-10"><Skeleton className="h-64 h-full w-full rounded-2xl" /></div>}
                    pagination
                    paginationServer
                    paginationTotalRows={pagination?.total}
                    onChangePage={(page) => dispatch(fetchAllActivities({ page }))}
                    noDataComponent={
                        <div className="py-24 text-center text-slate-400 flex flex-col items-center gap-4 font-black text-xl italic uppercase tracking-widest opacity-20">
                            <Activity size={80} />
                            Belum Ada Data Keaktifan
                        </div>
                    }
                    customStyles={customStyles}
                />
            </div>
        </div>
    );
};

export default ActivityIndex;
