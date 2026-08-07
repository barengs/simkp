import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './partials/Sidebar';
import Navbar from './partials/Navbar';
import Footer from './partials/Footer';

const AppShell = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <Navbar />
        <main className="p-6">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AppShell;
