<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\ConfirmationLetter;
use App\Models\EventReport;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $role = $user->role;
        
        // Query Dasar
        $lettersQuery = ConfirmationLetter::query();
        
        // Jika Staff, hanya tampilkan data miliknya
        if ($role === 'staff') {
            $lettersQuery->where('user_id', $user->id);
        }

        // === DATA STATISTIK REAL ===
        $statsData = [
            'total_letters' => (clone $lettersQuery)->count(),
            'pending_letters' => (clone $lettersQuery)->where('status', 'pending')->count(),
            'approved_letters' => (clone $lettersQuery)->where('status', 'approved')->count(),
            'rejected_letters' => (clone $lettersQuery)->where('status', 'rejected')->count(),
        ];

        // === GRAFIK BULANAN REAL ===
        // Mengambil data 12 bulan terakhir atau tahun berjalan
        $chartDataRaw = (clone $lettersQuery)
            ->select(
                DB::raw('MONTH(created_at) as month'), 
                DB::raw('COUNT(*) as letters'),
                DB::raw('SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) as approved')
            )
            ->whereYear('created_at', date('Y'))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Format data untuk chart (Pastikan 12 bulan ada meski 0)
        $chartData = [];
        for ($i = 1; $i <= 12; $i++) {
            $monthData = $chartDataRaw->firstWhere('month', $i);
            $chartData[] = [
                'month' => date("M", mktime(0, 0, 0, $i, 1)),
                'letters' => $monthData ? $monthData->letters : 0,
                'approved' => $monthData ? $monthData->approved : 0,
            ];
        }

        // === AKTIVITAS TERKINI REAL ===
        // Mengambil 5 surat terakhir
        $recentActivities = (clone $lettersQuery)
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($item) {
                return [
                    'title' => $item->event_name ?? 'Surat Tanpa Judul',
                    'type' => 'Confirmation Letter',
                    'status' => ucfirst($item->status),
                    'date' => $item->created_at->diffForHumans()
                ];
            });

        return Inertia::render('Dashboard', [
            'statsData' => $statsData,
            'chartData' => $chartData,
            'recentActivities' => $recentActivities,
            'userRole' => $role
        ]);
    }
}