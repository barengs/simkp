import React from 'react';

const Navbar = ({ title, user, setSidebarOpen, isCollapsed, setIsCollapsed }) => {
    return (
        <div className="sticky top-0 z-10 shadow-sm">
            <nav className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sm:px-6">
                <div className="flex items-center">
                    <button
                        type="button"
                        className="md:hidden mr-3 text-gray-500 hover:text-gray-600"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <h1 className="text-lg font-medium text-gray-900">{title}</h1>
                </div>
                <div className="flex items-center space-x-4">
                    <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </button>
                    <div className="ml-3 relative">
                        <div className="flex items-center">
                            <div className="text-sm text-gray-700 mr-2">{user?.name}</div>
                            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                <span className="text-emerald-600 font-medium">{(user?.name || 'A').charAt(0)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
