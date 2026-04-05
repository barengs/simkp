import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import api from "../api";
import { 
    Users, 
    CheckCircle2, 
    Clock, 
    GraduationCap, 
    Activity, 
    FileText,
    TrendingUp,
    ChevronRight,
    Info,
    BookCheck,
    Award
} from "lucide-react";
import { 
    PieChart, 
    Pie, 
    Cell, 
    ResponsiveContainer, 
    Tooltip, 
    Legend 
} from "recharts";
import { fetchLatestActivities } from "../store/slice/activitySlice";
import { SkeletonCard, SkeletonList } from "../components/Skeleton";

const StudentDashboard = () => {
    const dispatch = useDispatch();
    const { latestActivities, loading: activitiesLoading } = useSelector((state) => state.activities);
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    const COLORS = ["#F59E0B", "#10B981", "#6366F1", "#3B82F6", "#EF4444"];

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const response = await api.get("/dashboard/stats");
                if (response.data && response.data.stats) {
                    setStats(response.data.stats);
                    setChartData(response.data.chartData || []);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
                // Fallback empty stats to prevent crash
                setStats({
                    widget1: { label: 'Status Pendaftaran', value: 'Error', icon: 'info' },
                    widget2: { label: 'Total Logbook', value: 0, icon: 'book-open' },
                    widget3: { label: 'Status Laporan', value: 'Error', icon: 'file-text' },
                    widget4: { label: 'Nilai Akhir', value: '-', icon: 'award' },
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
        dispatch(fetchLatestActivities());
    }, [dispatch]);

    const getIcon = (iconName) => {
        switch (iconName) {
            case 'users': return <Users className="text-indigo-600" size={24} />;
            case 'check-circle': return <CheckCircle2 className="text-emerald-600" size={24} />;
            case 'clock': return <Clock className="text-amber-600" size={24} />;
            case 'graduation-cap': return <GraduationCap className="text-blue-600" size={24} />;
            case 'info': return <Info className="text-blue-600" size={24} />;
            case 'book-check': return <BookCheck className="text-emerald-600" size={24} />;
            case 'book-open': return <BookCheck className="text-indigo-600" size={24} />;
            case 'file-text': return <FileText className="text-indigo-600" size={24} />;
            case 'award': return <Award className="text-amber-600" size={24} />;
            default: return <Activity className="text-indigo-600" size={24} />;
        }
    };

    const getBgColor = (iconName) => {
        switch (iconName) {
            case 'users': return 'bg-indigo-50';
            case 'check-circle': return 'bg-emerald-50';
            case 'clock': return 'bg-amber-50';
            case 'graduation-cap': return 'bg-blue-50';
            case 'info': return 'bg-blue-50';
            case 'book-check': return 'bg-emerald-50';
            case 'book-open': return 'bg-indigo-50';
            case 'file-text': return 'bg-indigo-50';
            case 'award': return 'bg-amber-50';
            default: return 'bg-indigo-50';
        }
    };

    if (loading) {
        return (
            <div className="p-1">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <SkeletonList items={5} />
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center">
                        <div className="animate-pulse bg-gray-100 rounded-full w-48 h-48"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-1">
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {['widget1', 'widget2', 'widget3', 'widget4'].map((key) => (
                    <div key={key} className="bg-white overflow-hidden shadow-sm border border-gray-100 rounded-2xl hover:shadow-md transition-shadow duration-300">
                        <div className="px-5 py-6">
                            <div className="flex items-center">
                                <div className={`shrink-0 rounded-xl p-3 ${getBgColor(stats?.[key]?.icon)}`}>
                                    {getIcon(stats?.[key]?.icon)}
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate mb-1">
                                            {stats?.[key]?.label || '...'}
                                        </dt>
                                        <dd className="text-2xl font-bold text-gray-900">
                                            {stats?.[key]?.value ?? 0}
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
                <div className="bg-white shadow-sm border border-gray-100 overflow-hidden rounded-2xl flex flex-col">
                    <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Activity size={20} className="text-indigo-600" />
                            Aktivitas Terbaru
                        </h3>
                        <Link to="/student/activities" className="text-sm text-indigo-600 font-semibold hover:text-indigo-700 flex items-center gap-1">
                            Lihat Semua <ChevronRight size={14} />
                        </Link>
                    </div>
                    <div className="flex-1 overflow-y-auto min-h-[350px]">
                        {activitiesLoading ? (
                            <div className="p-6">
                                <SkeletonList items={5} />
                            </div>
                        ) : latestActivities.length > 0 ? (
                            <ul className="divide-y divide-gray-50">
                                {latestActivities.map((activity) => (
                                    <li key={activity.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm font-semibold text-gray-800">
                                                {activity.user_name}
                                            </div>
                                            <div className="ml-2">
                                                <span className="px-3 py-1 text-[10px] uppercase font-bold rounded-lg bg-indigo-50 text-indigo-700">
                                                    {activity.human_date}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-1 flex flex-col gap-1">
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {activity.description}
                                            </p>
                                            <div className="flex items-center gap-2 text-[11px] text-gray-400">
                                                 <FileText size={12} />
                                                 <span className="uppercase font-medium tracking-wider">{activity.type.replace('_', ' ')}</span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-2">
                                <Activity size={40} className="opacity-20" />
                                <span className="text-sm">Belum ada aktivitas baru</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Statistics Chart */}
                <div className="bg-white shadow-sm border border-gray-100 overflow-hidden rounded-2xl flex flex-col">
                    <div className="px-6 py-5 border-b border-gray-50">
                        <h3 className="text-lg font-bold text-gray-900">
                            Statistik Status KP
                        </h3>
                    </div>
                    <div className="p-6 flex-1 flex flex-col items-center justify-center min-h-[350px]">
                        {chartData.some(d => d.value > 0) ? (
                            <ResponsiveContainer width="100%" height={350}>
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={120}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2 min-h-[250px]">
                                <Activity size={40} className="opacity-20" />
                                <span className="text-sm font-black uppercase tracking-widest italic tracking-tighter">Statistik Belum Tersedia</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
