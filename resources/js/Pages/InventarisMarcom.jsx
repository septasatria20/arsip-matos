import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, router } from '@inertiajs/react';
import { 
  Box, Search, Plus, MapPin, Trash2, Package, 
  ChevronLeft, Save, Image as ImageIcon, X, FileText, Edit3 
} from 'lucide-react';

export default function InventarisMarcom({ auth, items, filters }) {
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [selectedItem, setSelectedItem] = useState(null); 
  
  // --- FORM EDIT (Modal) ---
  // Menggunakan useForm terpisah untuk edit agar handling request lebih stabil
  const { 
    data: editData, 
    setData: setEditData, 
    post: postEdit, // Ganti patch jadi post untuk support file upload (method spoofing)
    processing: editProcessing, 
    reset: resetEdit 
  } = useForm({
    condition: '',
    description: '',
    image: null, // Tambah field image
    _method: 'PATCH' // Method spoofing
  });

  // Sinkronisasi state edit saat item dipilih
  useEffect(() => {
    if (selectedItem) {
        setEditData({
            condition: selectedItem.condition,
            description: selectedItem.description || '',
            image: null,
            _method: 'PATCH'
        });
    }
  }, [selectedItem]);

  // Fungsi simpan perubahan dari modal
  const handleUpdateItem = (e) => {
      e.preventDefault(); // Prevent default form submission
      if (!selectedItem) return;
      
      postEdit(route('inventories.update', selectedItem.id), {
          onSuccess: () => {
            setSelectedItem(null);
            resetEdit();
          },
          onError: (errors) => {
            console.error("Gagal update:", errors);
            alert("Gagal menyimpan perubahan. Cek console untuk detail.");
          },
          preserveScroll: true
      });
  };

  // Handle Search
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
        router.get(route('inventories.index'), { search: searchQuery }, { preserveState: true });
    }
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
    post(route('inventories.store'), {
      onSuccess: () => {
        reset();
        setViewMode('list');
      }
    });
  };

  const handleDelete = (id) => {
    if (confirm('Hapus barang ini?')) {
        router.delete(route('inventories.destroy', id));
    }
  };

  return (
    <AuthenticatedLayout user={auth.user} title="Inventaris Marcom">
      
      {/* --- MODAL PREVIEW & EDIT --- */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setSelectedItem(null)}>
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-slide-up max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                {/* Header Image */}
                <div className="relative h-64 bg-slate-100 flex items-center justify-center group shrink-0">
                    {selectedItem.image_path ? (
                        <img src={`/storage/${selectedItem.image_path}`} className="w-full h-full object-cover" />
                    ) : (
                        <ImageIcon size={48} className="text-slate-300" />
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

                    {/* Description Display (Ditambahkan) */}
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase mb-2">Keterangan Barang</p>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-700 leading-relaxed">
                            {selectedItem.description || 'Tidak ada keterangan tambahan.'}
                        </div>
                    </div>

                    {/* Edit Section */}
                    <div className="border-t border-slate-100 pt-4">
                        <h3 className="font-bold text-slate-800 mb-3 flex items-center"><Edit3 size={16} className="mr-2"/> Update Kondisi & Keterangan</h3>
                        
                        <div className="space-y-4">
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

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Keterangan Tambahan (Edit)</label>
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

                            {/* Tombol Hapus dipindah ke sini */}
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
               <div className="relative group flex-1 md:flex-none">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input 
                   type="text" 
                   placeholder="Cari barang..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   onKeyDown={handleSearch}
                   className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm w-full md:w-64"
                 />
               </div>
               <button onClick={() => setViewMode('create')} className="bg-orange-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center hover:bg-orange-600 transition">
                 <Plus size={18} className="mr-2" /> Tambah Barang
               </button>
            </div>
          </div>

          {/* Grid diperkecil menjadi 5 kolom (xl:grid-cols-5) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {items.map((item) => (
              <div 
                key={item.id} 
                onClick={() => setSelectedItem(item)} // Klik card untuk preview
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all overflow-hidden group flex flex-col cursor-pointer"
              >
                 <div className="h-40 overflow-hidden relative bg-slate-100 flex items-center justify-center">
                    {item.image_path ? (
                        <img src={`/storage/${item.image_path}`} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                        <ImageIcon className="text-slate-300" size={32} />
                    )}
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm ${
                         item.condition === 'good' ? 'bg-green-500 text-white' : 
                         item.condition === 'repair' ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {item.condition === 'good' ? 'Baik' : item.condition === 'repair' ? 'Perbaikan' : 'Rusak'}
                      </span>
                    </div>
                 </div>

                 <div className="p-4 flex-1 flex flex-col">
                    {/* Tambahkan flex flex-col agar mt-auto berfungsi dengan baik */}
                    <div className="flex-1 flex flex-col">
                      <div className="text-[10px] font-bold text-orange-500 uppercase mb-1">{item.category}</div>
                      <h3 className="font-bold text-slate-800 text-base mb-2 line-clamp-1" title={item.name}>{item.name}</h3>
                      
                      {/* Description in List View */}
                      <p className="text-xs text-slate-500 line-clamp-2 mb-3 h-8 leading-relaxed">
                        {item.description || 'Tidak ada keterangan.'}
                      </p>

                      <div className="space-y-1 text-xs text-slate-500 mt-auto">
                         <div className="flex items-center"><Package size={12} className="mr-2 text-slate-400" /> {item.quantity} Unit</div>
                         <div className="flex items-center"><MapPin size={12} className="mr-2 text-slate-400" /> {item.location}</div>
                      </div>
                    </div>
                    
                    {/* Footer tombol hapus dihapus dari sini */}
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
                  <input type="file" onChange={e => setData('image', e.target.files[0])} className="w-full p-2 border border-slate-300 rounded-xl text-sm" accept="image/*" />
               </div>

               <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setViewMode('list')} className="px-6 py-3 border rounded-xl text-slate-600">Batal</button>
                  <button type="submit" disabled={processing} className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600">Simpan</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  );
}