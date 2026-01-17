import React, { useEffect, useState } from 'react';
import Checkbox from '@/Components/Checkbox';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { LogIn, User, Lock, Eye, EyeOff } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function Login({ status, canResetPassword }) {
    const { flash } = usePage().props;
    const [showPassword, setShowPassword] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    // Toast notifications untuk error dan success
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success, { duration: 6000 });
        }
        if (errors.email) {
            toast.error(errors.email);
        }
        if (errors.password) {
            toast.error(errors.password);
        }
    }, [errors, flash]);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <GuestLayout>
            <Head title="Log in" />
            <Toaster position="top-right" />

            {status && (
                <div className="mb-4 font-medium text-sm text-green-600 bg-green-50 p-3 rounded-lg text-center">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                {/* Email Input */}
                <div>
                    <InputLabel htmlFor="email" value="Email" className="text-slate-700 font-bold" />
                    <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User size={18} className="text-slate-400" />
                        </div>
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="pl-10 mt-1 block w-full border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm"
                            autoComplete="username"
                            isFocused={true}
                            placeholder="masukkan email anda"
                            onChange={(e) => setData('email', e.target.value)}
                        />
                    </div>
                    <InputError message={errors.email} className="mt-2" />
                </div>

                {/* Password Input */}
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
                            autoComplete="current-password"
                            placeholder="••••••••"
                            onChange={(e) => setData('password', e.target.value)}
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

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="text-indigo-600 focus:ring-indigo-500 rounded border-slate-300"
                        />
                        <span className="ml-2 text-sm text-slate-600">Ingat Saya</span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                            Lupa Password?
                        </Link>
                    )}
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                    <PrimaryButton 
                        className="w-full justify-center py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 focus:ring-indigo-500 rounded-xl text-base font-bold shadow-lg shadow-indigo-200 transition-all" 
                        disabled={processing}
                    >
                        {processing ? 'Memproses...' : (
                            <span className="flex items-center">
                                Masuk Sekarang <LogIn size={18} className="ml-2" />
                            </span>
                        )}
                    </PrimaryButton>
                </div>

                {/* Register Link */}
                <div className="text-center mt-6 border-t border-slate-100 pt-4">
                    <p className="text-sm text-slate-500">
                        Belum punya akun?{' '}
                        <Link
                            href={route('register')}
                            className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
                        >
                            Daftar disini
                        </Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}