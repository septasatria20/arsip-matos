import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { 
  Users, Search, Plus, Edit, Trash2, 
  Shield, Mail, X, Save, Check, Eye, EyeOff 
} from 'lucide-react';

export default function UserIndex({ auth, users, filters }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.search || '');

  // Form State untuk Create/Edit
  const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
    id: null,
    name: '',
    email: '',
    password: '',
    role: 'staff'
  });

  // Handle Search
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      router.get(route('users.index'), { search: searchQuery }, { preserveState: true });
    }
  };

  // Buka Modal Tambah
  const openCreateModal = () => {
    setIsEditMode(false);
    reset();
    clearErrors();
    setIsModalOpen(true);
  };

  // Buka Modal Edit
  const openEditModal = (user) => {
    setIsEditMode(true);
    setData({
      id: user.id,
      name: user.name,
      email: user.email,
      password: '', // Kosongkan password saat edit
      role: user.role || 'staff'
    });
    clearErrors();
    setIsModalOpen(true);
  };

  // Submit Form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditMode) {
      put(route('users.update', data.id), {
        onSuccess: () => {
          setIsModalOpen(false);
          reset();
        }
      });
    } else {
      post(route('users.store'), {
        onSuccess: () => {
          setIsModalOpen(false);
          reset();
        }
      });
    }
  };

  // Handle Delete
  const handleDelete = (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus user ini?')) {
      router.delete(route('users.destroy', id));
    }
  };

  return (
    <AuthenticatedLayout user={auth.user} title="Manajemen User">
      <Head title="Manajemen User" />

      <div className="max-w-7xl mx-auto animate-fade-in pb-10">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1 sm:mb-2 flex items-center">
              <Users className="mr-3 text-indigo-600" size={28} />
              Manajemen User
            </h1>
            <p className="text-slate-500 text-sm sm:text-base">Kelola akses Manager, Co-Manager, dan Staff.</p>
          </div>
          
          <div className="flex space-x-3 w-full md:w-auto">
             <div className="relative group flex-1 md:flex-none">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input 
                 type="text" 
                 placeholder="Cari nama / email..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 onKeyDown={handleSearch}
                 className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm w-full md:w-64 outline-none focus:border-indigo-500 transition-colors"
               />
             </div>
             <button 
                onClick={openCreateModal}
                className="flex-1 md:flex-none items-center justify-center px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-colors flex"
             >
               <Plus size={18} className="mr-2" /> Tambah User
             </button>
          </div>
        </div>

        {/* User List Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div key={user.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all relative group">
               <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                     <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-500 mr-4">
                        {user.name.charAt(0)}
                     </div>
                     <div>
                        <h3 className="font-bold text-slate-800">{user.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${
                           user.role === 'manager' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                           user.role === 'co_manager' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                           'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                           {user.role ? user.role.replace('_', ' ').toUpperCase() : 'STAFF'}
                        </span>
                     </div>
                  </div>
                  
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={() => openEditModal(user)} className="p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors">
                        <Edit size={16} />
                     </button>
                     {auth.user.id !== user.id && (
                       <button onClick={() => handleDelete(user.id)} className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
                          <Trash2 size={16} />
                       </button>
                     )}
                  </div>
               </div>
               
               <div className="space-y-2">
                  <div className="flex items-center text-sm text-slate-500">
                     <Mail size={14} className="mr-2 text-slate-400" /> {user.email}
                  </div>
                  <div className="flex items-center text-sm text-slate-500">
                     <Shield size={14} className="mr-2 text-slate-400" /> Akses: {user.role === 'manager' ? 'Full Access' : 'Limited'}
                  </div>
               </div>
            </div>
          ))}
        </div>

        {users.length === 0 && (
           <div className="text-center py-20 text-slate-400">
              <Users size={48} className="mx-auto mb-4 opacity-20" />
              <p>Tidak ada user ditemukan.</p>
           </div>
        )}

      </div>

      {/* MODAL CREATE / EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <h3 className="font-bold text-slate-800">{isEditMode ? 'Edit User' : 'Tambah User Baru'}</h3>
                 <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Lengkap</label>
                    <input 
                       type="text" 
                       value={data.name}
                       onChange={e => setData('name', e.target.value)}
                       className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                       placeholder="Nama User"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                    <input 
                       type="email" 
                       value={data.email}
                       onChange={e => setData('email', e.target.value)}
                       className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                       placeholder="email@matos.com"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role / Jabatan</label>
                    <select 
                       value={data.role} 
                       onChange={e => setData('role', e.target.value)}
                       className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 outline-none bg-white"
                    >
                       <option value="staff">Staff (Standard)</option>
                       <option value="co_manager">Co-Manager (Supervisor)</option>
                       <option value="manager">Manager (Admin)</option>
                    </select>
                    {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                 </div>

                 <div className="pt-2 border-t border-slate-100 mt-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                       {isEditMode ? 'Password (Isi jika ingin mengubah)' : 'Password'}
                    </label>
                    <div className="relative">
                       <input 
                          type={showPassword ? "text" : "password"}
                          value={data.password}
                          onChange={e => setData('password', e.target.value)}
                          className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 pr-10"
                          placeholder="********"
                       />
                       <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                          onClick={() => setShowPassword(!showPassword)}
                       >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                       </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                 </div>

                 <div className="flex justify-end pt-4 gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg text-sm font-medium">Batal</button>
                    <button type="submit" disabled={processing} className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center">
                       {processing ? 'Menyimpan...' : <><Save size={16} className="mr-2" /> Simpan Data</>}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

    </AuthenticatedLayout>
  );
}