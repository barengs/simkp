import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardStats } from "../store/slices/dashboardSlice";
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';

const Dashboard = () => {
    const dispatch = useDispatch();
    const { stats, monthlyTrends, recentActivities, loading } = useSelector(state => state.dashboard);

    useEffect(() => {
        dispatch(fetchDashboardStats());
    }, [dispatch]);

    if (loading && !stats.length) {
        return <div className="flex items-center justify-center min-h-[400px]">Loading Admin Dashboard...</div>;
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white overflow-hidden shadow rounded-lg"
                    >
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                                    <div className="text-indigo-600 text-lg font-bold">
                                        {stat.value}
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            {stat.name}
                                        </dt>
                                        <dd className="flex items-baseline">
                                            <div
                                                className={`text-2xl font-semibold ${stat.changeType ===
                                                        "positive"
                                                        ? "text-green-600"
                                                        : stat.changeType === "negative" ? "text-red-600" : "text-gray-600"
                                                    }`}
                                            >
                                                {stat.change}
                                            </div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activities */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Aktivitas Terbaru
                        </h3>
                        <p>ini adalah admin</p>
                    </div>
                    <ul className="divide-y divide-gray-200">
                        {recentActivities.map((activity) => (
                            <li key={activity.id} className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium text-indigo-600 truncate">
                                        {activity.name}
                                    </div>
                                    <div className="ml-2 flex-shrink-0 flex">
                                        <span
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${activity.status === "Disetujui"
                                                    ? "bg-green-100 text-green-800"
                                                    : activity.status ===
                                                        "Ditolak"
                                                        ? "bg-red-100 text-red-800"
                                                        : activity.status ===
                                                            "Menunggu Validasi"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-blue-100 text-blue-800"
                                                }`}
                                        >
                                            {activity.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-2 flex justify-between text-sm text-gray-500">
                                    <span>{activity.type}</span>
                                    <span>{activity.date}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Chart Section */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Statistik KP
                        </h3>
                    </div>
                    <div className="px-4 py-5 sm:p-6">
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyTrends}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Pendaftaran" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
