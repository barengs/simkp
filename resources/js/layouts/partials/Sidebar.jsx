// Sidebar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ChevronDown,
  Database,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { menuConfig } from '../../config/menuConfig';

const Sidebar = ({ isOpen = true }) => {
  const location = useLocation();
  const { user, permissions } = useSelector((state) => state.auth);
  const [openMenus, setOpenMenus] = useState({});

  const visibleMenu = menuConfig.filter(
    (item) => !item.permission || permissions.includes(item.permission)
  );

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const toggleSubmenu = (label) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <aside
      id="sidebar"
      className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-emerald-950 text-white shadow-2xl transition-all duration-300 ease-in-out 
        /* Mobile logic */
        ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} 
        /* Desktop logic (md ke atas) */
        md:translate-x-0 ${isOpen ? 'md:w-64' : 'md:w-[4.5rem]'} md:relative`}
    >
      {/* Brand / Logo */}
      <div className={`flex items-center h-16 border-b border-emerald-900/60 flex-shrink-0 overflow-hidden ${isOpen ? 'gap-3 px-6' : 'gap-0 px-4 justify-center'}`}>
        <div className="flex items-center justify-center w-8 h-8 bg-emerald-500 rounded-lg flex-shrink-0 shadow-lg shadow-emerald-500/20">
          <Database className="w-5 h-5 text-white" />
        </div>
        {isOpen && (
          <span className="text-lg font-bold tracking-tight whitespace-nowrap transition-opacity duration-200">
            SIM <span className="text-emerald-400">KPTA</span>
          </span>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto custom-scroll">
        {visibleMenu.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          const hasChildren = item.children && item.children.length > 0;
          const isOpenSubmenu = openMenus[item.label] || active;

          if (hasChildren) {
            return (
              <div key={item.label} className="space-y-1">
                <button
                  onClick={() => toggleSubmenu(item.label)}
                  title={isOpen ? item.label : undefined}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isOpen ? '' : 'justify-center px-0'
                  } ${
                    active
                      ? 'bg-emerald-800 text-white shadow-inner'
                      : 'text-emerald-100 hover:bg-emerald-900/60 hover:text-white'
                  }`}
                >
                  <div className={`flex items-center gap-3 ${!isOpen ? 'flex-1 justify-center' : ''}`}>
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {isOpen && <span className="whitespace-nowrap">{item.label}</span>}
                  </div>
                  {isOpen && (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isOpenSubmenu ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </button>
                
                {isOpenSubmenu && isOpen && (
                  <div className="ml-9 space-y-1 mt-1 border-l border-emerald-800/50 pl-2">
                    {item.children.map((child) => {
                      const childActive = location.pathname === child.path;
                      return (
                        <Link
                          key={child.path}
                          to={child.path}
                          className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            childActive
                              ? 'text-emerald-400 bg-emerald-900/40'
                              : 'text-emerald-200/70 hover:text-white hover:bg-emerald-900/20'
                          }`}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              title={isOpen ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                !isOpen ? 'justify-center px-0' : ''
              } ${
                active
                  ? 'bg-emerald-800 text-white shadow-inner'
                  : 'text-emerald-100 hover:bg-emerald-900/60 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {isOpen && <span className="whitespace-nowrap">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar User Footer */}
      <div className={`border-t border-emerald-900/60 flex-shrink-0 ${isOpen ? 'p-4' : 'p-2 flex justify-center'}`}>
        <div className={`flex items-center gap-3 ${!isOpen ? 'justify-center' : ''}`}>
          <img
            className="w-9 h-9 rounded-xl border-2 border-emerald-500 shadow-md shadow-emerald-500/20 flex-shrink-0"
            src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=10b981&color=fff&size=64`}
            alt="Avatar"
            title={user?.name}
          />
          {isOpen && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                {user?.roles?.[0] || 'User'}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;