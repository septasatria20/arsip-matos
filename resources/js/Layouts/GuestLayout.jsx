import React from 'react';
import { LayoutDashboard } from 'lucide-react';

// =================================================================================
// CATATAN: Aktifkan baris di bawah ini saat di Laravel, dan hapus bagian MOCK
// =================================================================================
// import { Link } from '@inertiajs/react';

// --- MOCK UNTUK PREVIEW (HAPUS BAGIAN INI DI LARAVEL) ---
const Link = ({ href, children, className }) => (
  <a href="#" onClick={(e) => e.preventDefault()} className={className}>{children}</a>
);
// --------------------------------------------------------

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-slate-50">
            <div className="w-full sm:max-w-md mt-6 px-6 py-8 bg-white shadow-xl overflow-hidden sm:rounded-2xl border border-slate-100">
                {/* Logo Header */}
                <div className="flex flex-col items-center mb-8">
                    <Link href="/" className="flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200 mb-4 hover:scale-105 transition-transform">
                        <LayoutDashboard size={32} />
                    </Link>
                    <h2 className="text-2xl font-bold text-slate-800">Matos Arsip Digital</h2>
                    <p className="text-slate-500 text-sm">Silakan masuk untuk mengakses sistem</p>
                </div>

                {children}
            </div>
            
            <div className="mt-8 text-center text-xs text-slate-400">
                &copy; {new Date().getFullYear()} Malang Town Square. All rights reserved.
            </div>
        </div>
    );
}