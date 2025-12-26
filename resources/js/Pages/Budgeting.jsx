import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, router } from '@inertiajs/react';
import { 
  PieChart, FileSpreadsheet, Plus, DollarSign, 
  TrendingUp, TrendingDown, Edit3, Save, Calculator, 
  ChevronLeft, ChevronDown, ImageIcon, Upload, Trash2, Edit
} from 'lucide-react';

// Helper format rupiah
const formatRupiah = (amount) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

// Helper format tanggal
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

export default function Budgeting({ auth, monthlyOverview, incomeData, expenseData, selectedYear, oldBudgetFiles }) {
  const currentYear = selectedYear || new Date().getFullYear().toString();
  
  const [activeTab, setActiveTab] = useState('overview'); 
  const [viewMode, setViewMode] = useState('list'); // list, create, set-budget, upload-old
  
  // State untuk Edit
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // Hitung Total dari Props
  const totalBudget = monthlyOverview.reduce((acc, item) => acc + Number(item.budget), 0);
  const totalExpense = monthlyOverview.reduce((acc, item) => acc + Number(item.expense), 0);
  const totalRemaining = totalBudget - totalExpense;

  // --- FORM TRANSAKSI ---
  const { data, setData, post, processing, errors, reset } = useForm({
    type: 'expense',
    transaction_date: new Date().toISOString().split('T')[0],
    loo_number: '',
    customer_name: '',
    sr_number: '',
    sr_date: '',
    po_number: '',
    invoice_number: '',
    vendor_name: '',
    payment_date: '',
    description: '',
    coa_code: '',
    nominal: '',
    proof_file: null, // Field bukti
    _method: 'POST' // Default POST
  });

  // --- FORM ATUR BUDGET ---
  const { 
    data: budgetData, 
    setData: setBudgetData, 
    post: postBudget, 
    processing: budgetProcessing 
  } = useForm({
    year: currentYear,
    budgets: []
  });

  // --- FORM UPLOAD FILE LAMA ---
  const {
    data: oldFileData,
    setData: setOldFileData,
    post: postOldFile,
    processing: oldFileProcessing,
    errors: oldFileErrors,
    reset: resetOldFile
  } = useForm({
    year: '',
    description: '',
    file: null
  });

  // Inisialisasi data budget saat masuk mode set-budget
  useEffect(() => {
    if (viewMode === 'set-budget') {
        setBudgetData({
            year: currentYear,
            budgets: monthlyOverview.map(m => ({ month: m.month_num, amount: m.budget }))
        });
    }
  }, [viewMode, monthlyOverview]);

  const handleBudgetChange = (index, value) => {
      const newBudgets = [...budgetData.budgets];
      newBudgets[index].amount = value;
      setBudgetData('budgets', newBudgets);
  };

  const submitBudget = (e) => {
      e.preventDefault();
      postBudget(route('budgeting.storeBudget'), {
          onSuccess: () => setViewMode('list')
      });
  };

  const submitOldFile = (e) => {
    e.preventDefault();
    postOldFile(route('budgeting.upload_old'), {
      onSuccess: () => {
        resetOldFile();
        setViewMode('list');
      }
    });
  };

  const handleDeleteOldFile = (id) => {
    if (confirm('Yakin ingin menghapus file ini?')) {
      router.delete(route('budgeting.destroy_old', id));
    }
  };

  // --- ACTIONS TRANSAKSI ---
  const resetForm = () => {
      reset();
      setViewMode('list');
      setIsEditing(false);
      setEditId(null);
      setData('_method', 'POST');
  };

  const submitTransaction = (e) => {
    e.preventDefault();
    if (isEditing) {
        // Gunakan POST dengan _method: PUT untuk support file upload saat update
        post(route('budgeting.update', editId), {
            onSuccess: () => resetForm(),
        });
    } else {
        post(route('budgeting.store'), {
            onSuccess: () => resetForm(),
        });
    }
  };

  const handleDelete = (id) => {
      if (confirm('Yakin ingin menghapus transaksi ini?')) {
          router.delete(route('budgeting.destroy', id));
      }
  };

  const handleEdit = (item) => {
      setIsEditing(true);
      setEditId(item.id);
      setData({
          type: item.type,
          transaction_date: item.transaction_date.split('T')[0], // Fix format date for input
          loo_number: item.loo_number || '',
          customer_name: item.customer_name || '',
          sr_number: item.sr_number || '',
          sr_date: item.sr_date || '',
          po_number: item.po_number || '',
          invoice_number: item.invoice_number || '',
          vendor_name: item.vendor_name || '',
          payment_date: item.payment_date || '',
          description: item.description || '',
          coa_code: item.coa_code || '',
          nominal: item.nominal,
          proof_file: null,
          _method: 'PUT' // Spoofing method PUT
      });
      setViewMode('create');
  };

  const handleYearChange = (e) => {
    router.get(route('budgeting.index'), { year: e.target.value }, { preserveState: true });
  };

  const handleDownloadExcel = () => {
    window.location.href = route('budgeting.export', { year: currentYear });
  };

  // Fungsi Buka Form Transaksi (Otomatis deteksi tab)
  const handleOpenCreate = () => {
      reset();
      setIsEditing(false);
      setEditId(null);
      setData('_method', 'POST');

      if (activeTab === 'income') {
          setData('type', 'income');
      } else if (activeTab === 'expense') {
          setData('type', 'expense');
      }
      setViewMode('create');
  };

  // --- RENDER CONTENT ---

  return (
    <AuthenticatedLayout user={auth.user} title="Budgeting Marcom">
      {/* --- Header Section --- */}
      {viewMode === 'list' && (
        <div className="max-w-7xl mx-auto animate-fade-in pb-10">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1 sm:mb-2 flex items-center">
                <PieChart className="mr-3 text-purple-600" size={28} />
                Budgeting Marcom
              </h1>
              <p className="text-slate-500 text-sm sm:text-base">Kelola anggaran tahunan, pemasukan, dan pengeluaran.</p>
            </div>
            
            <div className="flex flex-wrap space-x-2 w-full md:w-auto items-center">
               <div className="relative">
                 <select 
                   value={currentYear}
                   onChange={handleYearChange}
                   className="appearance-none bg-white border border-purple-200 text-purple-700 font-bold py-2.5 pl-4 pr-10 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                 >
                   <option value="2025">Tahun 2025</option>
                   <option value="2024">Tahun 2024</option>
                   <option value="2023">Tahun 2023</option>
                 </select>
                 <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-500 pointer-events-none" />
               </div>

               <button 
                 onClick={handleDownloadExcel}
                 className="items-center justify-center px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm flex"
               >
                 <FileSpreadsheet size={18} className="mr-2 text-green-600" /> Excel
               </button>

               <button 
                 onClick={() => setViewMode('upload-old')}
                 className="items-center justify-center px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm flex"
               >
                 <Upload size={18} className="mr-2 text-blue-600" /> Upload Lama
               </button>
               
               {activeTab === 'overview' ? (
                  <button 
                    onClick={() => setViewMode('set-budget')}
                    className="items-center justify-center px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 shadow-lg transition-colors flex"
                  >
                    <Edit3 size={18} className="mr-2" /> Atur Budget
                  </button>
               ) : (
                  <button 
                      onClick={handleOpenCreate}
                      className="items-center justify-center px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 shadow-lg shadow-purple-200 transition-colors flex"
                  >
                    <Plus size={18} className="mr-2" /> Input Transaksi
                  </button>
               )}
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-full sm:w-fit mb-6">
             <button onClick={() => setActiveTab('overview')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Overview Bulanan</button>
             <button onClick={() => setActiveTab('income')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'income' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Data Pemasukan</button>
             <button onClick={() => setActiveTab('expense')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'expense' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Data Pengeluaran</button>
          </div>

          {/* --- OVERVIEW TAB --- */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                    <p className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">Total Budget {currentYear}</p>
                    <h3 className="text-2xl font-bold text-slate-800">{formatRupiah(totalBudget)}</h3>
                 </div>
                 <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                    <p className="text-red-600 text-xs font-bold uppercase tracking-wider mb-1">Total Pengeluaran</p>
                    <h3 className="text-2xl font-bold text-slate-800">{formatRupiah(totalExpense)}</h3>
                 </div>
                 <div className={`p-6 rounded-2xl border ${totalRemaining < 0 ? 'bg-red-100 border-red-200' : 'bg-green-50 border-green-100'}`}>
                    <p className={`${totalRemaining < 0 ? 'text-red-700' : 'text-green-600'} text-xs font-bold uppercase tracking-wider mb-1`}>Sisa Budget / Selisih</p>
                    <h3 className={`text-2xl font-bold ${totalRemaining < 0 ? 'text-red-700' : 'text-green-700'}`}>{formatRupiah(totalRemaining)}</h3>
                 </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                 <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700">Rincian Budget Bulanan ({currentYear})</div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                       <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                             <th className="p-4 text-xs font-bold text-slate-500 uppercase text-center w-16">No</th>
                             <th className="p-4 text-xs font-bold text-slate-500 uppercase">Bulan</th>
                             <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Budget</th>
                             <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Pengeluaran</th>
                             <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Selisih</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                          {monthlyOverview.map((item, index) => (
                             <tr key={index} className="hover:bg-slate-50">
                                <td className="p-4 text-center text-sm text-slate-500">{index + 1}</td>
                                <td className="p-4 text-sm font-medium text-slate-800">{item.month}</td>
                                <td className="p-4 text-sm text-right text-slate-600">{formatRupiah(item.budget)}</td>
                                <td className="p-4 text-sm text-right text-red-600">{formatRupiah(item.expense)}</td>
                                <td className={`p-4 text-sm text-right font-bold ${item.diff < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                   {formatRupiah(item.diff)}
                                </td>
                             </tr>
                          ))}
                          <tr className="bg-yellow-100 font-bold border-t-2 border-slate-300">
                             <td colSpan={2} className="p-4 text-center text-slate-800">TOTAL</td>
                             <td className="p-4 text-right text-slate-800">{formatRupiah(totalBudget)}</td>
                             <td className="p-4 text-right text-red-700">{formatRupiah(totalExpense)}</td>
                             <td className={`p-4 text-right ${totalRemaining < 0 ? 'text-red-700' : 'text-green-700'}`}>{formatRupiah(totalRemaining)}</td>
                          </tr>
                       </tbody>
                    </table>
                 </div>
              </div>
            </div>
          )}

          {/* --- INCOME TAB --- */}
          {activeTab === 'income' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                     <thead>
                        <tr className="bg-green-50 border-b border-green-100">
                           <th className="p-4 text-xs font-bold text-green-800 uppercase">No</th>
                           <th className="p-4 text-xs font-bold text-green-800 uppercase">Tanggal</th>
                           <th className="p-4 text-xs font-bold text-green-800 uppercase">LOO No.</th>
                           <th className="p-4 text-xs font-bold text-green-800 uppercase">Customer</th>
                           <th className="p-4 text-xs font-bold text-green-800 uppercase">Deskripsi</th>
                           <th className="p-4 text-xs font-bold text-green-800 uppercase text-right">Nominal</th>
                           <th className="p-4 text-xs font-bold text-green-800 uppercase text-center">Bukti</th>
                           <th className="p-4 text-xs font-bold text-green-800 uppercase text-center">Aksi</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {incomeData.length === 0 && (
                           <tr><td colSpan={8} className="p-8 text-center text-slate-400">Belum ada data pemasukan tahun {currentYear}</td></tr>
                        )}
                        {incomeData.map((item, index) => (
                           <tr key={item.id} className="hover:bg-slate-50">
                              <td className="p-4 text-sm text-slate-500">{index + 1}</td>
                              <td className="p-4 text-sm text-slate-600">{formatDate(item.transaction_date)}</td>
                              <td className="p-4 text-sm font-medium text-indigo-600">{item.loo_number}</td>
                              <td className="p-4 text-sm text-slate-800">{item.customer_name}</td>
                              <td className="p-4 text-sm text-slate-600">{item.description}</td>
                              <td className="p-4 text-sm text-right font-bold text-green-600">{formatRupiah(item.nominal)}</td>
                              <td className="p-4 text-center">
                                 {item.proof_file_path ? (
                                    <a href={item.proof_file_path} target="_blank" className="text-indigo-600 hover:text-indigo-800 flex items-center justify-center mx-auto">
                                       <ImageIcon size={16} className="mr-1" /> Lihat
                                    </a>
                                 ) : (
                                    <span className="text-slate-400 text-xs">-</span>
                                 )}
                              </td>
                              <td className="p-4 text-center flex justify-center gap-2">
                                 <button onClick={() => handleEdit(item)} className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition"><Edit size={16}/></button>
                                 <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={16}/></button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
          )}

          {/* --- EXPENSE TAB --- */}
          {activeTab === 'expense' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                     <thead>
                        <tr className="bg-red-50 border-b border-red-100">
                           <th className="p-4 text-xs font-bold text-red-800 uppercase">No</th>
                           <th className="p-4 text-xs font-bold text-red-800 uppercase">Tanggal</th>
                           <th className="p-4 text-xs font-bold text-red-800 uppercase">No. SR</th>
                           <th className="p-4 text-xs font-bold text-red-800 uppercase">No. PO</th>
                           <th className="p-4 text-xs font-bold text-red-800 uppercase">Vendor</th>
                           <th className="p-4 text-xs font-bold text-red-800 uppercase">Deskripsi</th>
                           <th className="p-4 text-xs font-bold text-red-800 uppercase text-right">Nominal</th>
                           <th className="p-4 text-xs font-bold text-red-800 uppercase text-center">Bukti</th>
                           <th className="p-4 text-xs font-bold text-red-800 uppercase text-center">Status</th>
                           <th className="p-4 text-xs font-bold text-red-800 uppercase text-center">Aksi</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {expenseData.length === 0 && (
                           <tr><td colSpan={10} className="p-8 text-center text-slate-400">Belum ada data pengeluaran tahun {currentYear}</td></tr>
                        )}
                        {expenseData.map((item, index) => (
                           <tr key={item.id} className="hover:bg-slate-50">
                              <td className="p-4 text-sm text-slate-500">{index + 1}</td>
                              <td className="p-4 text-sm text-slate-600">{formatDate(item.transaction_date)}</td>
                              <td className="p-4 text-sm text-slate-600">{item.sr_number}</td>
                              <td className="p-4 text-sm text-slate-600">{item.po_number}</td>
                              <td className="p-4 text-sm font-medium text-slate-800">{item.vendor_name}</td>
                              <td className="p-4 text-sm text-slate-600">{item.description}</td>
                              <td className="p-4 text-sm text-right font-bold text-red-600">{formatRupiah(item.nominal)}</td>
                              <td className="p-4 text-center">
                                 {item.proof_file_path ? (
                                    <a href={item.proof_file_path} target="_blank" className="text-indigo-600 hover:text-indigo-800 flex items-center justify-center mx-auto">
                                       <ImageIcon size={16} className="mr-1" /> Lihat
                                    </a>
                                 ) : (
                                    <span className="text-slate-400 text-xs">-</span>
                                 )}
                              </td>
                              <td className="p-4 text-center">
                                 <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {item.status}
                                 </span>
                              </td>
                              <td className="p-4 text-center flex justify-center gap-2">
                                 <button onClick={() => handleEdit(item)} className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition"><Edit size={16}/></button>
                                 <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={16}/></button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
          )}
        </div>
      )}

      {/* --- SET BUDGET MODE --- */}
      {viewMode === 'set-budget' && (
        <div className="max-w-3xl mx-auto animate-fade-in pb-10">
            <button onClick={() => setViewMode('list')} className="flex items-center text-slate-500 hover:text-purple-600 mb-6 transition-colors">
                <ChevronLeft size={20} className="mr-1" /> Kembali ke Overview
            </button>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-800 text-white">
                    <h2 className="text-xl font-bold flex items-center"><Edit3 className="mr-3" size={24} /> Atur Budget Bulanan ({currentYear})</h2>
                </div>
                <form onSubmit={submitBudget} className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {budgetData.budgets.map((item, index) => (
                            <div key={index} className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                    {monthlyOverview[index]?.month || `Bulan ${item.month}`}
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">Rp</span>
                                    <input 
                                        type="number" 
                                        value={item.amount} 
                                        onChange={(e) => handleBudgetChange(index, e.target.value)}
                                        className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-slate-100">
                        <button type="button" onClick={() => setViewMode('list')} className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50">Batal</button>
                        <button type="submit" disabled={budgetProcessing} className="px-6 py-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 shadow-lg flex items-center">
                            <Save size={18} className="mr-2" /> Simpan Budget
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* --- UPLOAD OLD FILE MODE --- */}
      {viewMode === 'upload-old' && (
        <div className="max-w-3xl mx-auto animate-fade-in pb-10">
          <button onClick={() => setViewMode('list')} className="flex items-center text-slate-500 hover:text-purple-600 mb-6 transition-colors">
            <ChevronLeft size={20} className="mr-1" /> Kembali ke Laporan
          </button>
          
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-blue-600 text-white">
              <h2 className="text-xl font-bold flex items-center"><Upload className="mr-3" size={24} /> Upload Budget Lama (Arsip)</h2>
            </div>
            
            <form onSubmit={submitOldFile} className="p-6 sm:p-8 space-y-6">
               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Tahun Anggaran</label>
                  <input type="number" value={oldFileData.year} onChange={e => setOldFileData('year', e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl text-sm" placeholder="Contoh: 2022" required />
               </div>
               
               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Deskripsi / Keterangan</label>
                  <textarea value={oldFileData.description} onChange={e => setOldFileData('description', e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl text-sm" rows="3" placeholder="Contoh: Laporan Budgeting Tahun 2022 Lengkap"></textarea>
               </div>

               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">File Arsip (PDF/Excel)</label>
                  <input 
                      type="file" 
                      onChange={e => setOldFileData('file', e.target.files[0])} 
                      className="w-full p-2 border border-slate-300 rounded-xl text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      accept=".pdf,.xlsx,.xls,.doc,.docx"
                      required
                  />
                  <p className="text-xs text-slate-500 mt-1">Format: PDF, Excel, Word. Max: 10MB.</p>
               </div>

               <div className="flex justify-end pt-4">
                  <button type="submit" disabled={oldFileProcessing} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center">
                     {oldFileProcessing ? 'Mengupload...' : <><Save size={18} className="mr-2" /> Upload Arsip</>}
                  </button>
               </div>
            </form>

            {/* List File Lama */}
            <div className="p-6 border-t border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-700 mb-4">Arsip File Budgeting Lama</h3>
                {oldBudgetFiles && oldBudgetFiles.length > 0 ? (
                    <div className="space-y-3">
                        {oldBudgetFiles.map((file) => (
                            <div key={file.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
                                <div className="flex items-center">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg mr-4">
                                        <FileSpreadsheet size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">Budgeting {file.year}</h4>
                                        <p className="text-xs text-slate-500">{file.description || 'Tidak ada deskripsi'}</p>
                                        <a href={file.file_path} target="_blank" className="text-xs text-blue-600 hover:underline mt-1 inline-block">Download / Lihat File</a>
                                    </div>
                                </div>
                                <button onClick={() => handleDeleteOldFile(file.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-500 text-sm text-center py-4">Belum ada file arsip lama yang diupload.</p>
                )}
            </div>
          </div>
        </div>
      )}

      {/* --- CREATE FORM MODE --- */}
      {viewMode === 'create' && (
        <div className="max-w-3xl mx-auto animate-fade-in pb-10">
          <button onClick={() => setViewMode('list')} className="flex items-center text-slate-500 hover:text-purple-600 mb-6 transition-colors">
            <ChevronLeft size={20} className="mr-1" /> Kembali ke Laporan
          </button>
          
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-purple-600 text-white">
              <h2 className="text-xl font-bold flex items-center"><Calculator className="mr-3" size={24} /> {isEditing ? 'Edit Data Keuangan' : 'Input Data Keuangan'}</h2>
            </div>
            
            <form onSubmit={submitTransaction} className="p-6 sm:p-8 space-y-6">
               <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
                  <button type="button" onClick={() => setData('type', 'income')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all flex items-center justify-center ${data.type === 'income' ? 'bg-green-500 text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}><TrendingUp size={16} className="mr-2" /> Pemasukan (Income)</button>
                  <button type="button" onClick={() => setData('type', 'expense')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all flex items-center justify-center ${data.type === 'expense' ? 'bg-red-500 text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}><TrendingDown size={16} className="mr-2" /> Pengeluaran (Expense)</button>
               </div>

               <div className="space-y-4">
                  {data.type === 'income' ? (
                     <>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2">Tanggal Input</label>
                              <input type="date" value={data.transaction_date} onChange={e => setData('transaction_date', e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl text-sm" />
                           </div>
                           <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2">LOO No.</label>
                              <input type="text" value={data.loo_number} onChange={e => setData('loo_number', e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl text-sm" />
                           </div>
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-slate-700 mb-2">Customer Name</label>
                           <input type="text" value={data.customer_name} onChange={e => setData('customer_name', e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl text-sm" />
                        </div>
                     </>
                  ) : (
                     <>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2">SR Date</label>
                              <input type="date" value={data.sr_date} onChange={e => setData('sr_date', e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl text-sm" />
                           </div>
                           <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2">No. SR</label>
                              <input type="text" value={data.sr_number} onChange={e => setData('sr_number', e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl text-sm" />
                           </div>
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-slate-700 mb-2">Nama Vendor</label>
                           <input type="text" value={data.vendor_name} onChange={e => setData('vendor_name', e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl text-sm" />
                        </div>
                     </>
                  )}

                  {/* Field Bukti Transaksi (Untuk Income & Expense) */}
                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-2">Bukti Transaksi (Gambar/PDF)</label>
                     <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 hover:bg-slate-50 transition text-center cursor-pointer relative">
                         <input 
                             type="file" 
                             onChange={e => setData('proof_file', e.target.files[0])} 
                             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                             accept="image/*,application/pdf"
                         />
                         <div className="flex flex-col items-center text-slate-500">
                             <Upload size={24} className="mb-2 text-purple-500"/>
                             <span className="text-sm font-medium">{data.proof_file ? data.proof_file.name : 'Klik untuk upload bukti'}</span>
                             <span className="text-xs text-slate-400 mt-1">Max 5MB</span>
                         </div>
                     </div>
                  </div>
                  
                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-2">Deskripsi</label>
                     <input type="text" value={data.description} onChange={e => setData('description', e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl text-sm" required />
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-2">Nominal (Rp)</label>
                     <input type="number" value={data.nominal} onChange={e => setData('nominal', e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl text-sm font-bold text-slate-800" required />
                  </div>
               </div>

               <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setViewMode('list')} className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50">Batal</button>
                  <button type="submit" disabled={processing} className="px-6 py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 shadow-lg flex items-center">
                    <Save size={18} className="mr-2" /> {isEditing ? 'Simpan Perubahan' : 'Simpan Data'}
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  );
}