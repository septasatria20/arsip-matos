import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, router, usePage } from '@inertiajs/react';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Box, Search, Plus, MapPin, Trash2, Package, 
  ChevronLeft, Save, Image as ImageIcon, X, FileText, Edit3, Filter, Link as LinkIcon, Clock, AlertCircle, User 
} from 'lucide-react';

export default function InventarisMarcom({ auth, items, filters }) {
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [selectedItem, setSelectedItem] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null); // State untuk Fullscreen Image
  const [showFilter, setShowFilter] = useState(false);
  const [filterCondition, setFilterCondition] = useState(filters.condition || '');
  const { flash } = usePage().props;

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

  // Toast notification
  useEffect(() => {
    if (flash?.message) {
      toast.success(flash.message, {
        duration: 3000,
        position: 'top-right',
      });
    }
  }, [flash]); 
  
  // --- FORM EDIT (Modal) ---
  // Menggunakan useForm terpisah untuk edit agar handling request lebih stabil
  const { 
    data: editData, 
    setData: setEditData, 
    post: postEdit,
    processing: editProcessing, 
    reset: resetEdit 
  } = useForm({
    quantity: '',
    location: '',
    condition: '',
    condition_notes: '',
    description: '',
    image: null,
    _method: 'PATCH'
  });

  // Sinkronisasi state edit saat item dipilih
  useEffect(() => {
    if (selectedItem) {
        setEditData({
            quantity: selectedItem.quantity,
            location: selectedItem.location,
            condition: selectedItem.condition,
            condition_notes: selectedItem.condition_notes || '',
            description: selectedItem.description || '',
            image: null,
            _method: 'PATCH'
        });
    }
  }, [selectedItem]);

  // Fungsi simpan perubahan dari modal
  const handleUpdateItem = (e) => {
      e.preventDefault();
      if (!selectedItem) return;
      
      // Validasi ukuran file gambar (max 2MB)
      if (editData.image && editData.image.size > 2 * 1024 * 1024) {
        toast.error('Ukuran foto maksimal 2MB!');
        return;
      }
      
      postEdit(route('inventories.update', selectedItem.id), {
          onSuccess: () => {
            setSelectedItem(null);
            resetEdit();
          },
          onError: (errors) => {
            console.error("Gagal update:", errors);
            toast.error("Gagal menyimpan perubahan.");
          },
          preserveScroll: true
      });
  };

  // Handle Search
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
        router.get(route('inventories.index'), { search: searchQuery, condition: filterCondition }, { preserveState: true });
    }
  };

  const handleFilter = () => {
    router.get(route('inventories.index'), { search: searchQuery, condition: filterCondition }, { preserveState: true });
  };

  // --- FORM CREATE ---
  const { data, setData, post, processing, errors, reset, transform } = useForm({
    name: '',
    category: '',
    custom_category: '',
    quantity: '',
    location: '',
    condition: 'good',
    description: '',
    image: null,
    drive_link: '',
    drive_link_folder: ''
  });

  // Logic Transform Kategori Lainnya
  useEffect(() => {
    transform((data) => ({
      ...data,
      category: data.category === 'Lainnya' ? data.custom_category : data.category,
    }));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validasi ukuran file gambar (max 2MB)
    if (data.image && data.image.size > 2 * 1024 * 1024) {
      toast.error('Ukuran foto maksimal 2MB!');
      return;
    }
    
    post(route('inventories.store'), {
      onSuccess: () => {
        reset();
        setViewMode('list');
      }
    });
  };

  const handleDelete = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-medium">Hapus barang ini secara permanen?</p>
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
              router.delete(route('inventories.destroy', id), {
                onSuccess: () => {
                  toast.success('Barang berhasil dihapus');
                  setSelectedItem(null);
                },
                onError: () => toast.error('Gagal menghapus barang')
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
    <AuthenticatedLayout user={auth.user} title="Inventaris Marcom">
      <Toaster />
      
      {/* --- MODAL PREVIEW & EDIT --- */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setSelectedItem(null)}>
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-slide-up max-h-[95vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                {/* Header Image */}
                <div className="relative max-h-[50vh] bg-slate-100 flex items-center justify-center group shrink-0">
                    {selectedItem.image_path ? (
                        <div className="relative cursor-pointer w-full" onClick={() => setFullscreenImage(`/storage/${selectedItem.image_path}`)}>
                            <img 
                              src={`/storage/${selectedItem.image_path}`} 
                              className="max-w-full max-h-[50vh] object-contain transition-transform hover:scale-105" 
                              alt={selectedItem.name}
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                                <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold text-slate-800">
                                    <ImageIcon size={16} /> Klik untuk Full Preview
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center">
                            <ImageIcon size={48} className="text-slate-300" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80"></div>
                    
                    <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/40 transition z-10">
                        <X size={20} />
                    </button>
                    
                    <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs opacity-80 flex items-center uppercase font-bold tracking-wider bg-white/20 px-2 py-1 rounded backdrop-blur-sm">
                                {selectedItem.category}
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold shadow-black drop-shadow-md leading-tight">{selectedItem.name}</h2>
                    </div>
                </div>

                {/* Content & Edit Form */}
                <div className="p-6 bg-white space-y-6">
                    {/* Info Readonly */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Jumlah Stok</p>
                            <p className="text-lg font-bold text-slate-800 flex items-center"><Package size={18} className="mr-2 text-orange-500"/> {selectedItem.quantity} Unit</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Lokasi</p>
                            <p className="text-lg font-bold text-slate-800 flex items-center"><MapPin size={18} className="mr-2 text-orange-500"/> {selectedItem.location}</p>
                        </div>
                    </div>

                    {/* Description Display */}
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase mb-2">Keterangan Barang</p>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-700 leading-relaxed">
                            {selectedItem.description || 'Tidak ada keterangan tambahan.'}
                        </div>
                    </div>

                    {/* Link Drive */}
                    {selectedItem.drive_link && (
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase mb-2">Link Foto Tambahan</p>
                            <a 
                              href={selectedItem.drive_link} 
                              target="_blank" 
                              className="flex items-center p-4 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition"
                            >
                                <LinkIcon size={18} className="mr-2"/> Buka Google Drive
                            </a>
                        </div>
                    )}

                    {/* Riwayat Kondisi */}
                    {selectedItem.condition_histories && selectedItem.condition_histories.length > 0 && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                            <div className="flex items-center mb-3">
                                <Clock size={16} className="mr-2 text-amber-600"/>
                                <p className="text-xs font-bold text-amber-800 uppercase">Riwayat Perubahan Kondisi</p>
                            </div>
                            
                            {/* Timeline */}
                            <div className="space-y-3">
                                {selectedItem.condition_histories.map((history, index) => (
                                    <div key={history.id} className="relative pl-6 pb-3 border-l-2 border-amber-300 last:border-l-0 last:pb-0">
                                        {/* Dot */}
                                        <div className={`absolute left-0 top-0 -translate-x-[9px] w-4 h-4 rounded-full border-2 ${
                                            history.condition === 'good' ? 'bg-green-500 border-green-600' : 
                                            history.condition === 'repair' ? 'bg-yellow-500 border-yellow-600' : 
                                            'bg-red-500 border-red-600'
                                        }`}></div>
                                        
                                        <div className="bg-white p-3 rounded-lg border border-amber-200">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                                                    history.condition === 'good' ? 'bg-green-100 text-green-700' : 
                                                    history.condition === 'repair' ? 'bg-yellow-100 text-yellow-700' : 
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                    {history.condition === 'good' ? 'Baik' : history.condition === 'repair' ? 'Perbaikan' : 'Rusak'}
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    {new Date(history.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                            
                                            {history.condition_notes && (
                                                <p className="text-sm text-slate-700 mt-2 italic">"{history.condition_notes}"</p>
                                            )}
                                            
                                            {history.changed_by && (
                                                <p className="text-xs text-slate-400 mt-2 flex items-center">
                                                    <User size={10} className="mr-1"/> {history.changed_by.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Edit Section */}
                    <div className="border-t border-slate-100 pt-4">
                        <h3 className="font-bold text-slate-800 mb-3 flex items-center"><Edit3 size={16} className="mr-2"/> Update Data Barang</h3>
                        
                        <div className="space-y-4">
                            {/* Edit Jumlah & Lokasi */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Jumlah Stok</label>
                                    <input 
                                        type="number" 
                                        value={editData.quantity}
                                        onChange={(e) => setEditData('quantity', e.target.value)}
                                        className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Lokasi</label>
                                    <input 
                                        type="text" 
                                        value={editData.location}
                                        onChange={(e) => setEditData('location', e.target.value)}
                                        className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                        placeholder="Contoh: Gudang Lt. 3"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Kondisi Barang</label>
                                <div className="flex gap-2">
                                    {['good', 'repair', 'damaged'].map((cond) => (
                                        <button
                                            key={cond}
                                            type="button"
                                            onClick={() => setEditData('condition', cond)}
                                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                                                editData.condition === cond 
                                                ? (cond === 'good' ? 'bg-green-500 text-white border-green-600' : cond === 'repair' ? 'bg-yellow-500 text-white border-yellow-600' : 'bg-red-500 text-white border-red-600')
                                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                            }`}
                                        >
                                            {cond === 'good' ? 'Baik' : cond === 'repair' ? 'Perbaikan' : 'Rusak'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tambahan: Condition Notes */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase flex items-center">
                                    <AlertCircle size={14} className="mr-1"/> Catatan Kondisi (Apa yang rusak/perbaikan?)
                                </label>
                                <textarea 
                                    rows="2"
                                    value={editData.condition_notes}
                                    onChange={(e) => setEditData('condition_notes', e.target.value)}
                                    className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                    placeholder="Contoh: Engsel pintu kanan rusak, perlu diganti..."
                                />
                                <p className="text-xs text-slate-400 mt-1">*Catatan ini akan tercatat bersama tanggal perubahan kondisi</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Keterangan Barang (Edit)</label>
                                <textarea 
                                    rows="3"
                                    value={editData.description}
                                    onChange={(e) => setEditData('description', e.target.value)}
                                    className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                    placeholder="Update keterangan barang..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Ganti Foto Barang (Opsional)</label>
                                <input 
                                    type="file" 
                                    onChange={e => setEditData('image', e.target.files[0])} 
                                    className="w-full p-2 border border-slate-300 rounded-xl text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                                    accept="image/*" 
                                />
                            </div>

                            <button 
                                type="button"
                                onClick={handleUpdateItem}
                                disabled={editProcessing}
                                className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <Save size={18} className="mr-2"/> {editProcessing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>

                            {/* Tombol Hapus */}
                            <div className="pt-2">
                                <button 
                                    type="button"
                                    onClick={() => handleDelete(selectedItem.id)}
                                    className="w-full py-3 text-red-500 hover:bg-red-50 rounded-xl font-bold transition flex items-center justify-center text-sm"
                                >
                                    <Trash2 size={16} className="mr-2"/> Hapus Barang Permanen
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="max-w-7xl mx-auto animate-fade-in pb-10">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1 flex items-center">
                <Box className="mr-3 text-orange-500" size={28} /> Inventaris Marcom
              </h1>
              <p className="text-slate-500 text-sm">Data aset dan perlengkapan divisi.</p>
            </div>
            <div className="flex space-x-3 w-full md:w-auto">
               <button 
                 onClick={() => setShowFilter(!showFilter)} 
                 className={`px-4 py-2.5 border rounded-xl text-sm font-medium flex items-center bg-white hover:bg-slate-50 transition ${showFilter ? 'border-orange-500 text-orange-600' : 'border-slate-200 text-slate-600'}`}
               >
                 <Filter size={16} className="mr-2" /> Filter
               </button>
               <button onClick={() => setViewMode('create')} className="bg-orange-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center hover:bg-orange-600 transition">
                 <Plus size={18} className="mr-2" /> Tambah Barang
               </button>
            </div>
          </div>

          {/* Filter Bar */}
          {showFilter && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Cari barang..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearch}
                    className="pl-10 pr-4 py-2.5 w-full border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
                <select 
                  className="border border-slate-300 p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500" 
                  value={filterCondition} 
                  onChange={e => setFilterCondition(e.target.value)}
                >
                    <option value="">Semua Kondisi</option>
                    <option value="good">Baik</option>
                    <option value="repair">Perbaikan</option>
                    <option value="damaged">Rusak</option>
                </select>
                <button onClick={handleFilter} className="bg-orange-600 text-white rounded-lg text-sm font-bold hover:bg-orange-700 transition">Terapkan</button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {items.map((item) => (
              <div 
                key={item.id} 
                onClick={() => setSelectedItem(item)}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all overflow-hidden group flex flex-col cursor-pointer"
              >
                 {/* Image Preview dengan Lazy Loading */}
                 {item.image_path && (
                   <div className="relative w-full h-40 bg-slate-100 overflow-hidden">
                     <img 
                       src={`/storage/${item.image_path}`} 
                       alt={item.name}
                       loading="lazy"
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                       onError={(e) => {
                         e.target.style.display = 'none';
                         e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg></div>';
                       }}
                     />
                   </div>
                 )}
                 
                 <div className="p-4 flex-1 flex flex-col relative">
                    {/* Badge Status di pojok kanan atas */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm ${
                         item.condition === 'good' ? 'bg-green-500 text-white' : 
                         item.condition === 'repair' ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {item.condition === 'good' ? 'Baik' : item.condition === 'repair' ? 'Perbaikan' : 'Rusak'}
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col pr-20">
                      <div className="text-[10px] font-bold text-orange-500 uppercase mb-1">{item.category}</div>
                      <h3 className="font-bold text-slate-800 text-base mb-2 line-clamp-2 leading-tight" title={item.name}>{item.name}</h3>
                      
                      {/* Description in List View */}
                      <p className="text-xs text-slate-500 line-clamp-3 mb-3 leading-relaxed">
                        {item.description || 'Tidak ada keterangan.'}
                      </p>

                      <div className="space-y-1 text-xs text-slate-500 mt-auto">
                         <div className="flex items-center"><Package size={12} className="mr-2 text-slate-400" /> {item.quantity} Unit</div>
                         <div className="flex items-center"><MapPin size={12} className="mr-2 text-slate-400" /> {item.location}</div>
                      </div>
                    </div>
                 </div>
              </div>
            ))}
            {items.length === 0 && <p className="col-span-full text-center text-slate-400 py-10">Tidak ada barang ditemukan.</p>}
          </div>
        </div>
      )}

      {/* CREATE FORM */}
      {viewMode === 'create' && (
        <div className="max-w-3xl mx-auto animate-fade-in pb-10">
          <button onClick={() => setViewMode('list')} className="flex items-center text-slate-500 hover:text-orange-500 mb-6">
            <ChevronLeft size={20} className="mr-1" /> Kembali
          </button>
          
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-orange-500 text-white">
              <h2 className="text-xl font-bold flex items-center"><Box className="mr-3" size={24} /> Tambah Barang</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nama Barang</label>
                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl text-sm" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Kategori</label>
                    <select value={data.category} onChange={e => setData('category', e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl text-sm" required>
                      <option value="">Pilih...</option>
                      <option value="Elektronik">Elektronik</option>
                      <option value="Furniture">Furniture</option>
                      <option value="Dekorasi">Dekorasi</option>
                      <option value="Lainnya">Lainnya (Isi Sendiri)</option>
                    </select>
                  </div>
               </div>

               {/* Custom Category Input */}
               {data.category === 'Lainnya' && (
                  <div className="animate-fade-in">
                    <label className="block text-sm font-bold text-orange-600 mb-2">Nama Kategori Baru</label>
                    <input 
                        type="text" 
                        value={data.custom_category} 
                        onChange={e => setData('custom_category', e.target.value)} 
                        className="w-full p-3 border border-orange-200 bg-orange-50 rounded-xl text-sm focus:ring-orange-500" 
                        placeholder="Tulis kategori..." 
                        required 
                    />
                  </div>
               )}

               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Jumlah</label>
                    <input type="number" value={data.quantity} onChange={e => setData('quantity', e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl text-sm" required />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Lokasi</label>
                    <input type="text" value={data.location} onChange={e => setData('location', e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl text-sm" placeholder="Contoh: Gudang Lt. 3" required />
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Kondisi</label>
                  <div className="flex gap-4">
                     {['good', 'repair', 'damaged'].map((cond) => (
                       <label key={cond} className="flex items-center p-3 border rounded-xl cursor-pointer hover:bg-slate-50 flex-1">
                          <input type="radio" name="condition" value={cond} checked={data.condition === cond} onChange={e => setData('condition', e.target.value)} className="text-orange-500 focus:ring-orange-500" />
                          <span className="ml-2 text-sm font-medium text-slate-700 capitalize">{cond === 'good' ? 'Baik' : cond === 'repair' ? 'Perbaikan' : 'Rusak'}</span>
                       </label>
                     ))}
                  </div>
               </div>

               {/* Description Field */}
               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Keterangan (Opsional)</label>
                  <textarea 
                    rows="3"
                    value={data.description} 
                    onChange={e => setData('description', e.target.value)} 
                    className="w-full p-3 border border-slate-300 rounded-xl text-sm" 
                    placeholder="Catatan tambahan tentang barang..." 
                  />
               </div>

               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Foto Barang</label>
                  <input type="file" onChange={e => setData('image', e.target.files[0])} className="w-full p-2 border border-slate-300 rounded-xl text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" accept="image/*" />
                  <p className="text-xs text-slate-400 mt-2">Format JPG/PNG. Max 2MB.</p>
               </div>

               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
                    <LinkIcon size={16} className="mr-2"/> Link Drive Foto Tambahan (Opsional)
                  </label>
                  <input 
                    type="url" 
                    value={data.drive_link} 
                    onChange={e => setData('drive_link', e.target.value)} 
                    className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none" 
                    placeholder="https://drive.google.com/..." 
                  />
                  <p className="text-xs text-slate-400 mt-1">*Untuk barang dengan banyak foto, upload ke Google Drive dan share linknya</p>
               </div>

               <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setViewMode('list')} className="px-6 py-3 border rounded-xl text-slate-600">Batal</button>
                  <button type="submit" disabled={processing} className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600">Simpan</button>
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