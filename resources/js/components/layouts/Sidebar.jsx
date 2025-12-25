import React, { useState } from "react";

const Sidebar = ({
    user,
    currentView,
    onNavigate,
    onLogout,
    sidebarOpen,
    setSidebarOpen,
    isCollapsed,
}) => {
    const [expandedMenus, setExpandedMenus] = useState({});

    const toggleMenu = (menuId) => {
        setExpandedMenus((prev) => ({
            ...prev,
            [menuId]: !prev[menuId],
        }));
    };

    // Navigation items based on role
    const getNavigation = () => {
        // Ensure user and user.role exist, default to 'admin' if not
        const role = (user?.role || "admin").toLowerCase();

        switch (role) {
            case "admin":
                return [
                    { name: "Dashboard", id: "dashboard", icon: "📊" },
                    { name: "Manajemen Periode", id: "period-management", icon: "📅" },
                    { name: "Manajemen Tema", id: "theme-management", icon: "💡" },
                    {
                        name: "Master Data",
                        id: "master-data",
                        icon: "📋",
                        children: [
                            { name: "Dosen", id: "master-dosen" },
                            { name: "Mahasiswa", id: "master-mahasiswa" },
                            { name: "Mitra", id: "master-mitra" },
                        ],
                    },
                    {
                        name: "Validasi Pendaftaran",
                        id: "registration-validation",
                        icon: "✅",
                    },
                    {
                        name: "Plotting Dosen",
                        id: "lecturer-plotting",
                        icon: "👨‍🏫",
                    },
                    { name: "Monitoring", id: "monitoring", icon: "📈" },
                    { name: "Laporan", id: "reports", icon: "📄" },
                    { name: "Pengaturan", id: "settings", icon: "⚙️" },
                ];
            case "student":
                return [
                    { name: "Dashboard", id: "dashboard", icon: "📊" },
                    {
                        name: "Pendaftaran KP",
                        id: "student-registration",
                        icon: "📝",
                    },
                    { name: "Logbook", id: "student-logbook", icon: "📒" },
                ];
            case "dosen":
                return [
                    { name: "Dashboard", id: "dashboard", icon: "📊" },
                    {
                        name: "Validasi Logbook",
                        id: "logbook-validation",
                        icon: "✅",
                    },
                    { name: "Bimbingan", id: "guidance", icon: "👥" },
                ];
            default:
                return [{ name: "Dashboard", id: "dashboard", icon: "📊" }];
        }
    };

    const navigation = getNavigation();
    const sidebarWidth = isCollapsed ? "md:w-20" : "md:w-64";

    const renderMenuItem = (item, level = 0) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedMenus[item.id];
        // Check if any child is active to keep parent expanded or highlighted
        const isChildActive = hasChildren && item.children.some(child => child.id === currentView);
        
        // Auto-expand if child is active and not explicitly toggled yet
        // This is a simple check, could be improved with effects
        if (isChildActive && expandedMenus[item.id] === undefined) {
             // Side-effect in render is not ideal, but for this simple case:
             // Better to handle in useEffect, but let's just default expandedMenus state if needed
             // For now, relies on user interaction or manual expansion
        }

        const isActive = currentView === item.id || isChildActive;

        return (
            <div key={item.id} className="relative group">
                <button
                    onClick={() => {
                        if (hasChildren) {
                            if (isCollapsed) return; // Don't expand in collapsed mode (or handle differently)
                            toggleMenu(item.id);
                        } else {
                            onNavigate(item.id);
                            setSidebarOpen(false);
                        }
                    }}
                    title={isCollapsed ? item.name : ""}
                    className={`${
                        isActive
                            ? level === 0
                                ? "bg-indigo-100 text-indigo-600" // Main menu active
                                : "bg-indigo-50 text-indigo-600" // Submenu active
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    } group w-full flex items-center px-2 py-2 text-sm font-medium ${
                        isCollapsed ? "justify-center" : ""
                    } ${level > 0 ? "pl-11" : ""}`}
                >
                    <span className={`${isCollapsed ? "" : "mr-3"}`}>
                        {item.icon}
                    </span>
                    {!isCollapsed && (
                        <>
                            <span className="flex-1 text-left">{item.name}</span>
                            {hasChildren && (
                                <svg
                                    className={`ml-2 h-4 w-4 transform transition-transform ${
                                        isExpanded ? "rotate-90" : ""
                                    }`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
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
                                    key={child.id}
                                    onClick={() => {
                                        onNavigate(child.id);
                                    }}
                                    className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-150 ${
                                        currentView === child.id
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
                                    {user.role === "admin"
                                        ? "Admin"
                                        : user.role === "student"
                                        ? "Mahasiswa"
                                        : "Dosen"}
                                </h1>
                            </div>
                            <nav className="mt-5 px-2 space-y-1">
                                {navigation.map((item) => renderMenuItem(item))}
                            </nav>
                        </div>
                        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                            <div className="flex items-center w-full">
                                <div className="flex-1 min-w-0">
                                    <div className="text-base font-medium text-gray-800 truncate">
                                        {user.name}
                                    </div>
                                    <div className="text-sm font-medium text-gray-500 truncate">
                                        {user.role}
                                    </div>
                                </div>
                                <button
                                    onClick={onLogout}
                                    className="ml-2 bg-red-100 p-2 text-red-600 hover:bg-red-200"
                                    title="Logout"
                                >
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                        />
                                    </svg>
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
                            className={`flex items-center flex-shrink-0 px-4 ${
                                isCollapsed ? "justify-center" : ""
                            }`}
                        >
                            {isCollapsed ? (
                                <span className="text-xl font-bold text-indigo-600">
                                    S
                                </span>
                            ) : (
                                <h1 className="text-xl font-bold text-indigo-600 truncate">
                                    SIMKP{" "}
                                    {user.role === "admin"
                                        ? "Admin"
                                        : user.role === "student"
                                        ? "Mhs"
                                        : "Dosen"}
                                </h1>
                            )}
                        </div>
                        <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
                            {navigation.map((item) => renderMenuItem(item))}
                        </nav>
                    </div>
                    <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                        <div
                            className={`flex items-center w-full ${
                                isCollapsed
                                    ? "justify-center flex-col space-y-2"
                                    : ""
                            }`}
                        >
                            {!isCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-900 truncate">
                                        {user.name}
                                    </div>
                                    <div className="text-xs font-medium text-gray-500 truncate">
                                        {user.role}
                                    </div>
                                </div>
                            )}
                            <button
                                onClick={onLogout}
                                className={`${
                                    isCollapsed ? "p-2" : "ml-2 p-2"
                                } bg-red-100 text-red-600 hover:bg-red-200`}
                                title="Logout"
                            >
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
