import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, router } from '@inertiajs/react';
import { 
  FileText, Calendar, Filter, Plus, Upload, 
  Trash2, Eye, Download, Save, ChevronLeft, 
  CheckCircle, XCircle, User, Users, Printer, X, Edit
} from 'lucide-react';

export default function ConfirmationLetter({ auth, letters, filters }) {
  const [viewMode, setViewMode] = useState('list'); // list, archive, create
  const [showFilter, setShowFilter] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const isManager = auth.user.role === 'manager' || auth.user.role === 'co_manager';

  // --- STATE FILTER ---
  const [filterValues, setFilterValues] = useState({
    category: filters.category || '',
    month: filters.month || '',
    year: filters.year || new Date().getFullYear(),
    search: filters.search || ''
  });

  const handleFilter = () => {
    router.get(route('confirmation.index'), filterValues, { preserveState: true });
  };

  // --- STATE PREVIEW PDF ---
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // --- FORM ARSIP MANUAL (Create & Edit) ---
  const { 
    data: archiveData, 
    setData: setArchiveData, 
    post: postArchive, 
    processing: archiveProcessing, 
    reset: resetArchive, 
    errors: archiveErrors,
    transform: transformArchive 
  } = useForm({
    event_date: '', 
    event_name: '', 
    eo_name: '', 
    category: '', 
    custom_category: '',
    file: null,
    _method: 'POST'
  });

  // Logic Transform: Jika kategori 'Lainnya', gunakan isi custom_category
  useEffect(() => {
    transformArchive((data) => ({
      ...data,
      category: data.category === 'Lainnya' ? data.custom_category : data.category,
    }));
  }, []);

  // Fungsi Buka Edit
  const openEdit = (item) => {
      setIsEditing(true);
      setEditId(item.id);

      // Cek apakah kategori ada di list standar
      const standardCategories = ['Sewa Lahan', 'Sponsorship', 'Event Komunitas'];
      const isCustom = !standardCategories.includes(item.category);

      setArchiveData({
          event_date: item.event_date,
          event_name: item.event_name,
          eo_name: item.eo_name,
          category: isCustom ? 'Lainnya' : item.category,
          custom_category: isCustom ? item.category : '',
          file: null,
          _method: 'PUT'
      });
      setViewMode('archive');
  };

  const submitArchive = (e) => {
    e.preventDefault();
    if (isEditing) {
        postArchive(route('confirmation.update', editId), { onSuccess: () => { resetForm(); } });
    } else {
        postArchive(route('confirmation.store'), { onSuccess: () => { resetForm(); } });
    }
  };

  const resetForm = () => {
      resetArchive();
      setViewMode('list');
      setIsEditing(false);
      setEditId(null);
      setArchiveData('_method', 'POST');
  };

  // --- FORM GENERATOR SURAT ---
  const { data: genData, setData: setGenData, post: postGen, processing: genProcessing, reset: resetGen, errors: genErrors } = useForm({
    pihak_kedua_nama: '',
    pihak_kedua_jabatan: '',
    pihak_kedua_instansi: '',
    pihak_kedua_alamat: '',
    event_date: new Date().toISOString().split('T')[0],
    poin_support: [''],
    signatures: [
        { label: 'Pihak Pertama', nama: 'Listyo Rahayu', jabatan: 'Marcomm Manager' },
        { label: 'Pihak Kedua', nama: '', jabatan: '' }
    ]
  });

  const handlePoinChange = (index, value) => {
    const newPoin = [...genData.poin_support];
    newPoin[index] = value;
    setGenData('poin_support', newPoin);
  };
  const addPoin = () => setGenData('poin_support', [...genData.poin_support, '']);
  const removePoin = (index) => setGenData('poin_support', genData.poin_support.filter((_, i) => i !== index));

  const handleSigChange = (index, field, value) => {
    const newSigs = [...genData.signatures];
    newSigs[index][field] = value;
    setGenData('signatures', newSigs);
  };
  const addSig = () => setGenData('signatures', [...genData.signatures, { label: 'Mengetahui', nama: '', jabatan: '' }]);
  const removeSig = (index) => {
      if (genData.signatures.length > 1) {
        setGenData('signatures', genData.signatures.filter((_, i) => i !== index));
      }
  };

  const handlePihakKeduaChange = (field, value) => {
      setGenData(prev => {
          const newData = { ...prev, [field]: value };
          const newSigs = [...prev.signatures];
          if (newSigs[1] && newSigs[1].label === 'Pihak Kedua') {
              if (field === 'pihak_kedua_nama') newSigs[1].nama = value;
              if (field === 'pihak_kedua_jabatan') newSigs[1].jabatan = value;
          }
          newData.signatures = newSigs;
          return newData;
      });
  };

  // --- HANDLER PREVIEW PDF ---
  const handlePreview = async () => {
    setIsPreviewLoading(true);
    try {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        const response = await fetch(route('confirmation.preview'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                'Accept': 'application/pdf'
            },
            body: JSON.stringify(genData)
        });

        if (!response.ok) throw new Error('Gagal memuat preview');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setPreviewUrl(url);
    } catch (error) {
        alert('Gagal membuat preview. Pastikan data terisi lengkap.');
    } finally {
        setIsPreviewLoading(false);
    }
  };

  const closePreview = () => setPreviewUrl(null);

  const submitGenerator = (e) => {
    e.preventDefault();
    postGen(route('confirmation.generate'), { onSuccess: () => { resetGen(); setViewMode('list'); } });
  };

  // --- GENERAL ACTIONS ---
  const updateStatus = (id, newStatus) => {
    if(confirm(`Ubah status menjadi ${newStatus}?`)) {
        router.patch(route('confirmation.status', id), { status: newStatus });
    }
  };

  const handleDelete = (id) => {
    if (confirm('Yakin ingin menghapus data ini?')) {
        router.delete(route('confirmation.destroy', id));
    }
  };

  return (
    <AuthenticatedLayout user={auth.user} title="Confirmation Letter">
      
      {/* --- MODAL PREVIEW PDF --- */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50">
                    <h3 className="font-bold text-lg text-slate-700 flex items-center">
                        <Eye className="mr-2 text-indigo-600" size={20}/> Preview Surat
                    </h3>
                    <button onClick={closePreview} className="p-2 hover:bg-slate-200 rounded-full transition">
                        <X size={20} className="text-slate-500"/>
                    </button>
                </div>
                <div className="flex-1 bg-slate-200 p-4">
                    <iframe src={previewUrl} className="w-full h-full rounded-lg shadow-inner bg-white" title="PDF Preview"></iframe>
                </div>
                <div className="p-4 border-t border-slate-200 bg-white flex justify-end gap-3">
                    <button onClick={closePreview} className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50 font-medium">Tutup & Edit Lagi</button>
                    <button 
                        onClick={(e) => { closePreview(); document.getElementById('form-generator').requestSubmit(); }} 
                        className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg flex items-center"
                    >
                        <Save size={18} className="mr-2"/> Simpan Permanen
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* VIEW: LIST DATA */}
      {viewMode === 'list' && (
        <div className="max-w-7xl mx-auto animate-fade-in pb-10">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1 sm:mb-2 flex items-center">
                <FileText className="mr-3 text-indigo-600" size={28} />
                Confirmation Letter
              </h1>
              <p className="text-slate-500 text-sm sm:text-base">Arsip dan generator surat perjanjian kerjasama.</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <button onClick={() => setShowFilter(!showFilter)} className={`px-4 py-2.5 border rounded-xl text-sm font-medium flex items-center justify-center ${showFilter ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white hover:bg-slate-50'}`}>
                    <Filter size={18} className="mr-2" /> Filter
                </button>
                
                {/* === PERBAIKAN DROPDOWN HOVER === */}
                <div className="relative group z-20"> {/* Tambah z-20 */}
                    <button className="w-full md:w-auto px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 flex items-center justify-center transition-colors">
                       <Plus size={18} className="mr-2" /> Menu Baru
                    </button>
                    
                    {/* Menggunakan padding-top (pt-2) sebagai jembatan agar kursor tidak putus */}
                    <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block hover:block transition-all duration-200">
                       <div className="bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden">
                           <button onClick={() => {resetForm(); setViewMode('archive');}} className="w-full text-left px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 flex items-center transition-colors border-b border-slate-50">
                             <Upload size={16} className="mr-2" /> Upload Arsip
                           </button>
                           <button onClick={() => setViewMode('create')} className="w-full text-left px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 flex items-center transition-colors">
                             <FileText size={16} className="mr-2" /> Generator Surat
                           </button>
                       </div>
                    </div>
                </div>
                {/* ================================ */}

            </div>
          </div>

          {/* FILTER SECTION */}
          {showFilter && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-4">
                <input 
                    type="text" placeholder="Cari Event / EO..." 
                    className="border p-2 rounded-lg text-sm"
                    value={filterValues.search} onChange={e => setFilterValues({...filterValues, search: e.target.value})}
                />
                <select className="border p-2 rounded-lg text-sm" value={filterValues.month} onChange={e => setFilterValues({...filterValues, month: e.target.value})}>
                    <option value="">Semua Bulan</option>
                    {[...Array(12)].map((_, i) => <option key={i} value={i+1}>{new Date(0, i).toLocaleString('id', {month:'long'})}</option>)}
                </select>
                <select className="border p-2 rounded-lg text-sm" value={filterValues.year} onChange={e => setFilterValues({...filterValues, year: e.target.value})}>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                </select>
                <button onClick={handleFilter} className="bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700">Terapkan Filter</button>
            </div>
          )}

          {/* TABEL */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Event Info</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">EO / Pengupload</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Dokumen</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {letters.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-slate-400">Belum ada data.</td></tr>}
                  {letters.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{item.event_name}</div>
                        <div className="text-xs text-slate-500 flex items-center mt-1">
                          <Calendar size={12} className="mr-1" /> {new Date(item.event_date).toLocaleDateString('id-ID')}
                          <span className="mx-2">•</span> {item.category}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-slate-700">{item.eo_name}</div>
                        <div className="text-xs text-slate-400 flex items-center mt-1"><User size={12} className="mr-1"/> {item.user?.name}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${item.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' : item.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                          {item.status}
                        </span>
                      </td>
                      
                      {/* KOLOM DOKUMEN (DIPERBAIKI) */}
                      <td className="p-4">
                        {item.file_path ? (
                            <a 
                                href={`/storage/${item.file_path}`} 
                                target="_blank" 
                                className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
                                title="Klik untuk melihat dokumen"
                            >
                                <FileText size={16} className="mr-1"/> Lihat Dokumen
                            </a>
                        ) : (
                            <span className="text-xs text-slate-400 italic">Tidak ada file</span>
                        )}
                      </td>

                      <td className="p-4 text-right flex justify-end space-x-2">
                        {/* Tombol Approval */}
                        {isManager && item.status === 'pending' && (
                            <>
                                <button onClick={() => updateStatus(item.id, 'approved')} className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg"><CheckCircle size={18}/></button>
                                <button onClick={() => updateStatus(item.id, 'rejected')} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg"><XCircle size={18}/></button>
                            </>
                        )}
                        
                        {/* Tombol Edit */}
                        {(item.status === 'pending' || item.status === 'rejected') && item.user_id === auth.user.id && (
                            <button onClick={() => openEdit(item)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg" title="Edit / Revisi">
                                <Edit size={18} />
                            </button>
                        )}

                        {/* Tombol View/Download (Mata) */}
                        {item.file_path && (
                             <a href={`/storage/${item.file_path}`} target="_blank" className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg" title="Buka File">
                                <Eye size={18}/>
                             </a>
                        )}
                        
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={18}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: GENERATOR SURAT (Sama, tidak ada perubahan signifikan) */}
      {viewMode === 'create' && (
        <div className="max-w-4xl mx-auto pb-10">
            <button onClick={() => setViewMode('list')} className="flex items-center text-slate-500 mb-6"><ChevronLeft size={20} /> Kembali</button>
            
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                <div className="p-6 border-b bg-indigo-600 text-white"><h2 className="text-xl font-bold flex items-center"><FileText className="mr-3" /> Generator Surat Otomatis</h2></div>
                
                <form id="form-generator" onSubmit={submitGenerator} className="p-8 space-y-6">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
                        <h3 className="font-bold text-blue-800 text-sm mb-2">Pihak Pertama (Otomatis)</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="text-slate-500">Nama:</span> <b>Listyo Rahayu</b></div>
                            <div><span className="text-slate-500">Jabatan:</span> <b>Marcomm Manager</b></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div><label className="label">Nama Pihak Kedua</label><input type="text" className="input-field" value={genData.pihak_kedua_nama} onChange={e => handlePihakKeduaChange('pihak_kedua_nama', e.target.value)} required /></div>
                        <div><label className="label">Jabatan</label><input type="text" className="input-field" value={genData.pihak_kedua_jabatan} onChange={e => handlePihakKeduaChange('pihak_kedua_jabatan', e.target.value)} required /></div>
                    </div>
                    <div><label className="label">Nama Instansi / Perusahaan</label><input type="text" className="input-field" value={genData.pihak_kedua_instansi} onChange={e => setGenData('pihak_kedua_instansi', e.target.value)} required /></div>
                    <div><label className="label">Alamat Lengkap</label><textarea className="input-field" rows="2" value={genData.pihak_kedua_alamat} onChange={e => setGenData('pihak_kedua_alamat', e.target.value)} required /></div>

                    <div>
                        <label className="label mb-2 block">Poin-poin Support (Bentuk Kerjasama)</label>
                        {genData.poin_support.map((poin, idx) => (
                            <div key={idx} className="flex gap-2 mb-2">
                                <input type="text" className="input-field" placeholder={`Poin ${idx + 1}`} value={poin} onChange={e => handlePoinChange(idx, e.target.value)} required />
                                <button type="button" onClick={() => removePoin(idx)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={18}/></button>
                            </div>
                        ))}
                        <button type="button" onClick={addPoin} className="text-sm text-indigo-600 font-bold mt-2 flex items-center"><Plus size={16} className="mr-1"/> Tambah Poin</button>
                    </div>

                    <div className="border-t pt-6">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center"><Users className="mr-2" size={20}/> Pengaturan Tanda Tangan</h3>
                        <div className="space-y-4">
                            {genData.signatures.map((sig, idx) => (
                                <div key={idx} className="grid grid-cols-12 gap-2 items-end bg-slate-50 p-3 rounded-xl">
                                    <div className="col-span-3"><label className="text-xs font-bold text-slate-500">Label (Pihak)</label><input type="text" className="w-full p-2 text-sm border rounded" value={sig.label} onChange={(e) => handleSigChange(idx, 'label', e.target.value)} /></div>
                                    <div className="col-span-4"><label className="text-xs font-bold text-slate-500">Nama</label><input type="text" className="w-full p-2 text-sm border rounded" value={sig.nama} onChange={(e) => handleSigChange(idx, 'nama', e.target.value)} /></div>
                                    <div className="col-span-4"><label className="text-xs font-bold text-slate-500">Jabatan</label><input type="text" className="w-full p-2 text-sm border rounded" value={sig.jabatan} onChange={(e) => handleSigChange(idx, 'jabatan', e.target.value)} /></div>
                                    <div className="col-span-1"><button type="button" onClick={() => removeSig(idx)} className="p-2 text-red-500 hover:bg-red-100 rounded"><Trash2 size={16} /></button></div>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addSig} className="text-sm text-indigo-600 font-bold mt-3 flex items-center"><Plus size={16} className="mr-1"/> Tambah Penandatangan</button>
                    </div>

                    <div className="flex justify-end gap-4 border-t pt-6">
                        <button type="button" onClick={handlePreview} disabled={isPreviewLoading} className="bg-white border border-slate-300 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 flex items-center shadow-sm">
                            <Printer size={18} className="mr-2"/> {isPreviewLoading ? 'Memuat...' : 'Review PDF'}
                        </button>
                        <button type="submit" disabled={genProcessing} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 flex items-center shadow-lg shadow-indigo-200">
                            <Save size={18} className="mr-2"/> {genProcessing ? 'Memproses...' : 'Simpan Permanen'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* FORM ARSIP / EDIT */}
      {viewMode === 'archive' && (
          <div className="max-w-3xl mx-auto pb-10">
             <button onClick={resetForm} className="flex items-center text-slate-500 mb-6"><ChevronLeft size={20} /> Kembali</button>
             <div className="bg-white p-8 rounded-2xl shadow">
                <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit Arsip' : 'Upload Arsip Baru'}</h2>
                <form onSubmit={submitArchive} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Tanggal</label>
                            <input type="date" className="input-field" value={archiveData.event_date} onChange={e => setArchiveData('event_date', e.target.value)} required />
                        </div>
                        <div>
                            <label className="label">Kategori</label>
                            <select className="input-field" value={archiveData.category} onChange={e => setArchiveData('category', e.target.value)} required>
                                <option value="">Pilih Kategori</option>
                                <option value="Sewa Lahan">Sewa Lahan</option>
                                <option value="Sponsorship">Sponsorship</option>
                                <option value="Event Komunitas">Event Komunitas</option>
                                <option value="Lainnya">Lainnya (Isi Sendiri)</option>
                            </select>
                        </div>
                    </div>

                    {/* FIELD CUSTOM CATEGORY (Muncul jika pilih Lainnya) */}
                    {archiveData.category === 'Lainnya' && (
                        <div className="animate-fade-in">
                            <label className="label text-indigo-600">Nama Kategori Baru</label>
                            <input 
                                type="text" 
                                className="input-field border-indigo-300 bg-indigo-50" 
                                placeholder="Tulis nama kategori..."
                                value={archiveData.custom_category} 
                                onChange={e => setArchiveData('custom_category', e.target.value)} 
                                required 
                            />
                        </div>
                    )}

                    <input type="text" placeholder="Nama Event" className="input-field" value={archiveData.event_name} onChange={e => setArchiveData('event_name', e.target.value)} required />
                    <input type="text" placeholder="Nama EO / Pihak Kedua" className="input-field" value={archiveData.eo_name} onChange={e => setArchiveData('eo_name', e.target.value)} required />
                    
                    <div>
                        <label className="label">File Surat {isEditing && '(Opsional)'}</label>
                        <input type="file" className="input-field pt-2" onChange={e => setArchiveData('file', e.target.files[0])} required={!isEditing} />
                    </div>

                    <button type="submit" disabled={archiveProcessing} className="bg-indigo-600 text-white w-full py-3 rounded-xl font-bold hover:bg-indigo-700 transition">
                        {isEditing ? 'Simpan Perubahan' : 'Simpan Arsip'}
                    </button>
                </form>
             </div>
          </div>
      )}

      <style>{`
        .label { display: block; font-size: 0.875rem; font-weight: 700; color: #334155; margin-bottom: 0.5rem; }
        .input-field { width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 0.75rem; font-size: 0.875rem; outline: none; transition: border-color 0.2s; }
        .input-field:focus { border-color: #4f46e5; ring: 2px solid #e0e7ff; }
      `}</style>
    </AuthenticatedLayout>
  );
}