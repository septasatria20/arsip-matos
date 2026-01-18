import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, router, usePage } from '@inertiajs/react';
import toast, { Toaster } from 'react-hot-toast';
import { 
  CheckCircle, Calendar, Upload, Trash2, Eye, 
  Save, ChevronLeft, Image as ImageIcon, FileText, 
  Link as LinkIcon, ExternalLink, Plus, Filter,
  User, Check, XCircle, Search, X, Clock
} from 'lucide-react';

export default function LaporanEvent({ auth, reports, filters }) {
  const [viewMode, setViewMode] = useState('list'); // list, create
  const [showFilter, setShowFilter] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null); // State untuk Modal Preview
  const [fullscreenImage, setFullscreenImage] = useState(null); // State untuk Fullscreen Image
  const { flash } = usePage().props;
  
  const isManager = auth.user.role === 'manager' || auth.user.role === 'co_manager';

  // Close fullscreen on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setFullscreenImage(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Toast notification untuk flash message
  useEffect(() => {
    if (flash?.message) {
      toast.success(flash.message, {
        duration: 3000,
        position: 'top-right',
      });
    }
  }, [flash]);

  // --- STATE FILTER ---
  const [filterValues, setFilterValues] = useState({
    month: filters.month || '',
    year: filters.year || new Date().getFullYear(),
    search: filters.search || '',
    status: filters.status || ''
  });

  const handleFilter = () => {
    router.get(route('laporan.index'), filterValues, { preserveState: true });
  };

  // --- FORM HANDLING ---
  const { data, setData, post, processing, reset } = useForm({
    event_date: '', 
    event_name: '', 
    description: '', 
    drive_link: '', 
    poster: null, 
    report_file: null
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validasi ukuran file poster (max 2MB)
    if (data.poster && data.poster.size > 2 * 1024 * 1024) {
      toast.error('Ukuran foto poster maksimal 2MB!');
      return;
    }
    
    // Validasi ukuran file PDF (max 5MB)
    if (data.report_file && data.report_file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file PDF maksimal 5MB!');
      return;
    }
    
    post(route('laporan.store'), {
      onSuccess: () => {
        reset();
        setViewMode('list');
      }
    });
  };

  // --- ACTIONS ---
  const updateStatus = (id, newStatus) => {
    const loadingToast = toast.loading('Memproses...');
    
    router.patch(route('laporan.status', id), 
      { status: newStatus }, 
      {
        onSuccess: () => {
          toast.dismiss(loadingToast);
          toast.success(newStatus === 'approved' ? 'Laporan disetujui!' : 'Laporan ditolak!');
        },
        onError: (errors) => {
          toast.dismiss(loadingToast);
          console.error('Error:', errors);
          toast.error('Gagal memperbarui status');
        }
      }
    );
  };

  const handleDelete = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-medium">Hapus laporan ini?</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
          >
            Batal
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              router.delete(route('laporan.destroy', id), {
                onSuccess: () => toast.success('Laporan berhasil dihapus'),
                onError: () => toast.error('Gagal menghapus laporan')
              });
            }}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
            Hapus
          </button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  return (
    <AuthenticatedLayout user={auth.user} title="Laporan Event">
      <Toaster />
      
      {/* --- MODAL PREVIEW --- */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setSelectedReport(null)}>
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-slide-up" onClick={e => e.stopPropagation()}>
                {/* Header Image */}
                <div className="relative max-h-[60vh] bg-slate-100 flex items-center justify-center group">
                    {selectedReport.poster_path ? (
                        <div className="relative cursor-pointer" onClick={() => setFullscreenImage(`/storage/${selectedReport.poster_path}`)}>
                            <img 
                              src={`/storage/${selectedReport.poster_path}`} 
                              className="max-w-full max-h-[60vh] object-contain transition-transform hover:scale-105" 
                              alt="Poster"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                                <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold text-slate-800">
                                    <Eye size={16} /> Klik untuk Full Preview
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center">
                            <ImageIcon size={48} className="text-slate-300" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80"></div>
                    
                    <button onClick={() => setSelectedReport(null)} className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/40 transition z-10">
                        <X size={20} />
                    </button>
                    
                    <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase border ${
                                selectedReport.status === 'approved' ? 'bg-green-500 border-green-400' : 
                                selectedReport.status === 'rejected' ? 'bg-red-500 border-red-400' : 
                                'bg-amber-500 border-amber-400'
                            }`}>
                                {selectedReport.status}
                            </span>
                            <span className="text-xs opacity-80 flex items-center">
                                <Calendar size={12} className="mr-1"/> {new Date(selectedReport.event_date).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold shadow-black drop-shadow-md leading-tight">{selectedReport.event_name}</h2>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto bg-white">
                    <div className="mb-6">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Deskripsi Kegiatan</h3>
                        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                            {selectedReport.description || 'Tidak ada deskripsi.'}
                        </p>
                    </div>

                    {/* Timeline Info */}
                    <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Timeline</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-600">Tanggal Event:</span>
                                <span className="font-semibold text-slate-800">{new Date(selectedReport.event_date).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                            </div>
                            {selectedReport.approved_at && (
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-600">Disetujui:</span>
                                    <span className="font-semibold text-green-600">{new Date(selectedReport.approved_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                                </div>
                            )}
                            {selectedReport.rejected_at && (
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-600">Ditolak:</span>
                                    <span className="font-semibold text-red-600">{new Date(selectedReport.rejected_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                                </div>
                            )}
                            {selectedReport.approver && (
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-600">Oleh:</span>
                                    <span className="font-semibold text-slate-800">{selectedReport.approver.name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {selectedReport.report_file_path ? (
                            <a href={`/storage/${selectedReport.report_file_path}`} target="_blank" className="flex items-center justify-center p-4 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition group">
                                <div className="bg-white p-2 rounded-full mr-3 shadow-sm group-hover:scale-110 transition-transform"><FileText size={20} className="text-blue-600"/></div>
                                Buka Laporan PDF
                            </a>
                        ) : (
                            <div className="flex items-center justify-center p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 font-bold cursor-not-allowed">
                                <FileText size={20} className="mr-2"/> No PDF
                            </div>
                        )}
                        
                        {selectedReport.drive_link ? (
                            <a href={selectedReport.drive_link} target="_blank" className="flex items-center justify-center p-4 rounded-xl border border-green-200 bg-green-50 text-green-700 font-bold hover:bg-green-100 transition group">
                                <div className="bg-white p-2 rounded-full mr-3 shadow-sm group-hover:scale-110 transition-transform"><LinkIcon size={20} className="text-green-600"/></div>
                                Buka Dokumentasi
                            </a>
                        ) : (
                            <div className="flex items-center justify-center p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 font-bold cursor-not-allowed">
                                <LinkIcon size={20} className="mr-2"/> No Link
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* LIST VIEW (GRID 5 KOLOM) */}
      {viewMode === 'list' && (
        <div className="max-w-7xl mx-auto animate-fade-in pb-10">
          
          {/* Header Section */}
          <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1 flex items-center">
                <CheckCircle className="mr-3 text-green-600" size={28} /> Laporan Event
              </h1>
              <p className="text-slate-500 text-sm">Dokumentasi kegiatan mall yang telah terlaksana.</p>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
                <button 
                    onClick={() => setShowFilter(!showFilter)} 
                    className={`px-4 py-2 border rounded-xl text-sm font-medium flex items-center justify-center bg-white hover:bg-slate-50 transition ${showFilter ? 'border-green-500 text-green-600' : 'border-slate-200 text-slate-600'}`}
                >
                    <Filter size={16} className="mr-2" /> Filter
                </button>
                <button 
                    onClick={() => setViewMode('create')} 
                    className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center justify-center hover:bg-green-700 transition shadow-sm"
                >
                   <Plus size={16} className="mr-2" /> Buat Laporan
                </button>
            </div>
          </div>

          {/* Filter Bar */}
          {showFilter && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 shadow-sm grid grid-cols-1 sm:grid-cols-5 gap-4 animate-fade-in">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                    <input 
                        type="text" placeholder="Cari Nama Event..." 
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                        value={filterValues.search} onChange={e => setFilterValues({...filterValues, search: e.target.value})}
                    />
                </div>
                <select className="border border-slate-300 p-2 rounded-lg text-sm outline-none" value={filterValues.month} onChange={e => setFilterValues({...filterValues, month: e.target.value})}>
                    <option value="">Semua Bulan</option>
                    {[...Array(12)].map((_, i) => <option key={i} value={i+1}>{new Date(0, i).toLocaleString('id', {month:'long'})}</option>)}
                </select>
                <select className="border border-slate-300 p-2 rounded-lg text-sm outline-none" value={filterValues.year} onChange={e => setFilterValues({...filterValues, year: e.target.value})}>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                </select>
                <select className="border border-slate-300 p-2 rounded-lg text-sm outline-none" value={filterValues.status} onChange={e => setFilterValues({...filterValues, status: e.target.value})}>
                    <option value="">Semua Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
                <button onClick={handleFilter} className="bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition">Terapkan</button>
            </div>
          )}

          {/* GRID CONTENT (5 KOLOM) */}
          {/* Perubahan: xl:grid-cols-5 ditambahkan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {reports.length === 0 && (
                <div className="col-span-full text-center py-20 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    Belum ada laporan event yang ditemukan.
                </div>
            )}
            
            {reports.map((item) => (
              <div 
                key={item.id} 
                onClick={() => setSelectedReport(item)} // Klik card untuk buka preview
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden group cursor-pointer"
              >
                 {/* Poster Image dengan Lazy Loading */}
                 {item.poster_path && (
                   <div className="relative w-full h-40 bg-slate-100 overflow-hidden">
                     <img 
                       src={`/storage/${item.poster_path}`} 
                       alt={item.event_name}
                       loading="lazy"
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                       onError={(e) => {
                         e.target.style.display = 'none';
                         e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg></div>';
                       }}
                     />
                   </div>
                 )}
                 
                 {/* Card Body */}
                 <div className="p-4 flex-1 flex flex-col relative">
                    {/* Badge Status di pojok kanan atas */}
                    <div className="absolute top-3 right-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm border ${
                           item.status === 'approved' ? 'bg-green-500 text-white border-green-600' : 
                           item.status === 'rejected' ? 'bg-red-500 text-white border-red-600' : 
                           'bg-amber-400 text-white border-amber-500'
                        }`}>
                          {item.status}
                        </span>
                    </div>

                    <div className="flex-1 pr-20">
                        <div className="flex items-center text-[10px] text-slate-500 mb-1 font-medium uppercase tracking-wide">
                            <Calendar size={10} className="mr-1" /> {new Date(item.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        {/* Judul */}
                        <h3 className="font-bold text-slate-800 text-base mb-1 line-clamp-2 leading-tight" title={item.event_name}>{item.event_name}</h3>
                        
                        {/* Deskripsi */}
                        <p className="text-xs text-slate-500 line-clamp-3 mb-3 leading-relaxed">
                            {item.description || 'Tidak ada deskripsi.'}
                        </p>
                        
                        {/* File Links - Stop Propagation agar tidak trigger modal */}
                        <div className="flex flex-wrap gap-2 mb-3" onClick={e => e.stopPropagation()}>
                            {item.report_file_path ? (
                                <a href={`/storage/${item.report_file_path}`} target="_blank" className="text-[10px] px-2 py-1 bg-blue-50 text-blue-600 rounded border border-blue-100 flex items-center hover:bg-blue-100 transition font-medium" title="Buka PDF Laporan">
                                    <FileText size={10} className="mr-1" /> PDF
                                </a>
                            ) : null}
                            
                            {item.drive_link && (
                                <a href={item.drive_link} target="_blank" className="text-[10px] px-2 py-1 bg-green-50 text-green-600 rounded border border-green-100 flex items-center hover:bg-green-100 transition font-medium" title="Buka Google Drive">
                                    <LinkIcon size={10} className="mr-1" /> Drive
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Footer: User & Actions - Stop Propagation */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center text-[10px] text-slate-400 truncate pr-2" title={`Uploaded by ${item.user?.name}`}>
                            <User size={12} className="mr-1 flex-shrink-0" /> 
                            <span className="truncate">{item.user?.name || 'Unknown'}</span>
                        </div>
                        
                        <div className="flex gap-1 flex-shrink-0">
                            {/* Tombol Approval - Hanya Manager/Co-Manager */}
                            {isManager && item.status === 'pending' && (
                                <>
                                <button onClick={() => updateStatus(item.id, 'approved')} className="p-1 bg-green-50 text-green-600 rounded hover:bg-green-100 transition border border-green-200" title="Acc">
                                    <Check size={14}/>
                                </button>
                                <button onClick={() => updateStatus(item.id, 'rejected')} className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition border border-red-200" title="Tolak">
                                    <XCircle size={14}/>
                                </button>
                                </>
                            )}
                            {/* Tombol Delete - Manager/Co-Manager bisa hapus semua, Admin hanya milik sendiri */}
                            {(isManager || item.user_id === auth.user.id) && (
                              <button onClick={() => handleDelete(item.id)} className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition" title="Hapus">
                                  <Trash2 size={14}/>
                              </button>
                            )}
                        </div>
                    </div>
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE FORM (Sama seperti sebelumnya) */}
      {viewMode === 'create' && (
        <div className="max-w-3xl mx-auto pb-10 animate-fade-in">
          <button onClick={() => setViewMode('list')} className="flex items-center text-slate-500 hover:text-green-600 mb-6 transition group">
            <ChevronLeft size={20} className="mr-1 group-hover:-translate-x-1 transition-transform" /> Kembali ke Daftar
          </button>
          
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-green-600 text-white">
              <h2 className="text-xl font-bold flex items-center"><Upload className="mr-3" size={24} /> Form Laporan Event Baru</h2>
              <p className="text-green-100 text-sm mt-1 ml-9">Isi data kegiatan yang telah selesai dilaksanakan.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tanggal Event</label>
                    <input type="date" value={data.event_date} onChange={e => setData('event_date', e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nama Event</label>
                    <input type="text" value={data.event_name} onChange={e => setData('event_name', e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition" placeholder="Contoh: Cosplay Run 2025" required />
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Deskripsi Kegiatan</label>
                  <textarea 
                    rows="4" 
                    value={data.description} 
                    onChange={e => setData('description', e.target.value)} 
                    className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition"
                    placeholder="Jelaskan secara singkat kegiatan yang berlangsung..."
                    required 
                  />
               </div>

               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Link Dokumentasi (Google Drive)</label>
                  <div className="flex items-center">
                     <div className="bg-slate-50 p-3 border border-r-0 border-slate-300 rounded-l-xl text-slate-500"><LinkIcon size={18}/></div>
                     <input type="url" value={data.drive_link} onChange={e => setData('drive_link', e.target.value)} className="flex-1 p-3 border border-slate-300 rounded-r-xl text-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition" placeholder="https://drive.google.com/folders/..." />
                  </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition text-center">
                     <label className="block text-sm font-bold text-slate-700 mb-2">Poster Event (Gambar)</label>
                     <input type="file" onChange={e => setData('poster', e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" accept="image/*" />
                     <p className="text-xs text-slate-400 mt-2">Format JPG/PNG. Max 2MB.</p>
                  </div>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition text-center">
                     <label className="block text-sm font-bold text-slate-700 mb-2">File Laporan (PDF)</label>
                     <input type="file" onChange={e => setData('report_file', e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" accept="application/pdf" />
                     <p className="text-xs text-slate-400 mt-2">Format PDF. Max 5MB.</p>
                  </div>
               </div>

               <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setViewMode('list')} className="px-6 py-3 border border-slate-300 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition">Batal</button>
                  <button type="submit" disabled={processing} className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 transition flex items-center">
                    <Save size={18} className="mr-2" /> {processing ? 'Menyimpan...' : 'Simpan Laporan'}
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* FULLSCREEN IMAGE MODAL */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setFullscreenImage(null)}
        >
          <button 
            onClick={() => setFullscreenImage(null)}
            className="absolute top-4 right-4 p-3 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white/20 transition z-10"
          >
            <X size={24} />
          </button>
          <img 
            src={fullscreenImage} 
            alt="Full Preview"
            className="max-w-full max-h-full object-contain cursor-zoom-out"
            onClick={() => setFullscreenImage(null)}
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm">
            Klik gambar atau ESC untuk menutup
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  );
}