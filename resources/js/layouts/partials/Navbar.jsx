import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import { Bell, Search, ChevronDown, LogOut, Settings, User, Menu, CheckCircle2, Shield } from 'lucide-react';
import { menuConfig } from '../../config/menuConfig';
import axios from 'axios';

const Navbar = ({ onToggleSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, roles = [] } = useSelector((state) => state.auth);

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setProfileOpen(false);
        setNotifOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('/api/logout');
    } catch (e) {
      // ignore
    } finally {
      dispatch(logout());
      navigate('/login');
    }
  };

  const currentPath = location.pathname;
  const currentMenuItem = menuConfig.find((item) => {
    if (item.children) {
      return item.children.some((child) => currentPath.startsWith(child.path));
    }
    return currentPath.startsWith(item.path);
  });

  const getPageTitle = () => {
    if (currentMenuItem?.children) {
      const child = currentMenuItem.children.find((child) => currentPath.startsWith(child.path));
      return child?.label || currentMenuItem.label;
    }
    return currentMenuItem?.label || 'Dashboard';
  };

  const primaryRole = roles[0] || 'User';

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 md:px-6 z-30 shrink-0 shadow-2xs">
      <div className="flex items-center gap-3">
        {/* Toggle Button (Hamburger) */}
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar"
          className="p-2 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50/80 transition-colors focus:outline-hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page Info & Clickable Breadcrumbs */}
        <div className="ml-1">
          <h1 className="text-base md:text-lg font-bold text-slate-800 leading-tight">
            {getPageTitle()}
          </h1>
          <nav className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mt-0.5">
            <Link to="/dashboard" className="hover:text-emerald-600 transition-colors">
              SIM-KPTA
            </Link>
            {currentMenuItem && currentMenuItem.path !== '/dashboard' && currentMenuItem.path !== '/' && (
              <>
                <span>/</span>
                <span className="text-slate-600 font-semibold">{currentMenuItem.label}</span>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Header Right Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setNotifOpen((prev) => !prev);
              setProfileOpen(false);
            }}
            aria-label="Notifikasi"
            className={`relative p-2.5 rounded-xl transition-all cursor-pointer ${
              notifOpen
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-slate-500 hover:text-emerald-700 hover:bg-emerald-50/80'
            }`}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 md:w-88 bg-white border border-slate-200/90 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <span className="text-xs font-bold text-slate-800">Notifikasi Aktivitas</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Baru
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 text-left">
                <div className="p-3.5 hover:bg-slate-50/70 transition-colors">
                  <div className="flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-700 leading-snug">
                        Sistem Informasi SIM-KPTA versi 2.0 aktif.
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">Baru saja</span>
                    </div>
                  </div>
                </div>
                <div className="p-3.5 hover:bg-slate-50/70 transition-colors">
                  <div className="flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-700 leading-snug">
                        Periode pendaftaran KP dan TA berjalan aktif.
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">1 jam yang lalu</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-2.5 border-t border-slate-100 text-center bg-slate-50/50">
                <span className="text-[11px] font-bold text-slate-500">Semua notifikasi tersinkron</span>
              </div>
            </div>
          )}
        </div>

        {/* Separator Line */}
        <div className="h-6 w-px bg-slate-200/80 hidden sm:block mx-0.5" />

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setProfileOpen((prev) => !prev);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group select-none"
          >
            <div className="relative">
              <img
                className="w-9 h-9 rounded-full ring-2 ring-emerald-500/20 group-hover:ring-emerald-500 transition-all object-cover shrink-0"
                src={
                  user?.profile_picture_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user?.name || 'User'
                  )}&background=059669&color=fff&size=64`
                }
                alt="Avatar"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>

            <div className="hidden md:block text-left max-w-36">
              <p className="text-xs font-bold text-slate-800 truncate group-hover:text-emerald-700 transition-colors">
                {user?.name || 'Pengguna'}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-1.5 py-0.2 rounded-sm border border-emerald-200/60">
                  {primaryRole}
                </span>
              </div>
            </div>

            <ChevronDown
              className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 hidden md:block ${
                profileOpen ? 'rotate-180 text-emerald-600' : ''
              }`}
            />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200/90 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 border-b border-slate-100 bg-slate-50/80">
                <p className="text-[11px] text-slate-400 font-medium">Masuk sebagai</p>
                <p className="text-sm font-bold text-slate-800 truncate mt-0.5">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>

              <div className="p-1.5 space-y-0.5">
                <Link
                  to="/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Profil & Akun</span>
                </Link>

                <Link
                  to="/pengaturan"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Pengaturan Sistem</span>
                </Link>

                <div className="h-px bg-slate-100 my-1" />

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
