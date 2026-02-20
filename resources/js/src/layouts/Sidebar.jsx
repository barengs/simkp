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
    UserPlus,
    TrendingUp,
    FileText,
    Settings,
    FileEdit,
    Book,
    Users,
    LogOut,
    ChevronRight
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
                className={`
                    ${isActive || isParentActive
                        ? level === 0 ? "bg-indigo-100 text-indigo-600" : "bg-indigo-50 text-indigo-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    } group w-full flex items-center px-3 py-2 text-sm font-medium transition-colors duration-200
                    ${isCollapsed ? "justify-center" : ""} 
                    ${level > 0 ? "pl-11" : ""}
                    rounded-md
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
                <div className="hidden group-hover:block absolute left-full top-0 w-48 bg-white shadow-xl rounded-r-md border border-gray-200 z-50 ml-2">
                    <div className="py-2">
                        <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 mb-1">
                            {item.name}
                        </div>
                        {item.children.map((child) => (
                            <button
                                key={child.path}
                                onClick={() => {
                                    navigate(child.path);
                                    setSidebarOpen(false);
                                }}
                                className={`block w-full text-left px-4 py-2 text-sm ${isActiveLink(child.path) ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-700 hover:bg-gray-50"
                                    }`}
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
    const { loading: logoutLoading } = useSelector((state) => state.auth);
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
        const role = (user?.role || "admin").toLowerCase();
        switch (role) {
            case "admin":
                return [
                    { name: "Dashboard", path: "/", icon: <LayoutDashboard size={18} /> },
                    { name: "Periode", path: "/admin/period-management", icon: <Calendar size={18} /> },
                    { name: "Tema", path: "/admin/theme-management", icon: <Palette size={18} /> },
                    {
                        name: "Master Data",
                        id: "master-data",
                        icon: <Database size={18} />,
                        children: [
                            { name: "Dosen", path: "/admin/master-dosen" },
                            { name: "Mahasiswa", path: "/admin/master-mahasiswa" },
                            { name: "Mitra", path: "/admin/master-mitra" },
                        ],
                    },
                    { name: "Validasi", path: "/admin/registration-validation", icon: <CheckSquare size={18} /> },
                    { name: "Plotting", path: "/admin/lecturer-plotting", icon: <UserPlus size={18} /> },
                    { name: "Monitoring", path: "/admin/monitoring", icon: <TrendingUp size={18} /> },
                    { name: "Laporan", path: "/admin/reports", icon: <FileText size={18} /> },
                    { name: "Pengaturan", path: "/admin/settings", icon: <Settings size={18} /> },
                ];
            case "mahasiswa":
                return [
                    { name: "Dashboard", path: "/", icon: <LayoutDashboard size={18} /> },
                    { name: "Pendaftaran", path: "/student/registration", icon: <FileEdit size={18} /> },
                    { name: "Logbook", path: "/student/logbook", icon: <Book size={18} /> },
                ];
            case "dosen":
                return [
                    { name: "Dashboard", path: "/", icon: <LayoutDashboard size={18} /> },
                    { name: "Validasi Logbook", path: "/dosen/logbook-validation", icon: <CheckSquare size={18} /> },
                    { name: "Bimbingan", path: "/dosen/guidance", icon: <Users size={18} /> },
                ];
            default:
                return [{ name: "Dashboard", path: "/", icon: <LayoutDashboard size={18} /> }];
        }
    }, [user?.role]);

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
                            className="fixed inset-0 bg-gray-600/75 backdrop-blur-sm"
                        />
                        {/* Sidebar Panel Slide In */}
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl"
                        >
                            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto px-4">
                                <h1 className="text-xl font-bold text-indigo-600 mb-6 px-2">SIMKP</h1>
                                <nav className="space-y-1">
                                    {navigation.map((item) => (
                                        <MenuItem
                                            key={item.id || item.path}
                                            item={item}
                                            {...{ isCollapsed: false, expandedMenus, toggleMenu, navigate, setSidebarOpen, isActiveLink, setExpandedMenus }}
                                        />
                                    ))}
                                </nav>
                            </div>

                            {/* Mobile Logout Footer */}
                            <div className="shrink-0 border-t border-gray-100 p-4 bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="min-w-0 flex-1 mr-2">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">{user?.role}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSidebarOpen(false);
                                            onLogout();
                                        }}
                                        disabled={logoutLoading}
                                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                    >
                                        {logoutLoading ? (
                                            <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
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
            <div className={`hidden md:flex ${sidebarWidth} md:flex-col md:fixed md:inset-y-0 transition-all duration-300 z-30 shadow-sm`}>
                <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
                    <div className={`flex-1 flex flex-col pt-5 pb-4 ${isCollapsed ? 'overflow-visible' : 'overflow-y-auto'}`}>
                        <div className={`flex items-center shrink-0 px-5 mb-6 ${isCollapsed ? "justify-center px-0" : ""}`}>
                            <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50 border border-gray-100">
                                <img
                                    src="https://simat.uim.ac.id/assets/images/logo_0758bf53311ae872765158c3f00b323a.png"
                                    alt="Logo"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {!isCollapsed && <span className="ml-3 text-lg font-bold text-gray-900">SIMKP</span>}
                        </div>
                        <nav className="flex-1 px-3 space-y-1">
                            {navigation.map((item) => (
                                <MenuItem
                                    key={item.id || item.path}
                                    item={item}
                                    {...{ isCollapsed, expandedMenus, toggleMenu, navigate, setSidebarOpen, isActiveLink, setExpandedMenus }}
                                />
                            ))}
                        </nav>
                    </div>

                    <div className="shrink-0 border-t border-gray-100 p-4">
                        <div className={`flex items-center ${isCollapsed ? "flex-col space-y-4" : "justify-between"}`}>
                            {!isCollapsed && (
                                <div className="min-w-0 flex-1 mr-2">
                                    <p className="text-xs font-semibold text-gray-900 truncate">{user?.name}</p>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-tighter">{user?.role}</p>
                                </div>
                            )}
                            <button
                                onClick={onLogout}
                                disabled={logoutLoading}
                                className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Logout"
                            >
                                {logoutLoading ? (
                                    <div className="w-[18px] h-[18px] border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <LogOut size={18} />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;