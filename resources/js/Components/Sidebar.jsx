import React from 'react';
import { Link, usePage } from '@inertiajs/react'; 
import { 
  LayoutDashboard, 
  FileText, 
  CheckCircle, 
  Box, 
  PieChart, 
  Users,
  X
} from 'lucide-react';

export default function Sidebar({ open, setOpen }) {
  const { url } = usePage();

  // Helper untuk cek menu aktif (pastikan url ada)
  const isActive = (path) => url.startsWith(path);

  const SidebarItem = ({ icon: Icon, label, href, active, badge }) => (
    <Link 
      href={href}
      className={`flex items-center w-full p-3 mb-2 rounded-xl transition-all duration-200 group ${
        active 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
          : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
      }`}
    >
      <Icon size={20} className={`mr-3 ${active ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}`} />
      <span className="font-medium flex-1 text-left text-sm whitespace-nowrap">{label}</span>
      {badge && (
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-600'}`}>
          {badge}
        </span>
      )}
    </Link>
  );

  return (
    <aside 
      className={`
        bg-white border-r border-slate-200 fixed md:relative z-30 h-full flex flex-col shadow-2xl md:shadow-none transition-all duration-300 ease-in-out
        ${open ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0 w-72 md:w-0 md:overflow-hidden'}
      `}
    >
      <div className="p-6 flex items-center justify-between border-b border-slate-100 min-w-[18rem]">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3 text-white font-bold shadow-md shadow-indigo-200">
            M
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-lg tracking-tight">MATOS</h1>
            <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">Arsip Digital</p>
          </div>
        </div>
        <button 
          onClick={() => setOpen(false)}
          className="md:hidden p-1 text-slate-400 hover:text-slate-600"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar min-w-[18rem]">
        <div className="mb-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-3">Main Menu</p>
          <SidebarItem icon={LayoutDashboard} label="Dashboard" href="/dashboard" active={isActive('/dashboard')} />
          <SidebarItem icon={FileText} label="Confirmation Letter" href="/confirmation-letter" active={isActive('/confirmation-letter')} />
          <SidebarItem icon={CheckCircle} label="Laporan Event" href="/laporan-event" active={isActive('/laporan-event')} />
          <SidebarItem icon={Box} label="Inventaris Marcom" href="/inventaris" active={isActive('/inventaris')} />
          <SidebarItem icon={PieChart} label="Budgeting" href="/budgeting" active={isActive('/budgeting')} />
        </div>

        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-3">Admin Zone</p>
          <SidebarItem icon={Users} label="Manajemen User" href="/users" active={isActive('/users')} badge="3 New" />
        </div>
      </div>

      <div className="p-4 border-t border-slate-100 min-w-[18rem]">
        <div className="bg-slate-50 p-3 rounded-xl flex items-center cursor-pointer hover:bg-slate-100 transition-colors">
          <img 
            src="https://ui-avatars.com/api/?name=Admin+Matos&background=4f46e5&color=fff" 
            alt="Admin" 
            className="w-9 h-9 rounded-full mr-3"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-700 truncate">Admin User</p>
            <p className="text-xs text-slate-500 truncate">Manager</p>
          </div>
        </div>
      </div>
    </aside>
  );
}