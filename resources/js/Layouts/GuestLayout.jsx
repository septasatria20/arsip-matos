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
                    <Link href="/" className="mb-4 hover:scale-105 transition-transform">
                        <img src="/images/logo.png" alt="Logo SIAR" className="h-20 w-auto" />
                    </Link>
                    {/* <h2 className="text-2xl font-bold text-indigo-600">SIAR - MATOS</h2> */}
                    <p className="text-slate-500 text-sm">Sistem Informasi Arsip Malang Town Square</p>
                </div>

                {children}
            </div>
            
            <div className="mt-8 text-center text-xs text-slate-400">
                &copy; {new Date().getFullYear()} Malang Town Square. All rights reserved.
            </div>
        </div>
    );
}