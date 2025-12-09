import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '@/Components/Sidebar';
import { Head, Link } from '@inertiajs/react';
import { 
  Menu, Search, Bell, ChevronDown, 
  LogOut, User, Settings, Check 
} from 'lucide-react';

export default function AuthenticatedLayout({ user, header, children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Handle Resize: Auto-close sidebar on mobile, Auto-open on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    if (typeof window !== 'undefined') {
       handleResize(); // Initial check
       window.addEventListener('resize', handleResize);
    }
    return () => {
        if (typeof window !== 'undefined') window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle Click Outside untuk menutup dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden relative">
      <Head title={title} />

      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50/50 transition-all duration-300">
        
        {/* --- TOPBAR HEADER --- */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-8 z-20 sticky top-0 shadow-sm">
          
          <div className="flex items-center flex-1">
            {/* Toggle Sidebar Button */}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 -ml-2 mr-2 rounded-lg hover:bg-slate-100 text-slate-600 focus:outline-none transition-colors"
            >
              <Menu size={22} />
            </button>
            
            {/* Search Bar */}
            <div className="hidden md:flex relative group max-w-md w-full transition-all">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Cari surat, event, atau barang..." 
                className="pl-10 pr-4 py-2 bg-slate-100 border border-transparent focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100/50 rounded-full text-sm w-full transition-all outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4 ml-4">
            
            {/* --- NOTIFICATION DROPDOWN --- */}
            <div className="relative" ref={notifRef}>
                <button 
                    onClick={() => setNotifOpen(!notifOpen)}
                    className={`relative p-2 rounded-full transition-colors ${notifOpen ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm animate-pulse"></span>
                </button>

                {/* Notif Menu */}
                {notifOpen && (
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in origin-top-right">
                        <div className="px-4 py-2 border-b border-slate-50 flex justify-between items-center">
                            <span className="font-bold text-sm text-slate-700">Notifikasi</span>
                            <span className="text-xs text-indigo-600 cursor-pointer hover:underline">Tandai semua dibaca</span>
                        </div>
                        <div className="max-h-64 overflow-y-auto custom-scrollbar">
                            {/* Mock Notification Items */}
                            <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50">
                                <div className="flex items-start">
                                    <div className="mt-1 p-1.5 bg-green-100 text-green-600 rounded-full mr-3"><Check size={12}/></div>
                                    <div>
                                        <p className="text-sm text-slate-700 font-medium">Surat "Kerjasama Skin+" disetujui</p>
                                        <p className="text-xs text-slate-400 mt-0.5">Baru saja</p>
                                    </div>
                                </div>
                            </div>
                            <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer">
                                <div className="flex items-start">
                                    <div className="mt-1 p-1.5 bg-blue-100 text-blue-600 rounded-full mr-3"><Bell size={12}/></div>
                                    <div>
                                        <p className="text-sm text-slate-700 font-medium">Pengingat: Laporan Event Cosplay</p>
                                        <p className="text-xs text-slate-400 mt-0.5">2 jam yang lalu</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-4 py-2 border-t border-slate-50 text-center">
                            <Link href="#" className="text-xs font-bold text-slate-500 hover:text-indigo-600">Lihat Semua Aktivitas</Link>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>

            {/* --- PROFILE DROPDOWN --- */}
            <div className="relative" ref={profileRef}>
                <button 
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center cursor-pointer hover:bg-slate-50 p-1.5 rounded-xl transition-all border border-transparent hover:border-slate-200 focus:outline-none"
                >
                  <div className="hidden md:block text-right mr-3">
                      <p className="text-sm font-bold text-slate-700 leading-none">{user.name}</p>
                      <p className="text-xs text-slate-500 mt-1 leading-none capitalize">{user.role ? user.role.replace('_', ' ') : 'User'}</p>
                  </div>
                  <img 
                     src={`https://ui-avatars.com/api/?name=${user.name}&background=4f46e5&color=fff`} 
                     alt="User Avatar"
                     className="w-9 h-9 rounded-full border-2 border-white shadow-sm" 
                  />
                  <ChevronDown size={16} className={`text-slate-400 ml-2 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {profileOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in origin-top-right">
                        <div className="px-4 py-3 border-b border-slate-50 md:hidden">
                            <p className="text-sm font-bold text-slate-800">{user.name}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                        
                        <Link href={route('profile.edit')} className="flex items-center px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                            <User size={16} className="mr-2" /> Profile Saya
                        </Link>
                        <button className="w-full flex items-center px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                            <Settings size={16} className="mr-2" /> Pengaturan
                        </button>
                        
                        <div className="h-px bg-slate-100 my-1"></div>
                        
                        <Link 
                            href={route('logout')} 
                            method="post" 
                            as="button" 
                            className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut size={16} className="mr-2" /> Keluar
                        </Link>
                    </div>
                )}
            </div>

          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
           {children}
        </div>
      </main>
    </div>
  );
}