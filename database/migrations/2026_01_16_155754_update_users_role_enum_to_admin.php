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
        // Update existing 'staff' records to 'admin'
        DB::table('users')->where('role', 'staff')->update(['role' => 'admin']);
        
        // Change enum to use 'admin' instead of 'staff'
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('manager', 'co_manager', 'admin') DEFAULT 'admin'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert 'admin' records back to 'staff'
        DB::table('users')->where('role', 'admin')->update(['role' => 'staff']);
        
        // Change enum back to use 'staff'
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('manager', 'co_manager', 'staff') DEFAULT 'staff'");
    }
};
