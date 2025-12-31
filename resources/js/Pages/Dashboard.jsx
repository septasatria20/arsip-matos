import React from 'react';
import { 
  FileText, Clock, CheckCircle, AlertCircle, 
  ArrowUpRight, Plus, FilePlus, Activity,
  Calendar, Package, DollarSign, TrendingUp, TrendingDown
} from 'lucide-react';

// Import Laravel Asli (Aktifkan ini)
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

// Grafik Sederhana (Reused)
const SimpleBarChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center text-slate-400">
        Belum ada data surat masuk tahun ini.
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => d.letters || 0), 5);
  
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-end justify-between h-56 w-full gap-2 pt-6 min-w-[300px]">
        {data.map((item, idx) => {
          const barHeight = maxVal > 0 ? (item.letters / maxVal) * 100 : 0;
          const approvedHeight = item.letters > 0 ? (item.approved / item.letters) * 100 : 0;
          
          return (
            <div key={idx} className="flex flex-col items-center flex-1 group cursor-pointer">
              <div className="relative w-full flex justify-center items-end h-full px-1">
                <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs py-1 px-2 rounded mb-2 z-10 whitespace-nowrap pointer-events-none">
                  {item.letters} Surat ({item.approved} Approved)
                </div>
                <div 
                  style={{ height: `${barHeight}%` }} 
                  className="w-full bg-indigo-100 rounded-t-sm relative transition-all duration-500"
                >
                  <div 
                    style={{ height: `${approvedHeight}%` }} 
                    className="w-full absolute bottom-0 bg-indigo-500 rounded-t-sm hover:bg-indigo-600 transition-all duration-500"
                  ></div>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 mt-2 font-medium">{item.month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        <Icon size={22} className={`${color.replace('bg-', 'text-')}`} />
      </div>
    </div>
  </div>
);

export default function Dashboard({ auth, statsData, chartData, recentActivities, userRole }) {
  const role = userRole || auth?.user?.role || 'manager';
  const isStaff = role === 'staff';
  
  // Data sudah dikirim dari Controller, tidak perlu fallback dummy lagi
  const stats = statsData || {};
  const chart = chartData || [];
  const recent = recentActivities || [];

  // Debug: Log data untuk melihat apa yang diterima
  console.log('Dashboard Data:', { stats, chart, recent, role });

  // Helper format rupiah
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  // Data Kartu untuk Staff
  const staffCards = [
    { 
      title: "Total Dokumen Saya", 
      value: stats.total_letters + stats.total_events, 
      icon: FileText, 
      color: "bg-blue-500",
      subtitle: `${stats.total_letters} surat, ${stats.total_events} laporan`
    },
    { 
      title: "Menunggu Approval", 
      value: stats.pending_letters + stats.pending_events, 
      icon: Clock, 
      color: "bg-amber-500",
      subtitle: "Menunggu respon Manager"
    },
    { 
      title: "Disetujui", 
      value: stats.approved_letters + stats.approved_events, 
      icon: CheckCircle, 
      color: "bg-green-500",
      subtitle: "Siap didownload / dicetak"
    },
    { 
      title: "Ditolak / Revisi", 
      value: stats.rejected_letters, 
      icon: AlertCircle, 
      color: "bg-red-500",
      subtitle: "Perlu Anda perbaiki"
    },
  ];

  // Data Kartu untuk Manager
  const managerCards = [
    { 
      title: "Total Surat Masuk", 
      value: stats.total_letters, 
      icon: FileText, 
      color: "bg-blue-500",
      subtitle: `${stats.pending_letters} menunggu approval`
    },
    { 
      title: "Laporan Event", 
      value: stats.total_events, 
      icon: Calendar, 
      color: "bg-purple-500",
      subtitle: `${stats.approved_events} approved`
    },
    { 
      title: "Inventaris Marcom", 
      value: stats.total_inventory, 
      icon: Package, 
      color: "bg-green-500",
      subtitle: `${stats.damaged_condition} rusak`
    },
    { 
      title: "Budget Status", 
      value: formatRupiah(stats.total_income - stats.total_expense), 
      icon: DollarSign, 
      color: stats.total_income >= stats.total_expense ? "bg-green-500" : "bg-red-500",
      subtitle: `${stats.pending_transactions} pending`
    },
  ];

  const cards = isStaff ? staffCards : managerCards;

  return (
    <AuthenticatedLayout user={auth.user} title="Dashboard">
      <Head title="Dashboard" />
      
      <div className="max-w-7xl mx-auto animate-fade-in pb-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
            {isStaff ? `Halo, ${auth.user.name}!` : 'Dashboard Manager'}
          </h1>
          <p className="text-slate-500">
            {isStaff 
              ? 'Pantau status pengajuan surat dan laporan kegiatan Anda di sini.' 
              : 'Ringkasan aktivitas dan persetujuan dokumen.'}
          </p>
        </div>

        {/* Grid Statistik */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {cards.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Kolom Kiri: Grafik & Quick Access */}
          <div className="lg:col-span-2 space-y-8">
             {/* Grafik Surat Masuk */}
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-800 text-lg">
                    {isStaff ? 'Aktivitas Upload Saya' : 'Statistik Surat Masuk'}
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">Tahun Ini</span>
                </div>
                <SimpleBarChart data={chart} />
             </div>

             {/* Grafik Additional untuk Manager */}
             {!isStaff && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Status Overview */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4">Status Approval</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-amber-500 mr-3"></div>
                          <span className="text-sm text-slate-600">Pending</span>
                        </div>
                        <span className="font-bold text-slate-800">{stats.pending_letters + stats.pending_events}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                          <span className="text-sm text-slate-600">Approved</span>
                        </div>
                        <span className="font-bold text-slate-800">{stats.approved_letters + stats.approved_events}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-red-500 mr-3"></div>
                          <span className="text-sm text-slate-600">Rejected</span>
                        </div>
                        <span className="font-bold text-slate-800">{stats.rejected_letters}</span>
                      </div>
                    </div>
                  </div>

                  {/* Budget Overview */}
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4">Budget Overview</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Pemasukan</span>
                        <div className="flex items-center text-green-600 font-bold text-sm">
                          <TrendingUp size={16} className="mr-1" />
                          {formatRupiah(stats.total_income)}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Pengeluaran</span>
                        <div className="flex items-center text-red-600 font-bold text-sm">
                          <TrendingDown size={16} className="mr-1" />
                          {formatRupiah(stats.total_expense)}
                        </div>
                      </div>
                      <div className="pt-3 border-t border-slate-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-slate-700">Selisih</span>
                          <span className={`font-bold text-lg ${stats.total_income >= stats.total_expense ? 'text-green-600' : 'text-red-600'}`}>
                            {formatRupiah(stats.total_income - stats.total_expense)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Inventory Status */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4">Kondisi Inventaris</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-slate-600">Baik</span>
                          <span className="text-sm font-bold text-slate-800">{stats.good_condition}/{stats.total_inventory}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: `${stats.total_inventory > 0 ? (stats.good_condition / stats.total_inventory * 100) : 0}%`}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-slate-600">Rusak</span>
                          <span className="text-sm font-bold text-slate-800">{stats.damaged_condition}/{stats.total_inventory}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full" style={{width: `${stats.total_inventory > 0 ? (stats.damaged_condition / stats.total_inventory * 100) : 0}%`}}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4">Quick Stats</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText size={18} className="text-blue-600 mr-3" />
                          <span className="text-sm text-slate-600">Total Documents</span>
                        </div>
                        <span className="font-bold text-slate-800">{stats.total_letters + stats.total_events}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Package size={18} className="text-green-600 mr-3" />
                          <span className="text-sm text-slate-600">Total Items</span>
                        </div>
                        <span className="font-bold text-slate-800">{stats.total_inventory}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <AlertCircle size={18} className="text-amber-600 mr-3" />
                          <span className="text-sm text-slate-600">Needs Action</span>
                        </div>
                        <span className="font-bold text-amber-600">{stats.pending_letters + stats.pending_events + stats.pending_transactions}</span>
                      </div>
                    </div>
                  </div>
               </div>
             )}

             {/* QUICK ACCESS (Khusus Staff) */}
             {isStaff && (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link href="/confirmation-letter" className="bg-indigo-600 hover:bg-indigo-700 text-white p-6 rounded-2xl shadow-lg shadow-indigo-200 transition-all hover:-translate-y-1 group flex flex-col items-start">
                      <div className="p-3 bg-white/20 rounded-xl mb-4"><FilePlus size={24} /></div>
                      <h4 className="font-bold text-lg">Buat Surat Baru</h4>
                      <p className="text-indigo-100 text-sm mt-1">Generator otomatis atau upload manual.</p>
                  </Link>
                  <Link href="/laporan-event" className="bg-white border border-slate-200 text-slate-700 p-6 rounded-2xl hover:shadow-md transition-all hover:-translate-y-1 group flex flex-col items-start">
                      <div className="p-3 bg-green-50 text-green-600 rounded-xl mb-4"><Activity size={24} /></div>
                      <h4 className="font-bold text-lg">Lapor Kegiatan</h4>
                      <p className="text-slate-500 text-sm mt-1">Upload dokumentasi event selesai.</p>
                  </Link>
               </div>
             )}
          </div>

          {/* Kolom Kanan: Status Terkini */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 text-lg">Status Terkini</h3>
            </div>
            
            <div className="space-y-4">
              {recent.length > 0 ? (
                recent.map((activity, index) => (
                  <div key={index} className="flex items-start p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <div className={`mt-1 p-2 rounded-lg shrink-0 mr-4 ${
                      activity.status === 'Pending' ? 'bg-amber-100 text-amber-600' :
                      activity.status === 'Approved' ? 'bg-green-100 text-green-600' :
                      activity.status === 'Rejected' ? 'bg-red-100 text-red-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {activity.status === 'Pending' ? <Clock size={18} /> : 
                       activity.status === 'Approved' ? <CheckCircle size={18} /> : 
                       <AlertCircle size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-bold text-slate-800 truncate">{activity.title}</h4>
                        <span className="text-xs text-slate-400 whitespace-nowrap ml-2">{activity.date}</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-1 truncate">{activity.type}</p>
                      
                      {/* Status Badge */}
                      <div className="flex items-center">
                         <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                           activity.status === 'Pending' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                           activity.status === 'Approved' ? 'bg-green-50 border-green-100 text-green-600' :
                           activity.status === 'Info' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                           'bg-red-50 border-red-200 text-red-600'
                         }`}>
                           {activity.status}
                         </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 text-sm">
                  Belum ada aktivitas terbaru.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}