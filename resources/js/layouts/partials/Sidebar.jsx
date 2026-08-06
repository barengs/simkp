import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import {
    LayoutDashboard,
    Users,
    UserCog,
    UserPlus,
    ClipboardList,
    Briefcase,
    CalendarDays,
    Lightbulb,
    CheckCircle,
    BookOpen,
    FileText,
    Settings,
    Shield,
    ChevronLeft,
    ChevronRight,
    LogOut,
} from 'lucide-react';
import { menuConfig } from '../../config/menuConfig';

const iconMap = {
    LayoutDashboard,
    Users,
    UserCog,
    UserPlus,
    ClipboardList,
    Briefcase,
    CalendarDays,
    Lightbulb,
    CheckCircle,
    BookOpen,
    FileText,
    Settings,
    Shield,
};

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState({});
    const { permissions } = useSelector((s) => s.auth);
    const dispatch = useDispatch();
    const location = useLocation();

    const toggleMenu = (menuId) => {
        setExpandedMenus((prev) => ({ ...prev, [menuId]: !prev[menuId] }));
    };

    const visibleMenu = menuConfig.filter((m) => !m.permission || permissions.includes(m.permission));

    const renderMenuItem = (item, level = 0) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedMenus[item.label];
        const isActive = location.pathname === item.path;

        const IconComponent = iconMap[item.icon] || LayoutDashboard;

        return (
            <div key={item.path || item.label}>
                <button
                    onClick={() => {
                        if (hasChildren) {
                            toggleMenu(item.label);
                        } else {
                            setSidebarOpen(false);
                        }
                    }}
                    title={isCollapsed ? item.label : ''}
                    className={`w-full flex items-center px-2 py-2 text-sm font-medium transition-colors duration-150 border-l-4 ${
                        isActive && !hasChildren
                            ? 'bg-yellow-300 text-gray-900 border-yellow-400'
                            : 'text-emerald-50 hover:bg-emerald-700 border-transparent'
                    } ${isCollapsed ? 'justify-center' : ''} ${level > 0 ? 'pl-11' : ''}`}
                >
                    <span className={isCollapsed ? '' : 'mr-3'}>
                        <IconComponent className="h-5 w-5" />
                    </span>
                    {!isCollapsed && (
                        <>
                            <span className="flex-1 text-left">{item.label}</span>
                            {hasChildren && (
                                <svg
                                    className={`ml-2 h-4 w-4 transform transition-transform ${
                                        isExpanded ? 'rotate-90' : ''
                                    }`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            )}
                        </>
                    )}
                </button>
                {hasChildren && isExpanded && !isCollapsed && (
                    <div className="space-y-1">
                        {item.children
                            .filter((child) => !child.permission || permissions.includes(child.permission))
                            .map((child) => renderMenuItem(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 flex md:hidden">
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
                    <div className="relative flex-1 flex flex-col max-w-xs w-full bg-emerald-800">
                        <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                            <div className="flex-shrink-0 flex items-center px-4">
                                <h1 className="text-xl font-bold text-yellow-300">SIM-KPTA</h1>
                            </div>
                            <nav className="mt-5 px-2 space-y-1">{visibleMenu.map((item) => renderMenuItem(item))}</nav>
                        </div>
                        <div className="flex-shrink-0 flex border-t border-emerald-700 p-4">
                            <button
                                onClick={() => {
                                    dispatch(logout());
                                    setSidebarOpen(false);
                                }}
                                className="flex items-center w-full text-emerald-100 hover:text-white"
                            >
                                <LogOut className="h-5 w-5 mr-3" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className={`hidden md:flex ${isCollapsed ? 'md:w-20' : 'md:w-64'} md:flex-col md:fixed md:inset-y-0 transition-all duration-300 z-30`}>
                <div className="flex-1 flex flex-col min-h-0 bg-emerald-800 border-r border-emerald-700">
                    <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                        <div className={`flex items-center flex-shrink-0 px-4 ${isCollapsed ? 'justify-center' : ''}`}>
                            {isCollapsed ? (
                                <span className="text-xl font-bold text-yellow-300">S</span>
                            ) : (
                                <h1 className="text-xl font-bold text-yellow-300 truncate">SIM-KPTA</h1>
                            )}
                        </div>
                        <nav className="mt-5 flex-1 px-2 bg-emerald-800 space-y-1">{visibleMenu.map((item) => renderMenuItem(item))}</nav>
                    </div>
                    <div className="flex-shrink-0 flex border-t border-emerald-700 p-4">
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="flex items-center w-full text-emerald-100 hover:text-white"
                        >
                            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5 mr-2" />}
                            {!isCollapsed && <span>Collapse</span>}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
