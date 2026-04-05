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
                <div className="flex items-center gap-2 py-3">
                    <Clock size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600 font-medium">{row.human_date}</span>
                </div>
            ),
            width: "150px",
        },
        {
            name: "User",
            selector: (row) => row.user_name,
            sortable: true,
            cell: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-800">{row.user_name}</span>
                    <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                        {row.user_role}
                    </span>
                </div>
            ),
            width: "180px",
        },
        {
            name: "Aktivitas",
            selector: (row) => row.description,
            cell: (row) => (
                <div className="py-3">
                    <p className="text-sm text-gray-700 leading-relaxed font-medium">
                        {row.description}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                        <FileText size={12} />
                        {row.type.replace("_", " ")}
                    </div>
                </div>
            ),
            grow: 2,
        }
    ];

    const customStyles = {
        table: {
            style: {
                backgroundColor: 'transparent',
            },
        },
        header: {
            style: {
                display: 'none',
            },
        },
        headRow: {
            style: {
                backgroundColor: '#F9FAFB',
                borderRadius: '12px',
                border: 'none',
                marginBottom: '10px',
                boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            },
        },
        headCells: {
            style: {
                fontSize: '12px',
                fontWeight: '800',
                textTransform: 'uppercase',
                color: '#6B7280',
                letterSpacing: '0.05em',
            },
        },
        rows: {
            style: {
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #F3F4F6',
                marginBottom: '12px',
                transition: 'all 0.2s',
                '&:hover': {
                    backgroundColor: '#F9FAFB',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    cursor: 'default',
                },
            },
        },
        cells: {
            style: {
                paddingLeft: '20px',
                paddingRight: '20px',
            },
        },
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
                             <Activity size={24} />
                        </div>
                        Log Aktivitas
                    </h2>
                    <p className="text-gray-500 mt-1 font-medium italic">
                        Menampilkan semua riwayat aksi dalam sistem.
                    </p>
                </div>
            </div>

            <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-xl shadow-gray-100/50">
                <DataTable
                    columns={columns}
                    data={allActivities}
                    loading={loading}
                    progressComponent={<Skeleton className="h-64 h-full w-full rounded-2xl" />}
                    pagination
                    paginationServer
                    paginationTotalRows={pagination?.total}
                    onChangePage={(page) => dispatch(fetchAllActivities({ page }))}
                    noDataComponent={
                        <div className="py-20 text-center text-gray-400 flex flex-col items-center gap-3 font-medium">
                            <Activity size={48} className="opacity-10" />
                            Belum ada riwayat aktivitas.
                        </div>
                    }
                    customStyles={customStyles}
                />
            </div>
        </div>
    );
};

export default ActivityIndex;
