import React, { useState, useEffect } from 'react';
import Sidebar from '@/Components/Sidebar';
import { Menu, Search, Bell, ChevronDown } from 'lucide-react';
import { Head } from '@inertiajs/react';

export default function AuthenticatedLayout({ user, header, children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden relative">
      <Head title={title} />

      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-20 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50/50">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-8 z-10 sticky top-0">
          <div className="flex items-center flex-1">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 -ml-2 mr-2 rounded-lg hover:bg-slate-100 text-slate-600 focus:outline-none"
            >
              <Menu size={22} />
            </button>
            
            <div className="hidden md:flex relative group max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Cari surat, event, atau barang..." 
                className="pl-10 pr-4 py-2 bg-slate-100 border border-transparent focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100/50 rounded-full text-sm w-full transition-all outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4 ml-4">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>
            <div className="flex items-center cursor-pointer hover:opacity-80">
              <span className="hidden md:block text-sm font-medium text-slate-600 mr-2">{user.name}</span>
              <img 
                 src={`https://ui-avatars.com/api/?name=${user.name}&background=4f46e5&color=fff`} 
                 alt="User Avatar"
                 className="w-8 h-8 rounded-full md:hidden border border-slate-200" 
              />
              <ChevronDown size={16} className="text-slate-400 hidden md:block" />
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