import React from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';

const Navbar = ({ onToggleSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const toggleDropdown = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.classList.toggle('hidden');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 z-30 flex-shrink-0 shadow-sm shadow-slate-100">
      <div className="flex items-center gap-4">
        {/* Toggle Button (Hamburger) */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all focus:outline-none cursor-pointer"
        >
          <svg data-lucide="menu" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Page Info */}
        <div className="ml-1">
          <h1 className="text-base md:text-lg font-bold text-slate-800 leading-tight">Dashboard Utama</h1>
          <p className="hidden sm:block text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-0.5">
            Sistem Manajemen Sekolah
          </p>
        </div>
      </div>

      {/* Header Right Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Global Search */}
        <div className="relative hidden lg:block">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <svg data-lucide="search" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
            </svg>
          </span>
          <input
            type="text"
            className="w-64 py-2 pl-9 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder-slate-400"
            placeholder="Cari menu, guru, atau siswa..."
          />
        </div>

        {/* Notification Bell Center with Dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('notificationDropdown')}
            className="relative p-2.5 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-100 transition-all cursor-pointer"
          >
            <svg data-lucide="bell" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14V11a6 6 0 10-12 0v3a2 2 0 01-.6 1.4L4 17h5m4 4a2 2 0 01-4 0" />
            </svg>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
          </button>
          {/* Notification Dropdown */}
          <div id="notificationDropdown" className="hidden absolute right-0 mt-2 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-xs font-bold text-slate-800">Notifikasi Terbaru</span>
              <button className="text-[10px] font-bold text-emerald-600 hover:underline">Tandai semua dibaca</button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              <a href="#" className="block px-4 py-3 hover:bg-slate-50 border-b border-slate-100/60 transition-colors">
                <p className="text-xs text-slate-700">Backup database sistem berhasil disinkronkan.</p>
                <span className="text-[10px] text-slate-400 mt-1 block">10 menit yang lalu</span>
              </a>
              <a href="#" className="block px-4 py-3 hover:bg-slate-50 border-b border-slate-100/60 transition-colors">
                <p className="text-xs text-slate-700"><strong>Pendaftaran Siswa Baru</strong> telah dibuka untuk angkatan 2026/2027.</p>
                <span className="text-[10px] text-slate-400 mt-1 block">1 jam yang lalu</span>
              </a>
              <a href="#" className="block px-4 py-3 hover:bg-slate-50 transition-colors">
                <p className="text-xs text-slate-700"><span className="text-amber-500">Peringatan:</span> Sesi login terdeteksi dari IP baru.</p>
                <span className="text-[10px] text-slate-400 mt-1 block">5 jam yang lalu</span>
              </a>
            </div>
            <div className="px-4 py-2 border-t border-slate-100 text-center bg-slate-50">
              <a href="#" className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 block">Lihat Semua Notifikasi</a>
            </div>
          </div>
        </div>

        {/* Separator Line */}
        <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block" />

        {/* Avatar User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('profileDropdown')}
            className="flex items-center gap-2 pl-1 cursor-pointer group select-none"
          >
            <img
              className="w-9 h-9 rounded-xl border-2 border-transparent group-hover:border-emerald-500 transition-all duration-200 shadow-sm"
              src={`https://ui-avatars.com/api/?name=${user?.name?.split(' ')[0] || 'User'}&background=d1fae5&color=065f46&size=64`}
              alt="Avatar"
            />
            <div className="hidden md:block text-left">
              <p className="text-sm font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">{user?.name}</p>
              <p className="text-[10px] text-emerald-500 font-semibold leading-none mt-0.5">Online</p>
            </div>
            <svg data-lucide="chevron-down" className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors hidden md:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {/* Profile Dropdown */}
          <div id="profileDropdown" className="hidden absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <p className="text-xs text-slate-400 font-medium">Masuk sebagai</p>
              <p className="text-sm font-bold text-slate-800 truncate">{user?.email}</p>
            </div>
            <div className="p-1.5">
              <a href="#" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors">
                <svg data-lucide="user" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Profil Saya</span>
              </a>
              <a href="#" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors">
                <svg data-lucide="settings-2" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.32 4.86c-.07-.43-.27-.87-.52-1.21A2 2 0 0012 2h0a2 2 0 012.2 1.65c.04.2.12.43.28.61M... " />
                </svg>
                <span>Pengaturan Sistem</span>
              </a>
              <div className="h-px bg-slate-100 my-1" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <svg data-lucide="log-out" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-semibold">Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
