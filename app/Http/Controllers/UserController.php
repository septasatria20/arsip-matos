<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Constructor - Pastikan hanya manager/co-manager yang bisa akses
     */
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware(function ($request, $next) {
            $user = auth()->user();
            if (!$user || !in_array($user->role, ['manager', 'co_manager'])) {
                return redirect('/dashboard')->with('error', 'Anda tidak memiliki akses ke manajemen user.');
            }
            return $next($request);
        });
    }

    /**
     * Menampilkan daftar user
     */
    public function index(Request $request)
    {
        $query = User::query();

        // Fitur Search sederhana
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
        }

        // Urutkan dari yang terbaru, kecuali super admin jika perlu
        $users = $query->latest()->get();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => $request->only(['search']),
            'flash' => [
                'message' => session('message'),
                'error' => session('error'),
            ],
        ]);
    }

    /**
     * Menyimpan user baru (Create)
     */
    public function store(Request $request)
    {
        // Validasi agar co-manager tidak bisa membuat manager
        if (auth()->user()->role === 'co_manager' && $request->role === 'manager') {
            return redirect()->back()->with('error', 'Co-Manager tidak bisa membuat user dengan role Manager.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', Rules\Password::defaults()],
            'role' => 'required|in:manager,co_manager,admin',
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'approved' => true, // User yang dibuat oleh manager langsung approved
        ]);

        return redirect()->back()->with('message', 'User berhasil ditambahkan.');
    }

    /**
     * Mengupdate data user (Edit)
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Validasi agar co-manager tidak bisa mengubah role manager
        if (auth()->user()->role === 'co_manager' && $user->role === 'manager') {
            return redirect()->back()->with('error', 'Co-Manager tidak bisa mengubah data Manager.');
        }

        // Validasi agar co-manager tidak bisa membuat user baru menjadi manager
        if (auth()->user()->role === 'co_manager' && $request->role === 'manager') {
            return redirect()->back()->with('error', 'Co-Manager tidak bisa mengangkat user menjadi Manager.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
            'role' => 'required|in:manager,co_manager,admin',
        ]);

        $user->fill([
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
        ]);

        // Update password hanya jika diisi
        if ($request->filled('password')) {
            $request->validate([
                'password' => [Rules\Password::defaults()],
            ]);
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return redirect()->back()->with('message', 'Data user berhasil diperbarui.');
    }

    /**
     * Menghapus user
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        
        // Mencegah user menghapus dirinya sendiri
        if (auth()->id() === $user->id) {
            return redirect()->back()->with('error', 'Anda tidak bisa menghapus akun sendiri.');
        }

        // Mencegah co-manager menghapus manager
        if (auth()->user()->role === 'co_manager' && $user->role === 'manager') {
            return redirect()->back()->with('error', 'Co-Manager tidak bisa menghapus Manager.');
        }

        $user->delete();

        return redirect()->back()->with('message', 'User berhasil dihapus.');
    }

    /**
     * Approve user yang baru registrasi
     */
    public function approve($id)
    {
        $user = User::findOrFail($id);
        
        // Mencegah co-manager approve manager
        if (auth()->user()->role === 'co_manager' && $user->role === 'manager') {
            return redirect()->back()->with('error', 'Co-Manager tidak bisa meng-approve Manager.');
        }

        $user->approved = true;
        $user->save();

        return redirect()->back()->with('message', 'User berhasil di-approve dan sekarang bisa login.');
    }
}