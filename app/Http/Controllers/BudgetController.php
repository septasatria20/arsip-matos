<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Transaction;
use App\Models\OldBudgetFile;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\BudgetExport;
use Illuminate\Support\Facades\Storage;

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

        // 6. Ambil Data File Budget Lama
        $oldBudgetFiles = OldBudgetFile::latest()->get();

        // 7. Kirim semua data ke React (Inertia)
        return Inertia::render('Budgeting', [
            'monthlyOverview' => $monthlyOverview,
            'incomeData' => $incomeData,
            'expenseData' => $expenseData,
            'selectedYear' => $selectedYear,
            'oldBudgetFiles' => $oldBudgetFiles,
        ]);
    }

    // Export Excel
    public function export(Request $request)
    {
        $year = $request->input('year', date('Y'));
        return Excel::download(new BudgetExport($year), 'budgeting-'.$year.'.xlsx');
    }

    // Upload File Budget Lama
    public function storeOldFile(Request $request)
    {
        $request->validate([
            'year' => 'required|string',
            'file' => 'required|file|mimes:pdf,xlsx,xls,doc,docx|max:10240', // Max 10MB
            'description' => 'nullable|string',
        ]);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('old_budgets', $fileName, 'public');

            OldBudgetFile::create([
                'year' => $request->year,
                'file_name' => $file->getClientOriginalName(),
                'file_path' => '/storage/' . $filePath,
                'description' => $request->description,
            ]);
        }

        return redirect()->back()->with('message', 'File budget lama berhasil diupload.');
    }

    // Hapus File Budget Lama
    public function destroyOldFile($id)
    {
        $file = OldBudgetFile::findOrFail($id);
        
        // Hapus file fisik
        $path = str_replace('/storage/', '', $file->file_path);
        Storage::disk('public')->delete($path);

        $file->delete();

        return redirect()->back()->with('message', 'File berhasil dihapus.');
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
            'proof_file' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120', // Max 5MB
        ]);

        $data = $request->all();

        // Handle File Upload
        if ($request->hasFile('proof_file')) {
            $file = $request->file('proof_file');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('transactions', $fileName, 'public');
            $data['proof_file_path'] = '/storage/' . $filePath;
        }

        // Simpan ke database
        Transaction::create($data);

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