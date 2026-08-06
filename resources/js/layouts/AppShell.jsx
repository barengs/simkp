import { Outlet } from 'react-router-dom';
import Sidebar from './partials/Sidebar';
import Navbar from './partials/Navbar';
import Footer from './partials/Footer';

function AppShell() {
    return (
        <div className="min-h-screen bg-gray-100">
            <Sidebar />
            <div className="md:pl-64 flex flex-col flex-1">
                <Navbar />
                <main className="flex-1 pb-20">
                    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                        <div className="px-4 py-6 sm:px-0">
                            <Outlet />
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    );
}

export default AppShell;
