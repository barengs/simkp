import React, { useState } from "react";

const AdminLayout = ({ children, title, user, currentView, onNavigate, onLogout }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Navigation items based on role
    const getNavigation = () => {
        // Ensure user and user.role exist, default to 'admin' if not
        const role = (user?.role || "admin").toLowerCase();
        
        switch (role) {
            case "admin":
                return [
                    { name: "Dashboard", id: "dashboard", icon: "📊" },
                    { name: "Periode & Tema", id: "period-theme", icon: "📅" },
                    { name: "Master Data", id: "master-data", icon: "📋" },
                    { name: "Validasi Pendaftaran", id: "registration-validation", icon: "✅" },
                    { name: "Plotting Dosen", id: "lecturer-plotting", icon: "👨‍🏫" },
                    { name: "Monitoring", id: "monitoring", icon: "📈" },
                    { name: "Laporan", id: "reports", icon: "📄" },
                    { name: "Pengaturan", id: "settings", icon: "⚙️" },
                ];
            case "student":
                return [
                    { name: "Dashboard", id: "dashboard", icon: "📊" },
                    { name: "Pendaftaran KP", id: "student-registration", icon: "📝" },
                    { name: "Logbook", id: "student-logbook", icon: "📒" },
                ];
            case "dosen":
                return [
                    { name: "Dashboard", id: "dashboard", icon: "📊" },
                    { name: "Validasi Logbook", id: "logbook-validation", icon: "✅" },
                    { name: "Bimbingan", id: "guidance", icon: "👥" },
                ];
            default:
                return [{ name: "Dashboard", id: "dashboard", icon: "📊" }];
        }
    };

    const navigation = getNavigation();

    return (
        <div className="min-h-screen bg-gray-100">
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
                                    SIMKP {user.role === 'admin' ? 'Admin' : user.role === 'student' ? 'Mahasiswa' : 'Dosen'}
                                </h1>
                            </div>
                            <nav className="mt-5 px-2 space-y-1">
                                {navigation.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            onNavigate(item.id);
                                            setSidebarOpen(false);
                                        }}
                                        className={`${
                                            currentView === item.id
                                                ? "bg-indigo-100 text-indigo-600"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        } group w-full flex items-center px-2 py-2 text-base font-medium rounded-md`}
                                    >
                                        <span className="mr-3">
                                            {item.icon}
                                        </span>
                                        {item.name}
                                    </button>
                                ))}
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
                                    className="ml-2 bg-red-100 p-2 rounded-full text-red-600 hover:bg-red-200"
                                    title="Logout"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Static sidebar for desktop */}
            <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
                <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
                    <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                        <div className="flex items-center flex-shrink-0 px-4">
                            <h1 className="text-xl font-bold text-indigo-600">
                                SIMKP {user.role === 'admin' ? 'Admin' : user.role === 'student' ? 'Mahasiswa' : 'Dosen'}
                            </h1>
                        </div>
                        <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
                            {navigation.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => onNavigate(item.id)}
                                    className={`${
                                        currentView === item.id
                                            ? "bg-indigo-100 text-indigo-600"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    } group w-full flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                                >
                                    <span className="mr-3">{item.icon}</span>
                                    {item.name}
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                        <div className="flex items-center w-full">
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                    {user.name}
                                </div>
                                <div className="text-xs font-medium text-gray-500 truncate">
                                    {user.role}
                                </div>
                            </div>
                            <button
                                onClick={onLogout}
                                className="ml-2 bg-red-100 p-2 rounded-full text-red-600 hover:bg-red-200"
                                title="Logout"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="md:pl-64 flex flex-col flex-1">
                {/* Top Navigation */}
                <div className="sticky top-0 z-10 shadow-sm">
                    <nav className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sm:px-6">
                        <div className="flex items-center">
                            <button
                                type="button"
                                className="md:hidden mr-3 text-gray-500 hover:text-gray-600"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            </button>
                            <h1 className="text-lg font-medium text-gray-900">
                                {title}
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                    />
                                </svg>
                            </button>
                            <div className="ml-3 relative">
                                <div className="flex items-center">
                                    <div className="text-sm text-gray-700 mr-2">
                                        {user.name}
                                    </div>
                                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                        <span className="text-indigo-600 font-medium">
                                            {/* Safe access for user name initial */}
                                            {(user?.name || "A").charAt(0)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </nav>
                </div>

                {/* Main Content */}
                <main className="flex-1 pb-20">
                    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                        <div className="px-4 py-6 sm:px-0">{children}</div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="bg-white border-t border-gray-200 py-6 fixed bottom-0 right-0 left-0 md:left-64 z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <p className="text-center text-sm text-gray-500">
                            © {new Date().getFullYear()} SIMKP - Sistem
                            Informasi Kerja Praktek
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default AdminLayout;
