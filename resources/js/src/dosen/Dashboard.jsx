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
    BookOpen,
    Award,
    Info,
    BookCheck
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

const Dashboard = () => {
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
                    widget1: { label: 'Kelompok Bimbingan', value: 0, icon: 'users' },
                    widget2: { label: 'Laporan Perlu Validasi', value: 0, icon: 'clock' },
                    widget3: { label: 'Logbook Mahasiswa', value: 0, icon: 'book-open' },
                    widget4: { label: 'Total Mahasiswa', value: 0, icon: 'graduation-cap' },
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
            case 'book-open': return 'bg-amber-50';
            case 'award': return 'bg-emerald-50';
            default: return 'bg-indigo-50';
        }
    };

    if (loading) {
        return (
            <div className="p-1 space-y-8 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <SkeletonList items={5} />
                     <div className="aspect-square bg-gray-50 rounded-[40px] animate-pulse"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-1 space-y-10">
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {['widget1', 'widget2', 'widget3', 'widget4'].map((key) => (
                    <div key={key} className="bg-white overflow-hidden shadow-2xl shadow-slate-200/40 border border-slate-100 rounded-3xl hover:translate-y-[-4px] transition-all duration-300 group">
                        <div className="px-6 py-7">
                            <div className="flex items-center">
                                <div className={`shrink-0 rounded-2xl p-4 transition-colors group-hover:bg-opacity-80 ${getBgColor(stats?.[key]?.icon)}`}>
                                    {getIcon(stats?.[key]?.icon)}
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-bold text-slate-400 capitalize truncate mb-1">
                                            {stats?.[key]?.label || '...'}
                                        </dt>
                                        <dd className="text-3xl font-black text-slate-900 tracking-tight">
                                            {stats?.[key]?.value ?? 0}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Recent Activities */}
                <div className="bg-white/60 backdrop-blur-xl shadow-2xl shadow-slate-200/50 border border-white overflow-hidden rounded-[40px] flex flex-col">
                    <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
                        <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                            <Activity size={24} className="text-indigo-600 p-1.5 bg-indigo-50 rounded-lg" />
                            Keaktifan Mahasiswa
                        </h3>
                        <Link to="/dosen/activities" className="text-xs font-black text-indigo-600 tracking-widest uppercase hover:text-indigo-700 flex items-center gap-1 group">
                             Monitor Semua <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    <div className="flex-1 max-h-[450px] overflow-y-auto custom-scrollbar">
                        {activitiesLoading ? (
                            <div className="p-10"><SkeletonList items={5} /></div>
                        ) : latestActivities.length > 0 ? (
                            <ul className="divide-y divide-slate-50">
                                {latestActivities.map((activity) => (
                                    <li key={activity.id} className="px-10 py-6 hover:bg-slate-50/50 transition-colors">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                 <span className="text-xs font-black text-slate-900">{activity.user_name}</span>
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                                {activity.human_date}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-600 font-medium leading-relaxed mb-2">
                                                {activity.description}
                                            </p>
                                             <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 font-black uppercase tracking-widest">
                                                 <BookCheck size={12} />
                                                 {activity.type.replace('_', ' ')}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-80 text-slate-300 gap-4 grayscale opacity-20 italic font-black text-2xl uppercase tracking-tighter">
                                <Activity size={80} strokeWidth={3} />
                                <span>Belum ada aktivitas terbaru</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Statistics Visualization */}
                <div className="bg-white/60 backdrop-blur-xl shadow-2xl shadow-slate-200/50 border border-white overflow-hidden rounded-[40px] flex flex-col">
                    <div className="px-10 py-8 border-b border-slate-50">
                        <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                             <PieChartIcon size={24} className="text-emerald-600 p-1.5 bg-emerald-50 rounded-lg" />
                             Progress Mahasiswa
                        </h3>
                    </div>
                    <div className="p-10 flex-1 flex flex-col items-center justify-center min-h-[400px]">
                        {chartData.some(d => d.value > 0) ? (
                            <ResponsiveContainer width="100%" height={400}>
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={90}
                                        outerRadius={130}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={COLORS[index % COLORS.length]} 
                                                className="hover:opacity-80 transition-opacity cursor-pointer shadow-lg"
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '20px' }}
                                        itemStyle={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase' }}
                                    />
                                    <Legend 
                                        verticalAlign="bottom" 
                                        align="center" 
                                        iconType="circle"
                                        formatter={(value) => <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider ml-1">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                             <div className="bg-slate-50 border-2 border-dashed border-slate-100 rounded-[48px] w-full h-full flex flex-col items-center justify-center text-slate-200 gap-4 py-20 grayscale">
                                <PieChartIcon size={80} strokeWidth={1} />
                                <span className="text-sm font-black uppercase tracking-[0.2em] italic">Statistik Belum Tersedia</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
