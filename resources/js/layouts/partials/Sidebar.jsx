import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { menuConfig } from '../../config/menuConfig';

const Sidebar = () => {
  const location = useLocation();
  const { user, permissions } = useSelector((state) => state.auth);

  const visibleMenu = menuConfig.filter(
    (item) => !item.permission || permissions.includes(item.permission)
  );

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200">
        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">SIM</span>
        </div>
        <div>
          <h1 className="text-sm font-bold text-gray-900">SIM-KPTA</h1>
          <p className="text-xs text-gray-500">Manajemen KP & TA</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {visibleMenu.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          if (item.children) {
            return (
              <div key={item.label}>
                <div
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    active
                      ? 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                <div className="ml-6 mt-1 space-y-1">
                  {item.children.map((child) => {
                    const childActive = location.pathname === child.path;
                    return (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
                          childActive
                            ? 'bg-yellow-50 text-yellow-800 border-l-2 border-yellow-400'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                active
                  ? 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
            <span className="text-emerald-700 font-medium text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
