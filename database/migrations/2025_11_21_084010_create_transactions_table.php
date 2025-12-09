<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['income', 'expense']);
            $table->date('transaction_date');
            
            // Kolom khusus Income
            $table->string('loo_number')->nullable();
            $table->string('customer_name')->nullable();
            
            // Kolom khusus Expense
            $table->string('sr_number')->nullable(); // Service Request No
            $table->date('sr_date')->nullable();
            $table->string('po_number')->nullable(); // Purchase Order No
            $table->string('invoice_number')->nullable();
            $table->string('vendor_name')->nullable();
            $table->date('payment_date')->nullable();
            
            // Kolom Umum
            $table->text('description');
            $table->string('coa_code')->nullable(); // Chart of Account (ex: 501-02)
            $table->decimal('nominal', 15, 2);
            $table->string('proof_file_path')->nullable(); // Bukti Transfer / Invoice
            $table->enum('status', ['pending', 'approved', 'paid', 'received'])->default('pending');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
