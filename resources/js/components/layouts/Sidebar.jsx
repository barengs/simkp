import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Calendar,
    Lightbulb,
    ClipboardList,
    CheckCircle,
    UserCircle,
    BarChart3,
    FileText,
    Settings,
    BookOpen,
    Users,
    LogOut,
    ChevronRight
} from "lucide-react";

const Sidebar = ({
    user,
    onLogout,
    sidebarOpen,
    setSidebarOpen,
    isCollapsed,
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [expandedMenus, setExpandedMenus] = useState({});

    const toggleMenu = (menuId) => {
        setExpandedMenus((prev) => ({
            ...prev,
            [menuId]: !prev[menuId],
        }));
    };

    // Helper to check if a path is active
    const isPathActive = (path) => {
        if (!path) return false;
        return location.pathname === `/${path}` || location.pathname.startsWith(`/${path}/`);
    };

    // Navigation items based on role
    const getNavigation = () => {
        const role = (user?.role || "admin").toLowerCase();

        switch (role) {
            case "admin":
                return [
                    { name: "Dashboard", path: "admin", icon: LayoutDashboard },
                    { name: "Manajemen Periode", path: "period-management", icon: Calendar },
                    { name: "Manajemen Tema", path: "theme/management", icon: Lightbulb },
                    {
                        name: "Master Data",
                        id: "master-data",
                        icon: ClipboardList,
                        children: [
                            { name: "Dosen", path: "master/dosen" },
                            { name: "Mahasiswa", path: "master/mahasiswa" },
                            { name: "Mitra", path: "master/mitra" },
                        ],
                    },
                    {
                        name: "Validasi Pendaftaran",
                        path: "registration/validation",
                        icon: CheckCircle,
                    },
                    {
                        name: "Plotting Dosen",
                        path: "lecturer-plotting",
                        icon: UserCircle,
                    },
                    { name: "Monitoring", path: "monitoring", icon: BarChart3 },
                    { name: "Laporan", path: "reports", icon: FileText },
                    { name: "Pengaturan", path: "settings", icon: Settings },
                ];
            case "mahasiswa":
                return [
                    { name: "Dashboard", path: "mahasiswa", icon: LayoutDashboard },
                    {
                        name: "Pendaftaran KP",
                        path: "student/registration",
                        icon: FileText,
                    },
                    { name: "Logbook", path: "student/logbook", icon: BookOpen },
                ];
            case "dosen":
                return [
                    { name: "Dashboard", path: "dosen", icon: LayoutDashboard },
                    {
                        name: "Validasi Logbook",
                        path: "logbook/validation",
                        icon: CheckCircle,
                    },
                    { name: "Bimbingan", path: "guidance", icon: Users },
                ];
            default:
                return [{ name: "Dashboard", path: "dashboard", icon: LayoutDashboard }];
        }
    };

    const navigation = getNavigation();
    const sidebarWidth = isCollapsed ? "md:w-20" : "md:w-64";

    const renderMenuItem = (item, level = 0) => {
        const hasChildren = item.children && item.children.length > 0;
        const Icon = item.icon;
        const menuId = item.id || item.path;
        const isExpanded = expandedMenus[menuId];

        // Active state logic
        const isActive = isPathActive(item.path);
        const isChildActive = hasChildren && item.children.some(child => isPathActive(child.path));
        const shouldHighlight = isActive || isChildActive;

        return (
            <div key={menuId} className="relative group">
                <button
                    onClick={() => {
                        if (hasChildren) {
                            if (isCollapsed) return;
                            toggleMenu(menuId);
                        } else {
                            navigate(`/${item.path}`);
                            setSidebarOpen(false);
                        }
                    }}
                    title={isCollapsed ? item.name : ""}
                    className={`${shouldHighlight
                        ? level === 0
                            ? "bg-indigo-100 text-indigo-600"
                            : "bg-indigo-50 text-indigo-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        } group w-full flex items-center px-2 py-2 text-sm font-medium ${isCollapsed ? "justify-center" : ""
                        } ${level > 0 ? "pl-11" : ""}`}
                >
                    <span className={`${isCollapsed ? "" : "mr-3"}`}>
                        {Icon && <Icon className="h-5 w-5" />}
                    </span>
                    {!isCollapsed && (
                        <>
                            <span className="flex-1 text-left">{item.name}</span>
                            {hasChildren && (
                                <ChevronRight
                                    className={`ml-2 h-4 w-4 transform transition-transform ${isExpanded ? "rotate-90" : ""
                                        }`}
                                />
                            )}
                        </>
                    )}
                </button>
                {hasChildren && isExpanded && !isCollapsed && (
                    <div className="space-y-1">
                        {item.children.map((child) => renderMenuItem(child, level + 1))}
                    </div>
                )}

                {hasChildren && isCollapsed && (
                    <div className="hidden group-hover:block absolute left-full top-0 w-56 bg-white shadow-xl rounded-r-md border border-gray-200 z-50 ml-1">
                        <div className="py-2">
                            <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-1">
                                {item.name}
                            </div>
                            {item.children.map((child) => (
                                <button
                                    key={child.path}
                                    onClick={() => {
                                        navigate(`/${child.path}`);
                                    }}
                                    className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-150 ${isPathActive(child.path)
                                        ? "bg-indigo-50 text-indigo-600 font-medium"
                                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
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

    return (
        <>
            {/* Mobile sidebar */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 flex md:hidden">
                    <div
                        className="fixed inset-0 bg-gray-600 bg-opacity-75"
                        onClick={() => setSidebarOpen(false)}
                    ></div>
                    <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                        <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                            <div className="flex-shrink-0 flex items-center px-4">
                                <h1 className="text-xl font-bold text-indigo-600">
                                    SIMKP{" "}
                                    {user?.role === "admin"
                                        ? "Admin"
                                        : user?.role === "mahasiswa"
                                            ? "Mahasiswa"
                                            : "Dosen"}
                                </h1>
                            </div>
                            <nav className="mt-5 px-2 space-y-1">
                                {navigation.map((item) => renderMenuItem(item))}
                            </nav>
                        </div>
                        <div className="shrink-0 flex border-t border-gray-200 p-4">
                            <div className="flex items-center w-full">
                                <div className="flex-1 min-w-0">
                                    <div className="text-base font-medium text-gray-800 truncate">
                                        {user?.name}
                                    </div>
                                    <div className="text-sm font-medium text-gray-500 truncate">
                                        {user?.role}
                                    </div>
                                </div>
                                <button
                                    onClick={onLogout}
                                    className="ml-2 bg-red-100 p-2 text-red-600 hover:bg-red-200 rounded-md transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Static sidebar for desktop */}
            <div
                className={`hidden md:flex ${sidebarWidth} md:flex-col md:fixed md:inset-y-0 transition-all duration-300 z-30`}
            >
                <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
                    <div className={`flex-1 flex flex-col pt-5 pb-4 ${isCollapsed ? 'overflow-visible' : 'overflow-y-auto'}`}>
                        <div
                            className={`flex items-center shrink-0 px-4 ${isCollapsed ? "justify-center" : ""
                                }`}
                        >
                            {isCollapsed ? (
                                <span className="text-xl font-bold text-indigo-600">
                                    S
                                </span>
                            ) : (
                                <h1 className="text-xl font-bold text-indigo-600 truncate">
                                    SIMKP
                                </h1>
                            )}
                        </div>
                        <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
                            {navigation.map((item) => renderMenuItem(item))}
                        </nav>
                    </div>
                    <div className="shrink-0 flex border-t border-gray-200 p-4">
                        <div
                            className={`flex items-center w-full ${isCollapsed
                                ? "justify-center flex-col space-y-2"
                                : ""
                                }`}
                        >
                            {!isCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-900 truncate">
                                        {user?.name}
                                    </div>
                                    <div className="text-xs font-medium text-gray-500 truncate">
                                        {user?.role}
                                    </div>
                                </div>
                            )}
                            <button
                                onClick={onLogout}
                                className={`${isCollapsed ? "p-2" : "ml-2 p-2"
                                    } bg-red-100 text-red-600 hover:bg-red-200 rounded-md transition-colors`}
                                title="Logout"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;

