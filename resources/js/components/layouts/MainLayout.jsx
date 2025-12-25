import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";

const MainLayout = ({
    children,
    title,
    user,
    currentView,
    onNavigate,
    onLogout,
}) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const contentPadding = isCollapsed ? "md:pl-20" : "md:pl-64";

    return (
        <div className="min-h-screen bg-gray-100">
            <Sidebar
                user={user}
                currentView={currentView}
                onNavigate={onNavigate}
                onLogout={onLogout}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                isCollapsed={isCollapsed}
            />

            <div
                className={`${contentPadding} flex flex-col flex-1 transition-all duration-300`}
            >
                <Navbar
                    title={title}
                    user={user}
                    setSidebarOpen={setSidebarOpen}
                    isCollapsed={isCollapsed}
                    setIsCollapsed={setIsCollapsed}
                />

                {/* Main Content */}
                <main className="flex-1 pb-20">
                    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                        <div className="px-4 py-6 sm:px-0">{children}</div>
                    </div>
                </main>

                <Footer isCollapsed={isCollapsed} />
            </div>
        </div>
    );
};

export default MainLayout;
