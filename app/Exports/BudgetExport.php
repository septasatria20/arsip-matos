<?php

namespace App\Exports;

use App\Models\Budget;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class BudgetExport implements WithMultipleSheets
{
    protected $year;
    protected $type; // overview, income, expense, all

    public function __construct($year, $type = 'all')
    {
        $this->year = $year;
        $this->type = $type;
    }

    public function sheets(): array
    {
        $sheets = [];

        if ($this->type === 'overview' || $this->type === 'all') {
            $sheets[] = new BudgetOverviewSheet($this->year);
        }

        if ($this->type === 'income' || $this->type === 'all') {
            $sheets[] = new BudgetIncomeSheet($this->year);
        }

        if ($this->type === 'expense' || $this->type === 'all') {
            $sheets[] = new BudgetExpenseSheet($this->year);
        }

        return $sheets;
    }
}

// Overview Sheet
class BudgetOverviewSheet implements FromCollection, WithHeadings, WithMapping
{
    protected $year;

    public function __construct($year)
    {
        $this->year = $year;
    }

    public function collection()
    {
        $budgets = Budget::where('year', $this->year)
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $incomes = Transaction::whereYear('transaction_date', $this->year)
            ->where('type', 'income')
            ->select(
                DB::raw('MONTH(transaction_date) as month'),
                DB::raw('SUM(nominal) as total_income')
            )
            ->groupBy('month')
            ->get()
            ->keyBy('month');

        $expenses = Transaction::whereYear('transaction_date', $this->year)
            ->where('type', 'expense')
            ->select(
                DB::raw('MONTH(transaction_date) as month'),
                DB::raw('SUM(nominal) as total_expense')
            )
            ->groupBy('month')
            ->get()
            ->keyBy('month');

        $months = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];

        $data = collect();
        $totalBudget = 0;
        $totalIncome = 0;
        $totalExpense = 0;

        foreach ($months as $num => $name) {
            $budgetAmount = $budgets[$num]->amount ?? 0;
            $incomeAmount = $incomes[$num]->total_income ?? 0;
            $expenseAmount = $expenses[$num]->total_expense ?? 0;

            $totalBudget += $budgetAmount;
            $totalIncome += $incomeAmount;
            $totalExpense += $expenseAmount;

            $data->push((object)[
                'month' => $name,
                'budget' => $budgetAmount,
                'income' => $incomeAmount,
                'expense' => $expenseAmount,
                'remaining' => $budgetAmount - $expenseAmount,
                'is_total' => false
            ]);
        }

        // Add total row
        $data->push((object)[
            'month' => 'TOTAL',
            'budget' => $totalBudget,
            'income' => $totalIncome,
            'expense' => $totalExpense,
            'remaining' => $totalBudget - $totalExpense,
            'is_total' => true
        ]);

        return $data;
    }

    public function headings(): array
    {
        return ['Bulan', 'Total Budget', 'Total Pemasukan', 'Total Pengeluaran', 'Sisa'];
    }

    public function map($row): array
    {
        return [
            $row->month,
            $row->budget,
            $row->income,
            $row->expense,
            $row->remaining
        ];
    }
}

// Income Sheet
class BudgetIncomeSheet implements FromCollection, WithHeadings, WithMapping
{
    protected $year;

    public function __construct($year)
    {
        $this->year = $year;
    }

    public function collection()
    {
        $transactions = Transaction::where('type', 'income')
            ->whereYear('transaction_date', $this->year)
            ->orderBy('transaction_date', 'asc')
            ->get();

        $total = $transactions->sum('nominal');

        // Add total row
        $transactions->push((object)[
            'transaction_date' => null,
            'contract_start_date' => null,
            'contract_end_date' => null,
            'loo_number' => null,
            'customer_name' => null,
            'description' => 'TOTAL',
            'nominal' => $total,
            'status' => null,
            'drive_link' => null,
            'proof_file_path' => null,
            'is_total' => true
        ]);

        return $transactions;
    }

    public function headings(): array
    {
        return [
            'Tanggal',
            'Tanggal Kontrak Mulai',
            'Tanggal Kontrak Selesai',
            'No. LOO',
            'Nama Customer',
            'Deskripsi',
            'Nominal',
            'Status',
            'Link Drive',
            'Link Bukti',
        ];
    }

    public function map($transaction): array
    {
        if (isset($transaction->is_total) && $transaction->is_total) {
            return [
                '',
                '',
                '',
                '',
                '',
                'TOTAL',
                $transaction->nominal,
                '',
                '',
                '',
            ];
        }

        return [
            \Carbon\Carbon::parse($transaction->transaction_date)->format('Y-m-d'),
            $transaction->contract_start_date ? \Carbon\Carbon::parse($transaction->contract_start_date)->format('Y-m-d') : '-',
            $transaction->contract_end_date ? \Carbon\Carbon::parse($transaction->contract_end_date)->format('Y-m-d') : '-',
            $transaction->loo_number ?? '-',
            $transaction->customer_name ?? '-',
            $transaction->description,
            $transaction->nominal,
            ucfirst($transaction->status),
            $transaction->drive_link ?? '-',
            $transaction->proof_file_path ? url($transaction->proof_file_path) : '-',
        ];
    }
}

// Expense Sheet
class BudgetExpenseSheet implements FromCollection, WithHeadings, WithMapping
{
    protected $year;

    public function __construct($year)
    {
        $this->year = $year;
    }

    public function collection()
    {
        $transactions = Transaction::where('type', 'expense')
            ->whereYear('transaction_date', $this->year)
            ->orderBy('transaction_date', 'asc')
            ->get();

        $total = $transactions->sum('nominal');

        // Add total row
        $transactions->push((object)[
            'transaction_date' => null,
            'sr_number' => null,
            'sr_date' => null,
            'po_number' => null,
            'invoice_number' => null,
            'vendor_name' => null,
            'payment_date' => null,
            'description' => 'TOTAL',
            'coa_code' => null,
            'nominal' => $total,
            'status' => null,
            'drive_link' => null,
            'proof_file_path' => null,
            'is_total' => true
        ]);

        return $transactions;
    }

    public function headings(): array
    {
        return [
            'Tanggal',
            'No. SR',
            'Tanggal SR',
            'No. PO',
            'No. Invoice',
            'Nama Vendor',
            'Tanggal Bayar',
            'Deskripsi',
            'Kode COA',
            'Nominal',
            'Status',
            'Link Drive',
            'Link Bukti',
        ];
    }

    public function map($transaction): array
    {
        if (isset($transaction->is_total) && $transaction->is_total) {
            return [
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                'TOTAL',
                '',
                $transaction->nominal,
                '',
                '',
                '',
            ];
        }

        return [
            \Carbon\Carbon::parse($transaction->transaction_date)->format('Y-m-d'),
            $transaction->sr_number ?? '-',
            $transaction->sr_date ? \Carbon\Carbon::parse($transaction->sr_date)->format('Y-m-d') : '-',
            $transaction->po_number ?? '-',
            $transaction->invoice_number ?? '-',
            $transaction->vendor_name ?? '-',
            $transaction->payment_date ? \Carbon\Carbon::parse($transaction->payment_date)->format('Y-m-d') : '-',
            $transaction->description,
            $transaction->coa_code ?? '-',
            $transaction->nominal,
            ucfirst($transaction->status),
            $transaction->drive_link ?? '-',
            $transaction->proof_file_path ? url($transaction->proof_file_path) : '-',
        ];
    }
}
