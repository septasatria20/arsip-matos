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
        $selectedMonth = $request->input('month');
        $selectedStatus = $request->input('status');

        // 2. Ambil Data Budget per Bulan untuk masing-masing type
        $monthlyBudgets = Budget::where('year', $selectedYear)
            ->where('type', 'monthly')
            ->orderBy('month')
            ->get()
            ->keyBy('month');
            
        $incomeBudgets = Budget::where('year', $selectedYear)
            ->where('type', 'income')
            ->orderBy('month')
            ->get()
            ->keyBy('month');
            
        $expenseBudgets = Budget::where('year', $selectedYear)
            ->where('type', 'expense')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

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

        // 3b. Ambil Total Pemasukan per Bulan
        $incomes = Transaction::whereYear('transaction_date', $selectedYear)
            ->where('type', 'income')
            ->select(
                DB::raw('MONTH(transaction_date) as month'),
                DB::raw('SUM(nominal) as total_income')
            )
            ->groupBy('month')
            ->get()
            ->keyBy('month');

        // 4. Susun Data untuk Tabel Overview (Gabungan Budget, Income & Expense)
        $monthlyOverview = [];
        $months = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April', 
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus', 
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];

        foreach ($months as $num => $name) {
            $budgetAmount = $monthlyBudgets[$num]->amount ?? 0;
            $incomeAmount = $incomes[$num]->total_income ?? 0;
            $expenseAmount = $expenses[$num]->total_expense ?? 0;
            
            $monthlyOverview[] = [
                'month_num' => $num,
                'month' => $name,
                'budget' => $budgetAmount,
                'income' => $incomeAmount,
                'expense' => $expenseAmount,
                'diff' => $budgetAmount - $expenseAmount // Hitung selisih otomatis
            ];
        }

        // 5. Ambil Data Transaksi Detail (Income & Expense) dengan Filter
        $incomeQuery = Transaction::where('type', 'income')
            ->whereYear('transaction_date', $selectedYear);
        
        if ($selectedMonth) {
            $incomeQuery->whereMonth('transaction_date', $selectedMonth);
        }
        if ($selectedStatus) {
            $incomeQuery->where('status', $selectedStatus);
        }
        $incomeData = $incomeQuery->latest()->get();

        $expenseQuery = Transaction::where('type', 'expense')
            ->whereYear('transaction_date', $selectedYear);
        
        if ($selectedMonth) {
            $expenseQuery->whereMonth('transaction_date', $selectedMonth);
        }
        if ($selectedStatus) {
            $expenseQuery->where('status', $selectedStatus);
        }
        $expenseData = $expenseQuery->latest()->get();

        // 6. Ambil Data File Budget Lama
        $oldBudgetFiles = OldBudgetFile::latest()->get();

        // 7. Buat Overview Pemasukan Terpisah
        $incomeOverview = [];
        foreach ($months as $num => $name) {
            $budgetIncome = $incomeBudgets[$num]->amount ?? 0;
            $actualIncome = $incomes[$num]->total_income ?? 0;
            
            $incomeOverview[] = [
                'month_num' => $num,
                'month' => $name,
                'budget' => $budgetIncome,
                'actual' => $actualIncome,
                'diff' => $budgetIncome - $actualIncome // Budget - Actual
            ];
        }

        // 8. Buat Overview Pengeluaran Terpisah
        $expenseOverview = [];
        foreach ($months as $num => $name) {
            $budgetExpense = $expenseBudgets[$num]->amount ?? 0;
            $actualExpense = $expenses[$num]->total_expense ?? 0;
            
            $expenseOverview[] = [
                'month_num' => $num,
                'month' => $name,
                'budget' => $budgetExpense,
                'actual' => $actualExpense,
                'diff' => $budgetExpense - $actualExpense // Budget - Actual
            ];
        }

        // 9. Kirim semua data ke React (Inertia)
        return Inertia::render('Budgeting', [
            'monthlyOverview' => $monthlyOverview,
            'incomeOverview' => $incomeOverview,
            'expenseOverview' => $expenseOverview,
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
        $type = $request->input('type', 'all'); // overview, income, expense, all
        
        $filename = 'budgeting-' . $year;
        if ($type !== 'all') {
            $filename .= '-' . $type;
        }
        $filename .= '.xlsx';
        
        return Excel::download(new BudgetExport($year, $type), $filename);
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
        $type = $request->input('type', 'monthly'); // monthly, income, expense
        $budgets = $request->input('budgets'); // Array [{month: 1, amount: 1000}, ...]

        foreach ($budgets as $item) {
            Budget::updateOrCreate(
                ['year' => $year, 'month' => $item['month'], 'type' => $type],
                ['amount' => $item['amount']]
            );
        }

        return redirect()->back()->with('message', 'Budget berhasil diperbarui!');
    }

    // Update Transaction
    public function update(Request $request, $id)
    {
        $transaction = Transaction::findOrFail($id);

        $validated = $request->validate([
            'type' => 'required|in:income,expense',
            'transaction_date' => 'required|date',
            'contract_start_date' => 'nullable|date',
            'contract_end_date' => 'nullable|date',
            'nominal' => 'required|numeric',
            'description' => 'required|string',
            'drive_link' => 'nullable|url',
            'proof_file' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        $data = $request->except(['proof_file']);

        // Handle File Upload
        if ($request->hasFile('proof_file')) {
            // Delete old file if exists
            if ($transaction->proof_file_path) {
                $oldPath = str_replace('/storage/', '', $transaction->proof_file_path);
                Storage::disk('public')->delete($oldPath);
            }
            
            $file = $request->file('proof_file');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('transactions', $fileName, 'public');
            $data['proof_file_path'] = '/storage/' . $filePath;
        }

        $transaction->update($data);

        return redirect()->back()->with('message', 'Data berhasil diupdate!');
    }

    // Update Status Transaction
    public function updateStatus(Request $request, $id)
    {
        $transaction = Transaction::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:pending,paid,approve',
        ]);

        $transaction->update(['status' => $validated['status']]);

        return redirect()->back()->with('message', 'Status berhasil diupdate!');
    }

    // Delete Transaction
    public function destroy($id)
    {
        $transaction = Transaction::findOrFail($id);
        
        // Delete file if exists
        if ($transaction->proof_file_path) {
            $path = str_replace('/storage/', '', $transaction->proof_file_path);
            Storage::disk('public')->delete($path);
        }

        $transaction->delete();

        return redirect()->back()->with('message', 'Data berhasil dihapus!');
    }
}