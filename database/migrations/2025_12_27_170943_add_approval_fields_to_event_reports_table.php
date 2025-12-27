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
        Schema::table('event_reports', function (Blueprint $table) {
            $table->timestamp('approved_at')->nullable()->after('status');
            $table->timestamp('rejected_at')->nullable()->after('approved_at');
            $table->foreignId('approved_by')->nullable()->constrained('users')->after('rejected_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('event_reports', function (Blueprint $table) {
            $table->dropForeign(['approved_by']);
            $table->dropColumn(['approved_at', 'rejected_at', 'approved_by']);
        });
    }
};
