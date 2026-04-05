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
    PieChart as PieChartIcon,
    Info,
    BookOpen,
    Award
} from "lucide-react";
import { 
    PieChart, 
    Pie, 
    Cell, 
    ResponsiveContainer, 
    Tooltip, 
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";
import { fetchLatestActivities } from "../store/slice/activitySlice";
import { SkeletonCard, SkeletonList } from "../components/Skeleton";

const Dashboard = () => {
    const dispatch = useDispatch();
    const { latestActivities, loading: activitiesLoading } = useSelector((state) => state.activities);
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    const COLORS = ["#F59E0B", "#10B981", "#6366F1", "#3B82F6", "#EF4444"];

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get("/dashboard/stats");
                setStats(response.data.stats);
                setChartData(response.data.chartData);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
        
        // Guard for fetchLatestActivities to avoid 401 on early mount/redirect
        if (sessionStorage.getItem('AUTH_TOKEN')) {
            dispatch(fetchLatestActivities());
        }
    }, [dispatch]);

    const getIcon = (iconName) => {
        switch (iconName) {
            case 'users': return <Users className="text-indigo-600" size={24} />;
            case 'check-circle': return <CheckCircle2 className="text-emerald-600" size={24} />;
            case 'clock': return <Clock className="text-amber-600" size={24} />;
            case 'graduation-cap': return <GraduationCap className="text-blue-600" size={24} />;
            case 'info': return <Info className="text-blue-600" size={24} />;
            case 'book-open': return <BookOpen className="text-amber-600" size={24} />;
            case 'award': return <Award className="text-emerald-600" size={24} />;
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
            case 'book-open': return 'bg-amber-50';
            case 'award': return 'bg-emerald-50';
            default: return 'bg-indigo-50';
        }
    };

    if (loading) {
        return (
            <div className="p-1 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     <SkeletonList items={5} />
                     <div className="h-64 bg-gray-100 rounded-3xl animate-pulse"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-1 space-y-8">
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activities */}
                <div className="bg-white shadow-sm border border-gray-100 overflow-hidden rounded-3xl flex flex-col">
                    <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Activity size={20} className="text-indigo-600" />
                            Aktivitas Terbaru
                        </h3>
                        <Link to="/admin/activities" className="text-sm text-indigo-600 font-bold hover:text-indigo-700 flex items-center gap-1 group">
                             Lihat Semua <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    <div className="flex-1">
                        {activitiesLoading ? (
                            <div className="p-8"><SkeletonList items={5} /></div>
                        ) : latestActivities.length > 0 ? (
                            <ul className="divide-y divide-gray-50">
                                {latestActivities.map((activity) => (
                                    <li key={activity.id} className="px-8 py-5 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="text-[10px] uppercase font-bold text-indigo-500 tracking-widest bg-indigo-50 px-2 py-1 rounded-md">
                                                {activity.user_role}
                                            </div>
                                            <span className="text-[11px] text-gray-400 font-medium">
                                                {activity.human_date}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-800 font-semibold leading-relaxed">
                                                <span className="text-gray-900 font-black">{activity.user_name}</span> {activity.description}
                                            </p>
                                             <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400 font-bold tracking-widest">
                                                 <FileText size={10} />
                                                 {activity.type.replace('_', ' ')}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-80 text-gray-400 gap-3 grayscale opacity-30">
                                <Activity size={60} strokeWidth={1} />
                                <span className="text-sm font-bold uppercase tracking-widest">Belum ada aktivitas terbaru</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Statistics Visualization */}
                <div className="bg-white shadow-sm border border-gray-100 overflow-hidden rounded-3xl flex flex-col">
                    <div className="px-8 py-6 border-b border-gray-200 bg-gray-50/30">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                             <PieChartIcon size={20} className="text-indigo-600" />
                             Distribusi Status KP
                        </h3>
                    </div>
                    <div className="p-8 flex-1 flex flex-col items-center justify-center min-h-[400px]">
                        {chartData.some(d => d.value > 0) ? (
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 700 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 700 }} />
                                    <Tooltip 
                                        cursor={{ fill: '#F9FAFB' }}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                        itemStyle={{ fontSize: '12px', fontWeight: 700, color: '#4F46E5' }}
                                    />
                                    <Bar dataKey="value" fill="#6366F1" radius={[8, 8, 0, 0]} barSize={40}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                             <div className="bg-gray-50 border-2 border-dashed border-gray-100 rounded-[32px] w-full h-full flex flex-col items-center justify-center text-gray-300 gap-4">
                                <Activity size={60} className="opacity-10" />
                                <span className="text-sm font-bold uppercase tracking-widest italic tracking-tighter">Statistik Belum Tersedia</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;