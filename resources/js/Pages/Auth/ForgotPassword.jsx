import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';
import { Mail, ArrowLeft, User, Shield } from 'lucide-react';

export default function ForgotPassword({ status }) {
    return (
        <GuestLayout>
            <Head title="Lupa Password" />

            <div className="text-center space-y-6">
                {/* Icon */}
                <div className="flex justify-center">
                    <div className="bg-indigo-100 rounded-full p-4">
                        <Shield size={48} className="text-indigo-600" />
                    </div>
                </div>

                {/* Judul */}
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Lupa Password?</h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Untuk keamanan akun Anda, silakan hubungi Manager atau Co-Manager Marcom Matos untuk reset password.
                    </p>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-left">
                    <h3 className="font-semibold text-slate-800 mb-3 flex items-center">
                        <User size={18} className="mr-2 text-blue-600" />
                        Hubungi:
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-700">
                        <li className="flex items-start">
                            <span className="font-semibold min-w-[120px]">Manager Marcom</span>
                            <span className="text-slate-600">untuk reset password Anda</span>
                        </li>
                        <li className="flex items-start">
                            <span className="font-semibold min-w-[120px]">Co-Manager</span>
                            <span className="text-slate-600">untuk reset password Anda</span>
                        </li>
                    </ul>
                </div>

                {/* Info Tambahan */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-sm text-amber-800">
                        <strong>Catatan:</strong> Pastikan Anda menghubungi langsung untuk verifikasi identitas Anda.
                    </p>
                </div>

                {/* Tombol Kembali */}
                <div className="pt-4">
                    <Link
                        href={route('login')}
                        className="inline-flex items-center px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-slate-200"
                    >
                        <ArrowLeft size={18} className="mr-2" />
                        Kembali ke Login
                    </Link>
                </div>
            </div>
        </GuestLayout>
    );
}
