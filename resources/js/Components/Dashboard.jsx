import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react'; // Tambahkan Link import
import { 
  FileText, Clock, CheckCircle, Calendar, 
  ArrowUpRight, MoreVertical, PieChart, Box
} from 'lucide-react';

// --- Komponen Grafik Sederhana ---
const SimpleBarChart = ({ data }) => {
  const maxVal = data && data.length > 0 ? Math.max(...data.map(d => d.letters), 10) : 100;

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-end justify-between h-64 w-full gap-2 pt-6 min-w-[500px]">
        {data.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center flex-1 group cursor-pointer">
            <div className="relative w-full flex justify-center items-end h-full px-1">
              <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs py-1 px-2 rounded mb-2 z-10 whitespace-nowrap pointer-events-none">
                {item.letters} Surat
              </div>
              <div style={{ height: `${(item.letters / maxVal) * 100}%` }} className="w-full bg-indigo-100 rounded-t-sm relative transition-all duration-500">
                <div style={{ height: `${item.letters > 0 ? (item.approved / item.letters) * 100 : 0}%` }} className="w-full absolute bottom-0 bg-indigo-500 rounded-t-sm hover:bg-indigo-600 transition-all duration-500"></div>
              </div>
            </div>
            <span className="text-xs text-slate-400 mt-2 font-medium">{item.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Komponen Kartu Statistik (Sekarang Bisa Diklik!) ---
const StatCard = ({ title, value, change, icon: Icon, color, href }) => {
  const CardContent = (
    <>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
          <Icon size={22} className={`${color.replace('bg-', 'text-')}`} />
        </div>
      </div>
      <div className="mt-4 flex items-center text-xs">
        <span className={`flex items-center font-medium ${change.includes('+') || change === 'Update' || change === 'Aktif' || change === 'Urgent' ? 'text-green-600' : 'text-slate-400'}`}>
          {change.includes('+') && <ArrowUpRight size={14} className="mr-1" />}
          {change}
        </span>
        <span className="text-slate-400 ml-2">dari periode lalu</span>
      </div>
    </>
  );

  // Jika ada href, jadikan Link. Jika tidak, jadikan div biasa.
  return href ? (
    <Link href={href} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all hover:-translate-y-1 block">
      {CardContent}
    </Link>
  ) : (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      {CardContent}
    </div>
  );
};

export default function Dashboard({ auth, statsData, chartData, recentActivities }) {
  
  // Mapping Data & Link Shortcut
  const cards = [
    { 
      title: "Total Surat Masuk", 
      value: statsData?.total_letters || 0, 
      change: "+12%", 
      icon: FileText, 
      color: "bg-blue-500",
      href: "/confirmation-letter" // Link ke Surat
    },
    { 
      title: "Menunggu Approval", 
      value: statsData?.pending_letters || 0, 
      change: "Urgent", 
      icon: Clock, 
      color: "bg-amber-500",
      href: "/confirmation-letter" // Link ke Surat
    },
    { 
      title: "Sudah Di-ACC", 
      value: statsData?.approved_weekly || 0, 
      change: "Minggu ini", 
      icon: CheckCircle, 
      color: "bg-green-500",
      href: "/confirmation-letter" 
    },
    { 
      title: "Event Bulan Ini", 
      value: statsData?.events_this_month || 0, 
      change: "Aktif", 
      icon: Calendar, 
      color: "bg-purple-500",
      href: "/laporan-event" // Link ke Event
    },
  ];

  return (
    <AuthenticatedLayout user={auth.user} title="Dashboard">
      <Head title="Dashboard" />
      
      <div className="max-w-7xl mx-auto animate-fade-in pb-10">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Dashboard Overview</h1>
            <p className="text-slate-500">Selamat datang kembali, <span className="font-bold text-indigo-600">{auth.user.name}</span>.</p>
          </div>
          <div className="mt-4 md:mt-0">
             <div className="bg-white border border-slate-200 text-slate-600 text-sm rounded-xl px-4 py-2 shadow-sm font-medium">
               Tahun {new Date().getFullYear()}
             </div>
          </div>
        </div>

        {/* Stats Grid - Sekarang bisa diklik */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {cards.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 text-lg">Statistik Surat Masuk</h3>
              <span className="text-xs text-slate-400 font-medium">Grafik Bulanan</span>
            </div>
            {chartData && chartData.length > 0 ? <SimpleBarChart data={chartData} /> : <div className="h-64 flex items-center justify-center text-slate-400">Belum ada data.</div>}
          </div>

          {/* Shortcuts Tambahan */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
            <h3 className="font-bold text-slate-800 text-lg mb-4">Akses Cepat</h3>
            <div className="space-y-3">
               <Link href="/budgeting" className="flex items-center p-3 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors">
                  <PieChart size={20} className="mr-3" /> 
                  <span className="font-medium">Budgeting & Keuangan</span>
               </Link>
               <Link href="/inventaris" className="flex items-center p-3 rounded-xl bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors">
                  <Box size={20} className="mr-3" /> 
                  <span className="font-medium">Cek Inventaris Marcom</span>
               </Link>
               <Link href="/confirmation-letter" className="flex items-center p-3 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors">
                  <FileText size={20} className="mr-3" /> 
                  <span className="font-medium">Buat Surat Baru</span>
               </Link>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}