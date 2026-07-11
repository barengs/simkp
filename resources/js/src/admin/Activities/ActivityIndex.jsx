import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import DataTable from "react-data-table-component";
import { fetchAllActivities } from "../../store/slice/activitySlice";
import Skeleton from "../../components/Skeleton";
import { Activity, Clock, User, FileText } from "lucide-react";
import { tableCustomStyles, makeNumberColumn } from "../../components/tableStyles";

const ActivityIndex = () => {
    const dispatch = useDispatch();
    const { allActivities, loading, pagination } = useSelector((state) => state.activities);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    useEffect(() => {
        dispatch(fetchAllActivities());
    }, [dispatch]);

    const columns = [
        makeNumberColumn(currentPage, rowsPerPage),
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
                    onChangePage={(page) => {
                        setCurrentPage(page);
                        dispatch(fetchAllActivities({ page }));
                    }}
                    noDataComponent={
                        <div className="py-20 text-center text-gray-400 flex flex-col items-center gap-3 font-medium">
                            <Activity size={48} className="opacity-10" />
                            Belum ada riwayat aktivitas.
                        </div>
                    }
                    customStyles={tableCustomStyles}
                />
            </div>
        </div>
    );
};

export default ActivityIndex;
