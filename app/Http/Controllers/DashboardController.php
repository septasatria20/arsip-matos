<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $role = $user->role;
        
        // === DATA STATISTIK DUMMY ===
        $statsData = [
            'total_letters' => 45,
            'pending_letters' => 8,
            'approved_letters' => 32,
            'rejected_letters' => 5,
        ];

        // === GRAFIK BULANAN DUMMY ===
        $chartData = [
            ['month' => 'Jan', 'letters' => 8, 'approved' => 6],
            ['month' => 'Feb', 'letters' => 12, 'approved' => 10],
            ['month' => 'Mar', 'letters' => 15, 'approved' => 12],
            ['month' => 'Apr', 'letters' => 10, 'approved' => 8],
            ['month' => 'Mei', 'letters' => 18, 'approved' => 15],
            ['month' => 'Jun', 'letters' => 20, 'approved' => 18],
            ['month' => 'Jul', 'letters' => 14, 'approved' => 11],
            ['month' => 'Agu', 'letters' => 16, 'approved' => 14],
            ['month' => 'Sep', 'letters' => 22, 'approved' => 20],
            ['month' => 'Okt', 'letters' => 19, 'approved' => 16],
            ['month' => 'Nov', 'letters' => 17, 'approved' => 15],
            ['month' => 'Des', 'letters' => 25, 'approved' => 22],
        ];

        // === AKTIVITAS TERKINI DUMMY ===
        $recentActivities = [
            [
                'title' => 'Surat Sponsorship Skin+ Approved',
                'type' => 'Confirmation Letter',
                'status' => 'Approved',
                'date' => '2 jam lalu'
            ],
            [
                'title' => 'Laporan Event Cosplay Run 2025',
                'type' => 'Laporan Event',
                'status' => 'Pending',
                'date' => '5 jam lalu'
            ],
            [
                'title' => 'Surat Kerjasama Mall Fest Rejected',
                'type' => 'Confirmation Letter',
                'status' => 'Rejected',
                'date' => '1 hari lalu'
            ],
            [
                'title' => 'Update Inventaris: Speaker JBL Rusak',
                'type' => 'Inventaris',
                'status' => 'Info',
                'date' => '2 hari lalu'
            ],
            [
                'title' => 'Budget Bulan Oktober Disetujui',
                'type' => 'Budgeting',
                'status' => 'Approved',
                'date' => '3 hari lalu'
            ],
        ];

        return Inertia::render('Dashboard', [
            'statsData' => $statsData,
            'chartData' => $chartData,
            'recentActivities' => $recentActivities,
            'userRole' => $role
        ]);
    }
}