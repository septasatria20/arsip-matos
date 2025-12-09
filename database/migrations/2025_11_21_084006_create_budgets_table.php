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
        Schema::create('budgets', function (Blueprint $table) {
            $table->id();
            $table->integer('year'); // 2024, 2025
            $table->integer('month'); // 1 - 12
            $table->decimal('amount', 15, 2); // Nominal Budget (ex: 99.000.000)
            $table->timestamps();
            
            // Mencegah duplikasi budget untuk bulan/tahun yang sama
            $table->unique(['year', 'month']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budgets');
    }
};
