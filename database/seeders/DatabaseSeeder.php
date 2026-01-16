<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\ConfirmationLetter;
use App\Models\EventReport;
use App\Models\Inventory;
use App\Models\Budget;
use App\Models\Transaction;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // 1. BUAT USER (Admin & Staff)
        $manager = User::create([
            'name' => 'Listyo Rahayu',
            'email' => 'manager@matos.com',
            'password' => Hash::make('password123'),
            'role' => 'manager',
            'email_verified_at' => now(),
        ]);

        $admin = User::create([
            'name' => 'Budi Marcom',
            'email' => 'admin@matos.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        // 2. DATA CONFIRMATION LETTER (Surat)
        // Surat dari Admin (Pending)
        ConfirmationLetter::create([
            'user_id' => $admin->id,
            'event_date' => Carbon::now()->addDays(10),
            'event_name' => 'Pameran Batik Nusantara',
            'eo_name' => 'Batik Keris',
            'category' => 'Sewa Lahan',
            'description' => 'Pameran di Atrium Utama selama 7 hari.',
            'status' => 'pending',
        ]);

        // Surat dari Manager (Approved)
        ConfirmationLetter::create([
            'user_id' => $manager->id,
            'event_date' => Carbon::now()->subDays(5),
            'event_name' => 'Kerjasama Skin+ Clinic',
            'eo_name' => 'Skin+ Clinic',
            'category' => 'Sponsorship',
            'description' => 'Open booth dan branding di railing lt 2.',
            'status' => 'approved',
        ]);

        // Surat Ditolak (Rejected)
        ConfirmationLetter::create([
            'user_id' => $admin->id,
            'event_date' => Carbon::now()->addDays(20),
            'event_name' => 'Konser Musik Indie',
            'eo_name' => 'Komunitas Musik Malang',
            'category' => 'Event Komunitas',
            'description' => 'Pengajuan tempat outdoor.',
            'status' => 'rejected',
        ]);

        EventReport::create([
            'user_id' => $admin->id,
            'event_date' => Carbon::now()->subDays(10),
            'event_name' => 'Matos Food Festival',
            'drive_link' => 'https://drive.google.com/drive/folders/example',
            'report_file_path' => null,
            'description' => "Festival kuliner tahunan yang diikuti oleh 50 tenant makanan lokal.\nRundown:\n10:00 - Pembukaan\n12:00 - Lomba Makan\n19:00 - Penutupan",
            'status' => 'approved',
        ]);

        EventReport::create([
            'user_id' => $admin->id,
            'event_date' => Carbon::now()->subDays(2),
            'event_name' => 'Lomba Mewarnai Anak',
            'drive_link' => null,
            'report_file_path' => null,
            'description' => "Lomba mewarnai tingkat TK se-Malang Raya. Peserta mencapai 200 anak.",
            'status' => 'pending',
        ]);

        // 4. DATA INVENTARIS
        Inventory::create([
            'name' => 'HT Motorola CP1660',
            'category' => 'Elektronik',
            'quantity' => 12,
            'location' => 'Lemari Besi A - Kantor Marcom',
            'condition' => 'good',
        ]);

        Inventory::create([
            'name' => 'Tripod Banner Stand',
            'category' => 'Perlengkapan Event',
            'quantity' => 20,
            'location' => 'Gudang Bawah',
            'condition' => 'good',
        ]);

        Inventory::create([
            'name' => 'Karpet Merah 50m',
            'category' => 'Dekorasi',
            'quantity' => 2,
            'location' => 'Gudang Atas',
            'condition' => 'damaged',
        ]);

        // 5. DATA BUDGETING (Anggaran & Transaksi)
        
        // Budget Tahunan (2025)
        $budgets = [
            1 => 99720000, 2 => 59910000, 3 => 56690000, 4 => 69440000,
            5 => 56060000, 6 => 32940000, 7 => 130190000, 8 => 48440000,
            9 => 30140000, 10 => 98940000, 11 => 47290000, 12 => 153940000
        ];

        foreach ($budgets as $month => $amount) {
            Budget::create([
                'year' => 2025,
                'month' => $month,
                'amount' => $amount,
            ]);
        }

        // Transaksi Pemasukan
        Transaction::create([
            'type' => 'income',
            'transaction_date' => '2025-01-15',
            'loo_number' => 'LOO/001/JAN/2025',
            'customer_name' => 'PT Indofood',
            'description' => 'Sewa Booth Event Januari',
            'nominal' => 15000000,
            'status' => 'received',
        ]);

        // Transaksi Pengeluaran
        Transaction::create([
            'type' => 'expense',
            'transaction_date' => '2025-01-20',
            'sr_number' => 'SR/001/JAN',
            'vendor_name' => 'Percetakan Jaya',
            'description' => 'Cetak Banner Imlek',
            'nominal' => 2500000,
            'status' => 'paid',
        ]);
        
        Transaction::create([
            'type' => 'expense',
            'transaction_date' => '2025-02-05',
            'sr_number' => 'SR/005/FEB',
            'vendor_name' => 'Toko Bunga Malang',
            'description' => 'Dekorasi Valentine',
            'nominal' => 5000000,
            'status' => 'approved',
        ]);
    }
}