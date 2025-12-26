<?php

namespace App\Exports;

use App\Models\Transaction;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class BudgetExport implements FromCollection, WithHeadings, WithMapping
{
    protected $year;

    public function __construct($year)
    {
        $this->year = $year;
    }

    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return Transaction::whereYear('transaction_date', $this->year)
            ->orderBy('transaction_date', 'asc')
            ->get();
    }

    public function headings(): array
    {
        return [
            'Tanggal',
            'Tipe',
            'Deskripsi',
            'Nominal',
            'Customer / Vendor',
            'No. LOO / PO',
            'No. Invoice',
            'Link Bukti',
        ];
    }

    public function map($transaction): array
    {
        return [
            \Carbon\Carbon::parse($transaction->transaction_date)->format('Y-m-d'),
            ucfirst($transaction->type),
            $transaction->description,
            $transaction->nominal,
            $transaction->type == 'income' ? $transaction->customer_name : $transaction->vendor_name,
            $transaction->type == 'income' ? $transaction->loo_number : $transaction->po_number,
            $transaction->invoice_number,
            $transaction->proof_file_path ? url($transaction->proof_file_path) : '-',
        ];
    }
}
