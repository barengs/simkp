import { Menu, Bell, PanelLeftClose, PanelLeftOpen, LogOut, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = ({ title, setSidebarOpen, isCollapsed, setIsCollapsed }) => {
    const { user, logout } = useAuth();

    return (
        <div className="sticky top-0 z-10 shadow-sm">
            <nav className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sm:px-6">
                <div className="flex items-center">
                    <button
                        type="button"
                        className="md:hidden mr-3 text-gray-500 hover:text-gray-600"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    {/* Collapse Button (Desktop) */}
                    <button
                        type="button"
                        className="hidden md:inline-flex mr-4 text-gray-500 hover:text-gray-600 focus:outline-none"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        {isCollapsed ? (
                            <PanelLeftOpen className="h-6 w-6" />
                        ) : (
                            <PanelLeftClose className="h-6 w-6" />
                        )}
                    </button>

                    <h1 className="text-lg font-medium text-gray-900">
                        {title}
                    </h1>
                </div>
                <div className="flex items-center space-x-4">
                    <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
                        <Bell className="h-6 w-6" />
                    </button>

                    <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-gray-900 leading-tight">{user?.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                        </div>
                        <div className="h-9 w-9 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
                            <span className="text-indigo-600 font-bold">
                                {(user?.name || "U").charAt(0).toUpperCase()}
                            </span>
                        </div>
                        {/* <button
                            onClick={logout}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors focus:outline-none"
                            title="Keluar"
                        >
                            <LogOut className="h-5 w-5" />
                        </button> */}
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
