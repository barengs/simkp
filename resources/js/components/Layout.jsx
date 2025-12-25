import React from "react";

const Layout = ({ children, title }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 flex items-center">
                                <h1 className="text-xl font-bold text-indigo-600">
                                    SIMKP
                                </h1>
                            </div>
                        </div>
                        <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
                            <a
                                href="#"
                                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Dashboard
                            </a>
                            <a
                                href="#"
                                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Profile
                            </a>
                            <a
                                href="#"
                                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Logout
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">
                            {title}
                        </h1>
                        {children}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white mt-8 py-4 border-t">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
                    <p>
                        © {new Date().getFullYear()} SIMKP - Sistem Informasi
                        Kerja Praktek
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
