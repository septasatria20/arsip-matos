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
    public function index(Request $request)
    {
        $user = auth()->user();
        $role = $user->role;
        
        // Ambil tahun dari request atau default tahun ini
        $selectedYear = $request->input('year', date('Y'));
        
        // Query Dasar
        $lettersQuery = ConfirmationLetter::query();
        $eventsQuery = EventReport::query();
        
        // Jika Admin, hanya tampilkan data miliknya
        if ($role === 'admin') {
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
            
            // Inventory (Semua role bisa akses)
            'total_inventory' => Inventory::count(),
            'good_condition' => Inventory::where('condition', 'good')->count(),
            'damaged_condition' => Inventory::where('condition', 'damaged')->count(),
            
            // Budgeting (Only for Manager/Co-Manager)
            'total_income' => $role !== 'admin' ? Transaction::where('type', 'income')->whereYear('transaction_date', date('Y'))->sum('nominal') : 0,
            'total_expense' => $role !== 'admin' ? Transaction::where('type', 'expense')->whereYear('transaction_date', date('Y'))->sum('nominal') : 0,
            'pending_transactions' => $role !== 'admin' ? Transaction::where('status', 'pending')->whereYear('transaction_date', date('Y'))->count() : 0,
        ];

        // === GRAFIK BULANAN REAL ===
        // Mengambil data berdasarkan tahun yang dipilih
        $chartDataRaw = (clone $lettersQuery)
            ->select(
                DB::raw('MONTH(created_at) as month'), 
                DB::raw('COUNT(*) as letters'),
                DB::raw('SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) as approved')
            )
            ->whereYear('created_at', $selectedYear)
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
        
        // Daftar tahun yang tersedia (gabungan dari semua sumber data)
        $letterYears = ConfirmationLetter::selectRaw('DISTINCT YEAR(created_at) as year')
            ->when($role === 'admin', function($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->orderBy('year', 'desc')
            ->pluck('year')
            ->toArray();
        
        $eventYears = EventReport::selectRaw('DISTINCT YEAR(event_date) as year')
            ->when($role === 'admin', function($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->orderBy('year', 'desc')
            ->pluck('year')
            ->toArray();
        
        $budgetYears = [];
        if ($role !== 'admin') {
            $budgetYears = Transaction::selectRaw('DISTINCT YEAR(transaction_date) as year')
                ->orderBy('year', 'desc')
                ->pluck('year')
                ->toArray();
        }
        
        // Gabungkan semua tahun dan hapus duplikat
        $availableYears = array_unique(array_merge($letterYears, $eventYears, $budgetYears));
        rsort($availableYears); // Sort descending
        
        // Pastikan tahun ini ada di list
        if (!in_array(date('Y'), $availableYears)) {
            $availableYears[] = (int)date('Y');
            rsort($availableYears);
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

        // === GRAFIK EVENT PER BULAN (untuk semua role kecuali admin filter by user) ===
        $eventsChartData = EventReport::select(
                DB::raw('MONTH(event_date) as month'),
                DB::raw('COUNT(*) as total')
            )
            ->whereYear('event_date', $selectedYear)
            ->when($role === 'admin', function($q) use ($user) {
                return $q->where('user_id', $user->id);
            })
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $formattedEventsChart = [];
        for ($i = 1; $i <= 12; $i++) {
            $monthData = $eventsChartData->firstWhere('month', $i);
            $formattedEventsChart[] = [
                'month' => date("M", mktime(0, 0, 0, $i, 1)),
                'total' => $monthData ? (int)$monthData->total : 0,
            ];
        }

        // === GRAFIK BUDGETING PEMASUKAN & PENGELUARAN PER BULAN (hanya untuk manager/co-manager) ===
        $budgetingChartData = [];
        if ($role !== 'admin') {
            $incomeChart = Transaction::select(
                    DB::raw('MONTH(transaction_date) as month'),
                    DB::raw('SUM(nominal) as total')
                )
                ->where('type', 'income')
                ->whereYear('transaction_date', $selectedYear)
                ->groupBy('month')
                ->orderBy('month')
                ->get();

            $expenseChart = Transaction::select(
                    DB::raw('MONTH(transaction_date) as month'),
                    DB::raw('SUM(nominal) as total')
                )
                ->where('type', 'expense')
                ->whereYear('transaction_date', $selectedYear)
                ->groupBy('month')
                ->orderBy('month')
                ->get();

            for ($i = 1; $i <= 12; $i++) {
                $incomeData = $incomeChart->firstWhere('month', $i);
                $expenseData = $expenseChart->firstWhere('month', $i);
                $budgetingChartData[] = [
                    'month' => date("M", mktime(0, 0, 0, $i, 1)),
                    'income' => $incomeData ? (int)$incomeData->total : 0,
                    'expense' => $expenseData ? (int)$expenseData->total : 0,
                ];
            }
        }

        return Inertia::render('Dashboard', [
            'statsData' => $statsData,
            'chartData' => $chartData,
            'recentActivities' => $recentActivities,
            'userRole' => $role,
            'availableYears' => $availableYears,
            'selectedYear' => (int)$selectedYear,
            'eventsChartData' => $formattedEventsChart,
            'budgetingChartData' => $budgetingChartData,
        ]);
    }

    // API endpoint untuk fetch events chart berdasarkan tahun
    public function eventsChart(Request $request)
    {
        $user = auth()->user();
        $role = $user->role;
        $year = $request->input('year', date('Y'));

        $eventsChartData = EventReport::select(
                DB::raw('MONTH(event_date) as month'),
                DB::raw('COUNT(*) as total')
            )
            ->whereYear('event_date', $year)
            ->when($role === 'admin', function($q) use ($user) {
                return $q->where('user_id', $user->id);
            })
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $formattedEventsChart = [];
        for ($i = 1; $i <= 12; $i++) {
            $monthData = $eventsChartData->firstWhere('month', $i);
            $formattedEventsChart[] = [
                'month' => date("M", mktime(0, 0, 0, $i, 1)),
                'total' => $monthData ? (int)$monthData->total : 0,
            ];
        }

        return response()->json($formattedEventsChart);
    }

    // API endpoint untuk fetch budgeting chart berdasarkan tahun
    public function budgetingChart(Request $request)
    {
        $user = auth()->user();
        $role = $user->role;
        $year = $request->input('year', date('Y'));

        if ($role === 'admin') {
            return response()->json([]);
        }

        $incomeChart = Transaction::select(
                DB::raw('MONTH(transaction_date) as month'),
                DB::raw('SUM(nominal) as total')
            )
            ->where('type', 'income')
            ->whereYear('transaction_date', $year)
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $expenseChart = Transaction::select(
                DB::raw('MONTH(transaction_date) as month'),
                DB::raw('SUM(nominal) as total')
            )
            ->where('type', 'expense')
            ->whereYear('transaction_date', $year)
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $budgetingChartData = [];
        for ($i = 1; $i <= 12; $i++) {
            $incomeData = $incomeChart->firstWhere('month', $i);
            $expenseData = $expenseChart->firstWhere('month', $i);
            $budgetingChartData[] = [
                'month' => date("M", mktime(0, 0, 0, $i, 1)),
                'income' => $incomeData ? (int)$incomeData->total : 0,
                'expense' => $expenseData ? (int)$expenseData->total : 0,
            ];
        }

        return response()->json($budgetingChartData);
    }
}