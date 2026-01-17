import { useEffect, useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Eye, EyeOff, User, Mail, Lock, UserPlus, CheckCircle, Info } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function Register() {
    const { flash } = usePage().props;
    const [showPassword, setShowPassword] = useState(false);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    // Toast notifications untuk error
    useEffect(() => {
        if (errors.name) toast.error(errors.name);
        if (errors.email) toast.error(errors.email);
        if (errors.password) toast.error(errors.password);
        if (errors.password_confirmation) toast.error(errors.password_confirmation);
    }, [errors]);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onSuccess: () => {
                setRegistrationSuccess(true);
            }
        });
    };

    // Jika registrasi berhasil, tampilkan halaman sukses
    if (registrationSuccess) {
        return (
            <GuestLayout>
                <Head title="Pendaftaran Berhasil" />
                
                <div className="text-center space-y-6 animate-fade-in">
                    {/* Icon Success */}
                    <div className="flex justify-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle size={48} className="text-green-600" />
                        </div>
                    </div>

                    {/* Judul */}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">
                            Pendaftaran Berhasil!
                        </h2>
                        <p className="text-slate-600">
                            Akun Anda telah dibuat dengan email: <strong>{data.email}</strong>
                        </p>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-left">
                        <div className="flex items-start">
                            <Info size={24} className="text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                            <div className="space-y-3">
                                <h3 className="font-bold text-blue-900 text-lg">Proses Verifikasi Diperlukan</h3>
                                <p className="text-blue-800 text-sm leading-relaxed">
                                    Untuk keamanan sistem, akun Anda perlu diverifikasi terlebih dahulu oleh <strong>Manager</strong> atau <strong>Co-Manager</strong> sebelum dapat digunakan untuk login.
                                </p>
                                <div className="bg-white rounded-lg p-4 border border-blue-100">
                                    <p className="text-sm text-slate-700 mb-2 font-semibold">Langkah selanjutnya:</p>
                                    <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
                                        <li>Hubungi <strong>Manager</strong> atau <strong>Co-Manager</strong> Anda</li>
                                        <li>Informasikan bahwa Anda telah mendaftar dengan email: <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">{data.email}</span></li>
                                        <li>Tunggu hingga akun Anda di-approve</li>
                                        <li>Setelah approved, Anda akan menerima konfirmasi dan dapat login</li>
                                    </ol>
                                </div>
                                <p className="text-xs text-blue-700 italic">
                                    💡 Proses approval biasanya memakan waktu beberapa menit hingga beberapa jam tergantung ketersediaan Manager.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Button ke Login */}
                    <div className="pt-4">
                        <Link
                            href={route('login')}
                            className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all"
                        >
                            Kembali ke Halaman Login
                        </Link>
                    </div>

                    {/* Footer note */}
                    <p className="text-xs text-slate-400 pt-4">
                        Jika ada kendala, silakan hubungi admin sistem.
                    </p>
                </div>
            </GuestLayout>
        );
    }

    return (
        <GuestLayout>
            <Head title="Daftar" />
            <Toaster position="top-right" />

            <form onSubmit={submit} className="space-y-5">
                {/* Nama Lengkap */}
                <div>
                    <InputLabel htmlFor="name" value="Nama Lengkap" className="text-slate-700 font-bold" />
                    <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User size={18} className="text-slate-400" />
                        </div>
                        <TextInput
                            id="name"
                            name="name"
                            value={data.name}
                            className="pl-10 mt-1 block w-full border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm"
                            autoComplete="name"
                            isFocused={true}
                            placeholder="Masukkan nama lengkap"
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                    </div>
                    <InputError message={errors.name} className="mt-2" />
                </div>

                {/* Email */}
                <div>
                    <InputLabel htmlFor="email" value="Email" className="text-slate-700 font-bold" />
                    <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail size={18} className="text-slate-400" />
                        </div>
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="pl-10 mt-1 block w-full border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm"
                            autoComplete="username"
                            placeholder="contoh@matos.co.id"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                    </div>
                    <InputError message={errors.email} className="mt-2" />
                </div>

                {/* Password */}
                <div>
                    <InputLabel htmlFor="password" value="Password" className="text-slate-700 font-bold" />
                    <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock size={18} className="text-slate-400" />
                        </div>
                        <TextInput
                            id="password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={data.password}
                            className="pl-10 pr-10 mt-1 block w-full border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm"
                            autoComplete="new-password"
                            placeholder="Minimal 8 karakter"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    <InputError message={errors.password} className="mt-2" />
                </div>

                {/* Konfirmasi Password */}
                <div>
                    <InputLabel htmlFor="password_confirmation" value="Konfirmasi Password" className="text-slate-700 font-bold" />
                    <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock size={18} className="text-slate-400" />
                        </div>
                        <TextInput
                            id="password_confirmation"
                            type={showPassword ? "text" : "password"}
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="pl-10 pr-10 mt-1 block w-full border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm"
                            autoComplete="new-password"
                            placeholder="Ulangi password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                    <PrimaryButton 
                        className="w-full justify-center py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 focus:ring-indigo-500 rounded-xl text-base font-bold shadow-lg shadow-indigo-200 transition-all" 
                        disabled={processing}
                    >
                        {processing ? 'Memproses...' : (
                            <span className="flex items-center">
                                Daftar Sekarang <UserPlus size={18} className="ml-2" />
                            </span>
                        )}
                    </PrimaryButton>
                </div>

                {/* Login Link */}
                <div className="text-center mt-6 border-t border-slate-100 pt-4">
                    <p className="text-sm text-slate-500">
                        Sudah punya akun?{' '}
                        <Link
                            href={route('login')}
                            className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
                        >
                            Masuk disini
                        </Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
