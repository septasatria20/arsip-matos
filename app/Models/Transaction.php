<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'type', // income atau expense
        'transaction_date',
        // Khusus Income
        'loo_number',
        'customer_name',
        // Khusus Expense
        'sr_number',
        'sr_date',
        'po_number',
        'invoice_number',
        'vendor_name',
        'payment_date',
        // Umum
        'description',
        'coa_code',
        'nominal',
        'proof_file_path',
        'status', // pending, approved, paid, received
    ];

    // Agar tanggal otomatis dibaca sebagai objek Carbon (mudah diformat)
    protected $casts = [
        'transaction_date' => 'date',
        'sr_date' => 'date',
        'payment_date' => 'date',
    ];
}