import React from "react";
import { Menu, Bell, PanelLeftClose, PanelLeftOpen, LogOut } from "lucide-react";

const Navbar = ({ 
    title = "Dashboard", 
    user = {}, 
    setSidebarOpen = () => {}, 
    isCollapsed = false, 
    setIsCollapsed = () => {},
    onLogout = () => {}
}) => {
    return (
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
            <nav className="flex items-center justify-between px-4 py-3 sm:px-6">
                <div className="flex items-center">
                    {/* Mobile Toggle */}
                    <button
                        type="button"
                        className="md:hidden mr-3 text-gray-500 hover:text-indigo-600 transition-colors"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    {/* Desktop Collapse Toggle */}
                    <button
                        type="button"
                        className="hidden md:inline-flex mr-4 text-gray-500 hover:text-indigo-600 focus:outline-none transition-colors"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        {isCollapsed ? <PanelLeftOpen className="h-6 w-6" /> : <PanelLeftClose className="h-6 w-6" />}
                    </button>

                    <h1 className="text-lg font-semibold text-gray-800 tracking-tight">
                        {title}
                    </h1>
                </div>

                <div className="flex items-center space-x-3">
                    <button className="p-2 rounded-full text-gray-400 hover:bg-gray-50 hover:text-indigo-600 transition-all">
                        <Bell className="h-5 w-5" />
                    </button>
                    
                    <div className="h-8 w-px bg-gray-200 mx-2" />

                    <div className="flex items-center group cursor-pointer">
                        <div className="text-right mr-3 hidden sm:block">
                            <p className="text-sm font-bold text-gray-900 leading-none">{user?.name || "User"}</p>
                            <p className="text-[10px] font-medium text-gray-400 uppercase mt-1 tracking-wider">{user?.role || "Guest"}</p>
                        </div>
                        <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border border-emerald-800/40">
                            {user?.avatar_url ? (
                                        <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-indigo-650 font-bold">
                                            {(user?.name || "U").charAt(0).toUpperCase()}
                                        </span>
                                    )}
                            {/* <span className="text-indigo-600 font-medium">
                                {(user?.name || "U").charAt(0).toUpperCase()}
                            </span> */}
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;