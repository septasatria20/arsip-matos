<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\ConfirmationLetter;
use App\Models\EventReport;
use App\Models\Inventory;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $role = $user->role;
        
        // Query Dasar
        $lettersQuery = ConfirmationLetter::query();
        $eventsQuery = EventReport::query();
        
        // Jika Staff, hanya tampilkan data miliknya
        if ($role === 'staff') {
            $lettersQuery->where('user_id', $user->id);
            $eventsQuery->where('user_id', $user->id);
        }

        // === DATA STATISTIK REAL ===
        $statsData = [
            // Confirmation Letters
            'total_letters' => (clone $lettersQuery)->count(),
            'pending_letters' => (clone $lettersQuery)->where('status', 'pending')->count(),
            'approved_letters' => (clone $lettersQuery)->where('status', 'approved')->count(),
            'rejected_letters' => (clone $lettersQuery)->where('status', 'rejected')->count(),
            
            // Event Reports
            'total_events' => (clone $eventsQuery)->count(),
            'pending_events' => (clone $eventsQuery)->where('status', 'pending')->count(),
            'approved_events' => (clone $eventsQuery)->where('status', 'approved')->count(),
            
            // Inventory (Only for Manager/Admin)
            'total_inventory' => $role !== 'staff' ? Inventory::count() : 0,
            'good_condition' => $role !== 'staff' ? Inventory::where('condition', 'good')->count() : 0,
            'damaged_condition' => $role !== 'staff' ? Inventory::where('condition', 'damaged')->count() : 0,
            
            // Budgeting (Only for Manager/Admin)
            'total_income' => $role !== 'staff' ? Transaction::where('type', 'income')->whereYear('transaction_date', date('Y'))->sum('nominal') : 0,
            'total_expense' => $role !== 'staff' ? Transaction::where('type', 'expense')->whereYear('transaction_date', date('Y'))->sum('nominal') : 0,
            'pending_transactions' => $role !== 'staff' ? Transaction::where('status', 'pending')->whereYear('transaction_date', date('Y'))->count() : 0,
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
                'letters' => $monthData ? (int)$monthData->letters : 0,
                'approved' => $monthData ? (int)$monthData->approved : 0,
            ];
        }

        // === AKTIVITAS TERKINI REAL ===
        // Gabungkan dari Letters dan Events
        $recentLetters = (clone $lettersQuery)
            ->latest()
            ->take(3)
            ->get()
            ->map(function ($item) {
                return [
                    'title' => $item->event_name ?? 'Surat Tanpa Judul',
                    'type' => 'Confirmation Letter',
                    'status' => ucfirst($item->status),
                    'date' => $item->created_at->diffForHumans(),
                    'timestamp' => $item->created_at->timestamp
                ];
            })
            ->toArray();

        $recentEvents = (clone $eventsQuery)
            ->latest()
            ->take(3)
            ->get()
            ->map(function ($item) {
                return [
                    'title' => $item->event_name ?? 'Event Tanpa Nama',
                    'type' => 'Laporan Event',
                    'status' => ucfirst($item->status),
                    'date' => $item->created_at->diffForHumans(),
                    'timestamp' => $item->created_at->timestamp
                ];
            })
            ->toArray();

        // Gabungkan dan sort by latest
        $allActivities = array_merge($recentLetters, $recentEvents);
        usort($allActivities, function($a, $b) {
            return $b['timestamp'] - $a['timestamp'];
        });
        $recentActivities = array_slice($allActivities, 0, 5);

        return Inertia::render('Dashboard', [
            'statsData' => $statsData,
            'chartData' => $chartData,
            'recentActivities' => $recentActivities,
            'userRole' => $role
        ]);
    }
}