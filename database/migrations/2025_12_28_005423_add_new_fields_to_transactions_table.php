<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            if (!Schema::hasColumn('transactions', 'contract_start_date')) {
                $table->date('contract_start_date')->nullable()->after('transaction_date');
            }
            if (!Schema::hasColumn('transactions', 'contract_end_date')) {
                $table->date('contract_end_date')->nullable()->after('contract_start_date');
            }
            if (!Schema::hasColumn('transactions', 'drive_link')) {
                $table->text('drive_link')->nullable()->after('proof_file_path');
            }
        });
        
        // Update enum status to include all old and new values
        DB::statement("ALTER TABLE `transactions` MODIFY `status` ENUM('pending', 'approved', 'paid', 'received', 'approve') DEFAULT 'pending'");
        
        // Update existing status values
        DB::table('transactions')->where('status', 'approved')->update(['status' => 'approve']);
        DB::table('transactions')->where('status', 'received')->update(['status' => 'paid']);
        
        // Update enum status to only include new values
        DB::statement("ALTER TABLE `transactions` MODIFY `status` ENUM('pending', 'paid', 'approve') DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert enum status first
        DB::statement("ALTER TABLE `transactions` MODIFY `status` ENUM('pending', 'approved', 'paid', 'received') DEFAULT 'pending'");
        
        // Revert status values
        DB::table('transactions')->where('status', 'approve')->update(['status' => 'approved']);
        
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['contract_start_date', 'contract_end_date', 'drive_link']);
        });
    }
};
