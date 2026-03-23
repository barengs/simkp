import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardStats } from "./store/slices/dashboardSlice";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { Users, CheckCircle, Clock, Award, TrendingUp, TrendingDown } from 'lucide-react';

const Dashboard = () => {
    const dispatch = useDispatch();
    const { stats, monthlyTrends, recentActivities, loading } = useSelector(state => state.dashboard);

    useEffect(() => {
        dispatch(fetchDashboardStats());
    }, [dispatch]);

    if (loading && !stats.length) {
        return <div className="flex items-center justify-center min-h-[400px]">Loading dashboard...</div>;
    }

    const getIcon = (name) => {
        switch (name) {
            case 'Total Mahasiswa': return <Users className="w-6 h-6 text-indigo-600" />;
            case 'Pendaftaran Disetujui': return <CheckCircle className="w-6 h-6 text-green-600" />;
            case 'Menunggu Validasi': return <Clock className="w-6 h-6 text-yellow-600" />;
            case 'Selesai KP': return <Award className="w-6 h-6 text-purple-600" />;
            default: return <Users className="w-6 h-6 text-indigo-600" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-gray-50 p-3 rounded-xl">
                                {getIcon(stat.name)}
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold ${stat.changeType === 'positive' ? 'text-green-600' :
                                    stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-400'
                                }`}>
                                {stat.changeType === 'positive' ? <TrendingUp className="w-3 h-3" /> :
                                    stat.changeType === 'negative' ? <TrendingDown className="w-3 h-3" /> : null}
                                {stat.change}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">{stat.name}</p>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-black text-gray-900 leading-none">Tren Pendaftaran KP</h3>
                        <p className="text-xs text-gray-500">6 Bulan Terakhir</p>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyTrends}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#4f46e5"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorCount)"
                                    name="Pendaftaran"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activities */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50">
                        <h3 className="text-lg font-black text-gray-900 leading-none">Aktivitas Terbaru</h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {recentActivities.map((activity) => (
                            <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-bold text-gray-900 truncate">{activity.name}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${activity.status === 'Disetujui' ? 'bg-green-50 text-green-600' :
                                            activity.status === 'Ditolak' ? 'bg-red-50 text-red-600' :
                                                activity.status === 'Selesai' ? 'bg-purple-50 text-purple-600' :
                                                    'bg-blue-50 text-blue-600'
                                        }`}>
                                        {activity.status}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">{activity.type}</span>
                                    <span className="text-[10px] text-gray-400 font-medium">{activity.date}</span>
                                </div>
                            </div>
                        ))}
                        {!recentActivities.length && (
                            <div className="p-6 text-center text-sm text-gray-500 italic">Belum ada aktivitas baru.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
