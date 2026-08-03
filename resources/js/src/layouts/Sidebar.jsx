import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Calendar,
    Palette,
    Database,
    CheckSquare,
    TrendingUp,
    FileText,
    Settings,
    FileEdit,
    Book,
    Users,
    LogOut,
    ChevronRight,
    GraduationCap,
    Shield,
    User
} from "lucide-react";

// --- Sub-Komponen untuk Menu Item ---
const MenuItem = ({
    item,
    level = 0,
    isCollapsed,
    expandedMenus,
    toggleMenu,
    navigate,
    setSidebarOpen,
    isActiveLink,
    setExpandedMenus
}) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus[item.id || item.name];
    const isChildActive = hasChildren && item.children.some(child => isActiveLink(child.path));

    // Auto-expand jika ada anak yang aktif
    useEffect(() => {
        if (isChildActive && expandedMenus[item.id || item.name] === undefined) {
            setExpandedMenus(prev => ({ ...prev, [item.id || item.name]: true }));
        }
    }, [isChildActive, item.id, item.name, setExpandedMenus]);

    const isActive = !hasChildren && isActiveLink(item.path);
    const isParentActive = hasChildren && isChildActive;

    return (
        <div className="relative mb-1">
            <button
                onClick={() => {
                    if (hasChildren) {
                        if (isCollapsed) return;
                        toggleMenu(item.id || item.name);
                    } else {
                        navigate(item.path);
                        setSidebarOpen(false);
                    }
                }}
                title={isCollapsed ? item.name : ""}
                // Kode Baru
                className={`
    ${isActive || isParentActive
                        ? level === 0
                            ? "bg-emerald-800/80 text-yellow-300 font-semibold border-l-4 border-yellow-400 pl-4 pr-2"
                            : "bg-emerald-900/60 text-yellow-300/95 font-semibold border-l-4 border-yellow-500/80 pl-10 pr-0"
                        : level === 0
                            ? "text-emerald-100/70 hover:bg-emerald-900/40 hover:text-emerald-50 border-l-4 border-transparent pl-4 pr-2"
                            : "text-emerald-100/70 hover:bg-emerald-900/40 hover:text-emerald-50 border-l-4 border-transparent pl-10 pr-0"
                    } group w-full flex items-center py-2 text-sm font-medium transition-all duration-200 active:scale-[0.98] active:bg-emerald-700/50
    ${isCollapsed ? "justify-center !border-l-0 !px-0" : ""} 
`}
            >
                <span className={`${isCollapsed ? "" : "mr-3"} shrink-0`}>
                    {item.icon}
                </span>

                {!isCollapsed && (
                    <>
                        <span className="flex-1 text-left truncate">{item.name}</span>
                        {hasChildren && (
                            <motion.div
                                animate={{ rotate: isExpanded ? 90 : 0 }}
                                transition={{ duration: 0.2 }}
                                className="ml-2"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </motion.div>
                        )}
                    </>
                )}
            </button>

            {/* Animasi Dropdown Sub-menu */}
            <AnimatePresence>
                {hasChildren && isExpanded && !isCollapsed && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="mt-1 space-y-1">
                            {item.children.map((child) => (
                                <MenuItem
                                    key={child.path || child.name}
                                    item={child}
                                    level={level + 1}
                                    {...{ isCollapsed, expandedMenus, toggleMenu, navigate, setSidebarOpen, isActiveLink, setExpandedMenus }}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tooltip/Dropdown untuk Desktop (Collapsed) */}
            {hasChildren && isCollapsed && (
                <div className="hidden group-hover:block absolute left-full top-0 w-48 bg-[#062c1e] shadow-2xl rounded-r-md border border-emerald-900 z-50 ml-2">
                    <div className="py-2">
                        <div className="px-4 py-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest border-b border-emerald-900/60 mb-1">
                            {item.name}
                        </div>
                        {item.children.map((child) => (
                            <button
                                key={child.path}
                                onClick={() => {
                                    navigate(child.path);
                                    setSidebarOpen(false);
                                }}
                                className={`block w-full text-left py-2 text-sm transition-all duration-150 active:scale-[0.98] border-l-4 ${isActiveLink(child.path) ? "bg-emerald-800/80 text-yellow-300 font-medium border-yellow-400 pl-3 pr-4" : "text-emerald-100/70 hover:bg-emerald-900/40 hover:text-emerald-50 border-transparent pl-3 pr-4"
                                    } rounded-r-md`}
                            >
                                {child.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Komponen Utama Sidebar ---
const Sidebar = ({ user, onLogout, sidebarOpen, setSidebarOpen, isCollapsed }) => {
    // Debug: Log user object to see its structure and permissions
    // console.log("Sidebar: User object:", user);
    const { loading: logoutLoading } = useSelector((state) => state.auth);
    const { publicSettings } = useSelector((state) => state.settings || { publicSettings: {} });
    const [expandedMenus, setExpandedMenus] = useState({});
    const navigate = useNavigate();
    const location = useLocation();

    const toggleMenu = (menuId) => {
        setExpandedMenus((prev) => ({
            ...prev,
            [menuId]: !prev[menuId],
        }));
    };

    const isActiveLink = (path) => {
        if (path === "/" && location.pathname !== "/") return false;
        return location.pathname === path || location.pathname.startsWith(path + "/");
    };

    const navigation = useMemo(() => {
        const permissions = user?.permissions || [];
        // // Debug: Log the generated permissions array
        // console.log("Sidebar: Permissions array:", permissions);
        const items = [];

        // Dashboard is accessible to all
        items.push({ name: "Dashboard", path: "/", icon: <LayoutDashboard size={18} /> });

        // Admin Management Group
        if (permissions.includes("manage periods")) {
            items.push({ name: "Periode", path: "/admin/period-management", icon: <Calendar size={18} /> });
        }
        if (permissions.includes("manage themes")) {
            items.push({ name: "Tema", path: "/admin/theme-management", icon: <Palette size={18} /> });
        }
        if (permissions.includes("manage master data")) {
            items.push({
                name: "Master Data",
                id: "master-data",
                icon: <Database size={18} />,
                children: [
                    { name: "Dosen", path: "/admin/master/dosen" },
                    { name: "Mahasiswa", path: "/admin/master-mahasiswa" },
                    { name: "Mitra", path: "/admin/master/mitra" },
                ],
            });
        }

        // Kerja Praktek (KP) group
        let hasKPHeader = false;
        const pushKPHeader = () => {
            if (!hasKPHeader) {
                items.push({ name: "Kerja Praktek (KP)", isHeader: true });
                hasKPHeader = true;
            }
        };

        // Student KP Menu Items
        if (permissions.includes("student registration")) {
            pushKPHeader();
            items.push({ name: "Pendaftaran KP", path: "/student/registration", icon: <FileEdit size={18} /> });
        }
        if (permissions.includes("student logbook")) {
            pushKPHeader();
            items.push({ name: "Logbook KP", path: "/student/logbook", icon: <Book size={18} /> });
        }
        if (permissions.includes("student report")) {
            pushKPHeader();
            items.push({ name: "Laporan KP", path: "/student/reports", icon: <FileText size={18} /> });
        }
        if (permissions.includes("student evaluation")) {
            pushKPHeader();
            items.push({ name: "Penilaian KP", path: "/student/evaluations", icon: <CheckSquare size={18} /> });
        }

        // Lecturer / Admin KP Menu Items
        if (permissions.includes("manage internships")) {
            pushKPHeader();
            items.push({ name: "Kelompok KP", path: "/admin/internship-groups", icon: <Users size={18} /> });
        }
        
        
        // Dosen's view of their own groups
        if (permissions.includes("view internships") && (user?.roles || []).includes("dosen_pembimbing")) {
            pushKPHeader();
            items.push({ name: "Daftar Kelompok", path: "/dosen/internship-groups", icon: <Users size={18} /> });
        }
        
        // Monitoring permissions (can be held by admin, koordinator, or dosen)
        let hasMonitoringPerms = permissions.includes("view logbook monitoring") || permissions.includes("view kp reports") || permissions.includes("view evaluation recap");
        if (hasMonitoringPerms) {
            pushKPHeader();
            // Admin monitoring roles
            if (permissions.includes("view logbook monitoring")) {
                items.push({ name: "Monitoring Logbook", path: "/admin/logbook", icon: <Book size={18} /> });
            }
            if (permissions.includes("view kp reports")) {
                items.push({ name: "Laporan KP", path: "/admin/reports", icon: <FileText size={18} /> });
            }
            if (permissions.includes("view evaluation recap")) {
                items.push({ name: "Rekap Penilaian", path: "/admin/evaluations", icon: <CheckSquare size={18} /> });
            }
        }
        
        // Dosen validation roles
        if (permissions.includes("validate logbook")) {
            pushKPHeader();
            items.push({ name: "Validasi Logbook", path: "/dosen/logbook", icon: <CheckSquare size={18} /> });
        }
        if (permissions.includes("validate report")) {
            pushKPHeader();
            items.push({ name: "Validasi Laporan", path: "/dosen/reports", icon: <FileText size={18} /> });
        }
        if (permissions.includes("score internships")) {
            pushKPHeader();
            items.push({ name: "Penilaian Kelompok", path: "/dosen/evaluations", icon: <CheckSquare size={18} /> });
        }

        // Tugas Akhir (TA) group
        let hasTAHeader = false;
        const pushTAHeader = () => {
            if (!hasTAHeader) {
                items.push({ name: "Tugas Akhir (TA)", isHeader: true });
                hasTAHeader = true;
            }
        };

        if (permissions.includes("manage ta")) {
            pushTAHeader();
            items.push({ name: "Manajemen TA", path: "/admin/koordinator-ta", icon: <GraduationCap size={18} /> });
        }

        if (permissions.includes("student ta")) {
            pushTAHeader();
            items.push({ name: "Pendaftaran TA", path: "/student/ta-registration", icon: <FileEdit size={18} /> });
            items.push({ name: "Bimbingan TA", path: "/student/ta-bimbingan", icon: <Book size={18} /> });
            items.push({ name: "Jadwal & Sidang", path: "/student/ta-sidang", icon: <Calendar size={18} /> });
            items.push({ name: "Finalisasi TA", path: "/student/ta-final", icon: <GraduationCap size={18} /> });
        }

        // Pengaturan - Kategori khusus di paling bawah
        if (permissions.includes("manage profile") || permissions.includes("manage roles") || permissions.includes("manage settings")) {
            items.push({ name: "Pengaturan", isHeader: true });
        }
        if (permissions.includes("manage profile")) {
            items.push({ name: "Pengaturan Profil", path: "/profile", icon: <User size={18} /> });
        }
        if (permissions.includes("manage roles")) {
            items.push({ name: "Manajemen Peran", path: "/admin/role-management", icon: <Shield size={18} /> });
        }
        if (permissions.includes("manage settings")) {
            items.push({ name: "Pengaturan Sistem", path: "/admin/settings", icon: <Settings size={18} /> });
        }

        return items;
    }, [user]);

    const sidebarWidth = isCollapsed ? "md:w-20" : "md:w-64";

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <div className="fixed inset-0 z-40 flex md:hidden">
                        {/* Backdrop Fade In */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm"
                        />
                        {/* Sidebar Panel Slide In */}
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative flex-1 flex flex-col max-w-xs w-full bg-[#062c1e] shadow-xl"
                        >
                            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto px-4 sidebar-scrollbar">
                                <div className="flex items-center gap-3 mb-6 px-2">
                                    <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center font-bold text-emerald-400">
                                        {publicSettings.app_logo ? (
                                            <img src={publicSettings.app_logo} alt="Logo" className="w-full h-full object-contain" />
                                        ) : "S"}
                                    </div>
                                    <h1 className="text-xl font-bold text-white truncate">{publicSettings.app_name || "SIMKP"}</h1>
                                </div>
                                <nav className="space-y-1">
                                    {navigation.map((item) => (
                                        item.isHeader ? (
                                            <div key={item.name} className="px-3 py-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-4 mb-1">
                                                {item.name}
                                            </div>
                                        ) : (
                                            <MenuItem
                                                key={item.id || item.path}
                                                item={item}
                                                {...{ isCollapsed: false, expandedMenus, toggleMenu, navigate, setSidebarOpen, isActiveLink, setExpandedMenus }}
                                            />
                                        )
                                    ))}
                                </nav>
                            </div>

                            {/* Mobile Logout Footer */}
                            <div className="shrink-0 border-t border-emerald-900 p-4 bg-[#041e15]">
                                <div className="flex items-center justify-between">
                                    <div
                                        className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
                                        onClick={() => {
                                            setSidebarOpen(false);
                                            navigate("/profile");
                                        }}
                                        title="Lihat Profil Saya"
                                    >
                                        <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border border-emerald-800/40">
                                            {user?.avatar_url ? (
                                                <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-indigo-650 font-bold">
                                                    {(user?.name || "U").charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1 mr-2 ml-2.5">
                                            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                                            <p className="text-xs text-emerald-400 uppercase tracking-wider font-semibold">{user?.role}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSidebarOpen(false);
                                            onLogout();
                                        }}
                                        disabled={logoutLoading}
                                        className="p-2 rounded-lg text-red-400 hover:bg-red-950/40 transition-colors disabled:opacity-50"
                                    >
                                        {logoutLoading ? (
                                            <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <LogOut size={20} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <div className={`hidden md:flex ${sidebarWidth} md:flex-col md:fixed md:inset-y-0 transition-all duration-300 z-30 shadow-lg`}>
                <div className="flex-1 flex flex-col min-h-0 border-r border-emerald-900 bg-emerald-900">
                    <div className={`flex items-center shrink-0 px-5 pt-5 mb-4 ${isCollapsed ? "justify-center px-0" : ""}`}>
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center font-bold text-emerald-400">
                            {publicSettings.app_logo ? (
                                <img src={publicSettings.app_logo} alt="Logo" className="w-full h-full object-contain" />
                            ) : "S"}
                        </div>
                        {!isCollapsed && <span className="ml-3 text-lg font-extrabold text-white tracking-wide truncate">{publicSettings.app_name || "SIMKP"}</span>}
                    </div>
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <nav className="h-full min-h-0 overflow-y-auto px-1 space-y-1 pb-4 sidebar-scrollbar">
                            {navigation.map((item) => (
                                item.isHeader ? (
                                    !isCollapsed ? (
                                        <div key={item.name} className="px-3 py-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-4 mb-1">
                                            {item.name}
                                        </div>
                                    ) : (
                                        <div key={item.name} className="border-t border-emerald-900/60 my-4" />
                                    )
                                ) : (
                                    <MenuItem
                                        key={item.id || item.path}
                                        item={item}
                                        {...{ isCollapsed, expandedMenus, toggleMenu, navigate, setSidebarOpen, isActiveLink, setExpandedMenus }}
                                    />
                                )
                            ))}
                        </nav>
                    </div>

                    <div className="shrink-0 border-t border-t-yellow-400 p-4 bg-emerald-950">
                        <div className={`flex items-center ${isCollapsed ? "flex-col space-y-4" : "justify-between"}`}>
                            {/* Clickable Profile Card */}
                            <div
                                className={`flex items-center flex-1 min-w-0 cursor-pointer ${isCollapsed ? "justify-center" : ""}`}
                                onClick={() => navigate("/profile")}
                                title="Lihat Profil Saya"
                            >
                                <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border border-emerald-800/40">
                                    {user?.avatar_url ? (
                                        <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-indigo-650 font-bold">
                                            {(user?.name || "U").charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                {!isCollapsed && (
                                    <div className="min-w-0 flex-1 mr-2 ml-2.5">
                                        <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                                        <p className="text-[10px] text-emerald-400 uppercase tracking-tighter font-semibold">{user?.role}</p>
                                    </div>
                                )}
                            </div>

                            {/* Logout Action */}
                            {!isCollapsed && (
                                <button
                                    onClick={onLogout}
                                    disabled={logoutLoading}
                                    className="p-2 rounded-lg text-emerald-400/70 hover:text-red-400 hover:bg-red-950/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Logout"
                                >
                                    {logoutLoading ? (
                                        <div className="w-[18px] h-[18px] border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <LogOut size={18} />
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;