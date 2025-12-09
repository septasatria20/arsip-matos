<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class BudgetController extends Controller
{
    public function index(Request $request)
    {
        // 1. Ambil Tahun dari Filter (Default tahun ini)
        $selectedYear = $request->input('year', date('Y'));

        // 2. Ambil Data Budget per Bulan
        $budgets = Budget::where('year', $selectedYear)
            ->orderBy('month')
            ->get()
            ->keyBy('month'); // Biar mudah diakses array-nya

        // 3. Ambil Total Pengeluaran per Bulan (Grouping)
        $expenses = Transaction::whereYear('transaction_date', $selectedYear)
            ->where('type', 'expense')
            ->select(
                DB::raw('MONTH(transaction_date) as month'),
                DB::raw('SUM(nominal) as total_expense')
            )
            ->groupBy('month')
            ->get()
            ->keyBy('month');

        // 4. Susun Data untuk Tabel Overview (Gabungan Budget & Expense)
        $monthlyOverview = [];
        $months = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April', 
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus', 
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];

        foreach ($months as $num => $name) {
            $budgetAmount = $budgets[$num]->amount ?? 0;
            $expenseAmount = $expenses[$num]->total_expense ?? 0;
            
            $monthlyOverview[] = [
                'month_num' => $num,
                'month' => $name,
                'budget' => $budgetAmount,
                'expense' => $expenseAmount,
                'diff' => $budgetAmount - $expenseAmount // Hitung selisih otomatis
            ];
        }

        // 5. Ambil Data Transaksi Detail (Income & Expense)
        $incomeData = Transaction::where('type', 'income')
            ->whereYear('transaction_date', $selectedYear)
            ->latest()
            ->get();

        $expenseData = Transaction::where('type', 'expense')
            ->whereYear('transaction_date', $selectedYear)
            ->latest()
            ->get();

        // 6. Kirim semua data ke React (Inertia)
        return Inertia::render('Budgeting', [
            'monthlyOverview' => $monthlyOverview,
            'incomeData' => $incomeData,
            'expenseData' => $expenseData,
            'selectedYear' => $selectedYear,
        ]);
    }

    // Simpan Data Transaksi Baru
    public function store(Request $request)
    {
        // Validasi input sederhana
        $validated = $request->validate([
            'type' => 'required|in:income,expense',
            'transaction_date' => 'required|date',
            'nominal' => 'required|numeric',
            'description' => 'required|string',
            // Tambahkan validasi lain sesuai kebutuhan...
        ]);

        // Simpan ke database
        Transaction::create($request->all());

        // Redirect kembali agar halaman refresh otomatis
        return redirect()->back()->with('message', 'Data berhasil disimpan!');
    }

    // Simpan/Update Budget Bulanan
    public function storeBudget(Request $request)
    {
        $year = $request->input('year');
        $budgets = $request->input('budgets'); // Array [{month: 1, amount: 1000}, ...]

        foreach ($budgets as $item) {
            Budget::updateOrCreate(
                ['year' => $year, 'month' => $item['month']],
                ['amount' => $item['amount']]
            );
        }

        return redirect()->back()->with('message', 'Budget berhasil diperbarui!');
    }
}