import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '@/Components/Sidebar';
import { Head, Link, router } from '@inertiajs/react';
import { 
  Menu, Search, Bell, ChevronDown, 
  LogOut, User, Settings, Check, FileText, Calendar, Package 
} from 'lucide-react';

export default function AuthenticatedLayout({ user, header, children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ letters: [], events: [], inventories: [] });
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);

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
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Notifications
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = () => {
    setNotifLoading(true);
    window.axios.get('/api/notifications')
      .then(response => {
        setNotifications(response.data);
        setNotifLoading(false);
      })
      .catch(error => {
        console.error('Notification error:', error);
        setNotifLoading(false);
      });
  };

  // Handle Search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults({ letters: [], events: [], inventories: [] });
      setSearchOpen(false);
      return;
    }

    const delaySearch = setTimeout(() => {
      setSearchLoading(true);
      window.axios.get('/search', { params: { q: searchQuery } })
        .then(response => {
          setSearchResults(response.data);
          setSearchOpen(true);
          setSearchLoading(false);
        })
        .catch(error => {
          console.error('Search error:', error);
          setSearchLoading(false);
        });
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const handleSearchResultClick = (url) => {
    router.visit(url);
    setSearchQuery('');
    setSearchOpen(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      good: 'bg-green-100 text-green-700',
      damaged: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'letter': return <FileText size={16} />;
      case 'event': return <Calendar size={16} />;
      case 'inventory': return <Package size={16} />;
      default: return <FileText size={16} />;
    }
  };

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
            <div className="hidden md:flex relative group max-w-md w-full transition-all" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari surat, event, atau barang..." 
                className="pl-10 pr-4 py-2 bg-slate-100 border border-transparent focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100/50 rounded-full text-sm w-full transition-all outline-none placeholder:text-slate-400"
              />
              
              {/* Search Results Dropdown */}
              {searchOpen && (searchResults.letters.length > 0 || searchResults.events.length > 0 || searchResults.inventories.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 max-h-96 overflow-y-auto">
                  
                  {searchResults.letters.length > 0 && (
                    <div className="mb-2">
                      <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">Confirmation Letter</div>
                      {searchResults.letters.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSearchResultClick(item.url)}
                          className="w-full px-4 py-2 hover:bg-slate-50 text-left flex items-start gap-3"
                        >
                          <div className="mt-1 p-2 bg-blue-50 text-blue-600 rounded-lg">{getTypeIcon(item.type)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate">{item.title}</p>
                            <p className="text-xs text-slate-500">{item.subtitle}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>{item.status}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.events.length > 0 && (
                    <div className="mb-2">
                      <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">Laporan Event</div>
                      {searchResults.events.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSearchResultClick(item.url)}
                          className="w-full px-4 py-2 hover:bg-slate-50 text-left flex items-start gap-3"
                        >
                          <div className="mt-1 p-2 bg-purple-50 text-purple-600 rounded-lg">{getTypeIcon(item.type)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate">{item.title}</p>
                            <p className="text-xs text-slate-500">{item.subtitle}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>{item.status}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.inventories.length > 0 && (
                    <div>
                      <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">Inventaris</div>
                      {searchResults.inventories.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSearchResultClick(item.url)}
                          className="w-full px-4 py-2 hover:bg-slate-50 text-left flex items-start gap-3"
                        >
                          <div className="mt-1 p-2 bg-green-50 text-green-600 rounded-lg">{getTypeIcon(item.type)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate">{item.title}</p>
                            <p className="text-xs text-slate-500">{item.subtitle}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>{item.status}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {searchLoading && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 py-4 z-50 text-center text-sm text-slate-500">
                  Mencari...
                </div>
              )}
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
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm animate-pulse"></span>
                  )}
                </button>

                {/* Notif Menu */}
                {notifOpen && (
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in origin-top-right">
                        <div className="px-4 py-2 border-b border-slate-50 flex justify-between items-center">
                            <span className="font-bold text-sm text-slate-700">Notifikasi</span>
                            <span className="text-xs text-slate-500">{notifications.length} item</span>
                        </div>
                        <div className="max-h-64 overflow-y-auto custom-scrollbar">
                            {notifLoading ? (
                                <div className="px-4 py-8 text-center text-sm text-slate-500">Memuat...</div>
                            ) : notifications.length > 0 ? (
                                notifications.map((notif, index) => (
                                    <div key={index} className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0" onClick={() => router.visit(notif.url)}>
                                        <div className="flex items-start">
                                            <div className={`mt-1 p-1.5 rounded-full mr-3 ${notif.type === 'approved' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                                {notif.type === 'approved' ? <Check size={12}/> : <Bell size={12}/>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-slate-700 font-medium truncate">{notif.title}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">{notif.time}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-8 text-center text-sm text-slate-400">
                                    Tidak ada notifikasi
                                </div>
                            )}
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